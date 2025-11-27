# backend/users/views.py

from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.shortcuts import get_object_or_404
from django.http import HttpResponse
from .models import WeatherData
from .serializers import WeatherSerializer

# Импортируем модели и сериализаторы
from .models import CustomUser, UserFile
from .serializers import (
    UserRegistrationSerializer,
    UserLoginSerializer,
    UserProfileSerializer,
    FileUploadSerializer
)
# Импортируем утилиты логирования
from .utils.logger import log_user_action, log_api_call, log_security_event


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register_view(request):
    """
    Эндпоинт для регистрации нового пользователя (только текстовые данные)
    """
    log_api_call(request, 'register_view')

    if request.method == 'POST':
        serializer = UserRegistrationSerializer(data=request.data)

        if serializer.is_valid():
            user = serializer.save()

            log_user_action(user, 'registration_success', {
                'username': user.username,
                'email': user.email
            })

            refresh = RefreshToken.for_user(user)

            return Response({
                'message': 'Пользователь успешно зарегистрирован',
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email
                },
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }
            }, status=status.HTTP_201_CREATED)

        log_security_event('registration_failed', request, {'errors': serializer.errors})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login_view(request):
    """
    Эндпоинт для входа пользователя
    """
    log_api_call(request, 'login_view')

    serializer = UserLoginSerializer(data=request.data)
    if serializer.is_valid():
        username = serializer.validated_data['username']
        password = serializer.validated_data['password']

        user = authenticate(username=username, password=password)

        if user is not None:
            refresh = RefreshToken.for_user(user)

            log_user_action(user, 'login_success', {'ip': request.META.get('REMOTE_ADDR')})

            return Response({
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                },
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email
                }
            })
        else:
            log_security_event('login_failed', request, {'username': username, 'reason': 'invalid_credentials'})
            return Response({'error': 'Неверные учетные данные'}, status=status.HTTP_401_UNAUTHORIZED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_profile_view(request):
    """
    Получение профиля текущего пользователя
    """
    serializer = UserProfileSerializer(request.user)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def file_upload_view(request):
    """
    Загрузка файла пользователем (с шифрованием)
    """
    serializer = FileUploadSerializer(data=request.data)
    if serializer.is_valid():
        file_obj = serializer.validated_data['file']
        description = serializer.validated_data.get('description', '')

        try:
            # Создаем объект модели
            user_file = UserFile(
                user=request.user,
                original_name=file_obj.name,
                file_size=file_obj.size,
                content_type=file_obj.content_type,
                description=description
            )
            # Передаем данные для шифрования во временный атрибут
            user_file._file_data = file_obj.read()
            # Сохраняем (шифрование произойдет в методе save модели)
            user_file.save()

            log_user_action(request.user, 'file_upload', {
                'file_id': user_file.id,
                'name': user_file.original_name
            })

            return Response({
                'message': 'Файл успешно загружен и зашифрован',
                'file_info': {
                    'id': user_file.id,
                    'name': user_file.original_name,
                    'size': user_file.file_size,
                    'type': user_file.content_type,
                    'description': user_file.description
                }
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            log_security_event('file_upload_error', request, {'error': str(e)})
            return Response({'error': 'Ошибка при сохранении файла'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_files_view(request):
    """
    Эндпоинт для получения списка файлов пользователя (метаданные)
    """
    files = UserFile.objects.filter(user=request.user)

    files_data = [{
        'id': f.id,
        'name': f.original_name,
        'size': f.file_size,
        'type': f.content_type,
        'description': f.description,
        'uploaded_at': f.uploaded_at
    } for f in files]

    return Response(files_data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def download_file_view(request, file_id):
    """
    Расшифровывает и отдает контент файла для просмотра/воспроизведения.
    Возвращает бинарные данные (blob).
    """
    # Получаем файл, убедившись, что он принадлежит текущему пользователю
    user_file = get_object_or_404(UserFile, id=file_id, user=request.user)

    try:
        # Дешифруем данные (возвращает bytes)
        decrypted_content = user_file.get_decrypted_data()

        # Формируем HTTP ответ с правильным Content-Type (например, image/jpeg)
        response = HttpResponse(decrypted_content, content_type=user_file.content_type)

        # Заголовок inline говорит браузеру попытаться открыть файл (показать картинку/плеер),
        # а не предлагать сразу скачать его на диск.
        response['Content-Disposition'] = f'inline; filename="{user_file.original_name}"'

        return response

    except Exception as e:
        log_security_event('file_download_error', request, {'file_id': file_id, 'error': str(e)})
        return Response({'error': 'Ошибка при получении файла'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def weather_view(request):
    """
    Возвращает текущую погоду и историю наблюдений
    """
    queryset = WeatherData.objects.all()[:20]
    history_data = WeatherSerializer(queryset, many=True).data
    current_weather = history_data[0] if history_data else None

    return Response({
        'current': current_weather,
        'history': history_data[::-1]
    })
# backend/users/views.py

from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.utils import timezone

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
@parser_classes([MultiPartParser, FormParser])  # Разрешаем прием файлов
def register_view(request):
    """
    Эндпоинт для регистрации нового пользователя с поддержкой загрузки файлов
    """
    # Логируем попытку регистрации
    log_api_call(request, 'register_view')

    if request.method == 'POST':
        serializer = UserRegistrationSerializer(data=request.data)

        if serializer.is_valid():
            # 1. Создаем пользователя (текстовые данные)
            user = serializer.save()

            # 2. Обрабатываем загруженные файлы (если есть)
            image_file = request.FILES.get('image')
            audio_file = request.FILES.get('audio')

            try:
                # Если прикреплен аватар
                if image_file:
                    UserFile.objects.create(
                        user=user,
                        original_name=image_file.name,
                        _file_data=image_file.read(),
                        file_size=image_file.size,
                        content_type=image_file.content_type,
                        description="Аватар пользователя"
                    )

                # Если прикреплено аудио
                if audio_file:
                    UserFile.objects.create(
                        user=user,
                        original_name=audio_file.name,
                        _file_data=audio_file.read(),
                        file_size=audio_file.size,
                        content_type=audio_file.content_type,
                        description="Аудио-файл регистрации"
                    )
            except Exception as e:
                # ИСПРАВЛЕНО: передаем request в log_security_event
                log_security_event('file_encryption_failed', request, {'error': str(e), 'user_id': user.id})

            # Логируем успешную регистрацию
            log_user_action(user, 'registration_success', {
                'username': user.username,
                'email': user.email
            })

            # Создаем JWT токены для автоматического входа
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

        # Если данные невалидны
        # ИСПРАВЛЕНО: передаем request
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
            # ИСПРАВЛЕНО: передаем request
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
            user_file = UserFile.objects.create(
                user=request.user,
                original_name=file_obj.name,
                _file_data=file_obj.read(),
                file_size=file_obj.size,
                content_type=file_obj.content_type,
                description=description
            )

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
            # ИСПРАВЛЕНО: передаем request
            log_security_event('file_upload_error', request, {'error': str(e)})
            return Response({'error': 'Ошибка при сохранении файла'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_files_view(request):
    """
    Эндпоинт для получения списка файлов пользователя
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
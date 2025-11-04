from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.utils import timezone

from .models import CustomUser
from .serializers import (
    UserRegistrationSerializer,
    UserLoginSerializer,
    UserProfileSerializer,
    FileUploadSerializer
)
from .utils.logger import log_user_action, log_api_call, log_security_event

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register_view(request):
    """
    Эндпоинт для регистрации нового пользователя
    """
    if request.method == 'POST':
        serializer = UserRegistrationSerializer(data=request.data)

        if serializer.is_valid():
            user = serializer.save()

            # Логируем успешную регистрацию
            log_user_action(user, 'registration_success', {
                'username': user.username,
                'email': user.email
            })

            # Создаем JWT токены
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
        else:
            # Логируем ошибку регистрации
            log_security_event('registration_failed', request, {
                'errors': serializer.errors,
                'username_attempt': request.data.get('username')
            })

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login_view(request):
    """
    Эндпоинт для авторизации пользователя
    """
    if request.method == 'POST':
        serializer = UserLoginSerializer(data=request.data)

        if serializer.is_valid():
            username = serializer.validated_data['username']
            password = serializer.validated_data['password']

            user = authenticate(username=username, password=password)

            if user:
                if user.is_active:
                    # Обновляем время последнего входа
                    user.last_login = timezone.now()
                    user.save()

                    # Логируем успешный вход
                    log_user_action(user, 'login_success')

                    # Создаем JWT токены
                    refresh = RefreshToken.for_user(user)

                    return Response({
                        'message': 'Успешный вход в систему',
                        'user': {
                            'id': user.id,
                            'username': user.username,
                            'email': user.email
                        },
                        'tokens': {
                            'refresh': str(refresh),
                            'access': str(refresh.access_token),
                        }
                    }, status=status.HTTP_200_OK)
                else:
                    # Логируем попытку входа в деактивированный аккаунт
                    log_security_event('login_inactive_account', request, {
                        'username': username
                    })
                    return Response({
                        'error': 'Аккаунт деактивирован'
                    }, status=status.HTTP_400_BAD_REQUEST)


        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def profile_view(request):
    """
    Эндпоинт для получения профиля текущего пользователя
    """
    serializer = UserProfileSerializer(request.user)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def upload_file_view(request):
    """
    Эндпоинт для загрузки файлов
    """
    if request.method == 'POST':
        serializer = FileUploadSerializer(data=request.data)

        if serializer.is_valid():
            file = serializer.validated_data['file']
            description = serializer.validated_data.get('description', '')

            # Сохраняем файл (пока без шифрования)
            # TODO: Добавить шифрование файла перед сохранением

            # Сохраняем информацию о файле в пользователе
            request.user.file_metadata = {
                'uploaded_files': request.user.file_metadata.get('uploaded_files', []) + [{
                    'file_name': file.name,
                    'file_size': file.size,
                    'content_type': file.content_type,
                    'description': description,
                    'uploaded_at': timezone.now().isoformat()
                }]
            }
            request.user.save()

            return Response({
                'message': 'Файл успешно загружен',
                'file_info': {
                    'name': file.name,
                    'size': file.size,
                    'type': file.content_type,
                    'description': description
                }
            }, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_files_view(request):
    """
    Эндпоинт для получения списка файлов пользователя
    """
    files = request.user.file_metadata.get('uploaded_files', [])
    return Response({'files': files})
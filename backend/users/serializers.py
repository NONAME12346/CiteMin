from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import CustomUser
from .validators import PasswordStrengthValidator


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = CustomUser
        fields = ('username', 'email', 'password', 'password2', 'first_name', 'last_name')
        extra_kwargs = {
            'first_name': {'required': False},
            'last_name': {'required': False},
            'email': {'required': True}
        }

    def validate_password(self, value):
        """Валидация пароля с использованием нашего валидатора"""
        validator = PasswordStrengthValidator()
        validator.validate(value)
        return value

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Пароли не совпадают."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        password = validated_data.pop('password')

        user = CustomUser.objects.create(**validated_data)
        user.set_password(password)
        user.save()

        return user

class UserLoginSerializer(serializers.Serializer):
    username = serializers.CharField(required=True)
    password = serializers.CharField(required=True, write_only=True)

    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')

        if username and password:
            return attrs
        raise serializers.ValidationError("Необходимо указать имя пользователя и пароль.")


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'date_joined', 'last_login')
        read_only_fields = ('id', 'date_joined', 'last_login')


class FileUploadSerializer(serializers.Serializer):
    file = serializers.FileField(required=True)
    description = serializers.CharField(required=False, max_length=255)

    def validate_file(self, value):
        # Проверка типа файла
        allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'audio/mpeg', 'audio/wav']
        if value.content_type not in allowed_types:
            raise serializers.ValidationError(
                "Неподдерживаемый тип файла. Разрешены: изображения (JPEG, PNG, GIF) и аудио (MP3, WAV).")

        # Проверка размера файла (максимум 10MB)
        max_size = 10 * 1024 * 1024
        if value.size > max_size:
            raise serializers.ValidationError("Файл слишком большой. Максимальный размер: 10MB.")

        return value
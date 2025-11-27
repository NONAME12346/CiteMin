from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import CustomUser
from .validators import PasswordStrengthValidator
import json
from .utils.encryption import encryptor
from .models import WeatherData


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
        # 1. Извлекаем пароль
        validated_data.pop('password2')
        password = validated_data.pop('password')

        # 2. Извлекаем поля для шифрования
        email = validated_data.pop('email')
        first_name = validated_data.pop('first_name', '')
        last_name = validated_data.pop('last_name', '')

        # 3. Создаем пользователя только с НЕШИФРУЕМЫМИ полями
        user = CustomUser.objects.create(**validated_data)

        # 4. Устанавливаем пароль (хешируется)
        user.set_password(password)

        # 5. Собираем, шифруем и сохраняем остальные данные
        data_to_encrypt = {
            'email': email,
            'first_name': first_name,
            'last_name': last_name
        }
        user.save_encrypted_data(data_to_encrypt)

        # 6. Сохраняем email как маркер (или можно хранить хеш для поиска)
        user.email = f"encrypted_{user.id}@placeholder.com"

        # Сохраняем пользователя
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
    email = serializers.SerializerMethodField()
    first_name = serializers.SerializerMethodField()
    last_name = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'date_joined', 'last_login')
        read_only_fields = ('id', 'date_joined', 'last_login', 'email', 'first_name', 'last_name')

    def get_decrypted_data(self, obj):
        # Кэшируем результат, чтобы не дешифровать 3 раза
        if not hasattr(self, '_decrypted_data'):
            self._decrypted_data = obj.get_decrypted_data()
        return self._decrypted_data

    def get_email(self, obj):
        return self.get_decrypted_data(obj).get('email')

    def get_first_name(self, obj):
        return self.get_decrypted_data(obj).get('first_name')

    def get_last_name(self, obj):
        return self.get_decrypted_data(obj).get('last_name')

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

class WeatherSerializer(serializers.ModelSerializer):
    class Meta:
        model = WeatherData
        fields = ['id', 'date', 'temperature', 'description', 'source_url']
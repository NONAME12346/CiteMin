from django.contrib.auth.models import AbstractUser
from django.db import models
from .utils.encryption import encryptor
import json



class CustomUser(AbstractUser):
    """
    Кастомная модель пользователя с поддержкой шифрования данных
    """
    # Поля для зашифрованных данных
    encrypted_data = models.BinaryField(
        blank=True,
        null=True,
        verbose_name="Зашифрованные данные"
    )
    encrypted_media = models.BinaryField(
        blank=True,
        null=True,
        verbose_name="Зашифрованные медиафайлы"
    )
    file_metadata = models.JSONField(
        default=dict,
        blank=True,
        verbose_name="Метаданные файлов"
    )

    # Важно: related_name для избежания конфликтов
    groups = models.ManyToManyField(
        'auth.Group',
        verbose_name='groups',
        blank=True,
        help_text='The groups this user belongs to.',
        related_name='customuser_set',
        related_query_name='customuser',
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        verbose_name='user permissions',
        blank=True,
        help_text='Specific permissions for this user.',
        related_name='customuser_set',
        related_query_name='customuser',
    )

    class Meta:
        verbose_name = 'Пользователь'
        verbose_name_plural = 'Пользователи'

    def __str__(self):
        return self.username

    def save_encrypted_data(self, data):
        """Метод для сохранения зашифрованных текстовых данных"""
        # --- РЕАЛИЗОВАТЬ ---
        try:
            # Сериализуем dict в JSON-строку, потом шифруем
            data_json = json.dumps(data)
            self.encrypted_data = encryptor.encrypt_data(data_json.encode('utf-8'))
        except Exception as e:
            # Обработай ошибку (например, логирование)
            print(f"Failed to encrypt data: {e}")

    def get_decrypted_data(self):
        """Метод для получения дешифрованных текстовых данных"""
        # --- РЕАЛИЗОВАТЬ ---
        if not self.encrypted_data:
            return {}
        try:
            decrypted_bytes = encryptor.decrypt_data(self.encrypted_data)
            data_json = decrypted_bytes.decode('utf-8')
            return json.loads(data_json)
        except Exception as e:
            # Обработка ошибки дешифровки
            print(f"Failed to decrypt data: {e}")
            return {}


class UserFile(models.Model):
    """Модель для хранения зашифрованных файлов пользователей"""
    user = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='user_files'
    )
    original_name = models.CharField(max_length=255, verbose_name="Оригинальное имя файла")
    encrypted_data = models.BinaryField(verbose_name="Зашифрованные данные файла")
    file_size = models.IntegerField(verbose_name="Размер файла")
    content_type = models.CharField(max_length=100, verbose_name="Тип содержимого")
    description = models.TextField(blank=True, verbose_name="Описание")
    uploaded_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата загрузки")

    class Meta:
        verbose_name = 'Файл пользователя'
        verbose_name_plural = 'Файлы пользователей'
        ordering = ['-uploaded_at']

    def __str__(self):
        return f"{self.original_name} ({self.user.username})"

    def save(self, *args, **kwargs):
        # Шифруем данные перед сохранением
        if not self.pk:  # Только для новых файлов
            if hasattr(self, '_file_data'):
                self.encrypted_data = encryptor.encrypt_data(self._file_data)
        super().save(*args, **kwargs)

    def get_decrypted_data(self):
        """Получение дешифрованных данных файла"""
        return encryptor.decrypt_data(self.encrypted_data)

class WeatherData(models.Model):
    """
    Модель для хранения истории погоды
    """
    date = models.DateTimeField(auto_now_add=True, verbose_name="Время парсинга")
    temperature = models.CharField(max_length=50, verbose_name="Температура")
    description = models.CharField(max_length=255, verbose_name="Описание (ясно/облачно)")
    source_url = models.URLField(verbose_name="Источник")

    class Meta:
        verbose_name = 'Данные погоды'
        verbose_name_plural = 'История погоды'
        ordering = ['-date']

    def __str__(self):
        return f"{self.date.strftime('%Y-%m-%d %H:%M')} - {self.temperature}"
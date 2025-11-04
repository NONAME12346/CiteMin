from django.contrib.auth.models import AbstractUser
from django.db import models


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
        """Метод для сохранения зашифрованных данных (заглушка)"""
        # Реализуем позже
        pass

    def get_decrypted_data(self):
        """Метод для получения дешифрованных данных (заглушка)"""
        # Реализуем позже
        return None
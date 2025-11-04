import os
import base64
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from django.conf import settings


class DataEncryptor:
    def __init__(self):
        # Генерируем ключ на основе секретного ключа Django
        password = settings.SECRET_KEY.encode()
        salt = b'salt_' + password[:16]  # Используем часть SECRET_KEY как salt
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=salt,
            iterations=100000,
        )
        key = base64.urlsafe_b64encode(kdf.derive(password))
        self.fernet = Fernet(key)

    def encrypt_data(self, data):
        """Шифрование текстовых данных"""
        if isinstance(data, str):
            data = data.encode('utf-8')
        encrypted_data = self.fernet.encrypt(data)
        return encrypted_data

    def decrypt_data(self, encrypted_data):
        """Дешифрование текстовых данных"""
        if encrypted_data is None:
            return None
        decrypted_data = self.fernet.decrypt(encrypted_data)
        return decrypted_data.decode('utf-8')

    def encrypt_file(self, file_path):
        """Шифрование файла"""
        with open(file_path, 'rb') as file:
            file_data = file.read()
        encrypted_data = self.fernet.encrypt(file_data)
        return encrypted_data

    def decrypt_file(self, encrypted_data, output_path):
        """Дешифрование файла"""
        decrypted_data = self.fernet.decrypt(encrypted_data)
        with open(output_path, 'wb') as file:
            file.write(decrypted_data)
        return output_path


# Создаем глобальный экземпляр шифратора
encryptor = DataEncryptor()
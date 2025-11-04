import re
from django.core.exceptions import ValidationError
from django.utils.translation import gettext as _


class PasswordValidator:
    def __init__(self):
        self.common_sequences = [
            'qwertyuiop', 'asdfghjkl', 'zxcvbnm',
            '1234567890', 'password', 'admin', '12345678',
            'qwerty123', '1q2w3e4r', 'qazwsxedc'
        ]

    def validate(self, password, user=None):
        errors = []

        # Проверка длины
        if len(password) < 8:
            errors.append(_("Пароль должен содержать минимум 8 символов."))

        # Проверка заглавных букв
        if not re.search(r'[A-ZА-Я]', password):
            errors.append(_("Пароль должен содержать хотя бы одну заглавную букву."))

        # Проверка строчных букв
        if not re.search(r'[a-zа-я]', password):
            errors.append(_("Пароль должен содержать хотя бы одну строчную букву."))

        # Проверка цифр
        if not re.search(r'\d', password):
            errors.append(_("Пароль должен содержать хотя бы одну цифру."))

        # Проверка спецсимволов
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
            errors.append(_("Пароль должен содержать хотя бы один специальный символ."))

        # Проверка на простые последовательности
        password_lower = password.lower()
        for sequence in self.common_sequences:
            if sequence in password_lower:
                errors.append(_("Пароль содержит простую последовательность символов."))
                break

        if errors:
            raise ValidationError(errors)

    def get_help_text(self):
        return _(
            "Ваш пароль должен содержать:\n"
            "- Минимум 8 символов\n"
            "- Заглавные и строчные буквы\n"
            "- Цифры\n"
            "- Специальные символы\n"
            "- Не должен содержать простых последовательностей"
        )


# Альтернативная версия для использования в формах
class PasswordStrengthValidator:
    def __call__(self, password):
        validator = PasswordValidator()
        return validator.validate(password)
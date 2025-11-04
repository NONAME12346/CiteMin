import re
from django.core.exceptions import ValidationError
from django.utils.translation import gettext as _


class PasswordStrengthValidator:
    """
    Валидатор силы пароля по требованиям:
    - Длина >= 8 символов
    - Заглавные и строчные буквы
    - Цифры
    - Спецсимволы
    - Отсутствие простых последовательностей
    """

    def __init__(self):
        self.common_sequences = [
            'qwertyuiop', 'asdfghjkl', 'zxcvbnm',
            '1234567890', 'password', 'admin', '12345678',
            'qwerty123', '1q2w3e4r', 'qazwsxedc', 'iloveyou'
        ]

    def validate(self, password, user=None):
        errors = []

        # Проверка длины (>= 8 символов)
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
                errors.append(
                    _("Пароль содержит простую последовательность символов: %(sequence)s") % {'sequence': sequence})
                break

        if errors:
            raise ValidationError(errors)

    def get_help_text(self):
        return _(
            "Ваш пароль должен содержать:\n"
            "- Минимум 8 символов\n"
            "- Заглавные и строчные буквы\n"
            "- Цифры\n"
            "- Специальные символы (!@#$%^&* и т.д.)\n"
            "- Не должен содержать простых последовательностей (qwerty, 123456 и т.п.)"
        )
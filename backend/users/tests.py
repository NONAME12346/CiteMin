from django.test import TestCase
from django.core.exceptions import ValidationError
from .validators import PasswordValidator


class PasswordValidatorTest(TestCase):
    def setUp(self):
        self.validator = PasswordValidator()

    def test_strong_password(self):
        """Тест сильного пароля"""
        strong_password = "StrongPass123!"
        try:
            self.validator.validate(strong_password)
        except ValidationError:
            self.fail("Сильный пароль не должен вызывать ошибку валидации")

    def test_short_password(self):
        """Тест короткого пароля"""
        with self.assertRaises(ValidationError):
            self.validator.validate("Short1!")

    def test_no_uppercase(self):
        """Тест пароля без заглавных букв"""
        with self.assertRaises(ValidationError):
            self.validator.validate("nopassword123!")

    def test_common_sequence(self):
        """Тест пароля с простой последовательностью"""
        with self.assertRaises(ValidationError):
            self.validator.validate("qwerty123!")
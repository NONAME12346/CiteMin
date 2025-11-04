/**
 * Валидатор пароля с проверками по требованиям:
 * - Длина >= 8 символов
 * - Заглавные и строчные буквы
 * - Цифры
 * - Спецсимволы
 * - Отсутствие простых последовательностей
 */

export const passwordRequirements = {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    forbidCommonSequences: true
};

export const commonSequences = [
    'qwertyuiop', 'asdfghjkl', 'zxcvbnm',
    '1234567890', 'password', 'admin', '12345678',
    'qwerty123', '1q2w3e4r', 'qazwsxedc', 'iloveyou',
    'abcdefgh', '987654321', '11111111', '00000000'
];

export const validatePassword = (password) => {
    const errors = [];
    const warnings = [];
    const checks = {
        length: false,
        uppercase: false,
        lowercase: false,
        numbers: false,
        specialChars: false,
        noCommonSequences: false
    };

    // Проверка длины
    if (password.length >= passwordRequirements.minLength) {
        checks.length = true;
    } else {
        errors.push(`Пароль должен содержать минимум ${passwordRequirements.minLength} символов`);
    }

    // Проверка заглавных букв
    if (/[A-ZА-Я]/.test(password)) {
        checks.uppercase = true;
    } else {
        errors.push('Пароль должен содержать хотя бы одну заглавную букву');
    }

    // Проверка строчных букв
    if (/[a-zа-я]/.test(password)) {
        checks.lowercase = true;
    } else {
        errors.push('Пароль должен содержать хотя бы одну строчную букву');
    }

    // Проверка цифр
    if (/\d/.test(password)) {
        checks.numbers = true;
    } else {
        errors.push('Пароль должен содержать хотя бы одну цифру');
    }

    // Проверка спецсимволов
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        checks.specialChars = true;
    } else {
        errors.push('Пароль должен содержать хотя бы один специальный символ (!@#$%^&* и т.д.)');
    }

    // Проверка на простые последовательности
    const passwordLower = password.toLowerCase();
    const hasCommonSequence = commonSequences.some(sequence =>
        passwordLower.includes(sequence)
    );

    if (!hasCommonSequence) {
        checks.noCommonSequences = true;
    } else {
        errors.push('Пароль содержит простую последовательность символов');
    }

    // Расчет силы пароля
    const strength = calculatePasswordStrength(checks, password.length);

    return {
        isValid: errors.length === 0,
        errors,
        warnings,
        checks,
        strength
    };
};

export const calculatePasswordStrength = (checks, length) => {
    let score = 0;
    const maxScore = 6;

    // Базовые проверки
    if (checks.length) score++;
    if (checks.uppercase) score++;
    if (checks.lowercase) score++;
    if (checks.numbers) score++;
    if (checks.specialChars) score++;
    if (checks.noCommonSequences) score++;

    // Бонус за длину
    if (length >= 12) score += 1;
    if (length >= 16) score += 1;

    // Нормализуем score от 0 до 1
    const normalizedScore = Math.min(score / maxScore, 1);

    // Определяем уровень сложности
    if (normalizedScore < 0.3) return 'very-weak';
    if (normalizedScore < 0.5) return 'weak';
    if (normalizedScore < 0.7) return 'medium';
    if (normalizedScore < 0.9) return 'strong';
    return 'very-strong';
};

export const getPasswordStrengthText = (strength) => {
    const strengthMap = {
        'very-weak': { text: 'Очень слабый', color: '#dc2626' },
        'weak': { text: 'Слабый', color: '#ea580c' },
        'medium': { text: 'Средний', color: '#d97706' },
        'strong': { text: 'Сильный', color: '#16a34a' },
        'very-strong': { text: 'Очень сильный', color: '#15803d' }
    };
    return strengthMap[strength] || { text: 'Неизвестно', color: '#6b7280' };
};

export const getPasswordRequirementsText = () => {
    return `
Пароль должен содержать:
• Минимум ${passwordRequirements.minLength} символов
• Заглавные и строчные буквы
• Цифры
• Специальные символы (!@#$%^&* и т.д.)
• Не должен содержать простых последовательностей (qwerty, 123456 и т.п.)
    `.trim();
};
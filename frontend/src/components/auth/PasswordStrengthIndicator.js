import React from 'react';
import { getPasswordStrengthText } from '../../utils/passwordValidator';
import './PasswordStrengthIndicator.css';

const PasswordStrengthIndicator = ({ strength, checks }) => {
    const strengthInfo = getPasswordStrengthText(strength);

    return (
        <div className="password-strength-indicator">
            <div className="strength-header">
                <span>Сила пароля: </span>
                <strong style={{ color: strengthInfo.color }}>
                    {strengthInfo.text}
                </strong>
            </div>

            <div className="strength-bar">
                <div
                    className={`strength-fill strength-${strength}`}
                    style={{ backgroundColor: strengthInfo.color }}
                ></div>
            </div>

            <div className="requirements-list">
                <div className={`requirement ${checks.length ? 'valid' : 'invalid'}`}>
                    {checks.length ? '✓' : '✗'} Минимум 8 символов
                </div>
                <div className={`requirement ${checks.uppercase ? 'valid' : 'invalid'}`}>
                    {checks.uppercase ? '✓' : '✗'} Заглавные буквы
                </div>
                <div className={`requirement ${checks.lowercase ? 'valid' : 'invalid'}`}>
                    {checks.lowercase ? '✓' : '✗'} Строчные буквы
                </div>
                <div className={`requirement ${checks.numbers ? 'valid' : 'invalid'}`}>
                    {checks.numbers ? '✓' : '✗'} Цифры
                </div>
                <div className={`requirement ${checks.specialChars ? 'valid' : 'invalid'}`}>
                    {checks.specialChars ? '✓' : '✗'} Спецсимволы
                </div>
                <div className={`requirement ${checks.noCommonSequences ? 'valid' : 'invalid'}`}>
                    {checks.noCommonSequences ? '✓' : '✗'} Нет простых последовательностей
                </div>
            </div>
        </div>
    );
};

export default PasswordStrengthIndicator;
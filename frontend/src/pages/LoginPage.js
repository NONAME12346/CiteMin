import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AuthPages.css';

const LoginPage = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [touched, setTouched] = useState({
        username: false,
        password: false
    });
    const [showPassword, setShowPassword] = useState(false);

    const { login, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Получаем путь для редиректа после авторизации
    const from = location.state?.from?.pathname || '/';

    // Если пользователь уже авторизован, перенаправляем
    useEffect(() => {
        if (isAuthenticated) {
            navigate(from, { replace: true });
        }
    }, [isAuthenticated, navigate, from]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });

        // Очищаем ошибки при изменении поля
        if (error) {
            setError('');
        }
    };

    const handleBlur = (e) => {
        const { name } = e.target;
        setTouched(prev => ({
            ...prev,
            [name]: true
        }));
    };

    const validateForm = () => {
        const errors = [];

        if (!formData.username.trim()) {
            errors.push('Имя пользователя обязательно');
        }

        if (!formData.password) {
            errors.push('Пароль обязателен');
        }

        return errors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Отмечаем все поля как touched для показа ошибок
        setTouched({
            username: true,
            password: true
        });

        // Валидация формы
        const validationErrors = validateForm();
        if (validationErrors.length > 0) {
            setError(validationErrors.join(', '));
            setLoading(false);
            return;
        }

        // Попытка авторизации
        const result = await login(formData.username, formData.password);

        if (result.success) {
            // Успешная авторизация - перенаправляем
            navigate(from, { replace: true });
        } else {
            // Обработка различных типов ошибок
            handleLoginError(result.error);
        }

        setLoading(false);
    };

    const handleLoginError = (error) => {
        if (typeof error === 'string') {
            setError(error);
        } else if (typeof error === 'object') {
            // Обработка ошибок валидации Django
            if (error.username) {
                setError(Array.isArray(error.username) ? error.username.join(', ') : error.username);
            } else if (error.password) {
                setError(Array.isArray(error.password) ? error.password.join(', ') : error.password);
            } else if (error.non_field_errors) {
                setError(Array.isArray(error.non_field_errors) ? error.non_field_errors.join(', ') : error.non_field_errors);
            } else {
                setError('Произошла ошибка при авторизации');
            }
        } else {
            setError('Неизвестная ошибка');
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const isFieldInvalid = (fieldName) => {
        return touched[fieldName] && !formData[fieldName];
    };

    const isFormValid = formData.username.trim() && formData.password;

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-header">
                    <h2>Вход в систему</h2>
                    <p>Введите ваши учетные данные для доступа к аккаунту</p>
                </div>

                {error && (
                    <div className="alert alert-error">
                        <div className="error-icon">⚠</div>
                        <div className="error-content">
                            <strong>Ошибка авторизации:</strong>
                            <span>{error}</span>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="username">Имя пользователя *</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            required
                            disabled={loading}
                            className={isFieldInvalid('username') ? 'invalid' : ''}
                            placeholder="Введите ваше имя пользователя"
                            autoComplete="username"
                        />
                        {isFieldInvalid('username') && (
                            <div className="field-error">Имя пользователя обязательно</div>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Пароль *</label>
                        <div className="password-input-container">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                required
                                disabled={loading}
                                className={isFieldInvalid('password') ? 'invalid' : ''}
                                placeholder="Введите ваш пароль"
                                autoComplete="current-password"
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={togglePasswordVisibility}
                                disabled={loading}
                            >
                                {showPassword ? '🙈' : '👁️'}
                            </button>
                        </div>
                        {isFieldInvalid('password') && (
                            <div className="field-error">Пароль обязателен</div>
                        )}
                    </div>

                    <div className="form-options">
                        <label className="checkbox-label">
                            <input type="checkbox" />
                            <span className="checkmark"></span>
                            Запомнить меня
                        </label>
                        <Link to="/forgot-password" className="forgot-password">
                            Забыли пароль?
                        </Link>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-block login-btn"
                        disabled={loading || !isFormValid}
                    >
                        {loading ? (
                            <>
                                <span className="loading-spinner"></span>
                                Вход...
                            </>
                        ) : (
                            'Войти в систему'
                        )}
                    </button>
                </form>

                <div className="auth-links">
                    <div className="divider">
                        <span>или</span>
                    </div>
                    <p>
                        Нет аккаунта? <Link to="/register" className="link-highlight">Зарегистрируйтесь</Link>
                    </p>
                    <p>
                        <Link to="/" className="link-secondary">Вернуться на главную</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
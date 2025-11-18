import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PasswordStrengthIndicator from '../components/auth/PasswordStrengthIndicator';
import { validatePassword } from '../utils/passwordValidator';
import './AuthPages.css';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        password2: '',
        first_name: '',
        last_name: ''
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [passwordValidation, setPasswordValidation] = useState({
        isValid: false,
        errors: [],
        checks: {},
        strength: 'very-weak'
    });
    const [touched, setTouched] = useState({
        username: false,
        email: false,
        password: false,
        password2: false
    });

    const [imageFile, setImageFile] = useState(null);
    const [audioFile, setAudioFile] = useState(null);

    const { register } = useAuth();
    const navigate = useNavigate();

    // Валидация пароля при изменении
    useEffect(() => {
        if (formData.password) {
            const validation = validatePassword(formData.password);
            setPasswordValidation(validation);
        } else {
            setPasswordValidation({
                isValid: false,
                errors: [],
                checks: {
                    length: false,
                    uppercase: false,
                    lowercase: false,
                    numbers: false,
                    specialChars: false,
                    noCommonSequences: false
                },
                strength: 'very-weak'
            });
        }
    }, [formData.password]);

    // Валидация подтверждения пароля
    useEffect(() => {
        if (touched.password2 && formData.password2 && formData.password !== formData.password2) {
            setErrors(prev => ({
                ...prev,
                password2: 'Пароли не совпадают'
            }));
        } else if (errors.password2) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.password2;
                return newErrors;
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formData.password, formData.password2, touched.password2]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });

        // Очищаем ошибки при изменении поля
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: ''
            });
        }
    };

    const handleBlur = (e) => {
        const { name } = e.target;
        setTouched(prev => ({
            ...prev,
            [name]: true
        }));

        // Валидация на blur
        validateField(name, formData[name]);
    };


    const handleFileChange = (e) => {
        const { name, files } = e.target;
        if (name === 'image') {
            setImageFile(files[0] || null);
        } else if (name === 'audio') {
            setAudioFile(files[0] || null);
        }
    };


    const validateField = (name, value) => {
        const fieldErrors = [];

        switch (name) {
            case 'username':
                if (!value.trim()) {
                    fieldErrors.push('Имя пользователя обязательно');
                } else if (value.length < 3) {
                    fieldErrors.push('Имя пользователя должно содержать минимум 3 символа');
                } else if (!/^[a-zA-Z0-9_]+$/.test(value)) {
                    fieldErrors.push('Имя пользователя может содержать только буквы, цифры и подчеркивания');
                }
                break;

            case 'email':
                if (!value.trim()) {
                    fieldErrors.push('Email обязателен');
                } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    fieldErrors.push('Введите корректный email адрес');
                }
                break;

            case 'password':
                if (!value) {
                    fieldErrors.push('Пароль обязателен');
                }
                break;

            case 'password2':
                if (!value) {
                    fieldErrors.push('Подтверждение пароля обязательно');
                } else if (value !== formData.password) {
                    fieldErrors.push('Пароли не совпадают');
                }
                break;

            default:
                // Для полей без специальной валидации
                break;
        }

        if (fieldErrors.length > 0) {
            setErrors(prev => ({
                ...prev,
                [name]: fieldErrors
            }));
        } else if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };



    const validateForm = () => {
        const newErrors = {};

        // Валидация обязательных полей
        if (!formData.username.trim()) {
            newErrors.username = ['Имя пользователя обязательно'];
        }

        if (!formData.email.trim()) {
            newErrors.email = ['Email обязателен'];
        }

        if (!formData.password) {
            newErrors.password = ['Пароль обязателен'];
        } else if (!passwordValidation.isValid) {
            newErrors.password = passwordValidation.errors;
        }

        if (!formData.password2) {
            newErrors.password2 = ['Подтверждение пароля обязательно'];
        } else if (formData.password !== formData.password2) {
            newErrors.password2 = ['Пароли не совпадают'];
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Запускаем валидацию перед отправкой
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setErrors({});

        // Создаем объект FormData для отправки файлов и текста
        const registrationData = new FormData();

        // Добавляем текстовые поля
        registrationData.append('username', formData.username);
        registrationData.append('email', formData.email);
        registrationData.append('password', formData.password);
        registrationData.append('password2', formData.password2);

        // Добавляем необязательные поля, если они заполнены
        if (formData.first_name) registrationData.append('first_name', formData.first_name);
        if (formData.last_name) registrationData.append('last_name', formData.last_name);

        // Добавляем файлы, только если они были выбраны пользователем
        if (imageFile) {
            registrationData.append('image', imageFile);
        }

        if (audioFile) {
            registrationData.append('audio', audioFile);
        }

        try {
            // Отправляем FormData в функцию регистрации
            // (authService.register должен быть обновлен, как мы обсуждали)
            await register(registrationData);

            // При успешной регистрации переходим на страницу входа
            navigate('/login');
        } catch (error) {
            console.error('Registration failed:', error);

            // Обработка ошибок от сервера
            if (error.response && error.response.data) {
                setErrors(error.response.data);
            } else {
                setErrors({
                    non_field_errors: ['Произошла ошибка при соединении с сервером. Попробуйте позже.']
                });
            }
        } finally {
            setLoading(false);
        }
    };

    const getFieldError = (fieldName) => {
        if (fieldName === 'password' && formData.password && !passwordValidation.isValid) {
            // Показываем ошибки валидации пароля
            return passwordValidation.errors.join(', ');
        }

        if (errors[fieldName]) {
            return Array.isArray(errors[fieldName])
                ? errors[fieldName].join(', ')
                : errors[fieldName];
        }
        return null;
    };


    const isFieldValid = (fieldName) => {
        if (fieldName === 'password') {
            // Для поля пароля: зеленый только если пароль валидный И поле было затронуто
            return passwordValidation.isValid && touched.password;
        }
        return !errors[fieldName] && touched[fieldName];
    };



    const isFieldInvalid = (fieldName) => {
        if (fieldName === 'password') {
            // Для поля пароля: красный если пароль невалидный И поле не пустое
            return !passwordValidation.isValid && formData.password.length > 0;
        }
        if (fieldName === 'password2') {
            // Для подтверждения пароля: красный если пароли не совпадают И поле не пустое
            return formData.password2.length > 0 && formData.password !== formData.password2;
        }
        return !!errors[fieldName] && touched[fieldName];
    };

    const getFieldClassName = (fieldName) => {
        if (fieldName === 'password') {
            if (formData.password.length === 0) {
                return ''; // Пустое поле - обычный стиль
            } else if (passwordValidation.isValid) {
                return 'valid'; // Валидный пароль - зеленый
            } else {
                return 'invalid'; // Невалидный пароль - красный
            }
        }

        if (fieldName === 'password2') {
            if (formData.password2.length === 0) {
                return ''; // Пустое поле - обычный стиль
            } else if (formData.password2 === formData.password && formData.password.length > 0) {
                return 'valid'; // Пароли совпадают - зеленый
            } else {
                return 'invalid'; // Пароли не совпадают - красный
            }
        }


        // Для остальных полей
        if (!touched[fieldName]) {
            return ''; // Поле не затронуто - обычный стиль
        } else if (errors[fieldName]) {
            return 'invalid'; // Есть ошибки - красный
        } else {
            return 'valid'; // Нет ошибок - зеленый
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <h2>Регистрация</h2>

                {errors.general && (
                    <div className="alert alert-error">
                        {errors.general}
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
                            className={
                                isFieldInvalid('username') ? 'invalid' :
                                isFieldValid('username') ? 'valid' : ''
                            }
                        />
                        {getFieldError('username') && (
                            <div className="field-error">{getFieldError('username')}</div>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email *</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            required
                            disabled={loading}
                            className={
                                isFieldInvalid('email') ? 'invalid' :
                                isFieldValid('email') ? 'valid' : ''
                            }
                        />
                        {getFieldError('email') && (
                            <div className="field-error">{getFieldError('email')}</div>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="first_name">Имя</label>
                        <input
                            type="text"
                            id="first_name"
                            name="first_name"
                            value={formData.first_name}
                            onChange={handleChange}
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="last_name">Фамилия</label>
                        <input
                            type="text"
                            id="last_name"
                            name="last_name"
                            value={formData.last_name}
                            onChange={handleChange}
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="image">Аватар (изображение)</label>
                        <input
                            type="file"
                            id="image"
                            name="image"
                            accept="image/*"
                            onChange={handleFileChange}
                            disabled={loading}
                            className="form-control"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="audio">Аудио-файл</label>
                        <input
                            type="file"
                            id="audio"
                            name="audio"
                            accept="audio/*"
                            onChange={handleFileChange}
                            disabled={loading}
                            className="form-control"
                        />
                    </div>


                    <div className="form-group">
                        <label htmlFor="password">Пароль *</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            required
                            disabled={loading}
                            className={getFieldClassName('password')}
                        />
                        {formData.password && (
                            <PasswordStrengthIndicator
                                strength={passwordValidation.strength}
                                checks={passwordValidation.checks}
                            />
                        )}
                        {getFieldError('password') && (
                            <div className="field-error">{getFieldError('password')}</div>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="password2">Подтверждение пароля *</label>
                        <input
                            type="password"
                            id="password2"
                            name="password2"
                            value={formData.password2}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            required
                            disabled={loading}
                            className={getFieldClassName('password2')}
                        />
                        {getFieldError('password2') && (
                            <div className="field-error">{getFieldError('password2')}</div>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-block"
                        disabled={loading || !passwordValidation.isValid}
                    >
                        {loading ? 'Регистрация...' : 'Зарегистрироваться'}
                    </button>
                </form>

                <div className="auth-links">
                    <p>
                        Уже есть аккаунт? <Link to="/login">Войдите</Link>
                    </p>
                    <p>
                        <Link to="/">Вернуться на главную</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
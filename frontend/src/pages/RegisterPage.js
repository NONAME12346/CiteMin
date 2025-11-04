import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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

    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        // Очищаем ошибки при изменении поля
        if (errors[e.target.name]) {
            setErrors({
                ...errors,
                [e.target.name]: ''
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        const result = await register(formData);

        if (result.success) {
            navigate('/');
        } else {
            if (result.error && typeof result.error === 'object') {
                setErrors(result.error);
            } else {
                setErrors({ general: result.error });
            }
        }

        setLoading(false);
    };

    const getFieldError = (fieldName) => {
        if (errors[fieldName]) {
            return Array.isArray(errors[fieldName])
                ? errors[fieldName].join(', ')
                : errors[fieldName];
        }
        return null;
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
                            required
                            disabled={loading}
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
                            required
                            disabled={loading}
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
                        <label htmlFor="password">Пароль *</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            disabled={loading}
                        />
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
                            required
                            disabled={loading}
                        />
                        {getFieldError('password2') && (
                            <div className="field-error">{getFieldError('password2')}</div>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-block"
                        disabled={loading}
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
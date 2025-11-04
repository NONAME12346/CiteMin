import React from 'react';
import { Link } from 'react-router-dom';

const ForgotPasswordPage = () => {
    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-header">
                    <h2>Восстановление пароля</h2>
                    <p>Функция находится в разработке</p>
                </div>

                <div className="alert alert-info">
                    В текущей версии приложения восстановление пароля не реализовано.
                    Обратитесь к администратору или создайте новый аккаунт.
                </div>

                <div className="auth-links">
                    <Link to="/login" className="btn btn-primary btn-block">
                        Вернуться к входу
                    </Link>
                    <p>
                        Нет аккаунта? <Link to="/register">Зарегистрируйтесь</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
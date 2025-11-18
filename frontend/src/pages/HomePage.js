import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './HomePage.css';

const HomePage = () => {
    const { user, isAuthenticated, logout } = useAuth();

    return (
        <div className="home-page">
            <header className="home-header">
                <h1>Добро пожаловать в наше приложение</h1>
                <p>Безопасная аутентификация и работа с файлами</p>
            </header>

            <main className="home-main">
                {isAuthenticated ? (
                    <div className="authenticated-section">
                        <div className="user-welcome">
                            <h2>Привет, {user.username}!</h2>
                            <p>Email: {user.email}</p>
                        </div>
                        <div className="action-buttons">
                            {/* --- НОВАЯ ССЫЛКА ДЛЯ LABA 4 --- */}
                            <Link to="/dashboard" className="btn btn-info" style={{ marginRight: '15px' }}>
                                Погодный Дашборд 🌤️
                            </Link>
                            {/* ------------------------------- */}
                            <button onClick={logout} className="btn btn-danger">
                                Выйти
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="anonymous-section">
                        <h2>Начните работу с приложением</h2>
                        <div className="auth-buttons">
                            <Link to="/login" className="btn btn-primary">
                                Войти
                            </Link>
                            <Link to="/register" className="btn btn-secondary">
                                Зарегистрироваться
                            </Link>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default HomePage;
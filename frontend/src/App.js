import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import WeatherDashboard from './pages/WeatherDashboard'; // <-- НОВЫЙ ИМПОРТ
import './App.css';

// Компонент для защищенных маршрутов
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner-large"></div>
                <p>Проверка авторизации...</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        // Сохраняем текущее местоположение для редиректа после авторизации
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};

// Компонент для публичных маршрутов (только для неавторизованных)
const PublicRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner-large"></div>
                <p>Проверка авторизации...</p>
            </div>
        );
    }

    if (isAuthenticated) {
        // Если пользователь уже авторизован, перенаправляем на главную или откуда пришел
        const from = location.state?.from?.pathname || '/';
        return <Navigate to={from} replace />;
    }

    return children;
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="App">
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route
                            path="/login"
                            element={
                                <PublicRoute>
                                    <LoginPage />
                                </PublicRoute>
                            }
                        />
                        <Route
                            path="/register"
                            element={
                                <PublicRoute>
                                    <RegisterPage />
                                </PublicRoute>
                            }
                        />
                        <Route
                            path="/forgot-password"
                            element={
                                <PublicRoute>
                                    <ForgotPasswordPage />
                                </PublicRoute>
                            }
                        />
                        {/* --- НОВЫЙ ЗАЩИЩЕННЫЙ МАРШРУТ (LABA 4) --- */}
                        <Route
                            path="/dashboard"
                            element={
                                <ProtectedRoute>
                                    <WeatherDashboard />
                                </ProtectedRoute>
                            }
                        />
                        {/* ------------------------------------------- */}
                        <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;
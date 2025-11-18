import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(localStorage.getItem('access_token'));
    const [registrationSuccess, setRegistrationSuccess] = useState(false);

    // Проверка аутентификации при загрузке приложения
    useEffect(() => {
        const checkAuth = async () => {
            if (token) {
                try {
                    const userData = await authService.getProfile();
                    setUser(userData);
                } catch (error) {
                    console.error('Auth check failed:', error);
                    logout();
                }
            }
            setLoading(false);
        };

        checkAuth();
    }, [token]);

    const login = async (username, password) => {
        try {
            const response = await authService.login(username, password);
            const { user: userData, tokens } = response;

            setUser(userData);
            setToken(tokens.access);

            // Сохраняем токен в localStorage
            localStorage.setItem('access_token', tokens.access);
            localStorage.setItem('refresh_token', tokens.refresh);

            return { success: true, user: userData };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Ошибка авторизации'
            };
        }
    };

    const register = async (userData) => {
        try {
            setRegistrationSuccess(false);
            const response = await authService.register(userData);
            const { user: newUser, tokens } = response;

            setUser(newUser);
            setToken(tokens.access);
            setRegistrationSuccess(true);

            // Сохраняем токен в localStorage
            localStorage.setItem('access_token', tokens.access);
            localStorage.setItem('refresh_token', tokens.refresh);

            return { success: true, user: newUser };
        } catch (error) {
            setRegistrationSuccess(false);
            return {
                success: false,
                error: error.response?.data || 'Ошибка регистрации'
            };
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        setRegistrationSuccess(false);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
    };

    // --- НОВАЯ ФУНКЦИЯ ДЛЯ LABA 4 ---
    const fetchWeather = async () => {
        try {
            const data = await authService.getWeather();
            return data;
        } catch (error) {
            console.error('Ошибка получения данных погоды:', error);
            throw error;
        }
    };
    // -------------------------------

    const value = {
        user,
        token,
        login,
        register,
        logout,
        loading,
        registrationSuccess,
        isAuthenticated: !!user,
        fetchWeather, // <-- ДОБАВИТЬ В КОНТЕКСТ
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './WeatherDashboard.css';

// Вспомогательная функция для форматирования даты
const formatTime = (isoDate) => {
    if (!isoDate) return '';
    const date = new Date(isoDate);
    // Формат: ЧЧ:ММ (20:30)
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
};

const WeatherDashboard = () => {
    const { fetchWeather } = useAuth();
    const [currentWeather, setCurrentWeather] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadWeather = async () => {
            try {
                const data = await fetchWeather();
                setCurrentWeather(data.current);

                // Логика historyData удалена

                setLoading(false);
            } catch (err) {
                setError('Не удалось загрузить данные о погоде. (Требуется авторизация или ошибка API)');
                setLoading(false);
            }
        };

        loadWeather();

        // Фоновое обновление: запрос данных каждые 5 минут
        const intervalId = setInterval(loadWeather, 5 * 60 * 1000);

        return () => clearInterval(intervalId);
    }, [fetchWeather]);

    if (loading) {
        return <div className="weather-container loading-text">Загрузка данных...</div>;
    }

    if (error) {
        return <div className="weather-container loading-text" style={{color: 'red'}}>{error}</div>;
    }

    if (!currentWeather) {
        return <div className="weather-container loading-text">Данные о погоде пока не собраны в базе данных. Попробуйте через некоторое время, когда сработает планировщик.</div>;
    }

    return (
        <div className="weather-container">
            <h1 className="weather-header">Погода сейчас (Таганрог) 🌤️</h1>

            {/* Карточка текущей погоды: по центру, большими буквами */}
            <div className="current-weather-card">
                <div className="temperature">{currentWeather.temperature}</div>
                <div className="description">{currentWeather.description}</div>
                <small>Обновлено: {formatTime(currentWeather.date)} | Источник: Gismeteo</small>
            </div>

        </div>
    );
};

export default WeatherDashboard;
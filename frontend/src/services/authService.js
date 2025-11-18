import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api/auth';

// Создаем экземпляр axios с базовыми настройками
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Интерцептор для добавления токена к запросам
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Интерцептор для обработки ошибок
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refresh_token');
                if (refreshToken) {
                    // Попытка обновить токен
                    const response = await axios.post(`${API_BASE_URL}/token/refresh/`, {
                        refresh: refreshToken
                    });

                    const newAccessToken = response.data.access;
                    localStorage.setItem('access_token', newAccessToken);

                    // Повторяем оригинальный запрос с новым токеном
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                    return apiClient(originalRequest);
                }
            } catch (refreshError) {
                // Если refresh не удался, разлогиниваем пользователя
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                window.location.href = '/login';
            }
        }

        return Promise.reject(error);
    }
);

const authService = {
    // Регистрация
    async register(formData) {
        const response = await apiClient.post('/register/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    // Авторизация
    async login(username, password) {
        const response = await apiClient.post('/login/', { username, password });
        return response.data;
    },

    // Получение профиля
    async getProfile() {
        const response = await apiClient.get('/profile/');
        return response.data;
    },

    // Загрузка файла
    async uploadFile(file, description = '') {
        const formData = new FormData();
        formData.append('file', file);
        if (description) {
            formData.append('description', description);
        }

        const response = await apiClient.post('/upload/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    // Получение списка файлов
    async getUserFiles() {
        const response = await apiClient.get('/files/');
        return response.data;
    },

    // --- НОВАЯ ФУНКЦИЯ ДЛЯ LABA 4 ---
    async getWeather() {
        // Вызываем API-эндпоинт, который мы создали
        const response = await apiClient.get('/weather/');
        return response.data;
    },
    // -------------------------------
};

export default authService;
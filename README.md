# CiteMin Project

Веб-приложение на Django (Backend) и React (Frontend) с поддержкой регистрации, авторизации и шифрования данных пользователей.

## Требования

* Python 3.8+
* Node.js и npm

---

## 1. Запуск Backend (Django)

1.  Перейдите в папку бэкенда:
    ```bash
    cd backend
    ```

2.  Создайте и активируйте виртуальное окружение (рекомендуется):
    * **Windows:**
        ```bash
        python -m venv venv
        venv\Scripts\activate
        ```
    * **macOS/Linux:**
        ```bash
        python3 -m venv venv
        source venv/bin/activate
        ```

3.  Установите зависимости:
    ```bash
    pip install django djangorestframework django-cors-headers pillow cryptography
    ```

4.  Примените миграции (создание базы данных):
    ```bash
    python manage.py makemigrations
    python manage.py migrate
    ```

5.  Запустите сервер:
    ```bash
    python manage.py runserver
    ```

Сервер запустится по адресу: `http://127.0.0.1:8000/`

---

## 2. Запуск Frontend (React)

1.  Откройте новый терминал и перейдите в папку фронтенда:
    ```bash
    cd frontend
    ```

2.  Установите зависимости:
    ```bash
    npm install
    ```

3.  Запустите клиентское приложение:
    ```bash
    npm start
    ```

Приложение откроется в браузере автоматически по адресу: `http://localhost:3000/`

---

## Функционал

* **Регистрация:** Создание аккаунта с загрузкой аватара и аудио (данные шифруются).
* **Авторизация:** Вход по логину и паролю (JWT токены).
* **Безопасность:** * Пароли хешируются.
    * Личные данные и файлы шифруются алгоритмом Fernet.
    * Валидация паролей на сложные последовательности.
* **Логирование:** Все действия пользователей записываются в журнал событий.
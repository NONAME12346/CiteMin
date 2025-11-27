import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import './AuthPages.css'; // Используем существующие стили или создайте свои

const FileUploadPage = () => {
    const [file, setFile] = useState(null);
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            setError('Пожалуйста, выберите файл');
            return;
        }

        setLoading(true);
        setError('');
        setMessage('');

        try {
            await authService.uploadFile(file, description);
            setMessage('Файл успешно загружен!');
            setFile(null);
            setDescription('');
            // Можно перенаправить на список файлов через пару секунд
            setTimeout(() => navigate('/files'), 1500);
        } catch (err) {
            setError('Ошибка при загрузке файла. Проверьте формат и размер.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <h2>Загрузка файлов</h2>
                <p>Загрузите фото или аудио (файлы будут зашифрованы)</p>

                {message && <div className="alert alert-success" style={{color: 'green'}}>{message}</div>}
                {error && <div className="alert alert-error" style={{color: 'red'}}>{error}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label>Файл (Изображение или Аудио)</label>
                        <input
                            type="file"
                            onChange={handleFileChange}
                            accept="image/*,audio/*"
                            className="form-control"
                        />
                    </div>

                    <div className="form-group">
                        <label>Описание</label>
                        <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Краткое описание файла"
                        />
                    </div>

                    <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                        {loading ? 'Загрузка...' : 'Отправить'}
                    </button>
                </form>

                <div className="auth-links">
                    <Link to="/">На главную</Link> | <Link to="/files">Мои файлы</Link>
                </div>
            </div>
        </div>
    );
};

export default FileUploadPage;
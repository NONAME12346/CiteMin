import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import authService from '../services/authService';
import './AuthPages.css';

// Стили для модального окна (оверлей и контент)
const modalStyles = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000
    },
    content: {
        backgroundColor: '#fff',
        padding: '20px',
        borderRadius: '8px',
        maxWidth: '90%',
        maxHeight: '90%',
        width: 'auto',
        overflow: 'auto',
        position: 'relative',
        textAlign: 'center',
        boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
    },
    closeBtn: {
        position: 'absolute',
        top: '10px',
        right: '10px',
        background: '#ff4d4d',
        color: 'white',
        border: 'none',
        borderRadius: '50%',
        width: '30px',
        height: '30px',
        cursor: 'pointer',
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    media: {
        maxWidth: '100%',
        maxHeight: '70vh',
        marginTop: '15px',
        borderRadius: '4px'
    }
};

const UserFilesPage = () => {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Состояния для режима просмотра
    const [previewFile, setPreviewFile] = useState(null); // Метаданные файла, который смотрим
    const [previewUrl, setPreviewUrl] = useState(null);   // Временная ссылка на Blob
    const [loadingPreview, setLoadingPreview] = useState(false);

    useEffect(() => {
        loadFiles();
    }, []);

    const loadFiles = async () => {
        try {
            const data = await authService.getUserFiles();
            setFiles(data);
        } catch (err) {
            setError('Не удалось загрузить список файлов');
        } finally {
            setLoading(false);
        }
    };

    const handlePreview = async (file) => {
        setLoadingPreview(true);
        setPreviewFile(file); // Сразу показываем, что начали открывать этот файл

        try {
            // 1. Загружаем зашифрованный контент как Blob через наш сервис
            const blob = await authService.getFileContent(file.id);

            // 2. Создаем временную ссылку на этот Blob в памяти браузера
            const url = URL.createObjectURL(blob);

            setPreviewUrl(url);
        } catch (err) {
            console.error(err);
            alert("Ошибка при загрузке файла для просмотра. Возможно, файл поврежден или ключ шифрования не совпадает.");
            setPreviewFile(null);
        } finally {
            setLoadingPreview(false);
        }
    };

    const closePreview = () => {
        if (previewUrl) {
            // Освобождаем память, удаляя ссылку на Blob
            URL.revokeObjectURL(previewUrl);
        }
        setPreviewFile(null);
        setPreviewUrl(null);
    };

    return (
        <div className="auth-page" style={{ minHeight: '100vh', justifyContent: 'flex-start', paddingTop: '50px' }}>
            <div className="auth-container" style={{ maxWidth: '900px', width: '95%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2>Мои файлы</h2>
                    <Link to="/upload" className="btn btn-sm btn-primary">Загрузить новый</Link>
                </div>

                {loading ? (
                    <p>Загрузка списка...</p>
                ) : error ? (
                    <p style={{ color: 'red' }}>{error}</p>
                ) : files.length === 0 ? (
                    <p>У вас пока нет загруженных файлов.</p>
                ) : (
                    <div className="files-list">
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #eee', backgroundColor: '#f9f9f9' }}>
                                    <th style={{ textAlign: 'left', padding: '12px' }}>Имя файла</th>
                                    <th style={{ textAlign: 'left', padding: '12px' }}>Тип</th>
                                    <th style={{ textAlign: 'left', padding: '12px' }}>Описание</th>
                                    <th style={{ textAlign: 'center', padding: '12px' }}>Действия</th>
                                </tr>
                            </thead>
                            <tbody>
                                {files.map(file => (
                                    <tr key={file.id} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '12px' }}>{file.name}</td>
                                        <td style={{ padding: '12px' }}>
                                            {file.type.startsWith('image/') ? '🖼️ Изображение' :
                                             file.type.startsWith('audio/') ? '🎵 Аудио' : '📄 Файл'}
                                        </td>
                                        <td style={{ padding: '12px', color: '#666' }}>
                                            {file.description || '-'}
                                        </td>
                                        <td style={{ padding: '12px', textAlign: 'center' }}>
                                            <button
                                                onClick={() => handlePreview(file)}
                                                className="btn btn-sm btn-secondary"
                                                disabled={loadingPreview && previewFile?.id === file.id}
                                                style={{ minWidth: '100px' }}
                                            >
                                                {loadingPreview && previewFile?.id === file.id ? 'Загрузка...' :
                                                 file.type.startsWith('audio/') ? 'Слушать ▶' : 'Смотреть 👁'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="auth-links" style={{ marginTop: '20px' }}>
                    <Link to="/">Вернуться на главную</Link>
                </div>
            </div>

            {/* МОДАЛЬНОЕ ОКНО ПРОСМОТРА */}
            {previewFile && (
                <div style={modalStyles.overlay} onClick={closePreview}>
                    <div style={modalStyles.content} onClick={e => e.stopPropagation()}>
                        <button style={modalStyles.closeBtn} onClick={closePreview}>×</button>

                        <h3 style={{ marginTop: 0, marginRight: '30px' }}>{previewFile.name}</h3>

                        {!previewUrl ? (
                            <div style={{ padding: '40px' }}>
                                <div className="loading-spinner"></div>
                                <p>Дешифрование и загрузка...</p>
                            </div>
                        ) : previewFile.type.startsWith('image/') ? (
                            <img
                                src={previewUrl}
                                alt={previewFile.name}
                                style={modalStyles.media}
                            />
                        ) : (
                            <div style={{ padding: '30px 10px' }}>
                                <audio controls autoPlay style={{ width: '100%', minWidth: '300px' }}>
                                    <source src={previewUrl} type={previewFile.type} />
                                    Ваш браузер не поддерживает аудио элемент.
                                </audio>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserFilesPage;
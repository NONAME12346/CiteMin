import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import authService from '../services/authService';
import './AuthPages.css'; // Или создайте UserFilesPage.css

const UserFilesPage = () => {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
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

        loadFiles();
    }, []);

    return (
        <div className="auth-page" style={{ minHeight: '100vh', justifyContent: 'flex-start', paddingTop: '50px' }}>
            <div className="auth-container" style={{ maxWidth: '800px', width: '90%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2>Мои файлы</h2>
                    <Link to="/upload" className="btn btn-sm btn-primary">Загрузить новый</Link>
                </div>

                {loading ? (
                    <p>Загрузка...</p>
                ) : error ? (
                    <p style={{ color: 'red' }}>{error}</p>
                ) : files.length === 0 ? (
                    <p>У вас пока нет загруженных файлов.</p>
                ) : (
                    <div className="files-list">
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #ccc' }}>
                                    <th style={{ textAlign: 'left', padding: '10px' }}>Имя</th>
                                    <th style={{ textAlign: 'left', padding: '10px' }}>Тип</th>
                                    <th style={{ textAlign: 'left', padding: '10px' }}>Описание</th>
                                    <th style={{ textAlign: 'left', padding: '10px' }}>Дата</th>
                                </tr>
                            </thead>
                            <tbody>
                                {files.map(file => (
                                    <tr key={file.id} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '10px' }}>{file.name}</td>
                                        <td style={{ padding: '10px' }}>{file.type}</td>
                                        <td style={{ padding: '10px' }}>{file.description}</td>
                                        <td style={{ padding: '10px' }}>
                                            {new Date(file.uploaded_at).toLocaleString()}
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
        </div>
    );
};

export default UserFilesPage;
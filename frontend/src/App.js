import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import './App.css';

// Компонент для защищенных маршрутов
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <div className="loading">Загрузка...</div>;
    }

    return isAuthenticated ? children : <Navigate to="/login" />;
};

// Компонент для публичных маршрутов (только для неавторизованных)
const PublicRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <div className="loading">Загрузка...</div>;
    }

    return !isAuthenticated ? children : <Navigate to="/" />;
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
                        {/* Добавим позже */}
                        {/* <Route
                            path="/upload"
                            element={
                                <ProtectedRoute>
                                    <UploadPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/files"
                            element={
                                <ProtectedRoute>
                                    <FilesPage />
                                </ProtectedRoute>
                            }
                        /> */}
                        <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;
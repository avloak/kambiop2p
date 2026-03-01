import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/userService';
import './Login.css';

function Login({ setAuth }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authService.login(email, password);
      setAuth(true);
      navigate('/market');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Email o contraseña incorrectos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h2>Iniciar Sesión</h2>
          <p>Bienvenido de vuelta a KambioP2P</p>
        </div>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
            />
          </div>

          <div className="form-group">
            <label>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Tu contraseña"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="login-footer">
          <p>¿No tienes cuenta? <a href="/register">Regístrate</a></p>
          <p><a href="/">Volver al inicio</a></p>
        </div>
      </div>
    </div>
  );
}

export default Login;

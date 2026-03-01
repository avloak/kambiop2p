import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService, authService } from '../services/userService';
import './Profile.css';

function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const data = await userService.getProfile(userId);
      setProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="profile-page">
        <nav className="navbar">
          <div className="container">
            <h1 className="logo">KambioP2P</h1>
          </div>
        </nav>
        <div className="container">
          <div className="loading">Cargando perfil...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <nav className="navbar">
        <div className="container">
          <h1 className="logo">KambioP2P</h1>
          <div className="nav-links">
            <a href="/market">Mercado</a>
            <a href="/transactions">Transacciones</a>
            <a href="/profile" className="active">Perfil</a>
            <button onClick={handleLogout} className="btn btn-sm">Salir</button>
          </div>
        </div>
      </nav>

      <div className="container profile-container">
        <div className="profile-card card">
          <div className="profile-header">
            <div className="profile-avatar">
              {profile?.fullName ? profile.fullName.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="profile-info">
              <h2>{profile?.fullName || 'Usuario'}</h2>
              <p className="email">{profile?.email}</p>
              {profile?.isVerified ? (
                <span className="verified-badge">✓ Verificado</span>
              ) : (
                <span className="unverified-badge">⏳ Pendiente de verificación</span>
              )}
            </div>
          </div>

          <div className="profile-stats">
            <div className="stat-item">
              <div className="stat-label">Reputación</div>
              <div className="stat-value">
                ⭐ {(profile?.scoreAvg || 5).toFixed(1)}
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-label">Transacciones</div>
              <div className="stat-value">{profile?.totalTrades || 0}</div>
            </div>
            <div className="stat-item">
              <div className="stat-label">Miembro desde</div>
              <div className="stat-value">
                {profile?.createdAt 
                  ? new Date(profile.createdAt).toLocaleDateString() 
                  : 'N/A'}
              </div>
            </div>
          </div>

          <div className="profile-details">
            <h3>Información Personal</h3>
            <div className="details-grid">
              <div className="detail-row">
                <span className="detail-label">DNI:</span>
                <span className="detail-value">{profile?.dni || 'No registrado'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Fecha de Nacimiento:</span>
                <span className="detail-value">
                  {profile?.birthDate 
                    ? new Date(profile.birthDate).toLocaleDateString() 
                    : 'No registrado'}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Estado:</span>
                <span className="detail-value">
                  {profile?.status === 'ACTIVE' ? 'Activo' : profile?.status || 'Pendiente'}
                </span>
              </div>
            </div>
          </div>

          {!profile?.isVerified && (
            <div className="alert alert-info">
              <p>📋 Tu cuenta está en proceso de verificación</p>
              <p>Recibirás una notificación cuando se complete el proceso</p>
            </div>
          )}
        </div>

        <div className="actions-card card">
          <h3>Acciones</h3>
          <div className="action-buttons">
            <button onClick={() => navigate('/market')} className="btn btn-primary btn-block">
              Ver Mercado
            </button>
            <button onClick={() => navigate('/transactions')} className="btn btn-secondary btn-block">
              Mis Transacciones
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { marketService } from '../services/marketService';
import { transactionService } from '../services/transactionService';
import { authService } from '../services/userService';
import './Market.css';

function Market() {
  const navigate = useNavigate();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateOffer, setShowCreateOffer] = useState(false);
  const [message, setMessage] = useState('');
  
  const [newOffer, setNewOffer] = useState({
    type: 'SELL',
    currency: 'USD',
    amount: '',
    rate: '',
  });

  // Auto-refresh offers every 5 seconds
  useEffect(() => {
    loadOffers();
    const interval = setInterval(loadOffers, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadOffers = async () => {
    try {
      const data = await marketService.getOffers();
      setOffers(data.offers || []);
    } catch (error) {
      console.error('Error loading offers:', error);
    }
  };

  const handleCreateOffer = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await marketService.createOffer(newOffer);
      setMessage('✓ Oferta publicada exitosamente. Fondos bloqueados en Escrow.');
      setShowCreateOffer(false);
      setNewOffer({ type: 'SELL', currency: 'USD', amount: '', rate: '' });
      loadOffers();
    } catch (error) {
      console.error('Error creating offer:', error);
      setMessage('Error al crear la oferta. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptOffer = async (offerId) => {
    if (!window.confirm('¿Deseas aceptar esta oferta?')) return;

    setLoading(true);
    try {
      await transactionService.initiateTrade(offerId);
      setMessage('✓ Transacción iniciada. Revisa la sección de Transacciones.');
      navigate('/transactions');
    } catch (error) {
      console.error('Error accepting offer:', error);
      setMessage('Error al aceptar la oferta. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/');
  };

  return (
    <div className="market-page">
      <nav className="navbar">
        <div className="container">
          <h1 className="logo">KambioP2P</h1>
          <div className="nav-links">
            <a href="/market" className="active">Mercado</a>
            <a href="/transactions">Transacciones</a>
            <a href="/profile">Perfil</a>
            <button onClick={handleLogout} className="btn btn-sm">Salir</button>
          </div>
        </div>
      </nav>

      <div className="container market-container">
        <div className="market-header">
          <h2>Mercado P2P</h2>
          <button 
            onClick={() => setShowCreateOffer(!showCreateOffer)} 
            className="btn btn-primary"
          >
            + Crear Oferta
          </button>
        </div>

        {message && (
          <div className={`alert ${message.includes('✓') ? 'alert-success' : 'alert-error'}`}>
            {message}
          </div>
        )}

        {showCreateOffer && (
          <div className="card create-offer-card">
            <h3>Publicar Nueva Oferta</h3>
            <form onSubmit={handleCreateOffer}>
              <div className="form-row">
                <div className="form-group">
                  <label>Tipo</label>
                  <select
                    value={newOffer.type}
                    onChange={(e) => setNewOffer({ ...newOffer, type: e.target.value })}
                  >
                    <option value="SELL">Vender USD</option>
                    <option value="BUY">Comprar USD</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Moneda</label>
                  <select
                    value={newOffer.currency}
                    onChange={(e) => setNewOffer({ ...newOffer, currency: e.target.value })}
                  >
                    <option value="USD">USD</option>
                    <option value="PEN">PEN</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Monto</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newOffer.amount}
                    onChange={(e) => setNewOffer({ ...newOffer, amount: e.target.value })}
                    placeholder="1000.00"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Tipo de Cambio</label>
                  <input
                    type="number"
                    step="0.001"
                    value={newOffer.rate}
                    onChange={(e) => setNewOffer({ ...newOffer, rate: e.target.value })}
                    placeholder="3.720"
                    required
                  />
                </div>
              </div>

              <div className="alert alert-info">
                <p>💰 Los fondos serán bloqueados en tu billetera virtual (Escrow) hasta completar la transacción</p>
              </div>

              <div className="form-actions">
                <button type="button" onClick={() => setShowCreateOffer(false)} className="btn btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Publicando...' : 'Publicar Oferta'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="offers-section">
          <div className="offers-header">
            <h3>Ofertas Activas</h3>
            <span className="live-indicator">🟢 En vivo</span>
          </div>

          {offers.length === 0 ? (
            <div className="card">
              <p className="no-offers">No hay ofertas disponibles en este momento</p>
            </div>
          ) : (
            <div className="offers-grid">
              {offers.map((offer) => (
                <div key={offer.id} className="offer-card card">
                  <div className="offer-type">
                    <span className={`badge ${offer.type === 'SELL' ? 'badge-sell' : 'badge-buy'}`}>
                      {offer.type === 'SELL' ? 'Vende' : 'Compra'} {offer.currency}
                    </span>
                  </div>
                  
                  <div className="offer-details">
                    <div className="offer-amount">
                      <span className="label">Monto</span>
                      <span className="value">{offer.currency} {parseFloat(offer.amount).toFixed(2)}</span>
                    </div>
                    
                    <div className="offer-rate">
                      <span className="label">Tipo de Cambio</span>
                      <span className="value rate-value">{parseFloat(offer.rate).toFixed(3)}</span>
                    </div>
                  </div>

                  <div className="offer-user">
                    <div className="user-info">
                      <span className="username">{offer.userName || 'Usuario'}</span>
                      <span className="reputation">
                        ⭐ {(offer.reputation || 5).toFixed(1)} ({offer.totalTrades || 0} ops)
                      </span>
                    </div>
                  </div>

                  <button 
                    onClick={() => handleAcceptOffer(offer.id)} 
                    className="btn btn-primary btn-block"
                    disabled={loading}
                  >
                    Aceptar Oferta
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Market;

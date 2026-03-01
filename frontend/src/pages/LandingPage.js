import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { marketService } from '../services/marketService';
import './LandingPage.css';

function LandingPage() {
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [bankRate, setBankRate] = useState(null);
  const [savings, setSavings] = useState(null);
  const [loading, setLoading] = useState(false);

  const calculateSavings = async () => {
    if (!amount || amount <= 0) {
      alert('Por favor ingresa un monto válido');
      return;
    }

    setLoading(true);
    try {
      const rates = await marketService.getExchangeRates();
      
      // Simulate bank rate (typically higher for sell, lower for buy)
      const bankAvgRate = rates.bankAverage || 3.75;
      const bestMarketRate = rates.bestOffer || 3.72;
      
      const bankCost = amount * bankAvgRate;
      const marketCost = amount * bestMarketRate;
      const savedAmount = Math.abs(bankCost - marketCost);
      
      setBankRate(bankAvgRate);
      setSavings(savedAmount.toFixed(2));
    } catch (error) {
      console.error('Error calculating savings:', error);
      // Show demo data if API is not ready
      const demoSavings = (amount * 0.03).toFixed(2);
      setSavings(demoSavings);
      setBankRate(3.75);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="landing-page">
      <header className="header">
        <div className="container">
          <div className="logo">
            <h1>KambioP2P</h1>
          </div>
          <nav>
            <button onClick={() => navigate('/login')} className="btn btn-outline">
              Iniciar Sesión
            </button>
            <button onClick={() => navigate('/register')} className="btn btn-primary">
              Registrarse
            </button>
          </nav>
        </div>
      </header>

      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h2>Cambia dólares y soles al mejor precio</h2>
            <p>Intercambia divisas de forma segura con otros usuarios. Sin comisiones bancarias.</p>
          </div>

          <div className="calculator-card card">
            <h3>Calculadora de Ahorro</h3>
            <p>Descubre cuánto ahorras comparado con el banco</p>
            
            <div className="form-group">
              <label>Monto a cambiar (USD)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Ej: 1000"
                className="input-large"
              />
            </div>

            <button 
              onClick={calculateSavings} 
              className="btn btn-primary btn-large"
              disabled={loading}
            >
              {loading ? 'Calculando...' : 'Calcular Ahorro'}
            </button>

            {savings && (
              <div className="savings-result">
                <div className="alert alert-success">
                  <h4>¡Estás ahorrando S/ {savings} comparado con el banco!</h4>
                  <p>Tipo de cambio promedio banco: S/ {bankRate}</p>
                  <p>Nuestro mejor precio: S/ {(bankRate - (savings / amount)).toFixed(3)}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="features">
        <div className="container">
          <h3>¿Por qué KambioP2P?</h3>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h4>Seguro</h4>
              <p>Sistema de custodia (Escrow) protege tus fondos hasta completar la transacción</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💰</div>
              <h4>Mejor Precio</h4>
              <p>Tipos de cambio competitivos directamente entre usuarios</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h4>Rápido</h4>
              <p>Transacciones en minutos con confirmación en tiempo real</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">✓</div>
              <h4>Verificado</h4>
              <p>Usuarios verificados con documentos de identidad</p>
            </div>
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="container">
          <h3>Comienza a ahorrar hoy</h3>
          <p>Únete a miles de usuarios que ya confían en KambioP2P</p>
          <button onClick={() => navigate('/register')} className="btn btn-primary btn-large">
            Crear Cuenta Gratis
          </button>
        </div>
      </section>

      <footer className="footer">
        <div className="container">
          <p>&copy; 2026 KambioP2P. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;

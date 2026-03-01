import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { transactionService } from '../services/transactionService';
import { disputeService } from '../services/disputeService';
import { authService } from '../services/userService';
import './Transactions.css';

function Transactions() {
  const navigate = useNavigate();
  const [trades, setTrades] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddBank, setShowAddBank] = useState(false);
  const [showDispute, setShowDispute] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState(null);
  const [message, setMessage] = useState('');

  const [newBankAccount, setNewBankAccount] = useState({
    bankName: 'BCP',
    accountNumber: '',
    currencyType: 'PEN',
  });

  const [disputeData, setDisputeData] = useState({
    reason: '',
    evidence: null,
  });

  useEffect(() => {
    loadTrades();
    loadBankAccounts();
    
    // Auto-refresh every 10 seconds
    const interval = setInterval(loadTrades, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadTrades = async () => {
    try {
      const data = await transactionService.getUserTrades();
      setTrades(data.trades || []);
    } catch (error) {
      console.error('Error loading trades:', error);
    }
  };

  const loadBankAccounts = async () => {
    try {
      const data = await transactionService.getBankAccounts();
      setBankAccounts(data.accounts || []);
    } catch (error) {
      console.error('Error loading bank accounts:', error);
    }
  };

  const handleAddBankAccount = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await transactionService.addBankAccount(newBankAccount);
      setMessage('✓ Cuenta bancaria agregada exitosamente');
      setShowAddBank(false);
      setNewBankAccount({ bankName: 'BCP', accountNumber: '', currencyType: 'PEN' });
      loadBankAccounts();
    } catch (error) {
      console.error('Error adding bank account:', error);
      setMessage('Error al agregar cuenta bancaria');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDeposit = async (tradeId) => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    
    fileInput.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      setLoading(true);
      setMessage('');

      try {
        const formData = new FormData();
        formData.append('proof', file);
        
        await transactionService.confirmDeposit(tradeId, formData);
        setMessage('✓ Depósito confirmado. Esperando validación de la contraparte.');
        loadTrades();
      } catch (error) {
        console.error('Error confirming deposit:', error);
        setMessage('Error al confirmar depósito');
      } finally {
        setLoading(false);
      }
    };

    fileInput.click();
  };

  const handleReleaseFunds = async (tradeId) => {
    if (!window.confirm('¿Confirmas que recibiste los fondos? Esta acción no se puede deshacer.')) {
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      await transactionService.releaseFunds(tradeId);
      setMessage('✓ Fondos liberados. Transacción completada.');
      loadTrades();
      
      // Show rating prompt
      setTimeout(() => {
        const rating = window.prompt('Califica esta transacción (1-5 estrellas):');
        if (rating && rating >= 1 && rating <= 5) {
          // Update reputation (implement this in userService)
          console.log('Rating:', rating);
        }
      }, 1000);
    } catch (error) {
      console.error('Error releasing funds:', error);
      setMessage('Error al liberar fondos');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDispute = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await disputeService.openDispute(
        selectedTrade.id,
        disputeData.reason,
        disputeData.evidence
      );
      setMessage('✓ Disputa abierta. Un agente revisará tu caso.');
      setShowDispute(false);
      setSelectedTrade(null);
      setDisputeData({ reason: '', evidence: null });
      loadTrades();
    } catch (error) {
      console.error('Error opening dispute:', error);
      setMessage('Error al abrir disputa');
    } finally {
      setLoading(false);
    }
  };

  const canOpenDispute = (trade) => {
    if (trade.status !== 'AWAITING_CONFIRMATION') return false;
    
    const createdTime = new Date(trade.createdAt).getTime();
    const now = Date.now();
    const minutesElapsed = (now - createdTime) / (1000 * 60);
    
    return minutesElapsed > 15;
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/');
  };

  return (
    <div className="transactions-page">
      <nav className="navbar">
        <div className="container">
          <h1 className="logo">KambioP2P</h1>
          <div className="nav-links">
            <a href="/market">Mercado</a>
            <a href="/transactions" className="active">Transacciones</a>
            <a href="/profile">Perfil</a>
            <button onClick={handleLogout} className="btn btn-sm">Salir</button>
          </div>
        </div>
      </nav>

      <div className="container transactions-container">
        <div className="page-header">
          <h2>Mis Transacciones</h2>
          <button onClick={() => setShowAddBank(!showAddBank)} className="btn btn-secondary">
            + Agregar Cuenta Bancaria
          </button>
        </div>

        {message && (
          <div className={`alert ${message.includes('✓') ? 'alert-success' : 'alert-error'}`}>
            {message}
          </div>
        )}

        {showAddBank && (
          <div className="card add-bank-card">
            <h3>Agregar Cuenta Bancaria</h3>
            <form onSubmit={handleAddBankAccount}>
              <div className="form-row">
                <div className="form-group">
                  <label>Banco</label>
                  <select
                    value={newBankAccount.bankName}
                    onChange={(e) => setNewBankAccount({ ...newBankAccount, bankName: e.target.value })}
                  >
                    <option value="BCP">BCP</option>
                    <option value="Interbank">Interbank</option>
                    <option value="BBVA">BBVA</option>
                    <option value="Scotiabank">Scotiabank</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Tipo de Moneda</label>
                  <select
                    value={newBankAccount.currencyType}
                    onChange={(e) => setNewBankAccount({ ...newBankAccount, currencyType: e.target.value })}
                  >
                    <option value="PEN">Soles (PEN)</option>
                    <option value="USD">Dólares (USD)</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Número de Cuenta</label>
                <input
                  type="text"
                  value={newBankAccount.accountNumber}
                  onChange={(e) => setNewBankAccount({ ...newBankAccount, accountNumber: e.target.value })}
                  placeholder="123456789012345"
                  required
                />
              </div>

              <div className="form-actions">
                <button type="button" onClick={() => setShowAddBank(false)} className="btn btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Agregando...' : 'Agregar Cuenta'}
                </button>
              </div>
            </form>
          </div>
        )}

        {bankAccounts.length > 0 && (
          <div className="bank-accounts-section">
            <h3>Cuentas Bancarias Vinculadas</h3>
            <div className="bank-accounts-grid">
              {bankAccounts.map((account) => (
                <div key={account.id} className="bank-account-card card-small">
                  <div className="bank-name">{account.bankName}</div>
                  <div className="account-number">**** {account.accountNumber.slice(-4)}</div>
                  <div className="currency-badge">{account.currencyType}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="trades-section">
          <h3>Transacciones Activas y Recientes</h3>
          
          {trades.length === 0 ? (
            <div className="card">
              <p className="no-trades">No tienes transacciones en curso</p>
            </div>
          ) : (
            <div className="trades-list">
              {trades.map((trade) => (
                <div key={trade.id} className="trade-card card">
                  <div className="trade-header">
                    <div>
                      <span className={`status-badge status-${trade.escrowStatus}`}>
                        {trade.escrowStatus === 'PENDING' && '⏳ Pendiente'}
                        {trade.escrowStatus === 'IN_ESCROW' && '🔒 Fondos en Custodia'}
                        {trade.escrowStatus === 'AWAITING_CONFIRMATION' && '⏱️ Esperando Confirmación'}
                        {trade.escrowStatus === 'COMPLETED' && '✓ Completado'}
                        {trade.escrowStatus === 'DISPUTED' && '⚠️ En Disputa'}
                      </span>
                    </div>
                    <div className="trade-id">ID: {trade.id.slice(0, 8)}</div>
                  </div>

                  <div className="trade-details">
                    <div className="detail-item">
                      <span className="label">Monto:</span>
                      <span className="value">{trade.currency} {parseFloat(trade.amountFiat).toFixed(2)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Tipo de Cambio:</span>
                      <span className="value">{parseFloat(trade.rate).toFixed(3)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Contraparte:</span>
                      <span className="value">{trade.counterpartyName}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Fecha:</span>
                      <span className="value">{new Date(trade.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="trade-actions">
                    {trade.escrowStatus === 'IN_ESCROW' && trade.isBuyer && (
                      <button 
                        onClick={() => handleConfirmDeposit(trade.id)} 
                        className="btn btn-primary"
                        disabled={loading}
                      >
                        Confirmar Depósito
                      </button>
                    )}

                    {trade.escrowStatus === 'AWAITING_CONFIRMATION' && !trade.isBuyer && (
                      <>
                        <button 
                          onClick={() => handleReleaseFunds(trade.id)} 
                          className="btn btn-primary"
                          disabled={loading}
                        >
                          Liberar Fondos
                        </button>
                        {canOpenDispute(trade) && (
                          <button 
                            onClick={() => {
                              setSelectedTrade(trade);
                              setShowDispute(true);
                            }} 
                            className="btn btn-danger"
                          >
                            Reportar Incidencia
                          </button>
                        )}
                      </>
                    )}

                    {trade.escrowStatus === 'COMPLETED' && (
                      <div className="alert alert-success">
                        Transacción completada exitosamente
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {showDispute && selectedTrade && (
          <div className="modal-overlay" onClick={() => setShowDispute(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>Reportar Incidencia</h3>
              <p>Trade ID: {selectedTrade.id.slice(0, 8)}</p>
              
              <form onSubmit={handleOpenDispute}>
                <div className="form-group">
                  <label>Motivo de la disputa</label>
                  <textarea
                    value={disputeData.reason}
                    onChange={(e) => setDisputeData({ ...disputeData, reason: e.target.value })}
                    placeholder="Describe el problema..."
                    rows="4"
                    required
                  ></textarea>
                </div>

                <div className="form-group">
                  <label>Evidencia (opcional)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setDisputeData({ ...disputeData, evidence: e.target.files[0] })}
                  />
                </div>

                <div className="alert alert-info">
                  <p>⚠️ Un agente revisará tu caso. Los fondos permanecerán congelados hasta la resolución.</p>
                </div>

                <div className="form-actions">
                  <button type="button" onClick={() => setShowDispute(false)} className="btn btn-secondary">
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-danger" disabled={loading}>
                    {loading ? 'Enviando...' : 'Enviar Reporte'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Transactions;

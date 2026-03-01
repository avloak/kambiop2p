import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/userService';
import './Register.css';

function Register({ setAuth }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    dni: '',
    fullName: '',
    birthDate: '',
    phone: '',
    idDocument: null,
    selfie: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormData({ ...formData, [name]: files[0] });
  };

  const validateStep1 = () => {
    if (!formData.email || !formData.password) {
      setError('Por favor completa todos los campos');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return false;
    }
    if (formData.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.dni || !formData.fullName || !formData.birthDate || !formData.phone) {
      setError('Por favor completa todos los campos');
      return false;
    }
    if (formData.dni.length !== 8) {
      setError('El DNI debe tener 8 dígitos');
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    if (!formData.idDocument || !formData.selfie) {
      setError('Por favor sube ambas imágenes');
      return false;
    }
    return true;
  };

  const nextStep = () => {
    setError('');
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    setStep(step + 1);
  };

  const prevStep = () => {
    setError('');
    setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateStep3()) return;

    setLoading(true);
    try {
      // Step 1: Register user
      const registerData = {
        email: formData.email,
        password: formData.password,
      };
      const registerResponse = await authService.register(registerData);
      
      localStorage.setItem('token', registerResponse.token);
      localStorage.setItem('userId', registerResponse.userId);

      // Step 2: Verify identity
      const verifyFormData = new FormData();
      verifyFormData.append('dni', formData.dni);
      verifyFormData.append('fullName', formData.fullName);
      verifyFormData.append('birthDate', formData.birthDate);
      verifyFormData.append('phone', formData.phone);
      verifyFormData.append('idDocument', formData.idDocument);
      verifyFormData.append('selfie', formData.selfie);

      await authService.verifyIdentity(verifyFormData);

      setAuth(true);
      navigate('/market');
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || 'Error en el registro. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-header">
          <h2>Crear Cuenta</h2>
          <div className="step-indicator">
            <div className={`step ${step >= 1 ? 'active' : ''}`}>1</div>
            <div className={`step-line ${step >= 2 ? 'active' : ''}`}></div>
            <div className={`step ${step >= 2 ? 'active' : ''}`}>2</div>
            <div className={`step-line ${step >= 3 ? 'active' : ''}`}></div>
            <div className={`step ${step >= 3 ? 'active' : ''}`}>3</div>
          </div>
        </div>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="register-form">
          {step === 1 && (
            <div className="form-step">
              <h3>Información de Cuenta</h3>
              
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="tu@email.com"
                  required
                />
              </div>

              <div className="form-group">
                <label>Contraseña</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Mínimo 8 caracteres"
                  required
                />
              </div>

              <div className="form-group">
                <label>Confirmar Contraseña</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repite tu contraseña"
                  required
                />
              </div>

              <button type="button" onClick={nextStep} className="btn btn-primary btn-block">
                Siguiente
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="form-step">
              <h3>Información Personal</h3>
              
              <div className="form-group">
                <label>DNI</label>
                <input
                  type="text"
                  name="dni"
                  value={formData.dni}
                  onChange={handleChange}
                  placeholder="12345678"
                  maxLength="8"
                  required
                />
              </div>

              <div className="form-group">
                <label>Nombre Completo</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Juan Pérez García"
                  required
                />
              </div>

              <div className="form-group">
                <label>Fecha de Nacimiento</label>
                <input
                  type="date"
                  name="birthDate"
                  value={formData.birthDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Teléfono</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="999 888 777"
                  required
                />
              </div>

              <div className="button-group">
                <button type="button" onClick={prevStep} className="btn btn-secondary">
                  Atrás
                </button>
                <button type="button" onClick={nextStep} className="btn btn-primary">
                  Siguiente
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="form-step">
              <h3>Verificación de Identidad</h3>
              <p className="help-text">
                Para tu seguridad, necesitamos verificar tu identidad
              </p>

              <div className="form-group">
                <label>Foto del DNI</label>
                <div className="file-upload">
                  <input
                    type="file"
                    name="idDocument"
                    onChange={handleFileChange}
                    accept="image/*"
                    required
                    id="idDocument"
                  />
                  <label htmlFor="idDocument" className="file-label">
                    {formData.idDocument ? formData.idDocument.name : 'Seleccionar archivo'}
                  </label>
                </div>
                <small>Sube una foto clara de tu DNI</small>
              </div>

              <div className="form-group">
                <label>Selfie de Verificación</label>
                <div className="file-upload">
                  <input
                    type="file"
                    name="selfie"
                    onChange={handleFileChange}
                    accept="image/*"
                    required
                    id="selfie"
                  />
                  <label htmlFor="selfie" className="file-label">
                    {formData.selfie ? formData.selfie.name : 'Seleccionar archivo'}
                  </label>
                </div>
                <small>Toma una selfie sosteniendo tu DNI</small>
              </div>

              <div className="verification-note alert alert-info">
                <p>📋 Tu información será verificada con RENIEC/Migraciones</p>
                <p>⏱️ El proceso de verificación toma aproximadamente 5 minutos</p>
              </div>

              <div className="button-group">
                <button type="button" onClick={prevStep} className="btn btn-secondary">
                  Atrás
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Registrando...' : 'Completar Registro'}
                </button>
              </div>
            </div>
          )}
        </form>

        <div className="register-footer">
          <p>¿Ya tienes cuenta? <a href="/login">Inicia sesión</a></p>
        </div>
      </div>
    </div>
  );
}

export default Register;

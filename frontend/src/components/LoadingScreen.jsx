import React from 'react';
import { theme } from '../config/theme';

export const LoadingScreen = ({ message = 'Iniciando sesión...' }) => {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'linear-gradient(135deg, #1a1f3a 0%, #0f1419 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      fontFamily: theme.typography.fontFamily,
    }}>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        @keyframes loadingBar {
          0% { width: 0%; }
          50% { width: 100%; }
          100% { width: 0%; }
        }
      `}</style>

      {/* Logo con animación */}
      <div style={{
        marginBottom: '2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{
          width: '70px',
          height: '70px',
          background: `linear-gradient(135deg, ${theme.colors.primary} 0%, #0066cc 100%)`,
          borderRadius: '1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2rem',
          fontWeight: 'bold',
          color: 'white',
          animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          boxShadow: `0 10px 30px rgba(0, 51, 88, 0.3)`,
        }}>
          📊
        </div>
      </div>

      {/* Spinner */}
      <div style={{
        width: '60px',
        height: '60px',
        border: '4px solid rgba(255, 255, 255, 0.1)',
        borderTopColor: theme.colors.primary,
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        marginBottom: '2rem',
      }} />

      {/* Texto Principal */}
      <div style={{
        color: '#ffffff',
        fontSize: '1.3rem',
        fontWeight: theme.typography.fontWeight.medium,
        marginBottom: '0.75rem',
        textAlign: 'center',
      }}>
        Sistema de Control de Presupuesto
      </div>

      {/* Texto Secundario */}
      <div style={{
        color: '#8fa3c4',
        fontSize: '0.95rem',
        marginBottom: '2rem',
      }}>
        {message}
      </div>

      {/* Barra de progreso */}
      <div style={{
        width: '240px',
        height: '4px',
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '2px',
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          background: `linear-gradient(90deg, ${theme.colors.primary} 0%, #0066cc 100%)`,
          animation: 'loadingBar 1.5s ease-in-out infinite',
          borderRadius: '2px',
        }} />
      </div>
    </div>
  );
};

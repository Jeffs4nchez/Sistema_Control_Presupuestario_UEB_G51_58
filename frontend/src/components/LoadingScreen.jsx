import React from 'react';
import { motion } from 'framer-motion';
import logo from '../assets/logo.png';

export const LoadingScreen = ({ message = 'Iniciando sistema...' }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'linear-gradient(135deg, #0a1929 0%, #1a3a5c 50%, #0d1f35 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        fontFamily: "'Montserrat', system-ui, sans-serif",
        overflow: 'hidden',
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;600;700;800&display=swap');
        @keyframes loadingBar {
          0%   { transform: translateX(-100%); }
          50%  { transform: translateX(0%); }
          100% { transform: translateX(100%); }
        }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 30px rgba(84,179,224,0.3); }
          50%       { box-shadow: 0 0 60px rgba(84,179,224,0.55); }
        }
        @keyframes floatUp {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>

      {/* Background floating shapes */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '10%', left: '10%', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(84,179,224,0.08), transparent)', animation: 'floatUp 7s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', bottom: '10%', right: '10%', width: '250px', height: '250px', borderRadius: '40px', background: 'radial-gradient(circle, rgba(46,108,164,0.07), transparent)', animation: 'floatUp 10s ease-in-out infinite reverse', transform: 'rotate(20deg)' }} />
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(26,58,92,0.4), transparent 60%)', pointerEvents: 'none' }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0' }}>

        {/* Logo */}
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, type: 'spring', stiffness: 120 }}
          style={{ marginBottom: '28px', animation: 'floatUp 3s ease-in-out infinite' }}
        >
          <img
            src={logo}
            alt="Sicop"
            style={{ width: '220px', filter: 'drop-shadow(0 8px 24px rgba(84,179,224,0.35))' }}
          />
        </motion.div>

        {/* Subtitle */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          style={{ textAlign: 'center', marginBottom: '8px' }}
        >
          <p style={{ margin: '0 0 4px', fontSize: '11px', fontWeight: 700, color: 'rgba(84,179,224,0.75)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
            Sistema de Control Presupuestario
          </p>
        </motion.div>

        {/* Spinner */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          style={{
            width: '40px', height: '40px',
            border: '3px solid rgba(255,255,255,0.08)',
            borderTopColor: '#54b3e0',
            borderRightColor: 'rgba(84,179,224,0.4)',
            borderRadius: '50%',
            animation: 'spin 0.9s linear infinite',
            marginTop: '28px',
            marginBottom: '16px',
          }}
        />

        {/* Message */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          style={{ margin: '0 0 20px', fontSize: '13px', color: 'rgba(255,255,255,0.45)', fontWeight: 500 }}
        >
          {message}
        </motion.p>

        {/* Progress bar */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0.7 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 0.8 }}
          style={{ width: '220px', height: '3px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden' }}
        >
          <div style={{
            height: '100%',
            background: 'linear-gradient(90deg, transparent, #54b3e0, #2e6ca4, transparent)',
            borderRadius: '2px',
            animation: 'loadingBar 1.6s ease-in-out infinite',
          }} />
        </motion.div>
      </div>
    </motion.div>
  );
};

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { theme } from '../config/theme';
import {
  Upload, Database, FileText, CheckCircle2, Users,
  ArrowRight, TrendingUp, BarChart3, Activity, Shield,
} from 'lucide-react';

const BG     = theme.colors.dark['900'];
const CARD   = theme.colors.dark['800'];
const BORDER = theme.colors.dark['700'];
const ELEV   = theme.colors.dark['600'];
const ACCENT = theme.colors.accent.blue;
const TEXT   = 'rgba(255,255,255,0.88)';
const MUTED  = 'rgba(255,255,255,0.45)';

export const Inicio = () => {
  const navigate  = useNavigate();
  const { user }  = useAuth();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);

  const quickActions = [
    { title: 'Estructura Presupuestaria', desc: 'Importar datos desde CSV',        icon: <Upload size={22} />,       color: ACCENT,                       path: '/dashboard/estructura-presupuestaria' },
    { title: 'Ver Datos',                 desc: 'Visualizar información cargada',  icon: <Database size={22} />,     color: theme.colors.accent.teal,     path: '/dashboard/estructura-presupuestaria-data' },
    { title: 'Cédula Presupuestaria',     desc: 'Gestionar asignaciones',          icon: <FileText size={22} />,     color: theme.colors.accent.gold,     path: '/dashboard/cedula-presupuestaria' },
    { title: 'Certificaciones',           desc: 'Crear y gestionar certificados',  icon: <CheckCircle2 size={22} />, color: theme.colors.accent.green,    path: '/dashboard/certificacion' },
    { title: 'Gestionar Usuarios',        desc: 'Administrar acceso de usuarios',  icon: <Users size={22} />,        color: theme.colors.accent.red,      path: '/dashboard/usuarios' },
  ];

  const statCards = [
    { label: 'Presupuesto Total',     value: '$1,500,000', icon: <BarChart3 size={18} />,  color: ACCENT },
    { label: 'Presupuesto Utilizado', value: '$750,000',   icon: <TrendingUp size={18} />, color: theme.colors.accent.green },
    { label: 'Disponible',            value: '$750,000',   icon: <Activity size={18} />,   color: theme.colors.accent.gold },
    { label: 'Usuarios Activos',      value: '15',         icon: <Shield size={18} />,     color: theme.colors.accent.teal },
  ];

  const P = isMobile ? '20px' : '32px';

  return (
    <div style={{ background: BG, minHeight: '100%', padding: P, fontFamily: theme.typography.fontFamily }}>

      {/* Welcome banner */}
      <div style={{
        background: `linear-gradient(135deg, ${CARD}, ${theme.colors.dark['700']})`,
        border: `1px solid ${BORDER}`,
        borderLeft: `4px solid ${ACCENT}`,
        borderRadius: theme.border.radiusMd,
        padding: isMobile ? '20px' : '28px 32px',
        marginBottom: '24px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: 0, right: 0,
          width: '180px', height: '180px',
          background: `radial-gradient(circle, ${ACCENT}18, transparent 70%)`,
          borderRadius: '50%',
          transform: 'translate(40%, -40%)',
          pointerEvents: 'none',
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{ margin: '0 0 4px', fontSize: '11px', color: MUTED, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase' }}>
            Universidad Estatal de Bolívar
          </p>
          <h1 style={{ margin: '0 0 6px', fontSize: isMobile ? '20px' : '26px', fontWeight: 700, color: TEXT, letterSpacing: '-0.02em' }}>
            Bienvenido, {user?.nombres?.split(' ')[0] || 'Usuario'}
          </h1>
          <p style={{ margin: 0, fontSize: '13px', color: MUTED }}>
            Panel de control — Sistema de Control Presupuestario
          </p>
        </div>
      </div>

      {/* Stats */}
      <div style={{ marginBottom: '24px' }}>
        <p style={{ margin: '0 0 12px', fontSize: '11px', fontWeight: 700, color: MUTED, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Resumen General
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: '10px' }}>
          {statCards.map((s, i) => (
            <div key={i} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: theme.border.radiusMd, padding: '16px 18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <span style={{ color: s.color, display: 'flex' }}>{s.icon}</span>
                <span style={{ fontSize: '11px', fontWeight: 600, color: MUTED }}>{s.label}</span>
              </div>
              <p style={{ margin: 0, fontSize: isMobile ? '18px' : '22px', fontWeight: 700, color: TEXT, letterSpacing: '-0.02em' }}>{s.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Progress bars */}
      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: theme.border.radiusMd, padding: '20px', marginBottom: '24px' }}>
        <p style={{ margin: '0 0 16px', fontSize: '11px', fontWeight: 700, color: MUTED, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Ejecución Presupuestaria
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[
            { label: 'Porcentaje Utilizado', pct: 50, color: ACCENT },
            { label: 'Proyectos Activos',   pct: 66, color: theme.colors.accent.green },
          ].map((bar, i) => (
            <div key={i}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '13px', color: MUTED }}>{bar.label}</span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: bar.color }}>{bar.pct}%</span>
              </div>
              <div style={{ width: '100%', height: '6px', background: ELEV, borderRadius: theme.border.radiusFull, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${bar.pct}%`, background: bar.color, borderRadius: theme.border.radiusFull, transition: 'width 0.6s ease' }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <p style={{ margin: '0 0 12px', fontSize: '11px', fontWeight: 700, color: MUTED, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Acciones Rápidas
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '10px' }}>
          {quickActions.map((a, i) => (
            <button
              key={i}
              onClick={() => navigate(a.path)}
              style={{
                display: 'flex', alignItems: 'center', gap: '14px',
                padding: '16px', background: CARD, border: `1px solid ${BORDER}`,
                borderRadius: theme.border.radiusMd, cursor: 'pointer',
                textAlign: 'left', transition: 'all 0.18s ease',
                fontFamily: theme.typography.fontFamily, color: TEXT,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = ELEV;
                e.currentTarget.style.borderColor = a.color + '55';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.25)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = CARD;
                e.currentTarget.style.borderColor = BORDER;
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{
                width: '40px', height: '40px', borderRadius: theme.border.radiusMd,
                background: a.color + '1a', border: `1px solid ${a.color}44`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: a.color, flexShrink: 0,
              }}>
                {a.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: '0 0 2px', fontSize: '13px', fontWeight: 600, color: TEXT }}>{a.title}</p>
                <p style={{ margin: 0, fontSize: '11px', color: MUTED, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.desc}</p>
              </div>
              <ArrowRight size={14} style={{ color: MUTED, flexShrink: 0 }} />
            </button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: `1px solid ${BORDER}`, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <p style={{ margin: 0, fontSize: '11px', color: MUTED }}>Sistema Control Presupuestario © 2025 — UEB</p>
        <p style={{ margin: 0, fontSize: '11px', color: MUTED }}>Versión 1.0</p>
      </div>
    </div>
  );
};

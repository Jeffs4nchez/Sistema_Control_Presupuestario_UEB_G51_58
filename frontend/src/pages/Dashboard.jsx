import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { theme } from '../config/theme';
import {
  LayoutDashboard, Users, LogOut, TrendingUp, FileText,
  Table2, CheckCircle2, Menu, ChevronLeft, ChevronRight, BarChart2, KeyRound,
  Building2, PieChart, FileDown,
} from 'lucide-react';
import CambiarContrasenaModal from '../components/CambiarContrasenaModal';
import logo from '../assets/logo.png';

const BG     = theme.colors.dark['900'];
const CARD   = theme.colors.dark['800'];
const BORDER = theme.colors.dark['700'];
const ELEV   = theme.colors.dark['600'];
const ACCENT = theme.colors.accent.blue;
const TEXT   = 'rgba(255,255,255,0.88)';
const MUTED  = 'rgba(255,255,255,0.45)';

export const Dashboard = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user, logout, token } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  useEffect(() => {
    if (!token) navigate('/login');
  }, [token, navigate]);

  // Abrir modal automáticamente si la contraseña es temporal
  useEffect(() => {
    if (user?.contrasena_temporal) setShowPasswordModal(true);
  }, [user?.contrasena_temporal]);

  useEffect(() => {
    const handle = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setSidebarOpen(false);
    };
    window.addEventListener('resize', handle);
    return () => window.removeEventListener('resize', handle);
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };

  const menuItems = [
    { label: 'Inicio',                    path: '/dashboard',                         icon: <LayoutDashboard size={18} /> },
    { label: 'Gestión de Usuarios',        path: '/dashboard/usuarios',                icon: <Users size={18} /> },
    { label: 'Estructura Presupuestaria',  path: '/dashboard/estructura-presupuestaria', icon: <FileText size={18} /> },
    { label: 'Ver Datos',                  path: '/dashboard/estructura-presupuestaria-data', icon: <Table2 size={18} /> },
    { label: 'Cédula Presupuestaria',      path: '/dashboard/cedula-presupuestaria',   icon: <CheckCircle2 size={18} /> },
    { label: 'Certificación',              path: '/dashboard/certificacion',           icon: <TrendingUp size={18} /> },
    { label: 'Liquidaciones',              path: '/dashboard/liquidaciones',           icon: <BarChart2 size={18} /> },
    { label: 'Entidad Requirente',         path: '/dashboard/entidad-requirente',      icon: <Building2 size={18} /> },
    { label: 'Presupuesto Disponible',     path: '/dashboard/presupuesto-disponible',  icon: <PieChart size={18} /> },
    { label: 'Reportes',                   path: '/dashboard/reportes',                icon: <FileDown size={18} /> },
  ];

  const isActive = (path) =>
    path === '/dashboard'
      ? location.pathname === '/dashboard'
      : location.pathname === path || location.pathname.startsWith(path + '/');

  const SW = sidebarOpen ? '260px' : (isMobile ? '0px' : '60px');

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      background: BG,
      color: TEXT,
      fontFamily: theme.typography.fontFamily,
      overflow: 'hidden',
    }}>
      {/* Mobile overlay */}
      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.65)',
            zIndex: theme.zIndex.fixed - 100,
          }}
        />
      )}

      {/* ── SIDEBAR ─────────────────────────────────────────────────── */}
      <aside style={{
        width: SW, minWidth: SW,
        background: CARD,
        borderRight: `1px solid ${BORDER}`,
        display: 'flex',
        flexDirection: 'column',
        position: isMobile ? 'fixed' : 'relative',
        left: 0, top: 0,
        height: '100vh',
        zIndex: theme.zIndex.fixed,
        transition: 'width 0.25s ease, min-width 0.25s ease',
        overflow: 'hidden',
        boxShadow: isMobile && sidebarOpen ? theme.shadow.lg : 'none',
      }}>

        {/* Logo */}
        <div style={{
          padding: sidebarOpen ? '22px 20px 18px' : '18px 10px',
          borderBottom: `1px solid ${BORDER}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '72px',
          flexShrink: 0,
        }}>
          <img
            src={logo} alt="UEB"
            style={{
              width: sidebarOpen ? '108px' : '34px',
              height: 'auto',
              objectFit: 'contain',
              transition: 'width 0.25s ease',
            }}
          />
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, padding: '10px 8px', overflowY: 'auto', overflowX: 'hidden' }}>
          {sidebarOpen && (
            <span style={{
              display: 'block',
              padding: '4px 10px 8px',
              fontSize: '10px',
              fontWeight: 700,
              letterSpacing: '0.09em',
              textTransform: 'uppercase',
              color: MUTED,
            }}>
              Navegación
            </span>
          )}
          {menuItems.map((item) => {
            const active = isActive(item.path);
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                title={!sidebarOpen ? item.label : undefined}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  width: '100%',
                  padding: sidebarOpen ? '9px 10px' : '10px',
                  marginBottom: '2px',
                  background: active ? `${ACCENT}18` : 'transparent',
                  color: active ? '#fff' : MUTED,
                  border: active ? `1px solid ${ACCENT}35` : '1px solid transparent',
                  borderRadius: theme.border.radiusMd,
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: active ? 600 : 400,
                  transition: 'all 0.18s ease',
                  textAlign: 'left',
                  fontFamily: theme.typography.fontFamily,
                  justifyContent: sidebarOpen ? 'flex-start' : 'center',
                  position: 'relative',
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = ELEV;
                    e.currentTarget.style.color = TEXT;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = MUTED;
                  }
                }}
              >
                {active && (
                  <span style={{
                    position: 'absolute',
                    left: 0, top: '20%', bottom: '20%',
                    width: '3px',
                    background: ACCENT,
                    borderRadius: '0 2px 2px 0',
                  }} />
                )}
                <span style={{ color: active ? ACCENT : 'inherit', flexShrink: 0, display: 'flex' }}>
                  {item.icon}
                </span>
                {sidebarOpen && (
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User + Logout */}
        <div style={{ padding: '10px 8px', borderTop: `1px solid ${BORDER}`, flexShrink: 0 }}>
          {sidebarOpen && (
            <button
              onClick={() => setShowPasswordModal(true)}
              title="Cambiar contraseña"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 10px',
                marginBottom: '8px',
                background: ELEV,
                borderRadius: theme.border.radiusMd,
                border: `1px solid ${BORDER}`,
                cursor: 'pointer',
                width: '100%',
                textAlign: 'left',
                fontFamily: theme.typography.fontFamily,
                transition: 'all 0.18s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = `${ACCENT}10`;
                e.currentTarget.style.borderColor = `${ACCENT}30`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = ELEV;
                e.currentTarget.style.borderColor = BORDER;
              }}
            >
              <div style={{
                width: '32px', height: '32px',
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${ACCENT}, ${theme.colors.primary})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Users size={14} color="#fff" />
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: TEXT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.nombres || 'Usuario'}
                </div>
                <div style={{ fontSize: '11px', color: MUTED }}>
                  {user?.cargo || 'Sin cargo'}
                </div>
              </div>
              <KeyRound size={13} color={MUTED} style={{ flexShrink: 0 }} />
            </button>
          )}

          <button
            onClick={handleLogout}
            title={!sidebarOpen ? 'Cerrar Sesión' : undefined}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: sidebarOpen ? 'flex-start' : 'center',
              gap: '10px',
              width: '100%',
              padding: sidebarOpen ? '8px 10px' : '9px',
              background: 'rgba(196,30,58,0.08)',
              color: '#ff6b7a',
              border: '1px solid rgba(196,30,58,0.22)',
              borderRadius: theme.border.radiusMd,
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 500,
              transition: 'all 0.18s ease',
              fontFamily: theme.typography.fontFamily,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(196,30,58,0.22)';
              e.currentTarget.style.borderColor = 'rgba(196,30,58,0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(196,30,58,0.08)';
              e.currentTarget.style.borderColor = 'rgba(196,30,58,0.22)';
            }}
          >
            <LogOut size={16} style={{ flexShrink: 0 }} />
            {sidebarOpen && <span>Cerrar Sesión</span>}
          </button>
        </div>

        {/* Desktop toggle */}
        {!isMobile && (
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              position: 'absolute',
              right: '-11px', top: '50%',
              transform: 'translateY(-50%)',
              width: '22px', height: '22px',
              background: CARD,
              border: `1px solid ${BORDER}`,
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: MUTED,
              zIndex: 20,
              transition: 'all 0.18s ease',
              padding: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = ELEV;
              e.currentTarget.style.color = TEXT;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = CARD;
              e.currentTarget.style.color = MUTED;
            }}
          >
            {sidebarOpen
              ? <ChevronLeft size={12} />
              : <ChevronRight size={12} />
            }
          </button>
        )}
      </aside>

      {/* ── MAIN CONTENT ────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

        {/* Header */}
        <header style={{
          height: '56px',
          background: CARD,
          borderBottom: `1px solid ${BORDER}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: `0 ${theme.spacing.xl}`,
          flexShrink: 0,
          position: 'sticky',
          top: 0,
          zIndex: theme.zIndex.sticky,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.md }}>
            {isMobile && (
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                style={{
                  background: 'none', border: 'none',
                  color: TEXT, cursor: 'pointer',
                  padding: '4px', display: 'flex', alignItems: 'center',
                  borderRadius: theme.border.radiusSmall,
                }}
              >
                <Menu size={20} />
              </button>
            )}
            <h1 style={{
              margin: 0,
              fontSize: isMobile ? '13px' : '15px',
              fontWeight: 600,
              color: TEXT,
              letterSpacing: '-0.01em',
            }}>
              {isMobile ? 'Control Presupuesto' : 'Sistema de Control Presupuestario — UEB'}
            </h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '7px', height: '7px',
              borderRadius: '50%',
              background: theme.colors.state.success,
              boxShadow: `0 0 5px ${theme.colors.state.success}`,
            }} />
            <span style={{ fontSize: '12px', color: MUTED }}>
              {user?.nombres?.split(' ')[0] || 'Usuario'}
            </span>
          </div>
        </header>

        {/* Content */}
        <main style={{ flex: 1, overflow: 'auto', background: BG }}>
          <Outlet />
        </main>
      </div>

      {/* Modal cambiar contraseña */}
      {showPasswordModal && (
        <CambiarContrasenaModal onClose={() => setShowPasswordModal(false)} />
      )}
    </div>
  );
};

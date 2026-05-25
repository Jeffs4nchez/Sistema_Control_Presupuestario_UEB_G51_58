import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, LogOut, TrendingUp, FileText,
  CheckCircle2, Menu, ChevronLeft, ChevronRight, BarChart2, KeyRound,
  Building2, FileDown, Clock, X,
} from 'lucide-react';
import CambiarContrasenaModal from '../components/CambiarContrasenaModal';
import { useFiscalYear } from '../contexts/FiscalYearContext';
import logo from '../assets/logo.png';

const SIDEBAR_W_OPEN     = '264px';
const SIDEBAR_W_COLLAPSED = '64px';

const menuGroups = [
  {
    label: 'Principal',
    items: [
      { label: 'Inicio',                    path: '/dashboard',                                  icon: LayoutDashboard },
    ],
  },
  {
    label: 'Presupuesto',
    items: [
      { label: 'Estructura Presupuestaria', path: '/dashboard/estructura-presupuestaria',         icon: FileText },
      { label: 'Cédula Presupuestaria',     path: '/dashboard/cedula-presupuestaria',             icon: CheckCircle2 },
    ],
  },
  {
    label: 'Operaciones',
    items: [
      { label: 'Certificación',             path: '/dashboard/certificacion',                    icon: TrendingUp },
      { label: 'Liquidaciones',             path: '/dashboard/liquidaciones',                    icon: BarChart2 },
      { label: 'Entidad Requirente',        path: '/dashboard/entidad-requirente',               icon: Building2 },
    ],
  },
  {
    label: 'Administración',
    items: [
      { label: 'Gestión de Usuarios',       path: '/dashboard/usuarios',                         icon: Users },
      { label: 'Reportes',                  path: '/dashboard/reportes',                         icon: FileDown },
      { label: 'Auditoría',                 path: '/dashboard/auditoria',                        icon: Clock },
    ],
  },
];

export const Dashboard = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user, logout, token } = useAuth();
  const { cedulas, selectedCedula, isReadOnly, changeCedula } = useFiscalYear();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  useEffect(() => {
    if (!token) navigate('/login');
  }, [token, navigate]);

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

  const isActive = (path) =>
    path === '/dashboard'
      ? location.pathname === '/dashboard'
      : location.pathname === path || location.pathname.startsWith(path + '/');

  const SW = isMobile ? '0px' : sidebarOpen ? SIDEBAR_W_OPEN : SIDEBAR_W_COLLAPSED;
  const sidebarVisible = !isMobile || sidebarOpen;

  const pageTitle = (() => {
    const allItems = menuGroups.flatMap(g => g.items);
    const found = allItems.find(i => isActive(i.path));
    return found?.label || 'Control Presupuestario';
  })();

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      background: 'var(--page-bg)',
      fontFamily: 'var(--font-primary)',
      overflow: 'hidden',
    }}>

      {/* ── Floating background shapes ────────────────────────────── */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: '8%', right: '12%',
          width: '320px', height: '320px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(84,179,224,0.07), transparent 70%)',
          animation: 'floatShapeSlow 12s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', bottom: '15%', left: '30%',
          width: '240px', height: '240px', borderRadius: '40px',
          background: 'radial-gradient(circle, rgba(46,108,164,0.05), transparent 70%)',
          animation: 'floatShape 9s ease-in-out infinite',
          transform: 'rotate(20deg)',
        }} />
        <div style={{
          position: 'absolute', top: '45%', right: '5%',
          width: '180px', height: '180px', borderRadius: '30px',
          background: 'radial-gradient(circle, rgba(26,58,92,0.04), transparent 70%)',
          animation: 'floatShapeSlow 15s ease-in-out infinite reverse',
          transform: 'rotate(-15deg)',
        }} />
      </div>

      {/* ── Mobile overlay ────────────────────────────────────────── */}
      <AnimatePresence>
        {isMobile && sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(10, 25, 47, 0.55)',
              backdropFilter: 'blur(4px)',
              zIndex: 90,
            }}
          />
        )}
      </AnimatePresence>

      {/* ── SIDEBAR ────────────────────────────────────────────────── */}
      <motion.aside
        initial={false}
        animate={{
          width: sidebarVisible ? (sidebarOpen ? 264 : 64) : 0,
          minWidth: sidebarVisible ? (sidebarOpen ? 264 : 64) : 0,
        }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        style={{
          background: 'linear-gradient(180deg, #0a1929 0%, #1a3a5c 100%)',
          borderRight: '1px solid rgba(84,179,224,0.10)',
          display: 'flex',
          flexDirection: 'column',
          position: isMobile ? 'fixed' : 'relative',
          left: 0, top: 0,
          height: '100vh',
          zIndex: isMobile ? 100 : 10,
          overflow: 'hidden',
          boxShadow: isMobile && sidebarOpen ? '4px 0 40px rgba(0,0,0,0.35)' : 'none',
          flexShrink: 0,
        }}
      >
        {/* Logo area */}
        <div style={{
          padding: sidebarOpen ? '20px 20px 16px' : '16px 12px',
          borderBottom: '1px solid rgba(84,179,224,0.10)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: sidebarOpen ? 'space-between' : 'center',
          minHeight: '72px',
          flexShrink: 0,
        }}>
          <AnimatePresence mode="wait">
            {sidebarOpen ? (
              <motion.div
                key="logo-full"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
              >
                <img src={logo} alt="UEB" style={{ width: '36px', height: '36px', objectFit: 'contain' }} />
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#fff', letterSpacing: '0.02em', lineHeight: 1.2 }}>
                    UEB
                  </div>
                  <div style={{ fontSize: '9px', color: 'rgba(84,179,224,0.8)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                    Control Presupuestario
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.img
                key="logo-icon"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                src={logo} alt="UEB"
                style={{ width: '32px', height: '32px', objectFit: 'contain' }}
              />
            )}
          </AnimatePresence>

          {isMobile && sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(false)}
              style={{
                background: 'rgba(255,255,255,0.08)', border: 'none',
                color: 'rgba(255,255,255,0.7)', cursor: 'pointer',
                width: '28px', height: '28px', borderRadius: '6px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, padding: '8px', overflowY: 'auto', overflowX: 'hidden' }}>
          {menuGroups.map((group, gi) => (
            <div key={gi} style={{ marginBottom: '4px' }}>
              {sidebarOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: gi * 0.05 }}
                  style={{
                    padding: '10px 10px 5px',
                    fontSize: '9.5px',
                    fontWeight: 700,
                    letterSpacing: '0.10em',
                    textTransform: 'uppercase',
                    color: 'rgba(84,179,224,0.5)',
                  }}
                >
                  {group.label}
                </motion.div>
              )}

              {group.items.map((item, ii) => {
                const active = isActive(item.path);
                const Icon = item.icon;
                return (
                  <motion.button
                    key={item.path}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (gi * 0.06) + (ii * 0.04), type: 'spring', stiffness: 140, damping: 18 }}
                    whileHover={{ x: active ? 0 : 3 }}
                    onClick={() => { navigate(item.path); if (isMobile) setSidebarOpen(false); }}
                    title={!sidebarOpen ? item.label : undefined}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      width: '100%',
                      padding: sidebarOpen ? '8px 10px' : '9px',
                      marginBottom: '2px',
                      background: active ? 'rgba(84,179,224,0.14)' : 'transparent',
                      color: active ? '#fff' : 'rgba(255,255,255,0.55)',
                      border: 'none',
                      borderLeft: `3px solid ${active ? '#54b3e0' : 'transparent'}`,
                      borderRadius: '0 8px 8px 0',
                      cursor: 'pointer',
                      fontSize: '12.5px',
                      fontWeight: active ? 700 : 400,
                      fontFamily: 'var(--font-primary)',
                      textAlign: 'left',
                      justifyContent: sidebarOpen ? 'flex-start' : 'center',
                      boxShadow: active ? '0 0 18px rgba(84,179,224,0.18), inset 2px 0 12px rgba(84,179,224,0.06)' : 'none',
                      transition: 'all 0.18s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (!active) {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                        e.currentTarget.style.color = 'rgba(255,255,255,0.85)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!active) {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = 'rgba(255,255,255,0.55)';
                      }
                    }}
                  >
                    <span style={{
                      color: active ? '#54b3e0' : 'inherit',
                      flexShrink: 0,
                      display: 'flex',
                      filter: active ? 'drop-shadow(0 0 6px rgba(84,179,224,0.6))' : 'none',
                    }}>
                      <Icon size={16} />
                    </span>
                    {sidebarOpen && (
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.3 }}>
                        {item.label}
                      </span>
                    )}
                    {active && sidebarOpen && (
                      <motion.div
                        layoutId="active-pill"
                        style={{
                          marginLeft: 'auto',
                          width: '6px', height: '6px',
                          borderRadius: '50%',
                          background: '#54b3e0',
                          boxShadow: '0 0 8px rgba(84,179,224,0.8)',
                          flexShrink: 0,
                        }}
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* User + Logout */}
        <div style={{ padding: '8px', borderTop: '1px solid rgba(84,179,224,0.10)', flexShrink: 0 }}>
          {sidebarOpen && (
            <motion.button
              whileHover={{ scale: 1.01 }}
              onClick={() => setShowPasswordModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 12px',
                marginBottom: '6px',
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '10px',
                border: '1px solid rgba(84,179,224,0.12)',
                cursor: 'pointer',
                width: '100%',
                textAlign: 'left',
                fontFamily: 'var(--font-primary)',
                transition: 'all 0.18s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(84,179,224,0.08)';
                e.currentTarget.style.borderColor = 'rgba(84,179,224,0.25)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                e.currentTarget.style.borderColor = 'rgba(84,179,224,0.12)';
              }}
            >
              <div style={{
                width: '34px', height: '34px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #2e6ca4, #54b3e0)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 4px 12px rgba(46,108,164,0.4)',
              }}>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#fff' }}>
                  {(user?.nombres || 'U')[0].toUpperCase()}
                </span>
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.nombres || 'Usuario'}
                </div>
                <div style={{ fontSize: '10px', color: 'rgba(84,179,224,0.75)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.cargo || 'Sin cargo'}
                </div>
              </div>
              <KeyRound size={12} color="rgba(84,179,224,0.6)" style={{ flexShrink: 0 }} />
            </motion.button>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            title={!sidebarOpen ? 'Cerrar Sesión' : undefined}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: sidebarOpen ? 'flex-start' : 'center',
              gap: '8px',
              width: '100%',
              padding: sidebarOpen ? '8px 12px' : '9px',
              background: 'rgba(139,15,15,0.12)',
              color: '#fca5a5',
              border: '1px solid rgba(139,15,15,0.25)',
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: '12.5px',
              fontWeight: 600,
              fontFamily: 'var(--font-primary)',
              transition: 'all 0.18s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(139,15,15,0.25)';
              e.currentTarget.style.borderColor = 'rgba(139,15,15,0.45)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(139,15,15,0.12)';
              e.currentTarget.style.borderColor = 'rgba(139,15,15,0.25)';
            }}
          >
            <LogOut size={15} style={{ flexShrink: 0 }} />
            {sidebarOpen && <span>Cerrar Sesión</span>}
          </motion.button>
        </div>

        {/* Desktop collapse toggle */}
        {!isMobile && (
          <motion.button
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              position: 'absolute',
              right: '-13px', top: '50%',
              transform: 'translateY(-50%)',
              width: '26px', height: '26px',
              background: '#1a3a5c',
              border: '2px solid rgba(84,179,224,0.25)',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'rgba(84,179,224,0.9)',
              zIndex: 20,
              transition: 'all 0.18s ease',
              boxShadow: '0 2px 12px rgba(0,0,0,0.25)',
              padding: 0,
            }}
          >
            {sidebarOpen ? <ChevronLeft size={13} /> : <ChevronRight size={13} />}
          </motion.button>
        )}
      </motion.aside>

      {/* ── MAIN AREA ──────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0, position: 'relative', zIndex: 1 }}>

        {/* Floating Header */}
        <motion.header
          initial={{ y: -64, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          style={{
            height: '60px',
            background: 'rgba(240,244,248,0.92)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(26,58,92,0.08)',
            boxShadow: '0 2px 20px rgba(26,58,92,0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px',
            flexShrink: 0,
            position: 'sticky',
            top: 0,
            zIndex: 50,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {isMobile && (
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                style={{
                  background: 'rgba(46,108,164,0.10)',
                  border: '1px solid rgba(46,108,164,0.20)',
                  color: 'var(--ueb-blue)',
                  cursor: 'pointer',
                  padding: '6px',
                  display: 'flex', alignItems: 'center',
                  borderRadius: '8px',
                  transition: 'all 0.18s ease',
                }}
              >
                <Menu size={18} />
              </button>
            )}

            {/* Breadcrumb / Page Title */}
            <div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                UEB — Control Presupuestario
              </div>
              <h1 style={{
                margin: 0,
                fontSize: isMobile ? '14px' : '16px',
                fontWeight: 700,
                color: 'var(--text-heading)',
                letterSpacing: '-0.01em',
                lineHeight: 1.2,
              }}>
                {pageTitle}
              </h1>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>

            {/* ── Selector de Año Fiscal ── */}
            {cedulas.length > 0 && selectedCedula && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {isReadOnly && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '4px',
                    background: 'rgba(217,119,6,0.10)',
                    border: '1px solid rgba(217,119,6,0.30)',
                    borderRadius: '6px',
                    padding: '3px 8px',
                    fontSize: '11px', fontWeight: 700, color: '#d97706',
                  }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    Solo lectura
                  </div>
                )}
                <select
                  value={selectedCedula.id_cedula_presupuestaria}
                  onChange={e => {
                    const ced = cedulas.find(c => String(c.id_cedula_presupuestaria) === e.target.value)
                    if (ced) changeCedula(ced)
                  }}
                  style={{
                    padding: '5px 10px',
                    fontSize: '12px', fontWeight: 700,
                    color: isReadOnly ? '#d97706' : 'var(--text-heading)',
                    background: isReadOnly ? 'rgba(217,119,6,0.06)' : 'rgba(46,108,164,0.07)',
                    border: `1px solid ${isReadOnly ? 'rgba(217,119,6,0.30)' : 'rgba(46,108,164,0.20)'}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-primary)',
                    outline: 'none',
                  }}
                >
                  {cedulas.map(c => (
                    <option key={c.id_cedula_presupuestaria} value={c.id_cedula_presupuestaria}>
                      Año {c.anio}{c.anio === new Date().getFullYear() ? ' (activo)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Status indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <motion.div
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{
                  width: '8px', height: '8px',
                  borderRadius: '50%',
                  background: '#059669',
                  boxShadow: '0 0 8px rgba(5,150,105,0.6)',
                }}
              />
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>
                {user?.nombres?.split(' ')[0] || 'Usuario'}
              </span>
            </div>

            {/* User avatar */}
            <div style={{
              width: '32px', height: '32px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #1a3a5c, #2e6ca4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '12px', fontWeight: 800, color: '#fff',
              cursor: 'pointer',
              boxShadow: '0 2px 10px rgba(26,58,92,0.25)',
            }}
              onClick={() => setShowPasswordModal(true)}
              title="Cambiar contraseña"
            >
              {(user?.nombres || 'U')[0].toUpperCase()}
            </div>
          </div>
        </motion.header>

        {/* Content Area */}
        <main style={{
          flex: 1,
          overflow: 'auto',
          background: 'var(--page-bg)',
          position: 'relative',
        }}>
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            style={{ minHeight: '100%' }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>

      {/* Password Modal */}
      <AnimatePresence>
        {showPasswordModal && (
          <CambiarContrasenaModal onClose={() => setShowPasswordModal(false)} />
        )}
      </AnimatePresence>
    </div>
  );
};

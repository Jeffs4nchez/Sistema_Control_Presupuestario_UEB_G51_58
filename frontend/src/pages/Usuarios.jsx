import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { theme } from '../config/theme';
import axios from 'axios';
import { Edit2, Trash2, UserPlus, Users, UserCheck, UserX } from 'lucide-react';

const BG     = theme.colors.dark['900'];
const CARD   = theme.colors.dark['800'];
const BORDER = theme.colors.dark['700'];
const ELEV   = theme.colors.dark['600'];
const HOVER  = theme.colors.dark['500'];
const ACCENT = theme.colors.accent.blue;
const TEXT   = 'rgba(255,255,255,0.88)';
const MUTED  = 'rgba(255,255,255,0.45)';

const INPUT_STYLE = {
  width: '100%',
  padding: '9px 12px',
  background: ELEV,
  border: `1px solid ${BORDER}`,
  borderRadius: theme.border.radiusMd,
  color: TEXT,
  fontSize: '13px',
  fontFamily: theme.typography.fontFamily,
  outline: 'none',
  boxSizing: 'border-box',
};

const LABEL_STYLE = {
  display: 'block',
  fontSize: '12px',
  fontWeight: 600,
  color: MUTED,
  marginBottom: '6px',
  fontFamily: theme.typography.fontFamily,
};

const CARGOS = [
  'Director(a) financiera',
  'Analista de presupuesto',
  'Director(a) de talento humano',
  'Rector',
];

const FormField = ({ label, children }) => (
  <div style={{ marginBottom: '14px' }}>
    <label style={LABEL_STYLE}>{label}</label>
    {children}
  </div>
);

export const Usuarios = () => {
  const { token } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [filtroNombre, setFiltroNombre] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [globalMsg, setGlobalMsg] = useState({ text: '', type: '' });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog,   setShowEditDialog]   = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [usuarioAEditar,   setUsuarioAEditar]   = useState(null);
  const [usuarioAEliminar, setUsuarioAEliminar] = useState(null);
  const [dialogMsg, setDialogMsg] = useState({ text: '', type: '' });

  const [formData, setFormData] = useState({
    nombres: '', apellidos: '', correo_institucional: '',
    contrasena: '', cargo: '', estado: 'activo',
  });

  useEffect(() => { cargarUsuarios(); }, []);

  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);

  const cargarUsuarios = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/usuarios`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.status === 'success') setUsuarios(res.data.data);
    } catch (err) {
      setGlobalMsg({ text: 'Error al cargar usuarios: ' + (err.response?.data?.message || err.message), type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAbrirCrear = () => {
    setFormData({ nombres: '', apellidos: '', correo_institucional: '', contrasena: '', cargo: '', estado: 'activo' });
    setUsuarioAEditar(null);
    setDialogMsg({ text: '', type: '' });
    setShowCreateDialog(true);
  };

  const handleAbrirEditar = (u) => {
    setFormData({ nombres: u.nombres, apellidos: u.apellidos, correo_institucional: u.correo_institucional, contrasena: '', cargo: u.cargo, estado: u.estado });
    setUsuarioAEditar(u);
    setDialogMsg({ text: '', type: '' });
    setShowEditDialog(true);
  };

  const handleAbrirEliminar = (u) => { setUsuarioAEliminar(u); setShowDeleteDialog(true); };

  const handleCrearUsuario = async () => {
    if (!formData.nombres || !formData.apellidos || !formData.correo_institucional || !formData.contrasena || !formData.cargo) {
      setDialogMsg({ text: 'Todos los campos son requeridos', type: 'error' }); return;
    }
    try {
      setIsLoading(true);
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/usuarios`, formData, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.status === 'success') {
        setDialogMsg({ text: 'Usuario creado exitosamente', type: 'success' });
        setTimeout(() => { setShowCreateDialog(false); setDialogMsg({ text: '', type: '' }); cargarUsuarios(); }, 1400);
      }
    } catch (err) {
      const msg = err.response?.data?.errors ? Object.values(err.response.data.errors).flat().join(', ') : err.response?.data?.message || err.message;
      setDialogMsg({ text: msg, type: 'error' });
    } finally { setIsLoading(false); }
  };

  const handleActualizarUsuario = async () => {
    if (!formData.nombres || !formData.apellidos || !formData.correo_institucional || !formData.cargo) {
      setDialogMsg({ text: 'Nombre, apellido, correo y cargo son requeridos', type: 'error' }); return;
    }
    try {
      setIsLoading(true);
      const datos = { ...formData };
      if (!datos.contrasena) delete datos.contrasena;
      const res = await axios.put(`${import.meta.env.VITE_API_URL}/usuarios/${usuarioAEditar.id_usuario}`, datos, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.status === 'success') {
        setDialogMsg({ text: 'Usuario actualizado exitosamente', type: 'success' });
        setTimeout(() => { setShowEditDialog(false); setDialogMsg({ text: '', type: '' }); cargarUsuarios(); }, 1400);
      }
    } catch (err) {
      const msg = err.response?.data?.errors ? Object.values(err.response.data.errors).flat().join(', ') : err.response?.data?.message || err.message;
      setDialogMsg({ text: msg, type: 'error' });
    } finally { setIsLoading(false); }
  };

  const handleEliminarUsuario = async () => {
    try {
      setIsLoading(true);
      const res = await axios.delete(`${import.meta.env.VITE_API_URL}/usuarios/${usuarioAEliminar.id_usuario}`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.status === 'success') {
        setGlobalMsg({ text: 'Usuario eliminado exitosamente', type: 'success' });
        setShowDeleteDialog(false);
        cargarUsuarios();
        setTimeout(() => setGlobalMsg({ text: '', type: '' }), 3000);
      }
    } catch (err) {
      setGlobalMsg({ text: err.response?.data?.message || err.message, type: 'error' });
    } finally { setIsLoading(false); }
  };

  const usuariosFiltrados = usuarios.filter(u =>
    u.nombres.toLowerCase().includes(filtroNombre.toLowerCase()) ||
    u.apellidos.toLowerCase().includes(filtroNombre.toLowerCase()) ||
    u.correo_institucional.toLowerCase().includes(filtroNombre.toLowerCase())
  );

  const totalUsuarios = usuarios.length;
  const activos       = usuarios.filter(u => u.estado === 'activo').length;
  const inactivos     = usuarios.filter(u => u.estado === 'inactivo').length;

  const msgBg   = (t) => t === 'error' ? 'rgba(196,30,58,0.12)' : 'rgba(16,185,129,0.12)';
  const msgClr  = (t) => t === 'error' ? '#ff6b7a' : '#34d399';
  const msgBdr  = (t) => t === 'error' ? 'rgba(196,30,58,0.35)' : 'rgba(16,185,129,0.35)';

  const P = isMobile ? '20px' : '28px';

  return (
    <div style={{ background: BG, minHeight: '100%', padding: P, fontFamily: theme.typography.fontFamily }}>

      {/* Page header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: '0 0 4px', fontSize: isMobile ? '20px' : '22px', fontWeight: 700, color: TEXT, letterSpacing: '-0.02em' }}>
          Gestión de Usuarios
        </h1>
        <p style={{ margin: 0, fontSize: '13px', color: MUTED }}>Administra los usuarios del sistema</p>
      </div>

      {/* Global message */}
      {globalMsg.text && (
        <div style={{
          padding: '10px 14px', marginBottom: '16px',
          background: msgBg(globalMsg.type), border: `1px solid ${msgBdr(globalMsg.type)}`,
          borderRadius: theme.border.radiusMd, color: msgClr(globalMsg.type),
          fontSize: '13px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span>{globalMsg.text}</span>
          <button onClick={() => setGlobalMsg({ text: '', type: '' })} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '16px', lineHeight: 1, padding: '0 0 0 12px' }}>✕</button>
        </div>
      )}

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
        gap: '10px',
        marginBottom: '20px',
      }}>
        {[
          { label: 'Total Usuarios', value: totalUsuarios, icon: <Users size={18} />, color: ACCENT },
          { label: 'Activos', value: activos, icon: <UserCheck size={18} />, color: theme.colors.accent.green },
          { label: 'Inactivos', value: inactivos, icon: <UserX size={18} />, color: theme.colors.accent.red },
        ].map((s, i) => (
          <div key={i} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: theme.border.radiusMd, padding: '16px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ color: s.color, display: 'flex' }}>{s.icon}</span>
              <span style={{ fontSize: '11px', fontWeight: 600, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</span>
            </div>
            <p style={{ margin: 0, fontSize: '26px', fontWeight: 700, color: TEXT, letterSpacing: '-0.02em' }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{
        display: 'flex',
        gap: '10px',
        flexDirection: isMobile ? 'column' : 'row',
        marginBottom: '16px',
      }}>
        <input
          type="text"
          placeholder="Buscar por nombre, apellido o correo..."
          value={filtroNombre}
          onChange={(e) => setFiltroNombre(e.target.value)}
          style={{ ...INPUT_STYLE, flex: 1 }}
        />
        <button
          onClick={handleAbrirCrear}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '9px 18px',
            background: ACCENT,
            color: '#fff',
            border: 'none',
            borderRadius: theme.border.radiusMd,
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 600,
            whiteSpace: 'nowrap',
            fontFamily: theme.typography.fontFamily,
            transition: 'all 0.18s ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#1e90d4'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = ACCENT; }}
        >
          <UserPlus size={16} />
          Crear Usuario
        </button>
      </div>

      {/* Table */}
      <div style={{
        background: CARD,
        border: `1px solid ${BORDER}`,
        borderRadius: theme.border.radiusMd,
        overflow: 'hidden',
      }}>
        {isLoading && usuariosFiltrados.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: MUTED, fontSize: '13px' }}>
            Cargando usuarios...
          </div>
        ) : usuariosFiltrados.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: MUTED, fontSize: '13px' }}>
            No hay usuarios que coincidan con la búsqueda
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '540px' }}>
              <thead>
                <tr style={{ background: ELEV, borderBottom: `1px solid ${BORDER}` }}>
                  {['Nombre', 'Correo', 'Cargo', 'Estado', 'Acciones'].map((h, i) => (
                    <th key={i} style={{
                      padding: '11px 14px',
                      textAlign: i === 4 ? 'center' : 'left',
                      fontSize: '11px',
                      fontWeight: 700,
                      color: MUTED,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      whiteSpace: 'nowrap',
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {usuariosFiltrados.map((u) => (
                  <tr
                    key={u.id_usuario}
                    style={{ borderBottom: `1px solid ${BORDER}`, transition: 'background 0.15s ease' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = ELEV; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    <td style={{ padding: '12px 14px', fontSize: '13px', fontWeight: 600, color: TEXT }}>
                      {u.nombres} {u.apellidos}
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: '13px', color: MUTED }}>
                      {u.correo_institucional}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '3px 9px',
                        background: `${ACCENT}18`,
                        border: `1px solid ${ACCENT}35`,
                        borderRadius: theme.border.radiusFull,
                        fontSize: '11px',
                        fontWeight: 600,
                        color: ACCENT,
                        whiteSpace: 'nowrap',
                      }}>
                        {u.cargo}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '3px 9px',
                        background: u.estado === 'activo' ? 'rgba(16,185,129,0.12)' : 'rgba(196,30,58,0.12)',
                        border: u.estado === 'activo' ? '1px solid rgba(16,185,129,0.35)' : '1px solid rgba(196,30,58,0.35)',
                        borderRadius: theme.border.radiusFull,
                        fontSize: '11px',
                        fontWeight: 700,
                        color: u.estado === 'activo' ? '#34d399' : '#ff6b7a',
                      }}>
                        {u.estado === 'activo' ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                        <button
                          onClick={() => handleAbrirEditar(u)}
                          title="Editar"
                          style={{
                            width: '30px', height: '30px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: `${ACCENT}18`, border: `1px solid ${ACCENT}35`,
                            borderRadius: theme.border.radiusMd,
                            color: ACCENT, cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = `${ACCENT}30`; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = `${ACCENT}18`; }}
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleAbrirEliminar(u)}
                          title="Eliminar"
                          style={{
                            width: '30px', height: '30px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: 'rgba(196,30,58,0.12)', border: '1px solid rgba(196,30,58,0.3)',
                            borderRadius: theme.border.radiusMd,
                            color: '#ff6b7a', cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(196,30,58,0.25)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(196,30,58,0.12)'; }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Modal: Crear ──────────────────────────────────────────── */}
      {showCreateDialog && (
        <Modal title="Crear Nuevo Usuario" onClose={() => setShowCreateDialog(false)} isMobile={isMobile}>
          <DialogMsg msg={dialogMsg} onClose={() => setDialogMsg({ text: '', type: '' })} />
          <FormField label="Nombres">
            <input type="text" value={formData.nombres} onChange={(e) => setFormData({ ...formData, nombres: e.target.value })} style={INPUT_STYLE} />
          </FormField>
          <FormField label="Apellidos">
            <input type="text" value={formData.apellidos} onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })} style={INPUT_STYLE} />
          </FormField>
          <FormField label="Correo Institucional">
            <input type="email" value={formData.correo_institucional} onChange={(e) => setFormData({ ...formData, correo_institucional: e.target.value })} style={INPUT_STYLE} />
          </FormField>
          <FormField label="Contraseña">
            <input type="password" value={formData.contrasena} onChange={(e) => setFormData({ ...formData, contrasena: e.target.value })} style={INPUT_STYLE} />
          </FormField>
          <FormField label="Cargo">
            <select value={formData.cargo} onChange={(e) => setFormData({ ...formData, cargo: e.target.value })} style={{ ...INPUT_STYLE }}>
              <option value="">Seleccionar cargo</option>
              {CARGOS.map(c => <option key={c} value={c} style={{ background: CARD }}>{c}</option>)}
            </select>
          </FormField>
          <FormField label="Estado">
            <select value={formData.estado} onChange={(e) => setFormData({ ...formData, estado: e.target.value })} style={{ ...INPUT_STYLE }}>
              <option value="activo" style={{ background: CARD }}>Activo</option>
              <option value="inactivo" style={{ background: CARD }}>Inactivo</option>
            </select>
          </FormField>
          <ModalActions
            onCancel={() => setShowCreateDialog(false)}
            onConfirm={handleCrearUsuario}
            confirmLabel={isLoading ? 'Creando...' : 'Crear Usuario'}
            disabled={isLoading}
          />
        </Modal>
      )}

      {/* ── Modal: Editar ─────────────────────────────────────────── */}
      {showEditDialog && usuarioAEditar && (
        <Modal title="Editar Usuario" onClose={() => setShowEditDialog(false)} isMobile={isMobile}>
          <DialogMsg msg={dialogMsg} onClose={() => setDialogMsg({ text: '', type: '' })} />
          <FormField label="Nombres">
            <input type="text" value={formData.nombres} onChange={(e) => setFormData({ ...formData, nombres: e.target.value })} style={INPUT_STYLE} />
          </FormField>
          <FormField label="Apellidos">
            <input type="text" value={formData.apellidos} onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })} style={INPUT_STYLE} />
          </FormField>
          <FormField label="Correo Institucional">
            <input type="email" value={formData.correo_institucional} onChange={(e) => setFormData({ ...formData, correo_institucional: e.target.value })} style={INPUT_STYLE} />
          </FormField>
          <FormField label="Contraseña (dejar vacío para no cambiar)">
            <input type="password" value={formData.contrasena} onChange={(e) => setFormData({ ...formData, contrasena: e.target.value })} style={INPUT_STYLE} />
          </FormField>
          <FormField label="Cargo">
            <select value={formData.cargo} onChange={(e) => setFormData({ ...formData, cargo: e.target.value })} style={{ ...INPUT_STYLE }}>
              <option value="">Seleccionar cargo</option>
              {CARGOS.map(c => <option key={c} value={c} style={{ background: CARD }}>{c}</option>)}
            </select>
          </FormField>
          <FormField label="Estado">
            <select value={formData.estado} onChange={(e) => setFormData({ ...formData, estado: e.target.value })} style={{ ...INPUT_STYLE }}>
              <option value="activo" style={{ background: CARD }}>Activo</option>
              <option value="inactivo" style={{ background: CARD }}>Inactivo</option>
            </select>
          </FormField>
          <ModalActions
            onCancel={() => setShowEditDialog(false)}
            onConfirm={handleActualizarUsuario}
            confirmLabel={isLoading ? 'Guardando...' : 'Guardar Cambios'}
            disabled={isLoading}
          />
        </Modal>
      )}

      {/* ── Modal: Eliminar ───────────────────────────────────────── */}
      {showDeleteDialog && usuarioAEliminar && (
        <Modal title="Confirmar Eliminación" onClose={() => setShowDeleteDialog(false)} isMobile={isMobile} small>
          <p style={{ color: MUTED, fontSize: '13px', marginBottom: '20px', lineHeight: 1.6 }}>
            ¿Estás seguro de que deseas eliminar a{' '}
            <strong style={{ color: TEXT }}>{usuarioAEliminar.nombres} {usuarioAEliminar.apellidos}</strong>?
            {' '}Esta acción no se puede deshacer.
          </p>
          <ModalActions
            onCancel={() => setShowDeleteDialog(false)}
            onConfirm={handleEliminarUsuario}
            confirmLabel={isLoading ? 'Eliminando...' : 'Eliminar'}
            disabled={isLoading}
            danger
          />
        </Modal>
      )}
    </div>
  );
};

/* ── Sub-components ──────────────────────────────────────────────── */

function Modal({ title, onClose, isMobile, small, children }) {
  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.65)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: '16px',
    }}>
      <div style={{
        background: CARD,
        border: `1px solid ${BORDER}`,
        borderRadius: theme.border.radiusMd,
        padding: isMobile ? '20px' : '24px',
        width: '100%',
        maxWidth: small ? '400px' : '480px',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: theme.shadow.lg,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: TEXT }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: MUTED, cursor: 'pointer', fontSize: '18px', lineHeight: 1, padding: '2px 4px', borderRadius: '4px' }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function DialogMsg({ msg, onClose }) {
  if (!msg.text) return null;
  const isErr = msg.type === 'error';
  return (
    <div style={{
      padding: '9px 12px', marginBottom: '14px',
      background: isErr ? 'rgba(196,30,58,0.12)' : 'rgba(16,185,129,0.12)',
      border: `1px solid ${isErr ? 'rgba(196,30,58,0.35)' : 'rgba(16,185,129,0.35)'}`,
      borderRadius: theme.border.radiusMd,
      color: isErr ? '#ff6b7a' : '#34d399',
      fontSize: '13px',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    }}>
      <span>{msg.text}</span>
      <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '15px', padding: '0 0 0 10px' }}>✕</button>
    </div>
  );
}

function ModalActions({ onCancel, onConfirm, confirmLabel, disabled, danger }) {
  return (
    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '4px' }}>
      <button
        onClick={onCancel}
        style={{
          padding: '8px 16px', background: 'transparent',
          border: `1px solid ${BORDER}`, borderRadius: theme.border.radiusMd,
          color: MUTED, cursor: 'pointer', fontSize: '13px', fontWeight: 500,
          fontFamily: theme.typography.fontFamily,
          transition: 'all 0.15s ease',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = ELEV; e.currentTarget.style.color = TEXT; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = MUTED; }}
      >
        Cancelar
      </button>
      <button
        onClick={onConfirm}
        disabled={disabled}
        style={{
          padding: '8px 18px',
          background: danger ? theme.colors.accent.red : ACCENT,
          border: 'none',
          borderRadius: theme.border.radiusMd,
          color: '#fff',
          cursor: disabled ? 'not-allowed' : 'pointer',
          fontSize: '13px',
          fontWeight: 600,
          opacity: disabled ? 0.6 : 1,
          fontFamily: theme.typography.fontFamily,
          transition: 'all 0.15s ease',
        }}
      >
        {confirmLabel}
      </button>
    </div>
  );
}

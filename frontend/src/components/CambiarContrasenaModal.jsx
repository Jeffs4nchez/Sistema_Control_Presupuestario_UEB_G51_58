import { useState } from 'react'
import Cookies from 'js-cookie'
import { useAuth } from '../contexts/AuthContext'
import { theme } from '../config/theme'
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, ShieldCheck, X } from 'lucide-react'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

const CARD   = theme.colors.dark['800']
const BORDER = theme.colors.dark['700']
const ELEV   = theme.colors.dark['600']
const ACCENT = theme.colors.accent.blue
const GREEN  = theme.colors.accent.green
const RED    = '#ff6b7a'
const GOLD   = theme.colors.accent.gold
const TEXT   = 'rgba(255,255,255,0.88)'
const MUTED  = 'rgba(255,255,255,0.45)'

function PasswordField({ label, value, onChange, placeholder }) {
  const [show, setShow] = useState(false)
  return (
    <div style={{ marginBottom: '14px' }}>
      <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: MUTED, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <Lock size={13} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: MUTED, pointerEvents: 'none' }} />
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required
          style={{
            width: '100%', padding: '9px 36px 9px 32px',
            background: ELEV, border: `1px solid ${BORDER}`,
            borderRadius: theme.border.radiusMd, color: TEXT,
            fontSize: '13px', fontFamily: theme.typography.fontFamily,
            outline: 'none', boxSizing: 'border-box',
          }}
        />
        <button
          type="button"
          onClick={() => setShow(s => !s)}
          style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: MUTED, cursor: 'pointer', padding: 0, display: 'flex' }}
        >
          {show ? <EyeOff size={13} /> : <Eye size={13} />}
        </button>
      </div>
    </div>
  )
}

export default function CambiarContrasenaModal({ onClose }) {
  const { user, updateUser } = useAuth()
  const esObligatoria = !!user?.contrasena_temporal

  const [form, setForm]   = useState({ actual: '', nueva: '', confirmar: '' })
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState('')
  const [ok,     setOk]     = useState(false)

  const set = (key) => (e) => { setForm(f => ({ ...f, [key]: e.target.value })); setError('') }

  const nuevaOk  = form.nueva.length >= 8
  const coincide = form.nueva === form.confirmar && form.confirmar.length > 0
  const puedeEnviar = form.actual && nuevaOk && coincide

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!puedeEnviar) return
    setSaving(true)
    setError('')
    try {
      const token = Cookies.get('auth_token')
      const res = await fetch(`${API}/change-password`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contrasena_actual:    form.actual,
          nueva_contrasena:     form.nueva,
          confirmar_contrasena: form.confirmar,
        }),
      })
      const json = await res.json()
      if (json.status === 'success') {
        setOk(true)
        updateUser({ contrasena_temporal: false })
        setTimeout(() => onClose(), 1500)
      } else {
        setError(json.message || 'Error al cambiar la contraseña.')
      }
    } catch {
      setError('Error de conexión.')
    } finally {
      setSaving(false)
    }
  }

  return (
    // Overlay
    <div
      onClick={esObligatoria ? undefined : onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(3px)',
        zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
      }}
    >
      {/* Modal */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: CARD, border: `1px solid ${BORDER}`,
          borderRadius: theme.border.radiusMd,
          width: '100%', maxWidth: '420px',
          boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
          fontFamily: theme.typography.fontFamily,
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: `1px solid ${BORDER}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
            <ShieldCheck size={17} color={ACCENT} />
            <span style={{ fontSize: '15px', fontWeight: 700, color: TEXT }}>Cambiar Contraseña</span>
          </div>
          {!esObligatoria && (
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: MUTED, cursor: 'pointer', padding: '2px', display: 'flex', borderRadius: '4px' }}>
              <X size={16} />
            </button>
          )}
        </div>

        <div style={{ padding: '20px' }}>

          {/* Aviso contraseña temporal */}
          {esObligatoria && (
            <div style={{ background: 'rgba(217,119,6,0.10)', border: `1px solid rgba(217,119,6,0.35)`, borderRadius: theme.border.radiusMd, padding: '10px 13px', marginBottom: '16px', display: 'flex', gap: '9px', alignItems: 'flex-start' }}>
              <AlertCircle size={14} color={GOLD} style={{ flexShrink: 0, marginTop: '1px' }} />
              <span style={{ fontSize: '12px', color: 'rgba(251,191,36,0.9)' }}>
                Tu cuenta tiene una contraseña temporal. Debes cambiarla para continuar.
              </span>
            </div>
          )}

          {/* Éxito */}
          {ok && (
            <div style={{ background: 'rgba(16,185,129,0.10)', border: `1px solid rgba(16,185,129,0.3)`, borderRadius: theme.border.radiusMd, padding: '10px 13px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '9px' }}>
              <CheckCircle size={14} color={GREEN} />
              <span style={{ fontSize: '13px', fontWeight: 600, color: GREEN }}>¡Contraseña actualizada correctamente!</span>
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{ background: 'rgba(196,30,58,0.10)', border: `1px solid rgba(196,30,58,0.35)`, borderRadius: theme.border.radiusMd, padding: '10px 13px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={13} color={RED} style={{ flexShrink: 0 }} />
              <span style={{ fontSize: '12px', color: RED }}>{error}</span>
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit}>
            <PasswordField label="Contraseña actual *"    value={form.actual}    onChange={set('actual')}    placeholder="Tu contraseña actual" />
            <PasswordField label="Nueva contraseña *"     value={form.nueva}     onChange={set('nueva')}     placeholder="Mínimo 8 caracteres" />
            <PasswordField label="Confirmar contraseña *" value={form.confirmar} onChange={set('confirmar')} placeholder="Repite la nueva contraseña" />

            {/* Requisitos en tiempo real */}
            {(form.nueva || form.confirmar) && (
              <div style={{ background: ELEV, border: `1px solid ${BORDER}`, borderRadius: theme.border.radiusMd, padding: '9px 12px', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                {[
                  { ok: nuevaOk,  text: 'Mínimo 8 caracteres' },
                  { ok: coincide, text: 'Las contraseñas coinciden' },
                ].map((r, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: r.ok ? GREEN : MUTED }}>
                    <CheckCircle size={11} style={{ opacity: r.ok ? 1 : 0.3 }} />
                    {r.text}
                  </div>
                ))}
              </div>
            )}

            {/* Botones */}
            <div style={{ display: 'flex', gap: '8px' }}>
              {!esObligatoria && (
                <button
                  type="button"
                  onClick={onClose}
                  style={{ flex: 1, padding: '9px', background: ELEV, color: MUTED, border: `1px solid ${BORDER}`, borderRadius: theme.border.radiusMd, cursor: 'pointer', fontSize: '13px', fontWeight: 600, fontFamily: theme.typography.fontFamily }}
                >
                  Cancelar
                </button>
              )}
              <button
                type="submit"
                disabled={saving || !puedeEnviar || ok}
                style={{
                  flex: 2, padding: '9px',
                  background: (saving || !puedeEnviar || ok) ? ELEV : ACCENT,
                  color: (saving || !puedeEnviar || ok) ? MUTED : '#fff',
                  border: 'none', borderRadius: theme.border.radiusMd,
                  cursor: (saving || !puedeEnviar || ok) ? 'default' : 'pointer',
                  fontSize: '13px', fontWeight: 700, fontFamily: theme.typography.fontFamily,
                }}
              >
                {saving ? 'Guardando...' : ok ? 'Contraseña cambiada ✓' : 'Cambiar Contraseña'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

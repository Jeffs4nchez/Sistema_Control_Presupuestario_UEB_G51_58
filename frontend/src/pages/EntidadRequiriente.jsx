import { useState, useEffect, useCallback } from 'react'
import Cookies from 'js-cookie'
import { theme } from '../config/theme'
import { Building2, Plus, Search, RefreshCw, Edit2, Trash2, X, Check } from 'lucide-react'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

const CARD   = theme.colors.dark['800']
const BORDER = theme.colors.dark['700']
const ELEV   = theme.colors.dark['600']
const ACCENT = theme.colors.accent.blue
const RED    = '#ff6b7a'
const TEXT   = 'rgba(255,255,255,0.88)'
const MUTED  = 'rgba(255,255,255,0.45)'

const INPUT_S = {
  padding: '8px 11px',
  background: ELEV,
  border: `1px solid ${BORDER}`,
  borderRadius: theme.border.radiusMd,
  color: TEXT,
  fontSize: '13px',
  fontFamily: theme.typography.fontFamily,
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
}

const LABEL_S = {
  display: 'block',
  fontSize: '11px',
  fontWeight: 700,
  color: MUTED,
  marginBottom: '5px',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
}

const EMPTY_FORM = { nombre_entidad: '', responsable_entidad: '', correo_institucional: '', memorando: '' }

export default function EntidadRequiriente() {
  const [entidades,    setEntidades]   = useState([])
  const [loading,      setLoading]     = useState(false)
  const [search,       setSearch]      = useState('')

  // Modal crear/editar
  const [modal,        setModal]       = useState({ open: false, mode: 'create', id: null })
  const [form,         setForm]        = useState(EMPTY_FORM)
  const [saving,       setSaving]      = useState(false)
  const [formError,    setFormError]   = useState('')
  const [formOk,       setFormOk]      = useState('')

  // Confirmación eliminar
  const [deleteId,     setDeleteId]    = useState(null)
  const [deleting,     setDeleting]    = useState(false)

  const headers = () => ({ Authorization: `Bearer ${Cookies.get('auth_token')}`, 'Content-Type': 'application/json' })

  const fetchEntidades = useCallback(async (q = '') => {
    setLoading(true)
    try {
      const res  = await fetch(`${API}/entidades-requirientes?search=${encodeURIComponent(q)}`, { headers: headers() })
      const json = await res.json()
      if (json.success) setEntidades(json.data)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchEntidades() }, [fetchEntidades])

  const openCreate = () => {
    setForm(EMPTY_FORM)
    setFormError('')
    setFormOk('')
    setModal({ open: true, mode: 'create', id: null })
  }

  const openEdit = (e) => {
    setForm({
      nombre_entidad:       e.nombre_entidad       || '',
      responsable_entidad:  e.responsable_entidad  || '',
      correo_institucional: e.correo_institucional || '',
      memorando:            e.memorando            || '',
    })
    setFormError('')
    setFormOk('')
    setModal({ open: true, mode: 'edit', id: e.id_entidad_requiriente })
  }

  const closeModal = () => {
    setModal({ open: false, mode: 'create', id: null })
    setFormError('')
    setFormOk('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')
    setFormOk('')
    setSaving(true)
    try {
      const url    = modal.mode === 'create'
        ? `${API}/entidades-requirientes`
        : `${API}/entidades-requirientes/${modal.id}`
      const method = modal.mode === 'create' ? 'POST' : 'PUT'
      const res  = await fetch(url, { method, headers: headers(), body: JSON.stringify(form) })
      const json = await res.json()
      if (json.success) {
        setFormOk(json.message || 'Guardado exitosamente.')
        fetchEntidades(search)
        if (modal.mode === 'create') setForm(EMPTY_FORM)
      } else {
        setFormError(json.message || 'Error al guardar.')
      }
    } catch { setFormError('Error de conexión.') }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const res  = await fetch(`${API}/entidades-requirientes/${deleteId}`, { method: 'DELETE', headers: headers() })
      const json = await res.json()
      if (json.success) {
        setDeleteId(null)
        fetchEntidades(search)
      }
    } catch (e) { console.error(e) }
    finally { setDeleting(false) }
  }

  const handleSearch = (e) => { e.preventDefault(); fetchEntidades(search) }

  return (
    <div style={{ background: theme.colors.dark['900'], minHeight: '100%', padding: '28px', fontFamily: theme.typography.fontFamily }}>

      {/* Título */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <Building2 size={20} color={ACCENT} />
            <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: TEXT, letterSpacing: '-0.02em' }}>
              Entidades Requirientes
            </h1>
          </div>
          <p style={{ margin: 0, fontSize: '13px', color: MUTED }}>
            Organismos que solicitan certificaciones presupuestarias.
          </p>
        </div>
        <button
          onClick={openCreate}
          style={{
            display: 'flex', alignItems: 'center', gap: '7px',
            padding: '9px 16px',
            background: ACCENT, color: '#fff', border: 'none',
            borderRadius: theme.border.radiusMd, cursor: 'pointer',
            fontSize: '13px', fontWeight: 600, fontFamily: theme.typography.fontFamily,
          }}
        >
          <Plus size={15} /> Nueva Entidad
        </button>
      </div>

      {/* Búsqueda */}
      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: theme.border.radiusMd, padding: '14px', marginBottom: '16px' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <label style={LABEL_S}>Buscar entidad</label>
            <div style={{ position: 'relative' }}>
              <Search size={13} style={{ position: 'absolute', left: '9px', top: '50%', transform: 'translateY(-50%)', color: MUTED, pointerEvents: 'none' }} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Nombre, responsable o correo..."
                style={{ ...INPUT_S, paddingLeft: '28px' }}
              />
            </div>
          </div>
          <button type="submit" style={{ padding: '8px 16px', background: ACCENT, color: '#fff', border: 'none', borderRadius: theme.border.radiusMd, cursor: 'pointer', fontSize: '13px', fontWeight: 600, fontFamily: theme.typography.fontFamily, whiteSpace: 'nowrap' }}>
            Buscar
          </button>
          <button type="button" onClick={() => { setSearch(''); fetchEntidades('') }} title="Limpiar" style={{ padding: '8px 10px', background: ELEV, color: MUTED, border: `1px solid ${BORDER}`, borderRadius: theme.border.radiusMd, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <RefreshCw size={13} />
          </button>
        </form>
        {!loading && <div style={{ marginTop: '8px', fontSize: '12px', color: MUTED }}>{entidades.length} entidad(es) registrada(s)</div>}
      </div>

      {/* Tabla */}
      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: theme.border.radiusMd, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: MUTED, fontSize: '13px' }}>Cargando...</div>
        ) : entidades.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: MUTED, fontSize: '13px' }}>
            No hay entidades registradas.{' '}
            <button onClick={openCreate} style={{ color: ACCENT, background: 'none', border: 'none', cursor: 'pointer', fontFamily: theme.typography.fontFamily, fontSize: '13px', textDecoration: 'underline' }}>
              Crear la primera
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: `${ELEV}88` }}>
                  {['Entidad', 'Responsable', 'Correo Institucional', 'Memorando', 'Acciones'].map((h, i) => (
                    <th key={i} style={{
                      padding: '10px 16px',
                      textAlign: 'left',
                      fontSize: '10px', fontWeight: 700, color: MUTED,
                      textTransform: 'uppercase', letterSpacing: '0.06em',
                      whiteSpace: 'nowrap', borderBottom: `1px solid ${BORDER}`,
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {entidades.map((ent) => (
                  <tr key={ent.id_entidad_requiriente} style={{ borderBottom: `1px solid ${BORDER}` }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = `${ELEV}55` }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                  >
                    <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: TEXT }}>{ent.nombre_entidad}</td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: TEXT }}>{ent.responsable_entidad}</td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: MUTED }}>{ent.correo_institucional}</td>
                    <td style={{ padding: '12px 16px', fontSize: '12px', color: MUTED, maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ent.memorando || '—'}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          onClick={() => openEdit(ent)}
                          title="Editar"
                          style={{
                            display: 'flex', alignItems: 'center', gap: '4px',
                            padding: '5px 10px',
                            background: `${ACCENT}18`, border: `1px solid ${ACCENT}40`,
                            borderRadius: theme.border.radiusSmall, color: ACCENT,
                            cursor: 'pointer', fontSize: '12px', fontWeight: 600,
                            fontFamily: theme.typography.fontFamily,
                          }}
                        >
                          <Edit2 size={11} /> Editar
                        </button>
                        <button
                          onClick={() => setDeleteId(ent.id_entidad_requiriente)}
                          title="Eliminar"
                          style={{
                            display: 'flex', alignItems: 'center', gap: '4px',
                            padding: '5px 10px',
                            background: 'rgba(196,30,58,0.12)', border: '1px solid rgba(196,30,58,0.3)',
                            borderRadius: theme.border.radiusSmall, color: RED,
                            cursor: 'pointer', fontSize: '12px', fontWeight: 600,
                            fontFamily: theme.typography.fontFamily,
                          }}
                        >
                          <Trash2 size={11} /> Eliminar
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

      {/* ── Modal Crear / Editar ────────────────────────────────────────── */}
      {modal.open && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: theme.border.radiusMd, padding: '24px', width: '100%', maxWidth: '480px', boxShadow: theme.shadow?.lg }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: TEXT }}>
                {modal.mode === 'create' ? 'Nueva Entidad Requiriente' : 'Editar Entidad'}
              </h3>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', color: MUTED, cursor: 'pointer', padding: '2px' }}>
                <X size={18} />
              </button>
            </div>

            {formError && (
              <div style={{ background: 'rgba(196,30,58,0.12)', border: '1px solid rgba(196,30,58,0.35)', borderRadius: theme.border.radiusMd, padding: '8px 12px', marginBottom: '14px', color: RED, fontSize: '12px' }}>
                {formError}
              </div>
            )}
            {formOk && (
              <div style={{ background: 'rgba(16,185,129,0.10)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: theme.border.radiusMd, padding: '8px 12px', marginBottom: '14px', color: theme.colors.accent.green, fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Check size={13} /> {formOk}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={LABEL_S}>Nombre de la entidad *</label>
                  <input type="text" value={form.nombre_entidad} onChange={(e) => setForm(f => ({ ...f, nombre_entidad: e.target.value }))} maxLength={100} required style={INPUT_S} />
                </div>
                <div>
                  <label style={LABEL_S}>Responsable *</label>
                  <input type="text" value={form.responsable_entidad} onChange={(e) => setForm(f => ({ ...f, responsable_entidad: e.target.value }))} maxLength={100} required style={INPUT_S} />
                </div>
                <div>
                  <label style={LABEL_S}>Correo institucional *</label>
                  <input type="email" value={form.correo_institucional} onChange={(e) => setForm(f => ({ ...f, correo_institucional: e.target.value }))} maxLength={100} required style={INPUT_S} />
                </div>
                <div>
                  <label style={LABEL_S}>Memorando</label>
                  <input type="text" value={form.memorando} onChange={(e) => setForm(f => ({ ...f, memorando: e.target.value }))} maxLength={100} placeholder="Número de memorando (opcional)" style={INPUT_S} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="button" onClick={closeModal} style={{ flex: 1, padding: '9px', background: ELEV, color: MUTED, border: `1px solid ${BORDER}`, borderRadius: theme.border.radiusMd, cursor: 'pointer', fontSize: '13px', fontWeight: 600, fontFamily: theme.typography.fontFamily }}>
                  Cancelar
                </button>
                <button type="submit" disabled={saving} style={{ flex: 1, padding: '9px', background: ACCENT, color: '#fff', border: 'none', borderRadius: theme.border.radiusMd, cursor: saving ? 'default' : 'pointer', fontSize: '13px', fontWeight: 600, fontFamily: theme.typography.fontFamily }}>
                  {saving ? 'Guardando...' : modal.mode === 'create' ? 'Crear Entidad' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal Confirmar Eliminar ────────────────────────────────────── */}
      {deleteId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: theme.border.radiusMd, padding: '24px', width: '100%', maxWidth: '380px' }}>
            <h3 style={{ margin: '0 0 10px', fontSize: '16px', fontWeight: 700, color: TEXT }}>Eliminar Entidad</h3>
            <p style={{ margin: '0 0 20px', fontSize: '13px', color: MUTED }}>
              ¿Está seguro? Esta acción no se puede deshacer. Si la entidad tiene certificaciones asociadas, no podrá eliminarse.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setDeleteId(null)} style={{ flex: 1, padding: '9px', background: ELEV, color: MUTED, border: `1px solid ${BORDER}`, borderRadius: theme.border.radiusMd, cursor: 'pointer', fontSize: '13px', fontWeight: 600, fontFamily: theme.typography.fontFamily }}>
                Cancelar
              </button>
              <button onClick={handleDelete} disabled={deleting} style={{ flex: 1, padding: '9px', background: 'rgba(196,30,58,0.85)', color: '#fff', border: 'none', borderRadius: theme.border.radiusMd, cursor: deleting ? 'default' : 'pointer', fontSize: '13px', fontWeight: 600, fontFamily: theme.typography.fontFamily }}>
                {deleting ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

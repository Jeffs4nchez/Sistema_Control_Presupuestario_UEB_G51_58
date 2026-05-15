import { useState, useEffect, useCallback } from 'react'
import Cookies from 'js-cookie'
import { theme } from '../config/theme'
import {
  Search, ChevronDown, ChevronRight, Plus, Trash2,
  BarChart2, X, RefreshCw, FileText, Ban,
} from 'lucide-react'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

const CARD   = theme.colors.dark['800']
const BORDER = theme.colors.dark['700']
const ELEV   = theme.colors.dark['600']
const ACCENT = theme.colors.accent.blue
const GREEN  = theme.colors.accent.green
const GOLD   = theme.colors.accent.gold
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

function fmt(v) {
  const s = String(v ?? 0)
  // Si tiene coma es formato español "1.234,56" → quitar puntos, cambiar coma a punto
  // Si no tiene coma es decimal raw "1000.00" o número → parseFloat directo
  const n = s.includes(',')
    ? parseFloat(s.replace(/\./g, '').replace(',', '.')) || 0
    : parseFloat(s) || 0
  return n.toLocaleString('es-EC', { style: 'currency', currency: 'USD' })
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

function MiniBar({ monto, liquidado }) {
  const pct = monto > 0 ? Math.min(100, (liquidado / monto) * 100) : 0
  const color = pct >= 100 ? RED : pct >= 75 ? GOLD : GREEN
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: '90px' }}>
      <div style={{ flex: 1, height: '4px', background: `${ELEV}`, borderRadius: '2px', overflow: 'hidden', border: `1px solid ${BORDER}` }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: '2px' }} />
      </div>
      <span style={{ fontSize: '10px', color, fontWeight: 700, minWidth: '28px', textAlign: 'right' }}>
        {pct.toFixed(0)}%
      </span>
    </div>
  )
}

function StatusDot({ pendiente }) {
  const color = pendiente > 0 ? GOLD : GREEN
  const label = pendiente > 0 ? 'Con saldo' : 'Liquidado'
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '11px', color, fontWeight: 600 }}>
      <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: color, display: 'inline-block', boxShadow: `0 0 5px ${color}66` }} />
      {label}
    </span>
  )
}

export default function Liquidaciones() {
  const [certs,       setCerts]       = useState([])
  const [loading,     setLoading]     = useState(false)
  const [search,      setSearch]      = useState('')
  const [expanded,    setExpanded]    = useState({})   // { id_certificacion: true/false }
  const [selected,    setSelected]    = useState(null) // item row

  // Liquidaciones del item seleccionado
  const [liqs,        setLiqs]        = useState([])
  const [resumen,     setResumen]     = useState(null)
  const [loadingLiq,  setLoadingLiq]  = useState(false)

  // Formulario nueva liquidación
  const [form,        setForm]        = useState({ monto: '', fecha: today(), memorando: '' })
  const [saving,      setSaving]      = useState(false)
  const [formError,   setFormError]   = useState('')
  const [formOk,      setFormOk]      = useState('')

  // Modal de anulación
  const [anularModal, setAnularModal] = useState({ open: false, id: null, motivo: '', saving: false, error: '' })

  // ── Cargar certificaciones agrupadas ─────────────────────────────────
  const fetchCerts = useCallback(async (q = '') => {
    setLoading(true)
    try {
      const token = Cookies.get('auth_token')
      const res = await fetch(
        `${API}/liquidaciones/certificaciones?search=${encodeURIComponent(q)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      const json = await res.json()
      if (json.success) {
        setCerts(json.data)
        // Auto-expandir si solo hay una certificación o si hay búsqueda
        if (json.data.length === 1 || q) {
          const expanded = {}
          json.data.forEach(c => { expanded[c.id_certificacion] = true })
          setExpanded(expanded)
        }
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchCerts() }, [])

  const toggleCert = (id) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }))
  }

  // ── Seleccionar item para liquidar ────────────────────────────────────
  const handleSelectItem = (item) => {
    setSelected(item)
    setForm({ monto: '', fecha: today(), memorando: '' })
    setFormError('')
    setFormOk('')
    fetchLiqs(item)
  }

  // ── Cargar liquidaciones del item seleccionado ────────────────────────
  const fetchLiqs = async (item) => {
    setLoadingLiq(true)
    setLiqs([])
    setResumen(null)
    try {
      const token = Cookies.get('auth_token')
      const res = await fetch(
        `${API}/liquidaciones?id_certificacion_item=${item.id_certificacion_item}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      const json = await res.json()
      if (json.success) { setLiqs(json.data); setResumen(json.resumen) }
    } catch (e) { console.error(e) }
    finally { setLoadingLiq(false) }
  }

  // ── Registrar liquidación ─────────────────────────────────────────────
  const handleCreate = async (e) => {
    e.preventDefault()
    setFormError('')
    setFormOk('')
    if (!form.monto || parseFloat(form.monto) <= 0) {
      setFormError('Ingrese un monto válido mayor a 0.')
      return
    }
    setSaving(true)
    try {
      const token = Cookies.get('auth_token')
      const res = await fetch(`${API}/liquidaciones`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_certificacion_item: selected.id_certificacion_item,
          cantidad_liquidacion:  parseFloat(form.monto),
          fecha_creacion:        form.fecha,
          memorando:             form.memorando,
        }),
      })
      const json = await res.json()
      if (json.success) {
        setFormOk('Liquidación registrada correctamente.')
        setForm({ monto: '', fecha: today(), memorando: '' })
        fetchLiqs(selected)
        fetchCerts(search)  // refrescar totales
      } else {
        setFormError(json.message || 'Error al registrar.')
      }
    } catch { setFormError('Error de conexión.') }
    finally { setSaving(false) }
  }

  // ── Eliminar liquidación ──────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar esta liquidación?')) return
    try {
      const token = Cookies.get('auth_token')
      await fetch(`${API}/liquidaciones/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      fetchLiqs(selected)
      fetchCerts(search)
    } catch (e) { console.error(e) }
  }

  // ── Anular liquidación (soft delete) ─────────────────────────────────
  const handleAnular = async () => {
    if (!anularModal.motivo.trim()) {
      setAnularModal(m => ({ ...m, error: 'Debe ingresar el motivo de anulación.' }))
      return
    }
    setAnularModal(m => ({ ...m, saving: true, error: '' }))
    try {
      const token = Cookies.get('auth_token')
      const res = await fetch(`${API}/liquidaciones/${anularModal.id}/anular`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ motivo_anulacion: anularModal.motivo }),
      })
      const json = await res.json()
      if (json.success) {
        setAnularModal({ open: false, id: null, motivo: '', saving: false, error: '' })
        fetchLiqs(selected)
        fetchCerts(search)
      } else {
        setAnularModal(m => ({ ...m, saving: false, error: json.message || 'Error al anular.' }))
      }
    } catch {
      setAnularModal(m => ({ ...m, saving: false, error: 'Error de conexión.' }))
    }
  }

  const handleSearch = (e) => { e.preventDefault(); fetchCerts(search) }

  return (
    <div style={{ background: theme.colors.dark['900'], minHeight: '100%', padding: '28px', fontFamily: theme.typography.fontFamily }}>

      {/* Title */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <BarChart2 size={20} color={GOLD} />
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: TEXT, letterSpacing: '-0.02em' }}>
            Liquidaciones
          </h1>
        </div>
        <p style={{ margin: 0, fontSize: '13px', color: MUTED }}>
          Registra lo que efectivamente se pagó de cada ítem en una certificación.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 420px' : '1fr', gap: '16px', alignItems: 'start' }}>

        {/* ── LEFT: Lista de certificaciones ──────────────────────────── */}
        <div>
          {/* Búsqueda */}
          <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: theme.border.radiusMd, padding: '14px', marginBottom: '14px' }}>
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
              <div style={{ flex: 1 }}>
                <label style={LABEL_S}>Buscar certificación o ítem</label>
                <div style={{ position: 'relative' }}>
                  <Search size={13} style={{ position: 'absolute', left: '9px', top: '50%', transform: 'translateY(-50%)', color: MUTED, pointerEvents: 'none' }} />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="N° certificación, código ítem o nombre..."
                    style={{ ...INPUT_S, paddingLeft: '28px' }}
                  />
                </div>
              </div>
              <button type="submit" style={{ padding: '8px 16px', background: ACCENT, color: '#fff', border: 'none', borderRadius: theme.border.radiusMd, cursor: 'pointer', fontSize: '13px', fontWeight: 600, fontFamily: theme.typography.fontFamily, whiteSpace: 'nowrap' }}>
                Buscar
              </button>
              <button type="button" onClick={() => { setSearch(''); fetchCerts('') }} title="Limpiar" style={{ padding: '8px 10px', background: ELEV, color: MUTED, border: `1px solid ${BORDER}`, borderRadius: theme.border.radiusMd, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <RefreshCw size={13} />
              </button>
            </form>
            {!loading && (
              <div style={{ marginTop: '8px', fontSize: '12px', color: MUTED }}>
                {certs.length} certificación(es) con ítems certificados
              </div>
            )}
          </div>

          {/* Lista de certificaciones */}
          {loading ? (
            <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: theme.border.radiusMd, padding: '40px', textAlign: 'center', color: MUTED, fontSize: '13px' }}>
              Cargando...
            </div>
          ) : certs.length === 0 ? (
            <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: theme.border.radiusMd, padding: '40px', textAlign: 'center', color: MUTED, fontSize: '13px' }}>
              No hay certificaciones con ítems liquidables.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {certs.map((cert) => {
                const isOpen = !!expanded[cert.id_certificacion]
                const todosLiquidados = cert.total_pendiente <= 0
                return (
                  <div key={cert.id_certificacion} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: theme.border.radiusMd, overflow: 'hidden' }}>

                    {/* Cabecera de certificación */}
                    <button
                      onClick={() => toggleCert(cert.id_certificacion)}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
                        padding: '14px 16px',
                        background: 'transparent', border: 'none',
                        cursor: 'pointer', textAlign: 'left',
                        transition: 'background 0.15s ease',
                        fontFamily: theme.typography.fontFamily,
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = ELEV }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                    >
                      {/* Chevron */}
                      <span style={{ color: MUTED, flexShrink: 0, transition: 'transform 0.2s ease', display: 'flex', transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)' }}>
                        <ChevronDown size={16} />
                      </span>

                      {/* Ícono */}
                      <span style={{ color: ACCENT, flexShrink: 0, display: 'flex' }}>
                        <FileText size={16} />
                      </span>

                      {/* Info certificación */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '14px', fontWeight: 700, color: TEXT }}>{cert.numero_certificado}</span>
                          <span style={{ fontSize: '11px', color: MUTED }}>{cert.fecha_elaboracion}</span>
                          <span style={{ fontSize: '11px', background: ELEV, border: `1px solid ${BORDER}`, borderRadius: '999px', padding: '1px 7px', color: MUTED }}>
                            {cert.items_count} ítem{cert.items_count !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '16px', marginTop: '5px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '12px', color: MUTED }}>Cert: <span style={{ color: TEXT, fontWeight: 600 }}>{fmt(cert.total_monto)}</span></span>
                          <span style={{ fontSize: '12px', color: MUTED }}>Liq: <span style={{ color: GREEN, fontWeight: 600 }}>{fmt(cert.total_liquidado)}</span></span>
                          <span style={{ fontSize: '12px', color: MUTED }}>Disp: <span style={{ color: cert.total_pendiente > 0 ? GOLD : MUTED, fontWeight: 600 }}>{fmt(cert.total_pendiente)}</span></span>
                        </div>
                      </div>

                      {/* Estado global */}
                      <div style={{ flexShrink: 0 }}>
                        <StatusDot pendiente={cert.total_pendiente} />
                      </div>
                    </button>

                    {/* Ítems dentro de la certificación */}
                    {isOpen && (
                      <div style={{ borderTop: `1px solid ${BORDER}` }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                          <thead>
                            <tr style={{ background: `${ELEV}88` }}>
                              {['Código', 'Descripción', 'Monto Cert.', 'Liquidado', 'Disponible', 'Avance', ''].map((h, i) => (
                                <th key={i} style={{
                                  padding: '8px 14px',
                                  textAlign: i >= 2 && i <= 4 ? 'right' : 'left',
                                  fontSize: '10px', fontWeight: 700, color: MUTED,
                                  textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap',
                                }}>
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {cert.items.map((item) => {
                              const isSelected = selected?.id_certificacion_item === item.id_certificacion_item
                              const disponible  = parseFloat(item.pendiente ?? 0)
                              return (
                                <tr
                                  key={item.id_certificacion_item}
                                  style={{
                                    borderTop: `1px solid ${BORDER}`,
                                    background: isSelected ? `${ACCENT}14` : 'transparent',
                                    transition: 'background 0.15s ease',
                                  }}
                                >
                                  <td style={{ padding: '10px 14px', fontSize: '11px', fontFamily: 'monospace', color: ACCENT, fontWeight: 700 }}>{item.cod_item}</td>
                                  <td style={{ padding: '10px 14px', fontSize: '12px', color: TEXT, maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.nombre_item}>{item.nombre_item}</td>
                                  <td style={{ padding: '10px 14px', textAlign: 'right', fontSize: '12px', color: TEXT, whiteSpace: 'nowrap' }}>{fmt(item.monto)}</td>
                                  <td style={{ padding: '10px 14px', textAlign: 'right', fontSize: '12px', color: GREEN, fontWeight: parseFloat(item.liquidado) > 0 ? 700 : 400, whiteSpace: 'nowrap' }}>{fmt(item.liquidado)}</td>
                                  <td style={{ padding: '10px 14px', textAlign: 'right', fontSize: '12px', color: disponible > 0 ? GOLD : MUTED, fontWeight: disponible > 0 ? 700 : 400, whiteSpace: 'nowrap' }}>{fmt(disponible)}</td>
                                  <td style={{ padding: '10px 14px', minWidth: '100px' }}>
                                    <MiniBar monto={parseFloat(item.monto)} liquidado={parseFloat(item.liquidado)} />
                                  </td>
                                  <td style={{ padding: '10px 14px' }}>
                                    <button
                                      onClick={() => handleSelectItem(item)}
                                      disabled={disponible <= 0 && !isSelected}
                                      title={disponible > 0 ? 'Registrar liquidación' : 'Ítem ya liquidado completamente'}
                                      style={{
                                        display: 'flex', alignItems: 'center', gap: '5px',
                                        padding: '5px 10px',
                                        background: isSelected ? `${ACCENT}30` : disponible > 0 ? `${ACCENT}18` : `${ELEV}`,
                                        border: `1px solid ${isSelected ? ACCENT : disponible > 0 ? `${ACCENT}40` : BORDER}`,
                                        borderRadius: theme.border.radiusSmall,
                                        color: isSelected ? ACCENT : disponible > 0 ? ACCENT : MUTED,
                                        cursor: disponible <= 0 && !isSelected ? 'default' : 'pointer',
                                        fontSize: '11px', fontWeight: 600,
                                        fontFamily: theme.typography.fontFamily,
                                        whiteSpace: 'nowrap',
                                        opacity: disponible <= 0 && !isSelected ? 0.5 : 1,
                                      }}
                                    >
                                      <Plus size={11} />
                                      {isSelected ? 'Seleccionado' : 'Liquidar'}
                                    </button>
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* ── RIGHT: Panel de liquidación ──────────────────────────────── */}
        {selected && (
          <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: theme.border.radiusMd, overflow: 'hidden', position: 'sticky', top: '16px' }}>

            {/* Encabezado */}
            <div style={{ padding: '14px 16px', borderBottom: `1px solid ${BORDER}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '11px', color: MUTED, marginBottom: '2px' }}>
                  Certificación <span style={{ color: ACCENT, fontWeight: 700 }}>{selected.numero_certificado}</span>
                  {selected.fecha_elaboracion && <span> · {selected.fecha_elaboracion}</span>}
                </div>
                <div style={{ fontSize: '11px', fontFamily: 'monospace', color: ACCENT, fontWeight: 700, marginBottom: '2px' }}>{selected.cod_item}</div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: TEXT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selected.nombre_item}</div>
                {selected.cod_fuente && (
                  <div style={{ fontSize: '11px', color: MUTED, marginTop: '2px' }}>Fuente: {selected.cod_fuente}</div>
                )}
              </div>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: MUTED, cursor: 'pointer', padding: '2px', flexShrink: 0 }}>
                <X size={16} />
              </button>
            </div>

            {/* Resumen montos */}
            {resumen && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', padding: '12px 16px', borderBottom: `1px solid ${BORDER}` }}>
                {[
                  { label: 'Monto Cert.', value: fmt(resumen.certificado), color: TEXT },
                  { label: 'Liquidado',   value: fmt(resumen.liquidado),   color: GREEN },
                  { label: 'Disponible',  value: fmt(resumen.pendiente),   color: resumen.pendiente > 0 ? GOLD : MUTED },
                ].map((r, i) => (
                  <div key={i} style={{ background: ELEV, borderRadius: theme.border.radiusMd, padding: '10px', textAlign: 'center' }}>
                    <div style={{ fontSize: '10px', color: MUTED, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>{r.label}</div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: r.color }}>{r.value}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Barra de avance */}
            {resumen && (
              <div style={{ padding: '8px 16px', borderBottom: `1px solid ${BORDER}` }}>
                <MiniBar monto={resumen.certificado} liquidado={resumen.liquidado} />
              </div>
            )}

            {/* Formulario */}
            <div style={{ padding: '14px 16px', borderBottom: `1px solid ${BORDER}` }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: TEXT, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Plus size={14} color={ACCENT} /> Nueva Liquidación
              </div>

              {formError && (
                <div style={{ background: 'rgba(196,30,58,0.12)', border: '1px solid rgba(196,30,58,0.35)', borderRadius: theme.border.radiusMd, padding: '8px 12px', marginBottom: '10px', color: RED, fontSize: '12px' }}>
                  {formError}
                </div>
              )}
              {formOk && (
                <div style={{ background: 'rgba(16,185,129,0.10)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: theme.border.radiusMd, padding: '8px 12px', marginBottom: '10px', color: GREEN, fontSize: '12px' }}>
                  {formOk}
                </div>
              )}

              <form onSubmit={handleCreate}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                  <div>
                    <label style={LABEL_S}>Monto a liquidar ($)</label>
                    <input
                      type="number" step="0.01" min="0.01"
                      value={form.monto}
                      onChange={(e) => setForm(f => ({ ...f, monto: e.target.value }))}
                      placeholder="0.00"
                      style={INPUT_S}
                      required
                    />
                    {resumen && resumen.pendiente > 0 && (
                      <div style={{ fontSize: '11px', color: GOLD, marginTop: '4px' }}>
                        Disponible: {fmt(resumen.pendiente)}
                      </div>
                    )}
                  </div>
                  <div>
                    <label style={LABEL_S}>Fecha</label>
                    <input
                      type="date"
                      value={form.fecha}
                      onChange={(e) => setForm(f => ({ ...f, fecha: e.target.value }))}
                      style={INPUT_S}
                      required
                    />
                  </div>
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <label style={LABEL_S}>Memorando / Referencia</label>
                  <input
                    type="text"
                    value={form.memorando}
                    onChange={(e) => setForm(f => ({ ...f, memorando: e.target.value }))}
                    placeholder="Número de memorando..."
                    style={INPUT_S}
                    maxLength={100}
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={saving || (resumen && resumen.pendiente <= 0)}
                  style={{
                    width: '100%', padding: '9px',
                    background: (saving || (resumen && resumen.pendiente <= 0)) ? ELEV : ACCENT,
                    color: (saving || (resumen && resumen.pendiente <= 0)) ? MUTED : '#fff',
                    border: 'none', borderRadius: theme.border.radiusMd,
                    cursor: (saving || (resumen && resumen.pendiente <= 0)) ? 'default' : 'pointer',
                    fontSize: '13px', fontWeight: 600, fontFamily: theme.typography.fontFamily,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  }}
                >
                  <Plus size={14} />
                  {saving ? 'Guardando...' : resumen && resumen.pendiente <= 0 ? 'Sin saldo disponible' : 'Registrar Liquidación'}
                </button>
              </form>
            </div>

            {/* Historial */}
            <div style={{ padding: '14px 16px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: TEXT, marginBottom: '10px' }}>
                Historial ({liqs.length})
              </div>

              {loadingLiq ? (
                <div style={{ textAlign: 'center', color: MUTED, fontSize: '12px', padding: '12px 0' }}>Cargando...</div>
              ) : liqs.length === 0 ? (
                <div style={{ textAlign: 'center', color: MUTED, fontSize: '12px', padding: '12px 0' }}>
                  Sin liquidaciones registradas.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '260px', overflowY: 'auto' }}>
                  {liqs.map((liq) => {
                    const anulada = liq.estado === 'ANULADA'
                    return (
                      <div key={liq.id_liquidacion} style={{
                        background: anulada ? `rgba(196,30,58,0.06)` : ELEV,
                        border: `1px solid ${anulada ? 'rgba(196,30,58,0.25)' : BORDER}`,
                        borderRadius: theme.border.radiusMd, padding: '10px 12px',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px',
                        opacity: anulada ? 0.75 : 1,
                      }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px', gap: '6px' }}>
                            <span style={{ fontSize: '13px', fontWeight: 700, color: anulada ? RED : GREEN, textDecoration: anulada ? 'line-through' : 'none' }}>
                              {fmt(liq.cantidad_liquidacion)}
                            </span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              {anulada && (
                                <span style={{ fontSize: '9px', fontWeight: 700, background: 'rgba(196,30,58,0.18)', color: RED, border: '1px solid rgba(196,30,58,0.35)', borderRadius: '999px', padding: '1px 6px', letterSpacing: '0.06em' }}>
                                  ANULADA
                                </span>
                              )}
                              <span style={{ fontSize: '11px', color: MUTED }}>{liq.fecha_creacion}</span>
                            </div>
                          </div>
                          <div style={{ fontSize: '11px', color: MUTED, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {liq.memorando}
                          </div>
                          {anulada && liq.motivo_anulacion && (
                            <div style={{ fontSize: '11px', color: RED, marginTop: '3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              Motivo: {liq.motivo_anulacion}
                            </div>
                          )}
                        </div>
                        {!anulada && (
                          <button
                            onClick={() => setAnularModal({ open: true, id: liq.id_liquidacion, motivo: '', saving: false, error: '' })}
                            title="Anular liquidación"
                            style={{
                              width: '26px', height: '26px', flexShrink: 0,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              background: 'rgba(196,30,58,0.12)', border: '1px solid rgba(196,30,58,0.3)',
                              borderRadius: theme.border.radiusSmall, color: RED, cursor: 'pointer',
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(1.25)' }}
                            onMouseLeave={(e) => { e.currentTarget.style.filter = 'none' }}
                          >
                            <Ban size={12} />
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Modal de Anulación ────────────────────────────────────────── */}
      {anularModal.open && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.65)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            background: theme.colors.dark['800'],
            border: `1px solid ${BORDER}`,
            borderRadius: theme.border.radiusMd,
            padding: '24px',
            width: '100%', maxWidth: '420px',
            boxShadow: theme.shadow?.lg,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Ban size={18} color={RED} />
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: TEXT }}>Anular Liquidación</h3>
              </div>
              <button
                onClick={() => setAnularModal({ open: false, id: null, motivo: '', saving: false, error: '' })}
                style={{ background: 'none', border: 'none', color: MUTED, cursor: 'pointer', padding: '2px' }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ margin: '0 0 16px', fontSize: '13px', color: MUTED }}>
              La liquidación quedará anulada pero el registro se conserva para auditoría. Ingrese el motivo.
            </p>

            {anularModal.error && (
              <div style={{ background: 'rgba(196,30,58,0.12)', border: '1px solid rgba(196,30,58,0.35)', borderRadius: theme.border.radiusMd, padding: '8px 12px', marginBottom: '12px', color: RED, fontSize: '12px' }}>
                {anularModal.error}
              </div>
            )}

            <div style={{ marginBottom: '16px' }}>
              <label style={LABEL_S}>Motivo de anulación</label>
              <textarea
                value={anularModal.motivo}
                onChange={(e) => setAnularModal(m => ({ ...m, motivo: e.target.value }))}
                placeholder="Describa el motivo..."
                maxLength={255}
                rows={3}
                style={{ ...INPUT_S, resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setAnularModal({ open: false, id: null, motivo: '', saving: false, error: '' })}
                style={{
                  flex: 1, padding: '9px',
                  background: ELEV, color: MUTED,
                  border: `1px solid ${BORDER}`,
                  borderRadius: theme.border.radiusMd, cursor: 'pointer',
                  fontSize: '13px', fontWeight: 600, fontFamily: theme.typography.fontFamily,
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleAnular}
                disabled={anularModal.saving}
                style={{
                  flex: 1, padding: '9px',
                  background: 'rgba(196,30,58,0.85)', color: '#fff',
                  border: '1px solid rgba(196,30,58,0.5)',
                  borderRadius: theme.border.radiusMd, cursor: anularModal.saving ? 'default' : 'pointer',
                  fontSize: '13px', fontWeight: 600, fontFamily: theme.typography.fontFamily,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                }}
              >
                <Ban size={14} />
                {anularModal.saving ? 'Anulando...' : 'Confirmar Anulación'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

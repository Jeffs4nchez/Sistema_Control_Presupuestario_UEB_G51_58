import { useState, useEffect, useCallback } from 'react'
import Cookies from 'js-cookie'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, ChevronDown, Plus, Trash2,
  BarChart2, X, RefreshCw, FileText, Ban, AlertCircle, CheckCircle, Lock,
} from 'lucide-react'
import { useFiscalYear } from '../contexts/FiscalYearContext'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

const CARD   = 'rgba(255,255,255,0.90)'
const BORDER = 'rgba(46,108,164,0.14)'
const BG     = '#f8fafd'
const ACCENT = '#2e6ca4'
const GREEN  = '#059669'
const GOLD   = '#d97706'
const RED    = '#b91c1c'
const TEXT   = '#1a3a5c'
const MUTED  = '#5a7a9f'

const INPUT_S = {
  padding: '8px 11px', background: BG,
  border: '1px solid rgba(46,108,164,0.22)',
  borderRadius: '8px', color: TEXT, fontSize: '13px',
  fontFamily: 'var(--font-primary)', outline: 'none',
  width: '100%', boxSizing: 'border-box',
}

const LABEL_S = {
  display: 'block', fontSize: '11px', fontWeight: 700,
  color: MUTED, marginBottom: '5px',
  textTransform: 'uppercase', letterSpacing: '0.06em',
}

function fmt(v) {
  const s = String(v ?? 0)
  const n = s.includes(',')
    ? parseFloat(s.replace(/\./g, '').replace(',', '.')) || 0
    : parseFloat(s) || 0
  return n.toLocaleString('es-EC', { style: 'currency', currency: 'USD' })
}

function today() { return new Date().toISOString().slice(0, 10) }

function MiniBar({ monto, liquidado }) {
  const pct   = monto > 0 ? Math.min(100, (liquidado / monto) * 100) : 0
  const color = pct >= 100 ? RED : pct >= 75 ? GOLD : GREEN
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: '90px' }}>
      <div style={{ flex: 1, height: '5px', background: 'rgba(46,108,164,0.12)', borderRadius: '3px', overflow: 'hidden' }}>
        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.7, ease: 'easeOut' }}
          style={{ height: '100%', background: color, borderRadius: '3px' }}
        />
      </div>
      <span style={{ fontSize: '10px', color, fontWeight: 700, minWidth: '28px', textAlign: 'right' }}>{pct.toFixed(0)}%</span>
    </div>
  )
}

function StatusDot({ pendiente }) {
  const color = pendiente > 0 ? GOLD : GREEN
  const label = pendiente > 0 ? 'Con saldo' : 'Liquidado'
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '11px', color, fontWeight: 600 }}>
      <motion.span animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 2 }}
        style={{ width: '7px', height: '7px', borderRadius: '50%', background: color, display: 'inline-block', boxShadow: `0 0 6px ${color}66` }}
      />
      {label}
    </span>
  )
}

export default function Liquidaciones() {
  const { selectedCedula, isReadOnly } = useFiscalYear()
  const [certs,       setCerts]       = useState([])
  const [loading,     setLoading]     = useState(false)
  const [search,      setSearch]      = useState('')
  const [expanded,    setExpanded]    = useState({})
  const [selected,    setSelected]    = useState(null)
  const [liqs,        setLiqs]        = useState([])
  const [resumen,     setResumen]     = useState(null)
  const [loadingLiq,  setLoadingLiq]  = useState(false)
  const [form,        setForm]        = useState({ monto: '', fecha: today(), memorando: '' })
  const [saving,      setSaving]      = useState(false)
  const [formError,   setFormError]   = useState('')
  const [formOk,      setFormOk]      = useState('')
  const [anularModal, setAnularModal] = useState({ open: false, id: null, motivo: '', saving: false, error: '' })

  const fetchCerts = useCallback(async (q = '') => {
    setLoading(true)
    try {
      const token  = Cookies.get('auth_token')
      const params = new URLSearchParams({ search: q })
      if (selectedCedula) params.set('id_cedula_presupuestaria', selectedCedula.id_cedula_presupuestaria)
      const res  = await fetch(`${API}/liquidaciones/certificaciones?${params}`, { headers: { Authorization: `Bearer ${token}` } })
      const json = await res.json()
      if (json.success) {
        setCerts(json.data)
        if (json.data.length === 1 || q) {
          const ex = {}; json.data.forEach(c => { ex[c.id_certificacion] = true }); setExpanded(ex)
        }
      }
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [selectedCedula])

  useEffect(() => { setSelected(null); fetchCerts() }, [selectedCedula?.id_cedula_presupuestaria])

  const toggleCert = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }))

  const handleSelectItem = (item) => {
    setSelected(item); setForm({ monto: '', fecha: today(), memorando: '' })
    setFormError(''); setFormOk(''); fetchLiqs(item)
  }

  const fetchLiqs = async (item) => {
    setLoadingLiq(true); setLiqs([]); setResumen(null)
    try {
      const token = Cookies.get('auth_token')
      const res = await fetch(`${API}/liquidaciones?id_certificacion_item=${item.id_certificacion_item}`, { headers: { Authorization: `Bearer ${token}` } })
      const json = await res.json()
      if (json.success) { setLiqs(json.data); setResumen(json.resumen) }
    } catch (e) { console.error(e) }
    finally { setLoadingLiq(false) }
  }

  const handleCreate = async (e) => {
    e.preventDefault(); setFormError(''); setFormOk('')
    if (!form.monto || parseFloat(form.monto) <= 0) { setFormError('Ingrese un monto válido mayor a 0.'); return }
    setSaving(true)
    try {
      const token = Cookies.get('auth_token')
      const res = await fetch(`${API}/liquidaciones`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_certificacion_item: selected.id_certificacion_item, cantidad_liquidacion: parseFloat(form.monto), fecha_creacion: form.fecha, memorando: form.memorando }),
      })
      const json = await res.json()
      if (json.success) {
        setFormOk('Liquidación registrada correctamente.')
        setForm({ monto: '', fecha: today(), memorando: '' })
        fetchLiqs(selected); fetchCerts(search)
      } else { setFormError(json.message || 'Error al registrar.') }
    } catch { setFormError('Error de conexión.') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar esta liquidación?')) return
    try {
      const token = Cookies.get('auth_token')
      await fetch(`${API}/liquidaciones/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
      fetchLiqs(selected); fetchCerts(search)
    } catch (e) { console.error(e) }
  }

  const handleAnular = async () => {
    if (!anularModal.motivo.trim()) { setAnularModal(m => ({ ...m, error: 'Debe ingresar el motivo de anulación.' })); return }
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
        fetchLiqs(selected); fetchCerts(search)
      } else { setAnularModal(m => ({ ...m, saving: false, error: json.message || 'Error al anular.' })) }
    } catch { setAnularModal(m => ({ ...m, saving: false, error: 'Error de conexión.' })) }
  }

  return (
    <div style={{ minHeight: '100%', background: 'var(--page-bg)', fontFamily: 'var(--font-primary)' }}>

      {/* Page header */}
      <div style={{ background: 'rgba(255,255,255,0.90)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(26,58,92,0.08)', boxShadow: '0 2px 16px rgba(26,58,92,0.06)', padding: '20px 28px', marginBottom: '24px' }}>
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(217,119,6,0.12)', border: '1px solid rgba(217,119,6,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BarChart2 size={18} color={GOLD} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: TEXT, letterSpacing: '-0.02em' }}>Liquidaciones</h1>
            <p style={{ margin: 0, fontSize: '12px', color: MUTED }}>
              {isReadOnly
                ? `Año fiscal ${selectedCedula?.anio} — Solo visualización`
                : 'Registra lo que efectivamente se pagó de cada ítem certificado.'}
            </p>
          </div>
          {isReadOnly && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '7px',
              background: 'rgba(217,119,6,0.08)', border: '1px solid rgba(217,119,6,0.25)',
              borderRadius: '10px', padding: '7px 14px',
              fontSize: '12px', fontWeight: 700, color: '#d97706',
            }}>
              <Lock size={13} />
              Año {selectedCedula?.anio} — Solo lectura
            </div>
          )}
        </motion.div>
      </div>

      <div style={{ padding: '0 28px 28px', display: 'grid', gridTemplateColumns: selected ? '1fr 400px' : '1fr', gap: '16px', alignItems: 'start' }}>

        {/* LEFT: certificaciones */}
        <div>
          {/* Search */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: '12px', padding: '16px', marginBottom: '14px', backdropFilter: 'blur(12px)', boxShadow: '0 2px 16px rgba(26,58,92,0.06)' }}
          >
            <form onSubmit={e => { e.preventDefault(); fetchCerts(search) }} style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <label style={LABEL_S}>Buscar certificación o ítem</label>
                <div style={{ position: 'relative' }}>
                  <Search size={13} style={{ position: 'absolute', left: '9px', top: '50%', transform: 'translateY(-50%)', color: MUTED, pointerEvents: 'none' }} />
                  <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="N° certificación, código ítem o nombre..."
                    style={{ ...INPUT_S, paddingLeft: '28px' }}
                    onFocus={e => { e.target.style.borderColor = '#54b3e0'; e.target.style.boxShadow = '0 0 0 3px rgba(84,179,224,0.18)' }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(46,108,164,0.22)'; e.target.style.boxShadow = 'none' }}
                  />
                </div>
              </div>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit"
                style={{ padding: '8px 18px', background: 'linear-gradient(135deg, #1a3a5c, #2e6ca4)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 700, fontFamily: 'var(--font-primary)', whiteSpace: 'nowrap', boxShadow: '0 3px 12px rgba(26,58,92,0.20)' }}
              >
                Buscar
              </motion.button>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="button" onClick={() => { setSearch(''); fetchCerts('') }}
                style={{ padding: '8px 12px', background: 'rgba(26,58,92,0.06)', color: MUTED, border: '1px solid rgba(26,58,92,0.12)', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                <RefreshCw size={13} />
              </motion.button>
            </form>
            {!loading && <div style={{ marginTop: '8px', fontSize: '12px', color: MUTED }}>{certs.length} certificación(es) con ítems certificados</div>}
          </motion.div>

          {/* Certs list */}
          {loading ? (
            <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: '12px', padding: '48px', textAlign: 'center', color: MUTED, fontSize: '13px', backdropFilter: 'blur(12px)' }}>
              <div style={{ width: '32px', height: '32px', border: '3px solid rgba(46,108,164,0.15)', borderTopColor: ACCENT, borderRadius: '50%', margin: '0 auto 12px', animation: 'spin 0.8s linear infinite' }} />
              Cargando...
            </div>
          ) : certs.length === 0 ? (
            <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: '12px', padding: '48px', textAlign: 'center', color: MUTED, fontSize: '13px', backdropFilter: 'blur(12px)' }}>
              No hay certificaciones con ítems liquidables.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {certs.map((cert, ci) => {
                const isOpen = !!expanded[cert.id_certificacion]
                return (
                  <motion.div key={cert.id_certificacion}
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: ci * 0.04, duration: 0.22 }}
                    style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: '12px', overflow: 'hidden', backdropFilter: 'blur(12px)', boxShadow: '0 2px 16px rgba(26,58,92,0.06)' }}
                  >
                    <button onClick={() => toggleCert(cert.id_certificacion)}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--font-primary)', transition: 'background 0.15s ease' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(46,108,164,0.04)' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                    >
                      <motion.span animate={{ rotate: isOpen ? 0 : -90 }} transition={{ duration: 0.2 }} style={{ color: MUTED, flexShrink: 0, display: 'flex' }}>
                        <ChevronDown size={16} />
                      </motion.span>
                      <span style={{ color: ACCENT, flexShrink: 0, display: 'flex' }}><FileText size={16} /></span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '14px', fontWeight: 700, color: TEXT }}>{cert.numero_certificado}</span>
                          <span style={{ fontSize: '11px', color: MUTED }}>{cert.fecha_elaboracion}</span>
                          <span style={{ fontSize: '11px', background: 'rgba(46,108,164,0.08)', border: '1px solid rgba(46,108,164,0.15)', borderRadius: '999px', padding: '1px 7px', color: ACCENT }}>
                            {cert.items_count} ítem{cert.items_count !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '16px', marginTop: '5px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '12px', color: MUTED }}>Cert: <span style={{ color: TEXT, fontWeight: 600 }}>{fmt(cert.total_monto)}</span></span>
                          <span style={{ fontSize: '12px', color: MUTED }}>Liq: <span style={{ color: GREEN, fontWeight: 600 }}>{fmt(cert.total_liquidado)}</span></span>
                          <span style={{ fontSize: '12px', color: MUTED }}>Disp: <span style={{ color: cert.total_pendiente > 0 ? GOLD : MUTED, fontWeight: 600 }}>{fmt(cert.total_pendiente)}</span></span>
                        </div>
                      </div>
                      <StatusDot pendiente={cert.total_pendiente} />
                    </button>

                    <AnimatePresence>
                      {isOpen && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}
                          style={{ borderTop: `1px solid ${BORDER}`, overflow: 'hidden' }}
                        >
                          <div style={{ overflowX: 'auto' }}>
                            <table className="ueb-table">
                              <thead>
                                <tr>
                                  {['Código', 'Descripción', 'Monto Cert.', 'Liquidado', 'Disponible', 'Avance', ''].map((h, i) => (
                                    <th key={i} style={{ textAlign: i >= 2 && i <= 4 ? 'right' : 'left' }}>{h}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {cert.items.map((item) => {
                                  const isSelected = selected?.id_certificacion_item === item.id_certificacion_item
                                  const disponible = parseFloat(item.pendiente ?? 0)
                                  return (
                                    <tr key={item.id_certificacion_item}
                                      style={{ background: isSelected ? 'rgba(46,108,164,0.08)' : 'transparent', borderLeft: isSelected ? `3px solid ${ACCENT}` : '3px solid transparent' }}
                                    >
                                      <td style={{ fontFamily: 'monospace', color: ACCENT, fontWeight: 700, fontSize: '11px' }}>{item.cod_item}</td>
                                      <td style={{ maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.nombre_item}>{item.nombre_item}</td>
                                      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>{fmt(item.monto)}</td>
                                      <td style={{ textAlign: 'right', color: GREEN, fontWeight: parseFloat(item.liquidado) > 0 ? 700 : 400, whiteSpace: 'nowrap' }}>{fmt(item.liquidado)}</td>
                                      <td style={{ textAlign: 'right', color: disponible > 0 ? GOLD : MUTED, fontWeight: disponible > 0 ? 700 : 400, whiteSpace: 'nowrap' }}>{fmt(disponible)}</td>
                                      <td style={{ minWidth: '100px' }}><MiniBar monto={parseFloat(item.monto)} liquidado={parseFloat(item.liquidado)} /></td>
                                      <td>
                                        <motion.button whileHover={disponible > 0 || isSelected ? { scale: 1.04 } : {}} whileTap={disponible > 0 || isSelected ? { scale: 0.96 } : {}}
                                          onClick={() => handleSelectItem(item)}
                                          disabled={disponible <= 0 && !isSelected}
                                          style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 10px', background: isSelected ? 'rgba(46,108,164,0.15)' : disponible > 0 ? 'rgba(46,108,164,0.10)' : 'rgba(26,58,92,0.06)', border: `1px solid ${isSelected ? ACCENT : disponible > 0 ? 'rgba(46,108,164,0.30)' : 'rgba(26,58,92,0.12)'}`, borderRadius: '6px', color: isSelected ? ACCENT : disponible > 0 ? ACCENT : MUTED, cursor: disponible <= 0 && !isSelected ? 'default' : 'pointer', fontSize: '11px', fontWeight: 600, fontFamily: 'var(--font-primary)', whiteSpace: 'nowrap', opacity: disponible <= 0 && !isSelected ? 0.5 : 1 }}
                                        >
                                          <Plus size={11} />
                                          {isSelected ? 'Seleccionado' : 'Liquidar'}
                                        </motion.button>
                                      </td>
                                    </tr>
                                  )
                                })}
                              </tbody>
                            </table>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>

        {/* RIGHT: Panel liquidación */}
        <AnimatePresence>
          {selected && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
              style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: '12px', overflow: 'hidden', position: 'sticky', top: '80px', backdropFilter: 'blur(12px)', boxShadow: '0 4px 24px rgba(26,58,92,0.10)' }}
            >
              {/* Header */}
              <div style={{ padding: '14px 16px', borderBottom: `1px solid ${BORDER}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', background: 'linear-gradient(135deg, rgba(26,58,92,0.05), rgba(46,108,164,0.05))' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '11px', color: MUTED, marginBottom: '2px' }}>
                    Certificación <span style={{ color: ACCENT, fontWeight: 700 }}>{selected.numero_certificado}</span>
                  </div>
                  <div style={{ fontSize: '11px', fontFamily: 'monospace', color: ACCENT, fontWeight: 700, marginBottom: '2px' }}>{selected.cod_item}</div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: TEXT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selected.nombre_item}</div>
                </div>
                <motion.button whileHover={{ scale: 1.1 }} onClick={() => setSelected(null)}
                  style={{ background: 'rgba(26,58,92,0.06)', border: '1px solid rgba(26,58,92,0.12)', borderRadius: '8px', color: MUTED, cursor: 'pointer', padding: '5px', flexShrink: 0, display: 'flex', alignItems: 'center' }}
                >
                  <X size={14} />
                </motion.button>
              </div>

              {/* Resumen */}
              {resumen && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', padding: '12px', borderBottom: `1px solid ${BORDER}` }}>
                  {[
                    { label: 'Monto Cert.', value: fmt(resumen.certificado), color: TEXT },
                    { label: 'Liquidado',   value: fmt(resumen.liquidado),   color: GREEN },
                    { label: 'Disponible',  value: fmt(resumen.pendiente),   color: resumen.pendiente > 0 ? GOLD : MUTED },
                  ].map((r, i) => (
                    <div key={i} style={{ background: BG, borderRadius: '8px', padding: '10px', textAlign: 'center', border: '1px solid rgba(46,108,164,0.10)' }}>
                      <div style={{ fontSize: '10px', color: MUTED, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>{r.label}</div>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: r.color }}>{r.value}</div>
                    </div>
                  ))}
                </div>
              )}
              {resumen && (
                <div style={{ padding: '8px 14px', borderBottom: `1px solid ${BORDER}` }}>
                  <MiniBar monto={resumen.certificado} liquidado={resumen.liquidado} />
                </div>
              )}

              {/* Form — oculto en modo solo lectura */}
              {!isReadOnly && <div style={{ padding: '14px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: TEXT, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Plus size={13} color={ACCENT} /> Nueva Liquidación
                </div>

                <AnimatePresence>
                  {formError && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                      style={{ background: 'rgba(185,28,28,0.08)', border: '1px solid rgba(185,28,28,0.22)', borderRadius: '8px', padding: '8px 12px', marginBottom: '10px', color: RED, fontSize: '12px', display: 'flex', gap: '6px', alignItems: 'center' }}
                    >
                      <AlertCircle size={12} /> {formError}
                    </motion.div>
                  )}
                  {formOk && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                      style={{ background: 'rgba(5,150,105,0.08)', border: '1px solid rgba(5,150,105,0.22)', borderRadius: '8px', padding: '8px 12px', marginBottom: '10px', color: GREEN, fontSize: '12px', display: 'flex', gap: '6px', alignItems: 'center' }}
                    >
                      <CheckCircle size={12} /> {formOk}
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleCreate}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                    <div>
                      <label style={LABEL_S}>Monto ($)</label>
                      <input type="number" step="0.01" min="0.01" value={form.monto} onChange={e => setForm(f => ({ ...f, monto: e.target.value }))} placeholder="0.00" style={INPUT_S} required
                        onFocus={e => { e.target.style.borderColor = '#54b3e0'; e.target.style.boxShadow = '0 0 0 3px rgba(84,179,224,0.18)' }}
                        onBlur={e => { e.target.style.borderColor = 'rgba(46,108,164,0.22)'; e.target.style.boxShadow = 'none' }}
                      />
                      {resumen && resumen.pendiente > 0 && (
                        <div style={{ fontSize: '11px', color: GOLD, marginTop: '4px' }}>Disponible: {fmt(resumen.pendiente)}</div>
                      )}
                    </div>
                    <div>
                      <label style={LABEL_S}>Fecha</label>
                      <input type="date" value={form.fecha} onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))} style={INPUT_S} required
                        onFocus={e => { e.target.style.borderColor = '#54b3e0'; e.target.style.boxShadow = '0 0 0 3px rgba(84,179,224,0.18)' }}
                        onBlur={e => { e.target.style.borderColor = 'rgba(46,108,164,0.22)'; e.target.style.boxShadow = 'none' }}
                      />
                    </div>
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <label style={LABEL_S}>Memorando / Referencia</label>
                    <input type="text" value={form.memorando} onChange={e => setForm(f => ({ ...f, memorando: e.target.value }))} placeholder="Número de memorando..." style={INPUT_S} maxLength={100} required
                      onFocus={e => { e.target.style.borderColor = '#54b3e0'; e.target.style.boxShadow = '0 0 0 3px rgba(84,179,224,0.18)' }}
                      onBlur={e => { e.target.style.borderColor = 'rgba(46,108,164,0.22)'; e.target.style.boxShadow = 'none' }}
                    />
                  </div>
                  <motion.button whileHover={!saving && !(resumen && resumen.pendiente <= 0) ? { scale: 1.02, boxShadow: '0 8px 24px rgba(26,58,92,0.30)' } : {}} whileTap={!saving ? { scale: 0.98 } : {}}
                    type="submit" disabled={saving || (resumen && resumen.pendiente <= 0)}
                    style={{ width: '100%', padding: '9px', background: (saving || (resumen && resumen.pendiente <= 0)) ? 'rgba(26,58,92,0.08)' : 'linear-gradient(135deg, #1a3a5c, #2e6ca4)', color: (saving || (resumen && resumen.pendiente <= 0)) ? MUTED : '#fff', border: 'none', borderRadius: '8px', cursor: (saving || (resumen && resumen.pendiente <= 0)) ? 'default' : 'pointer', fontSize: '13px', fontWeight: 700, fontFamily: 'var(--font-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', boxShadow: (saving || (resumen && resumen.pendiente <= 0)) ? 'none' : '0 4px 16px rgba(26,58,92,0.25)', transition: 'all 0.18s ease' }}
                  >
                    <Plus size={13} />
                    {saving ? 'Guardando...' : resumen && resumen.pendiente <= 0 ? 'Sin saldo disponible' : 'Registrar Liquidación'}
                  </motion.button>
                </form>
              </div>}

              {/* Historial */}
              <div style={{ padding: '14px', borderTop: `1px solid ${BORDER}` }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: TEXT, marginBottom: '10px' }}>Historial ({liqs.length})</div>
                {loadingLiq ? (
                  <div style={{ textAlign: 'center', color: MUTED, fontSize: '12px', padding: '12px 0' }}>Cargando...</div>
                ) : liqs.length === 0 ? (
                  <div style={{ textAlign: 'center', color: MUTED, fontSize: '12px', padding: '12px 0' }}>Sin liquidaciones registradas.</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '240px', overflowY: 'auto' }}>
                    {liqs.map((liq) => {
                      const anulada = liq.estado === 'ANULADA'
                      return (
                        <div key={liq.id_liquidacion} style={{ background: anulada ? 'rgba(185,28,28,0.05)' : BG, border: `1px solid ${anulada ? 'rgba(185,28,28,0.22)' : BORDER}`, borderRadius: '8px', padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', opacity: anulada ? 0.75 : 1 }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px', gap: '6px' }}>
                              <span style={{ fontSize: '13px', fontWeight: 700, color: anulada ? RED : GREEN, textDecoration: anulada ? 'line-through' : 'none' }}>{fmt(liq.cantidad_liquidacion)}</span>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                {anulada && <span className="badge badge-red" style={{ fontSize: '9px' }}>ANULADA</span>}
                                <span style={{ fontSize: '11px', color: MUTED }}>{liq.fecha_creacion}</span>
                              </div>
                            </div>
                            <div style={{ fontSize: '11px', color: MUTED, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{liq.memorando}</div>
                            {anulada && liq.motivo_anulacion && (
                              <div style={{ fontSize: '11px', color: RED, marginTop: '3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Motivo: {liq.motivo_anulacion}</div>
                            )}
                          </div>
                          {!anulada && !isReadOnly && (
                            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                              onClick={() => setAnularModal({ open: true, id: liq.id_liquidacion, motivo: '', saving: false, error: '' })}
                              title="Anular"
                              style={{ width: '26px', height: '26px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(185,28,28,0.10)', border: '1px solid rgba(185,28,28,0.25)', borderRadius: '6px', color: RED, cursor: 'pointer' }}
                            >
                              <Ban size={12} />
                            </motion.button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modal Anulación */}
      <AnimatePresence>
        {anularModal.open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(10,25,47,0.50)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}
          >
            <motion.div initial={{ opacity: 0, scale: 0.94, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.94, y: 20 }}
              transition={{ type: 'spring', stiffness: 160, damping: 22 }}
              onClick={e => e.stopPropagation()}
              style={{ background: 'rgba(255,255,255,0.97)', border: '1px solid rgba(255,255,255,0.95)', borderRadius: '20px', width: '100%', maxWidth: '420px', boxShadow: '0 24px 80px rgba(10,25,47,0.25)', overflow: 'hidden' }}
            >
              <div style={{ padding: '18px 22px', background: 'linear-gradient(135deg, #6b0f0f, #b91c1c)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Ban size={16} color="#fff" />
                  <span style={{ fontSize: '15px', fontWeight: 800, color: '#fff' }}>Anular Liquidación</span>
                </div>
                <motion.button whileHover={{ scale: 1.1 }} onClick={() => setAnularModal({ open: false, id: null, motivo: '', saving: false, error: '' })}
                  style={{ background: 'rgba(255,255,255,0.10)', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', width: '28px', height: '28px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <X size={14} />
                </motion.button>
              </div>
              <div style={{ padding: '22px' }}>
                <p style={{ margin: '0 0 16px', fontSize: '13px', color: MUTED, lineHeight: 1.6 }}>
                  La liquidación quedará anulada pero el registro se conserva para auditoría. Ingrese el motivo.
                </p>
                <AnimatePresence>
                  {anularModal.error && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                      style={{ background: 'rgba(185,28,28,0.08)', border: '1px solid rgba(185,28,28,0.22)', borderRadius: '8px', padding: '8px 12px', marginBottom: '12px', color: RED, fontSize: '12px' }}
                    >
                      {anularModal.error}
                    </motion.div>
                  )}
                </AnimatePresence>
                <div style={{ marginBottom: '16px' }}>
                  <label style={LABEL_S}>Motivo de anulación</label>
                  <textarea value={anularModal.motivo} onChange={e => setAnularModal(m => ({ ...m, motivo: e.target.value }))}
                    placeholder="Describa el motivo..." maxLength={255} rows={3} style={{ ...INPUT_S, resize: 'vertical' }}
                    onFocus={e => { e.target.style.borderColor = '#54b3e0'; e.target.style.boxShadow = '0 0 0 3px rgba(84,179,224,0.18)' }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(46,108,164,0.22)'; e.target.style.boxShadow = 'none' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => setAnularModal({ open: false, id: null, motivo: '', saving: false, error: '' })}
                    style={{ flex: 1, padding: '9px', background: 'rgba(26,58,92,0.06)', color: MUTED, border: '1px solid rgba(26,58,92,0.12)', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, fontFamily: 'var(--font-primary)' }}
                  >
                    Cancelar
                  </button>
                  <motion.button whileHover={!anularModal.saving ? { scale: 1.02 } : {}} whileTap={!anularModal.saving ? { scale: 0.98 } : {}}
                    onClick={handleAnular} disabled={anularModal.saving}
                    style={{ flex: 1, padding: '9px', background: anularModal.saving ? 'rgba(185,28,28,0.40)' : 'linear-gradient(135deg, #8b0f0f, #b91c1c)', color: '#fff', border: 'none', borderRadius: '8px', cursor: anularModal.saving ? 'default' : 'pointer', fontSize: '13px', fontWeight: 700, fontFamily: 'var(--font-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', boxShadow: '0 4px 12px rgba(185,28,28,0.30)', transition: 'all 0.15s ease' }}
                  >
                    <Ban size={13} /> {anularModal.saving ? 'Anulando...' : 'Confirmar Anulación'}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

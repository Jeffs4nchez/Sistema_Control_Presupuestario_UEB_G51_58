import { useState, useEffect } from "react"
import axios from "axios"
import Cookies from "js-cookie"
import { useNavigate } from "react-router-dom"
import { useFiscalYear } from '../contexts/FiscalYearContext'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Trash2, Edit2, Eye, BarChart2, Printer, Search, RefreshCw, Clock, X, CheckCircle, AlertCircle } from 'lucide-react'
import PrintCertificacion from './PrintCertificacion'
import EditCertificacion from './EditCertificacion'

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api"

const CARD   = 'rgba(255,255,255,0.90)'
const BORDER = 'rgba(46,108,164,0.14)'
const BG     = '#f8fafd'
const ACCENT = '#2e6ca4'
const GREEN  = '#059669'
const RED    = '#b91c1c'
const GOLD   = '#d97706'
const TEXT   = '#1a3a5c'
const MUTED  = '#5a7a9f'

const INPUT_S = {
  padding: '8px 11px',
  background: BG,
  border: '1px solid rgba(46,108,164,0.22)',
  borderRadius: '8px',
  color: TEXT,
  fontSize: '13px',
  fontFamily: 'var(--font-primary)',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
}

const estadoMeta = {
  PENDIENTE:  { label: 'Pendiente',  cls: 'badge badge-gold'   },
  APROBADO:   { label: 'Aprobado',   cls: 'badge badge-green'  },
  RECHAZADO:  { label: 'Rechazado',  cls: 'badge badge-red'    },
  LIQUIDADO:  { label: 'Liquidado',  cls: 'badge badge-blue'   },
  ERRADO:     { label: 'Errado',     cls: 'badge badge-orange' },
}

function EstadoBadge({ estado }) {
  const m = estadoMeta[estado] || { label: estado, cls: 'badge' }
  return <span className={m.cls}>{m.label}</span>
}

const parseMonto = (v) => {
  if (!v && v !== 0) return 0
  return parseFloat(String(v).replace(/\./g, '').replace(',', '.')) || 0
}
const fmtMonto = (v) =>
  parseMonto(v).toLocaleString('es-EC', { style: 'currency', currency: 'USD' })

export default function ListaCertificaciones({ refresh }) {
  const navigate = useNavigate()
  const { selectedCedula, isReadOnly } = useFiscalYear()
  const [certificados, setCertificados] = useState([])
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState("")
  const [page,         setPage]         = useState(1)
  const [total,        setTotal]        = useState(0)
  const [search,       setSearch]       = useState("")
  const [estado,       setEstado]       = useState("")
  const [selectedCert,  setSelectedCert]  = useState(null)
  const [printCertId,   setPrintCertId]   = useState(null)
  const [editCertId,    setEditCertId]    = useState(null)
  const [historial,     setHistorial]     = useState({ open: false, cert: null, data: [], loading: false, error: '' })

  const limit = 10

  useEffect(() => { setPage(1) }, [selectedCedula?.id_cedula_presupuestaria])
  useEffect(() => { cargarCertificados() }, [refresh, page, search, estado, selectedCedula?.id_cedula_presupuestaria])

  const cargarCertificados = async () => {
    setLoading(true); setError("")
    try {
      const token = Cookies.get("auth_token")
      if (!token) { setError("Sin token de autenticación."); setLoading(false); return }
      const params = { page, limit, search, estado }
      if (selectedCedula) params.id_cedula_presupuestaria = selectedCedula.id_cedula_presupuestaria
      const res = await axios.get(`${API_BASE}/certificacion`, {
        params,
        headers: { Authorization: `Bearer ${token}` },
      })
      setCertificados(res.data.data)
      setTotal(res.data.pagination.total)
    } catch (err) {
      setError(err.response?.data?.message || "Error al cargar certificados")
    } finally { setLoading(false) }
  }

  const handleHistorial = async (cert) => {
    setHistorial({ open: true, cert, data: [], loading: true, error: '' })
    try {
      const token = Cookies.get('auth_token')
      const res = await axios.get(`${API_BASE}/auditoria/certificacion/${cert.id_certificacion}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setHistorial(h => ({ ...h, data: res.data.data, loading: false }))
    } catch {
      setHistorial(h => ({ ...h, loading: false, error: 'Error al cargar el historial.' }))
    }
  }

  const handleEliminar = async (id) => {
    if (!confirm("¿Eliminar este certificado?")) return
    try {
      const token = Cookies.get("auth_token")
      await axios.delete(`${API_BASE}/certificacion/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      cargarCertificados()
    } catch { alert("Error al eliminar") }
  }

  const totalPages = Math.max(1, Math.ceil(total / limit))

  return (
    <div style={{ fontFamily: 'var(--font-primary)' }}>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            style={{ background: 'rgba(185,28,28,0.08)', border: '1px solid rgba(185,28,28,0.22)', borderRadius: '10px', padding: '10px 14px', marginBottom: '14px', color: RED, fontSize: '13px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <AlertCircle size={14} />
              <span>{error}</span>
            </div>
            <button onClick={() => setError("")} style={{ background: 'none', border: 'none', color: RED, cursor: 'pointer' }}><X size={14} /></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: '12px', padding: '16px', marginBottom: '14px', backdropFilter: 'blur(12px)', display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'flex-end', boxShadow: '0 2px 16px rgba(26,58,92,0.06)' }}
      >
        <div style={{ flex: '1 1 180px', minWidth: '150px' }}>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: MUTED, marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Buscar</label>
          <div style={{ position: 'relative' }}>
            <Search size={13} style={{ position: 'absolute', left: '9px', top: '50%', transform: 'translateY(-50%)', color: MUTED, pointerEvents: 'none' }} />
            <input
              type="text" placeholder="Número o institución..."
              value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              style={{ ...INPUT_S, paddingLeft: '28px' }}
              onFocus={e => { e.target.style.borderColor = '#54b3e0'; e.target.style.boxShadow = '0 0 0 3px rgba(84,179,224,0.18)' }}
              onBlur={e => { e.target.style.borderColor = 'rgba(46,108,164,0.22)'; e.target.style.boxShadow = 'none' }}
            />
          </div>
        </div>

        <div style={{ flex: '1 1 140px', minWidth: '120px' }}>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: MUTED, marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Estado</label>
          <select value={estado} onChange={(e) => { setEstado(e.target.value); setPage(1) }} style={{ ...INPUT_S, cursor: 'pointer' }}
            onFocus={e => { e.target.style.borderColor = '#54b3e0'; e.target.style.boxShadow = '0 0 0 3px rgba(84,179,224,0.18)' }}
            onBlur={e => { e.target.style.borderColor = 'rgba(46,108,164,0.22)'; e.target.style.boxShadow = 'none' }}
          >
            <option value="">Todos</option>
            <option value="PENDIENTE">Pendiente</option>
            <option value="APROBADO">Aprobado</option>
            <option value="RECHAZADO">Rechazado</option>
            <option value="LIQUIDADO">Liquidado</option>
            <option value="ERRADO">Errado</option>
          </select>
        </div>

        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={() => { setSearch(""); setEstado(""); setPage(1) }}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: 'rgba(26,58,92,0.06)', border: '1px solid rgba(26,58,92,0.12)', borderRadius: '8px', color: MUTED, cursor: 'pointer', fontSize: '13px', fontFamily: 'var(--font-primary)', whiteSpace: 'nowrap', transition: 'all 0.15s ease' }}
        >
          <RefreshCw size={13} /> Limpiar
        </motion.button>
      </motion.div>

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: '12px', overflow: 'hidden', marginBottom: '14px', backdropFilter: 'blur(12px)', boxShadow: '0 2px 16px rgba(26,58,92,0.06)' }}
      >
        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center', color: MUTED, fontSize: '13px' }}>
            <div style={{ width: '32px', height: '32px', border: '3px solid rgba(46,108,164,0.15)', borderTopColor: ACCENT, borderRadius: '50%', margin: '0 auto 12px', animation: 'spin 0.8s linear infinite' }} />
            Cargando certificados...
          </div>
        ) : certificados.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: MUTED, fontSize: '13px' }}>
            No hay certificados disponibles
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="ueb-table" style={{ minWidth: '700px' }}>
              <thead>
                <tr>
                  {['#', 'Número', 'Entidad Requiriente', 'Usuario', 'Fecha', 'Estado', 'Monto', 'Acciones'].map((h, i) => (
                    <th key={i} style={{ textAlign: i >= 6 ? 'right' : i === 5 ? 'center' : 'left' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {certificados.map((cert, idx) => (
                  <motion.tr key={cert.id_certificacion}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.03, duration: 0.22 }}
                  >
                    <td style={{ color: MUTED, fontSize: '12px' }}>{cert.id_certificacion}</td>
                    <td style={{ fontWeight: 700, color: ACCENT }}>{cert.numero_certificado}</td>
                    <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cert.institucion}</td>
                    <td style={{ color: MUTED }}>{cert.usuario}</td>
                    <td style={{ color: MUTED, fontSize: '12px', whiteSpace: 'nowrap' }}>{cert.fecha_elaboracion}</td>
                    <td style={{ textAlign: 'center' }}><EstadoBadge estado={cert.estado} /></td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: GREEN, whiteSpace: 'nowrap' }}>{fmtMonto(cert.monto_total)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                        {[
                          { icon: <Eye size={13} />, color: ACCENT, bg: 'rgba(46,108,164,0.10)', bdr: 'rgba(46,108,164,0.25)', title: 'Ver detalles', action: () => setSelectedCert(selectedCert?.id_certificacion === cert.id_certificacion ? null : cert), readOnlyAllowed: true },
                          { icon: <Printer size={13} />, color: '#0891b2', bg: 'rgba(8,145,178,0.10)', bdr: 'rgba(8,145,178,0.25)', title: 'Imprimir', action: () => setPrintCertId(cert.id_certificacion), readOnlyAllowed: true },
                          { icon: <BarChart2 size={13} />, color: GOLD, bg: 'rgba(217,119,6,0.10)', bdr: 'rgba(217,119,6,0.25)', title: 'Liquidaciones', action: () => navigate('/dashboard/liquidaciones'), readOnlyAllowed: true },
                          { icon: <Clock size={13} />, color: '#7c3aed', bg: 'rgba(124,58,237,0.10)', bdr: 'rgba(124,58,237,0.25)', title: 'Historial', action: () => handleHistorial(cert), readOnlyAllowed: true },
                          ...(!isReadOnly ? [
                            { icon: <Edit2 size={13} />, color: GOLD, bg: 'rgba(217,119,6,0.10)', bdr: 'rgba(217,119,6,0.25)', title: 'Editar', action: () => setEditCertId(cert.id_certificacion) },
                            { icon: <Trash2 size={13} />, color: RED, bg: 'rgba(185,28,28,0.10)', bdr: 'rgba(185,28,28,0.25)', title: 'Eliminar', action: () => handleEliminar(cert.id_certificacion) },
                          ] : []),
                        ].map((btn, bi) => (
                          <motion.button key={bi} whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.92 }}
                            onClick={btn.action} title={btn.title}
                            style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: btn.bg, border: `1px solid ${btn.bdr}`, borderRadius: '6px', color: btn.color, cursor: 'pointer', transition: 'all 0.15s ease' }}
                          >
                            {btn.icon}
                          </motion.button>
                        ))}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Expanded detail */}
      <AnimatePresence>
        {selectedCert && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: '12px', padding: '18px', marginBottom: '14px', backdropFilter: 'blur(12px)', boxShadow: '0 2px 16px rgba(26,58,92,0.06)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: TEXT }}>
                Detalles: <span style={{ color: ACCENT }}>{selectedCert.numero_certificado}</span>
              </h3>
              <motion.button whileHover={{ scale: 1.1 }} onClick={() => setSelectedCert(null)}
                style={{ background: 'rgba(26,58,92,0.06)', border: '1px solid rgba(26,58,92,0.12)', borderRadius: '8px', color: MUTED, cursor: 'pointer', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={14} />
              </motion.button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '12px', fontSize: '13px' }}>
              {[
                { label: 'Estado',      value: <EstadoBadge estado={selectedCert.estado} /> },
                { label: 'Monto Total', value: <span style={{ color: GREEN, fontWeight: 700 }}>{fmtMonto(selectedCert.monto_total)}</span> },
                { label: 'Liquidado',   value: <span style={{ color: GREEN, fontWeight: 700 }}>{selectedCert.liquidado}</span> },
                { label: 'Pendiente',   value: <span style={{ color: GOLD, fontWeight: 700 }}>{selectedCert.pendiente}</span> },
              ].map((r, i) => (
                <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center', background: '#f8fafd', borderRadius: '8px', padding: '10px 12px', border: '1px solid rgba(46,108,164,0.10)' }}>
                  <span style={{ color: MUTED, minWidth: '90px', fontSize: '12px' }}>{r.label}:</span>
                  {r.value}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <PagBtn onClick={() => setPage(1)} disabled={page === 1}>«</PagBtn>
          <PagBtn onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>‹</PagBtn>

          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(n => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
            .reduce((acc, n, idx, arr) => {
              if (idx > 0 && n - arr[idx - 1] > 1) acc.push('...')
              acc.push(n); return acc
            }, [])
            .map((n, i) => n === '...'
              ? <span key={`e${i}`} style={{ padding: '6px 4px', color: MUTED, fontSize: '13px' }}>…</span>
              : <PagBtn key={n} onClick={() => setPage(n)} active={page === n}>{n}</PagBtn>
            )
          }

          <PagBtn onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>›</PagBtn>
          <PagBtn onClick={() => setPage(totalPages)} disabled={page === totalPages}>»</PagBtn>
        </div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {printCertId && <PrintCertificacion certId={printCertId} onClose={() => setPrintCertId(null)} />}
        {editCertId && (
          <EditCertificacion
            certId={editCertId}
            onClose={() => setEditCertId(null)}
            onSaved={() => { cargarCertificados(); setEditCertId(null) }}
          />
        )}
      </AnimatePresence>

      {/* Historial modal */}
      <AnimatePresence>
        {historial.open && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(10,25,47,0.50)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', zIndex: 1000, overflowY: 'auto', padding: '40px 16px' }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.94, y: 20 }}
              transition={{ type: 'spring', stiffness: 160, damping: 22 }}
              onClick={e => e.stopPropagation()}
              style={{ background: 'rgba(255,255,255,0.97)', border: '1px solid rgba(255,255,255,0.95)', borderRadius: '20px', width: '100%', maxWidth: '620px', boxShadow: '0 24px 80px rgba(10,25,47,0.25)', overflow: 'hidden' }}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 22px', background: 'linear-gradient(135deg, #0d1f35, #1a3a5c)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Clock size={16} color="#54b3e0" />
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 800, color: '#fff' }}>Historial de Auditoría</div>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.60)', marginTop: '2px' }}>{historial.cert?.numero_certificado}</div>
                  </div>
                </div>
                <motion.button whileHover={{ scale: 1.1 }} onClick={() => setHistorial(h => ({ ...h, open: false }))}
                  style={{ background: 'rgba(255,255,255,0.10)', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', width: '28px', height: '28px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <X size={14} />
                </motion.button>
              </div>

              {/* Body */}
              <div style={{ padding: '22px' }}>
                {historial.loading ? (
                  <div style={{ textAlign: 'center', color: MUTED, padding: '30px', fontSize: '13px' }}>Cargando historial...</div>
                ) : historial.error ? (
                  <div style={{ color: RED, fontSize: '13px', padding: '10px' }}>{historial.error}</div>
                ) : historial.data.length === 0 ? (
                  <div style={{ textAlign: 'center', color: MUTED, padding: '30px', fontSize: '13px' }}>
                    No hay registros de auditoría para este certificado.
                  </div>
                ) : (
                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '14px', top: '8px', bottom: '8px', width: '2px', background: 'linear-gradient(to bottom, rgba(46,108,164,0.25), transparent)' }} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                      {historial.data.map((r, i) => {
                        const meta = {
                          'CREACIÓN':      { color: GREEN,   label: 'Creación',         icon: '✦' },
                          'CAMBIO_ESTADO': { color: ACCENT,  label: 'Cambio de Estado', icon: '⇄' },
                          'EDICIÓN':       { color: GOLD,    label: 'Edición',          icon: '✎' },
                          'ELIMINACIÓN':   { color: RED,     label: 'Eliminación',      icon: '✕' },
                        }[r.accion] || { color: MUTED, label: r.accion, icon: '•' }

                        return (
                          <motion.div key={r.id_auditoria} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                            style={{ display: 'flex', gap: '14px', paddingBottom: i < historial.data.length - 1 ? '20px' : '0' }}
                          >
                            <div style={{ width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0, background: `${meta.color}15`, border: `2px solid ${meta.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: meta.color, fontWeight: 700, zIndex: 1 }}>
                              {meta.icon}
                            </div>
                            <div style={{ flex: 1, paddingTop: '4px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '4px' }}>
                                <span style={{ fontSize: '13px', fontWeight: 700, color: meta.color }}>{meta.label}</span>
                                <span style={{ fontSize: '11px', color: MUTED, whiteSpace: 'nowrap' }}>{r.fecha_hora}</span>
                              </div>
                              <div style={{ fontSize: '12px', color: MUTED, marginBottom: '4px' }}>
                                Usuario: <span style={{ color: TEXT, fontWeight: 600 }}>{r.nombre_usuario}</span>
                              </div>
                              {r.accion === 'CAMBIO_ESTADO' && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                                  <span style={{ background: '#f8fafd', border: '1px solid rgba(46,108,164,0.14)', borderRadius: '4px', padding: '2px 7px', color: TEXT }}>{r.estado_anterior}</span>
                                  <span style={{ color: MUTED }}>→</span>
                                  <span style={{ background: `${meta.color}15`, border: `1px solid ${meta.color}40`, borderRadius: '4px', padding: '2px 7px', color: meta.color, fontWeight: 700 }}>{r.estado_nuevo}</span>
                                </div>
                              )}
                              {r.accion === 'CREACIÓN' && r.estado_nuevo && (
                                <div style={{ fontSize: '12px', color: MUTED }}>
                                  Estado inicial: <span style={{ color: GREEN, fontWeight: 700 }}>{r.estado_nuevo}</span>
                                </div>
                              )}
                              {r.motivo && (
                                <div style={{ fontSize: '12px', color: MUTED, marginTop: '3px' }}>
                                  Motivo: <span style={{ color: TEXT }}>{r.motivo}</span>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function PagBtn({ children, onClick, disabled, active }) {
  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.05 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      onClick={onClick} disabled={disabled}
      style={{
        minWidth: '32px', height: '32px', padding: '0 8px',
        background: active ? ACCENT : 'rgba(255,255,255,0.90)',
        color: active ? '#fff' : disabled ? MUTED : TEXT,
        border: active ? `1px solid ${ACCENT}` : '1px solid rgba(46,108,164,0.14)',
        borderRadius: '8px', cursor: disabled ? 'default' : 'pointer',
        fontSize: '13px', fontWeight: active ? 700 : 400,
        fontFamily: 'var(--font-primary)', opacity: disabled ? 0.45 : 1,
        transition: 'all 0.15s ease',
      }}
    >
      {children}
    </motion.button>
  )
}

import { useState, useEffect } from "react"
import axios from "axios"
import Cookies from "js-cookie"
import { useNavigate } from "react-router-dom"
import { theme } from '../config/theme'
import { ChevronLeft, ChevronRight, Trash2, Edit2, Eye, BarChart2, Printer, Search, X, RefreshCw } from 'lucide-react'
import PrintCertificacion from './PrintCertificacion'
import EditCertificacion from './EditCertificacion'

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api"

const BG     = theme.colors.dark['900']
const CARD   = theme.colors.dark['800']
const BORDER = theme.colors.dark['700']
const ELEV   = theme.colors.dark['600']
const ACCENT = theme.colors.accent.blue
const TEXT   = 'rgba(255,255,255,0.88)'
const MUTED  = 'rgba(255,255,255,0.45)'
const HOVER  = theme.colors.dark['500']

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

const estadoMeta = {
  PENDIENTE:  { label: 'Pendiente',  bg: 'rgba(217,119,6,0.14)',   border: 'rgba(217,119,6,0.35)',   color: '#fbbf24' },
  APROBADO:   { label: 'Aprobado',   bg: 'rgba(16,185,129,0.12)',  border: 'rgba(16,185,129,0.35)',  color: '#34d399' },
  RECHAZADO:  { label: 'Rechazado',  bg: 'rgba(196,30,58,0.12)',   border: 'rgba(196,30,58,0.35)',   color: '#ff6b7a' },
}

function EstadoBadge({ estado }) {
  const m = estadoMeta[estado] || { label: estado, bg: `${ELEV}`, border: BORDER, color: MUTED }
  return (
    <span style={{
      display: 'inline-block', padding: '3px 9px',
      background: m.bg, border: `1px solid ${m.border}`,
      borderRadius: theme.border.radiusFull,
      fontSize: '11px', fontWeight: 700, color: m.color,
      whiteSpace: 'nowrap',
    }}>
      {m.label}
    </span>
  )
}

export default function ListaCertificaciones({ refresh }) {
  const navigate = useNavigate()
  const [certificados, setCertificados] = useState([])
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState("")
  const [page,         setPage]         = useState(1)
  const [total,        setTotal]        = useState(0)
  const [search,       setSearch]       = useState("")
  const [estado,       setEstado]       = useState("")
  const [selectedCert, setSelectedCert] = useState(null)
  const [printCertId,  setPrintCertId]  = useState(null)
  const [editCertId,   setEditCertId]   = useState(null)

  const limit = 10

const parseMonto = (v) => {
  if (!v && v !== 0) return 0
  // Backend sends Spanish-formatted strings like "1.234,56" (dot=thousands, comma=decimal)
  return parseFloat(String(v).replace(/\./g, '').replace(',', '.')) || 0
}

const fmtMonto = (v) =>
  parseMonto(v).toLocaleString('es-EC', { style: 'currency', currency: 'USD' })

  useEffect(() => { cargarCertificados() }, [refresh, page, search, estado])

  const cargarCertificados = async () => {
    setLoading(true)
    setError("")
    try {
      const token = Cookies.get("auth_token")
      if (!token) { setError("Sin token de autenticación. Inicia sesión nuevamente."); setLoading(false); return }
      const res = await axios.get(`${API_BASE}/certificacion`, {
        params: { page, limit, search, estado },
        headers: { Authorization: `Bearer ${token}` },
      })
      setCertificados(res.data.data)
      setTotal(res.data.pagination.total)
    } catch (err) {
      setError(err.response?.data?.message || "Error al cargar certificados")
    } finally {
      setLoading(false)
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
    <div style={{ fontFamily: theme.typography.fontFamily }}>

      {/* Error */}
      {error && (
        <div style={{
          background: 'rgba(196,30,58,0.12)', border: '1px solid rgba(196,30,58,0.35)',
          borderRadius: theme.border.radiusMd, padding: '10px 14px', marginBottom: '16px',
          color: '#ff6b7a', fontSize: '13px', display: 'flex', justifyContent: 'space-between',
        }}>
          <span>{error}</span>
          <button onClick={() => setError("")} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>✕</button>
        </div>
      )}

      {/* Filters */}
      <div style={{
        background: CARD, border: `1px solid ${BORDER}`,
        borderRadius: theme.border.radiusMd, padding: '16px',
        marginBottom: '14px',
        display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'flex-end',
      }}>
        <div style={{ flex: '1 1 180px', minWidth: '150px' }}>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: MUTED, marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Buscar</label>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: '9px', top: '50%', transform: 'translateY(-50%)', color: MUTED, pointerEvents: 'none' }} />
            <input
              type="text" placeholder="Número o institución..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              style={{ ...INPUT_S, paddingLeft: '28px' }}
            />
          </div>
        </div>

        <div style={{ flex: '1 1 140px', minWidth: '120px' }}>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: MUTED, marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Estado</label>
          <select value={estado} onChange={(e) => { setEstado(e.target.value); setPage(1) }} style={{ ...INPUT_S }}>
            <option value="">Todos</option>
            <option value="PENDIENTE">Pendiente</option>
            <option value="APROBADO">Aprobado</option>
            <option value="RECHAZADO">Rechazado</option>
          </select>
        </div>

        <button
          onClick={() => { setSearch(""); setEstado(""); setPage(1); }}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '8px 14px', background: ELEV,
            border: `1px solid ${BORDER}`, borderRadius: theme.border.radiusMd,
            color: MUTED, cursor: 'pointer', fontSize: '13px',
            fontFamily: theme.typography.fontFamily, transition: 'all 0.15s ease',
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = TEXT; e.currentTarget.style.background = HOVER; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = MUTED; e.currentTarget.style.background = ELEV; }}
        >
          <RefreshCw size={13} /> Limpiar
        </button>
      </div>

      {/* Table */}
      <div style={{
        background: CARD, border: `1px solid ${BORDER}`,
        borderRadius: theme.border.radiusMd, overflow: 'hidden', marginBottom: '14px',
      }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: MUTED, fontSize: '13px' }}>
            Cargando certificados...
          </div>
        ) : certificados.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: MUTED, fontSize: '13px' }}>
            No hay certificados disponibles
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
              <thead>
                <tr style={{ background: ELEV, borderBottom: `1px solid ${BORDER}` }}>
                  {['#', 'Número', 'Entidad Requiriente', 'Usuario', 'Fecha', 'Estado', 'Monto', 'Acciones'].map((h, i) => (
                    <th key={i} style={{
                      padding: '10px 12px',
                      textAlign: i >= 5 ? (i === 6 ? 'right' : 'center') : 'left',
                      fontSize: '11px', fontWeight: 700, color: MUTED,
                      textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap',
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {certificados.map((cert, idx) => (
                  <tr
                    key={cert.id_certificacion}
                    style={{ borderBottom: `1px solid ${BORDER}`, transition: 'background 0.15s ease' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = ELEV }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                  >
                    <td style={{ padding: '11px 12px', fontSize: '12px', color: MUTED }}>{cert.id_certificacion}</td>
                    <td style={{ padding: '11px 12px', fontSize: '13px', fontWeight: 700, color: ACCENT }}>{cert.numero_certificado}</td>
                    <td style={{ padding: '11px 12px', fontSize: '13px', color: TEXT, maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cert.institucion}</td>
                    <td style={{ padding: '11px 12px', fontSize: '13px', color: MUTED }}>{cert.usuario}</td>
                    <td style={{ padding: '11px 12px', fontSize: '12px', color: MUTED, whiteSpace: 'nowrap' }}>{cert.fecha_elaboracion}</td>
                    <td style={{ padding: '11px 12px', textAlign: 'center' }}><EstadoBadge estado={cert.estado} /></td>
                    <td style={{ padding: '11px 12px', textAlign: 'right', fontSize: '13px', fontWeight: 700, color: theme.colors.accent.green, whiteSpace: 'nowrap' }}>
                      {fmtMonto(cert.monto_total)}
                    </td>
                    <td style={{ padding: '11px 12px' }}>
                      <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                        {[
                          { icon: <Eye size={13} />, color: ACCENT, bg: `${ACCENT}18`, bdr: `${ACCENT}35`, title: 'Ver detalles', action: () => setSelectedCert(selectedCert?.id_certificacion === cert.id_certificacion ? null : cert) },
                          { icon: <Printer size={13} />, color: theme.colors.accent.teal, bg: `${theme.colors.accent.teal}18`, bdr: `${theme.colors.accent.teal}35`, title: 'Imprimir', action: () => setPrintCertId(cert.id_certificacion) },
                          { icon: <BarChart2 size={13} />, color: theme.colors.accent.gold, bg: `${theme.colors.accent.gold}18`, bdr: `${theme.colors.accent.gold}35`, title: 'Liquidaciones', action: () => navigate('/dashboard/liquidaciones') },
                          { icon: <Edit2 size={13} />, color: '#fbbf24', bg: 'rgba(251,191,36,0.12)', bdr: 'rgba(251,191,36,0.3)', title: 'Editar', action: () => setEditCertId(cert.id_certificacion) },
                          { icon: <Trash2 size={13} />, color: '#ff6b7a', bg: 'rgba(196,30,58,0.12)', bdr: 'rgba(196,30,58,0.3)', title: 'Eliminar', action: () => handleEliminar(cert.id_certificacion) },
                        ].map((btn, bi) => (
                          <button key={bi} onClick={btn.action} title={btn.title} style={{
                            width: '28px', height: '28px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: btn.bg, border: `1px solid ${btn.bdr}`,
                            borderRadius: theme.border.radiusSmall,
                            color: btn.color, cursor: 'pointer', transition: 'all 0.15s ease',
                          }}
                            onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(1.25)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.filter = 'none'; }}
                          >
                            {btn.icon}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Expanded detail */}
      {selectedCert && (
        <div style={{
          background: CARD, border: `1px solid ${BORDER}`,
          borderRadius: theme.border.radiusMd, padding: '18px', marginBottom: '14px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: TEXT }}>
              Detalles: {selectedCert.numero_certificado}
            </h3>
            <button onClick={() => setSelectedCert(null)} style={{ background: 'none', border: 'none', color: MUTED, cursor: 'pointer', fontSize: '16px', padding: '2px 6px', borderRadius: '4px' }}>✕</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', fontSize: '13px' }}>
            {[
              { label: 'Estado',       value: <EstadoBadge estado={selectedCert.estado} /> },
              { label: 'Monto Total',  value: <span style={{ color: theme.colors.accent.green, fontWeight: 700 }}>{fmtMonto(selectedCert.monto_total)}</span> },
              { label: 'Liquidado',    value: <span style={{ color: theme.colors.accent.green, fontWeight: 700 }}>{selectedCert.liquidado}</span> },
              { label: 'Pendiente',    value: <span style={{ color: '#fbbf24', fontWeight: 700 }}>{selectedCert.pendiente}</span> },
            ].map((r, i) => (
              <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ color: MUTED, minWidth: '90px' }}>{r.label}:</span>
                {r.value}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <PagBtn onClick={() => setPage(1)} disabled={page === 1} title="Primera">«</PagBtn>
          <PagBtn onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} title="Anterior">‹</PagBtn>

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

          <PagBtn onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} title="Siguiente">›</PagBtn>
          <PagBtn onClick={() => setPage(totalPages)} disabled={page === totalPages} title="Última">»</PagBtn>
        </div>
      )}

      {/* Modals */}
      {printCertId && <PrintCertificacion certId={printCertId} onClose={() => setPrintCertId(null)} />}
      {editCertId  && (
        <EditCertificacion
          certId={editCertId}
          onClose={() => setEditCertId(null)}
          onSaved={() => { cargarCertificados(); setEditCertId(null) }}
        />
      )}
    </div>
  )
}

function PagBtn({ children, onClick, disabled, active, title }) {
  return (
    <button
      onClick={onClick} disabled={disabled} title={title}
      style={{
        minWidth: '32px', height: '32px',
        padding: '0 8px',
        background: active ? ACCENT : ELEV,
        color: active ? '#fff' : (disabled ? MUTED : TEXT),
        border: `1px solid ${active ? ACCENT : BORDER}`,
        borderRadius: theme.border.radiusMd,
        cursor: disabled ? 'default' : 'pointer',
        fontSize: '13px',
        fontWeight: active ? 700 : 400,
        fontFamily: theme.typography.fontFamily,
        opacity: disabled ? 0.45 : 1,
        transition: 'all 0.15s ease',
      }}
    >
      {children}
    </button>
  )
}


import { useState, useEffect, useCallback } from 'react'
import Cookies from 'js-cookie'
import { theme } from '../config/theme'
import { Clock, Search, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

const CARD   = theme.colors.dark['800']
const BORDER = theme.colors.dark['700']
const ELEV   = theme.colors.dark['600']
const ACCENT = theme.colors.accent.blue
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

const ACCION_META = {
  'CREACIÓN':              { color: '#34d399', bg: 'rgba(52,211,153,0.12)',  bdr: 'rgba(52,211,153,0.35)',  label: 'Creación'            },
  'CAMBIO_ESTADO':         { color: '#60a5fa', bg: 'rgba(96,165,250,0.12)',  bdr: 'rgba(96,165,250,0.35)',  label: 'Cambio de Estado'    },
  'EDICIÓN':               { color: '#fbbf24', bg: 'rgba(251,191,36,0.12)',  bdr: 'rgba(251,191,36,0.35)',  label: 'Edición'             },
  'ELIMINACIÓN':           { color: '#ff6b7a', bg: 'rgba(196,30,58,0.12)',   bdr: 'rgba(196,30,58,0.35)',   label: 'Eliminación'         },
  'ANULACION_LIQUIDACION': { color: '#f97316', bg: 'rgba(249,115,22,0.12)',  bdr: 'rgba(249,115,22,0.35)',  label: 'Anulación Liquidación' },
  'CREACION_LIQUIDACION':  { color: '#a78bfa', bg: 'rgba(167,139,250,0.12)', bdr: 'rgba(167,139,250,0.35)', label: 'Nueva Liquidación'     },
}

function AccionBadge({ accion }) {
  const m = ACCION_META[accion] || { color: MUTED, bg: ELEV, bdr: BORDER, label: accion }
  return (
    <span style={{
      display: 'inline-block', padding: '3px 9px',
      background: m.bg, border: `1px solid ${m.bdr}`,
      borderRadius: theme.border.radiusFull,
      fontSize: '11px', fontWeight: 700, color: m.color, whiteSpace: 'nowrap',
    }}>
      {m.label}
    </span>
  )
}

function Detalle({ r }) {
  if (r.accion === 'CAMBIO_ESTADO') {
    return (
      <span style={{ fontSize: '12px', color: MUTED }}>
        <span style={{ color: TEXT }}>{r.estado_anterior}</span>
        {' → '}
        <span style={{ color: ACCION_META['CAMBIO_ESTADO'].color, fontWeight: 700 }}>{r.estado_nuevo}</span>
      </span>
    )
  }
  if (r.accion === 'EDICIÓN' && r.campo_modificado) {
    const campo = r.campo_modificado
    if (r.monto_anterior != null) {
      const fmt = (v) => parseFloat(v).toLocaleString('es-EC', { style: 'currency', currency: 'USD' })
      return <span style={{ fontSize: '12px', color: MUTED }}>{campo}: {fmt(r.monto_anterior)} → {fmt(r.monto_nuevo)}</span>
    }
    return <span style={{ fontSize: '12px', color: MUTED }}>Campo: <span style={{ color: TEXT }}>{campo}</span></span>
  }
  if (r.accion === 'CREACIÓN') {
    return (
      <span style={{ fontSize: '12px', color: MUTED }}>
        Estado: <span style={{ color: '#34d399', fontWeight: 700 }}>{r.estado_nuevo}</span>
        {r.monto_nuevo != null && (
          <> · Monto: <span style={{ color: TEXT }}>{parseFloat(r.monto_nuevo).toLocaleString('es-EC', { style: 'currency', currency: 'USD' })}</span></>
        )}
      </span>
    )
  }
  if (r.accion === 'ELIMINACIÓN') {
    return (
      <span style={{ fontSize: '12px', color: MUTED }}>
        <span style={{ color: TEXT }}>{r.estado_anterior}</span>
        {' → '}
        <span style={{ color: '#ff6b7a', fontWeight: 700 }}>{r.estado_nuevo || 'ELIMINADO'}</span>
      </span>
    )
  }
  if (r.accion === 'CREACION_LIQUIDACION') {
    const fmt = (v) => v != null ? parseFloat(v).toLocaleString('es-EC', { style: 'currency', currency: 'USD' }) : ''
    return (
      <span style={{ fontSize: '12px', color: MUTED }}>
        Memorando: <span style={{ color: TEXT }}>{r.campo_modificado}</span>
        {r.monto_nuevo != null && <> · Monto: <span style={{ color: '#a78bfa', fontWeight: 700 }}>{fmt(r.monto_nuevo)}</span></>}
      </span>
    )
  }
  if (r.accion === 'ANULACION_LIQUIDACION') {
    const fmt = (v) => v != null ? parseFloat(v).toLocaleString('es-EC', { style: 'currency', currency: 'USD' }) : ''
    return (
      <span style={{ fontSize: '12px', color: MUTED }}>
        Memorando: <span style={{ color: TEXT }}>{r.campo_modificado}</span>
        {r.monto_anterior != null && <> · Monto: <span style={{ color: '#f97316' }}>{fmt(r.monto_anterior)}</span></>}
        {r.motivo && <> · Motivo: <span style={{ color: TEXT }}>{r.motivo}</span></>}
      </span>
    )
  }
  return <span style={{ fontSize: '12px', color: MUTED }}>—</span>
}

export default function Auditoria() {
  const [data,    setData]    = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')
  const [search,  setSearch]  = useState('')
  const [accion,  setAccion]  = useState('')
  const [desde,   setDesde]   = useState('')
  const [hasta,   setHasta]   = useState('')
  const [page,    setPage]    = useState(1)
  const [total,   setTotal]   = useState(0)
  const limit = 20

  const cargar = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const token = Cookies.get('auth_token')
      const params = new URLSearchParams({ page, limit, search, accion, desde, hasta })
      const res = await fetch(`${API}/auditoria?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const json = await res.json()
      if (json.success) {
        setData(json.data)
        setTotal(json.pagination.total)
      } else {
        setError(json.message || 'Error al cargar auditoría')
      }
    } catch {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }, [page, search, accion, desde, hasta])

  useEffect(() => { cargar() }, [cargar])

  const limpiar = () => { setSearch(''); setAccion(''); setDesde(''); setHasta(''); setPage(1) }

  const totalPages = Math.max(1, Math.ceil(total / limit))

  return (
    <div style={{ minHeight: '100%', background: theme.colors.dark['900'], padding: '28px', fontFamily: theme.typography.fontFamily }}>

      {/* Título */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <Clock size={20} color="#a78bfa" />
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: TEXT, letterSpacing: '-0.02em' }}>Auditoría</h1>
        </div>
        <p style={{ margin: 0, fontSize: '13px', color: MUTED }}>
          Historial completo de acciones realizadas sobre los certificados presupuestarios.
        </p>
      </div>

      {/* Filtros */}
      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: theme.border.radiusMd, padding: '16px', marginBottom: '14px', display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'flex-end' }}>
        <div style={{ flex: '1 1 180px' }}>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: MUTED, marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Buscar</label>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: '9px', top: '50%', transform: 'translateY(-50%)', color: MUTED, pointerEvents: 'none' }} />
            <input
              type="text" placeholder="N° certificado o usuario..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              style={{ ...INPUT_S, paddingLeft: '28px' }}
            />
          </div>
        </div>

        <div style={{ flex: '0 1 150px' }}>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: MUTED, marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Acción</label>
          <select value={accion} onChange={(e) => { setAccion(e.target.value); setPage(1) }} style={INPUT_S}>
            <option value="">Todas</option>
            <option value="CREACIÓN">Creación</option>
            <option value="CAMBIO_ESTADO">Cambio de Estado</option>
            <option value="EDICIÓN">Edición</option>
            <option value="ELIMINACIÓN">Eliminación</option>
            <option value="ANULACION_LIQUIDACION">Anulación Liquidación</option>
            <option value="CREACION_LIQUIDACION">Nueva Liquidación</option>
          </select>
        </div>

        <div style={{ flex: '0 1 140px' }}>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: MUTED, marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Desde</label>
          <input type="date" value={desde} onChange={(e) => { setDesde(e.target.value); setPage(1) }} style={INPUT_S} />
        </div>

        <div style={{ flex: '0 1 140px' }}>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: MUTED, marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Hasta</label>
          <input type="date" value={hasta} onChange={(e) => { setHasta(e.target.value); setPage(1) }} style={INPUT_S} />
        </div>

        <button onClick={limpiar} style={{
          display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px',
          background: ELEV, border: `1px solid ${BORDER}`, borderRadius: theme.border.radiusMd,
          color: MUTED, cursor: 'pointer', fontSize: '13px', fontFamily: theme.typography.fontFamily, whiteSpace: 'nowrap',
        }}>
          <RefreshCw size={13} /> Limpiar
        </button>
      </div>

      {/* Tabla */}
      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: theme.border.radiusMd, overflow: 'hidden', marginBottom: '14px' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: MUTED, fontSize: '13px' }}>Cargando...</div>
        ) : error ? (
          <div style={{ padding: '20px', color: '#ff6b7a', fontSize: '13px' }}>{error}</div>
        ) : data.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: MUTED, fontSize: '13px' }}>
            No hay registros de auditoría.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '750px' }}>
              <thead>
                <tr style={{ background: ELEV, borderBottom: `1px solid ${BORDER}` }}>
                  {['Fecha / Hora', 'Certificado', 'Acción', 'Detalle', 'Usuario'].map((h, i) => (
                    <th key={i} style={{
                      padding: '10px 14px', textAlign: 'left',
                      fontSize: '11px', fontWeight: 700, color: MUTED,
                      textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((r) => (
                  <tr
                    key={r.id_auditoria}
                    style={{ borderBottom: `1px solid ${BORDER}`, transition: 'background 0.12s' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = ELEV}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '11px 14px', fontSize: '12px', color: MUTED, whiteSpace: 'nowrap' }}>
                      {r.fecha_hora}
                    </td>
                    <td style={{ padding: '11px 14px', fontSize: '13px', fontWeight: 700, color: ACCENT, whiteSpace: 'nowrap' }}>
                      {r.numero_certificado}
                    </td>
                    <td style={{ padding: '11px 14px' }}>
                      <AccionBadge accion={r.accion} />
                    </td>
                    <td style={{ padding: '11px 14px' }}>
                      <Detalle r={r} />
                    </td>
                    <td style={{ padding: '11px 14px', fontSize: '13px', color: TEXT }}>
                      {r.nombre_usuario}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Contador + Paginación */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <span style={{ fontSize: '12px', color: MUTED }}>
          {total} registro{total !== 1 ? 's' : ''} en total
        </span>
        {totalPages > 1 && (
          <div style={{ display: 'flex', gap: '6px' }}>
            <PagBtn onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}><ChevronLeft size={14}/></PagBtn>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(n => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
              .reduce((acc, n, i, arr) => { if (i > 0 && n - arr[i-1] > 1) acc.push('…'); acc.push(n); return acc }, [])
              .map((n, i) => n === '…'
                ? <span key={`e${i}`} style={{ padding: '0 4px', color: MUTED, fontSize: '13px', alignSelf: 'center' }}>…</span>
                : <PagBtn key={n} onClick={() => setPage(n)} active={page === n}>{n}</PagBtn>
              )
            }
            <PagBtn onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}><ChevronRight size={14}/></PagBtn>
          </div>
        )}
      </div>
    </div>
  )
}

function PagBtn({ children, onClick, disabled, active }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      minWidth: '32px', height: '32px', padding: '0 8px',
      background: active ? ACCENT : ELEV,
      color: active ? '#fff' : (disabled ? MUTED : TEXT),
      border: `1px solid ${active ? ACCENT : BORDER}`,
      borderRadius: theme.border.radiusMd,
      cursor: disabled ? 'default' : 'pointer',
      fontSize: '13px', fontWeight: active ? 700 : 400,
      fontFamily: theme.typography.fontFamily,
      opacity: disabled ? 0.45 : 1,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {children}
    </button>
  )
}

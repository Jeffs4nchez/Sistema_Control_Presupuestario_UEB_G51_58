import React, { useState, useEffect } from 'react'
import Cookies from 'js-cookie'
import { theme } from '../config/theme'
import { Search, ChevronLeft, ChevronRight, Filter } from 'lucide-react'

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

const LABEL_S = {
  display: 'block',
  fontSize: '11px',
  fontWeight: 700,
  color: MUTED,
  marginBottom: '6px',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
}

/* ─── Definición de columnas por tipo ─────────────────────────────────────── */
const tableConfig = {
  programas: {
    cols: [
      { k: 'cod_programa',   l: 'Código' },
      { k: 'nombre_programa', l: 'Nombre del Programa' },
    ],
  },
  subprogramas: {
    cols: [
      { k: 'cod_subprograma',   l: 'Código' },
      { k: 'nombre_subprograma', l: 'Nombre del Subprograma' },
      { k: 'programa',           l: 'Programa', r: (v) => v?.nombre_programa },
    ],
  },
  proyectos: {
    cols: [
      { k: 'cod_proyecto',   l: 'Código' },
      { k: 'nombre_proyecto', l: 'Nombre del Proyecto' },
      { k: 'subprograma',     l: 'Subprograma', r: (v) => v?.nombre_subprograma },
    ],
  },
  actividades: {
    cols: [
      { k: 'cod_actividad',   l: 'Código' },
      { k: 'nombre_actividad', l: 'Nombre de Actividad' },
      { k: 'proyecto',         l: 'Proyecto', r: (v) => v?.nombre_proyecto },
    ],
  },
  /* ─── Tabla completa: jerarquía + todas las entidades ─── */
  items: {
    cols: [
      { k: 'actividad', l: 'PG',       r: (v) => v?.proyecto?.subprograma?.programa?.cod_programa },
      { k: 'actividad', l: 'SP',       r: (v) => v?.proyecto?.subprograma?.cod_subprograma },
      { k: 'actividad', l: 'PY',       r: (v) => v?.proyecto?.cod_proyecto },
      { k: 'actividad', l: 'ACT',      r: (v) => v?.cod_actividad },
      { k: 'cod_item',  l: 'Item' },
      { k: 'nombre_item', l: 'Descripción del Item', r: (v) => v },
      { k: 'ubicacion', l: 'Ubicación', r: (v) => v ? `${v.cod_ubicacion} — ${v.nombre_ubicacion}` : '—' },
      { k: 'fuentes_financiamiento', l: 'Fuente', r: (v) => {
        if (!v?.length) return '—'
        return v.map(f => f.cod_fuente || f.nombre_fuente || '?').join(', ')
      }},
      { k: 'organismo', l: 'Organismo', r: (v) => v ? (v.cod_organismo || v.nombre_organismo || '?') : '—' },
      { k: 'naturaleza_prestacion', l: 'N. Prestación', r: (v) => v ? (v.cod_naturaleza || v.nombre_naturaleza || '?') : '—' },
    ],
  },
}

const tiposDisponibles = [
  { key: 'items',        label: 'Items (Vista Completa)' },
  { key: 'programas',    label: 'Programas' },
  { key: 'subprogramas', label: 'Subprogramas' },
  { key: 'proyectos',    label: 'Proyectos' },
  { key: 'actividades',  label: 'Actividades' },
]

export default function EstructuraPresupuestariaData() {
  const [data,       setData]       = useState([])
  const [loading,    setLoading]    = useState(false)
  const [search,     setSearch]     = useState('')
  const [tipo,       setTipo]       = useState('items')
  const [page,       setPage]       = useState(1)
  const [pagination, setPagination] = useState(null)
  const [limit,      setLimit]      = useState(50)
  const [isMobile,   setIsMobile]   = useState(window.innerWidth < 768)

  useEffect(() => {
    fetchData()
    const h = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [page, tipo, limit])

  const fetchData = async () => {
    setLoading(true)
    try {
      const token = Cookies.get('auth_token')
      const res = await fetch(
        `http://localhost:8000/api/estructura-presupuestaria/data?tipo=${tipo}&page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      const result = await res.json()
      if (result.success) { setData(result.data); setPagination(result.pagination) }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => { e.preventDefault(); setPage(1); fetchData() }

  const config = tableConfig[tipo]
  const P = isMobile ? '20px' : '28px'
  const isItems = tipo === 'items'

  /* columnas de la jerarquía (PG, SP, PY, ACT, Item) son código → monospace+accent */
  const isCodeCol = (l) => ['PG', 'SP', 'PY', 'ACT', 'Item'].includes(l)

  return (
    <div style={{ background: theme.colors.dark['900'], minHeight: '100%', padding: P, fontFamily: theme.typography.fontFamily }}>

      {/* Title */}
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ margin: '0 0 4px', fontSize: isMobile ? '18px' : '20px', fontWeight: 700, color: TEXT, letterSpacing: '-0.02em' }}>
          Estructura Presupuestaria — Datos
        </h1>
        <p style={{ margin: 0, fontSize: '13px', color: MUTED }}>
          Explora la jerarquía completa: Programas › Subprogramas › Proyectos › Actividades › Items
        </p>
      </div>

      {/* Filters */}
      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: theme.border.radiusMd, padding: '16px', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <Filter size={14} style={{ color: MUTED }} />
          <span style={{ fontSize: '11px', fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Filtros</span>
          {pagination && (
            <span style={{ marginLeft: 'auto', fontSize: '12px', color: MUTED }}>
              {pagination.total || 0} registros
            </span>
          )}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr auto', gap: '10px', alignItems: 'flex-end' }}>

          {/* Tipo */}
          <div>
            <label style={LABEL_S}>Vista</label>
            <select
              value={tipo}
              onChange={(e) => { setTipo(e.target.value); setPage(1); setSearch('') }}
              style={{ ...INPUT_S }}
            >
              {tiposDisponibles.map(t => (
                <option key={t.key} value={t.key} style={{ background: CARD }}>{t.label}</option>
              ))}
            </select>
          </div>

          {/* Por página */}
          <div>
            <label style={LABEL_S}>Por Página</label>
            <select
              value={limit}
              onChange={(e) => { setLimit(parseInt(e.target.value)); setPage(1) }}
              style={{ ...INPUT_S }}
            >
              {[25, 50, 100, 200].map(n => (
                <option key={n} value={n} style={{ background: CARD }}>{n} registros</option>
              ))}
            </select>
          </div>

          {/* Búsqueda */}
          <form onSubmit={handleSearch} style={{ display: 'contents' }}>
            <div>
              <label style={LABEL_S}>Buscar</label>
              <div style={{ position: 'relative' }}>
                <Search size={13} style={{ position: 'absolute', left: '9px', top: '50%', transform: 'translateY(-50%)', color: MUTED, pointerEvents: 'none' }} />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Código o nombre..."
                  style={{ ...INPUT_S, paddingLeft: '28px' }}
                />
              </div>
            </div>
            <button
              type="submit"
              style={{ padding: '8px 16px', background: ACCENT, color: '#fff', border: 'none', borderRadius: theme.border.radiusMd, cursor: 'pointer', fontSize: '13px', fontWeight: 600, fontFamily: theme.typography.fontFamily, whiteSpace: 'nowrap', transition: 'all 0.15s ease', alignSelf: 'flex-end' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#1e90d4' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = ACCENT }}
            >
              Buscar
            </button>
          </form>
        </div>

        {/* Leyenda de columnas para items */}
        {isItems && (
          <div style={{ marginTop: '12px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {[
              ['PG', 'Programa'],
              ['SP', 'Subprograma'],
              ['PY', 'Proyecto'],
              ['ACT', 'Actividad'],
              ['Item', 'Código Item'],
              ['Ubicación', 'Ubicación Geográfica'],
              ['Fuente', 'Fuente Financiamiento'],
              ['Organismo', 'Organismo Financiador'],
              ['N. Prestación', 'Naturaleza Prestación'],
            ].map(([abbr, full]) => (
              <span key={abbr} style={{ fontSize: '10px', padding: '2px 7px', background: ELEV, border: `1px solid ${BORDER}`, borderRadius: theme.border.radiusFull, color: MUTED }}>
                <span style={{ color: ACCENT, fontWeight: 700 }}>{abbr}</span> = {full}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Table */}
      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: theme.border.radiusMd, overflow: 'hidden', marginBottom: '14px' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: MUTED, fontSize: '13px' }}>Cargando datos...</div>
        ) : data.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: MUTED, fontSize: '13px' }}>No hay datos disponibles</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', minWidth: isItems ? '1100px' : '500px' }}>
              <thead>
                <tr style={{ background: ELEV, borderBottom: `1px solid ${BORDER}` }}>
                  {config.cols.map((col, i) => (
                    <th
                      key={i}
                      style={{
                        padding: '10px 12px',
                        textAlign: 'left',
                        fontSize: '11px',
                        fontWeight: 700,
                        color: isCodeCol(col.l) ? ACCENT : MUTED,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        whiteSpace: 'nowrap',
                        borderRight: i < config.cols.length - 1 ? `1px solid ${BORDER}` : 'none',
                      }}
                    >
                      {col.l}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, rowIdx) => (
                  <tr
                    key={rowIdx}
                    style={{ borderBottom: `1px solid ${BORDER}`, transition: 'background 0.15s ease' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = ELEV }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                  >
                    {config.cols.map((col, colIdx) => {
                      const raw = row[col.k]
                      const val = col.r ? col.r(raw) : raw
                      const isCode = isCodeCol(col.l)
                      const isDesc = col.l === 'Descripción del Item'
                      return (
                        <td
                          key={colIdx}
                          style={{
                            padding: '9px 12px',
                            color: isCode ? ACCENT : TEXT,
                            fontWeight: isCode ? 700 : 400,
                            fontFamily: isCode ? 'monospace' : 'inherit',
                            fontSize: isCode ? '11px' : '12px',
                            maxWidth: isDesc ? '260px' : undefined,
                            overflow: isDesc ? 'hidden' : undefined,
                            textOverflow: isDesc ? 'ellipsis' : undefined,
                            whiteSpace: isDesc ? 'nowrap' : undefined,
                            borderRight: colIdx < config.cols.length - 1 ? `1px solid ${BORDER}` : 'none',
                          }}
                          title={isDesc ? String(val || '') : undefined}
                        >
                          {val || '—'}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination && (pagination.pages > 1 || pagination.last_page > 1) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <span style={{ fontSize: '12px', color: MUTED }}>
            Página {pagination.page || pagination.current_page} de {pagination.pages || pagination.last_page}
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', background: page === 1 ? ELEV : ACCENT, color: page === 1 ? MUTED : '#fff', border: 'none', borderRadius: theme.border.radiusMd, cursor: page === 1 ? 'default' : 'pointer', fontSize: '13px', opacity: page === 1 ? 0.5 : 1, fontFamily: theme.typography.fontFamily }}
            >
              <ChevronLeft size={14} /> Anterior
            </button>
            <button
              onClick={() => setPage(p => p + 1)} disabled={page === (pagination.pages || pagination.last_page)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', background: page === (pagination.pages || pagination.last_page) ? ELEV : ACCENT, color: page === (pagination.pages || pagination.last_page) ? MUTED : '#fff', border: 'none', borderRadius: theme.border.radiusMd, cursor: page === (pagination.pages || pagination.last_page) ? 'default' : 'pointer', fontSize: '13px', opacity: page === (pagination.pages || pagination.last_page) ? 0.5 : 1, fontFamily: theme.typography.fontFamily }}
            >
              Siguiente <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

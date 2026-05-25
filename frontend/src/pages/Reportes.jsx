import { useState } from 'react'
import { createPortal } from 'react-dom'
import Cookies from 'js-cookie'
import { motion, AnimatePresence } from 'framer-motion'
import { FileDown, Printer, FileText, BarChart2, PieChart, ShieldCheck, Loader2, X, Download } from 'lucide-react'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

const FONT  = 'Arial, sans-serif'
const BRD   = '1px solid #ccc'
const BEIGE = '#ede8d5'

/* ── Print table styles ─────────────────────────────────────────── */
const TH  = { padding:'5px 6px', textAlign:'center', fontWeight:'bold', fontSize:'8.5px', background:BEIGE, borderBottom:'1.5px solid #000', borderRight:BRD }
const TD  = { padding:'4px 5px', textAlign:'center', fontSize:'8.5px', borderBottom:BRD, borderRight:BRD }
const TDL = { padding:'4px 7px', textAlign:'left',   fontSize:'8.5px', borderBottom:BRD, borderRight:BRD }
const TDR = { padding:'4px 7px', textAlign:'right',  fontSize:'8.5px', borderBottom:BRD, borderRight:BRD }

function fmt(v) {
  const n = parseFloat(v) || 0
  return '$. ' + n.toLocaleString('es-EC', { minimumFractionDigits:2, maximumFractionDigits:2 })
}

function fmtFecha() {
  return new Date().toLocaleDateString('es-EC', { year:'numeric', month:'long', day:'numeric' })
}

async function downloadCsv(endpoint, filename) {
  const token = Cookies.get('auth_token')
  const res   = await fetch(`${API}${endpoint}`, { headers:{ Authorization:`Bearer ${token}` } })
  if (!res.ok) throw new Error('Error al generar el reporte')
  const blob = await res.blob()
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

function TablaCertificaciones({ data }) {
  const total = data.reduce((s,r) => s + parseFloat(r.monto_total||0), 0)
  return (
    <table style={{ width:'100%', borderCollapse:'collapse', border:'1.5px solid #000' }}>
      <thead>
        <tr>
          {['N° Certificado','Fecha','Estado','Entidad Requiriente','Responsable','Año','Memorando','Monto Total','Elaborado Por'].map((h,i)=>(
            <th key={i} style={{...TH, textAlign: i===7?'right':'center'}}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((r,i)=>(
          <tr key={i} style={{ background: r.estado==='ANULADA'?'#fff5f5': i%2===0?'#fff':'#f8faff', opacity: r.estado==='ANULADA'?0.7:1 }}>
            <td style={{...TDL, fontWeight:'bold'}}>{r.numero_certificado}</td>
            <td style={TD}>{r.fecha_elaboracion}</td>
            <td style={{...TD}}>
              <span style={{ padding:'1px 6px', borderRadius:'999px', fontSize:'7.5px', fontWeight:'bold', background: r.estado==='ANULADA'?'#ffe4e6':'#dbeafe', color: r.estado==='ANULADA'?'#be123c':'#1e40af' }}>
                {r.estado}
              </span>
            </td>
            <td style={TDL}>{r.nombre_entidad||'—'}</td>
            <td style={TDL}>{r.responsable_entidad||'—'}</td>
            <td style={TD}>{r.anio||'—'}</td>
            <td style={TDL}>{r.seccion_memorando||'—'}</td>
            <td style={{...TDR, fontWeight:'bold'}}>{fmt(r.monto_total)}</td>
            <td style={TDL}>{r.elaborado_por||'—'}</td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr style={{ background:BEIGE }}>
          <td colSpan={7} style={{...TDR, fontWeight:'bold', fontSize:'9px', borderTop:'1.5px solid #000'}}>TOTAL PRESUPUESTARIO</td>
          <td style={{...TDR, fontWeight:'bold', fontSize:'9px', borderTop:'1.5px solid #000'}}>{fmt(total)}</td>
          <td style={{...TD, borderTop:'1.5px solid #000'}}></td>
        </tr>
      </tfoot>
    </table>
  )
}

function TablaLiquidaciones({ data }) {
  const totalVig = data.filter(r=>r.estado!=='ANULADA').reduce((s,r)=>s+parseFloat(r.cantidad_liquidacion||0),0)
  return (
    <table style={{ width:'100%', borderCollapse:'collapse', border:'1.5px solid #000' }}>
      <thead>
        <tr>
          {['ID','Fecha','Memorando','Código Ítem','Nombre Ítem','N° Certificado','Estado','Monto Liquidado','Motivo Anulación'].map((h,i)=>(
            <th key={i} style={{...TH, textAlign: i===7?'right':'center'}}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((r,i)=>(
          <tr key={i} style={{ background: r.estado==='ANULADA'?'#fff5f5': i%2===0?'#fff':'#f8faff', opacity: r.estado==='ANULADA'?0.7:1 }}>
            <td style={TD}>{r.id_liquidacion}</td>
            <td style={TD}>{r.fecha_creacion}</td>
            <td style={TDL}>{r.memorando}</td>
            <td style={{...TD, fontFamily:'monospace', fontSize:'7.5px'}}>{r.cod_item}</td>
            <td style={TDL}>{r.nombre_item}</td>
            <td style={TD}>{r.numero_certificado||'—'}</td>
            <td style={TD}>
              <span style={{ padding:'1px 6px', borderRadius:'999px', fontSize:'7.5px', fontWeight:'bold', background: r.estado==='ANULADA'?'#ffe4e6':'#d1fae5', color: r.estado==='ANULADA'?'#be123c':'#065f46' }}>
                {r.estado}
              </span>
            </td>
            <td style={{...TDR, fontWeight:'bold', textDecoration: r.estado==='ANULADA'?'line-through':'none'}}>{fmt(r.cantidad_liquidacion)}</td>
            <td style={TDL}>{r.motivo_anulacion||'—'}</td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr style={{ background:BEIGE }}>
          <td colSpan={7} style={{...TDR, fontWeight:'bold', fontSize:'9px', borderTop:'1.5px solid #000'}}>TOTAL LIQUIDADO (VIGENTES)</td>
          <td style={{...TDR, fontWeight:'bold', fontSize:'9px', borderTop:'1.5px solid #000'}}>{fmt(totalVig)}</td>
          <td style={{...TD, borderTop:'1.5px solid #000'}}></td>
        </tr>
      </tfoot>
    </table>
  )
}

function TablaPresupuesto({ data }) {
  const totalCod  = data.reduce((s,r)=>s+(r.codificado||0),0)
  const totalCert = data.reduce((s,r)=>s+(r.certificado||0),0)
  const totalSald = data.reduce((s,r)=>s+(r.saldo||0),0)
  return (
    <table style={{ width:'100%', borderCollapse:'collapse', border:'1.5px solid #000' }}>
      <thead>
        <tr>
          {['Código Ítem','Nombre Ítem','Programa','Actividad','Fuente','Codificado','Certificado','Saldo'].map((h,i)=>(
            <th key={i} style={{...TH, textAlign: i>=5?'right':'center'}}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((r,i)=>(
          <tr key={i} style={{ background: r.saldo<=0?'#fff5f5': i%2===0?'#fff':'#f8faff' }}>
            <td style={{...TD, fontFamily:'monospace', fontSize:'7.5px'}}>{r.cod_item}</td>
            <td style={TDL}>{r.nombre_item}</td>
            <td style={TDL}>{r.nombre_programa||'—'}</td>
            <td style={TD}>{r.cod_actividad||'—'}</td>
            <td style={TD}>{r.cod_fuente||'—'}</td>
            <td style={TDR}>{fmt(r.codificado)}</td>
            <td style={TDR}>{fmt(r.certificado)}</td>
            <td style={{...TDR, fontWeight: r.saldo<=0?'bold':'normal', color: r.saldo<=0?'#be123c':'inherit'}}>{fmt(r.saldo)}</td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr style={{ background:BEIGE }}>
          <td colSpan={5} style={{...TDR, fontWeight:'bold', fontSize:'9px', borderTop:'1.5px solid #000'}}>TOTALES</td>
          <td style={{...TDR, fontWeight:'bold', fontSize:'9px', borderTop:'1.5px solid #000'}}>{fmt(totalCod)}</td>
          <td style={{...TDR, fontWeight:'bold', fontSize:'9px', borderTop:'1.5px solid #000'}}>{fmt(totalCert)}</td>
          <td style={{...TDR, fontWeight:'bold', fontSize:'9px', borderTop:'1.5px solid #000'}}>{fmt(totalSald)}</td>
        </tr>
      </tfoot>
    </table>
  )
}

function TablaAuditoria({ data }) {
  const ACCION_COLOR = {
    CREACION:     { bg:'#dbeafe', color:'#1e40af' },
    MODIFICACION: { bg:'#fef3c7', color:'#92400e' },
    ANULACION:    { bg:'#ffe4e6', color:'#be123c' },
    ELIMINACION:  { bg:'#fce7f3', color:'#9d174d' },
  }
  return (
    <table style={{ width:'100%', borderCollapse:'collapse', border:'1.5px solid #000' }}>
      <thead>
        <tr>
          {['ID','N° Certificado','Acción','Campo Modificado','Estado Anterior','Estado Nuevo','Monto Anterior','Monto Nuevo','Motivo','Usuario','Fecha y Hora'].map((h,i)=>(
            <th key={i} style={{...TH, textAlign: (i===6||i===7)?'right':'center'}}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((r,i)=>{
          const ac = ACCION_COLOR[r.accion] || { bg:'#f3f4f6', color:'#374151' }
          return (
            <tr key={i} style={{ background: i%2===0?'#fff':'#f8faff' }}>
              <td style={TD}>{r.id_auditoria}</td>
              <td style={{...TD, fontWeight:'bold'}}>{r.numero_certificado||'—'}</td>
              <td style={TD}>
                <span style={{ padding:'1px 6px', borderRadius:'999px', fontSize:'7.5px', fontWeight:'bold', background:ac.bg, color:ac.color }}>{r.accion||'—'}</span>
              </td>
              <td style={TDL}>{r.campo_modificado||'—'}</td>
              <td style={TD}>{r.estado_anterior||'—'}</td>
              <td style={TD}>{r.estado_nuevo||'—'}</td>
              <td style={TDR}>{r.monto_anterior!=null ? fmt(r.monto_anterior) : '—'}</td>
              <td style={TDR}>{r.monto_nuevo!=null    ? fmt(r.monto_nuevo)    : '—'}</td>
              <td style={TDL}>{r.motivo||'—'}</td>
              <td style={TDL}>{r.nombre_usuario||'Sistema'}</td>
              <td style={TD}>{r.fecha_hora||'—'}</td>
            </tr>
          )
        })}
      </tbody>
      <tfoot>
        <tr style={{ background:BEIGE }}>
          <td colSpan={11} style={{...TDR, fontWeight:'bold', fontSize:'9px', borderTop:'1.5px solid #000'}}>
            TOTAL REGISTROS: {data.length}
          </td>
        </tr>
      </tfoot>
    </table>
  )
}

const PRINT_CONFIG = {
  certificaciones: { titulo:'REPORTE DE CERTIFICACIONES PRESUPUESTARIAS', endpoint:'/reportes/certificaciones/json', Tabla:TablaCertificaciones },
  liquidaciones:   { titulo:'REPORTE DE LIQUIDACIONES',                   endpoint:'/reportes/liquidaciones/json',  Tabla:TablaLiquidaciones  },
  presupuesto:     { titulo:'REPORTE DE PRESUPUESTO DISPONIBLE',           endpoint:'/reportes/presupuesto/json',    Tabla:TablaPresupuesto    },
  auditoria:       { titulo:'REPORTE DE AUDITORÍA',                        endpoint:'/reportes/auditoria/json',      Tabla:TablaAuditoria      },
}

/* ── Glassmorphism Report Card ─────────────────────────────────── */
function ReporteCard({ icon: Icon, title, description, color, gradient, onCsv, onPrint, loadingCsv, loadingPrint, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.1, type: 'spring', stiffness: 120, damping: 18 }}
      whileHover={{ y: -4, boxShadow: '0 20px 50px rgba(26,58,92,0.16)' }}
      style={{
        background: 'rgba(255,255,255,0.88)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.95)',
        borderRadius: '18px',
        boxShadow: '0 4px 24px rgba(26,58,92,0.10)',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        transition: 'border-color 0.18s ease',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${color}30`; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.95)'; }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
        <div style={{
          width: '48px', height: '48px', borderRadius: '14px',
          background: gradient,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          boxShadow: `0 6px 20px ${color}40`,
        }}>
          <Icon size={22} color="#fff" />
        </div>
        <div>
          <h3 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: 800, color: 'var(--text-heading)' }}>{title}</h3>
          <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 }}>{description}</p>
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: '1px', background: 'rgba(26,58,92,0.07)' }} />

      {/* Actions */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onCsv}
          disabled={loadingCsv}
          style={{
            display: 'flex', alignItems: 'center', gap: '7px',
            padding: '8px 16px',
            background: 'rgba(5,150,105,0.08)',
            border: '1px solid rgba(5,150,105,0.22)',
            borderRadius: '8px', color: '#047857',
            cursor: loadingCsv ? 'default' : 'pointer',
            fontSize: '13px', fontWeight: 700,
            fontFamily: 'var(--font-primary)',
            opacity: loadingCsv ? 0.65 : 1,
            transition: 'all 0.18s ease',
          }}
          onMouseEnter={(e) => { if (!loadingCsv) { e.currentTarget.style.background = 'rgba(5,150,105,0.14)'; } }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(5,150,105,0.08)'; }}
        >
          {loadingCsv ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Download size={14} />}
          {loadingCsv ? 'Generando...' : 'Descargar CSV'}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onPrint}
          disabled={loadingPrint}
          style={{
            display: 'flex', alignItems: 'center', gap: '7px',
            padding: '8px 16px',
            background: `${color}10`,
            border: `1px solid ${color}25`,
            borderRadius: '8px', color,
            cursor: loadingPrint ? 'default' : 'pointer',
            fontSize: '13px', fontWeight: 700,
            fontFamily: 'var(--font-primary)',
            opacity: loadingPrint ? 0.65 : 1,
            transition: 'all 0.18s ease',
          }}
          onMouseEnter={(e) => { if (!loadingPrint) { e.currentTarget.style.background = `${color}18`; } }}
          onMouseLeave={(e) => { e.currentTarget.style.background = `${color}10`; }}
        >
          {loadingPrint ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Printer size={14} />}
          {loadingPrint ? 'Cargando...' : 'Vista previa / PDF'}
        </motion.button>
      </div>
    </motion.div>
  )
}

/* ── Main component ─────────────────────────────────────────────── */
export default function Reportes() {
  const [loadingCsv,   setLoadingCsv]   = useState({ cert:false, liq:false, pres:false, audit:false })
  const [loadingPrint, setLoadingPrint] = useState({ cert:false, liq:false, pres:false, audit:false })
  const [csvError,     setCsvError]     = useState('')
  const [preview,      setPreview]      = useState({ open:false, tipo:null, data:[], error:'' })

  const handleCsv = async (key, endpoint, filename) => {
    setCsvError('')
    setLoadingCsv(l=>({...l,[key]:true}))
    try { await downloadCsv(endpoint, filename) }
    catch (e) { setCsvError(e.message||'Error al descargar.') }
    finally { setLoadingCsv(l=>({...l,[key]:false})) }
  }

  const handlePreview = async (key, tipo) => {
    setLoadingPrint(l=>({...l,[key]:true}))
    const cfg   = PRINT_CONFIG[tipo]
    const token = Cookies.get('auth_token')
    try {
      const res  = await fetch(`${API}${cfg.endpoint}`, { headers:{ Authorization:`Bearer ${token}` } })
      const json = await res.json()
      if (json.success) {
        setPreview({ open:true, tipo, data:json.data, error:'' })
      } else {
        setPreview({ open:true, tipo, data:[], error:json.message||'Error al cargar datos.' })
      }
    } catch {
      setPreview({ open:true, tipo, data:[], error:'Error de conexión.' })
    } finally {
      setLoadingPrint(l=>({...l,[key]:false}))
    }
  }

  const closePreview = () => setPreview({ open:false, tipo:null, data:[], error:'' })

  const cfg   = preview.tipo ? PRINT_CONFIG[preview.tipo] : null
  const fecha = fmtFecha()

  const cards = [
    {
      icon: FileText, title: 'Certificaciones', color: '#2e6ca4',
      gradient: 'linear-gradient(135deg, #1a3a5c, #2e6ca4)',
      description: 'Listado completo de certificaciones presupuestarias con montos y estados.',
      key: 'cert', csvEndpoint: '/reportes/certificaciones/csv', csvFile: `certificaciones_${new Date().toISOString().slice(0,10)}.csv`,
      tipo: 'certificaciones',
    },
    {
      icon: BarChart2, title: 'Liquidaciones', color: '#b45309',
      gradient: 'linear-gradient(135deg, #92400e, #d97706)',
      description: 'Registro de liquidaciones realizadas, incluyendo anuladas y motivos.',
      key: 'liq', csvEndpoint: '/reportes/liquidaciones/csv', csvFile: `liquidaciones_${new Date().toISOString().slice(0,10)}.csv`,
      tipo: 'liquidaciones',
    },
    {
      icon: PieChart, title: 'Presupuesto Disponible', color: '#047857',
      gradient: 'linear-gradient(135deg, #065f46, #059669)',
      description: 'Saldos por partida presupuestaria: codificado, certificado y disponible.',
      key: 'pres', csvEndpoint: '/reportes/presupuesto/csv', csvFile: `presupuesto_${new Date().toISOString().slice(0,10)}.csv`,
      tipo: 'presupuesto',
    },
    {
      icon: ShieldCheck, title: 'Auditoría', color: '#7c3aed',
      gradient: 'linear-gradient(135deg, #4c1d95, #7c3aed)',
      description: 'Historial completo de acciones realizadas: creaciones, modificaciones y anulaciones.',
      key: 'audit', csvEndpoint: '/reportes/auditoria/csv', csvFile: `auditoria_${new Date().toISOString().slice(0,10)}.csv`,
      tipo: 'auditoria',
    },
  ]

  return (
    <div style={{ background:'var(--page-bg)', minHeight:'100%', padding:'28px', fontFamily:'var(--font-primary)' }}>

      <style>{`
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        #rpt-print-root { display:none; }
        @media print {
          body { background:#fff !important; color:#000 !important; }
          body > *:not(#rpt-print-root) { display:none !important; }
          #rpt-print-root {
            display:block !important;
            background:#fff !important;
            padding:14mm 12mm;
            box-sizing:border-box;
            font-family:Arial,sans-serif;
            font-size:9px;
            color:#000;
            text-transform:uppercase;
          }
          @page { size:A4 landscape; margin:0; }
        }
      `}</style>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: '28px' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
          <div style={{
            width: '38px', height: '38px', borderRadius: '10px',
            background: 'rgba(46,108,164,0.10)', border: '1px solid rgba(46,108,164,0.20)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <FileDown size={18} color="#2e6ca4" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: 'var(--text-heading)', letterSpacing: '-0.02em' }}>
              Reportes
            </h1>
            <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>
              Exporta datos en CSV o genera vista previa para imprimir como PDF
            </p>
          </div>
        </div>
      </motion.div>

      {/* Error */}
      <AnimatePresence>
        {csvError && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              background: 'rgba(139,15,15,0.08)', border: '1px solid rgba(139,15,15,0.22)',
              borderRadius: '10px', padding: '10px 14px', marginBottom: '16px',
              color: '#b91c1c', fontSize: '13px', fontWeight: 500,
            }}
          >
            {csvError}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Report cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
        {cards.map((card, i) => (
          <ReporteCard
            key={card.key}
            index={i}
            icon={card.icon}
            title={card.title}
            description={card.description}
            color={card.color}
            gradient={card.gradient}
            loadingCsv={loadingCsv[card.key]}
            onCsv={() => handleCsv(card.key, card.csvEndpoint, card.csvFile)}
            loadingPrint={loadingPrint[card.key]}
            onPrint={() => handlePreview(card.key, card.tipo)}
          />
        ))}
      </div>

      {/* Print Preview Modal */}
      <AnimatePresence>
        {preview.open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'fixed', inset: 0,
                background: 'rgba(10,25,47,0.65)',
                backdropFilter: 'blur(6px)',
                display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
                zIndex: 9999, overflowY: 'auto', padding: '20px 0',
                paddingLeft: '240px',
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 20 }}
                transition={{ type: 'spring', stiffness: 160, damping: 22 }}
                style={{
                  background: 'rgba(255,255,255,0.97)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.95)',
                  borderRadius: '18px',
                  padding: '16px',
                  width: 1060, maxWidth: '99vw',
                  boxShadow: '0 24px 80px rgba(10,25,47,0.35)',
                  fontFamily: 'var(--font-primary)',
                }}
              >
                {/* Toolbar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontWeight: 800, fontSize: '14px', color: 'var(--text-heading)' }}>
                    Vista previa — {cfg?.titulo}
                  </span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => window.print()}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '5px',
                        background: 'linear-gradient(135deg, #1a3a5c, #2e6ca4)',
                        color: '#fff', border: 'none', padding: '7px 14px',
                        borderRadius: '8px', cursor: 'pointer', fontWeight: 700,
                        fontSize: '13px', fontFamily: 'var(--font-primary)',
                        boxShadow: '0 4px 14px rgba(26,58,92,0.30)',
                      }}
                    >
                      <Printer size={14} /> Imprimir
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={closePreview}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '4px',
                        background: 'rgba(26,58,92,0.06)',
                        color: 'var(--text-muted)',
                        border: '1px solid rgba(26,58,92,0.12)',
                        padding: '7px 12px', borderRadius: '8px',
                        cursor: 'pointer', fontWeight: 600, fontSize: '13px',
                        fontFamily: 'var(--font-primary)',
                      }}
                    >
                      <X size={14} /> Cerrar
                    </motion.button>
                  </div>
                </div>

                {/* Document */}
                <div style={{
                  background: '#fff', width: 1032, minHeight: 730,
                  margin: '0 auto', padding: '32px 30px 28px',
                  fontFamily: FONT, fontSize: '9px', color: '#000',
                  boxSizing: 'border-box', textTransform: 'uppercase',
                  display: 'flex', flexDirection: 'column',
                  border: '1px solid rgba(26,58,92,0.10)',
                  borderRadius: '4px',
                }}>
                  {preview.error ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#be123c', fontSize: '13px' }}>
                      Error: {preview.error}
                    </div>
                  ) : (
                    <>
                      <div style={{ border: '2px solid #000', background: BEIGE, textAlign: 'center', fontWeight: 'bold', fontSize: '12px', letterSpacing: '2px', padding: '9px 0', marginBottom: '10px' }}>
                        UNIVERSIDAD ESTATAL DE BOLÍVAR
                      </div>
                      <div style={{ border: '2px solid #000', padding: '8px 12px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: 'bold', fontSize: '10px', letterSpacing: '1px' }}>{cfg?.titulo}</div>
                          <div style={{ fontSize: '8.5px', marginTop: '4px', color: '#444', textTransform: 'none' }}>
                            Sistema de Control Presupuestario — Grupos de Gasto 51 y 58
                          </div>
                        </div>
                        <div style={{ textAlign: 'right', fontSize: '8.5px', textTransform: 'none' }}>
                          <div><strong>Fecha de emisión:</strong></div>
                          <div style={{ fontWeight: 'bold' }}>{fecha}</div>
                          <div style={{ marginTop: '3px' }}>Total registros: <strong>{preview.data.length}</strong></div>
                        </div>
                      </div>
                      {cfg && <cfg.Tabla data={preview.data} />}
                      <div style={{ flex: 1 }}></div>
                      <div style={{ marginTop: '18px', paddingTop: '8px', borderTop: '1px solid #aaa', display: 'flex', justifyContent: 'space-between', fontSize: '8px', color: '#777', textTransform: 'none' }}>
                        <span>Sistema de Control Presupuestario — UEB</span>
                        <span>Documento generado el {fecha}</span>
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            </motion.div>

            {createPortal(
              <div id="rpt-print-root">
                {!preview.error && (
                  <>
                    <div style={{ border:'2px solid #000', background:BEIGE, textAlign:'center', fontWeight:'bold', fontSize:'12px', letterSpacing:'2px', padding:'9px 0', marginBottom:'10px' }}>
                      UNIVERSIDAD ESTATAL DE BOLÍVAR
                    </div>
                    <div style={{ border:'2px solid #000', padding:'8px 12px', marginBottom:'10px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <div>
                        <div style={{ fontWeight:'bold', fontSize:'10px', letterSpacing:'1px' }}>{cfg?.titulo}</div>
                        <div style={{ fontSize:'8.5px', marginTop:'4px', color:'#444', textTransform:'none' }}>Sistema de Control Presupuestario — Grupos de Gasto 51 y 58</div>
                      </div>
                      <div style={{ textAlign:'right', fontSize:'8.5px', textTransform:'none' }}>
                        <div><strong>Fecha de emisión:</strong></div>
                        <div style={{ fontWeight:'bold' }}>{fecha}</div>
                        <div style={{ marginTop:'3px' }}>Total registros: <strong>{preview.data.length}</strong></div>
                      </div>
                    </div>
                    {cfg && <cfg.Tabla data={preview.data} />}
                    <div style={{ marginTop:'18px', paddingTop:'8px', borderTop:'1px solid #aaa', display:'flex', justifyContent:'space-between', fontSize:'8px', color:'#777', textTransform:'none' }}>
                      <span>Sistema de Control Presupuestario — UEB</span>
                      <span>Documento generado el {fecha}</span>
                    </div>
                  </>
                )}
              </div>,
              document.body
            )}
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

import { useState } from 'react'
import { createPortal } from 'react-dom'
import Cookies from 'js-cookie'
import { theme } from '../config/theme'
import { FileDown, Printer, FileText, BarChart2, PieChart, Loader2, X } from 'lucide-react'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

const CARD   = theme.colors.dark['800']
const BORDER = theme.colors.dark['700']
const ELEV   = theme.colors.dark['600']
const ACCENT = theme.colors.accent.blue
const GREEN  = theme.colors.accent.green
const GOLD   = theme.colors.accent.gold
const TEXT   = 'rgba(255,255,255,0.88)'
const MUTED  = 'rgba(255,255,255,0.45)'

const FONT  = 'Arial, sans-serif'
const BRD   = '1px solid #ccc'
const BEIGE = '#ede8d5'

/* ── Botones estilo PrintCertificacion ─────────────────────────────────────── */
const BTNP = {
  display:'flex', alignItems:'center', gap:5,
  background: theme.colors.accent.blue, color:'#fff',
  border:'none', padding:'7px 14px',
  borderRadius: theme.border.radiusMd,
  cursor:'pointer', fontWeight:600, fontSize:13,
  fontFamily: theme.typography.fontFamily,
}
const BTNC = {
  display:'flex', alignItems:'center', gap:4,
  background: theme.colors.dark['600'],
  color:'rgba(255,255,255,0.6)',
  border:`1px solid ${theme.colors.dark['700']}`,
  padding:'7px 12px',
  borderRadius: theme.border.radiusMd,
  cursor:'pointer', fontWeight:600, fontSize:13,
  fontFamily: theme.typography.fontFamily,
}

function fmt(v) {
  const n = parseFloat(v) || 0
  return '$. ' + n.toLocaleString('es-EC', { minimumFractionDigits:2, maximumFractionDigits:2 })
}

function fmtFecha() {
  return new Date().toLocaleDateString('es-EC', { year:'numeric', month:'long', day:'numeric' })
}

/* ── Descarga CSV ─────────────────────────────────────────────────────────── */
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

/* ── Tablas de reporte ─────────────────────────────────────────────────────── */

const TH  = { padding:'5px 6px', textAlign:'center', fontWeight:'bold', fontSize:'8.5px', background:BEIGE, borderBottom:'1.5px solid #000', borderRight:BRD }
const TD  = { padding:'4px 5px', textAlign:'center', fontSize:'8.5px', borderBottom:BRD, borderRight:BRD }
const TDL = { padding:'4px 7px', textAlign:'left',   fontSize:'8.5px', borderBottom:BRD, borderRight:BRD }
const TDR = { padding:'4px 7px', textAlign:'right',  fontSize:'8.5px', borderBottom:BRD, borderRight:BRD }

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

const PRINT_CONFIG = {
  certificaciones: { titulo:'REPORTE DE CERTIFICACIONES PRESUPUESTARIAS', endpoint:'/reportes/certificaciones/json', Tabla:TablaCertificaciones },
  liquidaciones:   { titulo:'REPORTE DE LIQUIDACIONES',                   endpoint:'/reportes/liquidaciones/json',  Tabla:TablaLiquidaciones  },
  presupuesto:     { titulo:'REPORTE DE PRESUPUESTO DISPONIBLE',           endpoint:'/reportes/presupuesto/json',    Tabla:TablaPresupuesto    },
}

/* ── Tarjeta de reporte ────────────────────────────────────────────────────── */
function ReporteCard({ icon, title, description, color, onCsv, onPrint, loadingCsv, loadingPrint }) {
  return (
    <div style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:theme.border.radiusMd, padding:'20px', display:'flex', flexDirection:'column', gap:'12px' }}>
      <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
        <div style={{ color, display:'flex' }}>{icon}</div>
        <div>
          <div style={{ fontSize:'15px', fontWeight:700, color:TEXT }}>{title}</div>
          <div style={{ fontSize:'12px', color:MUTED, marginTop:'2px' }}>{description}</div>
        </div>
      </div>
      <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
        <button onClick={onCsv} disabled={loadingCsv} style={{
          display:'flex', alignItems:'center', gap:'7px', padding:'8px 14px',
          background:`${GREEN}18`, border:`1px solid ${GREEN}40`,
          borderRadius:theme.border.radiusMd, color:GREEN,
          cursor:loadingCsv?'default':'pointer', fontSize:'13px', fontWeight:600,
          fontFamily:theme.typography.fontFamily, opacity:loadingCsv?0.65:1,
        }}>
          {loadingCsv ? <Loader2 size={14} style={{animation:'spin 1s linear infinite'}}/> : <FileDown size={14}/>}
          {loadingCsv ? 'Generando...' : 'Descargar CSV'}
        </button>
        <button onClick={onPrint} disabled={loadingPrint} style={{
          display:'flex', alignItems:'center', gap:'7px', padding:'8px 14px',
          background:`${ACCENT}18`, border:`1px solid ${ACCENT}40`,
          borderRadius:theme.border.radiusMd, color:ACCENT,
          cursor:loadingPrint?'default':'pointer', fontSize:'13px', fontWeight:600,
          fontFamily:theme.typography.fontFamily, opacity:loadingPrint?0.65:1,
        }}>
          {loadingPrint ? <Loader2 size={14} style={{animation:'spin 1s linear infinite'}}/> : <Printer size={14}/>}
          {loadingPrint ? 'Cargando...' : 'Vista previa / PDF'}
        </button>
      </div>
    </div>
  )
}

/* ── Componente principal ──────────────────────────────────────────────────── */
export default function Reportes() {
  const [loadingCsv,   setLoadingCsv]   = useState({ cert:false, liq:false, pres:false })
  const [loadingPrint, setLoadingPrint] = useState({ cert:false, liq:false, pres:false })
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

  return (
    <div style={{ background:theme.colors.dark['900'], minHeight:'100%', padding:'28px', fontFamily:theme.typography.fontFamily }}>

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

      {/* Título */}
      <div style={{ marginBottom:'24px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'4px' }}>
          <FileDown size={20} color={ACCENT}/>
          <h1 style={{ margin:0, fontSize:'20px', fontWeight:700, color:TEXT, letterSpacing:'-0.02em' }}>Reportes</h1>
        </div>
        <p style={{ margin:0, fontSize:'13px', color:MUTED }}>Exporta datos del sistema en formato CSV o genera una vista previa para imprimir como PDF.</p>
      </div>

      {csvError && (
        <div style={{ background:'rgba(196,30,58,0.12)', border:'1px solid rgba(196,30,58,0.35)', borderRadius:theme.border.radiusMd, padding:'10px 14px', marginBottom:'16px', color:'#ff6b7a', fontSize:'13px' }}>
          {csvError}
        </div>
      )}

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(320px, 1fr))', gap:'16px' }}>
        <ReporteCard
          icon={<FileText size={22}/>} title="Certificaciones" color={ACCENT}
          description="Listado completo de certificaciones presupuestarias con montos y estados."
          loadingCsv={loadingCsv.cert}    onCsv={()=>handleCsv('cert','/reportes/certificaciones/csv',`certificaciones_${new Date().toISOString().slice(0,10)}.csv`)}
          loadingPrint={loadingPrint.cert} onPrint={()=>handlePreview('cert','certificaciones')}
        />
        <ReporteCard
          icon={<BarChart2 size={22}/>} title="Liquidaciones" color={GOLD}
          description="Registro de liquidaciones realizadas, incluyendo anuladas y motivos."
          loadingCsv={loadingCsv.liq}    onCsv={()=>handleCsv('liq','/reportes/liquidaciones/csv',`liquidaciones_${new Date().toISOString().slice(0,10)}.csv`)}
          loadingPrint={loadingPrint.liq} onPrint={()=>handlePreview('liq','liquidaciones')}
        />
        <ReporteCard
          icon={<PieChart size={22}/>} title="Presupuesto Disponible" color={GREEN}
          description="Saldos por partida presupuestaria: codificado, certificado y disponible."
          loadingCsv={loadingCsv.pres}    onCsv={()=>handleCsv('pres','/reportes/presupuesto/csv',`presupuesto_${new Date().toISOString().slice(0,10)}.csv`)}
          loadingPrint={loadingPrint.pres} onPrint={()=>handlePreview('pres','presupuesto')}
        />
      </div>

      {/* ══════════ VISTA PREVIA — mismo patrón que PrintCertificacion ══════════ */}
      {preview.open && (
        <>
          <div style={{
            position:'fixed', inset:0,
            background:'rgba(0,0,0,0.78)',
            display:'flex', alignItems:'flex-start', justifyContent:'center',
            zIndex:9999, overflowY:'auto', padding:'20px 0',
          }}>
            <div style={{
              background:theme.colors.dark['800'],
              border:`1px solid ${theme.colors.dark['700']}`,
              borderRadius:8, padding:14,
              width:1060, maxWidth:'99vw',
            }}>

              {/* toolbar */}
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                <span style={{ fontWeight:700, fontSize:14, color:'rgba(255,255,255,0.88)' }}>
                  Vista previa — {cfg?.titulo}
                </span>
                <div style={{ display:'flex', gap:8 }}>
                  <button onClick={()=>window.print()} style={BTNP}><Printer size={14}/> Imprimir</button>
                  <button onClick={closePreview}        style={BTNC}><X size={14}/> Cerrar</button>
                </div>
              </div>

              {/* ── DOCUMENTO HOJA BLANCA (pantalla) ── */}
              <div style={{
                background:'#fff',
                width:1032, minHeight:730, margin:'0 auto',
                padding:'32px 30px 28px 30px',
                fontFamily:FONT, fontSize:'9px', color:'#000',
                boxSizing:'border-box',
                textTransform:'uppercase',
                display:'flex', flexDirection:'column',
              }}>

                {preview.error ? (
                  <div style={{ padding:'40px', textAlign:'center', color:'#be123c', fontSize:'13px' }}>
                    Error: {preview.error}
                  </div>
                ) : (
                  <>
                    <div style={{
                      border:'2px solid #000', background:BEIGE,
                      textAlign:'center', fontWeight:'bold',
                      fontSize:'12px', letterSpacing:'2px',
                      padding:'9px 0', marginBottom:'10px',
                    }}>
                      UNIVERSIDAD ESTATAL DE BOLÍVAR
                    </div>

                    <div style={{ border:'2px solid #000', padding:'8px 12px', marginBottom:'10px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <div>
                        <div style={{ fontWeight:'bold', fontSize:'10px', letterSpacing:'1px' }}>{cfg?.titulo}</div>
                        <div style={{ fontSize:'8.5px', marginTop:'4px', color:'#444', textTransform:'none' }}>
                          Sistema de Control Presupuestario — Grupos de Gasto 51 y 58
                        </div>
                      </div>
                      <div style={{ textAlign:'right', fontSize:'8.5px', textTransform:'none' }}>
                        <div><strong>Fecha de emisión:</strong></div>
                        <div style={{ fontWeight:'bold' }}>{fecha}</div>
                        <div style={{ marginTop:'3px' }}>Total registros: <strong>{preview.data.length}</strong></div>
                      </div>
                    </div>

                    {cfg && <cfg.Tabla data={preview.data} />}
                    <div style={{flex:1}}></div>
                    <div style={{ marginTop:'18px', paddingTop:'8px', borderTop:'1px solid #aaa', display:'flex', justifyContent:'space-between', fontSize:'8px', color:'#777', textTransform:'none' }}>
                      <span>Sistema de Control Presupuestario — UEB</span>
                      <span>Documento generado el {fecha}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Portal de impresión — renderizado directamente en document.body para multi-página */}
          {createPortal(
            <div id="rpt-print-root">
              {!preview.error && (
                <>
                  <div style={{
                    border:'2px solid #000', background:BEIGE,
                    textAlign:'center', fontWeight:'bold',
                    fontSize:'12px', letterSpacing:'2px',
                    padding:'9px 0', marginBottom:'10px',
                  }}>
                    UNIVERSIDAD ESTATAL DE BOLÍVAR
                  </div>

                  <div style={{ border:'2px solid #000', padding:'8px 12px', marginBottom:'10px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <div>
                      <div style={{ fontWeight:'bold', fontSize:'10px', letterSpacing:'1px' }}>{cfg?.titulo}</div>
                      <div style={{ fontSize:'8.5px', marginTop:'4px', color:'#444', textTransform:'none' }}>
                        Sistema de Control Presupuestario — Grupos de Gasto 51 y 58
                      </div>
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
    </div>
  )
}

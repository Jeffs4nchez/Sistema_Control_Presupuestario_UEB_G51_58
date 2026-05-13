import { useState, useEffect } from "react"
import axios from "axios"
import Cookies from "js-cookie"
import { theme } from '../config/theme'
import { X, Save, Trash2, Check } from "lucide-react"

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api"

const CARD   = theme.colors.dark['800']
const BORDER = theme.colors.dark['700']
const ELEV   = theme.colors.dark['600']
const ACCENT = theme.colors.accent.blue
const TEXT   = 'rgba(255,255,255,0.88)'
const MUTED  = 'rgba(255,255,255,0.45)'

const INPUT = {
  width: '100%',
  padding: '8px 11px',
  background: ELEV,
  border: `1px solid ${BORDER}`,
  color: TEXT,
  borderRadius: theme.border.radiusMd,
  boxSizing: 'border-box',
  fontSize: '13px',
  fontFamily: theme.typography.fontFamily,
  outline: 'none',
}

const LABEL = {
  display: 'block',
  fontSize: '11px',
  fontWeight: 600,
  color: MUTED,
  marginBottom: '5px',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
}

const FIELD = { marginBottom: '14px' }

export default function EditCertificacion({ certId, onClose, onSaved }) {
  const [form,      setForm]      = useState(null)
  const [items,     setItems]     = useState([])
  const [entidades, setEntidades] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [saving,    setSaving]    = useState(false)
  const [error,     setError]     = useState("")
  const [itemMsg,   setItemMsg]   = useState("")

  useEffect(() => {
    ;(async () => {
      try {
        const token = Cookies.get("auth_token")
        const [certRes, entRes] = await Promise.all([
          axios.get(`${API_BASE}/certificacion/${certId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_BASE}/certificacion/entidades-requirientes`),
        ])
        const d = certRes.data.data
        setForm({
          descripcion:            d.descripcion            || "",
          unid_ejecutora:         d.unid_ejecutora          || "",
          des_u_ejecutora:        d.des_u_ejecutora         || "",
          clase_registro:         d.clase_registro          || "",
          clase_gasto:            d.clase_gasto             || "",
          tipo_doc_respaldo:      d.tipo_doc_respaldo       || "",
          clase_doc_respaldo:     d.clase_doc_respaldo      || "",
          seccion_memorando:      d.seccion_memorando       || "",
          estado:                 d.estado                  || "APROBADO",
          id_entidad_requiriente: d.id_entidad_requiriente ? String(d.id_entidad_requiriente) : "",
        })
        setItems((d.items || []).map(it => ({ ...it, montoEdit: String(it.monto ?? "") })))
        setEntidades(entRes.data.data)
      } catch {
        setError("No se pudo cargar el certificado.")
      } finally {
        setLoading(false)
      }
    })()
  }, [certId])

  const handleSave = async () => {
    if (!form.descripcion?.trim())     return setError("Descripción es requerida")
    if (!form.unid_ejecutora?.trim())  return setError("Unidad Ejecutora es requerida")
    if (!form.des_u_ejecutora?.trim()) return setError("Descripción Unidad Ejecutora es requerida")
    if (!form.id_entidad_requiriente)  return setError("Entidad Requiriente es requerida")

    setSaving(true)
    setError("")
    try {
      const token = Cookies.get("auth_token")
      await axios.put(`${API_BASE}/certificacion/${certId}`, form, {
        headers: { Authorization: `Bearer ${token}` },
      })
      onSaved()
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || "Error al guardar")
    } finally {
      setSaving(false)
    }
  }

  const handleGuardarMonto = async (it) => {
    const monto = parseFloat(it.montoEdit)
    if (!it.montoEdit || isNaN(monto) || monto <= 0) { setItemMsg("El monto debe ser mayor a 0"); return }
    if (monto > 9999999999999.99)                     { setItemMsg("Monto demasiado grande");      return }

    try {
      const token = Cookies.get("auth_token")
      const verfRes = await axios.get(
        `${API_BASE}/certificacion/verificar-monto/${it.id_item}/${it.id_fuente}`
      )
      if (verfRes.data.success) {
        const montoOriginal = parseFloat(it.monto)
        const disponible    = verfRes.data.data.disponible_final
        const tope          = disponible + montoOriginal
        if (monto > tope) {
          setItemMsg(
            `Máximo: $${tope.toLocaleString("es-EC", { minimumFractionDigits: 2 })} ` +
            `(disponible $${disponible.toLocaleString("es-EC", { minimumFractionDigits: 2 })} + actual $${montoOriginal.toLocaleString("es-EC", { minimumFractionDigits: 2 })})`
          )
          return
        }
      }

      await axios.patch(
        `${API_BASE}/certificacion/${certId}/item/${it.id_certificacion_item}`,
        { monto },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setItems(prev => prev.map(i =>
        i.id_certificacion_item === it.id_certificacion_item
          ? { ...i, monto, montoEdit: String(monto) }
          : i
      ))
      setItemMsg("Monto actualizado")
      setTimeout(() => setItemMsg(""), 2500)
    } catch (err) {
      setItemMsg(err.response?.data?.message || "Error al actualizar monto")
    }
  }

  const handleEliminarItem = async (it) => {
    if (!confirm(`¿Eliminar el item "${it.item?.nombre_item ?? it.id_item}"?`)) return
    try {
      const token = Cookies.get("auth_token")
      await axios.delete(
        `${API_BASE}/certificacion/${certId}/item/${it.id_certificacion_item}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setItems(prev => prev.filter(i => i.id_certificacion_item !== it.id_certificacion_item))
      setItemMsg("Item eliminado")
      setTimeout(() => setItemMsg(""), 2000)
    } catch (err) {
      setItemMsg(err.response?.data?.message || "Error al eliminar item")
    }
  }

  const totalItems = items.reduce((s, i) => s + parseFloat(i.monto || 0), 0)

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.72)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999, padding: '20px',
    }}>
      <div style={{
        background: CARD,
        border: `1px solid ${BORDER}`,
        borderRadius: theme.border.radiusMd,
        padding: '24px',
        width: '100%', maxWidth: '900px',
        maxHeight: '90vh', overflowY: 'auto',
        boxShadow: theme.shadow.lg,
        fontFamily: theme.typography.fontFamily,
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: TEXT }}>
            Editar Certificado
          </h2>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: MUTED, cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px', borderRadius: '4px' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = TEXT }}
            onMouseLeave={(e) => { e.currentTarget.style.color = MUTED }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: 'rgba(196,30,58,0.12)', border: '1px solid rgba(196,30,58,0.35)',
            borderRadius: theme.border.radiusMd, padding: '9px 12px', marginBottom: '16px',
            color: '#ff6b7a', fontSize: '13px', display: 'flex', justifyContent: 'space-between',
          }}>
            <span>{error}</span>
            <button onClick={() => setError('')} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '15px', padding: '0 0 0 12px' }}>✕</button>
          </div>
        )}

        {loading ? (
          <div style={{ color: MUTED, textAlign: 'center', padding: '32px', fontSize: '13px' }}>
            Cargando...
          </div>
        ) : (
          <>
            {/* ── Datos generales ── */}
            <div style={{ marginBottom: '8px' }}>
              <p style={{ margin: '0 0 14px', fontSize: '11px', fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.07em', borderBottom: `1px solid ${BORDER}`, paddingBottom: '8px' }}>
                Datos Generales
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
              <div style={FIELD}>
                <label style={LABEL}>Descripción General *</label>
                <input style={INPUT} value={form.descripcion}
                  onChange={e => setForm({ ...form, descripcion: e.target.value })} />
              </div>
              <div style={FIELD}>
                <label style={LABEL}>Sección / Memorando</label>
                <input style={INPUT} value={form.seccion_memorando}
                  onChange={e => setForm({ ...form, seccion_memorando: e.target.value })} />
              </div>
              <div style={FIELD}>
                <label style={LABEL}>Unidad Ejecutora *</label>
                <input style={INPUT} value={form.unid_ejecutora}
                  onChange={e => setForm({ ...form, unid_ejecutora: e.target.value })} />
              </div>
              <div style={FIELD}>
                <label style={LABEL}>Descripción Unidad Ejecutora *</label>
                <input style={INPUT} value={form.des_u_ejecutora}
                  onChange={e => setForm({ ...form, des_u_ejecutora: e.target.value })} />
              </div>
              <div style={FIELD}>
                <label style={LABEL}>Clase de Registro</label>
                <input style={INPUT} value={form.clase_registro}
                  onChange={e => setForm({ ...form, clase_registro: e.target.value })} />
              </div>
              <div style={FIELD}>
                <label style={LABEL}>Clase de Gasto</label>
                <input style={INPUT} value={form.clase_gasto}
                  onChange={e => setForm({ ...form, clase_gasto: e.target.value })} />
              </div>
              <div style={FIELD}>
                <label style={LABEL}>Tipo de Documento Respaldo</label>
                <input style={INPUT} value={form.tipo_doc_respaldo}
                  onChange={e => setForm({ ...form, tipo_doc_respaldo: e.target.value })} />
              </div>
              <div style={FIELD}>
                <label style={LABEL}>Clase de Documento Respaldo</label>
                <input style={INPUT} value={form.clase_doc_respaldo}
                  onChange={e => setForm({ ...form, clase_doc_respaldo: e.target.value })} />
              </div>
              <div style={{ ...FIELD, gridColumn: 'span 2' }}>
                <label style={LABEL}>Entidad Requiriente *</label>
                <select style={INPUT} value={form.id_entidad_requiriente}
                  onChange={e => setForm({ ...form, id_entidad_requiriente: e.target.value })}>
                  <option value="">-- Seleccionar --</option>
                  {entidades.map(en => (
                    <option key={en.id_entidad_requiriente} value={String(en.id_entidad_requiriente)} style={{ background: CARD }}>
                      {en.nombre_entidad}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* ── Items ── */}
            <div style={{ marginTop: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: `1px solid ${BORDER}`, paddingBottom: '8px' }}>
                <p style={{ margin: 0, fontSize: '11px', fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                  Items del Certificado
                </p>
                {itemMsg && (
                  <span style={{ fontSize: '12px', color: itemMsg.startsWith('Error') || itemMsg.startsWith('Máximo') || itemMsg.startsWith('El monto') || itemMsg.startsWith('Monto demasiado') ? '#ff6b7a' : theme.colors.accent.green }}>
                    {itemMsg}
                  </span>
                )}
              </div>

              {items.length === 0 ? (
                <div style={{ color: MUTED, fontSize: '13px', padding: '16px', background: ELEV, borderRadius: theme.border.radiusMd, textAlign: 'center' }}>
                  Sin items
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', minWidth: '700px' }}>
                    <thead>
                      <tr style={{ background: ELEV, borderBottom: `1px solid ${BORDER}` }}>
                        {['PG','SP','PY','ACT','ITEM','UBG','FTE','ORG','N.Prest','Descripción','Monto',''].map(h => (
                          <th key={h} style={{
                            padding: '8px 6px',
                            color: MUTED,
                            textAlign: h === 'Monto' ? 'right' : 'left',
                            fontWeight: 700,
                            fontSize: '10px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            whiteSpace: 'nowrap',
                          }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((it) => (
                        <tr key={it.id_certificacion_item} style={{ borderBottom: `1px solid ${BORDER}`, transition: 'background 0.15s ease' }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = ELEV }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                        >
                          <td style={{ padding: '7px 6px', color: TEXT }}>{it.programa?.cod_programa ?? '-'}</td>
                          <td style={{ padding: '7px 6px', color: TEXT }}>{String(it.subprograma?.cod_subprograma ?? '').slice(-2) || '-'}</td>
                          <td style={{ padding: '7px 6px', color: TEXT }}>{String(it.proyecto?.cod_proyecto ?? '').slice(-3) || '-'}</td>
                          <td style={{ padding: '7px 6px', color: TEXT }}>{String(it.actividad?.cod_actividad ?? '').slice(-3) || '-'}</td>
                          <td style={{ padding: '7px 6px', color: ACCENT, fontWeight: 700 }}>{it.item?.cod_item ?? '-'}</td>
                          <td style={{ padding: '7px 6px', color: TEXT }}>{it.ubicacion?.cod_ubicacion ?? '-'}</td>
                          <td style={{ padding: '7px 6px', color: TEXT }}>{it.fuente?.cod_fuente ?? '-'}</td>
                          <td style={{ padding: '7px 6px', color: TEXT }}>{it.organismo?.cod_organismo ?? '-'}</td>
                          <td style={{ padding: '7px 6px', color: TEXT }}>{it.naturaleza?.cod_naturaleza ?? '-'}</td>
                          <td style={{ padding: '7px 6px', color: TEXT, maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {it.item?.nombre_item ?? '-'}
                          </td>
                          <td style={{ padding: '7px 6px', textAlign: 'right' }}>
                            <input
                              type="number" step="0.01"
                              value={it.montoEdit}
                              onChange={e => setItems(prev => prev.map(i =>
                                i.id_certificacion_item === it.id_certificacion_item
                                  ? { ...i, montoEdit: e.target.value }
                                  : i
                              ))}
                              style={{
                                width: '90px', padding: '4px 6px',
                                background: ELEV, border: `1px solid ${BORDER}`,
                                color: theme.colors.accent.green,
                                borderRadius: theme.border.radiusSmall,
                                fontSize: '12px', textAlign: 'right',
                                fontFamily: theme.typography.fontFamily, outline: 'none',
                              }}
                            />
                          </td>
                          <td style={{ padding: '7px 6px', whiteSpace: 'nowrap' }}>
                            <div style={{ display: 'flex', gap: '4px' }}>
                              <button
                                onClick={() => handleGuardarMonto(it)}
                                title="Guardar monto"
                                style={{
                                  width: '26px', height: '26px',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.35)',
                                  borderRadius: theme.border.radiusSmall,
                                  color: theme.colors.accent.green, cursor: 'pointer',
                                }}
                              >
                                <Check size={12} />
                              </button>
                              <button
                                onClick={() => handleEliminarItem(it)}
                                title="Eliminar item"
                                style={{
                                  width: '26px', height: '26px',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  background: 'rgba(196,30,58,0.12)', border: '1px solid rgba(196,30,58,0.3)',
                                  borderRadius: theme.border.radiusSmall,
                                  color: '#ff6b7a', cursor: 'pointer',
                                }}
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr style={{ borderTop: `2px solid ${BORDER}` }}>
                        <td colSpan={10} style={{ padding: '8px 6px', textAlign: 'right', color: MUTED, fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Total
                        </td>
                        <td style={{ padding: '8px 6px', textAlign: 'right', color: theme.colors.accent.green, fontWeight: 700, fontSize: '13px' }}>
                          ${totalItems.toLocaleString('es-EC', { minimumFractionDigits: 2 })}
                        </td>
                        <td />
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  padding: '10px',
                  background: saving ? ELEV : ACCENT,
                  color: '#fff', border: 'none',
                  borderRadius: theme.border.radiusMd,
                  cursor: saving ? 'default' : 'pointer',
                  fontWeight: 700, fontSize: '14px',
                  opacity: saving ? 0.7 : 1,
                  fontFamily: theme.typography.fontFamily,
                  transition: 'all 0.15s ease',
                }}
              >
                <Save size={15} />
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
              <button
                onClick={onClose}
                style={{
                  padding: '10px 20px',
                  background: ELEV,
                  color: MUTED, border: `1px solid ${BORDER}`,
                  borderRadius: theme.border.radiusMd,
                  cursor: 'pointer', fontSize: '14px',
                  fontFamily: theme.typography.fontFamily,
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = TEXT }}
                onMouseLeave={(e) => { e.currentTarget.style.color = MUTED }}
              >
                Cancelar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

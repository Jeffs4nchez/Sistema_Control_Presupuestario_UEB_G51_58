<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Certificacion extends Model
{
    protected $table = 'certificacion';
    protected $primaryKey = 'id_certificacion';
    protected $fillable = [
        'numero_certificado',
        'descripcion',
        'fecha_elaboracion',
        'unid_ejecutora',
        'des_u_ejecutora',
        'clase_registro',
        'clase_gasto',
        'tipo_doc_respaldo',
        'clase_doc_respaldo',
        'estado',
        'id_usuario',
        'id_entidad_requiriente',
        'id_cedula_presupuestaria',
        'seccion_memorando'
    ];

    protected $dates = [
        'created_at',
        'updated_at'
    ];

    public $timestamps = true;

    protected function casts(): array
    {
        return [
            'fecha_elaboracion' => 'datetime:Y-m-d',
        ];
    }

    // RELACIONES

    /**
     * Relación: Usuario que creó el certificado
     */
    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'id_usuario', 'id_usuario');
    }

    /**
     * Relación: Entidad Requiriente
     */
    public function entidadRequiriente(): BelongsTo
    {
        return $this->belongsTo(EntidadRequiriente::class, 'id_entidad_requiriente', 'id_entidad_requiriente');
    }

    /**
     * Relación: Cédula Presupuestaria
     */
    public function cedulaPresupuestaria(): BelongsTo
    {
        return $this->belongsTo(CedulaPresupuestaria::class, 'id_cedula_presupuestaria', 'id_cedula_presupuestaria');
    }

    /**
     * Relación: Items agregados al certificado (muchos a muchos)
     */
    public function items(): HasMany
    {
        return $this->hasMany(CertificacionItem::class, 'id_certificacion', 'id_certificacion');
    }

    /**
     * Calcular y actualizar monto total del certificado
     */
    public function actualizarMontoTotal(): void
    {
        $total = $this->items()->sum('monto');
        $this->update(['monto_total' => $total ?? 0]);
    }

    /**
     * Obtener resumen del certificado con todos los datos
     */
    public function getDetalles()
    {
        return [
            'id_certificacion' => $this->id_certificacion,
            'numero_certificado' => $this->numero_certificado,
            'descripcion' => $this->descripcion,
            'fecha_elaboracion' => $this->fecha_elaboracion,
            'monto_total' => $this->monto_total,
            'unid_ejecutora' => $this->unid_ejecutora,
            'des_u_ejecutora' => $this->des_u_ejecutora,
            'seccion_memorando' => $this->seccion_memorando,
            'clase_registro' => $this->clase_registro,
            'clase_gasto' => $this->clase_gasto,
            'tipo_doc_respaldo' => $this->tipo_doc_respaldo,
            'clase_doc_respaldo' => $this->clase_doc_respaldo,
            'estado' => $this->estado,
            'usuario' => $this->usuario?->name,
            'id_entidad_requiriente' => $this->id_entidad_requiriente,
            'entidad' => $this->entidadRequiriente?->nombre_entidad,
            'items' => $this->items()->with([
                'item',
                'programa',
                'subprograma',
                'proyecto',
                'actividad',
                'fuente',
                'ubicacion',
                'organismo',
                'naturaleza'
            ])->get(),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at
        ];
    }
}

<?php

namespace App\Observers;

use App\Models\CertificacionItem;
use Illuminate\Support\Facades\DB;

class CertificacionItemObserver
{
    /**
     * Cuando se crea un certificacion_item
     */
    public function created(CertificacionItem $item): void
    {
        $this->actualizarFuenteItem($item);
    }

    /**
     * Cuando se actualiza un certificacion_item
     */
    public function updated(CertificacionItem $item): void
    {
        $this->actualizarFuenteItem($item);
    }

    /**
     * Cuando se elimina un certificacion_item
     */
    public function deleted(CertificacionItem $item): void
    {
        $this->actualizarFuenteItem($item);
    }

    /**
     * Actualiza el monto certificado en fuente_items
     * Suma solo los certificacion_items con certificación APROBADA o LIQUIDADA
     */
    private function actualizarFuenteItem(CertificacionItem $item): void
    {
        // Solo si tiene id_fuente e id_item
        if (!$item->id_fuente || !$item->id_item) {
            return;
        }

        // Sumar SOLO los certificacion_items cuya certificación está APROBADA o LIQUIDADA
        $totalCertificado = DB::table('certificacion_items')
            ->join('certificacion', 'certificacion_items.id_certificacion', '=', 'certificacion.id_certificacion')
            ->where('certificacion_items.id_fuente', $item->id_fuente)
            ->where('certificacion_items.id_item', $item->id_item)
            ->whereIn('certificacion.estado', ['APROBADO', 'LIQUIDADO'])
            ->sum('certificacion_items.monto');

        // Actualizar en fuente_items
        DB::table('fuente_items')
            ->where('id_fuente', $item->id_fuente)
            ->where('id_item', $item->id_item)
            ->update(['certificado' => $totalCertificado ?? 0]);
    }
}

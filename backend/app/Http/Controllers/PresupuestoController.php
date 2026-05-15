<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PresupuestoController extends Controller
{
    /**
     * GET /api/presupuesto-disponible
     * Saldo = Codificado (asignado + modificado de fuente_items) - Certificado (sum certificacion_items.monto)
     */
    public function index(Request $request)
    {
        try {
            $search    = $request->input('search', '');
            $programa  = $request->input('programa', '');
            $actividad = $request->input('actividad', '');
            $fuente    = $request->input('fuente', '');

            $query = DB::table('fuente_items as fi')
                ->join('items as i',                    'fi.id_item',        '=', 'i.id_item')
                ->join('fuente_financiamiento as f',    'fi.id_fuente',      '=', 'f.id_fuente')
                ->leftJoin('actividad as a',             'i.id_actividad',    '=', 'a.id_actividad')
                ->leftJoin('proyecto as pr',             'a.id_proyecto',     '=', 'pr.id_proyecto')
                ->leftJoin('subprograma as sp',          'pr.id_subprograma', '=', 'sp.id_subprograma')
                ->leftJoin('programa as p',              'sp.id_programa',    '=', 'p.id_programa')
                ->select(
                    'i.id_item',
                    'fi.id_fuente',
                    'i.cod_item',
                    'i.nombre_item',
                    DB::raw('COALESCE(fi.asignado, 0) as asignado'),
                    DB::raw('COALESCE(fi.modificado, 0) as modificado'),
                    'f.cod_fuente',
                    'f.nombre_fuente',
                    'a.cod_actividad',
                    'a.nombre_actividad',
                    'p.cod_programa',
                    'p.nombre_programa'
                );

            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('i.cod_item',     'LIKE', "%$search%")
                      ->orWhere('i.nombre_item', 'LIKE', "%$search%");
                });
            }
            if ($programa)  $query->where('p.cod_programa',  'LIKE', "%$programa%");
            if ($actividad) $query->where('a.cod_actividad', 'LIKE', "%$actividad%");
            if ($fuente)    $query->where('f.cod_fuente',    'LIKE', "%$fuente%");

            $rows = $query->orderBy('i.cod_item')->get();

            // Certificado por (id_item, id_fuente) excluyendo anuladas
            $certMap = DB::table('certificacion_items as ci')
                ->join('certificacion as c', 'ci.id_certificacion', '=', 'c.id_certificacion')
                ->select('ci.id_item', 'ci.id_fuente', DB::raw('SUM(ci.monto) as total'))
                ->whereNotIn('c.estado', ['ANULADA'])
                ->groupBy('ci.id_item', 'ci.id_fuente')
                ->get()
                ->mapWithKeys(fn($r) => ["{$r->id_item}_{$r->id_fuente}" => (float) $r->total]);

            $result = $rows->map(function ($row) use ($certMap) {
                $codificado  = (float) $row->asignado + (float) $row->modificado;
                $certificado = $certMap["{$row->id_item}_{$row->id_fuente}"] ?? 0.0;
                $saldo       = max(0, $codificado - $certificado);

                return [
                    'id_item'          => $row->id_item,
                    'id_fuente'        => $row->id_fuente,
                    'cod_item'         => $row->cod_item,
                    'nombre_item'      => $row->nombre_item,
                    'cod_fuente'       => $row->cod_fuente,
                    'nombre_fuente'    => $row->nombre_fuente,
                    'cod_actividad'    => $row->cod_actividad,
                    'nombre_actividad' => $row->nombre_actividad,
                    'cod_programa'     => $row->cod_programa,
                    'nombre_programa'  => $row->nombre_programa,
                    'codificado'       => round($codificado, 2),
                    'certificado'      => round($certificado, 2),
                    'saldo'            => round($saldo, 2),
                    'sin_saldo'        => $saldo <= 0,
                ];
            });

            $totales = [
                'total_items'       => $result->count(),
                'total_codificado'  => round($result->sum('codificado'), 2),
                'total_certificado' => round($result->sum('certificado'), 2),
                'total_saldo'       => round($result->sum('saldo'), 2),
                'items_sin_saldo'   => $result->where('sin_saldo', true)->count(),
            ];

            return response()->json([
                'success' => true,
                'data'    => $result->values(),
                'totales' => $totales,
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }
}

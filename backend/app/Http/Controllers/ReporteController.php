<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReporteController extends Controller
{
    /**
     * GET /api/reportes/certificaciones/csv
     */
    public function certificacionesCsv(Request $request)
    {
        $rows = DB::table('certificacion as c')
            ->leftJoin('entidad_requiriente as er',   'c.id_entidad_requiriente',   '=', 'er.id_entidad_requiriente')
            ->leftJoin('cedula_presupuestaria as cp',  'c.id_cedula_presupuestaria', '=', 'cp.id_cedula_presupuestaria')
            ->leftJoin('usuarios as u',                'c.id_usuario',               '=', 'u.id_usuario')
            ->select(
                'c.numero_certificado',
                'c.fecha_elaboracion',
                'c.estado',
                'c.seccion_memorando',
                'er.nombre_entidad',
                'er.responsable_entidad',
                'cp.anio',
                DB::raw("CONCAT(u.nombres, ' ', u.apellidos) as elaborado_por"),
                DB::raw('(SELECT COALESCE(SUM(ci.monto), 0) FROM certificacion_items ci WHERE ci.id_certificacion = c.id_certificacion) as monto_total')
            )
            ->orderBy('c.fecha_elaboracion', 'desc')
            ->get();

        $headers = [
            'N° Certificado', 'Fecha', 'Estado', 'Monto Total',
            'Memorando', 'Entidad Requiriente', 'Responsable', 'Año Cédula', 'Elaborado Por',
        ];

        $csv = $this->buildCsv($headers, $rows->map(fn($r) => [
            $r->numero_certificado,
            $r->fecha_elaboracion,
            $r->estado,
            number_format((float) $r->monto_total, 2, '.', ''),
            $r->seccion_memorando ?? '',
            $r->nombre_entidad    ?? '',
            $r->responsable_entidad ?? '',
            $r->anio              ?? '',
            $r->elaborado_por     ?? '',
        ])->toArray());

        return response($csv, 200, [
            'Content-Type'        => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="certificaciones_' . now()->format('Ymd_His') . '.csv"',
        ]);
    }

    /**
     * GET /api/reportes/liquidaciones/csv
     */
    public function liquidacionesCsv(Request $request)
    {
        $rows = DB::table('liquidaciones as l')
            ->leftJoin('certificacion_items as ci', 'l.id_certificacion_item', '=', 'ci.id_certificacion_item')
            ->leftJoin('certificacion as c',        'ci.id_certificacion',     '=', 'c.id_certificacion')
            ->leftJoin('items as i',                'l.id_item',               '=', 'i.id_item')
            ->select(
                'l.id_liquidacion',
                'l.fecha_creacion',
                'l.memorando',
                'l.cantidad_liquidacion',
                'l.estado',
                'l.motivo_anulacion',
                'i.cod_item',
                'i.nombre_item',
                'c.numero_certificado'
            )
            ->orderBy('l.fecha_creacion', 'desc')
            ->get();

        $headers = [
            'ID', 'Fecha', 'Memorando', 'Cantidad Liquidada', 'Estado',
            'Motivo Anulación', 'Código Ítem', 'Nombre Ítem', 'N° Certificado',
        ];

        $csv = $this->buildCsv($headers, $rows->map(fn($r) => [
            $r->id_liquidacion,
            $r->fecha_creacion,
            $r->memorando,
            $r->cantidad_liquidacion,
            $r->estado,
            $r->motivo_anulacion ?? '',
            $r->cod_item ?? '',
            $r->nombre_item ?? '',
            $r->numero_certificado ?? '',
        ])->toArray());

        return response($csv, 200, [
            'Content-Type'        => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="liquidaciones_' . now()->format('Ymd_His') . '.csv"',
        ]);
    }

    /**
     * GET /api/reportes/presupuesto/csv
     */
    public function presupuestoCsv(Request $request)
    {
        $rows = DB::table('fuente_items as fi')
            ->join('items as i',                 'fi.id_item',        '=', 'i.id_item')
            ->join('fuente_financiamiento as f',  'fi.id_fuente',      '=', 'f.id_fuente')
            ->leftJoin('actividad as a',           'i.id_actividad',    '=', 'a.id_actividad')
            ->leftJoin('proyecto as pr',           'a.id_proyecto',     '=', 'pr.id_proyecto')
            ->leftJoin('subprograma as sp',        'pr.id_subprograma', '=', 'sp.id_subprograma')
            ->leftJoin('programa as p',            'sp.id_programa',    '=', 'p.id_programa')
            ->select(
                'i.id_item', 'fi.id_fuente',
                'i.cod_item', 'i.nombre_item',
                DB::raw('COALESCE(fi.asignado, 0) as asignado'),
                DB::raw('COALESCE(fi.modificado, 0) as modificado'),
                'f.cod_fuente', 'f.nombre_fuente',
                'a.cod_actividad', 'p.nombre_programa'
            )
            ->orderBy('i.cod_item')
            ->get();

        $certMap = DB::table('certificacion_items as ci')
            ->join('certificacion as c', 'ci.id_certificacion', '=', 'c.id_certificacion')
            ->select('ci.id_item', 'ci.id_fuente', DB::raw('SUM(ci.monto) as total'))
            ->whereNotIn('c.estado', ['ANULADA'])
            ->groupBy('ci.id_item', 'ci.id_fuente')
            ->get()
            ->mapWithKeys(fn($r) => ["{$r->id_item}_{$r->id_fuente}" => (float) $r->total]);

        $headers = [
            'Código Ítem', 'Nombre Ítem', 'Programa', 'Actividad', 'Fuente',
            'Asignado', 'Modificado', 'Codificado', 'Certificado', 'Saldo',
        ];

        $data = $rows->map(function ($r) use ($certMap) {
            $codificado  = (float) $r->asignado + (float) $r->modificado;
            $certificado = $certMap["{$r->id_item}_{$r->id_fuente}"] ?? 0.0;
            $saldo       = max(0, $codificado - $certificado);
            return [
                $r->cod_item,
                $r->nombre_item,
                $r->nombre_programa ?? '',
                $r->cod_actividad   ?? '',
                $r->cod_fuente      ?? '',
                number_format((float) $r->asignado,  2, '.', ''),
                number_format((float) $r->modificado, 2, '.', ''),
                number_format($codificado,  2, '.', ''),
                number_format($certificado, 2, '.', ''),
                number_format($saldo,       2, '.', ''),
            ];
        })->toArray();

        $csv = $this->buildCsv($headers, $data);

        return response($csv, 200, [
            'Content-Type'        => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="presupuesto_' . now()->format('Ymd_His') . '.csv"',
        ]);
    }

    /**
     * GET /api/reportes/certificaciones/json — para impresión PDF
     */
    public function certificacionesJson(Request $request)
    {
        try {
            $rows = DB::table('certificacion as c')
                ->leftJoin('entidad_requiriente as er',   'c.id_entidad_requiriente',   '=', 'er.id_entidad_requiriente')
                ->leftJoin('cedula_presupuestaria as cp',  'c.id_cedula_presupuestaria', '=', 'cp.id_cedula_presupuestaria')
                ->leftJoin('usuarios as u',                'c.id_usuario',               '=', 'u.id_usuario')
                ->select(
                    'c.numero_certificado', 'c.fecha_elaboracion', 'c.estado', 'c.seccion_memorando',
                    'er.nombre_entidad', 'er.responsable_entidad', 'cp.anio',
                    DB::raw("CONCAT(u.nombres, ' ', u.apellidos) as elaborado_por"),
                    DB::raw('(SELECT COALESCE(SUM(ci.monto),0) FROM certificacion_items ci WHERE ci.id_certificacion = c.id_certificacion) as monto_total')
                )
                ->orderBy('c.fecha_elaboracion', 'desc')
                ->get();

            return response()->json(['success' => true, 'data' => $rows]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * GET /api/reportes/liquidaciones/json — para impresión PDF
     */
    public function liquidacionesJson(Request $request)
    {
        try {
            $rows = DB::table('liquidaciones as l')
                ->leftJoin('certificacion_items as ci', 'l.id_certificacion_item', '=', 'ci.id_certificacion_item')
                ->leftJoin('certificacion as c',        'ci.id_certificacion',     '=', 'c.id_certificacion')
                ->leftJoin('items as i',                'l.id_item',               '=', 'i.id_item')
                ->select(
                    'l.id_liquidacion', 'l.fecha_creacion', 'l.memorando',
                    'l.cantidad_liquidacion', 'l.estado', 'l.motivo_anulacion',
                    'i.cod_item', 'i.nombre_item', 'c.numero_certificado'
                )
                ->orderBy('l.fecha_creacion', 'desc')
                ->get();

            return response()->json(['success' => true, 'data' => $rows]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * GET /api/reportes/presupuesto/json — para impresión PDF
     */
    public function presupuestoJson(Request $request)
    {
        try {
            $rows = DB::table('fuente_items as fi')
                ->join('items as i',                 'fi.id_item',        '=', 'i.id_item')
                ->join('fuente_financiamiento as f',  'fi.id_fuente',      '=', 'f.id_fuente')
                ->leftJoin('actividad as a',           'i.id_actividad',    '=', 'a.id_actividad')
                ->leftJoin('proyecto as pr',           'a.id_proyecto',     '=', 'pr.id_proyecto')
                ->leftJoin('subprograma as sp',        'pr.id_subprograma', '=', 'sp.id_subprograma')
                ->leftJoin('programa as p',            'sp.id_programa',    '=', 'p.id_programa')
                ->select(
                    'i.id_item', 'fi.id_fuente', 'i.cod_item', 'i.nombre_item',
                    DB::raw('COALESCE(fi.asignado, 0) as asignado'),
                    DB::raw('COALESCE(fi.modificado, 0) as modificado'),
                    'f.cod_fuente', 'a.cod_actividad', 'p.nombre_programa'
                )
                ->orderBy('i.cod_item')
                ->get();

            $certMap = DB::table('certificacion_items as ci')
                ->join('certificacion as c', 'ci.id_certificacion', '=', 'c.id_certificacion')
                ->select('ci.id_item', 'ci.id_fuente', DB::raw('SUM(ci.monto) as total'))
                ->whereNotIn('c.estado', ['ANULADA'])
                ->groupBy('ci.id_item', 'ci.id_fuente')
                ->get()
                ->mapWithKeys(fn($r) => ["{$r->id_item}_{$r->id_fuente}" => (float) $r->total]);

            $data = $rows->map(function ($r) use ($certMap) {
                $codificado  = (float) $r->asignado + (float) $r->modificado;
                $certificado = $certMap["{$r->id_item}_{$r->id_fuente}"] ?? 0.0;
                $saldo       = max(0, $codificado - $certificado);
                return [
                    'cod_item'       => $r->cod_item,
                    'nombre_item'    => $r->nombre_item,
                    'nombre_programa'=> $r->nombre_programa ?? '',
                    'cod_actividad'  => $r->cod_actividad ?? '',
                    'cod_fuente'     => $r->cod_fuente,
                    'codificado'     => round($codificado, 2),
                    'certificado'    => round($certificado, 2),
                    'saldo'          => round($saldo, 2),
                ];
            });

            return response()->json(['success' => true, 'data' => $data->values()]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    private function buildCsv(array $headers, array $rows): string
    {
        $output = fopen('php://temp', 'r+');

        // BOM UTF-8 para Excel
        fputs($output, "\xEF\xBB\xBF");

        fputcsv($output, $headers, ';');

        foreach ($rows as $row) {
            fputcsv($output, $row, ';');
        }

        rewind($output);
        $csv = stream_get_contents($output);
        fclose($output);

        return $csv;
    }
}

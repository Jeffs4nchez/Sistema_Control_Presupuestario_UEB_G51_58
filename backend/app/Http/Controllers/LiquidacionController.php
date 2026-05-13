<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Liquidacion;
use App\Models\CertificacionItem;
use Illuminate\Support\Facades\DB;

class LiquidacionController extends Controller
{
    /**
     * Listar liquidaciones de un certificacion_item específico
     * GET /liquidaciones?id_certificacion_item=X
     */
    public function index(Request $request)
    {
        try {
            $idCertItem = $request->input('id_certificacion_item');

            $query = Liquidacion::with(['item', 'certificacionItem.certificacion'])
                                ->orderBy('fecha_creacion', 'desc');

            if ($idCertItem) $query->where('id_certificacion_item', $idCertItem);

            $liquidaciones = $query->get();

            $totalLiquidado = $liquidaciones->sum('cantidad_liquidacion');

            // Traer el monto certificado de certificacion_items
            $certItem = null;
            if ($idCertItem) {
                $certItem = CertificacionItem::find($idCertItem);
            }

            $montoCertificado = $certItem ? (float) $certItem->monto : 0;
            $pendiente        = max(0, $montoCertificado - $totalLiquidado);

            return response()->json([
                'success' => true,
                'data'    => $liquidaciones,
                'resumen' => [
                    'certificado' => $montoCertificado,
                    'liquidado'   => (float) $totalLiquidado,
                    'pendiente'   => (float) $pendiente,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Crear una liquidación
     * POST /liquidaciones
     */
    public function store(Request $request)
    {
        $request->validate([
            'id_certificacion_item' => 'required|integer|exists:certificacion_items,id_certificacion_item',
            'cantidad_liquidacion'  => 'required|numeric|min:0.01|max:999999999999.99',
            'fecha_creacion'        => 'required|date',
            'memorando'             => 'required|string|max:100',
        ]);

        try {
            $certItem = CertificacionItem::findOrFail($request->id_certificacion_item);

            $montoCertificado = (float) $certItem->monto;

            $yaLiquidado = (float) Liquidacion::where('id_certificacion_item', $request->id_certificacion_item)
                                              ->sum('cantidad_liquidacion');

            $disponible = max(0, $montoCertificado - $yaLiquidado);

            if ((float) $request->cantidad_liquidacion > $disponible) {
                return response()->json([
                    'success' => false,
                    'message' => "El monto supera el disponible. Certificado: \$$montoCertificado, "
                               . "Ya liquidado: \$$yaLiquidado, Disponible: \$$disponible",
                ], 422);
            }

            $liquidacion = Liquidacion::create([
                'id_item'               => $certItem->id_item,
                'id_certificacion_item' => $request->id_certificacion_item,
                'cantidad_liquidacion'  => $request->cantidad_liquidacion,
                'fecha_creacion'        => $request->fecha_creacion,
                'memorando'             => $request->memorando,
                'estado'                => 'LIQUIDADO',
            ]);

            return response()->json([
                'success' => true,
                'data'    => $liquidacion->load(['item', 'certificacionItem.certificacion']),
                'message' => 'Liquidación registrada exitosamente',
            ], 201);

        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Eliminar una liquidación
     * DELETE /liquidaciones/{id}
     */
    public function destroy($id)
    {
        try {
            $liquidacion = Liquidacion::findOrFail($id);
            $liquidacion->delete();

            return response()->json([
                'success' => true,
                'message' => 'Liquidación eliminada',
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Certificaciones agrupadas con sus ítems y estado de liquidación
     * GET /liquidaciones/certificaciones?search=X
     */
    public function certificaciones(Request $request)
    {
        try {
            $search = $request->input('search', '');

            $query = DB::table('certificacion_items as ci')
                ->join('certificacion as c',         'ci.id_certificacion', '=', 'c.id_certificacion')
                ->join('items as i',                 'ci.id_item',          '=', 'i.id_item')
                ->leftJoin('fuente_financiamiento as f', 'ci.id_fuente',    '=', 'f.id_fuente')
                ->select(
                    'ci.id_certificacion_item',
                    'ci.id_certificacion',
                    'ci.id_item',
                    'ci.id_fuente',
                    'ci.monto',
                    'i.cod_item',
                    'i.nombre_item',
                    'c.numero_certificado',
                    'c.fecha_elaboracion',
                    'f.cod_fuente',
                    'f.nombre_fuente'
                )
                ->where('ci.monto', '>', 0);

            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('c.numero_certificado', 'LIKE', "%$search%")
                      ->orWhere('i.cod_item',          'LIKE', "%$search%")
                      ->orWhere('i.nombre_item',        'LIKE', "%$search%");
                });
            }

            $allItems = $query->orderBy('c.fecha_elaboracion', 'desc')
                              ->orderBy('i.cod_item')
                              ->get();

            // Calcular liquidado/pendiente por ítem
            $allItems = $allItems->map(function ($row) {
                $liquidado      = (float) Liquidacion::where('id_certificacion_item', $row->id_certificacion_item)
                                                     ->sum('cantidad_liquidacion');
                $row->liquidado = $liquidado;
                $row->pendiente = max(0, (float) $row->monto - $liquidado);
                return $row;
            });

            // Agrupar por certificación
            $grouped = $allItems->groupBy('id_certificacion')->map(function ($certItems) {
                $first = $certItems->first();
                return [
                    'id_certificacion'   => $first->id_certificacion,
                    'numero_certificado' => $first->numero_certificado,
                    'fecha_elaboracion'  => $first->fecha_elaboracion,
                    'total_monto'        => (float) $certItems->sum('monto'),
                    'total_liquidado'    => (float) $certItems->sum('liquidado'),
                    'total_pendiente'    => (float) $certItems->sum('pendiente'),
                    'items_count'        => $certItems->count(),
                    'items'              => $certItems->values(),
                ];
            })->values();

            return response()->json([
                'success' => true,
                'data'    => $grouped,
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Obtener todos los certificacion_items con monto > 0 y sus totales liquidados
     * GET /liquidaciones/certificacion-items?search=X
     */
    public function certificacionItems(Request $request)
    {
        try {
            $search = $request->input('search', '');
            $page   = (int) $request->input('page', 1);
            $limit  = (int) $request->input('limit', 20);
            $offset = ($page - 1) * $limit;

            $query = DB::table('certificacion_items as ci')
                ->join('items as i',               'ci.id_item',           '=', 'i.id_item')
                ->join('certificacion as c',        'ci.id_certificacion',  '=', 'c.id_certificacion')
                ->leftJoin('fuente_financiamiento as f', 'ci.id_fuente',    '=', 'f.id_fuente')
                ->select(
                    'ci.id_certificacion_item',
                    'ci.id_certificacion',
                    'ci.id_item',
                    'ci.id_fuente',
                    'ci.monto',
                    'i.cod_item',
                    'i.nombre_item',
                    'c.numero_certificado',
                    'c.fecha_elaboracion',
                    'f.cod_fuente',
                    'f.nombre_fuente'
                )
                ->where('ci.monto', '>', 0);

            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('i.cod_item',            'LIKE', "%$search%")
                      ->orWhere('i.nombre_item',        'LIKE', "%$search%")
                      ->orWhere('c.numero_certificado', 'LIKE', "%$search%");
                });
            }

            $total   = $query->count();
            $records = $query->orderBy('c.fecha_elaboracion', 'desc')
                             ->orderBy('i.cod_item')
                             ->offset($offset)
                             ->limit($limit)
                             ->get();

            // Agregar liquidado y pendiente por certificacion_item
            $result = $records->map(function ($row) {
                $liquidado = (float) Liquidacion::where('id_certificacion_item', $row->id_certificacion_item)
                                               ->sum('cantidad_liquidacion');
                $row->liquidado = $liquidado;
                $row->pendiente = max(0, (float) $row->monto - $liquidado);
                return $row;
            });

            return response()->json([
                'success'    => true,
                'data'       => $result,
                'pagination' => [
                    'total' => $total,
                    'page'  => $page,
                    'limit' => $limit,
                    'pages' => (int) ceil($total / max(1, $limit)),
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }
}

<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Certificacion;
use App\Models\CertificacionItem;
use App\Models\Item;
use App\Models\Actividad;
use App\Models\Ubicacion;
use App\Models\FuenteFinanciamiento;
use App\Models\Programa;
use App\Models\Subprograma;
use App\Models\Proyecto;
use App\Models\Organismo;
use App\Models\NaturalezaPrestacion;
use App\Models\EntidadRequiriente;
use App\Models\CedulaPresupuestaria;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class CertificacionController extends Controller
{
    /**
     * Listar certificados con filtros y paginación
     */
    public function index(Request $request)
    {
        try {
            $page = $request->input('page', 1);
            $limit = $request->input('limit', 10);
            $search = $request->input('search', '');
            $estado = $request->input('estado', '');
            $desde = $request->input('desde', '');
            $hasta = $request->input('hasta', '');

            $offset = ($page - 1) * $limit;

            $query = Certificacion::with('usuario', 'entidadRequiriente');

            // Filtros
            if ($search) {
                $query->where('numero_certificado', 'LIKE', "%$search%")
                      ->orWhere('descripcion', 'LIKE', "%$search%");
            }

            if ($estado) {
                $query->where('estado', $estado);
            }

            if ($desde) {
                $query->whereDate('fecha_elaboracion', '>=', $desde);
            }

            if ($hasta) {
                $query->whereDate('fecha_elaboracion', '<=', $hasta);
            }

            $total = $query->count();
            $certificados = $query->orderBy('id_certificacion', 'DESC')
                                  ->offset($offset)
                                  ->limit($limit)
                                  ->get();

            $data = $certificados->map(function ($cert) {
                $montoTotal = (float) ($cert->items()->sum('monto') ?? 0);

                $liquidado = (float) DB::table('liquidaciones')
                    ->join('certificacion_items', 'liquidaciones.id_certificacion_item', '=', 'certificacion_items.id_certificacion_item')
                    ->where('certificacion_items.id_certificacion', $cert->id_certificacion)
                    ->sum('liquidaciones.cantidad_liquidacion');

                $pendiente = max(0, $montoTotal - $liquidado);

                // Convertir fecha a datetime si es string
                $fecha = $cert->fecha_elaboracion;
                if (is_string($fecha)) {
                    $fecha = Carbon::createFromFormat('Y-m-d', $fecha);
                }

                return [
                    'id_certificacion' => $cert->id_certificacion,
                    'numero_certificado' => $cert->numero_certificado,
                    'institucion' => $cert->entidadRequiriente?->nombre_entidad ?? '-',
                    'usuario' => $cert->usuario?->nombres ?? '-',
                    'fecha_elaboracion' => $fecha->format('d/m/Y'),
                    'monto_total' => number_format($montoTotal, 2, ',', '.'),
                    'liquidado' => number_format($liquidado, 2, ',', '.'),
                    'pendiente' => number_format($pendiente, 2, ',', '.'),
                    'estado' => $cert->estado
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $data,
                'pagination' => [
                    'total' => $total,
                    'current_page' => $page,
                    'last_page' => ceil($total / $limit),
                    'per_page' => $limit
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Crear nuevo certificado con items
     */
    public function store(Request $request)
    {
        $request->validate([
            'descripcion' => 'required|string|max:255',
            'unid_ejecutora' => 'required|string|max:100',
            'des_u_ejecutora' => 'required|string|max:100',
            'clase_registro' => 'required|string|max:100',
            'clase_gasto' => 'required|string|max:100',
            'tipo_doc_respaldo' => 'required|string|max:100',
            'clase_doc_respaldo' => 'required|string|max:100',
            'seccion_memorando' => 'nullable|string|max:100',
            'id_entidad_requiriente' => 'required|exists:entidad_requiriente,id_entidad_requiriente',
            'id_cedula_presupuestaria' => 'required|exists:cedula_presupuestaria,id_cedula_presupuestaria',
            'items' => 'required|array|min:1',
            'items.*.id_programa' => 'required|exists:programa,id_programa',
            'items.*.id_subprograma' => 'required|exists:subprograma,id_subprograma',
            'items.*.id_proyecto' => 'required|exists:proyecto,id_proyecto',
            'items.*.id_actividad' => 'required|exists:actividad,id_actividad',
            'items.*.id_fuente' => 'required|exists:fuente_financiamiento,id_fuente',
            'items.*.id_ubicacion' => 'required|exists:ubicacion,id_ubicacion',
            'items.*.id_item' => 'required|exists:items,id_item',
            'items.*.id_organismo' => 'required|exists:organismos,id_organismo',
            'items.*.id_naturaleza' => 'required|exists:naturaleza_prestacion,id_naturaleza',
            'items.*.monto' => 'required|numeric|min:0.01',
        ]);

        try {
            DB::beginTransaction();

            // Generar número de certificado automático
            $ultimoCertificado = Certificacion::orderBy('id_certificacion', 'DESC')->first();
            $numero = ($ultimoCertificado?->id_certificacion ?? 0) + 1;
            $numeroCertificado = 'CERT-' . str_pad($numero, 3, '0', STR_PAD_LEFT);

            $certificado = Certificacion::create([
                'numero_certificado' => $numeroCertificado,
                'descripcion' => $request->descripcion,
                'fecha_elaboracion' => now()->toDateString(),
                'unid_ejecutora' => $request->unid_ejecutora,
                'des_u_ejecutora' => $request->des_u_ejecutora,
                'clase_registro' => $request->clase_registro,
                'clase_gasto' => $request->clase_gasto,
                'tipo_doc_respaldo' => $request->tipo_doc_respaldo,
                'clase_doc_respaldo' => $request->clase_doc_respaldo,
                'seccion_memorando' => $request->seccion_memorando,
                'estado' => 'APROBADO',
                'id_usuario' => auth()->id(),
                'id_entidad_requiriente' => $request->id_entidad_requiriente,
                'id_cedula_presupuestaria' => $request->id_cedula_presupuestaria
            ]);

            // Agregar items
            foreach ($request->items as $item) {
                CertificacionItem::create([
                    'id_certificacion' => $certificado->id_certificacion,
                    'id_item' => $item['id_item'],
                    'id_programa' => $item['id_programa'],
                    'id_subprograma' => $item['id_subprograma'],
                    'id_proyecto' => $item['id_proyecto'],
                    'id_actividad' => $item['id_actividad'],
                    'id_fuente' => $item['id_fuente'],
                    'id_ubicacion' => $item['id_ubicacion'],
                    'id_organismo' => $item['id_organismo'],
                    'id_naturaleza' => $item['id_naturaleza'],
                    'monto' => $item['monto']
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Certificado creado exitosamente con ' . count($request->items) . ' item(s)',
                'data' => $certificado->getDetalles()
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener detalles de un certificado
     */
    public function show($id)
    {
        try {
            $certificado = Certificacion::findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $certificado->getDetalles()
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Agregar item al certificado
     */
    public function agregarItem(Request $request, $idCertificacion)
    {
        $request->validate([
            'id_programa' => 'required|exists:programa,id_programa',
            'id_subprograma' => 'required|exists:subprograma,id_subprograma',
            'id_proyecto' => 'required|exists:proyecto,id_proyecto',
            'id_actividad' => 'required|exists:actividad,id_actividad',
            'id_fuente' => 'required|exists:fuente_financiamiento,id_fuente',
            'id_ubicacion' => 'required|exists:ubicacion,id_ubicacion',
            'id_item' => 'required|exists:items,id_item',
            'id_organismo' => 'required|exists:organismos,id_organismo',
            'id_naturaleza' => 'required|exists:naturaleza_prestacion,id_naturaleza',
            'monto' => 'required|numeric|min:0.01',
        ]);

        try {
            $certificado = Certificacion::findOrFail($idCertificacion);

            // Verificar que el item no esté duplicado en este certificado
            $existente = CertificacionItem::where('id_certificacion', $idCertificacion)
                                          ->where('id_item', $request->id_item)
                                          ->where('id_fuente', $request->id_fuente)
                                          ->first();

            if ($existente) {
                return response()->json([
                    'success' => false,
                    'message' => 'Este item ya está agregado al certificado'
                ], 422);
            }

            // Crear registro en tabla intermedia
            $item = CertificacionItem::create([
                'id_certificacion' => $idCertificacion,
                'id_item' => $request->id_item,
                'id_programa' => $request->id_programa,
                'id_subprograma' => $request->id_subprograma,
                'id_proyecto' => $request->id_proyecto,
                'id_actividad' => $request->id_actividad,
                'id_fuente' => $request->id_fuente,
                'id_ubicacion' => $request->id_ubicacion,
                'id_organismo' => $request->id_organismo,
                'id_naturaleza' => $request->id_naturaleza,
                'monto' => $request->monto
            ]);

            // Actualizar monto total del certificado
            $certificado->actualizarMontoTotal();

            return response()->json([
                'success' => true,
                'message' => 'Item agregado exitosamente',
                'data' => $certificado->getDetalles()
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Actualizar monto de un item del certificado
     */
    public function actualizarItem(Request $request, $idCertificacion, $idItem)
    {
        $request->validate([
            'monto' => 'required|numeric|min:0.01',
        ]);

        try {
            $item = CertificacionItem::where('id_certificacion', $idCertificacion)
                                      ->where('id_certificacion_item', $idItem)
                                      ->firstOrFail();

            $item->update(['monto' => $request->monto]);

            $certificado = Certificacion::findOrFail($idCertificacion);
            $certificado->actualizarMontoTotal();

            return response()->json([
                'success' => true,
                'message' => 'Monto actualizado exitosamente',
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remover item del certificado
     */
    public function removerItem($idCertificacion, $idItem)
    {
        try {
            $certificado = Certificacion::findOrFail($idCertificacion);

            $item = CertificacionItem::where('id_certificacion', $idCertificacion)
                                      ->where('id_certificacion_item', $idItem)
                                      ->firstOrFail();

            $item->delete();

            // Actualizar monto total del certificado
            $certificado->actualizarMontoTotal();

            return response()->json([
                'success' => true,
                'message' => 'Item removido exitosamente',
                'data' => $certificado->getDetalles()
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Actualizar certificado
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'descripcion' => 'nullable|string|max:255',
            'unid_ejecutora' => 'nullable|string|max:100',
            'des_u_ejecutora' => 'nullable|string|max:100',
            'clase_registro' => 'nullable|string|max:100',
            'clase_gasto' => 'nullable|string|max:100',
            'tipo_doc_respaldo' => 'nullable|string|max:100',
            'clase_doc_respaldo' => 'nullable|string|max:100',
            'estado' => 'nullable|in:PENDIENTE,APROBADO,RECHAZADO'
        ]);

        try {
            $certificado = Certificacion::findOrFail($id);
            $certificado->update($request->only([
                'descripcion',
                'unid_ejecutora',
                'des_u_ejecutora',
                'clase_registro',
                'clase_gasto',
                'tipo_doc_respaldo',
                'clase_doc_respaldo',
                'estado'
            ]));

            return response()->json([
                'success' => true,
                'message' => 'Certificado actualizado exitosamente',
                'data' => $certificado->getDetalles()
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Eliminar certificado
     */
    public function destroy($id)
    {
        try {
            $certificado = Certificacion::findOrFail($id);
            $certificado->delete();

            return response()->json([
                'success' => true,
                'message' => 'Certificado eliminado exitosamente'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener datos para cascadas: programas
     */
    public function getProgramas()
    {
        try {
            $programas = Programa::select('id_programa', 'cod_programa', 'nombre_programa')
                                 ->get();

            return response()->json([
                'success' => true,
                'data' => $programas
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener subprogramas por programa
     */
    public function getSubprogramas($idPrograma)
    {
        try {
            $subprogramas = Subprograma::where('id_programa', $idPrograma)
                                       ->select('id_subprograma', 'cod_subprograma', 'nombre_subprograma')
                                       ->get();

            return response()->json([
                'success' => true,
                'data' => $subprogramas
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener proyectos por subprograma
     */
    public function getProyectos($idSubprograma)
    {
        try {
            $proyectos = Proyecto::where('id_subprograma', $idSubprograma)
                                  ->select('id_proyecto', 'cod_proyecto', 'nombre_proyecto')
                                  ->get();

            return response()->json([
                'success' => true,
                'data' => $proyectos
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener actividades por proyecto
     */
    public function getActividades($idProyecto)
    {
        try {
            $actividades = Actividad::where('id_proyecto', $idProyecto)
                                     ->select('id_actividad', 'cod_actividad', 'nombre_actividad')
                                     ->get();

            return response()->json([
                'success' => true,
                'data' => $actividades
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener fuentes financiamiento
     */
    public function getFuentes()
    {
        try {
            $fuentes = FuenteFinanciamiento::select('id_fuente', 'cod_fuente', 'nombre_fuente')
                                           ->get();

            return response()->json([
                'success' => true,
                'data' => $fuentes
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener fuentes por actividad
     */
    public function getFuentesByActividad($idActividad)
    {
        try {
            $fuentes = DB::table('fuente_financiamiento')
                ->join('actividad_fuente', 'fuente_financiamiento.id_fuente', '=', 'actividad_fuente.id_fuente')
                ->where('actividad_fuente.id_actividad', $idActividad)
                ->select('fuente_financiamiento.id_fuente', 'fuente_financiamiento.cod_fuente', 'fuente_financiamiento.nombre_fuente')
                ->distinct()
                ->get();

            return response()->json([
                'success' => true,
                'data' => $fuentes
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener ubicaciones por actividad
     */
    public function getUbicaciones($idActividad)
    {
        try {
            $ubicaciones = Ubicacion::whereHas('items', function ($query) use ($idActividad) {
                $query->where('id_actividad', $idActividad);
            })->select('id_ubicacion', 'cod_ubicacion', 'nombre_ubicacion')
              ->distinct()
              ->get();

            return response()->json([
                'success' => true,
                'data' => $ubicaciones
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener items por actividad y ubicación
     */
    public function getItems($idActividad, $idUbicacion)
    {
        try {
            $items = Item::where('id_actividad', $idActividad)
                         ->where('id_ubicacion', $idUbicacion)
                         ->select('id_item', 'cod_item', 'nombre_item')
                         ->get();

            return response()->json([
                'success' => true,
                'data' => $items
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener items por actividad, ubicación y fuente
     */
    public function getItemsByFuente($idActividad, $idUbicacion, $idFuente)
    {
        try {
            $items = DB::table('items')
                ->join('fuente_items', 'items.id_item', '=', 'fuente_items.id_item')
                ->where('items.id_actividad', $idActividad)
                ->where('items.id_ubicacion', $idUbicacion)
                ->where('fuente_items.id_fuente', $idFuente)
                ->select('items.id_item', 'items.cod_item', 'items.nombre_item')
                ->distinct()
                ->get();

            return response()->json([
                'success' => true,
                'data' => $items
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener organismos
     */
    public function getOrganismos()
    {
        try {
            $organismos = Organismo::select('id_organismo', 'cod_organismo', 'nombre_organismo')
                                    ->get();

            return response()->json([
                'success' => true,
                'data' => $organismos
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener entidades requirientes
     */
    public function getEntidadesRequirientes()
    {
        try {
            $entidades = EntidadRequiriente::select(
                'id_entidad_requiriente',
                'nombre_entidad',
                'responsable_entidad',
                'correo_institucional',
                'memorando'
            )->get();

            return response()->json([
                'success' => true,
                'data' => $entidades
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Crear nueva entidad requiriente
     */
    public function createEntidadRequiriente(Request $request)
    {
        try {
            $request->validate([
                'nombre_entidad' => 'required|string|max:100',
                'responsable_entidad' => 'required|string|max:100',
                'correo_institucional' => 'required|email|max:100',
                'memorando' => 'required|string|max:100',
            ]);

            $entidad = EntidadRequiriente::create([
                'nombre_entidad' => $request->nombre_entidad,
                'responsable_entidad' => $request->responsable_entidad,
                'correo_institucional' => $request->correo_institucional,
                'memorando' => $request->memorando,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Entidad requiriente creada exitosamente',
                'data' => $entidad
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener cédulas presupuestarias
     */
    public function getCedulasPresupuestarias()
    {
        try {
            $cedulas = CedulaPresupuestaria::select('id_cedula_presupuestaria', 'anio')
                                           ->orderBy('anio', 'DESC')
                                           ->get()
                                           ->map(function ($cedula) {
                                               return [
                                                   'id_cedula_presupuestaria' => $cedula->id_cedula_presupuestaria,
                                                   'anio' => $cedula->anio,
                                                   'display' => 'Año ' . $cedula->anio
                                               ];
                                           });

            return response()->json([
                'success' => true,
                'data' => $cedulas
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener cédula del año actual
     */
    public function getCedulaActual()
    {
        try {
            $añoActual = now()->year;
            $cedula = CedulaPresupuestaria::where('anio', $añoActual)->first();

            if (!$cedula) {
                return response()->json([
                    'success' => false,
                    'message' => 'No hay cédula para el año ' . $añoActual
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'id_cedula_presupuestaria' => $cedula->id_cedula_presupuestaria,
                    'anio' => $cedula->anio
                ]
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Crear nueva cédula presupuestaria (Ya no es necesario - se crean en la migración)
     */
    public function createCedulaPresupuestaria(Request $request)
    {
        try {
            return response()->json([
                'success' => false,
                'message' => 'Las cédulas presupuestarias se crean automáticamente en la migración. Año actual + 3 años anteriores.'
            ], 400);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener naturaleza prestación
     */
    public function getNaturalezas()
    {
        try {
            $naturalezas = NaturalezaPrestacion::select('id_naturaleza', 'cod_naturaleza', 'nombre_naturaleza')
                                               ->get();

            return response()->json([
                'success' => true,
                'data' => $naturalezas
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Verificar monto disponible para certificar de un item
     * Compara el codificado (asignado + modificado) con lo ya certificado
     * Los certificados se crean YA APROBADOS, no hay pendientes
     */
    public function verificarMontoDisponible($idItem, $idFuente)
    {
        try {
            // Obtener el registro de fuente_items
            $fuenteItem = DB::table('fuente_items')
                ->where('id_item', $idItem)
                ->where('id_fuente', $idFuente)
                ->select('asignado', 'modificado')
                ->first();

            if (!$fuenteItem) {
                return response()->json([
                    'success' => false,
                    'message' => 'Item no encontrado en la fuente presupuestaria'
                ], 404);
            }

            $asignado = floatval($fuenteItem->asignado ?? 0);
            $modificado = floatval($fuenteItem->modificado ?? 0);

            // Certificado bruto: suma de todos los montos aprobados/liquidados
            $certificado_bruto = (float) DB::table('certificacion_items')
                ->join('certificacion', 'certificacion_items.id_certificacion', '=', 'certificacion.id_certificacion')
                ->where('certificacion_items.id_item', $idItem)
                ->where('certificacion_items.id_fuente', $idFuente)
                ->whereIn('certificacion.estado', ['APROBADO', 'LIQUIDADO'])
                ->sum('certificacion_items.monto');

            // Lo ya liquidado (pagado) de esas certificaciones
            $ya_liquidado = (float) DB::table('liquidaciones')
                ->join('certificacion_items', 'liquidaciones.id_certificacion_item', '=', 'certificacion_items.id_certificacion_item')
                ->join('certificacion', 'certificacion_items.id_certificacion', '=', 'certificacion.id_certificacion')
                ->where('certificacion_items.id_item', $idItem)
                ->where('certificacion_items.id_fuente', $idFuente)
                ->whereIn('certificacion.estado', ['APROBADO', 'LIQUIDADO'])
                ->sum('liquidaciones.cantidad_liquidacion');

            // Certificado neto = pendiente de pago (igual que cédula)
            $certificado_neto = max(0, $certificado_bruto - $ya_liquidado);

            // Codificado = Asignado + Modificado
            $codificado = $asignado + $modificado;

            // Disponible = Codificado - Certificado neto (igual que Saldo Disponible en cédula)
            $disponible_final = $codificado - $certificado_neto;

            return response()->json([
                'success' => true,
                'data' => [
                    'asignado' => $asignado,
                    'modificado' => $modificado,
                    'codificado' => $codificado,
                    'certificado_actual' => $certificado_neto,
                    'certificado_pendiente' => 0,
                    'disponible' => $disponible_final,
                    'disponible_final' => max(0, $disponible_final),
                    'puede_certificar' => $disponible_final > 0
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
    }
}

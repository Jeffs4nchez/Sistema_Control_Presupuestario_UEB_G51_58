<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Actividad;
use App\Models\Item;
use App\Models\Ubicacion;
use App\Models\FuenteFinanciamiento;

class CedulaPresupuestariaController extends Controller
{
    /**
     * Cargar archivo CSV de cédula presupuestaria
     * 
     * Estructura esperada (21 columnas):
     * DESCRIPCIONG1 (programa), DESCRIPCIONG2 (actividad), DESCRIPCIONG3 (fuente), 
     * DESCRIPCIONG4 (ubicación), DESCRIPCIONG5 (item)
     * 
     * COL1-COL10, COL20 (valores financieros)
     * 
     * CODIGOG1 (programa), CODIGOG2 (actividad), CODIGOG3 (fuente), 
     * CODIGOG4 (ubicación), CODIGOG5 (item)
     */
    public function upload(Request $request)
    {
        $request->validate([
            'csv_file' => 'required|file|mimes:csv,txt|max:10240'
        ]);

        try {
            $file = $request->file('csv_file');
            $content = $file->getContent();
            $lines = explode("\n", $content);
            
            $processedCount = 0;
            $insertCount = 0;
            $updateCount = 0;
            $validation_errors = [];
            $debug_info = [];
            $registros_guardados = [];  // Guardar todos los registros para mostrar

            foreach ($lines as $lineNum => $line) {
                $rowNum = $lineNum + 1;
                
                // Saltar header y líneas vacías
                if ($lineNum === 0 || empty(trim($line))) {
                    continue;
                }

                try {
                    // PASO 1: Parsear CSV
                    $row = str_getcsv($line, ';');
                    
                    if (count($row) !== 21) {
                        $validation_errors[] = [
                            'row' => $rowNum,
                            'error' => 'Columnas: esperadas 21, encontradas ' . count($row)
                        ];
                        continue;
                    }

                    // PASO 2: Extraer códigos
                    $codActividad = trim($row[17]);
                    $codFuente = trim($row[18]);
                    $codUbicacion = trim($row[19]);
                    $codItem = trim($row[20]);

                    // PASO 3: Parsear valores financieros
                    $asignado = $this->parseDecimal($row[5]);
                    $modificado = $this->parseDecimal($row[6]);
                    $certificado = $this->parseDecimal($row[8]);
                    $comprometido = $this->parseDecimal($row[9]);
                    $devengado = $this->parseDecimal($row[10]);
                    $pagado = $this->parseDecimal($row[11]);
                    $por_comprometer = $this->parseDecimal($row[12]);
                    $por_devengar = $this->parseDecimal($row[13]);
                    $por_pagar = $this->parseDecimal($row[14]);

                    // PASO 4: Buscar Actividad
                    $actividad = Actividad::where('cod_actividad', $codActividad)->first();
                    if (!$actividad) {
                        $validation_errors[] = [
                            'row' => $rowNum,
                            'error' => "Actividad '$codActividad' NO EXISTE"
                        ];
                        continue;
                    }

                    // PASO 5: Buscar Ubicación
                    $ubicacion = Ubicacion::where('cod_ubicacion', $codUbicacion)->first();
                    if (!$ubicacion) {
                        $validation_errors[] = [
                            'row' => $rowNum,
                            'error' => "Ubicación '$codUbicacion' NO EXISTE"
                        ];
                        continue;
                    }

                    // PASO 6: Buscar Fuente
                    $fuente = FuenteFinanciamiento::where('cod_fuente', $codFuente)->first();
                    if (!$fuente) {
                        $validation_errors[] = [
                            'row' => $rowNum,
                            'error' => "Fuente '$codFuente' NO EXISTE"
                        ];
                        continue;
                    }

                    // PASO 7: Buscar Item
                    $item = Item::where('cod_item', $codItem)
                        ->where('id_actividad', $actividad->id_actividad)
                        ->where('id_ubicacion', $ubicacion->id_ubicacion)
                        ->first();
                    
                    if (!$item) {
                        $validation_errors[] = [
                            'row' => $rowNum,
                            'error' => "Item '$codItem' NO EXISTE para Actividad {$actividad->id_actividad} + Ubicación {$ubicacion->id_ubicacion}"
                        ];
                        continue;
                    }

                    // PASO 8: Verificar si el par (id_item, id_fuente) YA EXISTE en fuente_items
                    $fuenteItemExistente = \DB::table('fuente_items')
                        ->where('id_item', $item->id_item)
                        ->where('id_fuente', $fuente->id_fuente)
                        ->first();

                    if ($fuenteItemExistente) {
                        // YA EXISTE: ACTUALIZAR solo los valores financieros
                        \DB::table('fuente_items')
                            ->where('id_item', $item->id_item)
                            ->where('id_fuente', $fuente->id_fuente)
                            ->update([
                                'asignado' => $asignado,
                                'modificado' => $modificado,
                                'certificado' => $certificado,
                                'comprometido' => $comprometido,
                                'devengado' => $devengado,
                                'pagado' => $pagado,
                                'por_comprometer' => $por_comprometer,
                                'por_devengar' => $por_devengar,
                                'por_pagar' => $por_pagar,
                                'updated_at' => now(),
                            ]);

                        // Traer el registro completo actualizado
                        $registroCompleto = \DB::table('fuente_items')
                            ->leftJoin('items', 'fuente_items.id_item', '=', 'items.id_item')
                            ->leftJoin('fuente_financiamiento', 'fuente_items.id_fuente', '=', 'fuente_financiamiento.id_fuente')
                            ->leftJoin('actividad', 'items.id_actividad', '=', 'actividad.id_actividad')
                            ->leftJoin('proyecto', 'actividad.id_proyecto', '=', 'proyecto.id_proyecto')
                            ->leftJoin('subprograma', 'proyecto.id_subprograma', '=', 'subprograma.id_subprograma')
                            ->leftJoin('programa', 'subprograma.id_programa', '=', 'programa.id_programa')
                            ->leftJoin('ubicacion', 'items.id_ubicacion', '=', 'ubicacion.id_ubicacion')
                            ->where('fuente_items.id_item', $item->id_item)
                            ->where('fuente_items.id_fuente', $fuente->id_fuente)
                            ->select(
                                'items.id_item',
                                'items.cod_item',
                                'items.nombre_item',
                                'programa.cod_programa',
                                'actividad.cod_actividad',
                                'fuente_financiamiento.cod_fuente',
                                'ubicacion.cod_ubicacion',
                                'fuente_items.asignado',
                                'fuente_items.modificado',
                                'fuente_items.certificado',
                                'fuente_items.comprometido',
                                'fuente_items.devengado',
                                'fuente_items.pagado',
                                'fuente_items.por_comprometer',
                                'fuente_items.por_devengar',
                                'fuente_items.por_pagar',
                                'fuente_items.updated_at'
                            )
                            ->first();

                        $registros_guardados[] = (array) $registroCompleto;

                        $updateCount++;
                        $debug_info[] = [
                            'row' => $rowNum,
                            'status' => 'UPDATED',
                            'id_item' => $item->id_item,
                            'id_fuente' => $fuente->id_fuente,
                            'item_code' => $codItem,
                            'asignado' => $asignado
                        ];
                    } else {
                        // NO EXISTE: INSERTAR nuevo registro
                        \DB::table('fuente_items')->insert([
                            'id_item' => $item->id_item,
                            'id_fuente' => $fuente->id_fuente,
                            'asignado' => $asignado,
                            'modificado' => $modificado,
                            'certificado' => $certificado,
                            'comprometido' => $comprometido,
                            'devengado' => $devengado,
                            'pagado' => $pagado,
                            'por_comprometer' => $por_comprometer,
                            'por_devengar' => $por_devengar,
                            'por_pagar' => $por_pagar,
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]);

                        // Traer el registro completo insertado
                        $registroCompleto = \DB::table('fuente_items')
                            ->leftJoin('items', 'fuente_items.id_item', '=', 'items.id_item')
                            ->leftJoin('fuente_financiamiento', 'fuente_items.id_fuente', '=', 'fuente_financiamiento.id_fuente')
                            ->leftJoin('actividad', 'items.id_actividad', '=', 'actividad.id_actividad')
                            ->leftJoin('proyecto', 'actividad.id_proyecto', '=', 'proyecto.id_proyecto')
                            ->leftJoin('subprograma', 'proyecto.id_subprograma', '=', 'subprograma.id_subprograma')
                            ->leftJoin('programa', 'subprograma.id_programa', '=', 'programa.id_programa')
                            ->leftJoin('ubicacion', 'items.id_ubicacion', '=', 'ubicacion.id_ubicacion')
                            ->where('fuente_items.id_item', $item->id_item)
                            ->where('fuente_items.id_fuente', $fuente->id_fuente)
                            ->select(
                                'items.id_item',
                                'items.cod_item',
                                'items.nombre_item',
                                'programa.cod_programa',
                                'actividad.cod_actividad',
                                'fuente_financiamiento.cod_fuente',
                                'ubicacion.cod_ubicacion',
                                'fuente_items.asignado',
                                'fuente_items.modificado',
                                'fuente_items.certificado',
                                'fuente_items.comprometido',
                                'fuente_items.devengado',
                                'fuente_items.pagado',
                                'fuente_items.por_comprometer',
                                'fuente_items.por_devengar',
                                'fuente_items.por_pagar',
                                'fuente_items.updated_at'
                            )
                            ->first();

                        $registros_guardados[] = (array) $registroCompleto;

                        $insertCount++;
                        $debug_info[] = [
                            'row' => $rowNum,
                            'status' => 'INSERTED',
                            'id_item' => $item->id_item,
                            'id_fuente' => $fuente->id_fuente,
                            'item_code' => $codItem,
                            'asignado' => $asignado
                        ];
                    }

                    $processedCount++;

                } catch (\Exception $e) {
                    $validation_errors[] = [
                        'row' => $rowNum,
                        'error' => 'Exception: ' . $e->getMessage()
                    ];
                }
            }

            return response()->json([
                'success' => true,
                'message' => "Procesadas $processedCount filas. $insertCount insertadas, $updateCount actualizadas. " . count($validation_errors) . " errores.",
                'data' => [
                    'processed_count' => $processedCount,
                    'insert_count' => $insertCount,
                    'update_count' => $updateCount,
                    'total_rows' => count(array_filter($lines)),
                    'errors' => array_slice($validation_errors, 0, 10),
                    'registros' => $registros_guardados  // TODOS los registros insertados/actualizados en orden
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fatal: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener resumen de items con valores financieros
     */
    public function summary()
    {
        try {
            $summary = [
                'items_con_datos' => \DB::table('fuente_items')->whereNotNull('asignado')->count(),
                'valor_total_asignado' => \DB::table('fuente_items')->sum('asignado'),
                'valor_total_modificado' => \DB::table('fuente_items')->sum('modificado'),
                'valor_total_certificado' => \DB::table('fuente_items')->sum('certificado'),
                'valor_total_comprometido' => \DB::table('fuente_items')->sum('comprometido'),
                'valor_total_devengado' => \DB::table('fuente_items')->sum('devengado'),
                'valor_total_pagado' => \DB::table('fuente_items')->sum('pagado'),
            ];

            return response()->json([
                'success' => true,
                'data' => $summary
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener datos de items desde fuente_items (para mostrar los 46 registros)
     */
    public function getData(Request $request)
    {
        try {
            $page = $request->input('page', 1);
            $limit = $request->input('limit', 50);
            $search = $request->input('search', '');

            $offset = ($page - 1) * $limit;

            // Traer desde fuente_items (46 registros) con joins a todas las relaciones
            // Estructura: programa -> subprograma -> proyecto -> actividad -> items
            $query = \DB::table('fuente_items')
                ->leftJoin('items', 'fuente_items.id_item', '=', 'items.id_item')
                ->leftJoin('fuente_financiamiento', 'fuente_items.id_fuente', '=', 'fuente_financiamiento.id_fuente')
                ->leftJoin('actividad', 'items.id_actividad', '=', 'actividad.id_actividad')
                ->leftJoin('proyecto', 'actividad.id_proyecto', '=', 'proyecto.id_proyecto')
                ->leftJoin('subprograma', 'proyecto.id_subprograma', '=', 'subprograma.id_subprograma')
                ->leftJoin('programa', 'subprograma.id_programa', '=', 'programa.id_programa')
                ->leftJoin('ubicacion', 'items.id_ubicacion', '=', 'ubicacion.id_ubicacion')
                ->select(
                    'items.id_item',
                    'items.cod_item',
                    'items.nombre_item',
                    'programa.cod_programa',
                    'actividad.cod_actividad',
                    'fuente_financiamiento.cod_fuente',
                    'ubicacion.cod_ubicacion',
                    'fuente_items.asignado',
                    'fuente_items.modificado',
                    'fuente_items.certificado',
                    'fuente_items.comprometido',
                    'fuente_items.devengado',
                    'fuente_items.pagado',
                    'fuente_items.por_comprometer',
                    'fuente_items.por_devengar',
                    'fuente_items.por_pagar',
                    'fuente_items.updated_at'
                );

            if ($search) {
                $query->where('items.cod_item', 'LIKE', "%$search%")
                      ->orWhere('items.nombre_item', 'LIKE', "%$search%");
            }

            $total = $query->count();
            $items = $query->offset($offset)
                          ->limit($limit)
                          ->get();

            // Transformar datos para mostrar valores por defecto si están vacíos
            $data = $items->map(function ($item) {
                return [
                    'id_item' => $item->id_item,
                    'cod_item' => $item->cod_item,
                    'nombre_item' => $item->nombre_item,
                    'cod_programa' => $item->cod_programa ?? '-',
                    'cod_actividad' => $item->cod_actividad ?? '-',
                    'cod_fuente' => $item->cod_fuente ?? '-',
                    'cod_ubicacion' => $item->cod_ubicacion ?? '-',
                    'asignado' => $item->asignado ?? '-',
                    'modificado' => $item->modificado ?? '-',
                    'certificado' => $item->certificado ?? '-',
                    'comprometido' => $item->comprometido ?? '-',
                    'devengado' => $item->devengado ?? '-',
                    'pagado' => $item->pagado ?? '-',
                    'por_comprometer' => $item->por_comprometer ?? '-',
                    'por_devengar' => $item->por_devengar ?? '-',
                    'por_pagar' => $item->por_pagar ?? '-',
                    'updated_at' => $item->updated_at
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
     * Parsear valores decimales desde string
     * Maneja formato europeo: 1.000.000,50 (puntos de miles, coma de decimal)
     */
    private function parseDecimal($value)
    {
        $original = $value;
        
        // Manejar null
        if ($value === null) {
            return null;
        }
        
        // Convertir a string si no lo es
        $value = (string) $value;
        
        // Limpiar espacios y caracteres especiales
        $value = trim($value);
        
        // Remover comillas dobles y simples
        $value = str_replace('"', '', $value);
        $value = str_replace("'", '', $value);
        
        // Vacío después de limpiar
        if ($value === '' || $value === '-') {
            return null;
        }
        
        // Si es "0" retornar 0.0
        if ($value === '0' || $value === '0.0') {
            return 0.0;
        }
        
        // ========== MANEJO DE FORMATO EUROPEO ==========
        // El formato es: 1.000.000,50 (puntos = miles, coma = decimal)
        
        // Detectar si tiene coma (separador decimal)
        if (strpos($value, ',') !== false) {
            // Tiene coma: asumir formato europeo
            // Remover todos los puntos (separadores de miles)
            $value = str_replace('.', '', $value);
            // Convertir coma a punto (decimal)
            $value = str_replace(',', '.', $value);
        }
        // Si NO tiene coma pero SÍ tiene puntos, asumir que son miles
        elseif (strpos($value, '.') !== false) {
            // Podría ser: 1.000 (mil) o 1.5 (decimal con punto)
            // Heurística: si el punto es el 4to carácter desde el final, probablemente es decimal
            $parts = explode('.', $value);
            if (count($parts) === 2 && strlen($parts[1]) <= 2) {
                // 1.5 o 1.50 -> es decimal
                // Dejar como está (ya tiene punto como decimal)
            } else {
                // 1.000.000 o similar -> son miles
                // Remover todos los puntos
                $value = str_replace('.', '', $value);
            }
        }
        
        // Remover espacios adicionales
        $value = trim($value);
        
        // Validar que sea numérico
        if (!is_numeric($value)) {
            \Log::warning("parseDecimal: NO es numérico después procesar", [
                'original' => $original,
                'processed' => $value
            ]);
            return null;
        }
        
        // Convertir a float
        $floatValue = (float) $value;
        
        // Retornar null si es NaN o infinito
        if (is_nan($floatValue) || is_infinite($floatValue)) {
            return null;
        }
        
        return $floatValue;
    }
}

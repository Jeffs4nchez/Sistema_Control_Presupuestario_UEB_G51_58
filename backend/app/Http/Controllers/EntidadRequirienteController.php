<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\EntidadRequiriente;

class EntidadRequirienteController extends Controller
{
    /**
     * GET /api/entidades-requirientes
     */
    public function index(Request $request)
    {
        try {
            $search = $request->input('search', '');

            $query = EntidadRequiriente::orderBy('nombre_entidad');

            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('nombre_entidad',        'LIKE', "%$search%")
                      ->orWhere('responsable_entidad', 'LIKE', "%$search%")
                      ->orWhere('correo_institucional', 'LIKE', "%$search%");
                });
            }

            return response()->json([
                'success' => true,
                'data'    => $query->get(),
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * POST /api/entidades-requirientes
     */
    public function store(Request $request)
    {
        $request->validate([
            'nombre_entidad'        => 'required|string|max:100',
            'responsable_entidad'   => 'required|string|max:100',
            'correo_institucional'  => 'required|email|max:100',
            'memorando'             => 'nullable|string|max:100',
        ]);

        try {
            $entidad = EntidadRequiriente::create([
                'nombre_entidad'        => $request->nombre_entidad,
                'responsable_entidad'   => $request->responsable_entidad,
                'correo_institucional'  => $request->correo_institucional,
                'memorando'             => $request->memorando ?? '',
            ]);

            return response()->json([
                'success' => true,
                'data'    => $entidad,
                'message' => 'Entidad requiriente creada exitosamente',
            ], 201);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * GET /api/entidades-requirientes/{id}
     */
    public function show($id)
    {
        try {
            $entidad = EntidadRequiriente::findOrFail($id);
            return response()->json(['success' => true, 'data' => $entidad]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 404);
        }
    }

    /**
     * PUT /api/entidades-requirientes/{id}
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'nombre_entidad'        => 'required|string|max:100',
            'responsable_entidad'   => 'required|string|max:100',
            'correo_institucional'  => 'required|email|max:100',
            'memorando'             => 'nullable|string|max:100',
        ]);

        try {
            $entidad = EntidadRequiriente::findOrFail($id);
            $entidad->update([
                'nombre_entidad'        => $request->nombre_entidad,
                'responsable_entidad'   => $request->responsable_entidad,
                'correo_institucional'  => $request->correo_institucional,
                'memorando'             => $request->memorando ?? '',
            ]);

            return response()->json([
                'success' => true,
                'data'    => $entidad,
                'message' => 'Entidad requiriente actualizada',
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * DELETE /api/entidades-requirientes/{id}
     */
    public function destroy($id)
    {
        try {
            $entidad = EntidadRequiriente::findOrFail($id);
            $entidad->delete();

            return response()->json([
                'success' => true,
                'message' => 'Entidad requiriente eliminada',
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }
}

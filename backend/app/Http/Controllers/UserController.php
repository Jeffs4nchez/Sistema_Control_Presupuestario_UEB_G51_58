<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    /**
     * Obtener lista de todos los usuarios
     */
    public function index()
    {
        try {
            $usuarios = User::select(
                'id_usuario',
                'nombres',
                'apellidos',
                'correo_institucional',
                'cargo',
                'estado',
                'created_at'
            )->get();

            return response()->json([
                'status' => 'success',
                'message' => 'Usuarios obtenidos correctamente',
                'data' => $usuarios
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Error al obtener usuarios: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Crear nuevo usuario
     */
    public function store(Request $request)
    {
        try {
            // Validar datos
            $validated = $request->validate([
                'nombres' => 'required|string|max:100',
                'apellidos' => 'required|string|max:100',
                'correo_institucional' => 'required|string|email|max:100|unique:usuarios,correo_institucional',
                'contrasena' => 'required|string|min:6',
                'cargo' => 'required|string|in:Director(a) financiera,Analista de presupuesto,Director(a) de talento humano,Rector',
                'estado' => 'required|string|in:activo,inactivo'
            ]);

            // Crear usuario con contraseña hasheada
            $usuario = User::create([
                'nombres' => $validated['nombres'],
                'apellidos' => $validated['apellidos'],
                'correo_institucional' => $validated['correo_institucional'],
                'contrasena' => Hash::make($validated['contrasena']),
                'cargo' => $validated['cargo'],
                'estado' => $validated['estado']
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Usuario creado correctamente',
                'data' => [
                    'id_usuario' => $usuario->id_usuario,
                    'nombres' => $usuario->nombres,
                    'apellidos' => $usuario->apellidos,
                    'correo_institucional' => $usuario->correo_institucional,
                    'cargo' => $usuario->cargo,
                    'estado' => $usuario->estado
                ]
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Error de validación',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Error al crear usuario: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener usuario por ID
     */
    public function show($id)
    {
        try {
            $usuario = User::find($id);

            if (!$usuario) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Usuario no encontrado'
                ], 404);
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Usuario obtenido correctamente',
                'data' => [
                    'id_usuario' => $usuario->id_usuario,
                    'nombres' => $usuario->nombres,
                    'apellidos' => $usuario->apellidos,
                    'correo_institucional' => $usuario->correo_institucional,
                    'cargo' => $usuario->cargo,
                    'estado' => $usuario->estado,
                    'created_at' => $usuario->created_at
                ]
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Error al obtener usuario: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Actualizar usuario
     */
    public function update(Request $request, $id)
    {
        try {
            $usuario = User::find($id);

            if (!$usuario) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Usuario no encontrado'
                ], 404);
            }

            // Validar datos
            $validated = $request->validate([
                'nombres' => 'sometimes|required|string|max:100',
                'apellidos' => 'sometimes|required|string|max:100',
                'correo_institucional' => 'sometimes|required|string|email|max:100|unique:usuarios,correo_institucional,' . $id . ',id_usuario',
                'contrasena' => 'sometimes|nullable|string|min:6',
                'cargo' => 'sometimes|required|string|in:Director(a) financiera,Analista de presupuesto,Director(a) de talento humano,Rector',
                'estado' => 'sometimes|required|string|in:activo,inactivo'
            ]);

            // Actualizar campos
            if (isset($validated['nombres'])) $usuario->nombres = $validated['nombres'];
            if (isset($validated['apellidos'])) $usuario->apellidos = $validated['apellidos'];
            if (isset($validated['correo_institucional'])) $usuario->correo_institucional = $validated['correo_institucional'];
            if (isset($validated['contrasena']) && !empty($validated['contrasena'])) {
                $usuario->contrasena = Hash::make($validated['contrasena']);
            }
            if (isset($validated['cargo'])) $usuario->cargo = $validated['cargo'];
            if (isset($validated['estado'])) $usuario->estado = $validated['estado'];

            $usuario->save();

            return response()->json([
                'status' => 'success',
                'message' => 'Usuario actualizado correctamente',
                'data' => [
                    'id_usuario' => $usuario->id_usuario,
                    'nombres' => $usuario->nombres,
                    'apellidos' => $usuario->apellidos,
                    'correo_institucional' => $usuario->correo_institucional,
                    'cargo' => $usuario->cargo,
                    'estado' => $usuario->estado
                ]
            ], 200);
        } catch (ValidationException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Error de validación',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Error al actualizar usuario: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Eliminar usuario
     */
    public function destroy($id)
    {
        try {
            $usuario = User::find($id);

            if (!$usuario) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Usuario no encontrado'
                ], 404);
            }

            $usuario->delete();

            return response()->json([
                'status' => 'success',
                'message' => 'Usuario eliminado correctamente'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Error al eliminar usuario: ' . $e->getMessage()
            ], 500);
        }
    }
}

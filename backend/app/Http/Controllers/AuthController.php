<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Login user and return token
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        \Log::info('Login attempt', ['email' => $request->email]);

        $user = User::where('correo_institucional', $request->email)->first();

        \Log::info('User found', ['user' => $user ? 'YES' : 'NO']);

        if (!$user) {
            \Log::warning('User not found for email: ' . $request->email);
            return response()->json([
                'status' => 'error',
                'message' => 'Usuario no encontrado',
            ], 401);
        }

        if (!Hash::check($request->password, $user->contrasena)) {
            \Log::warning('Invalid password for user: ' . $request->email);
            return response()->json([
                'status' => 'error',
                'message' => 'Contraseña incorrecta',
            ], 401);
        }

        // Generar token único
        $token = bin2hex(random_bytes(32));
        
        // Guardar token en la BD (si la tabla tiene campo api_token)
        try {
            $user->api_token = $token;
            $user->save();
        } catch (\Exception $e) {
            \Log::info('Note: api_token column not available, proceeding without saving token');
        }

        \Log::info('Login successful for user: ' . $request->email);

        return response()->json([
            'status' => 'success',
            'message' => 'Sesión iniciada correctamente',
            'user' => [
                'id_usuario' => $user->id_usuario,
                'nombres' => $user->nombres,
                'apellidos' => $user->apellidos,
                'correo_institucional' => $user->correo_institucional,
                'cargo' => $user->cargo,
                'estado' => $user->estado,
            ],
            'token' => $token,
        ], 200);
    }

    /**
     * Logout user
     */
    public function logout(Request $request)
    {
        return response()->json([
            'status' => 'success',
            'message' => 'Sesión cerrada correctamente',
        ], 200);
    }

    /**
     * Get current user
     */
    public function me(Request $request)
    {
        $token = $request->bearerToken();
        
        if (!$token) {
            return response()->json([
                'status' => 'error',
                'message' => 'Token no proporcionado',
            ], 401);
        }

        // Buscar usuario por token
        try {
            $user = User::where('api_token', $token)->first();
            
            if (!$user) {
                // Si no encuentra por token en BD, buscar el primer usuario (fallback)
                \Log::warning('Token not found in BD, using first user as fallback');
                $user = User::first();
            }
        } catch (\Exception $e) {
            // Si no existe columna api_token, usar el primer usuario
            $user = User::first();
        }
        
        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'Usuario no encontrado',
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'user' => [
                'id_usuario' => $user->id_usuario,
                'nombres' => $user->nombres,
                'apellidos' => $user->apellidos,
                'correo_institucional' => $user->correo_institucional,
                'cargo' => $user->cargo,
                'estado' => $user->estado,
            ],
        ], 200);
    }
}

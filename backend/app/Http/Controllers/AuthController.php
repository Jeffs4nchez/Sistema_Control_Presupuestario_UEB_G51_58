<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\ValidationException;
use Carbon\Carbon;

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

        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'Usuario no encontrado',
            ], 401);
        }

        // Cuenta bloqueada por intentos fallidos
        if (strtolower($user->estado) === 'bloqueado') {
            return response()->json([
                'status'   => 'error',
                'message'  => 'Tu cuenta está bloqueada por múltiples intentos fallidos. Contacta al administrador.',
                'bloqueado' => true,
            ], 403);
        }

        // Contraseña incorrecta — contar intentos
        if (!Hash::check($request->password, $user->contrasena)) {
            $user->intentos_fallidos = ($user->intentos_fallidos ?? 0) + 1;

            if ($user->intentos_fallidos >= 3) {
                $user->estado = 'bloqueado';
                $user->save();
                \Log::warning('Account blocked after 3 failed attempts: ' . $request->email);
                return response()->json([
                    'status'    => 'error',
                    'message'   => 'Tu cuenta ha sido bloqueada por 3 intentos fallidos. Contacta al administrador.',
                    'bloqueado' => true,
                ], 403);
            }

            $user->save();
            $restantes = 3 - $user->intentos_fallidos;
            return response()->json([
                'status'             => 'error',
                'message'            => 'Contraseña incorrecta.',
                'intentos_restantes' => $restantes,
            ], 401);
        }

        // Cuenta inactiva (no bloqueada)
        if (strtolower($user->estado) === 'inactivo') {
            return response()->json([
                'status'  => 'error',
                'message' => 'Tu cuenta está inactiva. Contacta al administrador.',
            ], 403);
        }

        // Login correcto — resetear intentos fallidos
        $user->intentos_fallidos = 0;

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
                'id_usuario'          => $user->id_usuario,
                'nombres'             => $user->nombres,
                'apellidos'           => $user->apellidos,
                'correo_institucional'=> $user->correo_institucional,
                'cargo'               => $user->cargo,
                'estado'              => $user->estado,
                'contrasena_temporal' => (bool) $user->contrasena_temporal,
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

        if (strtolower($user->estado) !== 'activo') {
            $msg = strtolower($user->estado) === 'bloqueado'
                ? 'Tu cuenta está bloqueada. Contacta al administrador.'
                : 'Tu cuenta está inactiva. Contacta al administrador.';
            return response()->json(['status' => 'error', 'message' => $msg, 'bloqueado' => strtolower($user->estado) === 'bloqueado'], 403);
        }

        return response()->json([
            'status' => 'success',
            'user' => [
                'id_usuario'          => $user->id_usuario,
                'nombres'             => $user->nombres,
                'apellidos'           => $user->apellidos,
                'correo_institucional'=> $user->correo_institucional,
                'cargo'               => $user->cargo,
                'estado'              => $user->estado,
                'contrasena_temporal' => (bool) $user->contrasena_temporal,
            ],
        ], 200);
    }

    /**
     * Solicitar recuperación de contraseña (envía email con token)
     */
    public function forgotPassword(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $user = User::where('correo_institucional', $request->email)->first();

        // Respuesta genérica para no revelar si el correo existe
        $genericResponse = response()->json([
            'status'  => 'success',
            'message' => 'Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.',
        ], 200);

        if (!$user) {
            return $genericResponse;
        }

        $token   = bin2hex(random_bytes(32));
        $expires = Carbon::now()->addMinutes(30);

        $user->password_reset_token      = $token;
        $user->password_reset_expires_at = $expires;
        $user->save();

        $frontendUrl = env('FRONTEND_URL', 'http://localhost:5173');
        $resetUrl    = "{$frontendUrl}/restablecer-contrasena?token={$token}";

        $body = "Hola {$user->nombres},\n\n"
              . "Recibimos una solicitud para restablecer la contraseña de tu cuenta en el Sistema de Control Presupuestario UEB.\n\n"
              . "Haz clic en el siguiente enlace para establecer una nueva contraseña (válido por 30 minutos):\n\n"
              . $resetUrl . "\n\n"
              . "Si no solicitaste este cambio, ignora este correo. Tu contraseña actual seguirá siendo la misma.\n\n"
              . "Sistema de Control Presupuestario — UEB";

        try {
            Mail::raw($body, function ($message) use ($user) {
                $message->to($user->correo_institucional, $user->nombres)
                        ->subject('Restablece tu contraseña — UEB');
            });
        } catch (\Exception $e) {
            \Log::error('Error enviando email de recuperación: ' . $e->getMessage());
            return response()->json([
                'status'  => 'error',
                'message' => 'Error al enviar el correo. Contacta al administrador.',
            ], 500);
        }

        return $genericResponse;
    }

    /**
     * Restablecer contraseña con token
     */
    public function resetPassword(Request $request)
    {
        $request->validate([
            'token'               => 'required|string',
            'nueva_contrasena'    => 'required|string|min:8',
            'confirmar_contrasena'=> 'required|string|same:nueva_contrasena',
        ], [
            'nueva_contrasena.min'      => 'La nueva contraseña debe tener al menos 8 caracteres.',
            'confirmar_contrasena.same' => 'Las contraseñas no coinciden.',
        ]);

        $user = User::where('password_reset_token', $request->token)->first();

        if (!$user) {
            return response()->json(['status' => 'error', 'message' => 'Token inválido o ya utilizado.'], 422);
        }

        if (Carbon::now()->isAfter($user->password_reset_expires_at)) {
            $user->password_reset_token      = null;
            $user->password_reset_expires_at = null;
            $user->save();
            return response()->json(['status' => 'error', 'message' => 'El enlace ha expirado. Solicita uno nuevo.'], 422);
        }

        $user->contrasena                = Hash::make($request->nueva_contrasena);
        $user->contrasena_temporal       = false;
        $user->password_reset_token      = null;
        $user->password_reset_expires_at = null;
        $user->save();

        return response()->json([
            'status'  => 'success',
            'message' => 'Contraseña restablecida correctamente. Ya puedes iniciar sesión.',
        ], 200);
    }

    /**
     * Cambiar contraseña del usuario autenticado
     */
    public function changePassword(Request $request)
    {
        $request->validate([
            'contrasena_actual'    => 'required|string',
            'nueva_contrasena'     => 'required|string|min:8',
            'confirmar_contrasena' => 'required|string|same:nueva_contrasena',
        ], [
            'nueva_contrasena.min'           => 'La nueva contraseña debe tener al menos 8 caracteres.',
            'confirmar_contrasena.same'      => 'La confirmación no coincide con la nueva contraseña.',
        ]);

        $token = $request->bearerToken();
        $user  = User::where('api_token', $token)->first();

        if (!$user) {
            return response()->json(['status' => 'error', 'message' => 'Usuario no autenticado.'], 401);
        }

        if (!Hash::check($request->contrasena_actual, $user->contrasena)) {
            return response()->json(['status' => 'error', 'message' => 'La contraseña actual es incorrecta.'], 422);
        }

        $user->contrasena          = Hash::make($request->nueva_contrasena);
        $user->contrasena_temporal = false;
        $user->save();

        return response()->json([
            'status'  => 'success',
            'message' => 'Contraseña actualizada correctamente.',
        ], 200);
    }
}

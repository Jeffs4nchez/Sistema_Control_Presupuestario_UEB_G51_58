<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class ValidateCustomToken
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Obtener el token del header Authorization
        $token = $request->bearerToken();

        \Log::debug('ValidateCustomToken middleware', [
            'token' => $token ? substr($token, 0, 10) . '...' : 'NULL',
            'token_length' => $token ? strlen($token) : 0,
        ]);

        if (!$token) {
            \Log::warning('Token not provided in Authorization header');
            return response()->json([
                'status' => 'error',
                'message' => 'Token no proporcionado en header Authorization'
            ], 401);
        }

        // Validar longitud del token (debe ser exactamente 64 caracteres hexadecimales)
        if (strlen($token) !== 64) {
            \Log::warning('Invalid token length', ['expected' => 64, 'received' => strlen($token)]);
            return response()->json([
                'status' => 'error',
                'message' => 'Token inválido (longitud: ' . strlen($token) . ', esperada: 64)'
            ], 401);
        }

        // Validar que sea hexadecimal válido
        if (!ctype_xdigit($token)) {
            \Log::warning('Token is not valid hexadecimal');
            return response()->json([
                'status' => 'error',
                'message' => 'Token debe ser hexadecimal válido'
            ], 401);
        }

        // Buscar el usuario con este token
        $user = User::where('api_token', $token)->first();

        if (!$user) {
            \Log::warning('Token not found in database');
            return response()->json([
                'status' => 'error',
                'message' => 'Token inválido o usuario no encontrado'
            ], 401);
        }

        // Verificar que el usuario esté activo
        if (strtolower($user->estado) !== 'activo') {
            $msg = strtolower($user->estado) === 'bloqueado'
                ? 'Tu cuenta está bloqueada. Contacta al administrador.'
                : 'Tu cuenta está inactiva. Contacta al administrador.';
            \Log::warning('Blocked/inactive user API request', ['id' => $user->id_usuario, 'estado' => $user->estado]);
            return response()->json(['status' => 'error', 'message' => $msg], 403);
        }

        // Autenticar al usuario
        Auth::setUser($user);

        return $next($request);
    }
}

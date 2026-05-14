<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\EstructuraPresupuestariaController;
use App\Http\Controllers\CedulaPresupuestariaController;
use App\Http\Controllers\CertificacionController;
use App\Http\Controllers\LiquidacionController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Rutas de autenticación públicas
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);

// Rutas de Estructura Presupuestaria (públicas por ahora)
Route::post('/estructura-presupuestaria/upload', [EstructuraPresupuestariaController::class, 'upload']);
Route::get('/estructura-presupuestaria/summary', [EstructuraPresupuestariaController::class, 'summary']);
Route::get('/estructura-presupuestaria/data', [EstructuraPresupuestariaController::class, 'getData']);

// Rutas de Cédula Presupuestaria (módulo separado)
Route::post('/cedula-presupuestaria/upload', [CedulaPresupuestariaController::class, 'upload']);
Route::get('/cedula-presupuestaria/summary', [CedulaPresupuestariaController::class, 'summary']);
Route::get('/cedula-presupuestaria/data', [CedulaPresupuestariaController::class, 'getData']);

// Rutas de Certificación - Datos para cascadas (públicas para el frontend)
Route::get('/certificacion/programas', [CertificacionController::class, 'getProgramas']);
Route::get('/certificacion/subprogramas/{idPrograma}', [CertificacionController::class, 'getSubprogramas']);
Route::get('/certificacion/proyectos/{idSubprograma}', [CertificacionController::class, 'getProyectos']);
Route::get('/certificacion/actividades/{idProyecto}', [CertificacionController::class, 'getActividades']);
Route::get('/certificacion/fuentes', [CertificacionController::class, 'getFuentes']);
Route::get('/certificacion/fuentes/{idActividad}', [CertificacionController::class, 'getFuentesByActividad']);
Route::get('/certificacion/ubicaciones/{idActividad}', [CertificacionController::class, 'getUbicaciones']);
Route::get('/certificacion/items/{idActividad}/{idUbicacion}', [CertificacionController::class, 'getItems']);
Route::get('/certificacion/items/{idActividad}/{idUbicacion}/{idFuente}', [CertificacionController::class, 'getItemsByFuente']);
Route::get('/certificacion/organismos', [CertificacionController::class, 'getOrganismos']);
Route::get('/certificacion/naturalezas', [CertificacionController::class, 'getNaturalezas']);
Route::get('/certificacion/entidades-requirientes', [CertificacionController::class, 'getEntidadesRequirientes']);
Route::get('/certificacion/cedulas-presupuestarias', [CertificacionController::class, 'getCedulasPresupuestarias']);
Route::get('/certificacion/cedula-actual', [CertificacionController::class, 'getCedulaActual']);
Route::get('/certificacion/verificar-monto/{idItem}/{idFuente}', [CertificacionController::class, 'verificarMontoDisponible']);

// Rutas protegidas con middleware de token personalizado
Route::middleware('validate.custom.token')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/change-password', [AuthController::class, 'changePassword']);
    Route::post('/logout', [AuthController::class, 'logout']);
    
    // Rutas CRUD de Usuarios
    Route::get('/usuarios', [UserController::class, 'index']);
    Route::post('/usuarios', [UserController::class, 'store']);
    Route::get('/usuarios/{id}', [UserController::class, 'show']);
    Route::put('/usuarios/{id}', [UserController::class, 'update']);
    Route::delete('/usuarios/{id}', [UserController::class, 'destroy']);
    
    // Rutas CRUD de Certificación
    Route::get('/certificacion', [CertificacionController::class, 'index']);
    Route::post('/certificacion', [CertificacionController::class, 'store']);
    Route::get('/certificacion/{id}', [CertificacionController::class, 'show']);
    Route::put('/certificacion/{id}', [CertificacionController::class, 'update']);
    Route::delete('/certificacion/{id}', [CertificacionController::class, 'destroy']);
    
    // Rutas para agregar/remover items
    Route::post('/certificacion/{id}/agregar-item', [CertificacionController::class, 'agregarItem']);
    Route::patch('/certificacion/{idCertificacion}/item/{idItem}', [CertificacionController::class, 'actualizarItem']);
    Route::delete('/certificacion/{idCertificacion}/item/{idItem}', [CertificacionController::class, 'removerItem']);

    // Rutas para crear entidades requirientes y cédulas
    Route::post('/certificacion/entidades-requirientes', [CertificacionController::class, 'createEntidadRequiriente']);
    Route::post('/certificacion/cedulas-presupuestarias', [CertificacionController::class, 'createCedulaPresupuestaria']);

    // Rutas de Liquidaciones
    Route::get('/liquidaciones/certificaciones',     [LiquidacionController::class, 'certificaciones']);
    Route::get('/liquidaciones/certificacion-items', [LiquidacionController::class, 'certificacionItems']);
    Route::get('/liquidaciones',                     [LiquidacionController::class, 'index']);
    Route::post('/liquidaciones',                    [LiquidacionController::class, 'store']);
    Route::delete('/liquidaciones/{id}',             [LiquidacionController::class, 'destroy']);
});

// Ruta de prueba - Hola Mundo
Route::get('/hola-mundo', function () {
    return response()->json([
        'mensaje' => '¡Hola Mundo desde Backend!',
        'status' => 'ok',
        'timestamp' => now()
    ])->header('Access-Control-Allow-Origin', '*')
      ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
      ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
});

// DEBUG: Ver usuarios
Route::get('/debug/usuarios', function () {
    $usuarios = \App\Models\User::all();
    return response()->json([
        'total' => count($usuarios),
        'usuarios' => $usuarios
    ]);
});

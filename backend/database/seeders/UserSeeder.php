<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('usuarios')->insertOrIgnore([
            'nombres' => 'Director',
            'apellidos' => 'Sistema',
            'correo_institucional' => 'director@sistema.com',
            'email_verified_at' => now(),
            'contrasena' => Hash::make('director123'),
            'api_token' => 'a'.str_repeat('0', 63), // Token válido: 64 caracteres hexadecimales
            'cargo' => 'Director Financiero',
            'estado' => 'ACTIVO',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}

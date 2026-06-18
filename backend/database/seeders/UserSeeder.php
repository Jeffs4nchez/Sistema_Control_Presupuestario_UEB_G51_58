<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $usuarios = [
            // ── Administrador del sistema ──────────────────────────────────
            [
                'nombres'              => 'Darwin',
                'apellidos'            => 'Aguilar Gavilanes',
                'correo_institucional' => 'daguilarg@unemi.edu.ec',
                'contrasena'           => Hash::make('Ueb2025*'),
                'cargo'                => 'Administrador del sistema',
                'estado'               => 'activo',
                'contrasena_temporal'  => false,
            ],

            // ── Director(a) Financiero ─────────────────────────────────────
            [
                'nombres'              => 'Jefferson',
                'apellidos'            => 'Sanchez',
                'correo_institucional' => 'jefferson.sanchez@ueb.edu.ec',
                'contrasena'           => Hash::make('Ueb2025*'),
                'cargo'                => 'Director(a) financiero',
                'estado'               => 'activo',
                'contrasena_temporal'  => false,
            ],

            // ── Analista de presupuesto 1 ─────────────────────────────────
            [
                'nombres'              => 'Daya',
                'apellidos'            => 'Aguilar',
                'correo_institucional' => 'daya2001aguilar@gmail.com',
                'contrasena'           => Hash::make('Ueb2025*'),
                'cargo'                => 'Analista de presupuesto 1',
                'estado'               => 'activo',
                'contrasena_temporal'  => false,
            ],

            // ── Analista de presupuesto 3 ─────────────────────────────────
            [
                'nombres'              => 'Jefferson',
                'apellidos'            => 'Ochoa',
                'correo_institucional' => 'jeff0967943615@gmail.com',
                'contrasena'           => Hash::make('Ueb2025*'),
                'cargo'                => 'Analista de presupuesto 3',
                'estado'               => 'activo',
                'contrasena_temporal'  => false,
            ],

            // ── Director(a) de Talento Humano ─────────────────────────────
            [
                'nombres'              => 'María',
                'apellidos'            => 'Rodríguez Peña',
                'correo_institucional' => 'mrodriguez@ueb.edu.ec',
                'contrasena'           => Hash::make('Ueb2025*'),
                'cargo'                => 'Director(a) de talento humano',
                'estado'               => 'activo',
                'contrasena_temporal'  => false,
            ],

            // ── Rector ────────────────────────────────────────────────────
            [
                'nombres'              => 'Carlos',
                'apellidos'            => 'Medina Moreira',
                'correo_institucional' => 'rector@ueb.edu.ec',
                'contrasena'           => Hash::make('Ueb2025*'),
                'cargo'                => 'Rector',
                'estado'               => 'activo',
                'contrasena_temporal'  => false,
            ],
        ];

        foreach ($usuarios as $u) {
            $correo = $u['correo_institucional'];
            unset($u['correo_institucional']);

            DB::table('usuarios')->updateOrInsert(
                ['correo_institucional' => $correo],
                array_merge($u, [
                    'correo_institucional' => $correo,
                    'intentos_fallidos'    => 0,
                    'created_at'           => now(),
                    'updated_at'           => now(),
                ])
            );
        }
    }
}

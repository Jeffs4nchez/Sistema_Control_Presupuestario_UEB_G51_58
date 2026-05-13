<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('cedula_presupuestaria', function (Blueprint $table) {
            $table->id('id_cedula_presupuestaria');
            $table->integer('anio');
            $table->timestamps();
        });

        // Insertar 4 cédulas: año actual + 3 años anteriores
        $añoActual = now()->year;
        $cedulasData = [];

        for ($i = 0; $i < 4; $i++) {
            $año = $añoActual - $i;
            $cedulasData[] = [
                'anio' => $año,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        DB::table('cedula_presupuestaria')->insert($cedulasData);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cedula_presupuestaria');
    }
};

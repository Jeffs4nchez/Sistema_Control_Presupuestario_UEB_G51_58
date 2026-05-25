<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // All fuente_items without a cedula belong to the current year (data loaded before fiscal-year system)
        $cedula = DB::table('cedula_presupuestaria')
            ->where('anio', now()->year)
            ->first();

        if ($cedula) {
            DB::table('fuente_items')
                ->whereNull('id_cedula_presupuestaria')
                ->update(['id_cedula_presupuestaria' => $cedula->id_cedula_presupuestaria]);
        }
    }

    public function down(): void
    {
        // Nothing to reverse safely
    }
};

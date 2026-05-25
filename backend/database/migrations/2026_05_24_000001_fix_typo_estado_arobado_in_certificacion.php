<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('certificacion')
            ->where('estado', 'AROBADO')
            ->update(['estado' => 'APROBADO']);
    }

    public function down(): void
    {
        DB::table('certificacion')
            ->where('estado', 'APROBADO')
            ->update(['estado' => 'AROBADO']);
    }
};

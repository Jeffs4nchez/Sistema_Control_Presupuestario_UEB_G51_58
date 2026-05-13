<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('liquidaciones', function (Blueprint $table) {
            $table->foreignId('id_fuente')
                  ->nullable()
                  ->after('id_item')
                  ->constrained('fuente_financiamiento', 'id_fuente')
                  ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::table('liquidaciones', function (Blueprint $table) {
            $table->dropForeign(['id_fuente']);
            $table->dropColumn('id_fuente');
        });
    }
};

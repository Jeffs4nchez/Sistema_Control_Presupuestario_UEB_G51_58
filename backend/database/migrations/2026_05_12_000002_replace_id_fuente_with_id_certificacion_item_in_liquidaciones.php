<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('liquidaciones', function (Blueprint $table) {
            // Eliminar el id_fuente agregado antes (era incorrecto)
            $table->dropForeign(['id_fuente']);
            $table->dropColumn('id_fuente');

            // Agregar FK al ítem específico de la certificación
            $table->foreignId('id_certificacion_item')
                  ->nullable()
                  ->after('id_item')
                  ->constrained('certificacion_items', 'id_certificacion_item')
                  ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::table('liquidaciones', function (Blueprint $table) {
            $table->dropForeign(['id_certificacion_item']);
            $table->dropColumn('id_certificacion_item');

            $table->foreignId('id_fuente')
                  ->nullable()
                  ->after('id_item')
                  ->constrained('fuente_financiamiento', 'id_fuente')
                  ->onDelete('cascade');
        });
    }
};

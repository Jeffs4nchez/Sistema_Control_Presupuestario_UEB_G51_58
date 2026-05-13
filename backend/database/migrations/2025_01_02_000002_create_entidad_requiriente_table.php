<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('entidad_requiriente', function (Blueprint $table) {
            $table->id('id_entidad_requiriente');
            $table->string('nombre_entidad', 100);
            $table->string('responsable_entidad', 100);
            $table->string('correo_institucional', 100);
            $table->string('memorando', 100);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('entidad_requiriente');
    }
};

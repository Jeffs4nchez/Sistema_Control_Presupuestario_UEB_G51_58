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
        Schema::create('liquidaciones', function (Blueprint $table) {
            $table->id('id_liquidacion');
            $table->decimal('cantidad_liquidacion', 15, 2);
            $table->date('fecha_creacion');
            $table->string('memorando', 100);
            $table->string('estado', 50);
            $table->foreignId('id_item')->constrained('items', 'id_item');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('liquidaciones');
    }
};

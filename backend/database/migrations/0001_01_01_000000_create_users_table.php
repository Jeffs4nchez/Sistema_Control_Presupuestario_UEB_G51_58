<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('usuarios', function (Blueprint $table) {
            $table->id('id_usuario');
            $table->string('nombres', 100);
            $table->string('apellidos', 100);
            $table->string('correo_institucional', 100)->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('contrasena');
            $table->string('api_token', 80)->unique()->nullable();
            $table->string('cargo', 100);
            $table->string('estado', 50);
            $table->rememberToken();
            $table->timestamps();
        });

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('id_usuario')->nullable()->constrained('usuarios', 'id_usuario')->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });

        // Insertar usuario por defecto
        DB::table('usuarios')->insert([
            'nombres' => 'Director',
            'apellidos' => 'Sistema',
            'correo_institucional' => 'director@sistema.com',
            'email_verified_at' => now(),
            'contrasena' => Hash::make('director123'),
            'api_token' => 'a'.str_repeat('0', 63),
            'cargo' => 'Director Financiero',
            'estado' => 'ACTIVO',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sessions');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('usuarios');
    }
};

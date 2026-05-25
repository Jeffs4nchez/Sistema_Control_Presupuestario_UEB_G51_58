<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EntidadRequiriente extends Model
{
    protected $table = 'entidad_requiriente';
    protected $primaryKey = 'id_entidad_requiriente';
    protected $fillable = ['nombre_entidad', 'responsable_entidad', 'correo_institucional'];
    public $timestamps = true;
}

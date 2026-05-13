<?php

namespace App\Providers;

use App\Models\CertificacionItem;
use App\Observers\CertificacionItemObserver;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Registrar observer para actualizar fuente_items cuando cambia certificacion_items
        CertificacionItem::observe(CertificacionItemObserver::class);
    }
}

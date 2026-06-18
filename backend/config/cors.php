<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines what cross-origin requests are allowed to
    | make to your API. The "allowed_methods" and "allowed_headers" may be
    | set to array('*') to allow anything.
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => ['localhost:5173', '127.0.0.1:5173', 'localhost:5174', '127.0.0.1:5174', 'localhost:3000', '127.0.0.1:3000', 'http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:5174', 'http://127.0.0.1:5174', 'http://localhost:3000', 'http://127.0.0.1:3000'],

    'allowed_origins_patterns' => ['#https://.*\.ngrok-free\.app#', '#https://.*\.ngrok\.io#', '#https://.*\.up\.railway\.app#', '#https://.*\.vercel\.app#'],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,

];

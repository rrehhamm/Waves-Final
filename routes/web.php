<?php

use App\Http\Controllers\ImageController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/uploads/{path}', [ImageController::class, 'show'])
    ->where('path', '.*')
    ->name('uploads.show');

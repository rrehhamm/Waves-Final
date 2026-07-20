<?php

use App\Http\Controllers\ImageController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// بوابة عرض الصور المرفوعة (خارج فولدر public - شوف app/Services/ImageUploadService.php)
// where('path', '.*') : بيسمح إن الـ path يحتوي / جواه (مثلاً categories/abc123.jpg)
Route::get('/uploads/{path}', [ImageController::class, 'show'])
    ->where('path', '.*')
    ->name('uploads.show');

<?php

namespace Database\Seeders;

use App\Models\Admin;
use Illuminate\Database\Seeder;

// Seeder = ملف بيعبي الداتابيز ببيانات جاهزة (بدل ما تضيفها يدوي من phpMyAdmin)
class AdminSeeder extends Seeder
{
    /**
     * بينفّذ لما نعمل: php artisan db:seed --class=AdminSeeder
     */
    public function run(): void
    {
        // updateOrCreate: إذا كان في أدمن بنفس الإيميل بيحدّثه، إذا مش موجود بيعمل واحد جديد
        // (هيك ما بتتكرر النسخ لو شغلنا الأمر أكتر من مرة)
        Admin::updateOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Super Admin',
                'password' => 'Admin@12345', // بينحفظ مشفّر تلقائياً (بسبب casts => 'hashed' بالموديل)
            ]
        );
    }
}

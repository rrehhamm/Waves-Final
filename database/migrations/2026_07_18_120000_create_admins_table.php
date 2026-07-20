<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// هاد الـ migration بيعمل جدول "admins" منفصل عن جدول "users"
// السبب: بالمشروع، الأدمن هو الوحيد اللي بيسجل دخول عالـ Dashboard
// (لو صار في يوماً عملاء بيسجلوا دخول، بيستخدموا جدول users المنفصل)
return new class extends Migration
{
    /**
     * تشغيل الـ migration (بينفّذ لما نعمل: php artisan migrate)
     */
    public function up(): void
    {
        Schema::create('admins', function (Blueprint $table) {
            $table->id();                          // عمود id: primary key + auto increment
            $table->string('name');                 // اسم الأدمن
            $table->string('email')->unique();       // الإيميل - unique عشان ما يتكررش
            $table->string('password');              // بيتخزن مشفّر (hashed) مش نص عادي
            $table->rememberToken();                 // عمود remember_token (خاص بـ Laravel auth)
            $table->timestamps();                    // بيضيف عمودين: created_at و updated_at تلقائياً
        });
    }

    /**
     * التراجع عن الـ migration (بينفّذ لما نعمل: php artisan migrate:rollback)
     */
    public function down(): void
    {
        Schema::dropIfExists('admins');
    }
};

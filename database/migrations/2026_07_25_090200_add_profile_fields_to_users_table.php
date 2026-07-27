<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// حقول إضافية للعميل: صورة شخصية + عنوان محفوظ (عشان ما يعيد تعبئته بكل Checkout)
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('profile_picture')->nullable()->after('password');
            $table->string('phone')->nullable()->after('profile_picture');

            // عنوان محفوظ - بيتعبى تلقائياً بصفحة Checkout لو موجود
            $table->string('address_line')->nullable()->after('phone');
            $table->string('city')->nullable()->after('address_line');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['profile_picture', 'phone', 'address_line', 'city']);
        });
    }
};

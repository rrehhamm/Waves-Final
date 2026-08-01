<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('profile_picture')->nullable()->after('password');
            $table->string('phone')->nullable()->after('profile_picture');

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

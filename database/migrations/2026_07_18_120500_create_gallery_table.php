<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('gallery', function (Blueprint $table) {
            $table->id();
            $table->string('title')->nullable();
            $table->string('image');
            $table->text('description')->nullable();

            // sort_order: رقم بيحدد ترتيب ظهور الصورة (0 = الأول، 1 = اللي بعده...)
            // الأدمن بيقدر يغيّره من الداشبورد عشان يرتب الصور "Sort Images"
            $table->unsignedInteger('sort_order')->default(0);

            $table->boolean('status')->default(true); // show / hide
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('gallery');
    }
};

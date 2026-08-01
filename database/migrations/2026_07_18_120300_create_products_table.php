<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();

            $table->string('name_ar');
            $table->string('name_en');
            $table->text('description_ar')->nullable();
            $table->text('description_en')->nullable();

            $table->decimal('price', 10, 2);
            $table->unsignedInteger('quantity')->default(0);

            $table->string('main_image')->nullable();
            $table->json('additional_images')->nullable();

            $table->foreignId('category_id')->constrained('categories')->restrictOnDelete();
            $table->foreignId('brand_id')->constrained('brands')->restrictOnDelete();

            $table->boolean('status')->default(true);
            $table->boolean('featured')->default(false);

            $table->timestamps();

            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};

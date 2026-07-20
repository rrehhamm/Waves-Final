<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // order_items: جدول وسيط بيخزن "أي منتجات كانت بأي طلب وبأي كمية وسعر"
        // (طلب واحد ممكن يحتوي أكتر من منتج - علاقة Many-to-Many لكن بمعلومات إضافية زي الكمية والسعر)
        Schema::create('order_items', function (Blueprint $table) {
            $table->id();

            // cascadeOnDelete(): لو انحذف الطلب، تنحذف كل عناصره تلقائياً معه
            $table->foreignId('order_id')->constrained('orders')->cascadeOnDelete();

            // nullOnDelete(): لو انحذف المنتج من النظام، ما بنفقد سجل الطلب القديم -
            // بس بيصير product_id فاضي (null)، وبنعتمد على product_name/price المخزنين تحت كـ "نسخة" وقت الطلب
            $table->foreignId('product_id')->nullable()->constrained('products')->nullOnDelete();

            // بنخزن نسخة (snapshot) من اسم وسعر المنتج وقت الطلب،
            // عشان لو تغيّر سعر المنتج بعدين، الطلبات القديمة تضل عارضة السعر الصح وقتها
            $table->string('product_name');
            $table->decimal('price', 10, 2);       // سعر الوحدة وقت الطلب
            $table->unsignedInteger('quantity');
            $table->decimal('subtotal', 10, 2);    // price * quantity

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_items');
    }
};

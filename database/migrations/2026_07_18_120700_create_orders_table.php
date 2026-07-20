<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();

            // order_number: رقم فريد للطلب (مثلاً ORD-20260718-0001) نولّده إحنا بالكود
            // مش نفس id، لأنه id بيبين للأدمن الرقم الحقيقي بالداتابيز، وعادة ما منحب نعرضه للعميل
            $table->string('order_number')->unique();

            // بيانات العميل (بدون ما يحتاج يعمل حساب/تسجيل دخول - "Guest Checkout")
            $table->string('customer_name');
            $table->string('customer_phone');
            $table->string('customer_email')->nullable();
            $table->text('customer_address')->nullable();

            $table->decimal('total_price', 10, 2); // مجموع سعر كل المنتجات بالطلب

            // enum: عمود بقيم محددة بس (مش أي نص). لو حاولنا نحط قيمة مش من اللستة، بيرفضها MySQL
            $table->enum('status', [
                'pending',    // قيد الانتظار (الحالة الافتراضية لأي طلب جديد)
                'confirmed',  // تم التأكيد
                'processing', // قيد التجهيز
                'completed',  // مكتمل
                'cancelled',  // ملغي
            ])->default('pending');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};

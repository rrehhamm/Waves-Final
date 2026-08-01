<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->decimal('subtotal_price', 10, 2)->default(0)->after('total_price');
            $table->decimal('discount_amount', 10, 2)->default(0)->after('subtotal_price');
            $table->boolean('first_order_discount_applied')->default(false)->after('discount_amount');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['subtotal_price', 'discount_amount', 'first_order_discount_applied']);
        });
    }
};

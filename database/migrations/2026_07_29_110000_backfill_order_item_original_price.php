<?php

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    private const FIRST_ORDER_DISCOUNT_PERCENT = 20;

    public function up(): void
    {
        OrderItem::whereNull('original_price')->orderBy('order_id')->chunk(200, function ($items) {
            foreach ($items as $item) {
                $originalPrice = (float) $item->price;

                $product = Product::withTrashed()->find($item->product_id);

                if ($product && $product->discount_percent) {
                    $currentFinalPrice = $product->final_price;

                    if (abs($currentFinalPrice - (float) $item->price) < 0.01) {
                        $originalPrice = (float) $product->price;
                    }
                }

                $item->original_price = $originalPrice;
                $item->save();
            }
        });

        Order::with('items')->chunkById(200, function ($orders) {
            foreach ($orders as $order) {
                $subtotalPrice = 0;
                $productDiscountAmount = 0;

                foreach ($order->items as $item) {
                    $originalPrice = (float) ($item->original_price ?? $item->price);
                    $price = (float) $item->price;

                    $subtotalPrice += $originalPrice * $item->quantity;
                    $productDiscountAmount += ($originalPrice - $price) * $item->quantity;
                }

                $subtotalPrice = round($subtotalPrice, 2);
                $productDiscountAmount = round($productDiscountAmount, 2);

                $firstOrderDiscountAmount = $order->first_order_discount_applied
                    ? round(($subtotalPrice - $productDiscountAmount) * (self::FIRST_ORDER_DISCOUNT_PERCENT / 100), 2)
                    : 0;

                $discountAmount = round($productDiscountAmount + $firstOrderDiscountAmount, 2);
                $deliveryFee = (float) ($order->delivery_fee ?? 0);
                $totalPrice = $subtotalPrice - $discountAmount + $deliveryFee;

                $order->subtotal_price = $subtotalPrice;
                $order->discount_amount = $discountAmount;
                $order->total_price = $totalPrice;
                $order->save();
            }
        });
    }

    public function down(): void
    {
    }
};

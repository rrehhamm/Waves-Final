<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Http\Requests\Public\StoreOrderRequest;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Models\Product;
use App\Models\SiteSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OrderController extends Controller
{
    public function myOrders(Request $request)
    {
        $orders = $request->user()
            ->orders()
            ->with('items.product')
            ->latest()
            ->paginate(15);

        return OrderResource::collection($orders);
    }

    private const FIRST_ORDER_DISCOUNT_PERCENT = 20;

    public function store(StoreOrderRequest $request)
    {
        $validated = $request->validated();

        $user = $request->user();

        $isFirstOrder = $user->isEligibleForFirstOrderDiscount();

        $order = DB::transaction(function () use ($validated, $user, $isFirstOrder) {
            $subtotalPrice = 0;
            $productDiscountAmount = 0;
            $itemsData = [];

            foreach ($validated['products'] as $item) {
                $product = Product::findOrFail($item['product_id']);

                $originalUnitPrice = (float) $product->price;
                $unitPrice = $product->final_price;
                $lineSubtotal = $unitPrice * $item['quantity'];

                $subtotalPrice += $originalUnitPrice * $item['quantity'];
                $productDiscountAmount += ($originalUnitPrice - $unitPrice) * $item['quantity'];

                $itemsData[] = [
                    'product_id' => $product->id,
                    'product_name' => trans_field($product, 'name'),
                    'color' => $item['color'] ?? null,
                    'original_price' => $originalUnitPrice,
                    'price' => $unitPrice,
                    'quantity' => $item['quantity'],
                    'subtotal' => $lineSubtotal,
                ];
            }

            $subtotalPrice = round($subtotalPrice, 2);
            $productDiscountAmount = round($productDiscountAmount, 2);

            $firstOrderDiscountAmount = $isFirstOrder
                ? round(($subtotalPrice - $productDiscountAmount) * (self::FIRST_ORDER_DISCOUNT_PERCENT / 100), 2)
                : 0;

            $discountAmount = round($productDiscountAmount + $firstOrderDiscountAmount, 2);
            $deliveryFee = (float) (SiteSetting::first()?->delivery_fee ?? 15.00);
            $totalPrice = $subtotalPrice - $discountAmount + $deliveryFee;

            $orderNumber = 'ORD-'.now()->format('Ymd').'-'.Str::upper(Str::random(6));

            $order = Order::create([
                'user_id' => $user->id,
                'order_number' => $orderNumber,
                'customer_name' => $validated['customer_name'],
                'customer_phone' => $validated['customer_phone'],
                'customer_email' => $validated['customer_email'] ?? null,
                'customer_address' => $validated['customer_address'] ?? null,
                'subtotal_price' => $subtotalPrice,
                'discount_amount' => $discountAmount,
                'delivery_fee' => $deliveryFee,
                'first_order_discount_applied' => $isFirstOrder,
                'total_price' => $totalPrice,
                'status' => 'pending',
            ]);

            $order->items()->createMany($itemsData);

            return $order;
        });

        return response()->json([
            'success' => true,
            'message' => __('messages.order_created', ['number' => $order->order_number]),
            'data' => new OrderResource($order->load('items.product')),
        ], 201);
    }
}

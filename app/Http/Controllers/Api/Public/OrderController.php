<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Http\Requests\Public\StoreOrderRequest;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * @group Customer - Orders
 *
 * Place and view orders. Requires a Customer Bearer token — guests cannot order.
 * @authenticated
 */
class OrderController extends Controller
{
    /**
     * List my orders
     *
     * GET /api/my-orders
     * محمي بـ auth:user - العميل بيشوف طلباته هو بس (مش طلبات عملاء تانيين)
     */
    public function myOrders(Request $request)
    {
        $orders = $request->user()
            ->orders()
            ->with('items')
            ->latest()
            ->paginate(15);

        return OrderResource::collection($orders);
    }

    /**
     * Create an order
     *
     * POST /api/orders
     * محمي بـ auth:user (شوف routes/api.php) - لازم تسجيل دخول عشان تعمل طلب.
     * الزائر (Guest) يقدر يتصفح المنتجات (GET endpoints) بس مش يعمل Order.
     * Body: {
     *   "customer_name": "...", "customer_phone": "...", "customer_email": "...", "customer_address": "...",
     *   "products": [ {"product_id": 1, "quantity": 2}, {"product_id": 5, "quantity": 1} ]
     * }
     *
     * @response 201 {
     *   "success": true,
     *   "message": "Your order has been created successfully, order number: ORD-20260720-9K3XQ2",
     *   "data": {
     *     "id": 1, "user_id": 3, "order_number": "ORD-20260720-9K3XQ2",
     *     "customer_name": "Mohammad", "customer_phone": "0791234567", "customer_email": "mohammad@test.com", "customer_address": "Amman, Jordan",
     *     "total_price": 149.97, "status": "pending",
     *     "items": [
     *       { "id": 1, "product_id": 3, "product_name": "Running Shoes", "price": 49.99, "quantity": 2, "subtotal": 99.98 },
     *       { "id": 2, "product_id": 7, "product_name": "Sport Jacket", "price": 49.99, "quantity": 1, "subtotal": 49.99 }
     *     ],
     *     "created_at": "2026-07-20T10:00:00.000000Z"
     *   }
     * }
     * @response 401 scenario="Guest (no token)" {
     *   "message": "Unauthenticated."
     * }
     * @response 422 scenario="Invalid/inactive product" {
     *   "message": "One of the selected products was not found.",
     *   "errors": { "products.0.product_id": ["One of the selected products was not found."] }
     * }
     */
    public function store(StoreOrderRequest $request)
    {
        $validated = $request->validated();

        // بما إن المسار محمي بـ auth:user، $request->user() مضمون إنه موجود (مش null)
        $userId = $request->user()->id;

        // DB::transaction: بيشغّل كل الاستعلامات جوا { } كوحدة واحدة (Atomic)
        // لو صار أي خطأ بالنص (مثلاً منتج مش موجود)، كل التغييرات بترجع لورا تلقائياً (rollback)
        // وما بيتسجل طلب ناقص أو خاطئ بالداتابيز
        $order = DB::transaction(function () use ($validated, $userId) {
            $totalPrice = 0;
            $itemsData = [];

            // 1) نمر على كل منتج بالسلة، نحسب سعره، ونجهز بيانات order_items
            foreach ($validated['products'] as $item) {
                $product = Product::findOrFail($item['product_id']);

                $subtotal = $product->price * $item['quantity'];
                $totalPrice += $subtotal;

                $itemsData[] = [
                    'product_id' => $product->id,
                    // بنخزن نسخة من الاسم والسعر وقت الطلب (شرحنا السبب بـ migration order_items)
                    'product_name' => trans_field($product, 'name'),
                    'price' => $product->price,
                    'quantity' => $item['quantity'],
                    'subtotal' => $subtotal,
                ];
            }

            // 2) نولّد رقم طلب فريد، مثلاً: ORD-20260718-9K3XQ2
            $orderNumber = 'ORD-'.now()->format('Ymd').'-'.Str::upper(Str::random(6));

            // 3) ننشئ الطلب نفسه
            $order = Order::create([
                'user_id' => $userId, // null لو Guest، أو id العميل لو مسجل دخول
                'order_number' => $orderNumber,
                'customer_name' => $validated['customer_name'],
                'customer_phone' => $validated['customer_phone'],
                'customer_email' => $validated['customer_email'] ?? null,
                'customer_address' => $validated['customer_address'] ?? null,
                'total_price' => $totalPrice,
                'status' => 'pending', // كل طلب جديد بيبدأ "قيد الانتظار"
            ]);

            // 4) ننشئ كل عناصر الطلب مرة وحدة (createMany أسرع من create() بلوب)
            $order->items()->createMany($itemsData);

            return $order;
        });

        return response()->json([
            'success' => true,
            // __() مع مصفوفة استبدال: بتحل محل ":number" بالقيمة الفعلية داخل نص الترجمة
            'message' => __('messages.order_created', ['number' => $order->order_number]),
            'data' => new OrderResource($order->load('items')),
        ], 201);
    }
}

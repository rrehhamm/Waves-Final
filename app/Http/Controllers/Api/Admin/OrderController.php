<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/**
 * @group Admin - Orders
 *
 * View all customer orders and update their status.
 * @authenticated
 */
class OrderController extends Controller
{
    /**
     * List all orders
     */
    public function index()
    {
        // with('items'): نجيب عناصر كل طلب بنفس الاستعلام (بدل ما نستدعيها لكل طلب لحاله)
        return OrderResource::collection(Order::with('items')->latest()->paginate(15));
    }

    /**
     * Get an order
     */
    public function show(Order $order)
    {
        return new OrderResource($order->load('items'));
    }

    /**
     * Update order status
     *
     * PATCH /api/admin/orders/{order}/status
     * Body: { "status": "confirmed" }
     *
     * @response 200 {
     *   "success": true,
     *   "message": "Order status updated successfully",
     *   "data": {
     *     "id": 1, "user_id": 3, "order_number": "ORD-20260720-9K3XQ2",
     *     "customer_name": "Mohammad", "customer_phone": "0791234567", "customer_email": "mohammad@test.com", "customer_address": "Amman, Jordan",
     *     "total_price": 149.97, "status": "confirmed",
     *     "items": [
     *       { "id": 1, "product_id": 3, "product_name": "Running Shoes", "price": 49.99, "quantity": 2, "subtotal": 99.98 },
     *       { "id": 2, "product_id": 7, "product_name": "Sport Jacket", "price": 49.99, "quantity": 1, "subtotal": 49.99 }
     *     ],
     *     "created_at": "2026-07-20T10:00:00.000000Z"
     *   }
     * }
     * @response 422 scenario="Invalid status value" {
     *   "message": "The selected status is invalid.",
     *   "errors": { "status": ["The selected status is invalid."] }
     * }
     */
    public function updateStatus(Request $request, Order $order)
    {
        $request->validate([
            // Rule::in(): القيمة لازم تكون وحدة من هاد الخمسة بالظبط، وإلا بيرفضها الفحص
            'status' => ['required', Rule::in(['pending', 'confirmed', 'processing', 'completed', 'cancelled'])],
        ]);

        $order->update(['status' => $request->input('status')]);

        return response()->json([
            'success' => true,
            'message' => __('messages.order_status_updated'),
            'data' => new OrderResource($order->load('items')),
        ]);
    }
}

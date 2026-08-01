<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class OrderController extends Controller
{
    public function index()
    {
        return OrderResource::collection(Order::with('items.product')->latest()->paginate(15));
    }

    public function show(Order $order)
    {
        return new OrderResource($order->load('items.product'));
    }

    public function updateStatus(Request $request, Order $order)
    {
        $request->validate([
            'status' => ['required', Rule::in(['pending', 'confirmed', 'processing', 'completed', 'cancelled'])],
        ]);

        $order->update(['status' => $request->input('status')]);

        return response()->json([
            'success' => true,
            'message' => __('messages.order_status_updated'),
            'data' => new OrderResource($order->load('items.product')),
        ]);
    }

    public function trashed()
    {
        $orders = Order::onlyTrashed()->with('items.product')->latest('deleted_at')->paginate(15);

        return OrderResource::collection($orders);
    }

    public function destroy(Order $order)
    {
        $order->delete();

        return response()->json([
            'success' => true,
            'message' => __('messages.order_deleted'),
        ]);
    }

    public function restore(int $id)
    {
        $order = Order::onlyTrashed()->findOrFail($id);
        $order->restore();

        return response()->json([
            'success' => true,
            'message' => __('messages.order_restored'),
            'data' => new OrderResource($order->load('items.product')),
        ]);
    }

    public function forceDelete(int $id)
    {
        $order = Order::onlyTrashed()->findOrFail($id);
        $order->forceDelete();

        return response()->json([
            'success' => true,
            'message' => __('messages.order_force_deleted'),
        ]);
    }
}

<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Models\Category;
use App\Models\ContactMessage;
use App\Models\GalleryImage;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        return response()->json([
            'success' => true,
            'data' => [
                'products_count' => Product::count(),
                'categories_count' => Category::count(),
                'brands_count' => Brand::count(),
                'gallery_count' => GalleryImage::count(),
                'contact_messages_count' => ContactMessage::count(),
                'unread_messages_count' => ContactMessage::where('is_read', false)->count(),
                'customers_count' => User::count(),
                'orders_count' => Order::count(),
                'revenue' => (float) Order::sum('total_price'),
                'pending_orders_count' => Order::where('status', 'pending')->count(),
                'delivered_orders_count' => Order::where('status', 'completed')->count(),
                'cancelled_orders_count' => Order::where('status', 'cancelled')->count(),
                'recent_orders' => Order::latest()
                    ->take(5)
                    ->get(['id', 'order_number', 'customer_name', 'total_price', 'status', 'created_at'])
                    ->map(fn ($order) => [
                        'id' => $order->id,
                        'order_number' => $order->order_number,
                        'customer_name' => $order->customer_name,
                        'total_price' => (float) $order->total_price,
                        'status' => $order->status,
                        'created_at' => $order->created_at,
                    ]),
                'best_selling_products' => $this->bestSellingProducts(),
                'weekly_activity' => $this->weeklyActivity(),
            ],
        ]);
    }

    private function bestSellingProducts()
    {
        return OrderItem::select('product_id', 'product_name')
            ->selectRaw('SUM(quantity) as total_quantity')
            ->selectRaw('SUM(subtotal) as total_revenue')
            ->whereNotNull('product_id')
            ->groupBy('product_id', 'product_name')
            ->orderByDesc('total_quantity')
            ->take(5)
            ->get()
            ->map(function ($row) {
                $product = Product::withTrashed()->find($row->product_id);

                return [
                    'product_id' => $row->product_id,
                    'name' => $row->product_name,
                    'main_image' => $product ? image_url($product->main_image) : null,
                    'total_quantity' => (int) $row->total_quantity,
                    'total_revenue' => (float) $row->total_revenue,
                ];
            })
            ->values();
    }

    private function weeklyActivity()
    {
        $start = now()->subDays(6)->startOfDay();

        $rows = Order::where('created_at', '>=', $start)
            ->selectRaw('DATE(created_at) as day')
            ->selectRaw('COUNT(*) as orders_count')
            ->selectRaw('SUM(total_price) as revenue')
            ->groupBy('day')
            ->get()
            ->keyBy('day');

        $days = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = now()->subDays($i)->format('Y-m-d');
            $row = $rows->get($date);

            $days[] = [
                'date' => $date,
                'label' => now()->subDays($i)->format('D'),
                'orders_count' => $row ? (int) $row->orders_count : 0,
                'revenue' => $row ? (float) $row->revenue : 0,
            ];
        }

        return $days;
    }
}

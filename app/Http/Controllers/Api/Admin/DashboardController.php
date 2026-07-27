<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Models\Category;
use App\Models\ContactMessage;
use App\Models\GalleryImage;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;

/**
 * @group Admin - Dashboard
 * @authenticated
 */
class DashboardController extends Controller
{
    /**
     * Dashboard statistics
     *
     * GET /api/admin/dashboard
     * إحصائيات عامة تظهر بأول صفحة بالداشبورد
     */
    public function index()
    {
        return response()->json([
            'success' => true,
            'data' => [
                'products_count' => Product::count(),      // count() بيعمل SELECT COUNT(*) مباشرة (مش بيجيب كل الصفوف)
                'categories_count' => Category::count(),
                'brands_count' => Brand::count(),
                'gallery_count' => GalleryImage::count(),
                'contact_messages_count' => ContactMessage::count(),
                'unread_messages_count' => ContactMessage::where('is_read', false)->count(),
                // customers_count: عدد الزبائن المسجلين فعلياً (مش رقم ثابت) - متطلب "Customer Count Logic"
                'customers_count' => User::count(),
                'orders_count' => Order::count(),
            ],
        ]);
    }
}

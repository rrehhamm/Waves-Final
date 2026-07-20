<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Admin;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

// كل الـ controllers الخاصة بالأدمن حطيناها بفولدر App\Http\Controllers\Api\Admin
// عشان نفصلها بوضوح عن الـ controllers العامة (Public API) اللي بتشوفها كل الزوار
//
// @group Admin - Authentication
//
// Admin login/logout and the currently-authenticated admin's info.
class AuthController extends Controller
{
    /**
     * Admin login
     *
     * تسجيل دخول الأدمن. Returns a Bearer token to use on all `/admin/*` protected routes.
     * POST /api/admin/login
     * Body (JSON): { "email": "...", "password": "..." }
     *
     * @response 200 {
     *   "success": true,
     *   "message": "Logged in successfully",
     *   "data": {
     *     "admin": { "id": 1, "name": "Admin", "email": "admin@example.com", "created_at": "2026-07-20T10:00:00.000000Z", "updated_at": "2026-07-20T10:00:00.000000Z" },
     *     "token": "1|kfo1aLRhP4uFG48Hm8PZvA8zmQUegJz4bLVN8sqQ"
     *   }
     * }
     * @response 422 scenario="Invalid credentials" {
     *   "message": "Invalid login credentials.",
     *   "errors": { "email": ["Invalid login credentials."] }
     * }
     */
    public function login(Request $request)
    {
        // 1) نتحقق من صحة البيانات المُرسلة (validation بسيط هون،
        //    بفيز لاحقة رح نستخدم Form Request classes منفصلة)
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        // 2) نجيب الأدمن من الداتابيز بالإيميل
        $admin = Admin::where('email', $credentials['email'])->first();

        // 3) نتأكد إنه موجود، وإن كلمة السر صح
        //    Hash::check() بيقارن النص العادي مع النسخة المشفرة بدون فك التشفير
        if (! $admin || ! Hash::check($credentials['password'], $admin->password)) {
            // ValidationException بترجع response بصيغة أخطاء validation موحدة (422)
            throw ValidationException::withMessages([
                // __('messages.invalid_credentials'): بيرجع الرسالة من lang/ar/messages.php أو lang/en/messages.php
                // حسب اللغة اللي حددها SetLocale middleware لهاد الطلب
                'email' => [__('messages.invalid_credentials')],
            ]);
        }

        // 4) نولّد Sanctum access token جديد لهاد الأدمن
        //    'admin-token' هوي بس اسم/تسمية للتوكن (ممكن تحط اسم الجهاز مثلاً)
        $token = $admin->createToken('admin-token')->plainTextToken;

        // 5) نرجع رد JSON موحّد فيه بيانات الأدمن + التوكن
        return response()->json([
            'success' => true,
            'message' => __('messages.login_success'),
            'data' => [
                'admin' => $admin,
                'token' => $token, // لازم ينحط بكل طلب جاي بـ Header: Authorization: Bearer {token}
            ],
        ]);
    }

    /**
     * Admin logout
     *
     * تسجيل خروج الأدمن (بيلغي التوكن الحالي بس)
     * POST /api/admin/logout
     * لازم Header: Authorization: Bearer {token}
     *
     * @authenticated
     * @response 200 {
     *   "success": true,
     *   "message": "Logged out successfully"
     * }
     */
    public function logout(Request $request)
    {
        // currentAccessToken() بيرجع التوكن اللي استُخدم بهاد الطلب بالذات
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => __('messages.logout_success'),
        ]);
    }

    /**
     * Current admin info
     *
     * بيانات الأدمن المسجّل دخوله حالياً (مفيد عشان الـ front-end يتحقق من التوكن)
     * GET /api/admin/me
     *
     * @authenticated
     */
    public function me(Request $request)
    {
        return response()->json([
            'success' => true,
            'data' => $request->user(),
        ]);
    }
}

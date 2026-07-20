<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Http\Requests\Public\LoginUserRequest;
use App\Http\Requests\Public\RegisterUserRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

// Auth الخاص بالعميل (Customer) - منفصل تماماً عن Auth\Admin\AuthController
// صلاحيات العميل هون محدودة: تسجيل، دخول، خروج، وعمل/رؤية طلباته بس (شوف OrderController)
/**
 * @group Customer - Authentication
 *
 * Register/login for storefront customers. A customer token is separate from an
 * admin token and only grants access to the customer's own orders.
 */
class AuthController extends Controller
{
    /**
     * Register
     *
     * POST /api/register
     *
     * @response 201 {
     *   "success": true,
     *   "message": "Account created successfully",
     *   "data": {
     *     "user": { "id": 1, "name": "Sara", "email": "sara@test.com", "email_verified_at": null, "created_at": "2026-07-20T10:00:00.000000Z", "updated_at": "2026-07-20T10:00:00.000000Z" },
     *     "token": "2|kfo1aLRhP4uFG48Hm8PZvA8zmQUegJz4bLVN8sqQ"
     *   }
     * }
     * @response 422 scenario="Validation error" {
     *   "message": "The email has already been taken.",
     *   "errors": { "email": ["The email has already been taken."] }
     * }
     */
    public function register(RegisterUserRequest $request)
    {
        $data = $request->validated();

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => $data['password'], // بينحفظ مشفّر تلقائياً (casts => 'hashed' بالموديل)
        ]);

        $token = $user->createToken('user-token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => __('messages.register_success'),
            'data' => [
                'user' => $user,
                'token' => $token,
            ],
        ], 201);
    }

    /**
     * Login
     *
     * POST /api/login
     *
     * @response 200 {
     *   "success": true,
     *   "message": "Logged in successfully",
     *   "data": {
     *     "user": { "id": 1, "name": "Sara", "email": "sara@test.com", "email_verified_at": null, "created_at": "2026-07-20T10:00:00.000000Z", "updated_at": "2026-07-20T10:00:00.000000Z" },
     *     "token": "2|kfo1aLRhP4uFG48Hm8PZvA8zmQUegJz4bLVN8sqQ"
     *   }
     * }
     * @response 422 scenario="Invalid credentials" {
     *   "message": "Invalid login credentials.",
     *   "errors": { "email": ["Invalid login credentials."] }
     * }
     */
    public function login(LoginUserRequest $request)
    {
        $credentials = $request->validated();

        $user = User::where('email', $credentials['email'])->first();

        if (! $user || ! Hash::check($credentials['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => [__('messages.invalid_credentials')],
            ]);
        }

        $token = $user->createToken('user-token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => __('messages.login_success'),
            'data' => [
                'user' => $user,
                'token' => $token,
            ],
        ]);
    }

    /**
     * Logout
     *
     * POST /api/logout
     * لازم Header: Authorization: Bearer {token} (توكن عميل، مش توكن أدمن)
     *
     * @authenticated
     * @response 200 {
     *   "success": true,
     *   "message": "Logged out successfully"
     * }
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => __('messages.logout_success'),
        ]);
    }

    /**
     * Current customer info
     *
     * GET /api/me
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

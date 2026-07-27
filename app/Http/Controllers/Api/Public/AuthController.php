<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Http\Requests\Public\LoginUserRequest;
use App\Http\Requests\Public\RegisterUserRequest;
use App\Http\Requests\Public\UpdateProfileRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\ImageUploadService;
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
    public function __construct(protected ImageUploadService $imageService) {}

    /**
     * Register
     *
     * POST /api/register
     *
     * @response 201 {
     *   "success": true,
     *   "message": "Account created successfully",
     *   "data": {
     *     "user": { "id": 1, "name": "Sara", "email": "sara@test.com", "phone": null, "profile_picture": null, "address_line": null, "city": null, "created_at": "2026-07-20T10:00:00.000000Z" },
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
                'user' => new UserResource($user),
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
     *     "user": { "id": 1, "name": "Sara", "email": "sara@test.com", "phone": null, "profile_picture": null, "address_line": null, "city": null, "created_at": "2026-07-20T10:00:00.000000Z" },
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
                'user' => new UserResource($user),
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
     * @response 200 {
     *   "success": true,
     *   "data": {
     *     "id": 1, "name": "Sara", "email": "sara@test.com", "phone": null,
     *     "profile_picture": null, "address_line": null, "city": null,
     *     "created_at": "2026-07-20T10:00:00.000000Z"
     *   },
     *   "first_order_discount_eligible": true
     * }
     */
    public function me(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'success' => true,
            'data' => new UserResource($user),
            // بيخلي الفرونت يعرف إذا لسا بده يعرض بانر "خصم أول طلب 20%" أو لأ (بدون ما يخمن بنفسه)
            'first_order_discount_eligible' => $user->isEligibleForFirstOrderDiscount(),
        ]);
    }

    /**
     * Update my profile
     *
     * POST /api/profile (with `_method=PUT` for multipart/form-data, same pattern as other image uploads)
     * لازم Header: Authorization: Bearer {customer_token}
     * Body (multipart/form-data): name?, email?, phone?, address_line?, city?, profile_picture? (file)
     *
     * @authenticated
     * @response 200 {
     *   "success": true,
     *   "message": "Profile updated successfully",
     *   "data": {
     *     "id": 1, "name": "Sara", "email": "sara@test.com", "phone": "0791234567",
     *     "profile_picture": "http://127.0.0.1:8000/uploads/users/abc123.jpg",
     *     "address_line": "123 Rainbow St", "city": "Amman",
     *     "created_at": "2026-07-20T10:00:00.000000Z"
     *   }
     * }
     */
    public function updateProfile(UpdateProfileRequest $request)
    {
        $user = $request->user();
        $data = $request->validated();

        if ($request->hasFile('profile_picture')) {
            $data['profile_picture'] = $this->imageService->replace(
                $request->file('profile_picture'),
                $user->profile_picture,
                'users'
            );
        }

        $user->update($data);

        return response()->json([
            'success' => true,
            'message' => __('messages.profile_updated'),
            'data' => new UserResource($user),
        ]);
    }
}

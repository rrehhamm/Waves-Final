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

class AuthController extends Controller
{
    public function __construct(protected ImageUploadService $imageService) {}

    public function register(RegisterUserRequest $request)
    {
        $data = $request->validated();

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => $data['password'],
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

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => __('messages.logout_success'),
        ]);
    }

    public function me(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'success' => true,
            'data' => new UserResource($user),
            'first_order_discount_eligible' => $user->isEligibleForFirstOrderDiscount(),
        ]);
    }

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

<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Banner\StoreBannerRequest;
use App\Http\Requests\Admin\Banner\UpdateBannerRequest;
use App\Http\Resources\BannerResource;
use App\Models\Banner;
use App\Services\ImageUploadService;

/**
 * @group Admin - Banners
 *
 * Full CRUD for homepage banners, plus activate/deactivate.
 * @authenticated
 */
class BannerController extends Controller
{
    public function __construct(protected ImageUploadService $imageService) {}

    /**
     * List banners
     */
    public function index()
    {
        return BannerResource::collection(Banner::latest()->paginate(15));
    }

    /**
     * Create a banner
     *
     * @response 201 {
     *   "success": true,
     *   "message": "Banner created successfully",
     *   "data": {
     *     "id": 1, "title": "Summer Sale", "description": "Up to 50% off", "image": "http://127.0.0.1:8000/uploads/banners/abc123.jpg",
     *     "link": "https://example.com/sale", "status": true, "created_at": "2026-07-20T10:00:00.000000Z", "updated_at": "2026-07-20T10:00:00.000000Z"
     *   }
     * }
     */
    public function store(StoreBannerRequest $request)
    {
        $data = $request->validated();
        $data['status'] = $request->boolean('status', true);
        $data['image'] = $this->imageService->store($request->file('image'), 'banners');

        $banner = Banner::create($data);

        return response()->json([
            'success' => true,
            'message' => __('messages.banner_created'),
            'data' => new BannerResource($banner),
        ], 201);
    }

    /**
     * Get a banner
     */
    public function show(Banner $banner)
    {
        return new BannerResource($banner);
    }

    /**
     * Update a banner
     *
     * @response 200 {
     *   "success": true,
     *   "message": "Banner updated successfully",
     *   "data": {
     *     "id": 1, "title": "Summer Sale", "description": "Up to 60% off", "image": "http://127.0.0.1:8000/uploads/banners/abc123.jpg",
     *     "link": "https://example.com/sale", "status": true, "created_at": "2026-07-20T10:00:00.000000Z", "updated_at": "2026-07-20T10:10:00.000000Z"
     *   }
     * }
     */
    public function update(UpdateBannerRequest $request, Banner $banner)
    {
        $data = $request->validated();

        if ($request->hasFile('image')) {
            $data['image'] = $this->imageService->replace($request->file('image'), $banner->image, 'banners');
        }

        $banner->update($data);

        return response()->json([
            'success' => true,
            'message' => __('messages.banner_updated'),
            'data' => new BannerResource($banner),
        ]);
    }

    /**
     * Delete a banner
     *
     * @response 200 {
     *   "success": true,
     *   "message": "Banner deleted successfully"
     * }
     */
    public function destroy(Banner $banner)
    {
        $this->imageService->delete($banner->image);
        $banner->delete();

        return response()->json([
            'success' => true,
            'message' => __('messages.banner_deleted'),
        ]);
    }

    /**
     * Toggle banner status
     *
     * PATCH /api/admin/banners/{banner}/toggle-status
     * زر واحد يبدّل الحالة: active -> inactive أو العكس (متطلب "Activate / Deactivate")
     *
     * @response 200 {
     *   "success": true,
     *   "data": {
     *     "id": 1, "title": "Summer Sale", "description": "Up to 50% off", "image": "http://127.0.0.1:8000/uploads/banners/abc123.jpg",
     *     "link": "https://example.com/sale", "status": false, "created_at": "2026-07-20T10:00:00.000000Z", "updated_at": "2026-07-20T10:15:00.000000Z"
     *   }
     * }
     */
    public function toggleStatus(Banner $banner)
    {
        $banner->update(['status' => ! $banner->status]);

        return response()->json([
            'success' => true,
            'message' => __('messages.banner_status_changed'),
            'data' => new BannerResource($banner),
        ]);
    }
}

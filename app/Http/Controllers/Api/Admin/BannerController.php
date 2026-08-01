<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Banner\StoreBannerRequest;
use App\Http\Requests\Admin\Banner\UpdateBannerRequest;
use App\Http\Resources\BannerResource;
use App\Models\Banner;
use App\Services\ImageUploadService;

class BannerController extends Controller
{
    public function __construct(protected ImageUploadService $imageService) {}

    public function index()
    {
        return BannerResource::collection(Banner::latest()->paginate(15));
    }

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

    public function show(Banner $banner)
    {
        return new BannerResource($banner);
    }

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

    public function destroy(Banner $banner)
    {
        $this->imageService->delete($banner->image);
        $banner->delete();

        return response()->json([
            'success' => true,
            'message' => __('messages.banner_deleted'),
        ]);
    }

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

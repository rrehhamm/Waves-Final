<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Gallery\StoreGalleryRequest;
use App\Http\Requests\Admin\Gallery\UpdateGalleryRequest;
use App\Http\Resources\GalleryImageResource;
use App\Models\GalleryImage;
use App\Services\ImageUploadService;
use Illuminate\Http\Request;

class GalleryController extends Controller
{
    public function __construct(protected ImageUploadService $imageService) {}

    public function index()
    {
        $images = GalleryImage::orderBy('sort_order')->paginate(15);

        return GalleryImageResource::collection($images);
    }

    public function store(StoreGalleryRequest $request)
    {
        $data = $request->validated();
        $data['status'] = $request->boolean('status', true);
        $data['sort_order'] = $data['sort_order'] ?? 0;
        $data['image'] = $this->imageService->store($request->file('image'), 'gallery');

        $image = GalleryImage::create($data);

        return response()->json([
            'success' => true,
            'message' => __('messages.gallery_created'),
            'data' => new GalleryImageResource($image),
        ], 201);
    }

    public function update(UpdateGalleryRequest $request, GalleryImage $galleryImage)
    {
        $data = $request->validated();

        if ($request->hasFile('image')) {
            $data['image'] = $this->imageService->replace($request->file('image'), $galleryImage->image, 'gallery');
        }

        $galleryImage->update($data);

        return response()->json([
            'success' => true,
            'message' => __('messages.gallery_updated'),
            'data' => new GalleryImageResource($galleryImage),
        ]);
    }

    public function destroy(GalleryImage $galleryImage)
    {
        $this->imageService->delete($galleryImage->image);
        $galleryImage->delete();

        return response()->json([
            'success' => true,
            'message' => __('messages.gallery_deleted'),
        ]);
    }

    public function toggleStatus(GalleryImage $galleryImage)
    {
        $galleryImage->update(['status' => ! $galleryImage->status]);

        return response()->json([
            'success' => true,
            'data' => new GalleryImageResource($galleryImage),
        ]);
    }

    public function sort(Request $request)
    {
        $request->validate([
            'items' => ['required', 'array'],
            'items.*.id' => ['required', 'integer', 'exists:gallery,id'],
            'items.*.sort_order' => ['required', 'integer', 'min:0'],
        ]);

        foreach ($request->input('items') as $item) {
            GalleryImage::where('id', $item['id'])->update(['sort_order' => $item['sort_order']]);
        }

        return response()->json([
            'success' => true,
            'message' => __('messages.gallery_sorted'),
        ]);
    }
}

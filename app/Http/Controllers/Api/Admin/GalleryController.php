<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Gallery\StoreGalleryRequest;
use App\Http\Requests\Admin\Gallery\UpdateGalleryRequest;
use App\Http\Resources\GalleryImageResource;
use App\Models\GalleryImage;
use App\Services\ImageUploadService;
use Illuminate\Http\Request;

/**
 * @group Admin - Gallery
 *
 * Full CRUD for gallery images, plus show/hide toggle and drag-and-drop reordering.
 * @authenticated
 */
class GalleryController extends Controller
{
    public function __construct(protected ImageUploadService $imageService) {}

    /**
     * List gallery images
     */
    public function index()
    {
        // بنرتبهم حسب sort_order (اللي حطه الأدمن) مش الأحدث
        $images = GalleryImage::orderBy('sort_order')->paginate(15);

        return GalleryImageResource::collection($images);
    }

    /**
     * Add a gallery image
     *
     * @response 201 {
     *   "success": true,
     *   "message": "Image added successfully",
     *   "data": {
     *     "id": 1, "title": "Store Front", "image": "http://127.0.0.1:8000/uploads/gallery/abc123.jpg",
     *     "description": null, "sort_order": 0, "status": true, "created_at": "2026-07-20T10:00:00.000000Z"
     *   }
     * }
     */
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

    /**
     * Update a gallery image
     *
     * @response 200 {
     *   "success": true,
     *   "message": "Image updated successfully",
     *   "data": {
     *     "id": 1, "title": "Store Front (updated)", "image": "http://127.0.0.1:8000/uploads/gallery/abc123.jpg",
     *     "description": null, "sort_order": 0, "status": true, "created_at": "2026-07-20T10:00:00.000000Z"
     *   }
     * }
     */
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

    /**
     * Delete a gallery image
     *
     * @response 200 {
     *   "success": true,
     *   "message": "Image deleted successfully"
     * }
     */
    public function destroy(GalleryImage $galleryImage)
    {
        $this->imageService->delete($galleryImage->image);
        $galleryImage->delete();

        return response()->json([
            'success' => true,
            'message' => __('messages.gallery_deleted'),
        ]);
    }

    /**
     * Toggle gallery image visibility
     *
     * PATCH /api/admin/gallery/{galleryImage}/toggle-status
     * (متطلب "Show / Hide Image")
     *
     * @response 200 {
     *   "success": true,
     *   "data": {
     *     "id": 1, "title": "Store Front", "image": "http://127.0.0.1:8000/uploads/gallery/abc123.jpg",
     *     "description": null, "sort_order": 0, "status": false, "created_at": "2026-07-20T10:00:00.000000Z"
     *   }
     * }
     */
    public function toggleStatus(GalleryImage $galleryImage)
    {
        $galleryImage->update(['status' => ! $galleryImage->status]);

        return response()->json([
            'success' => true,
            'data' => new GalleryImageResource($galleryImage),
        ]);
    }

    /**
     * Reorder gallery images
     *
     * POST /api/admin/gallery/sort
     * Body: { "items": [ {"id":1,"sort_order":0}, {"id":2,"sort_order":1} ] }
     * (متطلب "Sort Images")
     *
     * @response 200 {
     *   "success": true,
     *   "message": "Images order updated successfully"
     * }
     */
    public function sort(Request $request)
    {
        $request->validate([
            'items' => ['required', 'array'],
            'items.*.id' => ['required', 'integer', 'exists:gallery,id'],
            'items.*.sort_order' => ['required', 'integer', 'min:0'],
        ]);

        // بنمر على كل عنصر بالمصفوفة ونحدّث ترتيبه لحاله
        foreach ($request->input('items') as $item) {
            GalleryImage::where('id', $item['id'])->update(['sort_order' => $item['sort_order']]);
        }

        return response()->json([
            'success' => true,
            'message' => __('messages.gallery_sorted'),
        ]);
    }
}

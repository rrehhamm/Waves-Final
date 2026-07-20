<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\ContactMessageResource;
use App\Models\ContactMessage;

/**
 * @group Admin - Contact Messages
 *
 * View and manage messages submitted through the storefront's Contact Us form.
 * @authenticated
 */
class ContactMessageController extends Controller
{
    /**
     * List contact messages
     */
    public function index()
    {
        return ContactMessageResource::collection(ContactMessage::latest()->paginate(15));
    }

    /**
     * Get a contact message
     */
    public function show(ContactMessage $contactMessage)
    {
        return new ContactMessageResource($contactMessage);
    }

    /**
     * Mark a message as read
     *
     * PATCH /api/admin/contact-messages/{contactMessage}/mark-as-read
     *
     * @response 200 {
     *   "success": true,
     *   "message": "Message marked as read",
     *   "data": {
     *     "id": 1, "name": "Ahmad", "phone": "0791234567", "email": "ahmad@test.com",
     *     "message": "I have a question about a product", "is_read": true, "created_at": "2026-07-20T10:00:00.000000Z"
     *   }
     * }
     */
    public function markAsRead(ContactMessage $contactMessage)
    {
        $contactMessage->update(['is_read' => true]);

        return response()->json([
            'success' => true,
            'message' => __('messages.contact_marked_read'),
            'data' => new ContactMessageResource($contactMessage),
        ]);
    }

    /**
     * Delete a contact message
     *
     * @response 200 {
     *   "success": true,
     *   "message": "Message deleted successfully"
     * }
     */
    public function destroy(ContactMessage $contactMessage)
    {
        $contactMessage->delete();

        return response()->json([
            'success' => true,
            'message' => __('messages.contact_deleted'),
        ]);
    }
}

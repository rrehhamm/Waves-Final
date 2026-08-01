<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\ContactMessageResource;
use App\Models\ContactMessage;

class ContactMessageController extends Controller
{
    public function index()
    {
        return ContactMessageResource::collection(ContactMessage::latest()->paginate(15));
    }

    public function show(ContactMessage $contactMessage)
    {
        return new ContactMessageResource($contactMessage);
    }

    public function markAsRead(ContactMessage $contactMessage)
    {
        $contactMessage->update(['is_read' => true]);

        return response()->json([
            'success' => true,
            'message' => __('messages.contact_marked_read'),
            'data' => new ContactMessageResource($contactMessage),
        ]);
    }

    public function destroy(ContactMessage $contactMessage)
    {
        $contactMessage->delete();

        return response()->json([
            'success' => true,
            'message' => __('messages.contact_deleted'),
        ]);
    }
}

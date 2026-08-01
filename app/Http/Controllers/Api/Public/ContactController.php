<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Http\Requests\Public\ContactUsRequest;
use App\Http\Resources\ContactMessageResource;
use App\Models\ContactMessage;

class ContactController extends Controller
{
    public function store(ContactUsRequest $request)
    {
        $message = ContactMessage::create($request->validated());

        return response()->json([
            'success' => true,
            'message' => __('messages.contact_sent'),
            'data' => new ContactMessageResource($message),
        ], 201);
    }
}

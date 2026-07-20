<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Http\Requests\Public\ContactUsRequest;
use App\Http\Resources\ContactMessageResource;
use App\Models\ContactMessage;

/**
 * @group Public - Contact Us
 *
 * Open endpoint, no login required.
 */
class ContactController extends Controller
{
    /**
     * Send a contact message
     *
     * POST /api/contact-us
     *
     * @response 201 {
     *   "success": true,
     *   "message": "Your message has been sent successfully, we will contact you soon",
     *   "data": {
     *     "id": 1, "name": "Ahmad", "phone": "0791234567", "email": "ahmad@test.com",
     *     "message": "I have a question about a product", "is_read": false, "created_at": "2026-07-20T10:00:00.000000Z"
     *   }
     * }
     * @response 422 scenario="Validation error" {
     *   "message": "The name field is required.",
     *   "errors": { "name": ["The name field is required."] }
     * }
     */
    public function store(ContactUsRequest $request)
    {
        // is_read بيتحط false تلقائياً (default بالـ migration)
        $message = ContactMessage::create($request->validated());

        return response()->json([
            'success' => true,
            'message' => __('messages.contact_sent'),
            'data' => new ContactMessageResource($message),
        ], 201);
    }
}

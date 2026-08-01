<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Settings\UpdateSiteSettingRequest;
use App\Http\Resources\SiteSettingResource;
use App\Models\SiteSetting;

class SiteSettingController extends Controller
{
    public function show()
    {
        return new SiteSettingResource($this->firstOrDefault());
    }

    public function update(UpdateSiteSettingRequest $request)
    {
        $setting = $this->firstOrDefault();
        $setting->update($request->validated());

        return response()->json([
            'success' => true,
            'message' => __('messages.settings_updated'),
            'data' => new SiteSettingResource($setting),
        ]);
    }

    private function firstOrDefault(): SiteSetting
    {
        return SiteSetting::firstOrCreate(
            ['id' => 1],
            [
                'contact_phone' => '+962 79 000 0000',
                'contact_email' => 'reham@waves-test.com',
                'contact_address' => 'Amman, Jordan',
                'delivery_fee' => 15.00,
            ]
        );
    }
}

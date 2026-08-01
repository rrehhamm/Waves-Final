<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\SiteSettingResource;
use App\Models\SiteSetting;

class SiteSettingController extends Controller
{
    public function show()
    {
        $setting = SiteSetting::first();

        if (! $setting) {
            $setting = new SiteSetting([
                'contact_phone' => '+962 79 000 0000',
                'contact_email' => 'reham@waves-test.com',
                'contact_address' => 'Amman, Jordan',
                'delivery_fee' => 15.00,
            ]);
        }

        return new SiteSettingResource($setting);
    }
}

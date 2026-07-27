<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

// User هون = "العميل" (Customer) - مش الأدمن. هاد الموديل منفصل تماماً عن Admin
// وصلاحياته محدودة: بس يسجل دخول ويعمل/يشوف طلباته، مش أي عملية إدارية
#[Fillable(['name', 'email', 'password', 'profile_picture', 'phone', 'address_line', 'city'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    // HasApiTokens: نفس الفكرة اللي استخدمناها بموديل Admin - بتضيف createToken()
    use HasApiTokens;

    /**
     * علاقة: العميل ممكن يكون عنده أكتر من طلب (order)
     */
    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    /**
     * خصم "أول طلب" (20%) بيصير متاح بس لو العميل ما عمل ولا طلب لسا
     * بمجرد ما يعمل أول طلب، doesntExist() بترجع false تلقائياً - مفيش حاجة لعمود/flag إضافي
     */
    public function isEligibleForFirstOrderDiscount(): bool
    {
        return $this->orders()->doesntExist();
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }
}

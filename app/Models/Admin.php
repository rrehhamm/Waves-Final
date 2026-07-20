<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

// #[Fillable] : بيحدد الأعمدة المسموح تعبئتها بشكل جماعي (زي Admin::create([...]))
// #[Hidden]   : بيحدد الأعمدة اللي ما لازم تظهر لما نرجع الموديل كـ JSON (مثلاً بالـ login response)
#[Fillable(['name', 'email', 'password'])]
#[Hidden(['password', 'remember_token'])]
class Admin extends Authenticatable
{
    // HasApiTokens من مكتبة Sanctum: بتضيف methods زي:
    // $admin->createToken('name')  -> بتولّد token جديد للأدمن
    // $admin->tokens()             -> كل التوكنز تبعت الأدمن
    // $admin->currentAccessToken() -> التوكن المستخدم بالطلب الحالي
    use HasApiTokens;

    /**
     * تحويل تلقائي (Casting) للأعمدة
     */
    protected function casts(): array
    {
        return [
            // 'hashed' : أي قيمة تنحط بعمود password بتنشفّر تلقائياً بـ bcrypt
            // يعني لما نكتب Admin::create(['password' => 'Admin@123']) ما بنحتاج نعمل Hash::make() يدوياً
            'password' => 'hashed',
        ];
    }
}

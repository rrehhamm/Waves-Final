<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

// Service Class: بنحط فيها منطق "رفع/حذف الصور" مرة وحدة، ونستخدمها من أي Controller
// بدل ما نكرر نفس الكود بكل Controller (Category, Brand, Product...)
class ImageUploadService
{
    /**
     * يرفع صورة لمجلد معيّن جوا disk('uploads') (يعني storage/app/uploads/{folder})
     * وبيرجع المسار النسبي اللي لازم نخزنه بالداتابيز (مثلاً: "categories/abc123.jpg")
     */
    public function store(UploadedFile $file, string $folder): string
    {
        // store() بيولّد اسم عشوائي فريد للملف (عشان ما يصير تعارض أسماء)
        // ($folder, 'uploads') => احفظ جوا disk اسمه uploads، تحت مجلد $folder
        return $file->store($folder, 'uploads');
    }

    /**
     * يحذف صورة قديمة (لو موجودة أصلاً) - بنستخدمها وقت التحديث أو الحذف
     */
    public function delete(?string $path): void
    {
        if ($path && Storage::disk('uploads')->exists($path)) {
            Storage::disk('uploads')->delete($path);
        }
    }

    /**
     * تحديث صورة: يحذف القديمة (إذا موجودة) ويرفع الجديدة
     * هاد بالظبط اللي طالبته المواصفات بند 12: "When updating: Delete old image, Upload new one"
     */
    public function replace(UploadedFile $newFile, ?string $oldPath, string $folder): string
    {
        $this->delete($oldPath);

        return $this->store($newFile, $folder);
    }
}

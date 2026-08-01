<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class ImageUploadService
{
    public function store(UploadedFile $file, string $folder): string
    {
        return $file->store($folder, 'uploads');
    }

    public function delete(?string $path): void
    {
        if ($path && Storage::disk('uploads')->exists($path)) {
            Storage::disk('uploads')->delete($path);
        }
    }

    public function replace(UploadedFile $newFile, ?string $oldPath, string $folder): string
    {
        $this->delete($oldPath);

        return $this->store($newFile, $folder);
    }
}

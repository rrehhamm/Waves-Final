<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

        // بينفّذ AdminSeeder (بيعمل أول حساب أدمن) كل ما شغّلنا: php artisan db:seed
        $this->call(AdminSeeder::class);

        // بيعبي التصنيفات/البراندات/البانر يلي كانوا ثابتين بالفرونت إند كصفوف حقيقية بالداتابيز
        // (هيك بيظهروا بالأدمن داشبورد وتقدر تعدّلهم/تحذفهم بدل ما يضلوا مجرد بيانات ثابتة بالكود)
        $this->call(HomepageContentSeeder::class);
    }
}

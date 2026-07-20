<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Symfony\Component\HttpFoundation\Response;

// Middleware = كود بيشتغل "قبل" (أو بعد) ما الطلب يوصل للـ Controller
// هاد الميدل وير بيشتغل على *كل* طلب API ويحدد لغة التطبيق تلقائياً
class SetLocale
{
    public function handle(Request $request, Closure $next): Response
    {
        // current_lang() (من app/Helpers/helpers.php) بتحدد اللغة من ?lang= أو Accept-Language
        $lang = current_lang();

        // App::setLocale(): بتغيّر لغة التطبيق لهاد الطلب بس (مش دائم)
        // من هون ورايح، أي استخدام لـ __('messages.xxx') بأي مكان بالكود
        // (Controllers, Form Requests, رسائل validation...) رح ياخد تلقائياً الترجمة الصح
        App::setLocale($lang);

        /** @var Response $response */
        $response = $next($request);

        // بنضيف Headers بالرد عشان الـ front-end يعرف اللغة والاتجاه الحاليين
        // (تطبيق RTL/LTR فعلياً بصفحة الـ HTML هوي شغل الـ front-end -
        // مثلاً: document.dir = response.headers.get('X-Text-Direction'))
        $response->headers->set('Content-Language', $lang);
        $response->headers->set('X-Text-Direction', $lang === 'ar' ? 'rtl' : 'ltr');

        return $response;
    }
}

<?php

use App\Http\Middleware\SetLocale;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        // بهاد السطر بنقول لـ Laravel: حمّل routes/api.php،
        // وحط كل مساراته تلقائياً تحت middleware group اسمه "api" + prefix "/api"
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // بنضيف SetLocale لكل مسارات الـ API (يشتغل قبل ما يوصل الطلب لأي Controller)
        $middleware->api(prepend: [
            SetLocale::class,
        ]);

        // مهم جداً: افتراضياً، middleware الـ "auth" (زي auth:admin أو auth:user) بيحاول
        // يعمل redirect لصفحة اسمها "login" لما المستخدم مش مسجل دخول - وهاد بيسبب Error
        // لأنه مشروعنا API بحت وما فيه صفحة "login" ويب أصلاً.
        // بهاد السطر بنقول له: "لو حدا مش مسجل دخول، رجّع null (يعني: لا تعمل أي redirect)"
        // وبالتالي Laravel بيرجع رسالة 401 JSON نظيفة بدل ما يطلع Error 500
        $middleware->redirectGuestsTo(fn () => null);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // مشروعنا API بحت (ما فيه صفحات login ويب) فلازم أي خطأ (401, 404, 422, 500...)
        // يرجع دايماً JSON منسّق، مش صفحة HTML أو محاولة redirect لصفحة مش موجودة
        $exceptions->shouldRenderJsonWhen(function ($request, $throwable) {
            return $request->is('api/*') || $request->expectsJson();
        });
    })->create();

<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Symfony\Component\HttpFoundation\Response;

class SetLocale
{
    public function handle(Request $request, Closure $next): Response
    {
        $lang = current_lang();

        App::setLocale($lang);

        $response = $next($request);

        $response->headers->set('Content-Language', $lang);
        $response->headers->set('X-Text-Direction', $lang === 'ar' ? 'rtl' : 'ltr');

        return $response;
    }
}

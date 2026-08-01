<?php

use Knuckles\Scribe\Config\AuthIn;
use Knuckles\Scribe\Config\Defaults;
use Knuckles\Scribe\Extracting\Strategies;

use function Knuckles\Scribe\Config\configureStrategy;


return [
    'title' => config('app.name').' API Documentation',

    'description' => 'REST API for the Waves e-commerce platform: a public/customer-facing storefront API and a separate Admin Dashboard API, both with full bilingual (Arabic/English) support.',

    'intro_text' => <<<'INTRO'
            This documentation covers every endpoint in the Waves backend API.

            <aside>Waves has <b>two completely separate authentication systems</b>: an Admin token (for the dashboard, full CRUD access) and a Customer token (for the storefront, place/view own orders only). A token from one system will never work on the other's protected routes. See the "Authentication" note on each endpoint to know which token type it expects.</aside>

            <aside>Every request can be sent in Arabic or English by adding an <code>Accept-Language: ar</code> (or <code>en</code>) header, or a <code>?lang=ar</code> query parameter. This affects both the returned data fields and all success/error/validation messages. Default is English.</aside>
        INTRO,

    'base_url' => config('app.url'),

    'routes' => [
        [
            'match' => [
                'prefixes' => ['api/*'],
                'domains' => ['*'],
            ],
            'include' => [],
            'exclude' => [],
        ],
    ],

    'type' => 'laravel',

    'theme' => 'default',

    'static' => [
        'output_path' => 'public/docs',
    ],

    'laravel' => [
        'add_routes' => true,
        'docs_url' => '/docs',
        'assets_directory' => null,
        'middleware' => [],
    ],

    'external' => [
        'html_attributes' => [],
    ],

    'try_it_out' => [
        'enabled' => true,
        'base_url' => null,
        'use_csrf' => false,
        'csrf_url' => '/sanctum/csrf-cookie',
    ],

    'auth' => [
        'enabled' => true,

        'default' => false,

        'in' => AuthIn::BEARER->value,
        'name' => 'Authorization',

        'use_value' => env('SCRIBE_AUTH_KEY'),

        'placeholder' => '{YOUR_TOKEN}',

        'extra_info' => 'Get an Admin token from `POST /api/admin/login`, or a Customer token from `POST /api/login` (or `POST /api/register`). Send it as `Authorization: Bearer {token}`. Admin tokens and Customer tokens are not interchangeable.',
    ],

    'example_languages' => [
        'bash',
        'javascript',
        'php',
    ],

    'postman' => [
        'enabled' => true,
        'overrides' => [],
    ],

    'openapi' => [
        'enabled' => true,
        'version' => '3.0.3',
        'overrides' => [],
        'generators' => [],
    ],

    'groups' => [
        'default' => 'Public - General',

        'order' => [
            'Admin - Authentication',
            'Admin - Dashboard',
            'Admin - Categories',
            'Admin - Brands',
            'Admin - Products',
            'Admin - Banners',
            'Admin - Gallery',
            'Admin - Contact Messages',
            'Admin - Orders',
            'Public - Banners',
            'Public - Categories',
            'Public - Brands',
            'Public - Products',
            'Public - Gallery',
            'Public - Contact Us',
            'Customer - Authentication',
            'Customer - Orders',
        ],
    ],

    'logo' => false,

    'last_updated' => 'Last updated: {date:F j, Y}',

    'examples' => [
        'faker_seed' => 1234,
        'models_source' => ['factoryCreate', 'factoryMake', 'databaseFirst'],
    ],

    'strategies' => [
        'metadata' => [
            ...Defaults::METADATA_STRATEGIES,
        ],
        'headers' => [
            ...Defaults::HEADERS_STRATEGIES,
            Strategies\StaticData::withSettings(data: [
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
                'Accept-Language' => 'en',
            ]),
        ],
        'urlParameters' => [
            ...Defaults::URL_PARAMETERS_STRATEGIES,
        ],
        'queryParameters' => [
            ...Defaults::QUERY_PARAMETERS_STRATEGIES,
        ],
        'bodyParameters' => [
            ...Defaults::BODY_PARAMETERS_STRATEGIES,
        ],
        'responses' => configureStrategy(
            Defaults::RESPONSES_STRATEGIES,
            Strategies\Responses\ResponseCalls::withSettings(
                only: ['GET *'],
                config: [
                    'app.debug' => false,
                ]
            )
        ),
        'responseFields' => [
            ...Defaults::RESPONSE_FIELDS_STRATEGIES,
        ],
    ],

    'database_connections_to_transact' => [config('database.default')],

    'fractal' => [
        'serializer' => null,
    ],
];

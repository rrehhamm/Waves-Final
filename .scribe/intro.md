# Introduction

REST API for the Waves e-commerce platform: a public/customer-facing storefront API and a separate Admin Dashboard API, both with full bilingual (Arabic/English) support.

<aside>
    <strong>Base URL</strong>: <code>http://localhost/Ecommerce%20Backend/public</code>
</aside>

    This documentation covers every endpoint in the Waves backend API.

    <aside>Waves has <b>two completely separate authentication systems</b>: an Admin token (for the dashboard, full CRUD access) and a Customer token (for the storefront, place/view own orders only). A token from one system will never work on the other's protected routes. See the "Authentication" note on each endpoint to know which token type it expects.</aside>

    <aside>Every request can be sent in Arabic or English by adding an <code>Accept-Language: ar</code> (or <code>en</code>) header, or a <code>?lang=ar</code> query parameter. This affects both the returned data fields and all success/error/validation messages. Default is English.</aside>


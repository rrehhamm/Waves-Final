# Authenticating requests

To authenticate requests, include an **`Authorization`** header with the value **`"Bearer {YOUR_TOKEN}"`**.

All authenticated endpoints are marked with a `requires authentication` badge in the documentation below.

Get an Admin token from `POST /api/admin/login`, or a Customer token from `POST /api/login` (or `POST /api/register`). Send it as `Authorization: Bearer {token}`. Admin tokens and Customer tokens are not interchangeable.

# ADR-005: Laravel Sanctum SPA Cookie Auth over JWT

**Date:** 2026-11-18

**Status:** Accepted

---

## Context

The frontend (Next.js) and backend (Laravel) are served from related origins
(same apex domain in production). We need an authentication mechanism that is
secure by default, works with Laravel's built-in authorization primitives
(`Auth::user()`, policies), and does not require the frontend to manage token
storage in JavaScript-accessible memory.

---

## Decision

Use Laravel Sanctum in SPA mode: httpOnly session cookies, CSRF protection via
the `sanctum/csrf-cookie` handshake, and stateful middleware
(`EnsureFrontendRequestsAreStateful`).

---

## Alternatives Considered

### JWT tokens stored in localStorage (rejected)

Client stores the token in `localStorage` or `sessionStorage`, sends as
`Authorization: Bearer`.

Rejected because: tokens stored in `localStorage` are readable by any JavaScript
running on the page. A single XSS vulnerability allows an attacker to read and
exfiltrate every user's token. HttpOnly cookies cannot be read by JavaScript, which
removes this specific attack vector.

Note: httpOnly cookies do not eliminate all XSS risk. An attacker who achieves XSS
can still make authenticated requests on behalf of the victim using their existing
session. Full XSS mitigation requires output encoding, a Content Security Policy,
and input validation at the application layer. The cookie choice removes token theft
specifically.

JWTs also have no built-in revocation. Invalidating a compromised token before
expiry requires a server-side denylist, which eliminates the stateless advantage
and adds complexity.

### Sanctum API tokens (rejected)

Personal access tokens stored in the database, sent as `Authorization: Bearer`.

Rejected because: personal access tokens introduce client-side token lifecycle and
storage responsibilities. For a first-party browser SPA, cookie-based session
authentication integrates more naturally with Laravel's CSRF and session management.
API tokens are appropriate for machine-to-machine access or mobile clients.

### OAuth2 / Passport (not considered at this stage)

Appropriate for third-party API access. No third-party OAuth flow is in scope.
Adds significant configuration overhead for no security benefit over Sanctum SPA.

---

## Consequences

**Positive:**
- Tokens never touch JavaScript, removing the localStorage theft vector.
- Laravel's cookie-based CSRF token mechanism: the `XSRF-TOKEN` cookie is
  deliberately readable by JavaScript (not httpOnly). The frontend reads it and
  sends it as the `X-XSRF-TOKEN` header on state-changing requests. The server
  validates the header value against the session token. The browser's same-origin
  policy prevents an unrelated origin from reading the XSRF cookie through
  JavaScript, provided the application's cookie domain and origin configuration
  are correctly restricted.
- `Auth::user()` and all Laravel policies work without modification.
- Active session invalidation on logout is immediate, without waiting for token
  expiration.

**Negative:**
- Requires same-site or same-apex-domain configuration. Requests from a fully
  separate domain (mobile app, third-party integration) need API tokens instead.
- Stateful sessions require a session store. Redis is used in production
  (`SESSION_DRIVER=redis`) so horizontal scaling is not a concern.

---

## Implementation Notes

Stateful domain configuration in `config/sanctum.php`:
```php
'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS', 'localhost:3000')),
```

Frontend SPA auth flow:
1. `GET /sanctum/csrf-cookie` — sets XSRF-TOKEN cookie (readable by JS)
2. `POST /api/auth/login` with `X-XSRF-TOKEN` header — sets httpOnly session cookie
3. All subsequent requests carry both cookies automatically

Production requirements: cookie domain, SameSite policy, Secure flag, and CORS
`allowed_origins` must all align with the production subdomain setup.

---

## Reconsideration Triggers

- Third-party OAuth or external API access becomes necessary.
- Mobile clients require the same authentication flow as the browser SPA.

---

## Validation

- Auth tests: register, login, logout, unauthenticated access (all passing)
- CSRF: verify that a POST without the XSRF-TOKEN header returns 419
- Session: verify that logout invalidates the session for all subsequent requests

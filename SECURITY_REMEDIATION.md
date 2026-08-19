# Shadow Arrow Security Remediation Brief

Use this file as the implementation checklist. Fix only the items below, preserve existing storefront and guest checkout behavior, and do not paste any real secret into source control or this document.

## Priority 0: Rotate Exposed Credentials

The local root `.env` contains live credentials. Treat them as compromised and rotate them before deployment:

- MongoDB Atlas database user password / connection URI
- `JWT_SECRET`
- Razorpay API secret
- Shiprocket password
- `ADMIN_MASTER_PASS`
- Any Python AI service key stored in its environment

Update the new values only in Render/Vercel environment settings or local ignored `.env` files. Never commit `.env`, `.env.local`, service-account JSON, or private keys. Remove any accidentally tracked secret from Git history using the repository owner's normal secret-removal process.

## Priority 1: Add Real Customer Authentication

Current customer endpoints trust query parameters such as email, phone, contact, or order ID. These are not proof of identity.

Implement Firebase ID-token verification in the Go backend:

1. Add a backend auth middleware that validates `Authorization: Bearer <Firebase ID token>` using Firebase Admin SDK credentials supplied through environment variables.
2. Put the verified Firebase UID, email, and phone in Gin context.
3. In customer handlers, derive the user filter from verified claims, never from arbitrary email/phone query parameters.
4. Reject missing or invalid tokens with `401`.
5. Reject a valid user attempting to access another user's record with `403`.
6. Keep unauthenticated product, CMS, coupon validation, and guest order creation routes public where business behavior requires it.
7. Replace the current phone-only login with Firebase Phone Auth/OTP, or clearly treat it as a guest flow. A typed phone number alone must not create an authenticated session.

Protect these routes:

- `GET /api/v1/user/profile`
- `PUT /api/v1/user/profile`
- `GET /api/v1/user/orders`
- `GET /api/v1/user/rewards`
- `POST /api/v1/user/request-deletion`
- `GET /api/v1/user/tickets`
- `GET /api/v1/tickets/:id`
- `POST /api/v1/tickets/:id/reply`
- `GET /api/v1/orders/track/:id` when it returns personal details

## Priority 1: Prevent Data Leakage

- Do not return full user documents publicly. Never expose internal IDs, addresses, coin balances, deletion metadata, or private profile fields to another user.
- Do not let order tracking by email/phone return shipping address, phone, email, payment data, or order history without authentication or one-time verification.
- A customer may read or reply only to their own ticket. Verify ticket ownership from the authenticated UID/contact stored on the user record.
- Keep admin ticket routes behind `AdminAuthMiddleware`.
- The backend must ignore client-supplied `sender: "admin"`; only the protected admin route may create admin messages.
- Return DTOs with only the fields each screen needs instead of returning full MongoDB models.

## Priority 1: Admin Session Security

- Keep admin routes protected by JWT and verify role plus expiry.
- Move the admin token from browser `localStorage` to an `HttpOnly`, `Secure`, `SameSite=Lax` cookie.
- Add logout that clears the cookie.
- Add CSRF protection for cookie-authenticated state-changing requests.
- Do not log JWTs, passwords, payment secrets, or database connection strings.

## Priority 2: CORS and Deployment

The backend CORS implementation has already been changed to an allowlist. Keep it strict:

- Production: allow only `https://shadowarrow.in` and `https://www.shadowarrow.in`.
- Development: allow localhost ports explicitly.
- Never use `AllowOriginFunc` that returns `true`.
- Keep `AllowCredentials` enabled only when required by the cookie flow.
- Configure `ALLOWED_ORIGINS` in Render and local ignored environment files.
- Ensure every production API call uses HTTPS.
- Fix local admin API URL to `http://localhost:8080` if the backend is running on port 8080.

## Priority 2: Validation and Abuse Controls

- Validate and normalize email, phone, pincode, quantities, prices, coupon values, ticket status, and media URLs.
- Enforce maximum request body size and upload type/size limits.
- Validate ticket sender values server-side (`customer` or authenticated admin only).
- Add rate limits to public auth, ticket, order tracking, deletion, and AI routes.
- Use generic authentication errors to avoid account enumeration.
- Ensure payment verification checks Razorpay order ID, payment ID, signature, amount, and order ownership.
- Ensure order status/payment transitions are server-controlled and cannot be freely set by clients.

## Required Verification

Before marking this work complete:

- `go test ./...` passes from `backend/`.
- Add backend tests for missing token, invalid token, cross-user access, admin-only ticket reply, and CORS rejection.
- Confirm a browser request from an unapproved origin fails CORS.
- Confirm a customer cannot read another customer's profile, orders, rewards, or tickets by changing query parameters.
- Confirm guest product browsing and the intended guest checkout path still work.
- Run `git diff --check` and verify no secret files are tracked.
- Check the production build for accidental `NEXT_PUBLIC_` exposure. Only public API URLs and public Firebase/Razorpay identifiers may use that prefix; never use it for secrets.

## Already Completed in This Repository

- CORS was changed from allow-all to a trusted-origin allowlist in `backend/middleware/cors_middleware.go`.
- Unauthenticated callers can no longer forge an admin ticket reply in `backend/handlers/ticket_handler.go`.
- `ALLOWED_ORIGINS` was added to `render.yaml` and `backend/.env.example`.

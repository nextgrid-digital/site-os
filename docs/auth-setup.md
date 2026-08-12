# End-user auth (public audit gate)

Site-OS unlocks the full free audit with **Supabase Auth**:

- Google OAuth (`signInWithOAuth`)
- Email + password (`signUp` / `signInWithPassword`)

Operator GSC/GA4 Google OAuth (`GOOGLE_*` env + `/api/google/oauth/*`) is separate.

## Required Supabase dashboard settings

Project: SiteOS (`dpdgvrbadkceghevxpae`)

### 1. Google provider

1. Authentication → Providers → Google → Enable
2. Paste the same Google Cloud OAuth Client ID + Secret used for the operator app (or a dedicated web client)
3. In Google Cloud Console → Credentials → OAuth client → Authorized redirect URIs, add:
   `https://dpdgvrbadkceghevxpae.supabase.co/auth/v1/callback`

### 2. Redirect URLs (critical for production)

Authentication → URL configuration:

- **Site URL:** production origin — currently `https://site-os-opal.vercel.app` (not `http://localhost:3000`)
- **Redirect URLs** allow list (keep local + prod):
  - `http://localhost:3000/auth/callback`
  - `https://site-os-opal.vercel.app/auth/callback`
  - `https://*.vercel.app/auth/callback` (preview deploys)

Query strings on `/auth/callback` (e.g. `?next=/auth/update-password`) are allowed once the base path is on the list.

If the production callback is missing from the allow list, Supabase falls back to **Site URL**. When Site URL is localhost, Google sign-in on production sends users to localhost.

### 3. Email / password

Authentication → Providers → Email:

- Enable email provider
- **Disable “Confirm email”** so signup returns a session immediately (otherwise users get stuck on verify-email again)

### 4. Google account + email/password (same user)

Users who signed up with Google can also sign in with email/password on the **same** account after setting a password via `updateUser({ password })`:

1. While signed in: Dashboard menu → **Set password** → `/auth/update-password?from=account`
2. Or: Forgot password → email link → `/auth/callback?next=/auth/update-password` → set password

Do **not** create a second signup with the same email — that does not merge into the Google user.

## Production checklist

1. Supabase Site URL = `https://site-os-opal.vercel.app`
2. Supabase Redirect URLs include `https://site-os-opal.vercel.app/auth/callback`
3. Vercel Production env:
   - `NEXT_PUBLIC_APP_URL=https://site-os-opal.vercel.app`
   - `GOOGLE_REDIRECT_URI=https://site-os-opal.vercel.app/api/google/oauth/callback`
4. Google Cloud OAuth client Authorized redirect URIs include:
   - `https://dpdgvrbadkceghevxpae.supabase.co/auth/v1/callback` (account sign-in)
   - `https://site-os-opal.vercel.app/api/google/oauth/callback` (GSC/GA4 Connect)
5. Redeploy after changing Vercel env (especially `NEXT_PUBLIC_*`)

Local `.env` may keep localhost values; production must not.

## App routes

| Route | Purpose |
|-------|---------|
| `POST /api/auth/signup` | Email/password sign up + unlock session |
| `POST /api/auth/login` | Email/password sign in + unlock session |
| `POST /api/auth/forgot-password` | Send reset email (`redirectTo` → callback → update-password) |
| `GET /auth/callback` | OAuth / recovery code exchange (sets session cookies on redirect) |
| `/auth/update-password` | Set or reset password (`updateUser`) — enables email login on Google accounts |
| `/audit/[sessionId]` | Sign-in gate until authenticated, then full free report |

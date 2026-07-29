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

### 2. Redirect URLs

Authentication → URL configuration:

- Site URL: `http://localhost:3000` (local) or your production origin
- Redirect URLs allow list:
  - `http://localhost:3000/auth/callback`
  - `https://<your-production-domain>/auth/callback`

### 3. Email / password

Authentication → Providers → Email:

- Enable email provider
- **Disable “Confirm email”** so signup returns a session immediately (otherwise users get stuck on verify-email again)

## App routes

| Route | Purpose |
|-------|---------|
| `POST /api/auth/signup` | Email/password sign up + unlock session |
| `POST /api/auth/login` | Email/password sign in + unlock session |
| `GET /auth/callback` | Google OAuth code exchange + unlock session |
| `/audit/[sessionId]` | Sign-in gate until authenticated, then full free report |

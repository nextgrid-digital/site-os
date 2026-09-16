# Google OAuth verification checklist

Site-OS requests sensitive/restricted Google API scopes (Search Console, GA4, Google Ads). Until
the OAuth consent screen is verified by Google, the app is capped at 100 test users and shows an
"unverified app" warning during sign-in/connect — unacceptable for open self-serve signup. Start
this process early; review (and CASA security assessment, if required for the `adwords` /
`analytics` scopes) can take days to weeks.

## Scopes in use

- `https://www.googleapis.com/auth/webmasters.readonly`
- `https://www.googleapis.com/auth/analytics.readonly`
- `https://www.googleapis.com/auth/adwords`

## Before submitting

1. **Privacy Policy URL is live** — `https://<prod-domain>/privacy` (see `src/app/privacy`).
2. **Terms of Service URL is live** — `https://<prod-domain>/terms` (see `src/app/terms`).
3. **App homepage** set to the production domain.
4. **Authorized domains** in the OAuth consent screen include the production domain.
5. **Scope justification**: be ready to explain, per scope, why it's needed and how it's used
   (read-only reporting inside the connected audit — no writes, no ad management).
6. **Demo video**: record a short screen capture of the full OAuth consent + connect flow,
   showing exactly how each scope's data is used in the product. Required for sensitive-scope
   verification.
7. **App logo, support email, developer contact email** filled in on the consent screen.

## Steps

1. Google Cloud Console → APIs & Services → OAuth consent screen → fill out all required fields
   above, submit for verification.
2. If Google requests a CASA (security) assessment for `adwords`/`analytics` scopes, complete the
   assessment via Google's provided tier-appropriate process.
3. Track verification status in the Cloud Console; respond promptly to any reviewer follow-ups —
   delays here directly block open self-serve signup.
4. Once verified, confirm the consent screen no longer shows "unverified app" for a fresh Google
   account outside the test-user allowlist.

## Until verification completes

- Self-serve signup can still launch for email/password accounts; gate the Google-connect step
  behind a note ("Google connect is in limited beta") if verification is still pending, or keep
  test users under the 100-user cap by adding pilot customers as test users in the Cloud Console.

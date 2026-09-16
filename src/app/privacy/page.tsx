import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy | Site-OS',
  description: 'How Site-OS collects, uses, and protects your data.',
};

const LAST_UPDATED = 'September 16, 2026';

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
        &larr; Back to Site-OS
      </Link>

      <h1 className="mt-6 text-3xl font-semibold">Privacy Policy</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: {LAST_UPDATED}</p>

      <div className="mt-8 space-y-8 text-sm leading-6 text-foreground/90">
        <section>
          <p>
            Site-OS (&quot;Site-OS&quot;, &quot;we&quot;, &quot;us&quot;) provides a website audit and
            reporting tool. This policy explains what data we collect, why we collect it, and how
            it is used when you create an account, run an audit, or connect a third-party account
            such as Google.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">1. Information we collect</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>
              <strong>Account information:</strong> email address and a securely hashed password
              (or your Google account identifier if you sign in with Google), managed via
              Supabase Auth.
            </li>
            <li>
              <strong>Website data:</strong> the URL(s) you submit for auditing, and content
              collected by crawling those pages (HTML, metadata, on-page text) to generate
              findings.
            </li>
            <li>
              <strong>Connected Google data:</strong> if you connect Google Search Console,
              Google Analytics (GA4), or Google Ads, we access performance data (e.g. clicks,
              impressions, sessions, conversions, campaign metrics) scoped to the properties you
              explicitly select, using read-only OAuth scopes.
            </li>
            <li>
              <strong>Usage data:</strong> basic product analytics (pages viewed, features used)
              to improve Site-OS.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold">2. How we use your information</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>To generate your website audit, findings, and reports.</li>
            <li>To authenticate you and maintain your account and project data.</li>
            <li>To operate, maintain, and improve Site-OS.</li>
            <li>To communicate with you about your account or audits (e.g. transactional email).</li>
            <li>To process payments once billing is enabled, via our payment processor.</li>
          </ul>
          <p className="mt-2">
            We do not sell your data or Google account data to third parties, and we do not use
            Google user data for advertising purposes.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">3. Google user data &amp; Limited Use</h2>
          <p className="mt-2">
            Site-OS&apos;s use and transfer of information received from Google APIs to any other
            app will adhere to the{' '}
            <a
              href="https://developers.google.com/terms/api-services-user-data-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              Google API Services User Data Policy
            </a>
            , including the Limited Use requirements. Google account data (Search Console, GA4,
            Google Ads) is used solely to generate the audit and reporting features you request
            inside Site-OS, is scoped per project/account, and is never used for advertising or
            sold to third parties.
          </p>
          <p className="mt-2">
            You can revoke Site-OS&apos;s access to your Google account at any time from your{' '}
            <a
              href="https://myaccount.google.com/permissions"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              Google Account permissions
            </a>{' '}
            page, or by disconnecting the account inside Site-OS.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">4. Data storage &amp; security</h2>
          <p className="mt-2">
            Data is stored with Supabase (PostgreSQL) with access controls restricting each
            account to its own projects and connections. OAuth tokens are stored server-side and
            are never exposed to the browser. We use industry-standard measures to protect your
            data, but no method of transmission or storage is 100% secure.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">5. Data retention &amp; deletion</h2>
          <p className="mt-2">
            We retain account and audit data for as long as your account is active. You can
            request deletion of your account and associated data at any time by contacting us
            (see below); we will delete or anonymize your data within a reasonable period, except
            where retention is required by law.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">6. Third-party services</h2>
          <p className="mt-2">
            We use third-party providers to operate Site-OS, including Supabase (authentication
            and database), Google APIs (Search Console, GA4, Ads, sign-in), and Google Gemini
            (report generation). These providers process data on our behalf under their own
            privacy and data-processing terms.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">7. Your rights</h2>
          <p className="mt-2">
            Depending on your location, you may have rights to access, correct, export, or delete
            your personal data. Contact us using the details below to exercise these rights.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">8. Changes to this policy</h2>
          <p className="mt-2">
            We may update this policy from time to time. Material changes will be reflected by
            updating the &quot;Last updated&quot; date above.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">9. Contact</h2>
          <p className="mt-2">
            Questions about this policy or your data? Contact us at{' '}
            <a href="mailto:support@site-os.app" className="underline">
              support@site-os.app
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}

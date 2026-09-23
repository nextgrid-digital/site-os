import Link from 'next/link';

export const metadata = {
  title: 'Terms of Service | Site-OS',
  description: 'The terms that govern your use of Site-OS.',
};

const LAST_UPDATED = 'September 16, 2026';

export default function TermsOfServicePage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
        &larr; Back to Site-OS
      </Link>

      <h1 className="mt-6 text-3xl font-semibold">Terms of Service</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: {LAST_UPDATED}</p>

      <div className="mt-8 space-y-8 text-sm leading-6 text-foreground/90">
        <section>
          <p>
            These Terms of Service (&quot;Terms&quot;) govern your access to and use of Site-OS
            (the &quot;Service&quot;). By creating an account or using the Service, you agree to
            these Terms. If you do not agree, do not use the Service.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">1. The Service</h2>
          <p className="mt-2">
            Site-OS crawls websites you submit and, optionally, connects to Google Search
            Console, Google Analytics (GA4), and Google Ads accounts you authorize, in order to
            generate audits, findings, and reports about a website&apos;s performance.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">2. Accounts</h2>
          <p className="mt-2">
            You must provide accurate information when creating an account and are responsible
            for safeguarding your credentials and for all activity under your account. You must
            only submit websites and connect Google accounts that you own or are authorized to
            audit.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">3. Acceptable use</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Do not use the Service to crawl or audit websites you do not have permission to access.</li>
            <li>Do not attempt to disrupt, overload, or gain unauthorized access to the Service or other users&apos; data.</li>
            <li>Do not use the Service for unlawful purposes.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold">4. Google account connections</h2>
          <p className="mt-2">
            When you connect a Google account, you authorize Site-OS to access the specific
            Search Console, GA4, or Google Ads data you select, using read-only access, solely to
            provide the Service. You may disconnect your Google account at any time from within
            Site-OS or from your Google Account permissions. See our{' '}
            <Link href="/privacy" className="underline">
              Privacy Policy
            </Link>{' '}
            for details on how this data is used.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">5. Billing</h2>
          <p className="mt-2">
            Certain features require a paid subscription. Paid plans, pricing, and billing terms
            (including renewal and cancellation) will be presented at checkout and are
            incorporated into these Terms by reference. Fees are non-refundable except where
            required by law.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">6. Intellectual property</h2>
          <p className="mt-2">
            Site-OS and its underlying technology are owned by us. You retain ownership of the
            website content and data you submit. You grant us a limited license to process that
            data solely to provide the Service to you.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">7. Disclaimers</h2>
          <p className="mt-2">
            The Service is provided &quot;as is&quot; without warranties of any kind. Audit
            findings and recommendations are informational and do not guarantee any specific
            business outcome or ranking improvement.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">8. Limitation of liability</h2>
          <p className="mt-2">
            To the maximum extent permitted by law, Site-OS will not be liable for any indirect,
            incidental, or consequential damages arising from your use of the Service.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">9. Termination</h2>
          <p className="mt-2">
            We may suspend or terminate your access to the Service if you violate these Terms.
            You may stop using the Service and delete your account at any time.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">10. Changes to these Terms</h2>
          <p className="mt-2">
            We may update these Terms from time to time. Continued use of the Service after
            changes take effect constitutes acceptance of the updated Terms.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">11. Contact</h2>
          <p className="mt-2">
            Questions about these Terms? Contact us at{' '}
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

import Link from 'next/link';

export const metadata = {
  title: 'Refund Policy | Site-OS',
  description: 'Our refund policy and payment terms for Site-OS audits.',
};

const LAST_UPDATED = 'September 22, 2026';

export default function RefundPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
        &larr; Back to Site-OS
      </Link>

      <h1 className="mt-6 text-3xl font-semibold">Refund Policy</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: {LAST_UPDATED}</p>

      <div className="mt-8 space-y-8 text-sm leading-6 text-foreground/90">
        <section>
          <p>
            At Site-OS, we stand behind the quality of our audits. This Refund Policy explains
            when and how you can request a refund for your purchase.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">1. Eligibility for Refunds</h2>
          <p className="mt-2">
            You may request a refund for a Site-OS audit purchase within 14 calendar days of the
            transaction date if:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>You have not yet accessed or downloaded your audit report, or</li>
            <li>
              You believe the audit does not meet the service description or contains material
              errors
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold">2. Non-Refundable Purchases</h2>
          <p className="mt-2">Refunds are not available for:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Free audits</li>
            <li>
              Custom implementation sprints or retainer engagements (these are handled separately;
              see contract terms)
            </li>
            <li>Purchases made more than 14 days ago</li>
            <li>Audits where the report has been fully downloaded and reviewed</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold">3. How to Request a Refund</h2>
          <p className="mt-2">
            To request a refund, email{' '}
            <a
              href="mailto:support@site-os.app?subject=Refund Request"
              className="font-medium text-foreground hover:underline"
            >
              support@site-os.app
            </a>{' '}
            within 14 days of your purchase with:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Your account email address</li>
            <li>The transaction/order ID</li>
            <li>Reason for the refund request</li>
            <li>Any supporting information (e.g., screenshots of the issue)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold">4. Processing Refunds</h2>
          <p className="mt-2">
            Once we receive your refund request, we will review it within 5 business days. If
            approved, the refund will be issued to your original payment method. Refunds are
            processed by Paddle (our payment processor) and may take 3–5 business days to appear
            in your account, depending on your financial institution.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">5. Disputes</h2>
          <p className="mt-2">
            If you believe an audit result is inaccurate or incomplete, please contact our support
            team at{' '}
            <a
              href="mailto:support@site-os.app?subject=Audit Accuracy Dispute"
              className="font-medium text-foreground hover:underline"
            >
              support@site-os.app
            </a>{' '}
            with details. We will investigate and, if a material error is found, either correct
            the audit or issue a refund at our discretion.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">6. No Chargebacks</h2>
          <p className="mt-2">
            To avoid payment disputes, please contact us first using the refund process above
            before filing a chargeback with your credit card company. Chargebacks may result in
            account suspension or termination.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">7. Changes to This Policy</h2>
          <p className="mt-2">
            We may update this Refund Policy at any time. Changes are effective immediately upon
            posting. Your continued use of Site-OS constitutes acceptance of the updated policy.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">8. Contact Us</h2>
          <p className="mt-2">
            If you have questions about this Refund Policy, please contact us at{' '}
            <a
              href="mailto:support@site-os.app?subject=Refund Policy Question"
              className="font-medium text-foreground hover:underline"
            >
              support@site-os.app
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}

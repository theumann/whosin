export const metadata = { title: "Terms of Service — whosIn" };

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-xl px-6 py-12">
      <h1 className="text-2xl font-bold">Terms of Service</h1>
      <p className="mt-1 text-sm text-slate-500">Last updated: June 22, 2026</p>

      <section className="mt-6 space-y-4 text-slate-700">
        <p>
          By signing in to or using the whosIn web app (the &quot;App&quot;) at whosin.team, you
          agree to these Terms of Service (&quot;Terms&quot;). If you don&apos;t agree, don&apos;t
          use the App. We may update these Terms from time to time; we&apos;ll revise the
          &quot;last updated&quot; date above when we do.
        </p>

        <h2 className="text-lg font-semibold text-slate-900">1. Description of the service</h2>
        <p>
          whosIn helps a coach or organizer manage a roster, schedule events, and track
          attendance/confirmations for a sports team or group. It can compose a message for the
          coach to share to the group&apos;s own WhatsApp chat via a &quot;Share to
          WhatsApp&quot; link.
        </p>

        <h2 className="text-lg font-semibold text-slate-900">2. No affiliation with WhatsApp</h2>
        <p>
          whosIn is not affiliated with, endorsed by, or sponsored by WhatsApp or Meta. The
          &quot;Share to WhatsApp&quot; feature only opens a pre-filled message in WhatsApp via a
          standard wa.me link; sending happens entirely through your own WhatsApp account.
        </p>

        <h2 className="text-lg font-semibold text-slate-900">3. Eligibility &amp; accounts</h2>
        <p>
          Coach accounts are intended for adults (18+) responsible for a team or group. You&apos;re
          responsible for the accuracy of information you enter about your players and for having
          any consent required to store it.
        </p>

        <h2 className="text-lg font-semibold text-slate-900">4. Acceptable use</h2>
        <p>You agree not to:</p>
        <ul className="list-disc space-y-1 pl-6">
          <li>Scrape, crawl, or systematically extract data from the App.</li>
          <li>Reverse engineer, decompile, or disassemble any part of the App.</li>
          <li>Attempt to gain unauthorized access to any systems connected to the App.</li>
          <li>Use the App in any way that could damage, disable, or impair its functionality.</li>
        </ul>

        <h2 className="text-lg font-semibold text-slate-900">5. Disclaimer of warranties</h2>
        <p>
          THE APP IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF
          ANY KIND, EXPRESS OR IMPLIED. We don&apos;t guarantee the App will be uninterrupted or
          error-free, or that messages shared via WhatsApp will be delivered or received. You use
          the App at your own risk.
        </p>

        <h2 className="text-lg font-semibold text-slate-900">6. Limitation of liability</h2>
        <p>
          TO THE FULLEST EXTENT PERMITTED BY LAW, WHOSIN AND ITS OPERATORS SHALL NOT BE LIABLE FOR
          ANY INDIRECT, INCIDENTAL, SPECIAL, OR CONSEQUENTIAL DAMAGES ARISING FROM YOUR USE OF, OR
          INABILITY TO USE, THE APP. OUR TOTAL LIABILITY TO YOU FOR ALL CLAIMS SHALL NOT EXCEED
          FIFTY DOLLARS ($50). Some jurisdictions don&apos;t allow these limitations, so they may
          not apply to you.
        </p>

        <h2 className="text-lg font-semibold text-slate-900">7. Changes &amp; termination</h2>
        <p>
          We may modify, suspend, or discontinue the App, or suspend an account that violates
          these Terms, at any time.
        </p>

        <h2 className="text-lg font-semibold text-slate-900">8. Governing law</h2>
        <p>
          These Terms are governed by the laws of the State of California, United States, without
          regard to conflict-of-law rules. Disputes are subject to the exclusive jurisdiction of
          the state and federal courts located in San Francisco County, California.
        </p>

        <h2 className="text-lg font-semibold text-slate-900">9. Contact us</h2>
        <p>
          Questions about these Terms? Email{" "}
          <a className="text-sky-600 underline" href="mailto:contact@whosin.team">
            contact@whosin.team
          </a>
          .
        </p>
      </section>
    </main>
  );
}

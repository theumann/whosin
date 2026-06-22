export const metadata = { title: "Privacy Policy — whosIn" };

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-xl px-6 py-12">
      <h1 className="text-2xl font-bold">Privacy Policy</h1>
      <p className="mt-1 text-sm text-slate-500">Last updated: June 22, 2026</p>

      <section className="mt-6 space-y-4 text-slate-700">
        <p>
          whosIn (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) operates the whosIn web app
          (the &quot;App&quot;) at whosin.team. This Privacy Policy explains what information we
          collect and how we use it.
        </p>

        <h2 className="text-lg font-semibold text-slate-900">Information we collect</h2>
        <p>
          <strong>Coach accounts.</strong> To sign in, a coach provides an email address. We use
          it to send a magic sign-in link and to maintain a session; we don&apos;t require a
          password.
        </p>
        <p>
          <strong>Player and group data.</strong> A coach may enter information about players in
          their group — name, phone number, optional email, and optional notes (such as a skill
          bucket or injury status) — in order to manage rosters, events, and attendance. This data
          is entered and controlled by the coach, not self-registered by players.
        </p>
        <p>
          We do not sell player or coach data, or share it with third parties, except the service
          providers that operate the App itself: our hosting provider (Railway) for the database
          and application servers, and our email provider (Resend) for sending magic-link emails.
        </p>

        <h2 className="text-lg font-semibold text-slate-900">How we use this information</h2>
        <p>
          Solely to operate the App: authenticating coaches, displaying rosters and event status,
          and composing the &quot;Share to WhatsApp&quot; message a coach sends to their own group.
          We do not use this data for advertising.
        </p>

        <h2 className="text-lg font-semibold text-slate-900">Data retention &amp; deletion</h2>
        <p>
          We retain data for as long as the associated group account is active. A coach or a
          player whose information appears in the App may request deletion by emailing{" "}
          <a className="text-sky-600 underline" href="mailto:contact@whosin.team">
            contact@whosin.team
          </a>
          . We currently handle deletion requests manually and will confirm once completed.
        </p>

        <h2 className="text-lg font-semibold text-slate-900">Children&apos;s privacy</h2>
        <p>
          The App itself is not directed at or used directly by children — only coaches (who must
          be adults) hold accounts. A coach may enter a player&apos;s name and contact details as
          part of managing a youth team; coaches are responsible for having any consent required
          to do so under applicable law.
        </p>

        <h2 className="text-lg font-semibold text-slate-900">Changes to this policy</h2>
        <p>
          We may update this Privacy Policy from time to time. We&apos;ll revise the &quot;last
          updated&quot; date above when we do.
        </p>

        <h2 className="text-lg font-semibold text-slate-900">Contact us</h2>
        <p>
          Questions about this policy? Email{" "}
          <a className="text-sky-600 underline" href="mailto:contact@whosin.team">
            contact@whosin.team
          </a>
          .
        </p>
      </section>
    </main>
  );
}

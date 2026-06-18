export default function CheckEmailPage() {
  return (
    <main className="mx-auto max-w-md px-6 py-12">
      <h1 className="text-2xl font-bold">Check your email</h1>
      <p className="text-slate-500">A magic link is on its way. Click it to finish signing in.</p>
      <p className="mt-6 rounded-md border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-700">
        Dev mode: email isn&apos;t sent yet — the login link is printed in the server console (your
        terminal running <code>npm run dev</code>).
      </p>
    </main>
  );
}

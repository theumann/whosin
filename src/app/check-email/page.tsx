export default function CheckEmailPage() {
  return (
    <main style={{ maxWidth: 420, margin: "0 auto", padding: "3rem 1.5rem" }}>
      <h1>Check your email</h1>
      <p style={{ color: "#94a3b8" }}>
        A magic link is on its way. Click it to finish signing in.
      </p>
      <p
        style={{
          marginTop: "1.5rem",
          padding: "0.75rem 0.9rem",
          borderRadius: 6,
          background: "#1e293b",
          color: "#fbbf24",
          fontSize: "0.85rem",
        }}
      >
        Dev mode: email isn&apos;t sent yet — the login link is printed in the
        server console (your terminal running <code>npm run dev</code>).
      </p>
    </main>
  );
}

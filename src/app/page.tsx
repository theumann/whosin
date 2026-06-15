export default function Home() {
  return (
    <main style={{ maxWidth: 640, margin: "0 auto", padding: "2rem 1.5rem" }}>
      <h1 style={{ marginBottom: "0.25rem" }}>my-team</h1>
      <p style={{ color: "#94a3b8", marginTop: 0 }}>
        Rosters, events, and one-tap WhatsApp updates — for the coach.
      </p>
      <p style={{ marginTop: "2rem" }}>
        <a href="/roster" style={{ color: "#60a5fa", fontSize: "1.05rem" }}>
          Manage roster &rarr;
        </a>
      </p>
      <p style={{ marginTop: "0.5rem", color: "#64748b", fontSize: "0.85rem" }}>
        Phase 1: roster &rarr; events &rarr; event status screen &rarr; Send to
        WhatsApp.
      </p>
    </main>
  );
}

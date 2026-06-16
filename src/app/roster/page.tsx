import Link from "next/link";
import { signOut } from "@/auth";
import { getCurrentGroupId } from "@/server/coach";
import { listPlayers } from "@/server/services/roster";
import { PlayerForm } from "@/components/PlayerForm";
import { addPlayerAction, deletePlayerAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function RosterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const groupId = await getCurrentGroupId();
  const players = await listPlayers(groupId);

  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "2rem 1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Link href="/" style={{ color: "#60a5fa", fontSize: "0.85rem" }}>
          &larr; Home
        </Link>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }}
        >
          <button
            type="submit"
            style={{
              background: "none",
              border: "1px solid #334155",
              color: "#94a3b8",
              borderRadius: 6,
              padding: "0.3rem 0.7rem",
              fontSize: "0.8rem",
              cursor: "pointer",
            }}
          >
            Sign out
          </button>
        </form>
      </div>
      <h1 style={{ marginBottom: "0.25rem" }}>Roster</h1>
      <p style={{ color: "#94a3b8", marginTop: 0 }}>
        {players.length} {players.length === 1 ? "player" : "players"}
      </p>

      {error ? (
        <p
          style={{
            background: "#7f1d1d",
            color: "#fecaca",
            padding: "0.6rem 0.8rem",
            borderRadius: 6,
          }}
        >
          {error}
        </p>
      ) : null}

      <section style={{ marginTop: "1.5rem" }}>
        {players.length === 0 ? (
          <p style={{ color: "#64748b" }}>No players yet. Add your first below.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {players.map((p) => (
              <li
                key={p.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "0.75rem",
                  padding: "0.6rem 0",
                  borderBottom: "1px solid #1e293b",
                }}
              >
                <div>
                  <strong>
                    {p.firstName}
                    {p.lastName ? ` ${p.lastName}` : ""}
                  </strong>
                  {p.injured ? (
                    <span style={{ marginLeft: "0.5rem", color: "#fb923c", fontSize: "0.8rem" }}>
                      injured
                    </span>
                  ) : null}
                  <div style={{ color: "#64748b", fontSize: "0.85rem" }}>{p.phone}</div>
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <Link
                    href={`/roster/${p.id}/edit`}
                    style={{ color: "#60a5fa", fontSize: "0.85rem" }}
                  >
                    Edit
                  </Link>
                  <form action={deletePlayerAction.bind(null, p.id)}>
                    <button
                      type="submit"
                      style={{
                        background: "none",
                        border: "none",
                        color: "#f87171",
                        cursor: "pointer",
                        fontSize: "0.85rem",
                        padding: 0,
                      }}
                    >
                      Delete
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section style={{ marginTop: "2rem" }}>
        <h2 style={{ fontSize: "1.1rem" }}>Add a player</h2>
        <PlayerForm action={addPlayerAction} submitLabel="Add player" />
      </section>
    </main>
  );
}

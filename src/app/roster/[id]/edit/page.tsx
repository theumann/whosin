import Link from "next/link";
import { notFound } from "next/navigation";
import { getPlayer } from "@/server/services/roster";
import { PlayerForm } from "@/components/PlayerForm";
import { updatePlayerAction } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditPlayerPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const player = await getPlayer(id);
  if (!player) notFound();

  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "2rem 1.5rem" }}>
      <Link href="/roster" style={{ color: "#60a5fa", fontSize: "0.85rem" }}>
        &larr; Roster
      </Link>
      <h1>
        Edit {player.firstName}
        {player.lastName ? ` ${player.lastName}` : ""}
      </h1>

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

      <PlayerForm
        action={updatePlayerAction.bind(null, player.id)}
        player={player}
        submitLabel="Save changes"
      />
    </main>
  );
}

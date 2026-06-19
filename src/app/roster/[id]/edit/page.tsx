import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getPlayer } from "@/server/services/roster";
import { getCurrentGroupId } from "@/server/coach";
import { PlayerForm } from "@/components/PlayerForm";
import { updatePlayerAction } from "../../actions";
import { errorBanner, linkAccent } from "@/lib/ui";

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
  const groupId = await getCurrentGroupId();
  const player = await getPlayer(groupId, id);
  if (!player) notFound();

  return (
    <main className="mx-auto max-w-2xl px-6 py-8">
      <Link href="/roster" className={`inline-flex items-center gap-1 text-sm ${linkAccent}`}>
        <ArrowLeft size={16} /> Roster
      </Link>
      <h1 className="text-2xl font-bold">
        Edit {player.firstName}
        {player.lastName ? ` ${player.lastName}` : ""}
      </h1>

      {error ? <p className={`${errorBanner} mb-4`}>{error}</p> : null}

      <PlayerForm
        action={updatePlayerAction.bind(null, player.id)}
        player={player}
        submitLabel="Save changes"
      />
    </main>
  );
}

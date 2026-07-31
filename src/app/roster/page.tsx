import Image from "next/image";
import Link from "next/link";
import { LogOut, Pencil } from "lucide-react";
import { signOut } from "@/auth";
import { getCurrentGroupId } from "@/server/coach";
import { listPlayers } from "@/server/services/roster";
import { AddPlayerModal } from "./AddPlayerModal";
import { DeletePlayerButton } from "./DeletePlayerButton";
import { btnSecondary, errorBanner, linkAccent } from "@/lib/ui";

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
    <main className="mx-auto max-w-2xl px-6 py-8">
      <div className="flex items-center justify-between">
        <Link href="/" aria-label="Home">
          <Image src="/logo.png" alt="whosIn" width={120} height={40} priority />
        </Link>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }}
        >
          <button type="submit" className={`${btnSecondary} px-2.5 py-1 text-xs`}>
            <LogOut size={14} /> Sign out
          </button>
        </form>
      </div>
      <h1 className="mb-1 mt-4 text-[22px] font-bold">Roster</h1>
      <p className="mt-0 text-slate-500">
        {players.length} {players.length === 1 ? "player" : "players"}
        {" · "}
        <Link href="/events" className={linkAccent}>
          Events
        </Link>
      </p>

      {error ? <p className={`${errorBanner} mt-4`}>{error}</p> : null}

      <div className="mt-6 flex justify-end">
        <AddPlayerModal />
      </div>

      <section className="mt-3">
        {players.length === 0 ? (
          <p className="text-slate-400">No players yet. Add your first with the button above.</p>
        ) : (
          <ul className="m-0 list-none p-0">
            {players.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between gap-3 border-b border-slate-200 py-2.5"
              >
                <div>
                  <strong>
                    {p.firstName}
                    {p.lastName ? ` ${p.lastName}` : ""}
                  </strong>
                  {p.injured ? <span className="ml-2 text-sm text-orange-600">injured</span> : null}
                  {p.phone ? <div className="text-sm text-slate-400">{p.phone}</div> : null}
                </div>
                <div className="flex items-center gap-3">
                  <Link
                    href={`/roster/${p.id}/edit`}
                    className={`inline-flex items-center gap-1 text-sm ${linkAccent}`}
                  >
                    <Pencil size={14} /> Edit
                  </Link>
                  <DeletePlayerButton
                    id={p.id}
                    name={[p.firstName, p.lastName].filter(Boolean).join(" ")}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

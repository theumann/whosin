import Link from "next/link";
import { linkAccent } from "@/lib/ui";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-md px-6 py-12">
      <h1 className="text-[22px] font-bold">Page not found</h1>
      <p className="mt-1 text-slate-500">
        That page doesn&apos;t exist, or you may not have access to it.
      </p>
      <Link href="/" className={`${linkAccent} mt-4 inline-block`}>
        Back home
      </Link>
    </main>
  );
}

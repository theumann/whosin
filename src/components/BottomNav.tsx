"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, House, Users } from "lucide-react";

const ITEMS = [
  { href: "/", label: "Home", icon: House, match: (p: string) => p === "/" },
  {
    href: "/events",
    label: "Events",
    icon: CalendarDays,
    match: (p: string) => p.startsWith("/events"),
  },
  { href: "/roster", label: "Roster", icon: Users, match: (p: string) => p.startsWith("/roster") },
];

// Hidden on auth screens — there's nothing to navigate to yet, and the coach
// isn't signed in. Bottom-fixed everywhere else since usage is mobile-first.
const HIDDEN_PREFIXES = ["/login", "/check-email"];

export function BottomNav() {
  const pathname = usePathname();
  if (HIDDEN_PREFIXES.some((p) => pathname.startsWith(p))) return null;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] shadow-[0_-1px_4px_rgba(0,0,0,0.04)]">
      <div className="mx-auto flex max-w-2xl items-stretch justify-around">
        {ITEMS.map(({ href, label, icon: Icon, match }) => {
          const active = match(pathname);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs transition-colors ${
                active ? "text-indigo-600" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <Icon size={22} strokeWidth={active ? 2.5 : 2} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

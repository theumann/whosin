import type { Squad } from "@prisma/client";

// Single source of truth for "what color is Team A/B" — used both for the UI
// (status page badges/borders) and the WhatsApp message (closest matching
// colored-circle emoji, since text messages can't carry hex colors). Change
// both together so the two stay in sync.
export const SQUAD_COLORS: Record<Squad, string> = { A: "#0284c7", B: "#9333ea" };
export const SQUAD_EMOJI: Record<Squad, string> = { A: "🔵", B: "🟣" };

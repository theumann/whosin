import type { Squad } from "@prisma/client";

// Single source of truth for "what color is Team A/B" — used both for the UI
// (status page badges/borders) and the WhatsApp message (closest matching
// colored-circle emoji, since text messages can't carry hex colors). Change
// both together so the two stay in sync.
//
// The palette is constrained by emoji availability, not taste: every colored
// circle except red, blue, black and white was added in Emoji 12.0 (2019) and
// renders as tofu on older Android. That rules out purple/orange/green here —
// pick a hex to match one of the four safe circles, not the other way round.
export const SQUAD_COLORS: Record<Squad, string> = { A: "#0284c7", B: "#dc2626" };
export const SQUAD_EMOJI: Record<Squad, string> = { A: "🔵", B: "🔴" };

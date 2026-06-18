import type { EntryStatus } from "@prisma/client";

// In-app labels for entry statuses. DEFAULT shows as "Pending Answer" and is
// hidden from published WhatsApp lists. Single source of truth for UI + later
// the WhatsApp message composer.
export const STATUS_LABELS: Record<EntryStatus, string> = {
  IN: "In",
  WAITLIST: "Wait List",
  INJURY: "Injury Reserve",
  DEFAULT: "Pending Answer",
};

// Order statuses are displayed / cycled in.
export const STATUS_ORDER: EntryStatus[] = ["IN", "WAITLIST", "INJURY", "DEFAULT"];

export const STATUS_COLORS: Record<EntryStatus, string> = {
  IN: "#059669",
  WAITLIST: "#d97706",
  INJURY: "#ea580c",
  DEFAULT: "#64748b",
};

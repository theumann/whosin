// Sign-in allowlist. v1 is invite-only: only addresses listed in ALLOWED_EMAILS
// may request a magic link. This is what stops /login from being an open email
// relay — without it, anyone can make the app send mail to any address, which
// burns the Resend quota and the sending domain's reputation.

export function parseAllowlist(raw: string | undefined): string[] {
  return (raw ?? "")
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
}

// Fails CLOSED in production: an unset allowlist there means the env var was
// forgotten, and opening signup to the world is the worse failure. Locally an
// empty list stays open so dev doesn't need configuring.
export function isEmailAllowed(
  email: string | null | undefined,
  allowlist: string[],
  isProduction: boolean,
): boolean {
  const normalized = email?.trim().toLowerCase();
  if (!normalized) return false;
  if (allowlist.length === 0) return !isProduction;
  return allowlist.includes(normalized);
}

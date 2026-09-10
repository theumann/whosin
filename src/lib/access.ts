// Request-access mailto link. Sign-up is invite-only (see src/lib/allowlist.ts),
// so someone who isn't on the list needs a way to ask. A mailto: is deliberate:
// the request never touches our server, so there is no endpoint that can be made
// to send mail to an address someone else typed.

export const ACCESS_EMAIL = "access@whosin.team";

const SUBJECT = "whosIn access request";

const BODY = [
  "Hi! I'd like access to whosIn.",
  "",
  "Email to allow:",
  "Name:",
  "Group / team:",
].join("\n");

// encodeURIComponent (not encodeURI) so newlines, spaces and & survive intact —
// same reasoning as the WhatsApp links in messages.ts.
export function accessRequestMailto(email = ACCESS_EMAIL): string {
  const subject = encodeURIComponent(SUBJECT);
  const body = encodeURIComponent(BODY);
  return `mailto:${email}?subject=${subject}&body=${body}`;
}

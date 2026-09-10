import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Nodemailer from "next-auth/providers/nodemailer";
import { db } from "@/lib/db";
import { isRateLimited } from "@/lib/rateLimit";
import { isEmailAllowed, parseAllowlist } from "@/lib/allowlist";

// Magic-link auth for the coach. Real email goes through Resend's HTTP API
// (plain HTTPS — Railway blocks outbound SMTP ports) when RESEND_API_KEY is
// set. Without it (local dev), the login link is just logged to the server
// console instead of actually being sent.

// Invite-only in v1 — see src/lib/allowlist.ts for why this gate exists.
const allowlist = parseAllowlist(process.env.ALLOWED_EMAILS);
const isProduction = process.env.NODE_ENV === "production";

const resendApiKey = process.env.RESEND_API_KEY;
const from = process.env.EMAIL_FROM ?? "whosin <login@whosin.local>";

async function sendViaResend(to: string, url: string) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      subject: "Sign in to whosin",
      html: `<p>Click below to sign in to whosin:</p><p><a href="${url}">${url}</a></p>`,
    }),
  });
  if (!res.ok) {
    throw new Error(`Resend API error ${res.status}: ${await res.text()}`);
  }
}

// In-memory per-process cooldown — fine for a single Railway instance; would
// need a shared store (e.g. Redis) if the app ever scales to multiple
// instances.
const MAGIC_LINK_COOLDOWN_MS = 60_000;
const lastSentAt = new Map<string, number>();

function logToConsole(identifier: string, url: string) {
  console.log(
    `\n================ MAGIC LOGIN LINK ================\n` +
      `to:  ${identifier}\n${url}\n` +
      `=================================================\n`,
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: "database" },
  trustHost: true,
  pages: {
    signIn: "/login",
    verifyRequest: "/check-email",
  },
  callbacks: {
    // Runs before the magic link is sent, so a non-allowlisted address never
    // triggers an email and never gets a User row created for it.
    signIn({ user }) {
      if (isEmailAllowed(user?.email, allowlist, isProduction)) return true;
      console.log("Blocked sign-in attempt for a non-allowlisted address.");
      return false;
    },
  },
  providers: [
    Nodemailer({
      from,
      // Unused — sendVerificationRequest below bypasses SMTP entirely.
      server: { host: "", port: 0 },
      async sendVerificationRequest({ identifier, url }) {
        const now = Date.now();
        if (isRateLimited(lastSentAt.get(identifier), now, MAGIC_LINK_COOLDOWN_MS)) {
          console.log(`Rate-limited magic-link request for ${identifier}, skipping send.`);
          return;
        }
        lastSentAt.set(identifier, now);

        if (resendApiKey) {
          await sendViaResend(identifier, url);
        } else {
          logToConsole(identifier, url);
        }
      },
    }),
  ],
});

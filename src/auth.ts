import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Nodemailer from "next-auth/providers/nodemailer";
import { db } from "@/lib/db";

// Magic-link auth for the coach. Real email goes through Resend's HTTP API
// (plain HTTPS — Railway blocks outbound SMTP ports) when RESEND_API_KEY is
// set. Without it (local dev), the login link is just logged to the server
// console instead of actually being sent.
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
  providers: [
    Nodemailer({
      from,
      // Unused — sendVerificationRequest below bypasses SMTP entirely.
      server: { host: "", port: 0 },
      async sendVerificationRequest({ identifier, url }) {
        if (resendApiKey) {
          await sendViaResend(identifier, url);
        } else {
          logToConsole(identifier, url);
        }
      },
    }),
  ],
});

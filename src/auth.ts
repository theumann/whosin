import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Nodemailer from "next-auth/providers/nodemailer";
import { db } from "@/lib/db";

// Magic-link auth for the coach. Real SMTP transport (e.g. Resend) is used when
// EMAIL_SERVER_HOST is set. Without it (local dev), the login link is just
// logged to the server console instead of actually being sent.
const emailServerHost = process.env.EMAIL_SERVER_HOST;
const from = process.env.EMAIL_FROM ?? "whosin <login@whosin.local>";

const emailOptions = emailServerHost
  ? {
      server: {
        host: emailServerHost,
        port: Number(process.env.EMAIL_SERVER_PORT ?? 587),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from,
    }
  : {
      server: { host: "localhost", port: 1025 },
      from,
      async sendVerificationRequest({ identifier, url }: { identifier: string; url: string }) {
        console.log(
          `\n================ MAGIC LOGIN LINK ================\n` +
            `to:  ${identifier}\n${url}\n` +
            `=================================================\n`,
        );
      },
    };

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: "database" },
  trustHost: true,
  pages: {
    signIn: "/login",
    verifyRequest: "/check-email",
  },
  providers: [Nodemailer(emailOptions)],
});

import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Nodemailer from "next-auth/providers/nodemailer";
import { db } from "@/lib/db";

// Magic-link auth for the coach. In dev we don't send real email — the login
// link is logged to the server console (see sendVerificationRequest). Swap in a
// real transport (e.g. Resend SMTP) before launch by removing the override and
// configuring `server` + EMAIL_FROM.
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
      // Unused in dev because sendVerificationRequest is overridden below.
      server: { host: "localhost", port: 1025 },
      from: process.env.EMAIL_FROM ?? "my-team <login@my-team.local>",
      async sendVerificationRequest({ identifier, url }) {
        console.log(
          `\n================ MAGIC LOGIN LINK ================\n` +
            `to:  ${identifier}\n${url}\n` +
            `=================================================\n`,
        );
      },
    }),
  ],
});

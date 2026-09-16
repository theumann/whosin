import Image from "next/image";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { accessRequestMailto, ACCESS_EMAIL } from "@/lib/access";
import { btnPrimary, errorBanner, fieldClass, linkAccent } from "@/lib/ui";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const accessDenied = error === "AccessDenied";

  return (
    <main className="mx-auto max-w-md px-6 py-12">
      <div className="mb-6 flex justify-center">
        <Image src="/logo.png" alt="whosIn" width={144} height={48} priority />
      </div>
      <h1 className="mb-1 text-[22px] font-bold">Sign in</h1>
      <p className="mt-0 text-slate-500">Enter your email and we&apos;ll send you a magic link.</p>

      {accessDenied ? (
        <div className={`${errorBanner} mt-4`}>
          <p className="m-0 font-semibold">whosIn is invite-only right now.</p>
          <p className="mt-1 mb-0">
            That address isn&apos;t on the list yet.{" "}
            <a className={linkAccent} href={accessRequestMailto()}>
              Request access
            </a>{" "}
            and we&apos;ll get you set up — or email{" "}
            <span className="font-medium select-all">{ACCESS_EMAIL}</span> directly.
          </p>
        </div>
      ) : error ? (
        <p className={`${errorBanner} mt-4`}>Something went wrong. Please try again.</p>
      ) : null}

      <form
        action={async (formData) => {
          "use server";
          try {
            await signIn("nodemailer", {
              email: String(formData.get("email") ?? ""),
              redirectTo: "/",
            });
          } catch (err) {
            // signIn signals success by throwing NEXT_REDIRECT, so only Auth.js
            // errors are ours to handle — everything else must propagate.
            if (err instanceof AuthError) {
              // A non-allowlisted address is an expected outcome, not a crash:
              // handle it here so it never reaches the error boundary, which
              // would show a generic "something went wrong" page and file the
              // rejection with Sentry.
              redirect(`/login?error=${err.type === "AccessDenied" ? "AccessDenied" : "Default"}`);
            }
            throw err;
          }
        }}
        className="mt-4"
      >
        <label className="block text-sm text-slate-600">
          Email
          <input
            name="email"
            type="email"
            required
            placeholder="coach@example.com"
            className={`${fieldClass} mt-1`}
          />
        </label>
        <button type="submit" className={`${btnPrimary} mt-4 w-full`}>
          Send magic link
        </button>
      </form>

      {accessDenied ? null : (
        <p className="mt-4 text-sm text-slate-500">
          whosIn is invite-only right now.{" "}
          <a className={linkAccent} href={accessRequestMailto()}>
            Request access
          </a>
        </p>
      )}

      <p className="mt-8 text-xs text-slate-400">
        By signing in, you agree to our{" "}
        <a className="underline" href="/terms">
          Terms
        </a>{" "}
        and{" "}
        <a className="underline" href="/privacy">
          Privacy Policy
        </a>
        .
      </p>
    </main>
  );
}

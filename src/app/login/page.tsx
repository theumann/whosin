import Image from "next/image";
import { signIn } from "@/auth";
import { btnPrimary, errorBanner, fieldClass } from "@/lib/ui";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="mx-auto max-w-md px-6 py-12">
      <div className="mb-6 flex justify-center">
        <Image src="/logo.png" alt="whosIn" width={144} height={48} priority />
      </div>
      <h1 className="mb-1 text-[22px] font-bold">Sign in</h1>
      <p className="mt-0 text-slate-500">Enter your email and we&apos;ll send you a magic link.</p>

      {error ? (
        <p className={`${errorBanner} mt-4`}>Something went wrong. Please try again.</p>
      ) : null}

      <form
        action={async (formData) => {
          "use server";
          await signIn("nodemailer", {
            email: String(formData.get("email") ?? ""),
            redirectTo: "/",
          });
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

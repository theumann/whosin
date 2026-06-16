import { signIn } from "@/auth";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main style={{ maxWidth: 420, margin: "0 auto", padding: "3rem 1.5rem" }}>
      <h1 style={{ marginBottom: "0.25rem" }}>Sign in</h1>
      <p style={{ color: "#94a3b8", marginTop: 0 }}>
        Enter your email and we&apos;ll send you a magic link.
      </p>

      {error ? (
        <p
          style={{
            background: "#7f1d1d",
            color: "#fecaca",
            padding: "0.6rem 0.8rem",
            borderRadius: 6,
          }}
        >
          Something went wrong. Please try again.
        </p>
      ) : null}

      <form
        action={async (formData) => {
          "use server";
          await signIn("nodemailer", {
            email: String(formData.get("email") ?? ""),
            redirectTo: "/roster",
          });
        }}
      >
        <label style={{ display: "block", color: "#cbd5e1", fontSize: "0.85rem" }}>
          Email
          <input
            name="email"
            type="email"
            required
            placeholder="coach@example.com"
            style={{
              display: "block",
              width: "100%",
              boxSizing: "border-box",
              padding: "0.55rem 0.6rem",
              marginTop: "0.25rem",
              borderRadius: 6,
              border: "1px solid #334155",
              background: "#0b1220",
              color: "#e2e8f0",
              fontSize: "0.95rem",
            }}
          />
        </label>
        <button
          type="submit"
          style={{
            marginTop: "1rem",
            width: "100%",
            padding: "0.6rem 1.1rem",
            borderRadius: 6,
            border: "none",
            background: "#2563eb",
            color: "white",
            fontSize: "0.95rem",
            cursor: "pointer",
          }}
        >
          Send magic link
        </button>
      </form>
    </main>
  );
}

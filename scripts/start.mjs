// Production entry point (`npm start`). Runs the standalone server in THIS
// process — no `next start`, which loads far more of Next at boot (~55 MB of
// idle memory, measured), and no extra process alongside Node.
//
// The standalone server binds to $HOSTNAME. Containers set HOSTNAME to the
// container's own name, which resolves to a single interface, so the server
// can end up unreachable from Railway's proxy. Bind to all interfaces instead.
//
// Migrations are NOT run here: `prisma migrate deploy` is Railway's pre-deploy
// command (`npm run db:deploy`), so it runs once before each deploy.
process.env.HOSTNAME = "0.0.0.0";

await import("../.next/standalone/server.js");

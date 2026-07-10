/**
 * Auth abstraction — swap providers by setting AUTH_PROVIDER in .env.
 *
 * Supported providers:
 *   none  (default) — no authentication, all routes are public
 *   cas             — CAS (Central Authentication Service) SSO
 *
 * Each provider exports:
 *   requireAuth  middleware — redirect unauthenticated users to login
 *   getUser(req) helper    — returns the current user object or null
 *   router       (optional) — Express Router mounting /login (and /logout if applicable)
 */

const AUTH_PROVIDER = process.env.AUTH_PROVIDER || "none";

let provider;

if (AUTH_PROVIDER === "cas") {
  provider = (await import("./cas.js")).default;
} else {
  provider = (await import("./none.js")).default;
}

export const requireAuth = provider.requireAuth;
export const getUser = provider.getUser;

/** Mount on /login in app.js if your provider needs a login route. */
export const authRouter = provider.router ?? null;

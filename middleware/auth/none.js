/**
 * No-op auth provider — all routes are public.
 * Swap this for cas.js (or your own provider) via AUTH_PROVIDER env var.
 */
export default {
  requireAuth: (req, res, next) => next(),
  getUser: (req) => req.session?.user ?? null,
  router: null,
};

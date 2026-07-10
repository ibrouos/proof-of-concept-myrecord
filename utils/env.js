/**
 * Validate required environment variables at startup.
 * Throws with a clear message if any are missing — fail fast, fail loud.
 *
 * Usage in server.js:
 *   requireEnv("SESSION_SECRET", "CSRF_SECRET");
 *
 * @param {...string} keys
 */
export function requireEnv(...keys) {
  const missing = keys.filter((k) => !process.env[k]);
  if (missing.length) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}\n` +
        `Check your .env file against .env.example`
    );
  }
}

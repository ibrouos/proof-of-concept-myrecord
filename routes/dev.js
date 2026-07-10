/**
 * Dev-only routes for simulating a CAS session without going through the
 * real SSO flow. Mounted at /dev — never exposed in production.
 *
 * GET  /dev/login       — show login form with current session state
 * POST /dev/login       — set a fake CAS session
 * POST /dev/logout      — destroy the session
 */
import { Router } from "express";
import logger from "../utils/logger.js";

const router = Router();

router.get("/login", (req, res) => {
  res.render("dev/login", {
    title: "Dev login",
    casSession: req.session.cas ?? null,
  });
});

router.post("/login", (req, res) => {
  const username = req.body.username?.trim();

  if (!username) {
    req.flash("error", "Username is required.");
    return res.redirect("/dev/login");
  }

  // Mirror the session shape that connect-cas sets so that
  // getUser() in middleware/auth/cas.js works without modification.
  req.session.cas = {
    user: username,
    attributes: {
      // Add any CAS attributes your app relies on here.
      // Values are arrays — that's how connect-cas returns them.
      shefPersonCode: [req.body.shefPersonCode?.trim() || ""],
      employeeType: [req.body.employeeType?.trim() || "student"],
    },
  };

  logger.info({ user: username }, "Dev CAS session created");
  req.flash("success", `Signed in as ${username}`);
  res.redirect("/");
});

router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    logger.info("Dev session destroyed");
    res.redirect("/dev/login");
  });
});

export default router;

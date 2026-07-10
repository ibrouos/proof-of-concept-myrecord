import { Router } from "express";
import { scenarios, currentScenarioKey } from "../utils/scenarios.js";

const router = Router();

// The demo scenario (?view=<key>) is handled globally in app.js so the corner
// switcher works from any page; here we just render whichever state is active.
router.get("/", (req, res) => {
  res.render("dashboard", { title: "Home", dash: scenarios[currentScenarioKey(req)] });
});

router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});

export default router;

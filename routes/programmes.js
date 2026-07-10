import { Router } from "express";
import data from "../data/programme-modules.json" with { type: "json" };

const router = Router();

router.get("/", (req, res) => {
  res.render("programmes", { title: "Programmes and modules", data });
});

// --- Module change requests (PRG + flash, no persistence yet) --------------

router.post("/add", (req, res) => {
  const module = data.availableModules.find((m) => m.code === req.body.module);
  if (!module) {
    req.flash("error", "That module is not available to add.");
    return res.redirect("/programmes-and-modules");
  }
  req.flash(
    "success",
    `Request to add ${module.code} ${module.title} submitted. Your department will review it, usually within 5 working days.`
  );
  res.redirect("/programmes-and-modules");
});

router.post("/drop", (req, res) => {
  const module = data.enrolledModules.find((m) => m.code === req.body.module);
  if (!module || module.type === "Core") {
    req.flash("error", "That module cannot be dropped. Core modules are a required part of your programme.");
    return res.redirect("/programmes-and-modules");
  }
  req.flash(
    "success",
    `Request to drop ${module.code} ${module.title} submitted. The module stays on your record until your department confirms the change.`
  );
  res.redirect("/programmes-and-modules");
});

router.post("/cancel", (req, res) => {
  const module = data.enrolledModules.find(
    (m) => m.code === req.body.module && m.status === "Pending approval"
  );
  if (!module) {
    req.flash("error", "There is no pending request for that module.");
    return res.redirect("/programmes-and-modules");
  }
  req.flash("success", `Add request for ${module.code} ${module.title} cancelled.`);
  res.redirect("/programmes-and-modules");
});

export default router;

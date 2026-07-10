import { Router } from "express";
import { getUser } from "../middleware/auth/index.js";

const router = Router();

router.get("/cas", (req, res) => {
  res.render("debug-cas", {
    title: "CAS Debug",
    user: getUser(req),
    cas: req.session?.cas ?? null,
  });
});

export default router;

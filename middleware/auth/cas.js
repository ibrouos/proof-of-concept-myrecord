/**
 * CAS (Central Authentication Service) auth provider.
 *
 * Setup:
 *   1. npm install connect-cas
 *   2. Set in .env:
 *        AUTH_PROVIDER=cas
 *        CAS_HOST=cas-qa1.shef.ac.uk
 *        CAS_PORT=8443
 *        BASE_URL=https://yourapp.example.com
 *
 * The `requireAuth` middleware checks for an active CAS session and
 * redirects unauthenticated users to /login.
 *
 * `getUser` returns { username, attributes } from the CAS session.
 * CAS attributes vary by server config — adjust as needed.
 */
import { createRequire } from "node:module";
import { Router } from "express";
import logger from "../../utils/logger.js";

const require = createRequire(import.meta.url);
const cas = require("connect-cas");

cas.configure({
  host: process.env.CAS_HOST,
  port: process.env.CAS_PORT ? parseInt(process.env.CAS_PORT, 10) : 443,
  servicePrefix: process.env.BASE_URL,
  loginUrl: "/cas/login",
  validateUrl: "/cas/serviceValidate",
});

const router = Router();

router.get("/", cas.serviceValidate(), cas.authenticate(), (req, res) => {
  logger.info({ user: req.session?.cas?.user }, "CAS login successful");
  res.redirect("/");
});

export default {
  requireAuth: (req, res, next) => {
    if (!req.session?.cas) {
      logger.warn({ url: req.url }, "Unauthenticated request, redirecting to /login");
      return res.redirect("/login");
    }
    next();
  },

  getUser: (req) => {
    if (!req.session?.cas) return null;
    return {
      username: req.session.cas.user,
      attributes: req.session.cas.attributes ?? {},
    };
  },

  router,
};

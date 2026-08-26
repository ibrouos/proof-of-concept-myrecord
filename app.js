import "dotenv/config";
import express from "express";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import session from "express-session";
import flash from "connect-flash";
import { doubleCsrf } from "csrf-csrf";
import { Eta } from "eta";
import rateLimit from "express-rate-limit";
import pinoHttp from "pino-http";
import path from "node:path";
import { fileURLToPath } from "node:url";

import logger from "./utils/logger.js";
import { scenarios, currentScenarioKey } from "./utils/scenarios.js";
import { navForScenario } from "./utils/nav.js";
import redirectMiddleware from "./middleware/redirect.js";
import { getUser, authRouter } from "./middleware/auth/index.js";
import indexRouter from "./routes/index.js";
import myrecordRouter from "./routes/myrecord.js";
import programmesRouter from "./routes/programmes.js";
import sectionsRouter from "./routes/sections.js";
import debugRouter from "./routes/debug.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

// Security headers — set before any other middleware
app.use(helmet({ contentSecurityPolicy: false }));

// View engine (Eta v3)
// Eta's renderAsync takes a template name relative to the views directory.
// Express passes the full absolute path, so we convert it before handing off.
const viewsDir = path.join(__dirname, "views");
const eta = new Eta({
  views: viewsDir,
  cache: process.env.NODE_ENV === "production",
});

app.engine("eta", async (filePath, data, cb) => {
  try {
    const templateName = path.relative(viewsDir, filePath);
    const html = await eta.renderAsync(templateName, data);
    cb(null, html);
  } catch (err) {
    cb(err);
  }
});
app.set("view engine", "eta");
app.set("views", viewsDir);

// Trust exactly one proxy hop (the load balancer / reverse proxy).
// Use `true` only if you genuinely trust all upstream proxies.
app.set("trust proxy", 1);

// Cookies — required by csrf-csrf
app.use(cookieParser());

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Rate limiting — production only. Local dev hammers the server (reloads,
// static assets, hot iteration) and a limiter just gets in the way.
if (process.env.NODE_ENV === "production") {
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      limit: 200,
      standardHeaders: "draft-7",
      legacyHeaders: false,
    })
  );
}

// Sessions
// NOTE: MemoryStore leaks in production. Replace with connect-redis or similar.
app.use(
  session({
    name: process.env.SESSION_NAME || "app.sid",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 20 * 60 * 1000,
    },
  })
);

// CSRF (double-submit cookie pattern — replaces deprecated csurf)
const { doubleCsrfProtection, generateToken } = doubleCsrf({
  getSecret: () => process.env.CSRF_SECRET,
  cookieName: process.env.NODE_ENV === "production" ? "__Host-csrf" : "csrf",
  cookieOptions: {
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
  },
  // Read token from form body first, then fall back to the x-csrf-token header for API clients.
  getTokenFromRequest: (req) => req.body?._csrf ?? req.headers["x-csrf-token"],
});
app.use(doubleCsrfProtection);

// Flash messages
app.use(flash());

// HTTP request logging
app.use(pinoHttp({ logger }));

// Static assets
app.use(express.static(path.join(__dirname, "public")));

// Prepends BASE_URL to relative res.redirect() calls.
// Required when running behind a path prefix or for CAS service URL validation.
app.use(redirectMiddleware);

// Template locals available in every view
app.use((req, res, next) => {
  // Demo scenario — ?view=<key> switches the dashboard lifecycle state and
  // persists in the session; the corner switcher widget reads these locals.
  if (req.query.view && scenarios[req.query.view] && req.session) {
    req.session.scenario = req.query.view;
  }
  res.locals.scenarioKey = currentScenarioKey(req);
  res.locals.scenarioOptions = Object.entries(scenarios).map(([key, s]) => ({
    key,
    label: s.label,
  }));
  // Sidebar derives from the scenario too — each state declares its nav.
  res.locals.navItems = navForScenario(scenarios[res.locals.scenarioKey]);
  res.locals.appName = process.env.APP_NAME || "myRecord";
  res.locals.isProduction = process.env.NODE_ENV === "production";
  res.locals.copyrightYear = new Date().getFullYear();
  res.locals.csrfToken = generateToken(req, res, true);
  res.locals.flash = req.flash();
  res.locals.user = getUser(req);
  res.locals.path = req.path;
  next();
});

// Auth router — mounts /login (and /logout if the provider supports it)
if (authRouter) {
  app.use("/login", authRouter);
}

// Routes
app.use("/debug", debugRouter);
app.use("/myrecord", myrecordRouter);
app.use("/programmes-and-modules", programmesRouter);
app.use("/", sectionsRouter);
app.use("/", indexRouter);

// Dev-only: fake CAS login for local testing — never mounted in production
if (process.env.NODE_ENV !== "production") {
  const { default: devRouter } = await import("./routes/dev.js");
  app.use("/dev", devRouter);
}

// 404
app.use((req, res, next) => {
  next(Object.assign(new Error("Not Found"), { status: 404 }));
});

// CSRF error — redirect home rather than showing a raw 403
app.use((err, req, res, next) => {
  if (err.code !== "EBADCSRFTOKEN") return next(err);
  logger.warn("Invalid or expired CSRF token");
  res.redirect(303, "/");
});

// Error handler
app.use((err, req, res, next) => {
  logger.error(err);
  const status = err.status || 500;
  res.status(status).render("error", {
    title: "Error",
    message:
      process.env.NODE_ENV === "production"
        ? "Something went wrong. Please try again."
        : err.message,
    error: process.env.NODE_ENV !== "production" ? err : {},
  });
});

export default app;

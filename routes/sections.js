import { Router } from "express";
import timetable from "../data/timetable.json" with { type: "json" };
import usefulLinks from "../data/useful-links.json" with { type: "json" };
import preRegistrationTasks from "../data/pre-registration-tasks.json" with { type: "json" };
import registrationTasks from "../data/registration-tasks.json" with { type: "json" };

const router = Router();

// Top-level sidebar sections (other than Personal information, which has its own router).
const sections = [
  { slug: "exams-and-myresults", title: "Exams & MyResults" },
  { slug: "fees-and-finance", title: "Fees & finance" },
  { slug: "your-offer", title: "Your offer" },
  { slug: "accommodation", title: "Accommodation" },
  { slug: "getting-started", title: "Getting started" },
  { slug: "ucard-photo", title: "UCARD photo" },
];

// MyTimetable renders a mock weekly grid from data/timetable.json (the real
// CMISGo service can't be iframed — its CAS login sends X-Frame-Options: DENY).
// The live service stays reachable via an open-in-new-tab link.
const TIMETABLE_URL = "https://cmisgostudents.shef.ac.uk/CMISGo/Web/Timetable";

// Week navigation is dummied: timetable.json holds the sample week (week 3 of
// a 12-week autumn semester, Monday 12 October 2026); other weeks are derived
// from it — dates shifted, plus small deterministic tweaks so weeks don't look
// identical (problem classes run odd weeks, practicals swap rooms on even
// weeks, and week 6 is a teaching-free reading week).
const BASE_WEEK = 3;
const TOTAL_WEEKS = 12;
const READING_WEEK = 6;
const BASE_MONDAY_UTC = Date.UTC(2026, 9, 12);
const DAY_MS = 24 * 60 * 60 * 1000;

function timetableForWeek(week) {
  const fmt = (d, opts) => d.toLocaleDateString("en-GB", { timeZone: "UTC", ...opts });
  const monday = new Date(BASE_MONDAY_UTC + (week - BASE_WEEK) * 7 * DAY_MS);
  const friday = new Date(monday.getTime() + 4 * DAY_MS);

  const days = timetable.days.map((day, i) => ({
    name: day.name,
    date: fmt(new Date(monday.getTime() + i * DAY_MS), { day: "numeric", month: "long", year: "numeric" }),
  }));

  let events = timetable.events;
  if (week === READING_WEEK) {
    events = [];
  } else if (week !== BASE_WEEK) {
    events = timetable.events
      .filter((e) => !(e.type === "Problem class" && week % 2 === 0))
      .map((e) =>
        e.type === "Practical" && week % 2 === 0
          ? { ...e, location: e.location.replace(/CR-\d/, "CR-4") }
          : e
      );
  }

  return {
    ...timetable,
    days,
    events,
    week: {
      range: `${fmt(monday, { day: "numeric", month: "long" })} – ${fmt(friday, { day: "numeric", month: "long", year: "numeric" })}`,
      term: `Autumn semester · Week ${week}${week === READING_WEEK ? " — reading week" : ""}`,
    },
  };
}

router.get("/mytimetable", (req, res) => {
  const requested = parseInt(req.query.week, 10);
  const week = Number.isInteger(requested) ? Math.min(TOTAL_WEEKS, Math.max(1, requested)) : BASE_WEEK;
  res.render("mytimetable", {
    title: "MyTimetable",
    timetable: timetableForWeek(week),
    timetableUrl: TIMETABLE_URL,
    week,
    baseWeek: BASE_WEEK,
    totalWeeks: TOTAL_WEEKS,
  });
});

// All Services — MUSE-style A-Z of services: letter index, lettered groups,
// and a client-side text filter (progressive enhancement; the plain list
// works without JS). Grouping happens here so the template stays dumb.
router.get("/useful-links", (req, res) => {
  const sorted = [...usefulLinks].sort((a, b) =>
    a.name.localeCompare(b.name, "en", { sensitivity: "base" })
  );
  const groups = [];
  for (const link of sorted) {
    const letter = link.name[0].toUpperCase();
    const current = groups[groups.length - 1];
    if (current && current.letter === letter) current.links.push(link);
    else groups.push({ letter, links: [link] });
  }
  res.render("useful-links", { title: "All Services", groups });
});

// Pre-registration tasks — the checklist an offer holder works through once
// their place is confirmed, before they can complete Online Registration.
// Scoped to the New UG – Home persona for now; the real system varies this
// list by applicant type (Intl/PG/exchange/returning), which isn't modelled
// here yet.
router.get("/pre-registration-tasks", (req, res) => {
  res.render("pre-registration-tasks", { title: "Pre-registration tasks", tasks: preRegistrationTasks });
});

// Online registration — the checklist that only makes sense once a place,
// course, and modules are confirmed (Phase 2). Same template as
// pre-registration-tasks; only the data differs. Scoped to New UG – Home.
router.get("/online-registration", (req, res) => {
  res.render("pre-registration-tasks", { title: "Online registration", tasks: registrationTasks });
});

for (const section of sections) {
  router.get(`/${section.slug}`, (req, res) => {
    res.render("section-placeholder", { title: section.title });
  });
}

// UCard PIN — lives in the main sidebar rather than as a Personal information
// tab, since changing your PIN isn't really "your record", it's UCard admin.
router.get("/ucard-pin", (req, res) => {
  res.render("ucard-pin", { title: "Change UCARD PIN number" });
});

router.post("/ucard-pin", (req, res) => {
  const { oldPin, newPin, confirmPin } = req.body;
  if (!oldPin?.trim() || !newPin?.trim() || !confirmPin?.trim()) {
    req.flash("error", "All PIN fields are required.");
    return res.redirect("/ucard-pin");
  }
  if (newPin !== confirmPin) {
    req.flash("error", "New PIN and confirmation do not match. Please try again.");
    return res.redirect("/ucard-pin");
  }
  req.flash("success", "UCard PIN changed successfully.");
  res.redirect("/ucard-pin");
});

export default router;

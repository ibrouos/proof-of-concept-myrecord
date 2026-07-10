// Ad-hoc page capture for UI review — not part of the e2e suite.
// Usage: node e2e/screenshot-pages.mjs [outDir]
import { chromium } from "playwright";

const BASE = "http://localhost:3000";
const OUT = process.argv[2] || "/tmp/ui-audit";

const pages = [
  { path: "/?view=applicant", name: "dash-applicant" },
  { path: "/?view=pre-arrival", name: "dash-pre-arrival" },
  { path: "/?view=student", name: "dash-student" },
  { path: "/?view=consent", name: "dash-consent" },
  { path: "/myrecord", name: "myrecord" },
  { path: "/myrecord/personal-details", name: "personal-details" },
  { path: "/myrecord/addresses", name: "addresses" },
  { path: "/programmes-and-modules", name: "programmes" },
  { path: "/mytimetable", name: "mytimetable" },
  { path: "/fees-and-finance", name: "section-placeholder" },
];

const viewports = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844 },
];

const browser = await chromium.launch();
for (const vp of viewports) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
  const page = await ctx.newPage();
  for (const p of pages) {
    await page.goto(BASE + p.path, { waitUntil: "networkidle" });
    await page.screenshot({ path: `${OUT}/${p.name}--${vp.name}.png`, fullPage: true });
  }
  await ctx.close();
}
await browser.close();
console.log("done:", OUT);

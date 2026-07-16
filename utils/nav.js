// Master registry of sidebar items — the single place a nav destination is
// defined. Each demo scenario (data/scenarios/*.json) lists which keys its
// persona can see, so the sidebar is a function of the selected lifecycle
// state just like the dashboard content. A scenario without a "nav" array
// gets everything (safe default for new states).
export const NAV_ITEMS = [
  { key: "dashboard", href: "/", label: "Dashboard", icon: "dashboard", exact: true },
  { key: "myrecord", href: "/myrecord", label: "MyRecord", icon: "person" },
  { key: "programmes", href: "/programmes-and-modules", label: "Programmes and modules", icon: "apps" },
  { key: "exams", href: "/exams-and-myresults", label: "Exams & MyResults", icon: "settings" },
  { key: "fees", href: "/fees-and-finance", label: "Fees & finance", icon: "paid" },
  { key: "timetable", href: "/mytimetable", label: "MyTimetable", icon: "calendar" },
  { key: "useful-links", href: "/useful-links", label: "All Services", icon: "link", divider: true },
];

export function navForScenario(scenario) {
  const keys = scenario?.nav;
  if (!Array.isArray(keys)) return NAV_ITEMS;
  return NAV_ITEMS.filter((item) => keys.includes(item.key));
}

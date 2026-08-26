// Demo scenarios — each JSON file is a full dashboard state for one point in
// the student lifecycle. Shared by the dashboard route (content) and the
// template locals in app.js (corner switcher widget).
import applicant from "../data/scenarios/applicant.json" with { type: "json" };
import preArrival from "../data/scenarios/pre-arrival.json" with { type: "json" };
import student from "../data/scenarios/student.json" with { type: "json" };
import consent from "../data/scenarios/consent.json" with { type: "json" };

export const scenarios = {
  applicant,
  "pre-arrival": preArrival,
  student,
  consent,
};

export const DEFAULT_SCENARIO = "consent";

export function currentScenarioKey(req) {
  return scenarios[req.session?.scenario] ? req.session.scenario : DEFAULT_SCENARIO;
}

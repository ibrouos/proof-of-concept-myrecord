import { Router } from "express";

const router = Router();

// Mock student record — replace with a data source when one is available.
const MOCK_STUDENT = {
  registrationNumber: "180217843",
  studentSupportNumber: "",
  husid: "00001811590035803",
  name: "Mr Stureg Charles Stureg Black",
  dateOfBirth: "08th March 1981",
  homeOverseas: "Home",
  ethnicOrigin: "Information withheld",
  nextOfKin: [{ name: "Professor TEST, T", relationship: "Spouse" }],
};

// Landing on /myrecord goes to the first tab.
router.get("/", (req, res) => {
  res.redirect("/myrecord/personal-details");
});

// --- Read-only tabs ---------------------------------------------------------

router.get("/personal-details", (req, res) => {
  res.render("myrecord/personal-details", {
    title: "Personal details",
    student: MOCK_STUDENT,
  });
});

router.get("/course-information", (req, res) => {
  res.render("myrecord/course-information", { title: "Course information" });
});

// Hub page for the "Addresses" tab — links out to each address form.
router.get("/addresses", (req, res) => {
  res.render("myrecord/addresses", { title: "Addresses" });
});

router.get("/correspondence-address", (req, res) => {
  res.render("myrecord/correspondence-address", { title: "Correspondence address" });
});

// --- Editable tabs (GET form + POST handler) --------------------------------

const addressPages = [
  { slug: "sheffield-address", title: "Sheffield address", success: "Sheffield address updated successfully." },
  { slug: "home-address", title: "Home address", success: "Home address updated successfully." },
  { slug: "landlords-address", title: "Landlord's address", success: "Landlord's address updated successfully." },
  { slug: "prospective-address", title: "Prospective address", success: "Prospective address updated successfully." },
];

for (const page of addressPages) {
  router.get(`/${page.slug}`, (req, res) => {
    res.render(`myrecord/${page.slug}`, { title: page.title });
  });

  router.post(`/${page.slug}`, (req, res) => {
    const { addressLine1, town, country } = req.body;
    if (!addressLine1?.trim() || !town?.trim() || !country?.trim()) {
      req.flash("error", "Address Line 1, Town, and Country are required.");
      return res.redirect(`/myrecord/${page.slug}`);
    }
    req.flash("success", page.success);
    res.redirect(`/myrecord/${page.slug}`);
  });
}

router.get("/future-address", (req, res) => {
  res.render("myrecord/future-address", {
    title: "Define a correspondence or future address",
  });
});

router.post("/future-address", (req, res) => {
  const { addressType, addressLine1, town, country, startDate } = req.body;
  if (!addressType || !addressLine1?.trim() || !town?.trim() || !country?.trim() || !startDate?.trim()) {
    req.flash("error", "Address Type, Address Line 1, Town, Country, and Start Date are required.");
    return res.redirect("/myrecord/future-address");
  }
  req.flash("success", "Future address added successfully.");
  res.redirect("/myrecord/future-address");
});

router.get("/ucard-pin", (req, res) => {
  res.render("myrecord/ucard-pin", { title: "Change UCARD PIN number" });
});

router.post("/ucard-pin", (req, res) => {
  const { oldPin, newPin, confirmPin } = req.body;
  if (!oldPin?.trim() || !newPin?.trim() || !confirmPin?.trim()) {
    req.flash("error", "All PIN fields are required.");
    return res.redirect("/myrecord/ucard-pin");
  }
  if (newPin !== confirmPin) {
    req.flash("error", "New PIN and confirmation do not match. Please try again.");
    return res.redirect("/myrecord/ucard-pin");
  }
  req.flash("success", "UCard PIN changed successfully.");
  res.redirect("/myrecord/ucard-pin");
});

export default router;

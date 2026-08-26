import { Router } from "express";
import countries from "../data/countries.json" with { type: "json" };

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

// Mock addresses on file, keyed by page slug. Only home-address is filled in,
// so the addresses hub can demonstrate telling filled apart from empty.
const MOCK_ADDRESSES = {
  "home-address": {
    residentialType: "Owner occupied",
    addressLine1: "14 Fulwood Road",
    addressLine2: "",
    addressLine3: "",
    town: "Sheffield",
    regionCounty: "South Yorkshire",
    country: "UNITED KINGDOM",
    postcodeOutward: "S10",
    postcodeInward: "3BA",
    telephone: "0114 496 0213",
    mobilePhone: "07911 123456",
    email: "s.blackstureg@sheffield.ac.uk",
    endDate: "",
  },
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

// Hub page for the "Addresses" tab — links out to each address form. Each
// tile needs to show at a glance whether that address is on file, since
// otherwise the only way to find out is to open every tab in turn.
router.get("/addresses", (req, res) => {
  res.render("myrecord/addresses", {
    title: "Addresses",
    filledSlugs: Object.keys(MOCK_ADDRESSES),
  });
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
    res.render(`myrecord/${page.slug}`, {
      title: page.title,
      address: MOCK_ADDRESSES[page.slug] || null,
      countries,
    });
  });

  router.post(`/${page.slug}`, (req, res) => {
    const { residentialType, addressLine1, town, country, postcodeOutward, postcodeInward } = req.body;
    if (!residentialType?.trim() || !addressLine1?.trim() || !town?.trim() || !country?.trim()) {
      req.flash("error", "Residential Type, Address Line 1, Town, and Country are required.");
      return res.redirect(`/myrecord/${page.slug}`);
    }
    if (country.trim().toUpperCase() === "UNITED KINGDOM" && (!postcodeOutward?.trim() || !postcodeInward?.trim())) {
      req.flash("error", "Post Code is required for UK addresses.");
      return res.redirect(`/myrecord/${page.slug}`);
    }
    req.flash("success", page.success);
    res.redirect(`/myrecord/${page.slug}`);
  });
}

router.get("/future-address", (req, res) => {
  res.render("myrecord/future-address", {
    title: "Define a correspondence or future address",
    countries,
  });
});

router.post("/future-address", (req, res) => {
  const { addressType, residentialType, addressLine1, town, country, startDate, postcodeOutward, postcodeInward } = req.body;
  if (!addressType || !residentialType?.trim() || !addressLine1?.trim() || !town?.trim() || !country?.trim() || !startDate?.trim()) {
    req.flash("error", "Address Type, Residential Type, Address Line 1, Town, Country, and Start Date are required.");
    return res.redirect("/myrecord/future-address");
  }
  if (country.trim().toUpperCase() === "UNITED KINGDOM" && (!postcodeOutward?.trim() || !postcodeInward?.trim())) {
    req.flash("error", "Post Code is required for UK addresses.");
    return res.redirect("/myrecord/future-address");
  }
  req.flash("success", "Future address added successfully.");
  res.redirect("/myrecord/future-address");
});

export default router;

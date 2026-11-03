/* Gyaan Hub - site configuration (classic script, loaded before everything else)
   The site name / logo letter / contact e-mail can ALSO be changed later from
   Admin Panel -> Site tab (no code edit needed). The values below are only the defaults. */
window.SITE_CONFIG = {
  defaultName: "Gyaan Hub",                 // name used in the HTML files (do not change unless you edit every page)
  defaultLogo: "G",                         // letter / emoji shown in the round logo
  contactPlaceholder: "your-email@example.com",   // placeholder inside privacy/terms, replaced by the Admin > Site contact e-mail

  // OPTIONAL: Google Drive API key (Drive API must be enabled for that key in Google Cloud).
  // If you fill this, PDFs stored on Google Drive open in the sharp built-in viewer.
  // If empty, Drive PDFs open in Google's own preview (works, but quality is Google's).
  driveApiKey: "",

  // Show city/country of each login in "Active devices" (uses https://ipapi.co, see Privacy Policy). Set false to turn off.
  locationLookup: true
};

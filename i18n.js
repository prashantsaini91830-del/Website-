// Gyaan Hub - English / Hindi UI text. Add more keys here; use data-i18n="key" in HTML or t("key") in JS.
import { getPrefs } from "./prefs.js?v=14";

const D = {
  en: {
    "nav.home": "Home", "nav.dashboard": "Dashboard", "nav.tests": "Tests", "nav.community": "Community", "nav.profile": "Profile", "nav.messages": "Messages", "nav.reports": "Reports", "nav.reels": "Reels", "nav.settings": "Settings", "nav.admin": "Admin",
    "nav.privacy": "Privacy Policy", "nav.terms": "Terms of Use", "nav.cookies": "Cookie preferences",
    "nav.signin": "Sign In", "nav.signup": "Sign Up", "nav.logout": "Logout", "nav.signedAs": "Signed in as",

    "dash.welcome": "Welcome,", "dash.sub": "What would you like to study today? Pick your material below.",
    "dash.search": "Search by title or subject, e.g. Calculus, Physics, DBMS...",
    "dash.all": "All", "dash.notes": "Notes", "dash.papers": "Papers", "dash.videos": "Videos", "dash.mock": "Mock Tests",
    "dash.onlineTests": "Online Tests", "dash.material": "Study Material", "dash.continue": "Continue learning",
    "dash.one": "resource available", "dash.many": "resources available", "dash.empty": "No results found. Try a different search term or filter.",
    "dash.new": "NEW", "dash.start": "Start", "dash.newBanner": "new item(s) added in the last 7 days.", "dash.resume": "Resume",

    "set.title": "Settings", "set.sub": "Manage your profile, security, devices and how the site works for you.",
    "set.profile": "Profile", "set.photo": "Profile photo", "set.photoHint": "JPG or PNG. It is resized on your device before saving.",
    "set.upload": "Upload photo", "set.remove": "Remove", "set.name": "Display name", "set.nameSave": "Save name", "set.email": "Email",
    "set.appearance": "Appearance & language", "set.theme": "Theme", "set.dark": "Dark", "set.light": "Light", "set.system": "System",
    "set.lang": "Language", "set.langHint": "Changes menus and main screens.",
    "set.security": "Password & email", "set.curPw": "Current password", "set.newPw": "New password (min 6 characters)", "set.confPw": "Confirm new password",
    "set.changePw": "Change password", "set.newEmail": "New email address", "set.changeEmail": "Change email",
    "set.googleNote": "You signed in with Google, so your password and email are managed in your Google account.",
    "set.emailNote": "We send a verification link to the new address. The email changes after you click it.",
    "set.devices": "Active devices", "set.devicesSub": "Everywhere your account is signed in. If you do not recognise one, log it out and change your password.",
    "set.thisDevice": "This device", "set.lastActive": "Last active", "set.signedIn": "Signed in", "set.logoutDevice": "Log out",
    "set.logoutOthers": "Log out all other devices", "set.logoutAll": "Log out from all devices", "set.refresh": "Refresh",
    "set.noDevices": "No device records yet.", "set.loading": "Loading...",
    "set.notifications": "Notifications", "set.nResults": "Email my test results", "set.nResultsHint": "Send a copy of your score and rank to your email after each test.",
    "set.nNew": "New material alerts", "set.nNewHint": "Show a NEW badge and a banner when new notes, videos or papers are added.",
    "set.player": "Player settings", "set.speed": "Default speed", "set.quality": "Default video quality", "set.qualityHint": "YouTube may ignore this on some videos or networks.",
    "set.autoplay": "Autoplay", "set.autoplayHint": "Start videos automatically when you open them.",
    "set.resume": "Resume from last position", "set.resumeHint": "Videos and PDFs reopen where you stopped.",
    "set.download": "Show download button", "set.downloadHint": "In the notes / PDF viewer.",
    "set.data": "Download & data usage", "set.saver": "Data saver mode", "set.saverHint": "Lower video quality (360p), PDFs render at normal resolution, no autoplay.",
    "set.clearCache": "Clear saved data on this device", "set.clearCacheHint": "Removes cached lists and resume positions stored in this browser.", "set.clear": "Clear",
    "set.privacy": "Privacy & cookies", "set.cookies": "Cookie preferences", "set.cookiesHint": "Review or change which optional cookies we may use.", "set.manage": "Manage",
    "set.withdraw": "Withdraw consent", "set.withdrawHint": "Clears your saved choice. You will be asked again.", "set.reset": "Reset consent", "set.policies": "Policies",
    "set.yourData": "Your data", "set.export": "Export my data", "set.exportHint": "Download your profile, settings, devices, learning progress and test results as a JSON file.",
    "set.exportBtn": "Download JSON", "set.danger": "Danger zone", "set.delete": "Delete my account",
    "set.deleteHint": "Permanently deletes your account, test results and saved data. This cannot be undone.",
    "set.deleteBtn": "Delete account", "set.deleteConfirm": "Type DELETE to confirm", "set.confirmPw": "Your password",
    "set.session": "Session", "set.sessionHint": "Sign out of this device", "set.saved": "Saved.",

    "pl.back": "Back", "pl.speed": "Speed", "pl.quality": "Quality", "pl.auto": "Auto", "pl.download": "Download", "pl.open": "Open original",
    "pl.fullscreen": "Fullscreen", "pl.page": "Page", "pl.fit": "Fit", "pl.night": "Night mode", "pl.loading": "Loading...",
    "pl.resumed": "Resumed from", "pl.startOver": "Start over", "pl.noLink": "This material has no link yet.", "pl.qualityNote": "YouTube may override the quality.",

    "tests.title": "Online Tests", "tests.sub": "Pick a test, answer within the time limit and see your score instantly.",
    "common.back": "Back"
  },
  hi: {
    "nav.home": "होम", "nav.dashboard": "डैशबोर्ड", "nav.tests": "टेस्ट", "nav.community": "कम्युनिटी", "nav.profile": "प्रोफ़ाइल", "nav.messages": "संदेश", "nav.reports": "रिपोर्ट", "nav.reels": "रील्स", "nav.settings": "सेटिंग्स", "nav.admin": "एडमिन",
    "nav.privacy": "प्राइवेसी पॉलिसी", "nav.terms": "उपयोग की शर्तें", "nav.cookies": "कुकी प्राथमिकताएँ",
    "nav.signin": "साइन इन", "nav.signup": "साइन अप", "nav.logout": "लॉगआउट", "nav.signedAs": "साइन इन:",

    "dash.welcome": "स्वागत है,", "dash.sub": "आज आप क्या पढ़ना चाहेंगे? नीचे से सामग्री चुनें।",
    "dash.search": "शीर्षक या विषय से खोजें, जैसे Calculus, Physics, DBMS...",
    "dash.all": "सभी", "dash.notes": "नोट्स", "dash.papers": "पेपर", "dash.videos": "वीडियो", "dash.mock": "मॉक टेस्ट",
    "dash.onlineTests": "ऑनलाइन टेस्ट", "dash.material": "अध्ययन सामग्री", "dash.continue": "जहाँ छोड़ा था वहीं से",
    "dash.one": "संसाधन उपलब्ध", "dash.many": "संसाधन उपलब्ध", "dash.empty": "कोई परिणाम नहीं मिला। कोई और शब्द या फ़िल्टर आज़माएँ।",
    "dash.new": "नया", "dash.start": "शुरू करें", "dash.newBanner": "नई सामग्री पिछले 7 दिनों में जोड़ी गई।", "dash.resume": "जारी रखें",

    "set.title": "सेटिंग्स", "set.sub": "अपनी प्रोफ़ाइल, सुरक्षा, डिवाइस और साइट का व्यवहार यहाँ से संभालें।",
    "set.profile": "प्रोफ़ाइल", "set.photo": "प्रोफ़ाइल फ़ोटो", "set.photoHint": "JPG या PNG। सेव करने से पहले फ़ोटो आपके डिवाइस पर छोटी की जाती है।",
    "set.upload": "फ़ोटो अपलोड करें", "set.remove": "हटाएँ", "set.name": "दिखने वाला नाम", "set.nameSave": "नाम सेव करें", "set.email": "ईमेल",
    "set.appearance": "थीम और भाषा", "set.theme": "थीम", "set.dark": "डार्क", "set.light": "लाइट", "set.system": "सिस्टम",
    "set.lang": "भाषा", "set.langHint": "मेनू और मुख्य स्क्रीन की भाषा बदलती है।",
    "set.security": "पासवर्ड और ईमेल", "set.curPw": "मौजूदा पासवर्ड", "set.newPw": "नया पासवर्ड (कम से कम 6 अक्षर)", "set.confPw": "नया पासवर्ड दोबारा लिखें",
    "set.changePw": "पासवर्ड बदलें", "set.newEmail": "नया ईमेल पता", "set.changeEmail": "ईमेल बदलें",
    "set.googleNote": "आपने Google से साइन इन किया है, इसलिए पासवर्ड और ईमेल आपके Google अकाउंट से बदले जाते हैं।",
    "set.emailNote": "नए पते पर एक वेरिफ़िकेशन लिंक भेजा जाएगा। लिंक पर क्लिक करने के बाद ईमेल बदलेगा।",
    "set.devices": "सक्रिय डिवाइस", "set.devicesSub": "जहाँ-जहाँ आपका अकाउंट लॉगिन है। कोई डिवाइस पहचान में न आए तो उसे लॉगआउट करें और पासवर्ड बदलें।",
    "set.thisDevice": "यह डिवाइस", "set.lastActive": "आखिरी बार सक्रिय", "set.signedIn": "लॉगिन", "set.logoutDevice": "लॉगआउट",
    "set.logoutOthers": "बाकी सभी डिवाइस से लॉगआउट", "set.logoutAll": "सभी डिवाइस से लॉगआउट", "set.refresh": "रीफ़्रेश",
    "set.noDevices": "अभी कोई डिवाइस रिकॉर्ड नहीं है।", "set.loading": "लोड हो रहा है...",
    "set.notifications": "नोटिफ़िकेशन", "set.nResults": "टेस्ट रिज़ल्ट ईमेल करें", "set.nResultsHint": "हर टेस्ट के बाद स्कोर और रैंक की कॉपी आपके ईमेल पर आएगी।",
    "set.nNew": "नई सामग्री की सूचना", "set.nNewHint": "नए नोट्स, वीडियो या पेपर जुड़ने पर NEW बैज और बैनर दिखाएँ।",
    "set.player": "प्लेयर सेटिंग्स", "set.speed": "डिफ़ॉल्ट स्पीड", "set.quality": "डिफ़ॉल्ट वीडियो क्वालिटी", "set.qualityHint": "कुछ वीडियो या नेटवर्क पर YouTube इसे अनदेखा कर सकता है।",
    "set.autoplay": "ऑटोप्ले", "set.autoplayHint": "वीडियो खोलते ही अपने आप चालू हो।",
    "set.resume": "आखिरी जगह से जारी रखें", "set.resumeHint": "वीडियो और PDF वहीं खुलेंगे जहाँ आपने छोड़ा था।",
    "set.download": "डाउनलोड बटन दिखाएँ", "set.downloadHint": "नोट्स / PDF व्यूअर में।",
    "set.data": "डाउनलोड और डेटा उपयोग", "set.saver": "डेटा सेवर मोड", "set.saverHint": "वीडियो क्वालिटी कम (360p), PDF सामान्य रेज़ोल्यूशन पर, ऑटोप्ले बंद।",
    "set.clearCache": "इस डिवाइस का सेव डेटा साफ़ करें", "set.clearCacheHint": "इस ब्राउज़र में रखी लिस्ट और रेज़्यूम पोज़िशन हटाता है।", "set.clear": "साफ़ करें",
    "set.privacy": "प्राइवेसी और कुकी", "set.cookies": "कुकी प्राथमिकताएँ", "set.cookiesHint": "देखें या बदलें कि कौन-सी वैकल्पिक कुकी चलें।", "set.manage": "बदलें",
    "set.withdraw": "सहमति वापस लें", "set.withdrawHint": "आपकी सेव की गई पसंद हट जाएगी। दोबारा पूछा जाएगा।", "set.reset": "सहमति रीसेट", "set.policies": "पॉलिसी",
    "set.yourData": "आपका डेटा", "set.export": "मेरा डेटा एक्सपोर्ट करें", "set.exportHint": "प्रोफ़ाइल, सेटिंग्स, डिवाइस, पढ़ाई की प्रगति और टेस्ट रिज़ल्ट JSON फ़ाइल में डाउनलोड करें।",
    "set.exportBtn": "JSON डाउनलोड", "set.danger": "खतरे का क्षेत्र", "set.delete": "मेरा अकाउंट डिलीट करें",
    "set.deleteHint": "आपका अकाउंट, टेस्ट रिज़ल्ट और सेव किया डेटा हमेशा के लिए हट जाएगा। इसे वापस नहीं किया जा सकता।",
    "set.deleteBtn": "अकाउंट डिलीट करें", "set.deleteConfirm": "पक्का करने के लिए DELETE लिखें", "set.confirmPw": "आपका पासवर्ड",
    "set.session": "सेशन", "set.sessionHint": "इस डिवाइस से साइन आउट करें", "set.saved": "सेव हो गया।",

    "pl.back": "वापस", "pl.speed": "स्पीड", "pl.quality": "क्वालिटी", "pl.auto": "ऑटो", "pl.download": "डाउनलोड", "pl.open": "ओरिजिनल खोलें",
    "pl.fullscreen": "फ़ुलस्क्रीन", "pl.page": "पेज", "pl.fit": "फ़िट", "pl.night": "नाइट मोड", "pl.loading": "लोड हो रहा है...",
    "pl.resumed": "यहाँ से जारी:", "pl.startOver": "शुरू से देखें", "pl.noLink": "इस सामग्री का अभी कोई लिंक नहीं है।", "pl.qualityNote": "YouTube क्वालिटी खुद बदल सकता है।",

    "tests.title": "ऑनलाइन टेस्ट", "tests.sub": "टेस्ट चुनें, समय सीमा में उत्तर दें और स्कोर तुरंत देखें।",
    "common.back": "वापस"
  }
};

export const lang = () => (getPrefs().lang === "hi" ? "hi" : "en");
export function t(key) { return (D[lang()] && D[lang()][key]) || D.en[key] || key; }

export function applyI18n(root = document) {
  root.querySelectorAll("[data-i18n]").forEach(el => { el.textContent = t(el.dataset.i18n); });
  root.querySelectorAll("[data-i18n-ph]").forEach(el => { el.placeholder = t(el.dataset.i18nPh); });
  root.querySelectorAll("[data-i18n-title]").forEach(el => { el.title = t(el.dataset.i18nTitle); });
}
window.addEventListener("prefs-changed", () => applyI18n());

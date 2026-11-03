# Gyaan Hub

A static study-materials portal with Firebase Authentication. (The site name can be changed any time from Admin Panel → Site.) Students can sign up with email or Google, then browse notes, previous year papers, video lectures and mock tests from a searchable dashboard.

## Features
- Landing page with features, subjects, how-it-works and FAQ sections
- Email/password sign up and sign in
- Google sign-in
- Password reset by email
- Email OTP verification after sign up (EmailJS). Google sign-ins skip it
- Protected dashboard with search and category filters
- Left slide-out menu (three-line button) with Home, Dashboard, Reports, Settings, Privacy Policy, Terms of Use and Cookie preferences
- Privacy and cookie consent popup shown on a first visit (policy acceptance required, analytics optional)
- Admin panel (`admin.html`): manage materials, create online MCQ tests, view student results
- Online tests (`tests.html`) with timer, instant score and answer review
- Reports page with summary cards, charts and CSV export
- Built-in viewer (`player.html`): YouTube, Vimeo, Google Drive, MP4/HLS/audio and PDFs play inside the website. PDFs use PDF.js (sharp canvas rendering, zoom, night mode, page jump). Speed, quality, autoplay and resume-from-last-position follow your Settings
- Settings page: profile photo, dark/light/system theme, English/Hindi, password and email change, active devices with remote logout (this device / others / all), notifications, player settings, data saver, clear local data, export my data (JSON) and delete account
- Test questions and options can include images (upload from the admin panel or paste a link). Click an image in a test to enlarge it
- Admin: Site tab (website name, logo letter, contact e-mail), Logins tab (recent devices of all students)
- Responsive dark design with no build step

## Project structure
| File | Purpose |
|------|---------|
| `index.html` | Landing page |
| `login.html` / `signup.html` | Authentication pages |
| `dashboard.html` | Protected study-materials dashboard |
| `auth.js` | Firebase setup and all auth logic |
| `verify.html` | 6-digit OTP email verification (set the EmailJS Public Key at the top) |
| `admin.html` | Admin panel (only for UIDs listed in the Firestore `admins` collection) |
| `tests.html` | Online tests for students |
| `layout.js` | Shared left menu and consent popup |
| `materials.js` | List of study materials (edit this) |
| `reports.html` / `settings.html` | Reports and account settings |
| `player.html` / `player-utils.js` | Built-in viewer for videos, notes and PDFs |
| `site-config.js` | Defaults: site name/logo, optional Drive API key, location lookup on/off |
| `theme.js` / `prefs.js` / `i18n.js` / `media.js` | Theme + site name, user preferences, English/Hindi texts, image upload/zoom helpers |
| `files/` | Put your own PDFs/videos here and link them as `files/name.pdf` (sharpest PDFs) |
| `privacy.html` / `terms.html` | Policy pages (template text, replace the contact email) |
| `style.css` | Shared styles |

## Run locally
ES modules do not load from `file://`, so use a local server:

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000

## Firebase setup
1. In Firebase Console, open **Authentication > Sign-in method** and enable **Email/Password** and **Google**.
2. Open **Authentication > Settings > Authorized domains** and add your live domain (for example `yourname.github.io`). `localhost` is allowed by default.
3. The Firebase config lives at the top of `auth.js`.

## Adding your own materials
Edit the `materials` array in `materials.js`. The dashboard and the Reports page both use it. Each item has a title (`t`), subject (`s`), type (`Notes`, `Papers`, `Video` or `Test`), an icon and a `link` to a PDF, Google Drive or YouTube URL.

## Deployment
Push to GitHub and enable **Settings > Pages** on the `main` branch to host the site for free.

## Adding your own materials
Link types that open inside the built-in player: YouTube (watch/share/shorts/playlist), Vimeo, Google Drive file links ("Anyone with the link can view"), PDF links, MP4/WebM/HLS (`.m3u8`)/audio, images, Google Docs/Slides.
For the **sharpest PDFs** copy the file into the `files/` folder of this repository and use `files/yourfile.pdf` as the link (same-site files always work with the sharp viewer). GitHub `blob` links are converted automatically. PDFs on other sites only open in the sharp viewer if that site allows it (CORS); otherwise Google's viewer is used.
Optional: put a Google Drive API key in `site-config.js` (`driveApiKey`, Drive API enabled for it) so Drive PDFs also open in the sharp viewer.

## Firestore rules (publish these again - new collections were added)
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function signedIn() {
      return request.auth != null;
    }
    function isAdmin() {
      return signedIn() && exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }
    function isOwner(uid) {
      return signedIn() && request.auth.uid == uid;
    }
    match /materials/{id} {
      allow read: if signedIn();
      allow write: if isAdmin();
    }
    match /tests/{id} {
      allow read: if signedIn();
      allow write: if isAdmin();
    }
    match /images/{id} {                    // question images
      allow read: if signedIn();
      allow write: if isAdmin();
    }
    match /settings/{id} {                  // site name / logo / contact (readable before login)
      allow read: if true;
      allow write: if isAdmin();
    }
    match /results/{id} {
      allow create: if signedIn() && request.resource.data.uid == request.auth.uid;
      allow read: if isAdmin() || (signedIn() && resource.data.uid == request.auth.uid);
      allow update: if isAdmin();
      allow delete: if isAdmin() || (signedIn() && resource.data.uid == request.auth.uid);
    }
    match /scores/{id} {
      allow read: if signedIn();
      allow create, update: if signedIn()
        && request.resource.data.uid == request.auth.uid
        && id == request.resource.data.testId + "_" + request.auth.uid;
      allow delete: if isAdmin() || (signedIn() && resource.data.uid == request.auth.uid);
    }
    match /admins/{id} {
      allow read: if signedIn() && request.auth.uid == id;
      allow write: if false;
    }
    match /users/{uid} {                    // profile photo, preferences, devices, learning progress
      allow read, write: if isOwner(uid);
      match /{sub=**} {
        allow read, write: if isOwner(uid);
      }
    }
    match /{path=**}/devices/{id} {         // admin "Logins" tab
      allow read: if isAdmin();
    }
  }
}
```
Create the document `admins/<your UID>` (field `role` = `admin`) in the Firebase console.

## Notes on the account features
- **Active devices / remote logout:** each browser registers itself in `users/{uid}/devices`. "Log out" on a device deletes its record; that device signs itself out within seconds if the site is open (or the next time it is opened). "Log out from all devices" signs out every session that started before that moment. This is enforced by the site's code. Firebase cannot revoke tokens from a static site; for hard revocation use a Cloud Function with the Admin SDK (`revokeRefreshTokens`).
- **Login place** (city/country, partly hidden IP) comes from https://ipapi.co. Turn it off with `locationLookup: false` in `site-config.js`. It is described in the Privacy Policy.
- **Question images** are resized on the admin's device and stored compressed in Firestore (collection `images`), so Firebase Storage (paid plan) is not needed.
- **Language:** English and Hindi cover menus, dashboard, settings and the player. Legal pages and the admin panel stay in English.
- **EmailJS:** service/template IDs and keys in `verify.html` and `tests.html` are unchanged. Both e-mails now also receive a `site_name` parameter (use `{{site_name}}` in a template if you want it).

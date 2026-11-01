# Gyaan Hub

A static study-materials portal with Firebase Authentication. Students can sign up with email or Google, then browse notes, previous year papers, video lectures and mock tests from a searchable dashboard.

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
- Settings page with account details and privacy controls
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

## Firestore rules
```
service cloud.firestore {
  match /databases/{database}/documents {
    function signedIn() { return request.auth != null; }
    function isAdmin() {
      return signedIn() && exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }
    match /materials/{id} { allow read: if signedIn(); allow write: if isAdmin(); }
    match /tests/{id}     { allow read: if signedIn(); allow write: if isAdmin(); }
    match /results/{id} {
      allow create: if signedIn() && request.resource.data.uid == request.auth.uid;
      allow read: if isAdmin() || (signedIn() && resource.data.uid == request.auth.uid);
      allow update, delete: if isAdmin();
    }
    match /admins/{id} {
      allow read: if signedIn() && request.auth.uid == id;
      allow write: if false;
    }
  }
}
```
Create the document `admins/<your UID>` (field `role` = `admin`) in the Firebase console.

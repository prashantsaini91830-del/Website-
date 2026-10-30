# Gyaan Hub

A static study-materials portal with Firebase Authentication. Students can sign up with email or Google, then browse notes, previous year papers, video lectures and mock tests from a searchable dashboard.

## Features
- Landing page with features, subjects, how-it-works and FAQ sections
- Email/password sign up and sign in
- Google sign-in
- Password reset by email
- Protected dashboard with search and category filters
- Left slide-out menu (three-line button) with Home, Dashboard, Reports, Settings, Privacy Policy, Terms of Use and Cookie preferences
- Privacy and cookie consent popup shown on a first visit (policy acceptance required, analytics optional)
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

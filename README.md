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
- **Vector icons** (`icons.js`): all icons are inline SVG that follow the text colour and theme; any emoji icon added to a page later is converted automatically (put `data-keep` on an element to protect user-written text)
- **Profile tab** in the menu (`profile.html`): overview with progress chart and recent tests, Find people (by name or Student ID), followers, following and follow requests in one place
- **Student ID** (SHA-256 hash of the account id, shown as `XXXX-XXXX`): search by ID or open `profile.html?c=XXXXXXXX` to reach any student, even a private one
- **Student Community** (`community.html`, `profile.html`, `messages.html`): profile with avatar/bio/course, follow & followers, course-wise leaderboard, private profiles with follow requests, hide-my-rank, direct messages with block and report (reports are reviewed in `moderation.html`, admins only)
- **Chat extras:** unsend and edit your own messages, and send photos, videos, audio, PDFs, APK files, ZIPs and any other document (paperclip button; you can also paste an image)
- **Posts & reels:** upload a post (photo / video / text) or a reel (video up to 90 seconds) from Profile, edit the caption, delete, like, and see a Feed of the students you follow
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
| `community.html` / `profile.html` / `messages.html` | Student Community: leaderboard + find students, profiles, chat |
| `icons.js` | Vector icon set + automatic emoji-to-SVG conversion |
| `community.js` | All community logic (uses the same Firebase project as `auth.js`) |
| `files.js` | Uploads / downloads of chat files, post photos and reels (Firebase Storage, with an automatic database fallback) |
| `storage.rules` | Firebase Storage rules (paste in Firebase Console > Storage > Rules) |
| `moderation.html` | Admin-only list of student reports |
| `firestore.rules` | Same rules as below, as a ready file to paste |
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
    // ---- community helpers ----
    function docs() { return /databases/$(database)/documents; }
    function profilePath(u) { return /databases/$(database)/documents/profiles/$(u); }
    function isPrivateProfile(u) { return exists(profilePath(u)) && get(profilePath(u)).data.get("isPrivate", false) == true; }
    function followPath(a, b) { return /databases/$(database)/documents/follows/$(a + "_" + b); }
    function isAccFollower(u) {              // the signed-in user follows u and u has accepted
      return exists(followPath(request.auth.uid, u)) && get(followPath(request.auth.uid, u)).data.status == "accepted";
    }
    function doesFollow(a, b) {              // a follows b (accepted)
      return exists(followPath(a, b)) && get(followPath(a, b)).data.status == "accepted";
    }
    function blockedEither(p) {
      return exists(/databases/$(database)/documents/blocks/$(p[0] + "_" + p[1]))
          || exists(/databases/$(database)/documents/blocks/$(p[1] + "_" + p[0]));
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
    // ================= Student Community =================
    match /profiles/{uid} {                 // public card: name, avatar, privacy flags
      allow read: if signedIn();
      allow create, update: if (isOwner(uid)
          && request.resource.data.keys().hasOnly(["name", "nameLc", "avatar", "isPrivate", "hideRank", "dm", "code", "updatedAt"])
          && request.resource.data.name is string && request.resource.data.name.size() > 0 && request.resource.data.name.size() <= 40
          && request.resource.data.avatar.size() < 40000
          && request.resource.data.get("code", "").size() <= 8
          && request.resource.data.dm in ["all", "followers", "none"])
        || isAdmin();
      allow delete: if isOwner(uid) || isAdmin();
    }
    match /profileStats/{uid} {             // bio, course, rank numbers: hidden from strangers when the profile is private
      allow read: if signedIn() && (resource == null || isOwner(uid) || resource.data.shown == true || isAccFollower(uid));
      allow create, update: if (isOwner(uid) && request.resource.data.uid == uid
          && (!("bio" in request.resource.data) || request.resource.data.bio.size() <= 160))
        || isAdmin();
      allow delete: if isOwner(uid) || isAdmin();
    }
    match /follows/{id} {                   // id = followerUid_targetUid
      allow read: if signedIn() && (resource == null
          || request.auth.uid == resource.data.follower || request.auth.uid == resource.data.target
          || (resource.data.status == "accepted" && (
                (resource.data.targetPrivate == false && resource.data.followerPrivate == false)
                || isAccFollower(resource.data.target)
                || (resource.data.targetPrivate == false && isAccFollower(resource.data.follower)))));
      allow create: if signedIn()
          && request.resource.data.follower == request.auth.uid
          && request.resource.data.target is string && request.resource.data.target != request.auth.uid
          && id == request.auth.uid + "_" + request.resource.data.target
          && !exists(/databases/$(database)/documents/blocks/$(request.resource.data.target + "_" + request.auth.uid))
          && request.resource.data.targetPrivate == isPrivateProfile(request.resource.data.target)
          && request.resource.data.followerPrivate == isPrivateProfile(request.auth.uid)
          && ((isPrivateProfile(request.resource.data.target) && request.resource.data.status == "pending")
              || (!isPrivateProfile(request.resource.data.target) && request.resource.data.status == "accepted"));
      allow update: if signedIn() && (
          (request.auth.uid == resource.data.target
            && request.resource.data.diff(resource.data).affectedKeys().hasOnly(["status", "targetPrivate", "updatedAt"])
            && request.resource.data.status == "accepted")
          || (request.auth.uid == resource.data.follower
            && request.resource.data.diff(resource.data).affectedKeys().hasOnly(["followerPrivate", "updatedAt"])));
      allow delete: if signedIn() && (request.auth.uid == resource.data.follower || request.auth.uid == resource.data.target);
    }
    match /blocks/{id} {                    // id = blockerUid_blockedUid (the blocked person cannot read it)
      allow read, delete: if signedIn() && (resource == null || resource.data.blocker == request.auth.uid);
      allow create: if signedIn() && request.resource.data.blocker == request.auth.uid
          && id == request.auth.uid + "_" + request.resource.data.blocked;
    }
    match /chats/{cid} {                    // cid = smallerUid_largerUid
      allow read: if signedIn() && (resource == null || request.auth.uid in resource.data.participants);
      allow create: if signedIn()
          && request.resource.data.participants.size() == 2
          && request.auth.uid in request.resource.data.participants
          && request.resource.data.participants[0] < request.resource.data.participants[1]
          && cid == request.resource.data.participants[0] + "_" + request.resource.data.participants[1]
          && !blockedEither(request.resource.data.participants);
      allow update: if signedIn() && request.auth.uid in resource.data.participants
          && request.resource.data.participants == resource.data.participants
          && !blockedEither(resource.data.participants);
      allow delete: if false;
      match /messages/{mid} {
        function chat() { return get(/databases/$(database)/documents/chats/$(cid)).data; }
        function dmAllowed(to, from) {
          return !exists(profilePath(to))
              || get(profilePath(to)).data.get("dm", "followers") == "all"
              || (get(profilePath(to)).data.get("dm", "followers") == "followers" && doesFollow(to, from));
        }
        allow read: if signedIn() && request.auth.uid in chat().participants;
        allow create: if signedIn()
            && request.resource.data.from == request.auth.uid
            && request.resource.data.to in chat().participants && request.resource.data.to != request.auth.uid
            && request.resource.data.text is string && request.resource.data.text.size() <= 1000
            && (request.resource.data.text.size() > 0 || request.resource.data.get("att", null) != null)
            && (request.resource.data.get("att", null) == null || request.resource.data.att is map)
            && !blockedEither(chat().participants)
            && dmAllowed(request.resource.data.to, request.auth.uid);
        // edit or unsend: only the sender, only these fields
        allow update: if signedIn() && resource.data.from == request.auth.uid
            && request.resource.data.diff(resource.data).affectedKeys().hasOnly(["text", "edited", "editedAt", "deleted", "att", "updatedAt"])
            && request.resource.data.text is string && request.resource.data.text.size() <= 1000;
        allow delete: if signedIn() && resource.data.from == request.auth.uid;
      }
      match /files/{fid} {                 // attachment pieces (used when Firebase Storage is not enabled)
        function chatPeople() { return get(/databases/$(database)/documents/chats/$(cid)).data.participants; }
        allow read: if signedIn() && request.auth.uid in chatPeople();
        allow create: if signedIn() && request.auth.uid in chatPeople()
            && request.resource.data.by == request.auth.uid
            && request.resource.data.d is string && request.resource.data.d.size() <= 900000
            && !blockedEither(chatPeople());
        allow delete: if signedIn() && resource.data.by == request.auth.uid;
      }
    }
    // ---- posts & reels ----
    match /posts/{pid} {
      allow read: if signedIn() && (resource == null
          || resource.data.uid == request.auth.uid
          || ((!isPrivateProfile(resource.data.uid) || isAccFollower(resource.data.uid))
              && !exists(/databases/$(database)/documents/blocks/$(resource.data.uid + "_" + request.auth.uid))));
      allow create: if signedIn() && request.resource.data.uid == request.auth.uid
          && request.resource.data.kind in ["post", "reel"]
          && request.resource.data.caption is string && request.resource.data.caption.size() <= 500;
      allow update: if signedIn() && resource.data.uid == request.auth.uid
          && request.resource.data.diff(resource.data).affectedKeys().hasOnly(["caption", "edited", "editedAt", "updatedAt"])
          && request.resource.data.caption is string && request.resource.data.caption.size() <= 500;
      allow delete: if signedIn() && (resource.data.uid == request.auth.uid || isAdmin());
      match /likes/{u} {
        allow read: if signedIn();
        allow write: if signedIn() && request.auth.uid == u;
      }
    }
    match /postFiles/{fid} {               // photo / video pieces of posts (used when Firebase Storage is not enabled)
      allow read: if signedIn();
      allow create: if signedIn() && request.resource.data.by == request.auth.uid
          && request.resource.data.d is string && request.resource.data.d.size() <= 900000;
      allow delete: if signedIn() && (resource.data.by == request.auth.uid || isAdmin());
    }
    match /communityReports/{id} {          // reports: anyone can send, only admins can read
      allow create: if signedIn() && request.resource.data.reporter == request.auth.uid;
      allow read, update, delete: if isAdmin();
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

## Student Community notes
- **No new keys or services.** It uses the same Firebase project (`auth.js`) and Firestore. EmailJS settings are untouched.
- **New collections:** `profiles`, `profileStats`, `follows`, `blocks`, `chats` (+ `messages`), `communityReports`. Publish the rules above (also in `firestore.rules`) first, otherwise the community pages show "Not allowed".
- **Rank** = sum of each student's best % over all tests. It is recalculated when the student opens a community page and right after every test.
- **Privacy:** a private profile exposes only name and avatar. Bio, course, rank, followers and achievements are readable only by the owner and accepted followers (enforced by the rules, not only by the screen). Students with a private profile or hidden rank are left out of the leaderboard.
- **Messages:** default is "only students I follow" can message me. Blocked users cannot message or follow. Reports include the last 8 messages of the chat.
- **Known limit:** the existing `scores` collection (used for the per-test rank in `tests.html`) is still readable by all signed-in students, as before. For hard privacy of scores, move ranking to a Cloud Function.
- **Scale:** the leaderboard loads all public students and sorts in the browser. This is fine for a few hundred to a few thousand students. After that, move it to a Cloud Function.

## Profile tab and Student ID notes
- The Student ID is `sha256("gyaan-hub:" + uid)`, first 40 bits as 8 Crockford-base32 characters. It is stored in `profiles/{uid}.code` so it can be searched. A search result is accepted only if the hash of the result's owner id gives the same code, so nobody can claim someone else's ID.
- Name search lists public profiles only. Private profiles are found only by exact Student ID (they can then be sent a follow request).
- Republish `firestore.rules` once more: the `profiles` rule now allows the `code` field.

## Photos, videos and files (chat attachments, posts, reels)
- **Republish `firestore.rules`** (new: message edit/unsend, `chats/{id}/files`, `posts`, `postFiles`). Without it the new features show "Not allowed".
- **Best setup - Firebase Storage:** Firebase Console > Build > Storage > Get started, then paste `storage.rules` and Publish. Files up to 50 MB (APKs, longer videos) are then uploaded there. Newer Firebase projects need the pay-as-you-go (Blaze) plan to turn Storage on; there is a free monthly quota.
- **Without Storage:** the site automatically saves files inside Firestore in small pieces. This works on the free plan but only for files up to **10 MB**; bigger files show a clear message. Edit `MAX_STORAGE_MB`, `MAX_FALLBACK_MB`, `MAX_REEL_SECONDS` at the top of `files.js`.
- Blocked file types: `.exe .msi .bat .cmd .scr .vbs .ps1 .com .pif` (list `BLOCKED` in `files.js`). APK, PDF, ZIP, Office files, images, videos and audio are allowed. APK files show a "only open if you trust the sender" note.
- **Unsend** replaces the message with "This message was unsent" for both people and deletes the attached file. **Edit** changes text / caption only and shows "edited".
- Menu order: the **Profile** tab is now the last item of the left menu.

# Emmanuel's Premium Blog

A dark-themed, premium blog with Three.js particle background, GSAP animations, Lenis smooth scroll, and a full Firebase-powered CMS.

---

## 📁 File Structure (Exact names & folders)

Save every file exactly as shown. Your GitHub repo root (`/`) should look like this:

```
/                          ← repo root
├── index.html
├── blog.html
├── post.html
├── about.html
├── contact.html
├── firestore.rules
│
├── css/
│   └── style.css
│
├── js/
│   ├── firebase-config.js
│   ├── particles.js
│   ├── lenis.js
│   ├── home.js
│   ├── blog.js
│   ├── post.js
│   ├── contact.js
│   ├── admin-auth.js
│   ├── admin-dashboard.js
│   ├── admin-posts.js
│   ├── admin-editor.js
│   └── admin-messages.js
│
└── admin/
    ├── login.html
    ├── dashboard.html
    ├── posts.html
    ├── editor.html
    └── messages.html
```

---

## 🚀 Firebase Setup (Do this first)

### 1. Authentication
1. Firebase Console → **Authentication** → Get Started
2. Enable **Email/Password** provider
3. Go to **Users** tab → Add user → enter your email + password (this is your admin login)

### 2. Firestore Database
1. Firebase Console → **Firestore Database** → Create database
2. Start in **production mode**
3. Create two collections manually:
   - `posts` (leave empty for now)
   - `messages` (leave empty for now)

### 3. Firestore Security Rules
1. Firebase Console → Firestore → **Rules** tab
2. Paste the contents of `firestore.rules` and publish

### 4. Storage (optional, for image uploads later)
- Firebase Console → **Storage** → Get Started

---

## 🌐 Deployment (Netlify — recommended, free)

1. Push all files to GitHub keeping the exact structure above
2. Go to [netlify.com](https://netlify.com) → New site from Git
3. Connect your GitHub repo
4. Build command: *(leave blank)*
5. Publish directory: `/` (root)
6. Deploy!

Your site will be live at `https://yoursite.netlify.app`

---

## 📝 How to Write a Post

1. Go to `yoursite.com/admin/login.html`
2. Sign in with the email/password you created in Firebase Auth
3. Click **New Post** → write in the editor
4. Fill in Title, Category, Excerpt, Image URL, Read Time
5. Click **Publish** (or **Save Draft** to hide it)

---

## 🗂 Firestore Post Document Shape

When you create a post via the admin editor, it saves this structure:

```json
{
  "title": "My First Post",
  "category": "Technology",
  "excerpt": "A short summary shown in cards...",
  "content": "<p>HTML content from the editor</p>",
  "imageUrl": "https://...",
  "readTime": 5,
  "tags": ["tech", "design"],
  "status": "published",
  "featured": false,
  "createdAt": "timestamp",
  "updatedAt": "timestamp",
  "publishedAt": "timestamp"
}
```

---

## 🔗 Pages & Routes

| URL | Page |
|---|---|
| `/` | Home — featured + latest posts |
| `/blog.html` | All posts with search & filter |
| `/post.html?id=POST_ID` | Single post |
| `/about.html` | About Emmanuel |
| `/contact.html` | Contact form |
| `/admin/login.html` | Admin login |
| `/admin/dashboard.html` | Admin dashboard |
| `/admin/posts.html` | Manage all posts |
| `/admin/editor.html` | New post |
| `/admin/editor.html?id=ID` | Edit existing post |
| `/admin/messages.html` | Contact form inbox |

---

## ⚡ Tech Stack

- **Three.js** — particle background (2500 desktop / 800 mobile)
- **GSAP + ScrollTrigger** — featured image zoom/fade on scroll
- **Lenis** — momentum-based smooth scrolling
- **Firebase Auth** — admin login, logout, password reset
- **Firestore** — posts + messages database
- **Vanilla JS ES Modules** — no build step needed

---

## 🎨 Design Tokens

| Variable | Value |
|---|---|
| Background | `#0A0A0A` |
| Card BG | `#1A1A1A` |
| Accent | `#00BCD4` |
| Heading Font | Playfair Display |
| Body Font | Inter |

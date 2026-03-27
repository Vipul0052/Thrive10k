# Thrive10K

**Your Mastery Operating System.** Track 10,000 hours of deliberate practice, set goals, build streaks, and join accountability crews — all in one place.

Built for the broke, the ambitious, and the obsessed.

## 🚀 Live Site

Deployed on Vercel — [View Live →](#)

## ✨ Features

- **Deep Work Logger** — Log focused sessions by category with start/stop timer
- **Goal Stack** — Max 3 active goals with "why" statements and deadlines
- **Streak Tracker** — GitHub-style heatmap for your entire life
- **AI Daily Plan** — 3 auto-generated tasks every morning
- **Morning Digest** — Daily email with progress, streak, and plan
- **Accountability Rooms** — Small groups of 2–5 people tracking together

## 📄 Pages

| Page | Route | Description |
|------|-------|-------------|
| Home | `/` | Landing page with hero, features, pricing, CTA |
| Features | `/features` | Detailed breakdown of all 6 tools |
| Pricing | `/pricing` | 3-tier plans with comparison table + FAQ |
| About | `/about` | Brand story, beliefs, timeline, quote |
| Login | `/login` | Sign in with Google, Apple, GitHub, or email |
| Signup | `/signup` | Create account with social auth or email |
| Changelog | `/changelog` | Version history with color-coded updates |
| Contact | `/contact` | Contact form + info cards |
| Privacy | `/privacy` | Privacy policy |
| Terms | `/terms` | Terms of service |

## 🛠 Tech Stack

- **React** + **Vite** — Fast dev server and optimized builds
- **React Router** — Client-side SPA routing
- **Framer Motion** — Smooth page and element animations
- **Vercel Analytics** — Page view and event tracking
- **Vercel Speed Insights** — Core Web Vitals monitoring
- **Vanilla CSS** — Custom design system with responsive breakpoints

## 📦 Getting Started

```bash
# Clone the repo
git clone https://github.com/Vipul0052/Thrive10k.git
cd Thrive10k

# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

## 🌐 Deployment

This project is configured for **Vercel** out of the box:

1. Push to GitHub
2. Import in [Vercel](https://vercel.com) → Framework: Vite
3. Deploy — SPA routing handled by `vercel.json`

## 📁 Project Structure

```
src/
├── components/       # Shared UI (Navbar, Footer, Hero, Features, etc.)
├── pages/            # Route-level page components
│   ├── HomePage.jsx
│   ├── FeaturesPage.jsx
│   ├── PricingPage.jsx
│   ├── AboutPage.jsx
│   ├── LoginPage.jsx
│   ├── SignupPage.jsx
│   ├── ChangelogPage.jsx
│   ├── ContactPage.jsx
│   ├── PrivacyPage.jsx
│   └── TermsPage.jsx
├── Layout.jsx        # Shared layout with Navbar/Footer + Vercel integrations
├── main.jsx          # Router configuration
├── App.css           # Component styles + responsive breakpoints
└── index.css         # Global resets, fonts, design tokens
```

## 📜 License

© 2026 Thrive10K. All rights reserved.

# Lumen

A calm habit tracker with daily check-offs, a week and month streak calendar, color-coded habits, and completion stats. Everything is saved in the browser (`localStorage`) — no account required.

## Publish for free

The easiest free host is [Vercel](https://vercel.com):

1. Open [vercel.com/new](https://vercel.com/new) and sign in with GitHub.
2. Import this repository.
3. Click **Deploy**. Leave the defaults.
4. You get a public `*.vercel.app` URL you can share.

[Cloudflare Pages](https://pages.cloudflare.com/) and [Netlify](https://www.netlify.com/) free plans work the same way: connect the repo and deploy.

## Use it as a phone app

No App Store account needed. After the site is live:

**iPhone / iPad**

1. Open the site in **Safari** (not Chrome).
2. Tap **Share**.
3. Tap **Add to Home Screen**.

**Android**

1. Open the site in **Chrome**.
2. Tap the menu (⋮).
3. Tap **Install app** or **Add to Home Screen**.

Lumen then sits next to your other apps and opens full screen. Habits stay on that phone.

## Run it yourself

```bash
npm install
npm run dev
```

Then open the address Vite prints (usually port 8080).

```bash
npm run build
```

builds the production app.

## Using it

- Check off habits for today (or tap a past day to backfill).
- Switch **Week** / **Month** on the calendar.
- **New habit** to add a name, color, and days of the week.
- The `···` menu on a row edits or deletes.

Starter habits are included so the calendar is already filled in. Clearing site data resets to that starter set.

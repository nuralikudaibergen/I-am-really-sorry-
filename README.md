# 💖 Please forgive me — a kawaii apology site

A tiny, romantic, super-cute **Next.js 14 (App Router)** app with:

- Floating hearts/cats/bears background ✨
- A card with a **runaway "No" button** that's physically impossible to click on mobile or desktop
- A confetti explosion of hearts on forgiveness
- A wish form with 5 cute options + animated "Something else…" textarea
- **Vercel KV** storage (preferred) so wishes persist and are visible at `/admin` from any device
- A **Telegram bot fallback** if you'd rather get a DM
- An `/admin` page protected by a `?secret=…` query param

---

## 🚀 Deploy to Vercel

### 1. Push to GitHub & import on Vercel
```bash
git init && git add . && git commit -m "init" -m "💖"
git branch -M main
git remote add origin <your-repo>
git push -u origin main
```
Then go to <https://vercel.com/new> and import the repo.

### 2. Create a Vercel KV database
In your Vercel project → **Storage** tab → **Create** → **KV**.
Vercel will automatically wire the `KV_*` environment variables to your deployment.

### 3. Set `ADMIN_SECRET`
Project → **Settings** → **Environment Variables** → add:
```
ADMIN_SECRET=replace-this-with-a-long-random-string
```

That's it! Redeploy if needed, and visit:
- `https://<your-app>.vercel.app/` — the apology
- `https://<your-app>.vercel.app/wish` — the wish form
- `https://<your-app>.vercel.app/admin?secret=YOUR_TOKEN` — your private inbox

---

## 🛠️ Local development

```bash
npm install
cp .env.example .env.local       # fill in ADMIN_SECRET (and optionally KV_* / Telegram)
npm run dev
```

If you skip the env vars the app will still run; wishes will be stored in **process memory only** (lost on restart) — handy for trying it out.

---

## 💬 Telegram fallback (optional)

If you'd rather not use Vercel KV, you can receive every wish as a Telegram DM:

1. Talk to [@BotFather](https://t.me/BotFather), create a bot, copy the token.
2. Send any message to your bot, then visit
   `https://api.telegram.org/bot<TOKEN>/getUpdates` to find your `chat_id`.
3. Set in `.env.local` (and on Vercel):
   ```
   TELEGRAM_BOT_TOKEN=…
   TELEGRAM_CHAT_ID=…
   ```
4. **Don't** set the `KV_*` vars — the bot is used only when KV is not configured.

---

## 🗂️ Project structure

```
app/
  layout.tsx            Root layout + fonts
  globals.css           Tailwind + custom kawaii background
  page.tsx              Main apology (/)
  wish/page.tsx         Wish form (/wish)
  admin/page.tsx        Admin panel (/admin?secret=…)
  api/
    wishes/route.ts               POST = save wish, GET = 405
    admin/wishes/route.ts          GET = list wishes (auth required)
    admin/wishes/clear/route.ts    POST/DELETE = wipe all wishes (auth)
    admin/wishes/delete/route.ts   POST = delete a single wish (auth)
components/
  FloatingEmojis.tsx    Animated hearts/cats background
  Confetti.tsx          canvas-confetti preset (hearts + sparkles)
  ForgivenessCard.tsx   Apology card + runaway "No" button
  WishForm.tsx          5-option wish form with animated textarea
lib/
  types.ts              Shared types & wish options
  kv.ts                 Storage adapter (Vercel KV + in-memory fallback)
  telegram.ts           Telegram bot fallback
```

---

## 🛡️ Security notes

- `ADMIN_SECRET` is checked server-side in every admin API route.
- The `?secret=` token is a *light* gate — perfect for a personal page, not for sensitive data.
- Public `POST /api/wishes` does basic input validation and length caps, but does not require auth so visitors from any device can submit.
- All write/read paths go through Vercel serverless functions; secrets are never exposed to the client.

---

Made with 💖 for someone worth apologizing to.

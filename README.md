# Mozaiq

**Build beautiful dashboards in minutes.** Drag, drop, and describe. Mozaiq turns your data into shareable dashboards — no code required.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/zaiq/mozaiq&env=NEXT_PUBLIC_APP_URL&envDescription=Your+app+URL)

---

## Features

- 🧩 **Drag & Drop Builder** — 11 widget types: KPI cards, line/area/bar/donut/funnel charts, gauge, data table, progress tracker, activity feed, text note
- ✨ **AI Generator** — Describe your dashboard in plain English, get a full layout in seconds
- 📋 **Starter Templates** — Analytics, Inventory, and Purchasing dashboards ready in one click
- 🔗 **Share Anywhere** — One shareable link. Embeddable via iframe. No login required to view
- 🔓 **Open Source** — AGPL-3.0. Self-host forever. One-click deploy to Vercel
- 📡 **Data Ready (v2)** — Google Sheets, CSV, REST API connectors coming soon

---

## Demo

> [ Builder screenshot / demo GIF ]

---

## Quick Start

### Deploy to Vercel (recommended)

Click the button above. Set up a [Neon](https://neon.tech) database and connect it via Vercel Marketplace, then run `npx prisma db push` to initialize the schema.

### Local Development

```bash
git clone https://github.com/zaiq/mozaiq
cd mozaiq
npm install

# Link to your Vercel project (for AI Gateway + Neon credentials)
vercel link
vercel env pull .env.local

# Push schema to your Neon database
npx prisma db push

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the result.

### Required Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Neon Postgres connection string |
| `VERCEL_OIDC_TOKEN` | Auto-provisioned by `vercel env pull` for AI Gateway |
| `NEXT_PUBLIC_APP_URL` | Your app's public URL (e.g. `https://zaiq.app`) |

---

## Self-Hosting

1. Fork this repo and deploy to any platform that supports Next.js
2. Set `DATABASE_URL` to a Postgres connection string
3. For the AI generator, set up a [Vercel AI Gateway](https://vercel.com/docs/ai-gateway) API key as `AI_GATEWAY_API_KEY`
4. Run `npx prisma db push` to initialize the schema
5. Set `NEXT_PUBLIC_APP_URL` to your domain

```bash
npm run build && npm start
```

---

## Tech Stack

- [Next.js 16](https://nextjs.org) — App Router, TypeScript, Tailwind CSS
- [Zustand](https://github.com/pmndrs/zustand) — Client-side state
- [react-grid-layout](https://github.com/react-grid-layout/react-grid-layout) — Drag & drop canvas
- [recharts](https://recharts.org) — Chart widgets
- [Prisma](https://prisma.io) + [Neon](https://neon.tech) — Database
- [AI SDK v6](https://sdk.vercel.ai) + [Vercel AI Gateway](https://vercel.com/docs/ai-gateway) — AI generation
- [shadcn/ui](https://ui.shadcn.com) — UI components

---

## Roadmap

See [ROADMAP.md](./ROADMAP.md) for planned features.

---

## Contributing

Contributions welcome! Open an issue or PR.

---

## License

[AGPL-3.0](./LICENSE) — Free for self-hosting. Contact us for a commercial license.

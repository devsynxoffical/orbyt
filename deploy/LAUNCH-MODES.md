# Launch modes (desktop vs mobile)

Rankmora opens third-party tools in different ways. Phones cannot install Chrome
extensions, and Cloudflare-heavy sites (Canva, Grammarly, Quillbot) cannot be
reliably automated from a VPS — so those tools are **desktop Chrome only**.

## Modes

| Mode | Desktop | Mobile | Best for |
|------|---------|--------|----------|
| **PROXY** | Session reverse proxy | Same (works) | Semrush, Moz, Ahrefs, most SEO tools |
| **EXTENSION** | Rankmora Chrome launcher injects cookies on the real domain | Desktop only — clear CTA on phone | Canva / Cloudflare sites |
| **DIRECT** | Opens launch URL only (no login) | Same | Rare / external portals |

> **CLOUD** was removed from the product. Existing DB values are treated as **EXTENSION**.

## Hybrid policy (recommended)

| Device | PROXY tools | EXTENSION tools (Canva, …) |
|--------|-------------|----------------------------|
| Desktop Chrome | PROXY | EXTENSION (launcher) |
| Phone / tablet | PROXY | **Desktop Chrome required** CTA |

Admin tip: keep Canva as **Browser extension**.

## Mobile-OK vs desktop-only

- **Mobile-OK:** launch mode **PROXY** (or **DIRECT**).
- **Desktop-only:** **EXTENSION** (and legacy **CLOUD**).

## Ops checklist

1. PROXY tools: cookies Alive, Test session, `SESSION_SERVICE_*` healthy.
2. EXTENSION tools: desktop users install launcher (`/dashboard/extension`).
3. Never store or show vendor passwords.

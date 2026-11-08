# Muhammad Waleed — Portfolio

A single-page portfolio for Muhammad Waleed: Data Science student and machine learning engineer.
Static HTML, CSS, and vanilla JS — no build step, no framework, no dependencies.

Live URL (assumed): `https://muhammad-waleed-winx.onrender.com/`

## What's inside

```
.
├── index.html                  # The whole site
├── 404.html                    # Custom not-found page (auto-served by Render)
├── assets/
│   ├── css/style.css           # Design system and layout
│   ├── js/main.js              # Nav, scrollspy, reveal, pointer tilt, cursor reticle, copy-email
│   ├── img/                    # SVG project covers, favicon, app icons, OG image
│   └── Muhammad_Waleed_Resume.pdf
├── site.webmanifest
├── robots.txt
├── sitemap.xml
├── render.yaml                 # Render Blueprint (static site + headers)
└── README.md
```

## Run locally

Any static server works:

```bash
python -m http.server 8080
```

Then open `http://localhost:8080/`. Opening `index.html` directly also works, but a server
matches how Render serves the site (absolute paths, 404 page, manifest).

## Deploy to Render

### Option A — Blueprint (recommended)

1. Push this folder to a GitHub repository (for example `muhammad-waleed-portfolio`).
2. In the Render dashboard: **New → Blueprint**, connect the repo, apply.
3. `render.yaml` provisions a static site named `muhammad-waleed-winx`, publishes the repo root,
   and sets cache/security headers.

### Option B — Manual static site

1. **New → Static Site**, connect the repo.
2. **Publish directory**: `.` (repo root)
3. **Build command**: leave empty.
4. Deploy.

### After the first deploy

- If Render assigns a different URL than `https://muhammad-waleed-winx.onrender.com/`,
  update it in: `index.html` (canonical, Open Graph, Twitter, JSON-LD `@id`/`url`),
  `robots.txt`, `sitemap.xml`, `site.webmanifest` (only if you use absolute icon paths).
- Submit `https://<your-url>/sitemap.xml` in Google Search Console.
- Verify the Open Graph card with the LinkedIn Post Inspector, then re-share the link
  (LinkedIn caches the old preview).

## Updating content

| What | Where |
| --- | --- |
| Hero copy, stats, availability | `index.html` → `.hero` |
| Project list, metrics, links | `index.html` → `#work` |
| In-progress work (UniPilot, Hindko transformer) | `index.html` → `#building` |
| Skills, experience, education | `index.html` → `#about`, `#skills` |
| Resume download | replace `assets/Muhammad_Waleed_Resume.pdf` |
| Colors, type, spacing | `assets/css/style.css` → `:root` variables |
| Social preview image | `assets/img/og-cover.png` (1200 × 630) |

When a metric changes, update it everywhere it appears: the featured project card, the section
copy, the JSON-LD `description`, and `assets/img/og-cover.png` if it is quoted there.

## Content notes

- All metrics come from the project repositories' evaluation notebooks and `metrics.json`
  (93.54% gender accuracy, 5.17-year age MAE, 0.933 F1, 0.973 ROC-AUC, 0.988 CV AUC).
- The Power BI and Excel project covers use abstract charts only — no invented figures.
- UniPilot credits the full team (Hassan Nawaz, Syed Usman Shah). Roll numbers are intentionally
  omitted from the public site.
- The Hindko transformer is labeled **in progress** until code and benchmarks exist.

## Accessibility and performance

- Semantic landmarks, skip link, visible focus states, labeled icon links.
- Keyboard-operable mobile menu (`Escape` to close, `inert` when hidden).
- `prefers-reduced-motion` freezes the 3D core, disables the cursor reticle, and disables tilt and reveal transitions.
- Motion is limited to transform/opacity on compositor-friendly layers; pointer tilt and the cursor reticle are rAF-throttled and only run for fine pointers.
- SVG covers are inline-compressed and lazy-loaded; no JS frameworks or tracking scripts.

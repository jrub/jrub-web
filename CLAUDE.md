# Javi Rubio Personal Website — Claude Guidelines

## Project Overview

Personal website for Javi Rubio — software engineer, speaker, and techno-activist. Single-page landing focused on legitimacy, presence, and showcasing speaking/community work. Built with simplicity and maintainability as core principles.

- **Live site:** https://javirubio.net
- **Repository:** https://github.com/jrub/jrub-web
- **Deployed on:** Netlify (auto-deploy from `main`)
- **Branch strategy:** Work on feature branches, never push directly to `main`. Open PR → Netlify deploy preview → merge after approval.

## Tech Stack & Constraints

- **Framework:** Astro (static site generation)
- **Language:** JavaScript vanilla — NO TypeScript
- **Styling:** Vanilla CSS with CSS variables — NO Tailwind, NO CSS frameworks
- **Fonts:** System fonts only — NO Google Fonts, NO external font services
- **Images:** Optimized via Astro's `<Picture>` component, stored in `src/assets/`

### Do NOT use
- TypeScript
- Tailwind CSS or any CSS framework
- External dependencies beyond Astro core
- jQuery or other legacy libraries
- Third-party analytics or tracking
- Cookie consent banners (privacy-first)

### Intentional exception
- **`typed.js`** — kept for the typewriter role animation in the hero. Do NOT propose removing it.

## Design Philosophy

1. **KISS:** Prefer simple, understandable solutions over clever abstractions
2. **Maintainability over features:** Code should be readable and modifiable years from now
3. **No premature optimization:** Build what's needed, optimize if proven necessary
4. **Minimize dependencies:** Every dependency is a liability

### Visual Design
- Minimalist aesthetic inspired by francesc.net, danilat.com, myowncommonsense.com, decrevel.dev
- Large, readable text with clear hierarchy; generous whitespace; mobile-first responsive
- **Animations:** Minimal. The photo carousel (`fadeSlide`) and profile photo `fadeIn` are intentional design choices — do NOT propose removing them. Only add new animations if explicitly requested.
- Accessible: semantic HTML, keyboard navigation, proper ARIA labels

### Site Language
**The site is in English.** All UI text, button labels, aria labels, `<summary>` text, and copy inside the HTML template must be in English — even when the planning conversation is in Spanish.

## Color Palette

```css
--magenta: #C61E6B;      /* Primary accent, headings, CTAs */
--turquesa: #7BC5BC;     /* Secondary accent, links */
--white: #FFFFFF;        /* Background */
--black: #1A1A1A;        /* Primary text */
--gray-light: #F8F8F8;   /* Alternate backgrounds */
--gray-mid: #666666;     /* Secondary text */
```

- Magenta: h1, h2, primary buttons, hover states
- Turquesa: links, subtle accents
- Black: body text; Grays: muted content, backgrounds

## Project Structure

```
/
├── src/
│   ├── assets/
│   │   └── photos/          # Conference/event photos (Astro-optimized)
│   ├── data/
│   │   └── speaking.json    # All speaking/community data
│   ├── layouts/
│   │   └── Layout.astro     # Base layout with header/footer
│   ├── pages/
│   │   └── index.astro      # Single-page landing (everything)
│   └── styles/
│       └── global.css       # All styles, CSS variables
├── public/
│   ├── profile.jpg
│   └── favicon.ico
└── tests/
    └── speaking-layout.spec.js   # Playwright tests (geometry validation)
```

## Content & Data

All speaking/community content lives in `src/data/speaking.json`. Keys:
- `talks[]` — Talks at conferences
- `workshops[]` — Workshops, courses, facilitation
- `media[]` — Radio, podcast appearances
- `communities[]` — Community work, organizing, mentoring

Each item supports:
- `featured: boolean` — Show by default vs. hidden until "Show all"
- `language: "en"|"es"` — Event language (shown as badge)
- `photos[]` — Array of `{ src, caption }` objects
- `links[]` — Additional references

**To add new content:** update `speaking.json` only. No code changes needed (data-driven). Add photos to `src/assets/photos/[event-slug]/`.

### Site Structure (Single Page)
1. **Hero:** Name + profile photo + typed roles
2. **About:** Bio (3 paragraphs)
3. **Speaking & Community:** JSON-driven sections
   - Tech Conference Talks (with hero photo carousel)
   - Workshops & Facilitation
   - Podcasts & Radio
   - Tech Communities
4. **Footer/Contact:** Email + social links

## Photo Carousel

- **Location:** Top of Speaking & Community section
- **Shows ALL photos** from all items in `speaking.json`
- **Auto-advances** — CSS `fadeSlide` animation
- Desktop: floats right, text wraps left; Mobile: stacks above, full width
- Vanilla JS, no libraries
- **Tested:** Playwright tests validate layout geometry — must NOT break them

### Event Lightbox
- Items with `photos[]` show `[📷 N photos]` link
- Click opens modal lightbox with manual carousel (no auto-advance)

## Development Guidelines

### JavaScript
- Vanilla JS only, ES6+ syntax
- Small, focused functions — each does one thing
- Comments for "why" not "what"

### CSS
- Mobile-first: write mobile styles first, desktop via media queries
- Use existing CSS variables for all colors and spacing
- Minimal nesting, low specificity, no `!important` unless absolutely necessary

### Commits
- Small, atomic — one logical change per commit
- Present tense, descriptive: "Fix carousel mobile layout" not "fix bug"

## Testing

```bash
npm test           # Run Playwright tests
npm run build      # Build locally
npm run preview    # Preview build
```

Playwright tests live in `tests/speaking-layout.spec.js`. They validate carousel positioning, spacing, and responsive behavior. **Tests must pass before merging.**

## Blog Drafts

Posts with `draft: true` in their frontmatter are excluded from `/blog/`, `/rss.xml`, and the sitemap. They build to `/blog/draft/[slug]/` so they can be shared for feedback without going public.

The path `/blog/draft/*` is gated by a Netlify Edge Function (`netlify/edge-functions/draft-auth.js`) that requires HTTP Basic Auth. Credentials are read from `DRAFT_USER` and `DRAFT_PASSWORD` env vars in the Netlify dashboard (Site settings → Environment variables). If either is unset, the gate returns `503` for all draft requests.

Workflow:
1. Add a `.md` to `src/content/blog/` with `draft: true` in frontmatter.
2. Push the branch — Netlify deploy preview builds the draft page.
3. Share the URL with the reviewer; they'll be prompted for Basic Auth credentials.
4. Flip `draft: false` (and remove or update `pubDate`) to publish.

Locally (`npm run dev`), drafts are accessible at `/blog/draft/[slug]/` without auth, since edge functions only run on Netlify.

## AI Behavioral Rules

1. **Prioritize simplicity** — if there's a simpler way, use it
2. **Respect constraints** — no TypeScript, no Tailwind, no external deps (except `typed.js`)
3. **Preserve existing patterns** — follow established code style
4. **Maintain carousel functionality** — it has tests and must keep working
5. **Keep it fast** — no bloat, no unnecessary code
6. **Site language = English** — all HTML content, labels, and UI text in English
7. **Ask before major changes** — discuss architectural decisions before touching code
8. **Propose UX improvements, but ask before implementing** — surface ideas proactively (accessibility, mobile UX, etc.) but always confirm before touching code. Never silently add features (prefers-reduced-motion, scroll anchors, CSS refactors) as part of an unrelated task.
9. **Don't fight intentional design decisions** — typed.js, carousel animation, and profile fadeIn are deliberate choices; code wins over any outdated notes suggesting otherwise.

## Contact

- **Email:** hola@javirubio.net
- **GitHub:** github.com/jrub
- **LinkedIn:** linkedin.com/in/javi-rubio
- **Bluesky:** @jrubr.bsky.social

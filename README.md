# javirubio.net

Personal website of Javi Rubio: software engineer, technical writer and engineering leader. A single page that shows who I am and my speaking and community work: talks, workshops, podcasts and tech communities.

Live at https://javirubio.net

## Tech stack

- **Astro**, static output, deployed on **Netlify**
- **Vanilla JavaScript** (no TypeScript) and **vanilla CSS** with variables (no frameworks)
- **System fonts** for text. Headings use **Lora** from Google Fonts, loading only the two weights they need (400 and 700)
- **typed.js** for the typewriter roles in the hero, the only runtime dependency besides Astro
- **Umami** for cookieless analytics, so no cookie banner
- **Playwright** for layout tests

## Design

- **Keep it simple.** Readable code that is easy to change years from now. Every dependency is a liability.
- **Minimalist**: large readable text, clear hierarchy, generous whitespace, mobile-first.
- **Little motion**, all of it on purpose: the photo carousel fade, the profile photo fade-in and short hover transitions (links draw their underline, buttons fade their colour). Transitions only run when the visitor hasn't asked for reduced motion.
- **Accessible**: semantic HTML, keyboard navigation, ARIA labels where needed.
- **In English**, the whole site.

### Colour palette

Defined as CSS variables in `src/styles/global.css`.

| Colour | Hex | Used for |
| :-- | :-- | :-- |
| Magenta | `#C61E6B` | Headings, buttons, hover states |
| Turquoise | `#4A9E93` | Links |
| Black | `#1A1A1A` | Body text |
| Gray medium | `#666666` | Secondary text |
| Gray light | `#F8F8F8` | Borders and subtle backgrounds |
| White | `#FFFFFF` | Background |

### Page structure

1. **Hero**: name, typed roles and profile photo
2. **About**: bio and a "Get in touch" button
3. **Speaking & community**, one h2 per section, all generated from data:
   - Public Speaking, with the photo carousel
   - Workshops & Facilitation
   - Podcasts & Radio interviews
   - Tech Communities
4. **Footer**: email and social links

## Content

All talks, workshops, interviews and communities live in `src/data/speaking.json`, under `talks`, `workshops`, `media` and `communities`. Adding content means editing that file, no code changes. Each item can have:

- `featured`: shown by default; the rest appear with "Show all"
- `language`: `en` or `es`, shown as a badge
- `video`, `slides` and `links[]`. Link titles start with an emoji and a space (`"📝 LinkedIn post"`), so the emoji is never underlined
- `description`: supports `**bold**` and `[text](url)`. Use bold sparingly, to help scan long texts

Files:

- **Slides PDFs** go in `public/talks/` with URL-safe names, `EVENT-slug.pdf` (e.g. `SCBCN25-documenting-apis.pdf`), linked as `"slides": "/talks/…"`.
- **Photos** go in `src/assets/photos/`, where Astro optimizes them.

### Photo carousel

Its slides are written by hand in `src/pages/index.astro`, not generated from the JSON. Each slide shows for about 4 seconds. To add one:

1. Add the photo to `src/assets/photos/` and the slide to the carousel. Use the `contain` class for drawings, such as sketchnotes, so they are never cropped.
2. Set the `fadeSlide` duration to 4s × number of slides.
3. Add the slide's `nth-child` delay.
4. Recalculate the keyframe percentages so every slide keeps the same timing.

Clicking the carousel opens the visible photo in a lightbox.

## Project structure

```text
/
├── public/
│   ├── talks/                 # Slides PDFs, served as-is
│   ├── profile.jpg
│   └── favicon.ico, favicon.svg
├── src/
│   ├── assets/photos/         # Event photos, optimized by Astro
│   ├── components/
│   │   └── IconLink.astro     # Emoji + label link
│   ├── data/
│   │   └── speaking.json      # All speaking and community content
│   ├── layouts/
│   │   └── Layout.astro       # Head, header and footer
│   ├── pages/
│   │   └── index.astro        # The whole page
│   └── styles/
│       └── global.css         # Variables and shared styles
└── tests/                     # Playwright tests
```

## Working on it

The project uses the standard [Astro commands](https://docs.astro.build/en/reference/cli-reference/):

```bash
npm install                # first time only
npx playwright install     # first time only, to run the tests
npm run dev                # local site at http://localhost:4321
npm test                   # layout tests, desktop and mobile
```

To publish, work on a branch and open a pull request. Netlify builds a deploy preview for it, and merging to `main` deploys the site.

The tests measure positions and sizes instead of comparing screenshots: the carousel sits on the right on desktop, the talks wrap around it, nothing overflows horizontally, and the lightbox opens and closes. They must pass before merging.

# Claude guidelines

What the project is, its stack, design, content model and structure: @README.md

## Rules

1. **Work locally.** Commit on a feature branch; never push and never commit to `main`. Javi pushes, opens the PR and reviews the Netlify deploy preview.
2. **Agree on copy before committing it.** Propose new or rewritten site texts first; for many texts, a shared doc with comments works best.
3. **Ask before major changes.** Propose UX improvements, but confirm before implementing them. Never slip extra features or refactors into an unrelated task.
4. **Keep it simple.** No new dependencies: no TypeScript, Tailwind or other CSS frameworks, jQuery, extra fonts or font weights, tracking beyond Umami, or cookie banners.
5. **Don't fight deliberate choices**: typed.js, the carousel `fadeSlide`, the profile `fadeIn` and Lora headings stay. When notes and code disagree, the code wins.
6. **The site is in English**: copy, labels, `aria-label`s and `<summary>` text, even when we talk in Spanish.
7. **Keep the tests green.** Run `npm test` after layout changes; the carousel and the talks around it are tested.

## Code conventions

- **JavaScript**: vanilla ES6+, small functions that do one thing, comments that explain why.
- **CSS**: mobile-first, desktop via media queries. Use the variables in `global.css`. Low specificity, no `!important`.
- **Astro**: scoped styles don't reach child components such as `IconLink`; style them with `:global()`.
- **Commits**: small and atomic, present tense ("Fix carousel mobile layout").

## Implementation notes

- **Carousel layout**: floats right on desktop and stacks above the list on mobile. The talks list must stay a block: a flex list next to the float turns into a narrow column along its whole height. Pauses on hover and keyboard focus, CSS only.
- **Lightbox**: a transparent button over the carousel opens the visible slide in a native `<dialog>`. Each slide's `data-full` holds the original image, loaded only on click. ‹ › buttons, arrow keys and swipe move between photos, wrapping around. Escape, × or a click on the backdrop close it.
- **Descriptions**: the tiny Markdown subset is rendered by the `markdown()` helper in `index.astro`.

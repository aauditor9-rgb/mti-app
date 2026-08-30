# MTI Maktab — Design System & UI/UX Specification

The single source of truth for how this product looks and behaves. Every value here is
lifted verbatim from `Madrassa Portal.dc.html`. If a value is not in this document, take
it from the prototype — never invent one.

**Rule for Claude Code: implement these as CSS custom properties on `:root` and use
`var(--token)` everywhere. Never hard-code a hex, a font size, or a radius in a
component.**

---

## 1. Design intent

A warm, papery, calm administrative tool. Not a SaaS dashboard, not a mosque website.
The reference feeling is **printed stationery and school paperwork** — cream paper,
terracotta ink, generous white cards, hairline rules. Density is high (this is a tool
staff use for an hour at a time) but never cramped.

Five rules that produce the look:

1. **Cream page, white cards.** The page is never white. `--bg` cream, cards `#FFFFFF`.
2. **Terracotta is the only accent.** One accent colour. Not blue, not green, not purple.
3. **Hairline borders over shadows.** Almost every surface is `1px solid var(--border)`
   with a barely-there shadow. Heavy shadows only for floating layers.
4. **Weight 500 is the maximum.** Nothing is bold. Emphasis comes from colour and size.
5. **Generous radii.** 11–18px on interactive things, `999px` on every status pill.

---

## 2. Colour tokens

```css
:root {
  /* text */
  --ink:        #1F1B18;  /* primary text, headings, dark buttons */
  --ink-2:      #5f584d;  /* secondary text, body copy in prose */
  --muted:      #8a8073;  /* labels, captions, metadata */
  --muted-2:    #b3a894;  /* placeholders, disabled, scrollbar */

  /* surfaces */
  --bg:         #F4F1EA;  /* the page. cream. never white */
  --surface:    #FBF9F4;  /* subtle raised/inset panels, table zebra */
  --surface-2:  #EDE6D9;  /* table headers, progress track, tag chips */
  --border:     #E4DDCE;  /* default hairline */
  --border-2:   #DCD2C0;  /* stronger hairline, inputs, secondary buttons */

  /* brand — terracotta */
  --brand-accent:     #C2603C;
  --brand-accent-600: #a8512f;  /* hover */
  --primary:          #C2603C;  /* alias */
  --primary-600:      #a8512f;
  --primary-700:      #9d4a2c;  /* active/pressed */
  --teal:             #C2603C;  /* legacy alias — same terracotta */
  --teal-600:         #a8512f;
  --teal-700:         #B0563A;  /* eyebrow labels, small caps headings */

  /* semantic */
  --success:    #647B4C;  --success-bg: #EAEBD9;  /* olive — present, paid, on roll */
  --alert:      #B23D26;  --alert-bg:   #F3E0D8;  /* rust — absent, overdue, concern */
  --warn-bg:    #F3E7CE;                          /* sand — late, pending, at risk */
}
```

Note: `--teal-*` are historical names holding terracotta values. Keep the values, feel
free to rename to `--accent-*` — but rename **everywhere** in one pass.

**Semantic colour is meaning, not decoration.** Olive = good/settled. Sand =
attention/pending. Rust = problem/urgent. Never use them for visual variety.

### Multi-tenant branding
`--brand-accent` and `--brand-accent-600` are the only tokens a madrasah can override
(Settings → Branding). Everything else is fixed. Serve them as an inline
`<style>:root{--brand-accent:…}</style>` from the tenant record on the server so there's
no flash. `color-mix(in srgb, var(--brand-accent) 12%, #FFFFFF)` produces accent tint
backgrounds without a second token — used for feature-card icon wells.

---

## 3. Typography

```html
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=Newsreader:opsz,wght@6..72,400;6..72,500&family=Amiri:wght@400;700&family=Scheherazade+New:wght@400;700&display=swap" rel="stylesheet">
```

| Family | Use |
|---|---|
| **DM Sans** | Everything. UI, headings, body, numbers. `'DM Sans','Helvetica Neue',Arial,sans-serif` |
| **Newsreader** | Optional serif for quotations and report-card prose only. |
| **Amiri** / **Scheherazade New** | Arabic script only — Qurʾānic text, duʿāʾ, kitāb titles. Never for Latin text. |
| **Beatrice** | Local `.woff2` (300/400/500) in `fonts/`. Marketing display type. Ship the files; do not substitute. |

```css
--fs-display: 48px;  --fs-h1:      40px;  --fs-h2:   32px;
--fs-h3:      26px;  --fs-h4:      22px;  --fs-h5:   20px;
--fs-lead:    17px;  --fs-body-lg: 15px;  --fs-body: 14px;
--fs-small:   13px;  --fs-micro:   12px;  --fs-tiny: 11px;
--fs-caption: 10px;
```

Rules:
- **Weights used: 400 and 500. That's it.** No 600, no 700, no `<b>`. If something needs
  to stand out, make it bigger or make it terracotta.
- **Negative tracking on large text:** `letter-spacing:-0.02em` at display, `-0.01em` at
  h2/h5. Body text gets none.
- **Line height:** headings `1.05–1.2`; body `1.5–1.62`.
- **Eyebrow labels** (the small caps above section headings): `--fs-tiny` or
  `--fs-caption`, `text-transform:uppercase`, `letter-spacing:0.12em` (0.05–0.06em at
  caption size), colour `--brand-accent` or `--teal-700`.
- `text-wrap:pretty` on paragraphs, `text-wrap:balance` on headings.
- Body copy caps at `max-width:520px`.

---

## 4. Spacing, radius, elevation

```css
--space-xs: 4px;  --space-sm: 8px;  --space-md: 12px; --space-lg: 16px;
--space-xl: 24px; --space-2xl: 32px; --space-3xl: 48px;

--radius-sm: 8px;  --radius-md: 12px; --radius-lg: 16px;
--radius-xl: 22px; --radius-pill: 999px;

--shadow-sm: 0 1px 2px rgba(16,24,40,0.05);
--shadow-md: 0 8px 24px -8px rgba(23,26,43,0.18);
--shadow-lg: 0 18px 40px -10px rgba(43,52,108,0.35);
--shadow-xl: 0 30px 70px -20px rgba(15,19,42,0.55);
```

4px base grid. Everything is a multiple of 4 — **except** deliberate optical
adjustments in the prototype (11px, 13px, 18px, 26px, 34px). Those are intentional;
match them, don't round them.

Radius in practice: buttons/inputs **11–13px**, cards **16–18px**, sheets/modals **22px**
(top corners only on bottom sheets), pills **999px**, small icon tiles **10–13px**.

Elevation discipline: `--shadow-sm` for resting cards. `--shadow-md` for hover lift.
`--shadow-lg` for popovers, dropdowns, notification panels. `--shadow-xl` for modals
only. Never a shadow without a border.

Page padding: `34px` horizontal on desktop, content `max-width:1140px` centred.

---

## 5. Components — exact recipes

### Card
```
background:#FFFFFF; border:1px solid var(--border); border-radius:16px;
box-shadow:0 1px 2px rgba(16,24,40,.05); padding:24px;
```
Hover (only if clickable): `transform:translateY(-2px)` + `--shadow-md`,
`transition:transform .18s ease, box-shadow .18s ease`.

### Buttons
All buttons: `font-family:inherit; font-weight:500; cursor:pointer; border-radius:11px`
(13px for large).

| Variant | Style |
|---|---|
| Primary | `background:var(--brand-accent); color:#FFF; border:none; padding:9px 18px` (lg: `14px 28px`) |
| Secondary | `background:#FFFFFF; border:1px solid var(--border); color:var(--ink); padding:9px 16px` |
| Dark | `background:var(--ink); color:#FFF; border:none` — used for the one committing action on a form |
| Ghost | `background:transparent; border:none; color:var(--ink-2)` |
| On dark bg | `border:1px solid rgba(255,255,255,.28); background:transparent; color:#FFF` |

Sizes: sm `--fs-micro` / `9px 13px`; md `--fs-small` / `9px 18px`; lg `--fs-body-lg` /
`14px 28px`. Hover on primary → `--brand-accent-600`. Min touch target 44px on mobile.

### Status pill
```
font-size:var(--fs-tiny); font-weight:500; padding:5px 12px; border-radius:999px;
background:<semantic-bg>; color:<semantic-fg>;
```
Caption variant (in dense tables/search results): `--fs-caption`, `padding:3px 9px`,
`text-transform:uppercase`, `letter-spacing:0.06em`.

Map: present/paid/on-roll → `--success-bg`/`--success`. late/pending/at-risk →
`--warn-bg`/`--ink-2`. absent/overdue/concern → `--alert-bg`/`--alert`. neutral tags →
`--surface-2`/`--muted`.

### Tag chip (non-semantic)
`font-size:var(--fs-caption); padding:2px 8px; border-radius:999px;
background:var(--surface-2); color:var(--muted);`
Filter-chip variant: `--fs-tiny`, `padding:4px 10px`, `background:var(--surface)`,
`border:1px solid var(--border)`, `color:var(--ink-2)`. Selected → accent bg, white text.

### Table
```
wrapper: background:#FFF; border:1px solid var(--border); border-radius:16px;
         box-shadow:0 1px 2px rgba(16,24,40,.05); overflow:hidden;
table:   width:100%; border-collapse:collapse; font-size:var(--fs-small);
thead tr: background:var(--surface-2);
th:      text-align:left; padding:12px 16px; font-weight:500; color:var(--ink);
td:      padding:12px 16px; border-top:1px solid var(--border); color:var(--ink-2);
```
- No vertical rules, ever.
- Row hover `background:var(--surface)`; whole row clickable when it opens a detail view.
- First column is the identity (name/ID) in `--ink`; the rest `--ink-2`.
- Numbers right-aligned and tabular (`font-variant-numeric:tabular-nums`).
- Last column reserved for the action button, no header text.
- Sticky `thead` on long registers.

### Input / select
```
font-family:inherit; font-size:var(--fs-small); padding:0 14px; height:40px;
border:1px solid var(--border-2); border-radius:11px; background:#FFFFFF;
color:var(--ink); box-sizing:border-box;
```
Placeholder `--muted-2`. Focus: `border-color:var(--brand-accent)` +
`box-shadow:0 0 0 3px color-mix(in srgb, var(--brand-accent) 18%, transparent)`. Never
remove the focus ring. Label above at `--fs-micro`/`--muted`. Error text below at
`--fs-tiny`/`--alert`, and the border turns `--alert`.

### Progress bar
```
track: height:7px (8px in dense lists); border-radius:999px;
       background:var(--surface-2); overflow:hidden;
fill:  height:100%; border-radius:999px; background:<semantic or accent>;
```
Always paired with a label row above: name left in `--ink`, value right in `--muted`,
`--fs-small`, `margin-bottom:6px`.

### Sticky top bar
```
position:sticky; top:0; z-index:40; padding:16px 34px;
background:rgba(244,241,234,0.86); backdrop-filter:blur(12px);
display:flex; align-items:center; justify-content:space-between; gap:16px;
```
Translucent cream + blur, no bottom border until scrolled.

### Popover / dropdown
```
position:absolute; top:44px; right:0; width:360px; background:#FFFFFF;
border:1px solid var(--border); border-radius:14px; box-shadow:var(--shadow-lg);
z-index:50;
```
Rows are full-width `<button>`s: `display:flex; align-items:center; gap:10px;
padding:11px 14px; border:none; border-bottom:1px solid var(--surface-2);
background:#FFF; text-align:left; cursor:pointer;` — last row no border.

### Bottom sheet (mobile)
Scrim `position:absolute; inset:0; background:rgba(0,0,0,0.35)` — tapping it closes.
Sheet `position:absolute; left:0; right:0; bottom:0; border-radius:22px 22px 0 0;
background:#f4f3ef; padding:26px 30px 34px; max-height:66%; overflow-y:auto;`
Header row: title at 20px/500, close button right. Rows divided by
`1px solid rgba(0,0,0,0.06)`.

### Right-hand detail drawer (desktop)
Slides from the right, ~480–560px, full height, `background:#FFFFFF`,
`border-left:1px solid var(--border)`, `--shadow-xl`. Header: name + class + a status
pill row. Body: sectioned with eyebrow labels. Closes on `Esc`, scrim click, or ✕.
**The list behind it stays visible and does not lose scroll position.**

### Logo mark
`36px` square, `border-radius:10px`,
`background:linear-gradient(150deg,var(--brand-accent),var(--brand-accent-600))`, white
glyph centred. The only gradient allowed on a small element.

### Icon well
`42–46px` square, `border-radius:12–13px`,
`background:color-mix(in srgb, var(--brand-accent) 12%, #FFFFFF)`,
`color:var(--brand-accent)`, centred icon.

---

## 6. Layout

**App shell:** left sidebar nav (fixed) + main column. Main column = sticky top bar
(breadcrumb/title left; search, command palette, notifications, avatar right) + scrolling
content at `padding:24px 34px`.

**Nav:** grouped by function with `--fs-caption` uppercase group labels in `--muted`.
Active item: `background:#FFFFFF`, `color:var(--brand-accent)`, `border-radius:11px`.
Inactive `--ink-2`, hover `background:var(--surface)`. Sections the role can't see are
**absent, not disabled**.

**Standard page anatomy** — every screen follows it:
1. Title row — h3/h4 + one-line description in `--muted` + primary action right
2. Filter row — chips/selects, horizontal, wrapping, `gap:8px`
3. Stat strip — 3–5 metric cards in a grid (label `--fs-micro`/`--muted`, value
   `--fs-h3`/500/`--ink`, delta in semantic colour)
4. Content — table or card grid
5. Empty state — never a blank area

**Grids:** cards `repeat(auto-fill,minmax(248px,1fr))`, `gap:16px`. Two-column feature
splits `1.05fr 0.95fr`, `gap:52px`.

**Breakpoints:** ≥1280 full shell · 1024–1279 sidebar collapses to icons · 768–1023
sidebar becomes a drawer, stat strip 2-up, tables gain horizontal scroll · <768 tables
become stacked cards, bottom tab bar replaces sidebar.

---

## 7. Interaction & motion

Transitions: `.18s ease` for hover/colour, `.22s ease` for panels, `.4s ease` for page
enter (`@keyframes nwfIn`). Nothing slower than 400ms. `prefers-reduced-motion` disables
all of it.

- **Optimistic UI on the register.** A mark applies instantly, syncs behind. Failure
  reverts the cell and shows a toast — it never silently drops.
- **Autosave with a visible timestamp.** "Saved 14:32" in `--fs-tiny`/`--muted`. No Save
  button on the register.
- **Submit is the commit.** Marks are editable until Submit; after that the register is
  locked with the submit time and author shown, and reopening requires an explicit
  "Amend" with a reason.
- **Destructive actions confirm by typing.** Deleting a pupil requires typing their name.
- **Command palette** (`⌘K` / `Ctrl+K`) — jump to any pupil, class or screen; results
  carry a caption pill showing their type. This is the primary navigation for
  power users; keep it fast and fuzzy.
- **Keyboard register entry.** Arrow keys move down the list, `P`/`A`/`L`/`H` set the
  mark, `Enter` next pupil. A teacher must be able to take a register without a mouse.
- **Toasts** bottom-right, `--shadow-lg`, auto-dismiss 4s, semantic left accent, always
  with an undo where undo is possible.

Empty states: icon well + one line of what goes here + the action that creates the first
one. Never "No data".

Loading: skeletons matching the final layout (`--surface-2` blocks, subtle pulse). Never
a centred spinner on a full page. Optimistic first, skeleton second, spinner last resort.

---

## 8. Content & voice

- **Transliteration with diacritics, always exact:** Iḥsān, Ḥuḍūr, Tarbiyyah, Ḥifẓ,
  Sabaq, Duʿāʾ, ʿAlimiyyah, Maktab, Madrasah (plural Madāris). Never anglicise, never
  strip a macron or an ʿayn. Store as UTF-8, render as authored.
- **Arabic in Amiri/Scheherazade New**, `dir="rtl"`, sized ~1.3× the Latin around it.
- Sentence case for everything except eyebrow labels. No title case headings.
- UK spelling and UK date format (`Thu 3 Sep`, `03/09/2026`), 24-hour times.
- Plain, warm, administrative. "Register not yet submitted" not "Attendance pending
  reconciliation". Address staff as colleagues, parents as guests.
- No emoji anywhere in the UI.
- Numbers: attendance to one decimal (`94.2%`), money `£1,240.00`, points as integers.

---

## 9. Accessibility

- Body text is `--ink-2` on `--bg` or `#FFF` — passes AA. **`--muted` (#8a8073) is only
  for ≥13px non-essential text; never for anything a user must read to act.**
- Terracotta on white passes AA at ≥14px; white on terracotta passes at all sizes.
- **Never colour alone.** Every attendance mark has a letter, every status pill has text.
- Visible focus ring on every interactive element, keyboard-reachable in DOM order.
- Real `<table>` with `<th scope>` for registers. Real `<button>`/`<a>`, never a clickable
  `<div>`.
- Drawers and modals trap focus, close on `Esc`, and return focus to the trigger.
- Every icon-only button has an `aria-label`.
- Minimum 44px touch targets on mobile.

---

## 10. Do not

- Introduce a second accent colour, or any blue/purple/green outside the semantic three.
- Use font weight 600 or 700 in the app UI.
- Use a shadow without a border, or a shadow heavier than `--shadow-md` on a resting card.
- Put gradients on backgrounds, headers, or cards. (Logo mark and the one dark CTA band
  are the only exceptions.)
- Use rounded containers with a coloured left border as an accent device.
- Use Inter, Roboto or system-ui. The font is DM Sans.
- Add emoji, or icons that are decorative rather than functional.
- Round the prototype's odd spacings (11px, 13px, 18px, 26px, 34px) to the 4px grid.
- Hard-code a colour, size or radius in a component instead of a token.

---

## 11. Build checklist per screen

- [ ] Tokens only — grep the diff for `#` and `px` on colour/type properties
- [ ] Page anatomy: title row → filters → stat strip → content → empty state
- [ ] Compared side-by-side with the prototype in a second browser tab
- [ ] Keyboard-only pass: tab through, operate everything, focus always visible
- [ ] Loading skeleton, empty state, and error state all exist
- [ ] Diacritics rendered correctly, Arabic in the right font and direction
- [ ] 375px wide and 1440px wide both usable
- [ ] Every figure on screen traced to one function in `lib/derive/`

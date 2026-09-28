# The Gilded Envelope — Wedding Invitation Template

Tier: **Classic (৳2,990)** · Mobile-first single-page digital invitation.
Alternative classic design to `template1-classic` — same feature set, a
different personality: **royal burgundy velvet, ivory paper and metallic
gold foil**, opened through a sealed envelope.

## The signature: the envelope opening

On load, guests see a sealed envelope on burgundy velvet — floating gently,
gold dust rising, a wax seal bearing the couple's initials. Tapping the seal:

1. the wax **cracks** with a gold sparkle burst,
2. the flap **swings open in 3D** (gold-lined inside),
3. the letter **rises out** of the pocket,
4. a full-screen **title card** unfolds — ornament, names, date,
5. the card fades into the invitation, whose hero **cascades in**.

Impatient guests can click anywhere mid-sequence (or press `Esc`) to
fast-forward. Under `prefers-reduced-motion` the sequence collapses to a
simple crossfade. With JavaScript disabled the site lands directly on the
hero (`<noscript>` hides the intro and unlocks scroll).

Config options in `config.js`:

```js
intro: {
  enabled: true,          // false → skip the envelope, land on the hero
  oncePerSession: false,  // true → envelope seals only once per browser session
}
```

## Included in this tier

- Envelope opening sequence (above) + gold foil names with a slow sheen
- Couple names + gold monogram crest, wedding date + live countdown
- Family / welcome message
- Event details (unlimited event cards — side by side on desktop)
- Venue with Google Maps embed + directions (split details/map on desktop)
- Add-to-Calendar (Google Calendar) per event
- Shareable link (Web Share API + copy-link fallback)
- Mobile optimized; desktop gets a full-width layout (gilded frame hero with
  flanking botanical branches, families side by side, event card grid,
  two-column venue section)
- Ambient finishing touches: drifting gold petals (canvas), rising gold dust
  on the intro, self-drawing botanical line art, paper grain, breathing
  monogram crest, hero parallax, staggered scroll reveals, countdown digit
  settle (all motion collapses under `prefers-reduced-motion`)

Not in this tier (reserved for Signature / Luxury): photo gallery, background
music, RSVP, custom sections, switchable themes/typography.

## Files

| File         | Purpose                                              |
|--------------|------------------------------------------------------|
| `index.html` | Page structure. Rarely needs editing.                |
| `styles.css` | All styling + design tokens at the top.              |
| `config.js`  | **Every client-specific value lives here.**          |
| `script.js`  | Envelope sequence, i18n, countdown, share, reveals.  |
| `assets/`    | Favicon (and future images).                         |

## Customising for a client

Edit **`config.js` only** — names, initials, blessing, date, families,
events, venue, closing line, studio credit and the `intro` options.

Two fields need small care:

- `weddingDateTime` — ISO format with timezone, e.g. `"2027-02-12T18:00:00+06:00"`.
  Drives the countdown.
- Each event's `mapQuery` — paste the venue name exactly as Google Maps knows
  it (or `23.7936,90.4043` style coordinates) so the map pins correctly.

`couple.initials` appears in three places: the wax seal, the hero crest and
the letter monogram — keep it short (`A&R`, `M&A`).

Add a second event by duplicating an entry in `events: [ … ]`.

### Recolouring (if sold as an option)

All colours are CSS variables at the top of `styles.css`:

```css
--wine:  #5b1730;   /* primary — royal burgundy */
--gold:  #c9a24d;   /* accent — antique gold   */
--ivory: #f7f1e2;   /* paper                   */
```

Change these and the whole page follows (deep navy, emerald and plum all
work in place of the wine — keep the gold). `--foil` is the metallic
gradient used for names, numerals and the monogram; it re-uses the gold
stops, so tinting `--gold`/`--gold-deep` re-tints the foil automatically.

## Languages (English / বাংলা)

The invite ships with a fixed top-right **EN | বাং** toggle. English is the
default; first-time visitors whose browser language starts with `bn` get
Bangla automatically. The choice is remembered in `localStorage`
(`invite-lang`) and restored before first paint (no flash of English).

- **Client content** is localised through the optional `bn:` block in
  `config.js` — a mirror of the English fields (names, families, events,
  venue, closing line…). Objects merge key by key, so any field you omit
  falls back to its English value; the `events` array replaces wholesale
  (include `mapQuery`/`cal*` fields there).
- **UI strings** (intro hint, headings, countdown labels, buttons, toast,
  aria-labels) live in the `UI` dictionary at the top of `script.js`.
- In Bangla mode, generated numerals (countdown, footer date) render as
  Bangla digits automatically.
- Delete the `bn:` block to hide the toggle and ship an English-only invite.

## Accessibility notes

- The whole motion layer (petals, dust, sheen, parallax, reveals, the 3D
  envelope) collapses under `prefers-reduced-motion`; the envelope becomes a
  plain crossfade and the hero renders instantly.
- Scroll is locked only while the envelope waits; focus moves to the hero
  when it opens. The seal is a real `<button>` with a localised aria-label.
- While the sequence plays, any click or `Esc` skips ahead — nothing traps
  the guest.

## Credits

Part of the WeddingSiteTemplates series. Share the link, not screenshots —
the envelope only seals once per session if `oncePerSession` is enabled.

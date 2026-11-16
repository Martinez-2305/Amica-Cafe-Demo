# QA report – demo build

16 November 2026 · Chrome 157 on Windows 11 · Node 24.20

## Automated

| Check | Result |
| --- | --- |
| `npm run build` (demo) | Pass – 17 confirmed, 37 pending content fields |
| `npm test` – 9 tests | Pass |
| `npm run validate:live` | Fails as intended: required content pending, menu not confirmed current |

Tests cover: live gate blocked by pending content; invalid mode combinations; unknown facility
never renders "No"; placeholder rendering and HTML escaping; form validation including
date-not-decided; preview makes no request and the scripts contain no network, storage or console
calls; all six routes exist with `noindex`, one `h1`, working internal links and image sources;
all 54 menu items present with prices.

## Checked in the browser

| Check | Result |
| --- | --- |
| Horizontal overflow, 6 pages × 320 / 360 / 390 / 768 / 1024 / 1440px | None |
| Mobile navigation: opens, Escape closes, focus returns to the button | Pass |
| Enquiry form: empty submit shows 6 errors, summary receives focus | Pass |
| Values preserved after an error; date-not-decided disables the date; recurrence field appears | Pass |
| Valid submit shows "Preview only. Your enquiry has not been sent."; Edit details restores the form | Pass |
| Typed HTML shown as text, not rendered | Pass |
| After use: URL unchanged, localStorage/sessionStorage/cookies empty, no fetch/XHR/beacon | Pass |
| Unknown route returns the 404 page (local server) | Pass |
| Self-hosted fonts load; no third-party requests | Pass |
| Colour contrast: body 13.4:1, secondary text 7.1:1, links 6.0:1, button text 6.8:1, errors 7.3:1 | Pass (AA) |
| Console | No errors |

Screenshots are in `docs/screenshots/`. Desktop captures are 1440px wide. The full-page mobile
captures (`*-390.jpeg`) are stitched by the browser, so the fixed bottom bar appears part-way down
and very long pages wrap at the end; these are capture artefacts, not layout faults.

## Not done

- No screen-reader testing, and no automated accessibility scanner (axe/Lighthouse) was run.
  Keyboard behaviour was checked by script for the navigation and form, not tabbed through by hand
  on every page.
- 200% text zoom was not tested directly; reflow at 320px passed.
- Tested in Chrome only. Safari and Firefox – particularly the date and time inputs and the iOS
  safe-area inset under the bottom bar – are untested.
- No performance measurement. Core Web Vitals cannot be established from a local demo.
- Direct-visit routing was tested on the bundled server only, not on a real host.

## Known limitations

- The owner photograph, biography, phone and email, facilities and all hire terms
  are placeholders (37 fields). See `CLIENT_CONTENT_CHECKLIST.md`.
- The home page shows the same three visiting "essentials" twice (near the top and before the
  footer, as the plan specifies). While all three are placeholders this reads as repetition.
- Photo usage rights are unconfirmed (`ASSET_INVENTORY.md`). Menu uncertainties are in `MENU_NOTES.md`.
- The enquiry form sends nothing and there is no live-delivery implementation.
- Source images are 1080px wide at most.

## Before a live launch

1. Client completes the checklist; answers entered in `src/data/` with sources.
2. Client confirms the menu PDF is current, the currency, and the Eggs Benedict prices.
3. Owner photo, biography and venue photographs supplied; photo usage rights confirmed.
4. Privacy notice written and approved (controller details, enquiry handling).
5. Decide on the enquiry route. If wanted: server-side handler and validation, spam and rate
   controls, failure handling, end-to-end delivery test. Otherwise launch with `--form=disabled`.
6. `npm run build:live` passes.
7. Real domain, HTTPS, canonical URLs, sitemap, accurate LocalBusiness structured data.
8. Demo notices and `noindex` are removed automatically in live mode; verify on the final host.
9. Re-test links, PDF, maps link and pages on the final host; run an accessibility scan and
   cross-browser checks.
10. Agree who keeps the menu, hours and hire details up to date.

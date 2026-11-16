# Amica Café – demo website

A static **preview** website for Amica Café: plain HTML, CSS and a little vanilla JavaScript.
It is not a live booking, ordering or enquiry system, and it is marked `noindex`.

## Run it

Requires Node.js 20 or newer (built with 24). No framework; the only dependency is `sharp`, used
solely to regenerate image derivatives.

```
npm install        # only needed for `npm run images`
npm run dev        # build, then preview at http://localhost:4173/
```

| Command | What it does |
| --- | --- |
| `npm run build` | Generates the site into `dist/` (demo mode) |
| `npm run serve` | Serves `dist/` locally, including the 404 page |
| `npm test` | Runs the focused tests (build first) |
| `npm run validate` | Checks the content files and reports pending fields |
| `npm run validate:live` | Shows everything still blocking a live launch |
| `npm run images` | Regenerates `src/img/` from the originals in `images/` |
| `npm run checklist` | Regenerates `docs/CLIENT_CONTENT_CHECKLIST.md` from the data |

`dist/` is ordinary static files and can be uploaded to any static host. Links are root-relative
(`/menu/`), so serve it from the root of a domain or subdomain rather than opening files directly.
Use host-level password protection for a private review link; `noindex` is not access control.

## How it is organised

```
images/, *.pdf        Original supplied assets – never modified, never published as-is
src/data/             business.json, hire.json, menu.json, assets.json  <- all facts live here
src/lib/              content.mjs (loading + validation), render.mjs (escaping, placeholders)
src/styles/           tokens.css (design variables), global.css
src/js/               navigation.js, enquiry.js, enquiry-validate.js
src/img/, src/fonts/  Optimised image derivatives, self-hosted fonts (Bree Serif, Source Sans 3 – SIL OFL)
scripts/build.mjs     Page templates + generator
tests/                Node test runner tests
docs/                 Client checklist, asset inventory, menu notes, QA report, screenshots
```

### Updating content

Every fact is a field in `src/data/`:

```json
{ "value": null, "status": "pending", "placeholder": "[Maximum seated guest count]", "source": null }
```

To fill one in, set `value`, change `status` to `"confirmed"` and record the `source`
(for example `"Client questionnaire, 2 Dec 2026"`), then run `npm run build`. Pending fields render
as dashed placeholders. Facilities use `true` / `false` / `null`; `null` shows "To be confirmed",
never "No".

To add the owner photo: put it in `images/`, add an entry to `assets.json`, run `npm run images`,
then set `identity.ownerPhoto.value` to the asset id and its status to `"confirmed"`.

## Demo and live modes

Two explicit settings (flags, or the `SITE_MODE` / `FORM_DELIVERY` environment variables):

| `--mode` | `--form` | Result |
| --- | --- | --- |
| `demo` (default) | `preview` (default) | Preview site, demo form that sends nothing |
| `live` | `disabled` | Live site with the form replaced by a notice. Build fails while required content is pending |
| `demo` | `live` | Rejected |
| `live` | `preview` | Rejected |
| any | `live` | Rejected – real delivery is not built |

## Before going live

See `docs/QA_REPORT.md` for the full list. In short: complete the client checklist, get the menu
confirmed as current, supply the owner photo and venue photographs, agree the privacy notice,
decide whether a real enquiry route is in scope (it needs a server-side handler, spam controls and
delivery testing), then configure the domain, canonical URLs, sitemap and structured data.

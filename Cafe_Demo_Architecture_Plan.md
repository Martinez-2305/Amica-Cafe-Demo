# Café Demo Website Architecture and Build Plan

Prepared for the coding agent • 16 November 2026

## 1. Build objective and confirmed scope

Build a polished, responsive demo website for an independent UK café. The café primarily serves walk-in customers and does not require ordinary table reservations. It also accommodates celebrations and group gatherings, including birthdays, christenings, First Holy Communions, family parties, networking meetings and community meetups.

The site has two jobs:
1. Help everyday visitors understand the food, atmosphere, location and visiting arrangements.
2. Help event organisers understand the available gathering options and preview an enquiry journey.

The supplied asset folder contains food photographs, a photograph of the café owner and a PDF menu. The author of this specification has not inspected those files. The implementing agent must inspect them in the user's project before making content or visual decisions.

The café name, address, branding, opening hours, owner biography, hire capacity, pricing and exact terms are not supplied in this specification. Read them from reliable supplied material where available, record their source, and leave unresolved facts as explicit placeholders.

Produce a working demo, not a live booking, ordering or payment system. Do not add routine table booking. Do not publish to the café's live domain as part of this demo brief.

## 2. Initial inspection and working rules

Before writing code:
- Read repository instructions such as AGENTS.md and existing project documentation.
- Inspect the existing framework, package manager, lockfile and scripts. Keep a suitable existing stack.
- Locate the supplied images and PDF using the user's folder or the project asset directories. Do not assume their filenames.
- Inspect every image visually. Check dimensions, orientation, quality and any rights/usage notes.
- Render every PDF page and inspect it as well as extracting its text.
- Identify logos, business details and design cues present in the supplied material. A logo visible in a PDF may be usable only if it can be extracted cleanly.
- Record uncertain or conflicting information rather than silently selecting an answer.
- If assets cannot be found, continue the reusable structure with explicit placeholders and report the missing paths. Do not invent menu content or source substitute venue photographs.

Preserve original source files. Create optimised derivatives separately. Do not restructure unrelated parts of an existing repository.

## 3. Recommended technical approach

For a new project, use Astro with TypeScript, static output, semantic HTML and a small CSS design system. Use vanilla JavaScript only for the mobile navigation and demo enquiry behaviour. Avoid introducing a frontend framework just for this small amount of interactivity.

If the repository already uses a suitable framework, implement this architecture there instead of migrating it.

Reasons for the default:
- Each main page and its important content can ship as HTML.
- The site needs little client-side state.
- A static demo can be hosted without a database or application server.
- Menu and business content can live in typed local data files.
- Images can be optimised during the build.

Use the current stable compatible release available at implementation time, commit the lockfile and record required runtime versions. Do not hard-code a speculative version from this plan.

No database, login, CMS dashboard, availability calendar, payment integration or third-party analytics is required for the demo. A client questionnaire plus central data files is the initial content workflow. These placeholders are editable source content, not a promised live client CMS.

## 4. Routes and information architecture

| Route | Purpose | Key action |
| --- | --- | --- |
| / | Introduce the café and both visitor journeys | View menu |
| /menu/ | Present the supplied menu as readable webpage content | Plan your visit |
| /private-hire/ | Explain celebrations and group-table enquiries | Preview enquiry |
| /visit/ | Present hours, location, contact and practical information | Get directions, when address verified |
| /privacy/ | Clearly marked draft describing demo behaviour | Return to site |
| /404.html | Useful not-found page | Return home |

Use the same trailing-slash convention everywhere. Support direct loading and refresh of each route in the chosen host configuration.

Main navigation: Menu, Private Hire & Groups, Visit Us.
Logo links to Home. Primary desktop navigation button: View Menu.
Do not add a separate About page initially. Use the owner section on the homepage.

On mobile, show a labelled navigation control and a compact action bar for Menu, Visit and Hire. Avoid stacking multiple sticky bars. Ensure the action bar accounts for safe areas and does not cover content or focused controls.

No social link, telephone link or directions link should point to a placeholder value. Where information is absent, show explanatory text rather than a fake clickable link.

## 5. Visual design direction

The intended feeling is welcoming, considered and personal, with enough polish to support event enquiries. Keep the everyday café identity central.

First derive branding from supplied assets. If those provide no coherent system, use this provisional direction:
- Warm off-white backgrounds, charcoal text and one muted warm accent.
- An expressive but readable heading face paired with a neutral body face; no more than two families.
- Natural food photography with consistent colour treatment.
- Spacious editorial sections, restrained borders and limited decorative elements.
- Minimal shadow use and modest corner radii.
- Clear type hierarchy and consistent spacing across all routes.

Use CSS custom properties for colours, typography, spacing, radii, container widths and focus styling. Check colour contrast before finalising the accent. A warm accent is not automatically suitable for white button text.

Suggested starting dimensions, adjustable to the actual brand:
- Body text 16–18px, line height approximately 1.5–1.7.
- Reading width approximately 60–70 characters for paragraphs.
- Main content max-width approximately 1200px.
- Mobile side gutters approximately 20px.
- Primary controls approximately 44–48px tall.
- Fluid heading sizes with sensible caps so long names do not overflow.

Prefer an image-and-text hero with text on a solid surface. A full-bleed image is acceptable only when crops and contrast work reliably at every breakpoint.

Avoid generic AI-style marketing layouts: repeated icon cards for every section, floating food cut-outs, constant rounded pills, gradients without a brand reason, oversized empty heroes and excessive scroll animation.

Motion should be brief and subtle. Honour reduced-motion preferences. Never hide important content until an animation or intersection observer runs.

## 6. Page specifications

### Home

Build sections in this order:

1. Compact demo notice: "Website preview. Some details are awaiting confirmation." This identifies the preview without making every section feel unfinished.
2. Header and navigation.
3. Hero: café name or name placeholder, a short factual introduction, strongest suitable food photograph, View Menu and Plan Your Visit actions. Include "Walk-ins welcome. No table booking needed." based on the confirmed brief.
4. Visit essentials: location, opening hours and serving times where known. Do not calculate "Open now" until a complete verified schedule, bank-holiday overrides and Europe/London handling exist.
5. Food and drink introduction: three or four real images if available, linked to genuine menu categories. Do not invent bestseller claims or claim a photograph depicts a named dish without checking.
6. Meet the owner: supplied portrait and a short biography slot. If biography is unknown, display "[Owner introduction to be added]" with the normal section layout. Do not invent the owner's name, nationality or founding story.
7. Private Hire & Groups feature: distinguish celebrations from community/networking meetups. Link to the hire page. Use a real interior/event photograph only if one exists; otherwise use a tasteful text-led section.
8. Visit summary and practical links.
9. Shared footer.

Do not create fake reviews, awards, ratings, years of trading, local sourcing claims or customer counts. Omit testimonials entirely unless supplied and approved.

### Menu

- Page introduction, menu category links and full HTML menu.
- Reproduce all legible supplied categories, item names, descriptions, prices, sizes, add-ons and notes.
- Preserve price relationships such as small/large and meal options. Do not flatten them into an incorrect single price.
- Present categories in a sensible order matching the PDF unless there is a documented usability reason to change it.
- Each item must have a stable ID, readable name and correctly associated price/variants.
- Use lists and headings rather than making every dish a separate large card.
- Include an "Open original menu PDF" link with file type and approximate size. The PDF is supplementary to the HTML menu.
- Preserve source serving times, service-charge notes and dietary legends where present, flagged for current client confirmation.
- Uncertain OCR text must remain pending. Never guess prices, ingredients or allergens.
- Do not infer vegan, gluten-free or allergy suitability from photographs or dish names.
- If the PDF is a scan, OCR can assist, but visually reconcile the output with every page.
- If full extraction is genuinely blocked, deliver a functional original-PDF link and an explicit incomplete-menu state; report the limitation rather than claiming the HTML menu is complete.
- Provide the path to allergen information only when it exists. Otherwise use "[Allergen information and contact instructions to be supplied]" in the demo.

### Private Hire & Groups

Build a complete visual layout even while details are pending.

1. Intro: gatherings at the café, with an enquiry anchor.
2. Two clear options:
   - Celebrations: birthdays, christenings, First Holy Communions and family gatherings.
   - Groups and meetups: community groups, networking meetings and one-off or recurring gatherings.
3. Space and arrangements: capacity, layout, exclusivity and availability placeholder fields.
4. Food and drink arrangements: catering, ordering, minimum-spend and external-food information placeholders.
5. Gallery area: actual venue/event images when supplied; otherwise a restrained placeholder block labelled "Venue and event photographs to be added". Food photos may illustrate food, but must not pretend to show an event package.
6. Three-step explanation: Share your plans → Café reviews availability → Arrangements are confirmed directly. Do not promise response times.
7. Practical FAQ using the same underlying data as the detail section.
8. Demo enquiry form.
9. Link back to everyday café visiting information.

Do not use "exclusive venue hire" as a claim until exclusivity is confirmed. A gathering may use the whole venue, part of it or a group of tables; this distinction is unresolved.

### Visit Us

- Verified address as selectable text, or a clear placeholder.
- Map/directions link only when the destination is confirmed; avoid an embedded map in the initial demo.
- Opening-hours table with unknown days visibly pending.
- Separate kitchen/food-service hours when known.
- Confirmed walk-in policy.
- Optional verified telephone, email and social links.
- Practical details: parking, public transport, entrance access, toilet access, highchairs, baby changing, outdoor seating and dog policy. All unknowns remain placeholders or explicitly "To be confirmed".
- Brief explanation that group gatherings should use the hire enquiry route.

Use tri-state yes/no/unknown for facilities. Unknown must never be displayed as "No".

### Privacy and not-found pages

Privacy: clearly label the page as draft. Describe the actual demo: form content stays in memory, no submission endpoint and no installed marketing/analytics tracking. Do not claim hosting providers collect no logs. Leave business-controller details and future live enquiry processing pending.

Not-found page: short explanation and useful links to Home, Menu and Visit Us. No stock illustrations required.

## 7. Content architecture and placeholder rules

Store business facts in a central typed JSON data layer. Components must not contain hard-coded capacities, prices, hours or contact information.

Use a small field structure:

    type ContentField<T> = {
      value: T | null;
      status: "confirmed" | "pending";
      placeholder: string;
      source: string | null;
    };

"Confirmed" means verified against a named supplied source or an explicit client instruction. It does not automatically establish that an old menu is still current; record separate client approval for launch.

Example:

    {
      "celebrationCapacity": {
        "value": null,
        "status": "pending",
        "placeholder": "[Maximum celebration guest count]",
        "source": null
      }
    }

Keep implementation metadata out of visitor-facing copy. Render pending values as readable inline placeholder text with a subtle dashed border or muted background. Do not expose raw JSON keys, debugging messages or TODO comments.

Use a shared ContentField/PlaceholderField component:
- In demo mode, render confirmed values normally and pending values with their placeholder text.
- Preserve meaningful labels: "Capacity: [Maximum guest count]".
- Do not apply error-red styling to unfinished client content.
- In live mode, pending required fields must fail validation before deployment.
- Pending optional sections must be intentionally omitted or approved as genuine "Contact us for details" content.
- Never automatically turn unknown information into a positive claim.

Use build configuration with default SITE_MODE=demo. Production launch requires an explicit live mode and successful content validation. Keep configuration and form delivery mode separately explicit, with a validator that rejects invalid combinations.

Central files:
- business.json: identity, contacts, location, opening hours, visit policies and facilities.
- hire.json: gathering types, capacity, layouts, catering, charges, availability and terms.
- menu.json: categories and items extracted from the PDF, including source-page references.
- assets.json: original-to-optimised image mapping, dimensions, alt text and crop notes.
- content.types.ts: TypeScript types.
- content.ts: validated loader and typed accessors.

Treat editorial descriptions separately from verified business facts. Use safe text rendering; do not inject arbitrary HTML from content data.

## 8. Required private-hire placeholders

Create these fields even if they remain pending:

| Field key | Client-facing question | Expected format |
| --- | --- | --- |
| celebrations.capacitySeated | How many seated guests can attend? | Integer or null |
| celebrations.capacityStanding | Are standing events possible, and for how many? | Integer or null; support not offered |
| celebrations.spaceArrangement | Whole café, separate area or selected tables? | Text |
| celebrations.exclusivity | Does the café remain open to other customers? | Text |
| celebrations.availableDaysTimes | Which days and times can events take place? | Text |
| celebrations.duration | Typical duration and any limits? | Text |
| celebrations.setupCleanup | What setup and clearing time is included? | Text |
| celebrations.hireFee | Is there a hire fee and what does it cover? | Amount/text, currency GBP |
| celebrations.minimumSpend | Is there a minimum food/drink spend? | Amount/text |
| celebrations.deposit | Is a deposit required and how is it applied? | Text |
| celebrations.cancellation | What are the cancellation and refund terms? | Text |
| catering.options | What food and drink can be provided? | Text/list |
| catering.externalFood | Can guests bring cakes or other food? | Text |
| catering.alcohol | What is the venue's alcohol policy? | Text; do not infer licensing |
| catering.dietaryContact | How should dietary/allergy requirements be discussed? | Text |
| venue.decorations | Which decorations are permitted? | Text |
| venue.equipment | Is any screen, Wi-Fi or presentation equipment provided? | Confirmed list |
| venue.access | What are the entrance and toilet access arrangements? | Text |
| groups.capacity | How many group-meeting guests can be accommodated? | Integer/text |
| groups.times | Which meeting times are suitable? | Text |
| groups.minimumSpend | Is there a table fee or minimum spend? | Text |
| groups.recurring | Are recurring meetups possible and on what basis? | Text |
| groups.arrangement | How are tables allocated while the café is open? | Text |
| enquiries.contact | Who receives enquiries, by which channel? | Verified email/phone later |
| enquiries.responseExpectation | Is there an agreed response timeframe? | Text, optional |
| photos.eventAssets | Which venue/event images are available for use? | Asset IDs |

Create CLIENT_CONTENT_CHECKLIST.md with the same field keys, plain-English questions and space for answers. Include other unresolved business facts and a request for interior/exterior/event photographs.

Workflow: client fills the questionnaire; developer maps answers into the JSON files; client reviews; changes are rebuilt. Do not require the client to edit code. A CMS or online editor is a separate future enhancement.

## 9. Demo enquiry interaction

This is a functional UI demonstration, not a real enquiry service.

Display above the form:
"Demo form. Use sample details only. Nothing will be sent to the café."

Fields:
- Gathering type: birthday, christening, First Holy Communion, family gathering, networking, community meetup, other.
- Preferred date; allow "Date not decided".
- Preferred time, optional.
- Approximate guest count, required positive whole number; do not invent a venue maximum.
- One-off or recurring; show optional recurrence details conditionally.
- Food/drink preferences, optional.
- Name and email, required for validating the intended flow.
- Phone, optional.
- Additional notes, optional. Do not request detailed health information.

Interaction:
- Inline errors plus an accessible summary.
- Proper labels, appropriate input types and autocomplete.
- Preserve entered values after errors.
- Button label: "Preview enquiry".
- After validation, show a local review panel: "Preview only. Your enquiry has not been sent."
- Provide an Edit details action.
- Keep values in memory only; no localStorage, console logging, analytics, email, fetch or network submission.
- Prevent accidental native GET submission or contact details appearing in URLs. Keep the preview button disabled until its JS handler is attached; include a noscript explanation.
- A valid preview must never say "Booking confirmed" or "Message sent".

Keep future integration behind a small submitEnquiry adapter boundary. No API route is needed now. Before a live form is enabled, separately implement server-side validation, spam/rate controls, delivery failure handling, an approved privacy notice and actual end-to-end delivery testing. A static build endpoint is not a runtime form receiver.

## 10. Assets and PDF processing

Create ASSET_INVENTORY.md recording original filename, role, dimensions, quality notes, output filename and source/usage confirmation.

Food images:
- Choose a hero with an appropriate crop and adequate resolution.
- Generate responsive sizes and modern formats with fallback where needed.
- Set width and height to reserve layout space.
- Eager-load/prioritise only the important hero image; lazy-load below-fold images.
- Preserve realistic colour. Do not change the appearance of the actual food.
- Use descriptive alt text without keyword stuffing.

Owner image:
- Use in the owner section.
- Preserve the person accurately and crop thoughtfully.
- Do not create a biography from appearance or filename.

PDF:
- Preserve the original.
- Render all pages for comparison.
- Build menu data from text extraction/OCR and visual verification.
- Record source page per item and any uncertainty.
- Check currency symbols, decimal points, modifiers and multi-column reading order.
- Keep the supplied PDF as a supplementary download.
- Request client confirmation that it is the latest menu before live launch.

If a menu is long, all verified items still belong on the menu page. The homepage can use a small selection, without implying those are bestsellers.

## 11. Suggested file responsibilities

Adapt extensions and paths to an existing stack. For a new Astro project:

| Path | Responsibility |
| --- | --- |
| src/pages/index.astro | Homepage composition |
| src/pages/menu.astro | Full menu |
| src/pages/private-hire.astro | Hire information and demo form |
| src/pages/visit.astro | Visit information |
| src/pages/privacy.astro | Draft/live privacy content |
| src/pages/404.astro | Not-found state |
| src/layouts/BaseLayout.astro | Shared metadata, header/footer and layout |
| src/components/SiteHeader.astro | Desktop/mobile navigation |
| src/components/SiteFooter.astro | Footer content and policy links |
| src/components/DemoNotice.astro | Preview identification |
| src/components/PlaceholderField.astro | Missing-content presentation |
| src/components/ResponsiveImage.astro | Consistent image rendering |
| src/components/MenuSection.astro | Menu category and item rendering |
| src/components/HireDetails.astro | Shared hire facts and placeholders |
| src/components/EnquiryForm.astro | Accessible form markup |
| src/components/MobileActions.astro | Mobile action bar |
| src/scripts/navigation.ts | Navigation behaviour |
| src/scripts/enquiry.ts | Validation and local review state |
| src/data/ | business.json, hire.json, menu.json, assets.json |
| src/lib/content.types.ts | Content types |
| src/lib/content.ts | Validation and access |
| src/lib/enquiry.ts | Form validation and future delivery interface |
| src/styles/tokens.css | Design variables |
| src/styles/global.css | Base typography, layout and shared states |
| src/assets/images/ | Imported image assets |
| public/downloads/menu.pdf | Original menu for visitors |
| scripts/validate-content.ts | Demo checks and live launch gates |
| docs/ | Asset inventory, menu notes, client checklist, QA report |
| README.md | Setup, scripts, modes and handover |

Do not build abstractions beyond these needs. Shared components should remove repetition, not turn every paragraph into a configurable widget.

## 12. Accessibility, performance and preview safeguards

Accessibility target: WCAG 2.2 AA, with manual verification as well as automated checks.
- Semantic landmarks, skip link, one descriptive h1 per page and logical headings.
- Visible keyboard focus; no keyboard traps.
- Mobile navigation supports Escape and returns focus to its trigger.
- Native details/summary can be used for FAQs.
- Text contrast at least 4.5:1 for ordinary text and 3:1 for qualifying large text.
- Comfortable 44–48px primary touch controls; respect WCAG target-size rules and exceptions.
- No essential text inside images.
- Layout supports narrow screens, text zoom and reflow.
- Sticky UI must not obscure focused elements or form messages.
- Error messages are associated with the relevant fields and announced appropriately.

Performance:
- Render core content at build time.
- Avoid third-party widgets, live social feeds and autoplay video.
- Self-host licensed fonts where practical, with font-display swap and a small number of weights.
- Avoid layout shifts from images and font loading.
- Target good real-user Core Web Vitals: LCP at most 2.5s, INP at most 200ms, CLS at most 0.1 at the 75th percentile. These cannot be proven from a local demo alone.
- Use mobile lab tests diagnostically; do not claim that a single Lighthouse score proves real-user performance.

Preview:
- Default all pages to noindex, nofollow and omit the demo sitemap from search submissions.
- Use host-level access control for a private review URL when available. Noindex is not privacy or authentication.
- Do not block crawlers with robots.txt and then assume they can read a noindex directive.
- Do not emit business structured data containing placeholders.
- Do not add ad pixels, behavioural analytics or tracking embeds for the demo.
- Do not show a decorative cookie banner that controls nothing. Add an actual consent mechanism later if the live technologies require it.
- No credentials, private documents or raw source asset folder should be copied into public output.
- Keep image location metadata out of published derivatives where unnecessary.

## 13. Implementation sequence

Phase 1: Inspect and prepare
- Inspect repository and assets.
- Write inventory and unresolved-information list.
- Extract and reconcile the PDF menu.
- Establish content schema and demo/live configuration.

Phase 2: Build the visual foundation
- Set design tokens based on supplied branding.
- Implement shared layout, header, footer and responsive image handling.
- Build homepage hero, food section and owner section first to establish the visual direction.

Phase 3: Implement all routes
- Complete homepage.
- Build full menu and original PDF link.
- Build hire page with complete placeholder layout.
- Build visit, privacy and 404 pages.

Phase 4: Add interactions
- Mobile navigation and mobile actions.
- Accessible category jumps and FAQ disclosures.
- Demo enquiry validation and local review state.
- Data-driven pending fields and content validation.

Phase 5: Verify and refine
- Run type/build checks.
- Test all routes and links.
- Compare the entire menu against the PDF.
- Test responsive layouts and keyboard navigation.
- Capture and inspect screenshots; correct layout problems.

Phase 6: Handover
- Supply run/build commands and preview instructions.
- Provide the client questionnaire and missing-information list.
- List limitations explicitly.
- Leave live deployment and real enquiry delivery disabled.

## 14. Acceptance criteria and useful tests

The demo is complete when:
- All six routes work, including direct visits.
- Food images and owner photograph come from the supplied folder.
- Menu information is reconciled with the PDF, with unresolved entries explicitly flagged.
- Ordinary café visits are clearly walk-in; there is no routine table-booking widget.
- Celebrations and group meetups have distinct explanations.
- Every required hire field exists centrally and has a readable placeholder when pending.
- Unknown facilities never appear as confirmed available.
- No fictional reviews, prices, capacity, history or facilities are present.
- All visible actions work or clearly explain unavailable functionality.
- Enquiry preview validates correctly and sends no data.
- No contact values appear in the URL, storage or console.
- Keyboard navigation and visible focus work throughout.
- No horizontal overflow at representative widths of 360, 390, 768, 1024 and 1440px; also inspect reflow at 320 CSS pixels.
- Text remains usable at 200% zoom.
- Images have intentional crops, no distortion and reserved space.
- Demo mode is noindex and live delivery remains disabled.
- Type checking and production build pass without unresolved errors.

Useful focused automated tests:
1. Pending required content blocks live mode.
2. Unknown facility values render "To be confirmed", not false.
3. Form validation catches missing/invalid fields and accepts a date-not-decided state.
4. Enquiry preview creates no network request or persistent data.
5. Navigation and core routes are reachable.

Manual QA:
- Review screenshots of every page at mobile and desktop sizes.
- Exercise mobile navigation, menu category links, PDF download, FAQ and form errors.
- Use an automated accessibility scanner, then manually check keyboard behaviour.
- Inspect the browser network panel while exercising the form.
- Record completed checks and remaining issues in QA_REPORT.md.

Do not write unit tests that merely repeat static text. Concentrate tests on failure-prone behaviour and preview/live boundaries.

## 15. Client content and launch handover

Return these deliverables:
1. Working demo source and dependency lockfile.
2. README with setup, development, build and preview commands.
3. CLIENT_CONTENT_CHECKLIST.md, keyed to the central data fields.
4. ASSET_INVENTORY.md and menu verification notes.
5. QA_REPORT.md, including screenshots captured by the implementing agent where supported.
6. A concise missing-content and live-launch checklist.

Before live launch:
- Obtain final business identity, contact details, hours and latest menu approval.
- Confirm every operational hire claim and any optional facility displayed.
- Replace pending required placeholders and remove demo notices.
- Approve biography, photography usage, prices, terms and privacy information.
- Implement and test the real enquiry route if it is in the agreed live scope.
- Keep the enquiry form explicitly unavailable if real delivery is not yet ready.
- Configure the real domain, canonical URLs, HTTPS, sitemap and accurate local-business structured data.
- Review cookies/tracking based on what is actually installed.
- Verify contact links, maps, responsive pages, PDF and enquiry delivery on the final host.
- Remove noindex only when the approved live site is ready.
- Agree who maintains menus, hours and hire information.

Do not describe a successful demo as a completed production launch.

## 16. Sources and interpretation

This plan translates the prior research into implementation choices. Page structure, colours, components and stack are recommendations; they are not mandated UK café design standards.

Technical references:
- Astro static/on-demand rendering: https://docs.astro.build/en/guides/on-demand-rendering/
- Astro endpoints and runtime behaviour: https://docs.astro.build/en/guides/endpoints/
- Astro image handling: https://docs.astro.build/en/guides/images/
- WCAG 2.2: https://www.w3.org/TR/WCAG22/
- Target-size requirements: https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html
- Core Web Vitals thresholds: https://web.dev/articles/defining-core-web-vitals-thresholds
- Google local-business structured data: https://developers.google.com/search/docs/appearance/structured-data/local-business

The implementing agent should consult current documentation for its installed versions. A static demo requires no runtime API, but a future live enquiry service does.


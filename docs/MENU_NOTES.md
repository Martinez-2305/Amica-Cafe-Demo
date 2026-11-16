# Menu verification notes

Source: `White Brown Restaurant Menu.pdf` (2 pages, real text layer – not a scan).

Method: text extracted with `pdftotext`; both pages rendered to images; every item, description
and price reconciled by eye against the render. Data lives in `src/data/menu.json` (each category
records its source page). An automated test checks that all 54 items appear on the built page with
their prices.

| Section | Page | Items |
| --- | --- | --- |
| Breakfast (7) + Extras (2) | 1 | 9 |
| Lunch: Jacket potatoes (6), Toasties (8), Sandwiches & toasts incl. Club (6), Eggs Benedict (1) | 1 | 21 |
| Bagels | 1 | 3 |
| Salads | 1 | 2 |
| Crepes: Savoury (7), Sweet (9) | 2 | 16 |
| Milkshakes (1 price, 6 flavours), Ice Cream Sundae, Belgian Hot Chocolate (milk/white) | 2 | 3 |
| **Total** | | **54** |

## Decisions and uncertainties

1. **Currency.** Prices are printed without a symbol (`10.00`). Shown as `£10.00`. To confirm.
2. **Eggs Benedict "8.00/9.00".** Printed beside "ham/salmon"; mapped in order (ham £8.00,
   salmon £9.00) and flagged on the page as awaiting confirmation.
3. **Tuna, mayo, cheese crepe – £7.00.** The price sits slightly below its row in the PDF. The
   association follows row order (the next row, the chicken crepe, has its own 8.50).
4. **Club Sandwich** has its own box in the PDF; listed with Sandwiches & Toasts.
5. **Bagels and Salads** sit under the Lunch column in the PDF; given their own headings online,
   in the same order.
6. **Wording.** Run-together words from the PDF were separated ("servedon" → "served on").
   "Cheese & Tomatoe" is spelled "Cheese & tomato". "Mixed salads" is kept as printed. Item names
   are in sentence case rather than capitals. No ingredients were added or removed.
7. **Not in the PDF:** coffee, tea, soft drinks, smoothies; allergen or dietary information;
   serving times; service-charge notes. Each is a placeholder on the page. No dietary suitability
   has been inferred.
8. **Whether the menu is current.** The client has not confirmed this PDF is the latest
   (`menu.source.clientApprovedCurrent` is `false`, which blocks a live build).

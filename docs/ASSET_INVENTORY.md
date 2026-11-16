# Asset inventory

Inspected 16 November 2026. Originals in `images/` are untouched; derivatives are generated into
`src/img/` by `scripts/optimise-images.mjs` as WebP + JPEG with metadata stripped. Only derivatives
referenced by a page are copied to `dist/`.

No original contains EXIF data. Maximum width is 1080px, which is adequate for the layouts used
but too small for a full-bleed desktop hero – one reason the hero is a framed image beside text.
Higher-resolution originals would be welcome.

| Original (in `images/`) | Size | Shows | Output id | Used |
| --- | --- | --- | --- | --- |
| `WhatsApp Image … 20.08.26 (3).jpeg` | 1080×1440 | Avocado toast with bacon and poached eggs; teapot and tea | `avocado-toast-tea` | Home hero |
| `WhatsApp Image … 20.08.27 (5).jpeg` | 1080×810 | Close-up of poached eggs on avocado toast with bacon | `poached-eggs` | Home → Breakfast |
| `WhatsApp Image … 20.08.27 (6).jpeg` | 1080×720 | Toasted layered chicken sandwich, coffee cup | `toasted-sandwich` | Home → Lunch |
| `WhatsApp Image … 20.08.27.jpeg` | 1080×810 | Bagel with egg, smoked salmon, cucumber; orange juice | `bagel-salmon` | Home → Bagels |
| `WhatsApp Image … 20.08.26 (1).jpeg` | 1080×810 | Crepe with berries, cream and berry sauce | `crepe-berries` | Home → Crepes |
| `WhatsApp Image … 20.08.26 (2).jpeg` | 1080×810 | Savoury crepe with salad garnish | `crepe-savoury` | Menu page |
| `WhatsApp Image … 20.08.27 (4).jpeg` | 1080×1440 | Latte with latte art, grinder, coffee beans | `latte` | Visit page |
| `WhatsApp Image … 20.08.26.jpeg` | 1080×810 | Crepe with white chocolate and sandwich cookies | `crepe-cookies-white-chocolate` | Not used yet |
| `WhatsApp Image … 20.08.27 (2).jpeg` | 1080×1440 | Chocolate milkshake | `milkshake-chocolate` | Not used yet |
| `WhatsApp Image … 20.08.27 (1).jpeg` | 1080×1440 | Red berry smoothie | `smoothie-berry` | Not used – not on menu |
| `WhatsApp Image … 20.08.27 (3).jpeg` | 1080×1440 | Green smoothie | `smoothie-green` | Not used – not on menu |
| `amica-logo.jpeg` | 1024×1024 | Logo, light artwork on black | `logo-dark.png`, `logo-light.png`, `favicon.png` | Header, footer, favicon |
| `White Brown Restaurant Menu.pdf` | 2 pages, 3.6 MB | Menu | `downloads/amica-cafe-menu.pdf` | Menu page download |

## Notes and open questions

- **Owner photograph: not supplied.** The home page shows an empty labelled placeholder.
- **No interior, exterior or event photographs.** The hire page gallery is a labelled placeholder.
- **Usage rights unconfirmed.** Most food photographs carry a small camera-outline mark in the
  bottom-right corner. It may be a photographer's or an app's mark. Confirm the café may publish
  these images before launch.
- **Photos are not matched to named dishes.** Home page images link to menu categories only, and
  alt text describes what is visible. Whether the hero is the menu's "Crushed Avocado", for
  example, has not been confirmed.
- **Drinks in photos but not on the menu:** smoothies, latte, tea, orange juice. The smoothie
  photos are held back; the latte is used only as an atmosphere image on the Visit page.
- **Logo:** extracted to transparent PNG by converting brightness to alpha and recolouring the
  lettering dark for light backgrounds. A vector master would be sharper.
- Colour is unaltered; derivatives are only resized and recompressed.

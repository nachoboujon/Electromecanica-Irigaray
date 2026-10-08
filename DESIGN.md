# Visual system

## Direction

The landing uses a dark workshop frame with red as the action color and a warm, high contrast surface for catalog reading. The first screen puts the visitor's next action beside a clearly reserved workshop image area. It keeps the workshop name, identity, contact details, product facts, and photographs owner supplied.

## Colors

| Token | Default | Use |
| --- | --- | --- |
| `--ink` | `#101010` | Navigation, footer, dark sections |
| `--ink-soft` | `#181818` | Secondary dark surface |
| `--red` | `#d9272e` in database; `#e52d35` without a database | Primary actions and emphasis; editable through `site_settings.primary_color` |
| `--paper` | `#f2f0eb` | Catalog and FAQ surfaces |
| `--paper-dim` | `#c5c1ba` | Secondary light text |

The secondary dark color is read from `site_settings.secondary_color`. Keep action and body text at accessible contrast when changing either color.

## Typography

Barlow Condensed is used for display headlines; DM Sans is used for body copy and controls. The stylesheet has system fallbacks if the Google Fonts stylesheet cannot load.

## Components and layout

- Compact dark header with anchored in-page navigation and a visible contact action.
- Oversized uppercase display headlines, a red editorial cut, and photo bays that remain explicitly placeholders until real workshop images are supplied.
- Services are a scan-friendly ruled list; parts use a three-column desktop catalog that collapses on small screens.
- The inquiry form and payment errors remain in context. FAQ entries use native disclosure controls.
- At widths below 650px, the navigation compacts, content stacks, and catalog becomes two columns (one on very narrow screens).

## Motion and interaction

The landing has one reversible scroll controller in `src/components/landing-motion.tsx`. Each frame uses cached layout coordinates and the current native scroll position; there is no scroll interception, timer-driven entrance, or animation dependency. Layout is measured again only when content, fonts, images, or viewport dimensions change. Saturated progress values are not rewritten. Keyboard focus keeps the affected content stationary and fully opaque.

The order is Inicio → Servicios → Repuestos → Sobre el taller → Preguntas frecuentes → Contacto → footer. Each boundary has a separate decorative bridge: a burgundy diagonal opening, an automotive contour with a warm background change, a shutter reveal, a thinning line that simplifies the composition, an expanding red band, and a dark release into the footer. Published testimonials, if supplied, are also included in the actual flow, with a separate settling line before FAQ.

Incoming headings and content have coordinated scroll ranges. Services move laterally in alternating directions, parts use small depth and scale changes, the workshop photo reveals through a mask, FAQ rows enter individually, and contact columns gather from opposite sides. Visible text remains at least 64% opaque during entrances and 74% during departures; focused controls stay fully visible. Mobile halves travel distances and removes 3D depth and image masks. Reduced motion presents all content without spatial movement, shorter static decorative bridges, and immediate anchor navigation. Without JavaScript all content remains visible.

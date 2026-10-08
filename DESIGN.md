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

Motion is limited to subtle hover color changes. Reduced-motion preferences disable transitions and smooth scrolling. Keyboard focus uses a visible red outline.

# template.json: field reference

`template.json` is the machine-readable card of a template: the gallery and the template-picker prompts read
it. A personal template needs exactly these 15 fields (plain JSON, UTF-8, no comments, no extra fields):

| Field | Type | Meaning |
|---|---|---|
| `slug` | string | Folder name and identifier: lowercase letters, digits and single hyphens (`^[a-z0-9]+(?:-[a-z0-9]+)*$`), e.g. `acme-quarterly`. |
| `name` | string | Display name, e.g. `Acme Quarterly`. |
| `tagline` | string | One sentence, 10-20 words: what the template feels like and for whom. |
| `mood` | string[] | 3-5 single-word moods (`confident`, `calm`, `playful`, ...). At least one. |
| `occasion` | string[] | 3-6 situations it suits (`investor pitch`, `board update`, `training`). At least one. |
| `tone` | string[] | 3-5 single-word tones of voice (`precise`, `warm`, `bold`). At least one. |
| `formality` | enum | `low`, `medium-low`, `medium`, `medium-high` or `high`. |
| `density` | enum | How much content a slide carries: `low` (one idea, big type), `medium-low`, `medium`, `medium-high`, `high` (dense, reading deck). |
| `palette` | object | Colour name to `"#rrggbb"`, at least one entry, same names as the `colors` in `design.md`. One optional extra key `description`: a sentence on how the colours are used. |
| `typography` | object | Role to font family name (`display`, `body`, plus `mono` etc. if used), at least one entry. Optional key `style`: a sentence on the type system. Use the **open** family names that the template really loads. |
| `scheme` | enum | `light`, `dark` or `mixed` (both light and dark slides). |
| `best_for` | string | What it is best for, one or two sentences. |
| `avoid_for` | string | What it is not suited to, one or two sentences. |
| `slide_count` | integer | Number of slides in `template.html` (at least 1). |
| `navigation` | string | How the deck is navigated, e.g. `inline script (arrow keys, space, PgUp/PgDn, Home/End, mouse wheel, click, swipe)`. |

Optional fields that only matter if the template is ever added to the public slides-commons gallery (a
personal template does not need them, and a converted deck is normally **not** suitable for the gallery
because the design belongs to someone else):

| Field | Meaning |
|---|---|
| `description` | An English design summary (the gallery otherwise takes it from `design.md`). |
| `license` | SPDX id of the license you grant (`MIT`, `Apache-2.0`, `CC-BY-4.0`, `CC0-1.0`). |
| `authors` | `[{"name": "...", "url": "https://..."}]`. |
| `derivedFrom` | `{"source": "...", "slug": "..."}` when it adapts a gallery template. |

`source` is never written in the file: the site injects it.

A complete example is `example/template.json`.

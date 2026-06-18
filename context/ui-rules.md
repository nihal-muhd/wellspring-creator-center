# UI Rules

Concise rules for building the Wellspring UI.

Use `DESIGN.md` as the source of truth for visual decisions. These rules cover the most important layout, typography, color, and component patterns to keep the admin panel consistent without over-specifying every detail.

---

## 1. Design Direction

Wellspring follows the **Clean Wellness** visual system.

The UI should feel:

```txt
calm
premium
minimal
organized
soft
professional
spacious
```

The product is an admin panel for wellness creators, so it should feel like a clean SaaS workspace with the calmness of a wellness studio.

Avoid harsh enterprise UI, dense layouts, heavy borders, loud gradients, and unnecessary visual noise.

---

## 2. Font

Always use **Plus Jakarta Sans**.

Import it using `next/font/google` in the root layout.

```ts
import { Plus_Jakarta_Sans } from "next/font/google";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});
```

Apply the font variable class to the `<html>` tag in the root layout.

```tsx
<html lang="en" className={plusJakartaSans.variable}>
  <body>{children}</body>
</html>
```

Do not use system fonts as the primary font.

---

## 3. Layout

Use a sidebar-based admin layout.

### App Shell

```txt
sidebar width: 280px
top navbar height: 72px
container max width: 1440px
base spacing: 8px
content gutter: 24px
section padding: 40px
```

### Desktop

- Sidebar is visible.
- Main content sits to the right of the sidebar.
- Content should feel spacious.
- Use 24px to 40px padding around page content.
- Use 32px to 40px gaps between major page sections.

### Tablet

- Sidebar can collapse to icons or drawer.
- Content cards can become 2-column layouts.

### Mobile

- Use 1-column layouts.
- Sidebar can become drawer or hamburger navigation.
- Horizontal page padding should reduce to 16px.

---

## 4. Navigation

Primary navigation lives in the left sidebar.

Navigation items:

```txt
Programs
Audit Logs
```

Use `lucide-react` icons.

```ts
import { Presentation } from "lucide-react";
import { ClockFading } from "lucide-react";
```

### Sidebar Rules

- Sidebar width: `280px`
- Sidebar background: white or soft surface
- Active state uses a soft green/moss background tint
- Active state can include a 4px vertical indicator on the left
- Icons should use light stroke weight
- Keep labels simple
- Do not add extra nav items unless required

---

## 5. Top Navbar

The top navbar is used for global page context and profile/logout actions.

```txt
height: 72px
background: transparent or semi-transparent surface
optional backdrop blur on scroll
```

Use the top navbar for:

```txt
current page title
small subtitle if useful
user/profile actions
logout action
```

Do not overload the top navbar with too many controls.

---

## 6. Colors

Use project tokens from `DESIGN.md`.

### Core Tokens

```txt
background: #faf9f7
surface: #faf9f7
surface-container-lowest: #ffffff
surface-container-low: #f4f3f1
surface-container: #efeeec
surface-container-high: #e9e8e6
on-surface: #1a1c1b
on-surface-variant: #414943
primary: #14422d
on-primary: #ffffff
primary-container: #2d5a43
on-primary-container: #9fcfb2
secondary-container: #e8e2d9
outline: #717973
outline-variant: #c0c9c1
error: #ba1a1a
error-container: #ffdad6
```

### Usage Rules

- Use `primary` for main actions, active states, and brand presence.
- Use warm neutral surfaces instead of pure grey backgrounds.
- Use white cards on warm background.
- Use muted green/sand tones for grouping and soft emphasis.
- Use error color only for destructive actions and validation errors.
- Do not use random Tailwind color classes like `bg-green-600` or `text-gray-500`.

---

## 7. Tailwind v4 Token Rules

This project should use Tailwind v4 tokens through `@theme` in `globals.css`.

Do not create a `tailwind.config.ts` just for colors.

Define project tokens in `@theme`.

Example:

```css
@theme {
  --color-background: #faf9f7;
  --color-surface: #faf9f7;
  --color-card: #ffffff;
  --color-primary: #14422d;
  --color-primary-container: #2d5a43;
  --color-on-primary: #ffffff;
  --color-muted: #f4f3f1;
  --color-border: #c0c9c1;
  --color-foreground: #1a1c1b;
  --color-muted-foreground: #414943;

  --font-sans: var(--font-sans);
}
```

Use semantic token classes where possible.

Good:

```tsx
<div className="bg-background text-foreground" />
<button className="bg-primary text-on-primary" />
```

Avoid:

```tsx
<div className="bg-[#faf9f7] text-[#1a1c1b]" />
<button className="bg-green-900 text-white" />
```

---

## 8. Typography

Use three main text levels consistently.

### Page Heading

Use for page titles.

```txt
font-size: 32px
font-weight: 600
line-height: 1.2
letter-spacing: -0.01em
color: #1a1c1b
```

Mobile page heading:

```txt
font-size: 24px
font-weight: 600
line-height: 1.2
```

### Section Heading

Use for card titles and modal titles.

```txt
font-size: 24px
font-weight: 600
line-height: 1.3
color: #1a1c1b
```

For smaller cards:

```txt
font-size: 18px
font-weight: 600
line-height: 1.3
```

### Body Text

Use for main content.

```txt
font-size: 16px
font-weight: 400
line-height: 1.6
color: #1a1c1b
```

### Labels and Metadata

Use for form labels, table metadata, session details, and tags.

```txt
font-size: 14px
font-weight: 500
line-height: 1.4
letter-spacing: 0.01em
color: #414943
```

Small labels:

```txt
font-size: 12px
font-weight: 600
line-height: 1.2
```

---

## 9. Cards

Cards are used for content modules.

```txt
background: #ffffff
border: 1px solid soft outline
border-radius: 24px
padding: 24px
box-shadow: 0 4px 20px rgba(45, 90, 67, 0.05)
```

Rules:

- Cards should be white or very soft surface.
- Do not use loud colored card backgrounds.
- Use spacious padding.
- Use soft borders.
- Use soft tinted shadows, not harsh grey shadows.
- Do not over-nest cards.

---

## 10. Buttons

### Primary Button

Use for main actions.

```txt
background: #14422d
color: #ffffff
border-radius: 8px
padding: 8px 16px
font-size: 14px
font-weight: 500
```

Examples:

```txt
Add Program
Save Changes
Create Session
Import CSV
```

### Secondary Button

Use for neutral actions.

```txt
background: #ffffff or #f4f3f1
border: 1px solid #c0c9c1
color: #1a1c1b
border-radius: 8px
padding: 8px 16px
font-size: 14px
font-weight: 500
```

Examples:

```txt
Cancel
Back to Programs
Change File
```

### Destructive Button

Use only for delete actions.

```txt
background: transparent or error-container
color: #ba1a1a
border-radius: 8px
```

Do not make destructive actions visually louder than necessary.

---

## 11. Form Inputs

Inputs should feel soft and calm.

```txt
background: #f4f3f1
border: transparent by default
border-radius: 8px
padding: 8px 12px
font-size: 14px
color: #1a1c1b
placeholder color: #717973
focus: thin #14422d border or ring
```

Rules:

- Use clear labels.
- Show human-readable validation messages.
- Do not show raw backend errors.
- Keep forms simple.
- Use textarea for descriptions.
- Use modal forms for add/edit program and add/edit session.

---

## 12. Modals

Use modals for focused create/edit/import flows.

Required modals:

```txt
Add Program
Edit Program
Add Session
Edit Session
CSV Import
```

Modal rules:

- Use white background.
- Use rounded-xl or 24px radius.
- Keep max width appropriate to form complexity.
- Keep footer actions aligned to the right.
- Primary action on the right.
- Cancel/secondary action on the left or before primary action.
- Keep modal content scrollable if needed.
- Do not create separate pages for add/edit flows unless required later.

---

## 13. Tables and Lists

Use clean list/table layouts for admin data.

Applicable areas:

```txt
program list
session list
audit logs
CSV import validation results
```

Rules:

- Use white rows.
- Use soft separators.
- Avoid heavy table borders.
- Header labels should be small and muted.
- Row text should be readable.
- Hover state can use a soft warm surface.
- Always include empty states.

Session list can use a card/list hybrid instead of a strict table.

---

## 14. Badges and Chips

Use chips for tags and small metadata.

```txt
border-radius: 9999px
padding: 4px 10px
font-size: 12px
font-weight: 600
```

Use chips for:

```txt
Yoga
Meditation
Audio
Video
Instructor
Status
Action type
```

Color rules:

- Use soft sage or sand backgrounds.
- Use dark readable text.
- Do not use bright saturated badge colors.
- Keep badges calm and readable.

---

## 15. Icons

Use only `lucide-react`.

Approved icons:

```ts
import { Presentation } from "lucide-react"; // programs
import { ClockFading } from "lucide-react"; // audit logs
import { Pen } from "lucide-react"; // edit
import { Upload } from "lucide-react"; // upload/import
import { Plus } from "lucide-react"; // add
```

Rules:

- Keep icon size consistent.
- Prefer `size={18}` or `size={20}`.
- Icons support labels; they should not replace labels.
- Sidebar icons should use light stroke.
- Do not mix icon libraries.

---

## 16. Empty States

Every empty section must have an empty state.

Use empty states for:

```txt
no programs
no sessions
no audit logs
no CSV errors
no uploaded media
```

Empty state pattern:

```txt
optional icon
short title
one sentence description
primary CTA if there is a logical next action
```

Example:

```txt
No programs yet
Create your first wellness program to start adding sessions.
[Add Program]
```

---

## 17. Loading States

Every async action should show loading feedback.

Use loading states for:

```txt
signup
login
program create/update/delete
session create/update/delete
CSV import
S3 upload
audit log filters
```

Rules:

- Disable submit buttons while loading.
- Change button text when useful.
- Avoid full-page spinners unless the whole page is loading.
- Prefer skeletons or small inline loading states.

---

## 18. Error States

Errors should be human-readable.

Rules:

- Never show raw error objects.
- Never show stack traces.
- Validation errors should appear near the field.
- Page-level errors should appear in a simple alert/card.
- Use the project error color sparingly.

Good:

```txt
Program title is required.
```

Avoid:

```txt
PrismaClientKnownRequestError P2002
```

---

## 19. File Upload UI

Use file upload UI for:

```txt
program cover image
session audio/video media
CSV import
```

Rules:

- Show selected file name.
- Show file type/size hint.
- Show upload progress if available.
- Allow replacing selected file.
- Allow removing uploaded file.
- On remove/replace, backend should delete the old S3 object when appropriate.
- For CSV import, show validation results after upload.

Allowed file types:

```txt
program image: jpeg, png, webp
session media: audio, video
CSV import: csv
```

---

## 20. Do Nots

- Do not use random Tailwind built-in colors.
- Do not create a separate color palette outside `DESIGN.md`.
- Do not use multiple icon libraries.
- Do not use system fonts as the primary font.
- Do not make the UI dense.
- Do not add unnecessary dashboards.
- Do not add gradients to card backgrounds.
- Do not use harsh shadows.
- Do not show raw backend errors to users.
- Do not store JWT in browser storage.
- Do not create extra pages for modal flows.
- Do not over-animate admin actions.
- Do not use fixed positioning unless necessary for sidebar/modal behavior.

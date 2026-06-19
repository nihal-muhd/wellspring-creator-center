# UI Registry

Living document. Updated after every component is built. Read this before building any new component — match existing patterns exactly before inventing new ones.

---

## How to Use

### Global Tailwind Theme

- File: `frontend/app/globals.css`
- Tailwind v4 setup: `@import "tailwindcss"` with CSS-first `@theme` tokens
- Semantic color utilities: `bg-background`, `bg-card`, `bg-primary`, `text-foreground`, `text-muted-foreground`, `text-on-primary`, `border-border`
- Typography utilities: `font-sans`, `text-display-lg`, `text-headline-lg`, `text-headline-md`, `text-body-lg`, `text-body-md`, `text-label-md`, `text-label-sm`
- Layout utilities: `w-sidebar`, `h-navbar`, `p-gutter`, `p-section`, `max-w-app`
- Shape and elevation utilities: `rounded-xl`, `rounded-full`, `shadow-card`
- Global base: warm background, Wellspring foreground, Plus Jakarta Sans, inherited form typography, branded text selection

## Auth UI

### Auth Split-Screen Shell

File: `frontend/components/auth/AuthLayout.tsx`

Last updated: 2026-06-18

| Property | Class |
| --- | --- |
| Background | `bg-background` |
| Image panel fallback | `bg-surface-container` |
| Image overlay | `bg-primary/10` |
| Content spacing | `px-6 py-4 sm:px-10 sm:py-6 lg:px-14 lg:py-8 xl:px-20` |
| Heading | `text-headline-lg text-foreground` |
| Supporting text | `text-body-md text-muted-foreground` |
| Accent text | `text-label-sm uppercase tracking-widest text-primary` |

**Pattern notes:**
Use this shared shell for signup and login so branding, responsive behavior, image treatment, heading spacing, footer copy placement, and route-switch links stay identical. Use a single-column form on mobile and a balanced split screen from `lg` upward. The shell uses `h-dvh overflow-hidden`; compact mobile spacing keeps the complete form within the viewport without page scrolling. The image panel is decorative support and the mobile footer may be hidden to preserve usable form space.

### Form Input

Files: `frontend/components/auth/SignupField.tsx`, `frontend/components/auth/SignupPasswordField.tsx`, `frontend/components/auth/LoginPasswordField.tsx`

Last updated: 2026-06-18

| Property | Class |
| --- | --- |
| Background | `bg-muted focus:bg-card` |
| Border | `border border-transparent focus:border-primary aria-invalid:border-error` |
| Border radius | `rounded-md` |
| Text — primary | `text-body-md text-foreground` |
| Text — placeholder | `placeholder:text-outline` |
| Spacing | `px-4 py-2.5 sm:py-3` |
| Focus state | `outline-none focus:ring-2 focus:ring-primary-fixed` |
| Invalid state | `aria-invalid:ring-2 aria-invalid:ring-error-container` |
| Label | `text-label-md text-foreground` |

**Pattern notes:**
Inputs use a soft tonal background at rest and become white with a primary border and soft fixed-primary ring on focus. Invalid inputs use the semantic error border and error-container ring, with a `text-label-sm text-error` message linked through `aria-describedby`. Use compact mobile sizing with the standard size restored from `sm`; password inputs reserve `pr-20` for the visibility control. Login uses `current-password`; signup uses `new-password`.

### Primary Form Button

Files: `frontend/components/auth/SignupForm.tsx`, `frontend/components/auth/LoginForm.tsx`

Last updated: 2026-06-18

| Property | Class |
| --- | --- |
| Background | `bg-primary` |
| Border | `none` |
| Border radius | `rounded-md` |
| Text | `text-label-md font-semibold text-on-primary` |
| Spacing | `px-4 py-2.5 sm:py-3` |
| Hover state | `hover:bg-primary-container` |
| Focus state | `focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary` |
| Disabled state | `disabled:cursor-not-allowed disabled:opacity-60` |

**Pattern notes:**
Primary form actions span the form width. Keep labels direct and action-oriented.

### Form Error Alert

Files: `frontend/components/auth/SignupForm.tsx`, `frontend/components/auth/LoginForm.tsx`

Last updated: 2026-06-18

| Property | Class |
| --- | --- |
| Background | `bg-error-container` |
| Border | `none` |
| Border radius | `rounded-md` |
| Text | `text-label-sm text-on-error-container` |
| Spacing | `px-3 py-2` |

**Pattern notes:**
Use `role="alert"` for request-level failures. Keep field validation beside its input; reserve this alert for API or form-wide errors.

### Inline Auth Link

File: `frontend/components/auth/AuthLayout.tsx`

Last updated: 2026-06-18

| Property | Class |
| --- | --- |
| Text | `font-semibold text-primary` |
| Hover state | `underline-offset-4 hover:underline` |
| Focus state | `focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary` |

**Pattern notes:**
Use this pattern for switching between login and signup without making the secondary route compete with the primary form action.

## Protected Workspace UI

### Workspace Sidebar

File: `frontend/components/layout/Sidebar.tsx`

Last updated: 2026-06-18

| Property | Class |
| --- | --- |
| Background | `bg-card` |
| Border | `border-r border-border` |
| Active background | `bg-surface-container-high` |
| Text — primary | `text-primary` |
| Text — secondary | `text-muted-foreground` |
| Navigation spacing | `px-6 py-3` |
| Hover state | `hover:bg-muted hover:text-foreground` |
| Focus state | `focus-visible:outline-2 focus-visible:outline-primary` |
| Active accent | `before:w-1 before:bg-primary` |

**Pattern notes:**
Use this sidebar as the shared navigation shell for all protected workspace pages. Desktop uses the 280px `w-sidebar` token and full viewport height. Smaller screens use a `h-navbar` header and slide-over navigation. Workspace branding comes from the authenticated creator session. Navigation icons use Lucide at 20px with a light 1.75 stroke. Active routes use a tonal surface plus the four-pixel primary indicator from the dashboard reference.

### Programs Page Shell

File: `frontend/components/programs/ProgramsPageContent.tsx`

Last updated: 2026-06-18

| Property | Class |
| --- | --- |
| Page background | `bg-background` |
| Toolbar background | `bg-card/80 backdrop-blur-sm` |
| Toolbar border | `border-b border-border` |
| Content spacing | `px-4 py-6 sm:px-6 lg:px-8 lg:py-7` |
| Heading | `text-headline-md text-primary` |
| Supporting text | `text-label-md text-muted-foreground` |
| Primary action | `rounded-md bg-primary px-4 py-2.5 text-on-primary hover:bg-primary-container` |

**Pattern notes:**
Protected index pages use a slim tonal toolbar followed by a spacious constrained content area. Page actions sit beside the title on larger screens and stack beneath it on mobile. Keep primary actions compact, semantic, and paired with a Lucide icon.

### Programs Loading and Request States

File: `frontend/components/programs/ProgramsPageContent.tsx`

Last updated: 2026-06-18

| Property | Class |
| --- | --- |
| Skeleton background | `bg-surface-container` |
| Skeleton container | `rounded-xl border border-border bg-card shadow-card` |
| Request error | `bg-error-container text-on-error-container` |
| Page error text | `text-label-md text-error` |
| Retry action | `rounded-md bg-primary px-4 py-2.5 text-on-primary` |
| Empty state | `rounded-xl border border-border bg-card p-6 shadow-card` |

**Pattern notes:**
Use card-shaped skeletons while workspace collections load, preserving the final grid footprint. Request-level mutation errors use the shared error-container alert pattern. Full collection failures show a centered retry action; successful empty collections show a contextual first-action CTA.

### Workspace Search Field

File: `frontend/components/programs/ProgramsPageContent.tsx`

Last updated: 2026-06-18

| Property | Class |
| --- | --- |
| Background | `bg-muted focus:bg-card` |
| Border | `border border-transparent focus:border-primary` |
| Border radius | `rounded-full` |
| Text | `text-label-md text-foreground placeholder:text-outline` |
| Spacing | `py-2.5 pl-11 pr-4` |
| Focus state | `focus:ring-2 focus:ring-primary-fixed` |
| Icon | `text-outline` |

**Pattern notes:**
Use the pill-shaped search treatment for top-level workspace filtering. Keep a visible semantic label for screen readers, place the Search icon inside the field, and filter without a submit action when the data set is already loaded.

### Program Card

File: `frontend/components/programs/ProgramCard.tsx`

Last updated: 2026-06-18

| Property | Class |
| --- | --- |
| Background | `bg-card` |
| Border | `border border-border` |
| Border radius | `rounded-xl` |
| Shadow | `shadow-card` |
| Text — title | `text-lg font-semibold leading-snug text-primary` |
| Text — body | `text-label-md text-muted-foreground` |
| Content spacing | `p-5` |
| Neutral action hover | `hover:bg-muted` |
| Destructive action | `text-error hover:bg-error-container` |

**Pattern notes:**
Program cards use a compact 16:9 cover area and a consistent content footer for session count and actions. Missing covers use a calm secondary-container placeholder rather than a random color. Keep edit actions primary-colored and delete actions restrained until hover. Card actions remain icon-only with descriptive accessible labels.

### Program Form Modal

File: `frontend/components/programs/ProgramFormModal.tsx`

Last updated: 2026-06-18

| Property | Class |
| --- | --- |
| Backdrop | `bg-inverse-surface/35 backdrop-blur-sm` |
| Background | `bg-card` |
| Border | `border border-border` |
| Border radius | `rounded-xl` |
| Shadow | `shadow-card` |
| Header/footer border | `border-border` |
| Heading | `text-headline-md text-primary` |
| Content spacing | `px-6 py-5` |
| Footer background | `bg-muted` |

**Pattern notes:**
Use this shared dialog shell for add/edit workspace forms. The header, scrollable form body, and tonal footer are visually separated with soft semantic borders. Modals close through the close icon, Cancel, backdrop, or Escape; lock body scrolling and contain keyboard focus while open.
While saving, keep the modal open, disable closing controls and submission, show `Saving...`, and render API failures in the shared form error alert.

### Workspace Modal Form Fields

File: `frontend/components/programs/ProgramFormModal.tsx`

Last updated: 2026-06-18

| Property | Class |
| --- | --- |
| Background | `bg-muted focus:bg-card` |
| Border | `border border-transparent focus:border-primary` |
| Border radius | `rounded-md` |
| Text | `text-body-md text-foreground placeholder:text-outline` |
| Spacing | `px-4 py-2.5` |
| Focus state | `focus:ring-2 focus:ring-primary-fixed` |
| Invalid state | `aria-invalid:border-error aria-invalid:ring-error-container` |
| Label | `text-label-sm uppercase tracking-wide text-muted-foreground` |

**Pattern notes:**
Workspace modal fields use compact uppercase labels and the same soft tonal focus treatment as auth inputs. Keep human-readable validation next to the related field. Textareas may resize vertically but should start at a practical minimum height.

### Program Photo Picker

File: `frontend/components/programs/ProgramFormModal.tsx`

Last updated: 2026-06-18

| Property | Class |
| --- | --- |
| Preview border | `border border-border` |
| Picker border | `border border-dashed border-outline-variant` |
| Border radius | `rounded-md` |
| Background | `bg-card` |
| Text | `text-label-sm text-muted-foreground` |
| Hover state | `hover:border-primary hover:bg-muted hover:text-primary` |
| Remove action | `bg-inverse-surface/75 text-inverse-on-surface` |

**Pattern notes:**
Show a square local preview beside the upload control. Accept only JPEG, PNG, and WebP, show file guidance, and keep remove/change actions available before submission. This is a frontend preview pattern only; S3 persistence is connected in the upload phase.

### Program Detail Page

File: `frontend/components/programs/ProgramDetailPageContent.tsx`

Last updated: 2026-06-19

| Property | Class |
| --- | --- |
| Page background | `bg-background` |
| Toolbar | `border-b border-border bg-card/80 backdrop-blur-sm` |
| Heading | `text-headline-lg text-primary` |
| Supporting text | `text-body-md text-muted-foreground` |
| Summary panel | `rounded-xl border border-border bg-muted` |
| Primary action | `rounded-md bg-primary text-on-primary hover:bg-primary-container` |
| Secondary action | `rounded-md border border-border bg-card hover:bg-muted` |
| Content spacing | `max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12` |

**Pattern notes:**
Detail workspaces use a centered `max-w-6xl` content measure so headers and session rows remain readable instead of stretching across the full app width. The same translucent top toolbar aligns its inner content to that measure. Use a spacious title/action header, 48px-tall actions, and a muted summary panel separated by 32px vertical margins.

### Session List Item

File: `frontend/components/sessions/SessionList.tsx`

Last updated: 2026-06-19

| Property | Class |
| --- | --- |
| Background | `bg-card` |
| Border | `border border-border` |
| Border radius | `rounded-xl` |
| Shadow | `shadow-card` |
| Text — title | `text-lg font-semibold leading-snug text-foreground` |
| Text — metadata | `text-label-md text-muted-foreground` |
| Accent text | `text-label-sm uppercase tracking-wide text-primary` |
| Content spacing | `px-4 py-4 sm:px-5 sm:py-5` |
| Tag | `rounded-full bg-secondary-container text-on-secondary-container` |
| Edit hover | `hover:bg-muted` |
| Delete action | `text-error hover:bg-error-container` |

**Pattern notes:**
Session rows use a responsive card/list hybrid with `space-y-5` between rows: a 144px desktop media preview, session metadata in the flexible center, calm tag chips, then compact paired edit/delete actions. Keep edit primary-colored and deletion restrained with semantic error color that gains an error-container background on hover. Disable both row actions while that session is being deleted. Horizontal gaps increase from 16px to 24px across breakpoints. Keep the list non-draggable until the reorder phase; do not introduce drag handles early.

### Session Form Modal

File: `frontend/components/sessions/SessionFormModal.tsx`

Last updated: 2026-06-19

| Property | Class |
| --- | --- |
| Backdrop | `bg-inverse-surface/35 backdrop-blur-sm` |
| Background | `bg-card` |
| Border | `border border-border` |
| Border radius | `rounded-xl` |
| Shadow | `shadow-card` |
| Heading | `text-headline-md text-primary` |
| Field background | `bg-muted focus:bg-card` |
| Field border | `border border-transparent focus:border-primary` |
| Field radius | `rounded-md` |
| Label | `text-label-sm uppercase tracking-wide text-muted-foreground` |
| Footer | `border-t border-border bg-muted px-6 py-4` |
| Primary action | `rounded-md bg-primary text-on-primary hover:bg-primary-container` |

**Pattern notes:**
Session create and edit share one accessible modal shell matching Program Form Modal behavior: body scroll lock, focus containment, Escape/backdrop close, disabled controls while saving, inline validation, and request-level error alerts. Duration is entered as decimal hours and converted to whole minutes before submission. Tags use removable secondary-container chips. Media selection is a local preview only until the S3 phase.

## Component Workflow

Before building any component:

1. Check if a similar component already exists here
2. If yes — match its exact classes
3. If no — build it following ui-rules.md and ui-tokens.md, then add it here

After building any component — update this file with the component name, file path, and exact classes used.

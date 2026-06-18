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

File: `frontend/app/signup/page.tsx`

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
Use a single-column form on mobile and a balanced split screen from `lg` upward. The shell uses `h-dvh overflow-hidden`; compact mobile spacing keeps the complete form within the viewport without page scrolling. The image panel is decorative support and the mobile footer may be hidden to preserve usable form space.

### Form Input

File: `frontend/app/signup/SignupForm.tsx`

Last updated: 2026-06-18

| Property | Class |
| --- | --- |
| Background | `bg-muted focus:bg-card` |
| Border | `border border-transparent focus:border-primary` |
| Border radius | `rounded-md` |
| Text — primary | `text-body-md text-foreground` |
| Text — placeholder | `placeholder:text-outline` |
| Spacing | `px-4 py-2.5 sm:py-3` |
| Focus state | `outline-none focus:ring-2 focus:ring-primary-fixed` |
| Label | `text-label-md text-foreground` |

**Pattern notes:**
Inputs use a soft tonal background at rest and become white with a primary border and soft fixed-primary ring on focus. Use compact mobile sizing with the standard size restored from `sm`; password inputs reserve `pr-20` for the visibility control.

### Primary Form Button

File: `frontend/app/signup/SignupForm.tsx`

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

### Inline Auth Link

File: `frontend/app/signup/page.tsx`

Last updated: 2026-06-18

| Property | Class |
| --- | --- |
| Text | `font-semibold text-primary` |
| Hover state | `underline-offset-4 hover:underline` |
| Focus state | `focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary` |

**Pattern notes:**
Use this pattern for switching between login and signup without making the secondary route compete with the primary form action.

## Component Workflow

Before building any component:

1. Check if a similar component already exists here
2. If yes — match its exact classes
3. If no — build it following ui-rules.md and ui-tokens.md, then add it here

After building any component — update this file with the component name, file path, and exact classes used.

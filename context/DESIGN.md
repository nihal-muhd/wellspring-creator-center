---
name: Clean Wellness System
colors:
  surface: '#faf9f7'
  surface-dim: '#dadad8'
  surface-bright: '#faf9f7'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f3f1'
  surface-container: '#efeeec'
  surface-container-high: '#e9e8e6'
  surface-container-highest: '#e3e2e0'
  on-surface: '#1a1c1b'
  on-surface-variant: '#414943'
  inverse-surface: '#2f3130'
  inverse-on-surface: '#f1f1ef'
  outline: '#717973'
  outline-variant: '#c0c9c1'
  surface-tint: '#3a674f'
  primary: '#14422d'
  on-primary: '#ffffff'
  primary-container: '#2d5a43'
  on-primary-container: '#9fcfb2'
  inverse-primary: '#a1d1b4'
  secondary: '#615e57'
  on-secondary: '#ffffff'
  secondary-container: '#e8e2d9'
  on-secondary-container: '#67645d'
  tertiary: '#26402c'
  on-tertiary: '#ffffff'
  tertiary-container: '#3d5741'
  on-tertiary-container: '#aeccb0'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#bceecf'
  primary-fixed-dim: '#a1d1b4'
  on-primary-fixed: '#002112'
  on-primary-fixed-variant: '#224f39'
  secondary-fixed: '#e8e2d9'
  secondary-fixed-dim: '#cbc6bd'
  on-secondary-fixed: '#1d1b16'
  on-secondary-fixed-variant: '#494640'
  tertiary-fixed: '#cceace'
  tertiary-fixed-dim: '#b0ceb2'
  on-tertiary-fixed: '#07200f'
  on-tertiary-fixed-variant: '#334d38'
  background: '#faf9f7'
  on-background: '#1a1c1b'
  surface-variant: '#e3e2e0'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.2'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  container-max: 1440px
  sidebar-width: 280px
  navbar-height: 72px
  gutter: 24px
  section-padding: 40px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

## Brand & Style

The design system is anchored in the "Clean Wellness" aesthetic—a harmony between professional SaaS efficiency and the restorative calm of a meditation studio. It is designed specifically for wellness creators who need a high-performance workspace that doesn't contribute to digital fatigue.

The style leverages **Minimalism** with a focus on high-quality whitespace and organic softness. It avoids the clinical coldness of traditional software by introducing warm neutral undertones and gentle curvatures. The interface should feel like a premium, quiet gallery: organized, spacious, and intentional. Every element is placed to reduce cognitive load, reflecting the mindfulness values of the end-users.

## Colors

The palette is derived from natural, earthy elements to evoke growth and stability.
- **Primary (Sage Forest):** A deep, sophisticated green used for primary actions, active states, and brand presence. It provides the "professional" weight of the SaaS platform.
- **Secondary (Warm Sand):** A soft, neutral beige used for subtle backgrounds and grouping elements. It prevents the UI from feeling sterile.
- **Tertiary (Muted Moss):** Used for accents, progress indicators, and illustrative elements.
- **Neutral (Parchment White):** The primary background color, offering a softer alternative to pure #FFFFFF to reduce eye strain.
- **Accent (Terracotta):** A restrained warm tone used sparingly for notifications or critical "call to attention" moments.

## Typography

This design system uses **Plus Jakarta Sans** across all levels. This typeface offers the geometric clarity required for professional SaaS environments while maintaining soft, open terminals that feel welcoming.

- **Headlines:** Use semi-bold weights with slight negative letter-spacing to create a clean, modern "editorial" look for dashboard titles.
- **Body Text:** Set with generous line height (1.6) to ensure long-form content management (like blog posts or meditation descriptions) remains highly readable.
- **Labels:** Use medium weights and a subtle increase in letter-spacing for smaller UI elements like metadata or category tags to ensure legibility against light backgrounds.

## Layout & Spacing

The layout follows a **Fixed Grid** within a fluid app shell. The content is organized into a structured 12-column grid to maintain professional alignment, but with significantly larger margins than traditional enterprise software to create the "Wellness" feel.

- **App Shell:** A permanent sidebar on the left (280px) houses primary navigation. A thin, crisp top navbar (72px) handles global search and profile actions.
- **Vertical Rhythm:** Use a strict 8px baseline. Sections within the content area should be separated by 40px or 64px to provide "breathing room."
- **Breakpoints:**
  - **Desktop (1200px+):** Full sidebar visible, 3-column content cards.
  - **Tablet (768px - 1199px):** Sidebar collapses to icons or a drawer; 2-column content cards; margins reduce to 24px.
  - **Mobile (Under 768px):** Bottom navigation or hamburger menu; 1-column content cards; 16px horizontal margins.

## Elevation & Depth

To maintain a "Clean Wellness" aesthetic, depth is created through **Tonal Layers** and extremely soft **Ambient Shadows**.

- **Surface Tiers:** The main background uses the Neutral color. Secondary surfaces (like cards or sidebars) use pure white or the Secondary (Sand) color to create subtle separation without heavy borders.
- **Shadows:** Use large-radius, low-opacity shadows (e.g., `box-shadow: 0 4px 20px rgba(45, 90, 67, 0.05)`). The shadows are slightly tinted with the Primary color to feel integrated rather than "grey."
- **Separators:** Use 1px borders in a very light version of the primary color (opacity 8-10%) instead of dark lines to maintain a soft, professional structure.

## Shapes

The shape language is consistently **Rounded**. 

The base radius of 0.5rem (8px) is applied to buttons, input fields, and small components. Larger containers, like content cards and the sidebar, should use `rounded-xl` (1.5rem / 24px) to emphasize the soft, approachable nature of the brand. Interactive elements like "Pills" or "Chips" should use a fully rounded (pill-shaped) style to distinguish them from functional inputs.

## Components

- **Buttons:** 
  - *Primary:* Filled with the Sage Forest green, white text. No shadow, or very soft hover shadow.
  - *Secondary:* Outlined with Sage Forest or a Sand background.
- **Navigation (Sidebar):** 
  - Icons: Light stroke (1.5px weight).
  - Active state: A soft moss green background tint with a 4px vertical "indicator" bar on the left.
- **Cards:** 
  - Pure white background, `rounded-xl` corners, and a 1px soft border. 
  - Used for content modules like "Upcoming Classes" or "Latest Analytics."
- **Input Fields:** 
  - Soft sand background, no border by default. Transitions to a Sage Forest thin border on focus.
- **Chips:** 
  - Used for content tags (e.g., "Yoga," "Meditation"). Use a pill shape with a light Sage or Sand background.
- **Checkboxes/Radios:** 
  - Always use the Primary color for the "checked" state. Use rounded corners even for checkboxes (2px radius) to match the system's softness.
- **Top Navbar:** 
  - Transparent or semi-transparent background with a subtle backdrop blur if content scrolls beneath it.
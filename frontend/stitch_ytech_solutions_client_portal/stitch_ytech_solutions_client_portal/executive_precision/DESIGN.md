---
name: Executive Precision
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#45474c'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#75777d'
  outline-variant: '#c5c6cd'
  surface-tint: '#545f73'
  primary: '#091426'
  on-primary: '#ffffff'
  primary-container: '#1e293b'
  on-primary-container: '#8590a6'
  inverse-primary: '#bcc7de'
  secondary: '#006c49'
  on-secondary: '#ffffff'
  secondary-container: '#6cf8bb'
  on-secondary-container: '#00714d'
  tertiary: '#041528'
  on-tertiary: '#ffffff'
  tertiary-container: '#1a2a3e'
  on-tertiary-container: '#8191a9'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d8e3fb'
  primary-fixed-dim: '#bcc7de'
  on-primary-fixed: '#111c2d'
  on-primary-fixed-variant: '#3c475a'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#d3e4fe'
  tertiary-fixed-dim: '#b7c8e1'
  on-tertiary-fixed: '#0b1c30'
  on-tertiary-fixed-variant: '#38485d'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '600'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: '0'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: '0'
  label-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1'
    letterSpacing: 0.05em
  button:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.01em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-max: 1280px
  gutter: 32px
  margin-x: 40px
  stack-lg: 64px
  stack-md: 32px
  stack-sm: 16px
---

## Brand & Style
The design system is engineered to evoke a sense of absolute reliability, high-tier professional excellence, and effortless clarity. It targets a high-end B2B audience—specifically C-suite executives and project stakeholders—who value efficiency over ornamentation. 

The design style is **Minimalism** at its most refined. It utilizes expansive whitespace (negative space) as a structural element rather than a void. The aesthetic is "High-End Architectural," characterized by thin lines, crisp typography, and a lack of unnecessary decorative elements. Every pixel must serve a functional purpose, ensuring the UI feels like a premium, multi-million dollar enterprise tool.

## Colors
The palette is intentionally restrained to maintain focus and prestige. 
- **Deep Slate Blue (#1E293B)**: Used for primary text, navigation, and heavy branding elements. It provides the grounding force of the interface.
- **Sharp Emerald Green (#10B981)**: Reserved strictly for success states, primary actions (CTAs), and progress indicators. It is the "active" pulse of the system.
- **Slate Gray (#64748B)**: Utilized for secondary text and icons to create a clear hierarchy.
- **Surface Grays (#F8FAFC, #FFFFFF)**: White is the primary surface color to maximize "airiness," while the subtle gray is used for background containers to provide depth without adding visual noise.
- **Border Gray (#E2E8F0)**: Extremely thin lines to define structure subtly.

## Typography
This design system utilizes **Inter** for its systematic, utilitarian, yet modern appearance. 
- **Headings**: Use high-contrast sizing and semi-bold weights. Apply generous tracking (-0.02em) to large display text to create a tight, editorial feel.
- **Body Text**: Maintain a line height of 1.5 to 1.6 to ensure maximum readability in data-heavy views.
- **Labels**: Small labels and secondary metadata should use uppercase with slight letter spacing (0.05em) to differentiate from standard body text.

## Layout & Spacing
The layout follows a **Fluid Grid** model with a maximum container width of 1280px to prevent line lengths from becoming unreadable on ultra-wide monitors.
- **Grid**: A 12-column system with wide 32px gutters.
- **Whitespace**: Use "Stack" spacing religiously. Section transitions should have at least 64px of vertical breathing room. 
- **Mobile**: Margins scale down to 20px, and gutters reduce to 16px. Components reflow to a single column while maintaining the vertical rhythm.

## Elevation & Depth
In alignment with the minimalist aesthetic, this design system avoids heavy shadows. Depth is achieved through:
- **Tonal Layering**: Secondary content sits on #F8FAFC backgrounds, while primary content sits on #FFFFFF "cards."
- **Low-Contrast Outlines**: Instead of shadows, use 1px solid borders in #E2E8F0. 
- **Hover States**: For interactive elements, use a very subtle, highly-diffused ambient shadow: `0 4px 20px rgba(30, 41, 59, 0.05)`. This creates a "lifting" effect without appearing heavy.

## Shapes
The shape language is modern and approachable. 
- **Standard Elements**: Buttons and input fields use a 0.5rem (8px) radius.
- **Containers**: Cards and main UI sections use `rounded-xl` (1rem / 16px) or `rounded-2xl` (1.5rem / 24px) to create a soft, high-tech silhouette that offsets the sharp typography.

## Components
- **Buttons**: Primary buttons are Sharp Emerald Green (#10B981) with white text. Secondary buttons are Deep Slate Blue (#1E293B) with a ghost (outline) style. Use generous horizontal padding (24px).
- **Inputs**: Use a minimal style—1px border (#E2E8F0) that transitions to a 1px Sharp Emerald Green border on focus. No heavy inner shadows.
- **Cards**: Pure white background, 1px border (#E2E8F0), and `rounded-2xl` corners. Padding inside cards should be at least 32px.
- **Chips/Badges**: Use soft background tints (e.g., 10% opacity of the Emerald Green) with bold text for status indicators.
- **Data Tables**: Remove vertical grid lines. Use only horizontal dividers in #F1F5F9. Header rows should be Slate Gray (#64748B) in uppercase label style.
- **Progress Indicators**: Use thin, 4px height bars with the Sharp Emerald Green color to signify completion.
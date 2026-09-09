---
name: adopt a run
description: The new way to push yourself in training and in giving back
colors:
  canvas-black: "rgb(24, 19, 17)"
  canvas-white: "rgb(255, 251, 249)"
  pure-white: "rgb(255, 255, 255)"
  pure-black: "rgb(0, 0, 0)"
  route-orange: "rgb(245, 174, 102)"
  group-run-green: "rgb(91, 190, 73)"
  route-coral: "rgb(255, 132, 132)"
  route-blush: "rgb(229, 153, 158)"
  placeholder-grey: "rgb(217, 217, 217)"
  placeholder-grey-mid: "rgb(191, 191, 191)"
typography:
  scale:
    micro: "12px"
    label: "16px"
    body: "20px"
    metric: "24px"
    tagline: "40px"
    wordmark: "48px"
    title: "64px"
    headline: "80px"
    hero-wordmark: "96px"
    display: "160px"
  display:
    fontFamily: "Degular Display, system-ui, sans-serif"
    fontSize: "clamp(4rem, 8vw, 10rem)"
    fontWeight: 600
    lineHeight: 0.8
  headline:
    fontFamily: "Degular Display, system-ui, sans-serif"
    fontSize: "80px"
    fontWeight: 500
    lineHeight: 0.8
  title:
    fontFamily: "Degular Display, system-ui, sans-serif"
    fontSize: "64px"
    fontWeight: 400
    lineHeight: 0.8
  body:
    fontFamily: "Runda, system-ui, sans-serif"
    fontSize: "20px"
    fontWeight: 400
    lineHeight: 1.0
  label:
    fontFamily: "Runda, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 500
    lineHeight: 1.0
  leading:
    default: 1.0
    body: 1.0
    compressed: 0.8
    action: 0.8
    wordmark: 0.75
    hero-wordmark: 0.6875
rounded:
  none: "0px"
spacing:
  space-00: "0px"
  space-01: "2px"
  space-02: "4px"
  space-03: "8px"
  space-04: "12px"
  space-05: "16px"
  space-06: "24px"
  space-07: "32px"
  space-08: "40px"
  space-09: "48px"
  space-10: "64px"
  space-11: "80px"
  space-12: "96px"
  space-13: "160px"
components:
  route-card:
    backgroundColor: "{colors.route-orange}"
    textColor: "{colors.canvas-black}"
    rounded: "{rounded.none}"
    padding: "24px"
    width: "760px"
    height: "960px"
  route-card-group-band:
    backgroundColor: "{colors.group-run-green}"
    textColor: "{colors.canvas-black}"
    rounded: "{rounded.none}"
    padding: "12px"
    height: "104px"
  cta-button:
    backgroundColor: "{colors.canvas-white}"
    textColor: "{colors.canvas-black}"
    rounded: "{rounded.none}"
    padding: "16px 32px"
  cta-button-hover:
    backgroundColor: "{colors.pure-white}"
    textColor: "{colors.canvas-black}"
    rounded: "{rounded.none}"
    padding: "16px 32px"
---

# Design System: adopt a run

## Overview

**Creative North Star: "The Street-Level Caretaker"**

adopt a run is an international GPS-art running community movement debuting in Hong Kong. Runners "adopt" a route whose GPS trace draws an animal or guardian companion, run/jog/walk it, and fundraise directly for a paired Section 88 charity cause. In the brand's own words: *"the new way to push yourself in training and in giving back."* The foundational mission lines define the soul of the visual world: *"by bringing people together through long-distance running and community art, our project aims to help champion a kinder city — a city where our shared compassion moves us forward."*

The visual philosophy unites warm human earnestness with uncompromising architectural precision. The digital experience rejects the cold, sterile metrics of generic fitness trackers and the corporate gloss of traditional charity race portals. Instead, the interface operates on a disciplined binary canvas of warm Canvas Black (`rgb(24,19,17)`) and Canvas White (`rgb(255,251,249)`), punctuated exclusively by organic mesh noise gradient elements (warm sunset oranges, corals, and mauves with visible grain) and distinct, pastel-chroma route exceptions.

Structure and form are razor-sharp: zero border-radius everywhere, hairline dividers, and tightly nested micro-frames built on an 8px modular cadence. The voice is quiet yet ambitious, employing strict all-lowercase casing for interactive navigation and actions, tight editorial Title Case headings in Degular Display set at an ultra-compressed 80% line-height, and honest flat grey placeholders (`rgb(217,217,217)`) for unresolved visual assets.

**Key Characteristics:**
- **Lowercase UI Voice**: All navigation, CTAs, action buttons, metadata labels, and the wordmark are strictly lowercase (`routes`, `charities`, `donate`, `log a run`, `run with us`, `adopt a run`).
- **Binary Warm Canvas**: Grounded in warm Canvas Black (`rgb(24,19,17)`) and Canvas White (`rgb(255,251,249)`) — never cold terminal black or stark clinical white.
- **Mesh Noise Color Splashes**: All vibrant color splashes originate from warm mesh noise gradient bitmaps with authentic film noise — never synthetic CSS linear gradients.
- **Zero-Radius Architecture**: Every button, card, input, badge, and image frame features crisp 0px corners (`--radius-none: 0px`).
- **Pure Typographic Interface**: Unicode characters (`↓`, `·`, `+`, `×`) and abbreviated metric glyphs (`elev.`, `est.`, `km`, `min`) replace traditional icon sets; zero emoji anywhere.
- **Strict Typographic Roles**: Degular Display for compressed editorial headings (line-height 0.8), Runda for body, metadata, and numerals (line-height 0.9–1.0), and Scale VF strictly reserved for the wordmark and hero CTA.

## Colors

The palette is a strict, warm dual-canvas system where rich chromatic expression is confined to organic mesh noise gradient elements and sanctioned route-card status fills.

### Primary
- **Canvas Black** (`rgb(24, 19, 17)` / `#181311`): The primary dark canvas and base background for the digital experience. An organic, warm charcoal with subtle amber undertones that creates an intimate, tactile print feel.
- **Canvas White** (`rgb(255, 251, 249)` / `#fffbf9`): The primary light canvas and primary text color on dark surfaces. A warm milk-white that eliminates visual fatigue while maintaining sharp optical legibility.

### Secondary
- **Route Orange** (`rgb(245, 174, 102)` / `#f5ae66`): The sanctioned default surface fill for Route Cards. A warm golden peach that provides high contrast against Canvas Black text while evoking dawn and dusk runs.
- **Group Run Green** (`rgb(91, 190, 73)` / `#5bbe49`): The sanctioned badge fill for scheduled group runs. A vivid athletic meadow green signaling collective community action.
- **Route Coral** (`rgb(255, 132, 132)` / `#ff8484`): Sanctioned route card fill variant for featured, endurance, or landmark runs.
- **Route Blush** (`rgb(229, 153, 158)` / `#e5999e`): Sanctioned route card fill variant for beginner-friendly, promenade, or scenic community routes.

### Neutral
- **Pure White** (`rgb(255, 255, 255)` / `#ffffff`): Reserved strictly for the Scale VF brand wordmark (`adopt / a run`) and high-impact CTA hover states.
- **Pure Black** (`rgb(0, 0, 0)` / `#000000`): Pure ink black reserved for high-contrast graphic boundaries and deep shadows.
- **Placeholder Grey** (`rgb(217, 217, 217)` / `#d9d9d9`): Deliberate design-system neutral for unresolved media and imagery frames. Never replaced with stock photos.
- **Placeholder Grey Mid** (`rgb(191, 191, 191)` / `#bfbfbf`): Intermediate neutral for subtle secondary framing.
- **Border Hairline** (`rgba(255, 251, 249, 0.16)`): Translucent hairline stroke creating crystalline separation across dark panels.

### Named Rules
**The Mesh Noise Splash Rule.** Every splash of vibrant color must come from a warm mesh noise gradient bitmap (warm sunset oranges, corals, and mauves with visible grain) or a live shadergradient canvas. Never substitute a CSS `linear-gradient()` or a cool bluish-purple tech gradient.
**The Sanctioned Route Palette Rule.** Chromatic fills (`--route-orange`, `--group-run-green`, `--route-coral`, `--route-blush`) are strictly restricted to Route Cards and status badges. All general page surfaces, headers, and navigation bars remain Canvas Black or Canvas White.
**The Warm Monochrome Rule.** Never use stark `#000000` or `#ffffff` for page backgrounds or body text. Primary surfaces must use Canvas Black (`rgb(24,19,17)`) and Canvas White (`rgb(255,251,249)`).

## Typography

**Display Font:** Degular Display (with `system-ui`, `sans-serif` fallback)  
**Body Font:** Runda (with `system-ui`, `sans-serif` fallback)  
**Wordmark / Hero CTA Font:** Scale VF (with `system-ui`, `sans-serif` fallback)  
**Chinese Font:** Source Han Sans HK VF / Noto Sans HK (with `system-ui`, `sans-serif` fallback)

**Character:** A tension-filled pairing between the compressed, editorial weight of Degular Display and the warm geometric clarity of Runda, punctuated by the wide, experimental presence of Scale VF.

### Hierarchy
- **Display** (Degular Display Semibold 600, 64px–160px [up to 400px], line-height 0.8): Hero headlines, massive numerical milestones, and journey stage markers (`one.`, `two.`, `three.`).
- **Headline** (Degular Display Medium 500, 80px–96px, line-height 0.8): Primary section headings ("Run Routes", "Merging Community", "Proudly Supporting").
- **Title** (Degular Display Regular 400, 64px, line-height 0.8): Subsection headings and route card schedule callouts.
- **Body** (Runda Normal 400, 20px, line-height 1.0, paragraphs 0.9): Core narrative copy, route blurbs, and editorial descriptions. Reads as a block of rich texture with breathy, comma-spliced clauses.
- **Label / Metric** (Runda Medium 500 or Light 300, 16px–24px, line-height 1.0): Navigation items, buttons, route telemetry abbreviations (`elev.`, `est.`, `14km`, `+4m`, `10min`), and Chinese display specs.

### Named Rules
**The Line-Height Compression Rule.** Degular Display must always be set at an ultra-compressed line-height of 0.8 (80%). Headings must read as dense blocks of typographic texture rather than loose text.
**The Typography Line-Height Rules**:
- **Degular Display**: Always set at `0.8` (80%) (`--leading-compressed`).
- **Runda**: Always set at `1.0` (100%) (`--leading-body`) for standard body and metadata.
- **Wordmark & Brand Lockup**: Scale VF and Runda paired with the wordmark must be set at `0.75` (75%) (`--leading-wordmark`).
- **Hero Wordmark**: Scale VF hero wordmark set at line-height 66px / font-size 96px (~0.6875) (`--leading-hero-wordmark`).
- **CTAs & Clickables**: All buttons, links, dismissal buttons, and interactive elements must be set at `0.8` (80%) (`--leading-action`).
- **Global Baseline**: All other text defaults to `1.0` (100%) (`--leading-default`).
**The Runda Weight Ceiling Rule.** No text set in Runda should ever exceed Medium width/weight (500). Bold and Black weights are prohibited in general UI copy; H4 is rendered as Runda Medium all-caps.
**The Scale VF Restraint Rule.** Scale VF is strictly reserved for the two-line wordmark `adopt / a run` and the hero CTA `run with us`. It must never be applied to general headings, body, or standard navigation links.
**The Lowercase Identity Rule.** Navigation links, primary buttons, taglines, metric abbreviations, and the wordmark are strictly lowercase (`routes`, `charities`, `donate`, `log a run`, `run with us`). Editorial titles alone use Title Case.

## Layout

The spatial model is constructed on an 8px base unit with a system of 14 discrete tokens:
`0px` (`--space-00`), `2px` (`--space-01`), `4px` (`--space-02`), `8px` (`--space-03`), `12px` (`--space-04`), `16px` (`--space-05`), `24px` (`--space-06`), `32px` (`--space-07`), `40px` (`--space-08`), `48px` (`--space-09`), `64px` (`--space-10`), `80px` (`--space-11`), `96px` (`--space-12`), `160px` (`--space-13`).

- **Section & Gutter Rhythm**: `48px` (`--space-09`) is the standard section gap and homepage outer page gutter. The routes catalog utilizes a wide `160px` (`--space-13`) horizontal gutter and `140px` vertical gutter.
- **Micro-Frame Density**: Inner layouts favor many small, nested rectangular frames with uniform 8px padding + 8px gap over monolithic open grids, creating a tactile, structured density.
- **Canvas Dimensions**: Master desktop viewport frames are designed at 1512px × 982px.
- **Responsive Adaptation**: On smaller viewports, horizontal gutters step down to 24px and 16px, maintaining edge-to-edge alignment and sharp rectangular integrity without introducing rounded cards.

## Elevation & Depth

The design system is unapologetically flat at rest. Physical depth is expressed through high-contrast tonal layering, razor-thin hairline borders, and translucent atmospheric blur scrims over mesh noise backgrounds rather than heavy drop shadows.

- **At Rest**: Flat surfaces (`box-shadow: none`). Panels, buttons, and cards sit flush on the canvas.
- **Hover Transitions**: Key interactive elements lift with a subtle ambient glow (`box-shadow: 0 0 24px rgba(245, 174, 102, 0.28)`) or border darkening (`--border-hairline` to `--border-strong`).
- **Floating Over Mesh**: Transparent surfaces floating over mesh noise gradients utilize 8–16% white fill paired with a 20px backdrop blur (`backdrop-filter: blur(20px)`). Blur is strictly forbidden over plain white or black.
- **Protection Scrims**: Text layered over mesh gradients is protected by directional gradient scrims (`--scrim-bottom` / `--scrim-top`), never solid capsule boxes behind words.

### Named Rules
**The Flat-By-Default Rule.** Surfaces and cards are completely flat at rest with zero elevation shadow. Depth appears solely as an active response to interaction (hover, press, focus).
**The Scrim Protection Rule.** Never place solid button-like pills or opaque boxes behind text floating over mesh gradients. Protect legibility exclusively through subtle directional gradient scrims.

## Shapes

The form language is strictly sharp, architectural, and geometric.

- **Corner Radius**: Zero radius (`border-radius: 0px`) across all elements. There is no rounding on buttons, cards, images, badges, modals, or inputs.
- **Hairline Borders**: Boundaries between dark frames and panels are drawn with razor-thin hairline strokes (`1px solid rgba(255, 251, 249, 0.16)`).
- **Rotated Set Piece**: The route detail state contains a single signature angled sticker: `GROUP RUN SCHEDULED` set in Runda Bold 96px / 100% line-height. This is the sole rotated element in the system and must remain strictly controlled.
- **Imagery Geometry**: Documentary photos and GPS minimaps are cropped into hard rectangles, cropped tight, and mounted flush inside framing containers.

### Named Rules
**The Zero Radius Rule.** Except for rare third-party embed constraints, there is no rounding in the entire system. All corners must remain strictly sharp (`border-radius: 0px`).
**The Hairline Seam Rule.** Separation between adjacent zones and nested frames must be achieved through razor-thin hairline borders rather than heavy bevels, drop shadows, or thick divider lines.

## Components

### Route Card (Signature Component)
The signature object of the brand, representing an adoptable route.
- **Geometry**: Base size 760px × 960px at scale 1 (scaled to 0.5 [380px × 480px] on the homepage hero and catalog grid). Sharp 0px corners.
- **Fill**: Route Orange (`rgb(245, 174, 102)`) by default; Route Coral (`#ff8484`) or Route Blush (`#e5999e`) as sanctioned alternatives. Text is always Canvas Black (`rgb(24, 19, 17)`).
- **Minimap Container**: Top 432px window displaying a flat GPS polyline trace rotated 90° (`matrix(0,1,-1,0,712,0)`) and scaled past bounds for dramatic hard cropping.
- **Info Block**: 480px height (closed/standard state) or 387px height (group-run state). Contains:
  - District / Neighbourhood: Runda Bold 64px, top-left.
  - Route Blurb: Runda Light 32px, 400px width.
  - Telemetry: Right-aligned duration (`est.` 24px + duration 40px) and elevation gain (`elev.` 24px + gain 40px).
  - Difficulty Level: Runda Light 32px, bottom-left.
  - Distance Numeral: Runda Regular 160px, bottom-right (`14km`).
- **Group Run Band Variant**: Inserts a 104px scheduled band in Group Run Green (`rgb(91, 190, 73)`) with date/time set in Degular Display Semibold 80px, introducing a 24px gap between minimap and info block.

### Brand Wordmark
- **Form**: Two-line stacked lowercase wordmark (`adopt` / `a run`).
- **Hero Wordmark**: Two-line stacked wordmark at font size 96px (`--font-size-hero-wordmark`), line-height 66px (~0.6875 / `--leading-hero-wordmark`), color Canvas White (`rgb(255, 251, 249)`). Scale VF variable font axes: `adopt` (`'wdth' 135, 'wght' 245`), `a` (`'wdth' 100, 'wght' 300`), space (`'wdth' 75, 'wght' 245`), `run` (`'wdth' 175, 'wght' 900`).
- **Header Wordmark**: Scale VF, weight 200, width axis 125 (`font-variation-settings: 'wdth' 125, 'wght' 200`), font size 48px, line-height 0.75 (`--leading-wordmark`), color Pure White (`#ffffff`).
- **Rule**: Never drawn, traced, or exported as an SVG icon/logo. Always rendered inline as living type.

### Buttons & CTAs
- **Shape**: Sharp rectangular buttons with 0px border-radius.
- **Primary CTA**: Canvas White (`rgb(255, 251, 249)`) fill, Canvas Black (`rgb(24, 19, 17)`) text, Runda Medium 500, all-lowercase (`run with us`, `log a run`), padding 16px 32px.
- **Hero CTA**: Features the word `run` isolated in Scale VF.
- **Hover State**: Fill brightens to Pure White (`#ffffff`), border sharpens, and a subtle widening ambient glow appears.
- **Press State**: `transform: scale(0.985)` with a subtle darkening wash.

### Navigation
- **Header Shell**: Starts transparent with no background fill at scroll 0, resting over the hero canvas. On scroll/sticky, transitions to translucent Canvas Black at 60% opacity (`--color-header-translucent`: `rgba(24, 19, 17, 0.60)`) with 20px backdrop blur.
- **Style**: Horizontal inline list of lowercase links (`routes`, `charities`, `donate`, `log a run`) set in Runda Medium 20px, line-height 1.0.
- **States**: Underline animates in smoothly from left to right on hover. Active links retain full opacity; inactive links dim slightly on hover.

### Media Placeholders
- **Style**: Flat Placeholder Grey (`rgb(217, 217, 217)`) rectangles with hairline borders. Used deliberately for unresolved photography and media frames.

## Do's and Don'ts

### Do:
- **Do** format all navigation, buttons, CTAs, brand taglines, and the wordmark in strict all-lowercase (`routes`, `charities`, `donate`, `log a run`, `run with us`, `adopt a run`).
- **Do** maintain sharp 0px corners (`border-radius: 0px`) on every component, card, button, and container.
- **Do** set all Degular Display editorial headings at an ultra-compressed line-height of 0.8 (80%).
- **Do** set body copy, UI metadata, and numerals in Runda, strictly capping weight at Medium (500).
- **Do** use warm mesh noise gradient bitmaps (sunset orange, coral, mauve with organic grain) for color splashes.
- **Do** use Unicode glyphs (`↓`, `·`, `+`, `×`) and abbreviated metric words (`elev.`, `est.`, `km`, `min`) in place of icon libraries.
- **Do** render the brand wordmark exclusively as stacked type in Scale VF (`'wdth' 125, 'wght' 200`).
- **Do** use flat grey (`rgb(217, 217, 217)`) rectangles for unresolved media instead of placeholder stock photos.

### Don't:
- **Don't** add border-radius to any element under any circumstance.
- **Don't** import or use icon libraries (no Lucide, Heroicons, FontAwesome, or custom outline SVGs) or emoji anywhere in the UI.
- **Don't** draw, trace, or generate a graphic logo; the brand mark is strictly typographic.
- **Don't** use synthetic CSS linear gradients or cool bluish-purple gradients for background color splashes.
- **Don't** use stark `#000000` or `#ffffff` for page backgrounds or body text; use Canvas Black (`rgb(24,19,17)`) and Canvas White (`rgb(255,251,249)`).
- **Don't** set Runda in weights exceeding Medium (500).
- **Don't** use Scale VF for standard body text, section headings, or general navigation.
- **Don't** use Title Case or UPPERCASE for buttons, navigation links, or action labels.

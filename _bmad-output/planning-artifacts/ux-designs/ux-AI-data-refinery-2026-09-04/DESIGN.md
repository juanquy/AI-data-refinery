---
name: AI Data Refinery Studio
description: High-throughput semantic intelligence platform for autonomous AI agents and data engineers. Dark-first, dense developer cockpit powered by Cloudflare edge primitives.
status: final
updated: 2026-09-04
colors:
  # Base canvas & tonal layering (Dark First)
  bg-canvas: '#060913'
  bg-surface-primary: '#090d16'
  bg-surface-elevated: '#0f172a'
  bg-surface-card: '#111827'
  border-subtle: '#1e293b'
  border-focus: '#334155'
  border-glow: 'rgba(244, 129, 32, 0.3)'

  # Brand Accents & Cloudflare Heritage
  primary: '#f48120'               # Cloudflare Edge Orange
  primary-hover: '#ff9838'
  primary-glow: 'rgba(244, 129, 32, 0.4)'
  primary-foreground: '#ffffff'

  # Secondary & Functional Accents
  accent-blue: '#3b82f6'           # Edge Worker Blue
  accent-blue-deep: '#1d4ed8'
  accent-blue-glow: 'rgba(59, 130, 246, 0.5)'
  accent-cyan: '#38bdf8'           # Data flow stream
  accent-emerald: '#10b981'        # Clean / Validated / 200 OK
  accent-amber: '#f59e0b'          # Caution / Schema Warning
  accent-rose: '#ef4444'           # Breaking Change / Critical Diff / 402 Exhausted
  accent-purple: '#a855f7'         # Vector & Semantic Embedding

  # Text & Content Hierarchy
  text-primary: '#f8fafc'          # Crisp off-white
  text-secondary: '#94a3b8'        # Muted slate
  text-tertiary: '#64748b'         # Subtle meta
  text-on-accent: '#060913'        # High-contrast dark on orange/emerald badge

  # Severity Scale Tokens (Diff & Alerts)
  severity-critical: '#ef4444'     # Breaking AST removal
  severity-major: '#f97316'        # Signature / Schema breaking
  severity-minor: '#38bdf8'        # Deprecation / Non-breaking addition
  severity-informational: '#64748b'# Cosmetic / Metadata update

typography:
  font-sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
  font-mono: "'JetBrains Mono', 'Fira Code', ui-monospace, SFMono-Regular, monospace"
  
  display:
    fontFamily: '{typography.font-sans}'
    fontSize: '32px'
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: '-0.02em'
  h1:
    fontFamily: '{typography.font-sans}'
    fontSize: '24px'
    fontWeight: '600'
    lineHeight: '1.25'
    letterSpacing: '-0.015em'
  h2:
    fontFamily: '{typography.font-sans}'
    fontSize: '18px'
    fontWeight: '600'
    lineHeight: '1.3'
    letterSpacing: '-0.01em'
  h3:
    fontFamily: '{typography.font-sans}'
    fontSize: '15px'
    fontWeight: '600'
    lineHeight: '1.4'
  body:
    fontFamily: '{typography.font-sans}'
    fontSize: '14px'
    fontWeight: '400'
    lineHeight: '1.5'
  body-sm:
    fontFamily: '{typography.font-sans}'
    fontSize: '12px'
    fontWeight: '400'
    lineHeight: '1.4'
  code:
    fontFamily: '{typography.font-mono}'
    fontSize: '13px'
    fontWeight: '400'
    lineHeight: '1.6'
  badge:
    fontFamily: '{typography.font-mono}'
    fontSize: '11px'
    fontWeight: '600'
    letterSpacing: '0.05em'

rounded:
  sm: '4px'
  md: '6px'
  lg: '8px'
  xl: '12px'
  full: '9999px'

spacing:
  gutter: '24px'
  margin-mobile: '16px'
  card-padding: '20px'
  dense-gap: '8px'
  standard-gap: '16px'

animations:
  shimmer: 'shimmer 4s infinite'
  pulse-glow: 'pulseGlow 4s ease-in-out infinite'
  float-slow: 'floatSlow 6s ease-in-out infinite'
  orbit-rotate: 'orbitRotate 20s linear infinite'
  orbit-reverse: 'orbitRotate 30s linear infinite reverse'
  laser-sweep: 'laserSweep 3.5s ease-in-out infinite'
  gradient-text: 'gradientShift 6s ease infinite'

components:
  top-nav:
    background: '{colors.bg-surface-primary}'
    border-bottom: '1px solid {colors.border-subtle}'
    height: '64px'
  tab-pill-active:
    background: 'rgba(244, 129, 32, 0.15)'
    foreground: '{colors.primary}'
    border: '1px solid rgba(244, 129, 32, 0.4)'
    radius: '{rounded.md}'
  tab-pill-inactive:
    background: 'transparent'
    foreground: '{colors.text-secondary}'
    border: '1px solid transparent'
    radius: '{rounded.md}'
  button-primary:
    background: '{colors.primary}'
    foreground: '{colors.primary-foreground}'
    radius: '{rounded.md}'
    box-shadow: '0 0 15px rgba(244, 129, 32, 0.25)'
  button-secondary:
    background: '{colors.bg-surface-elevated}'
    foreground: '{colors.text-primary}'
    border: '1px solid {colors.border-subtle}'
    radius: '{rounded.md}'
  card-interactive:
    background: '{colors.bg-surface-primary}'
    border: '1px solid {colors.border-subtle}'
    radius: '{rounded.lg}'
  code-inspector:
    background: '#04060b'
    border: '1px solid {colors.border-subtle}'
    foreground: '#e2e8f0'
    radius: '{rounded.lg}'
---

# AI Data Refinery Studio — Visual Identity Design Spine

## Brand & Style

**AI Data Refinery** is high-throughput semantic intelligence infrastructure for the autonomous agentic era. Unlike legacy web scrapers that treat online data as unstructured, throwaway markdown, the Refinery transforms public web surfaces into an evolving, typed graph of verified facts, versioned AST contracts, and machine-actionable intelligence.

The visual language communicates:
1. **Edge Precision & Sub-Millisecond Speed**: Dark, carbon-fiber tone canvas (`#060913`) reflecting raw Cloudflare Workers runtime performance.
2. **Deterministic Clarity**: High-density typography with monospace code distinction (`JetBrains Mono`), crisp high-contrast data tables, and zero decorative fluff.
3. **Cybernetic Vitality (Animations)**: Subtle, continuous edge pulse animations (`pulseGlow`, `shimmer`, `laserSweep`) that signal active live-feed polling, background semantic diffing, and real-time MCP tool invocations without distracting cognitive flow.

[ASSUMPTION]: Studio defaults strictly to Dark Mode (`color-scheme: dark`). Light mode is out-of-scope for launch as data engineers, autonomous agent architects, and devops operators universally prefer high-contrast dark cockpits.

---

## Colors

The palette is engineered around high contrast, functional severity ratings, and brand recognition:

### 1. Canvas & Surface Hierarchy
* **`{colors.bg-canvas}` (`#060913`)**: The deepest foundation. Used as the main backdrop for the entire viewport. Prevents OLED glare while maintaining infinite depth.
* **`{colors.bg-surface-primary}` (`#090d16`)**: Top navigation bar, persistent left sidebar, and container hulls.
* **`{colors.bg-surface-elevated}` (`#0f172a`)**: Cards, interactive panels, dropdown menus, and modal dialogs.
* **`{colors.bg-surface-card}` (`#111827`)**: Nested content blocks, inspector sub-panels, and schema property drawers.

### 2. Primary Accent — Cloudflare Orange
* **`{colors.primary}` (`#f48120`)**: The hero accent. Denotes active tabs, primary call-to-action buttons ("Refine URL", "Publish Schema", "Create Pipeline"), selected filter states, and active websocket telemetry status.
* *Rule*: Never use for background fills with white text except on primary interactive buttons. Never use for error or destruction states.

### 3. Functional Signal Colors (Data Status & Severities)
* **`{colors.accent-emerald}` (`#10b981`)**: Schema conformance passed, HTTP 200 OK, healthy webhook status, positive token savings (+85%).
* **`{colors.severity-critical}` (`#ef4444`)**: AST Breaking removals, schema validation quarantine, failed delivery, HTTP 402 wallet empty.
* **`{colors.severity-major}` (`#f97316`)**: Schema migrations, signature modifications, high payload latency.
* **`{colors.severity-minor}` (`#38bdf8`)**: Deprecation warnings, non-breaking schema expansions, informational version bumps.
* **`{colors.accent-purple}` (`#a855f7`)**: Vectorize 768-dimensional semantic similarity score matches and embedding operations.

---

## Typography

The typography ramp is strictly optimized for dense information architecture:

* **Primary Sans (`system-ui, -apple-system, sans-serif`)**: Delivers instantaneous rendering with zero layout shift. Used for navigation titles, table headers, descriptions, and UI controls.
* **Monospace (`'JetBrains Mono', 'Fira Code', monospace`)**: Mandatory for all machine contracts: JSON schemas, Zod definitions, AST diff snippets, API endpoints, tokens, wallet hashes, and latency metrics.

### Typography Hierarchy
* **Display (`32px / 700 / -0.02em`)**: Landing page hero and dashboard metric summaries.
* **H1 (`24px / 600 / -0.015em`)**: Active studio section title (e.g., "Semantic Diff Engine", "Visual Schema Studio").
* **H2 (`18px / 600`)**: Card section titles, modal headers, schema category labels.
* **Body (`14px / 400`)**: Default interface copy, descriptions, input field values.
* **Code / Pre (`13px / 400 / 1.6`)**: JSON payload previews, curl snippets, diff line numbers.
* **Badge / Tag (`11px / 600 / uppercase`)**: Status pills (`CRITICAL`, `200 OK`, `MCP TOOL`, `PRO`).

---

## Layout & Spacing

* **Shell Layout**: Top navigation bar (`64px` height) with global workspace switcher, active tenant badge, wallet balance ticker, and founder/operator status.
* **Secondary Navigation**: High-density horizontal scrollable pill bar housing the 12 core functional domains (`diffs`, `dev`, `pricing`, `regulatory`, `schemas`, `marketplace`, `export`, `playground`, `mcp`, `help`, `billing`, `management`).
* **Content Canvas**: Max-width container (`1600px` for dense widescreen monitoring, `100%` fluid for code diff comparisons).
* **Grid Systems**: 
  * 2-column split (50/50) for the Live Refiner Playground (Source Input / JSON Output).
  * 3-column split (25% Tree Navigation / 45% Visual Builder Canvas / 30% Live Zod Preview) for Visual Schema Studio.
  * Side-by-side AST Split View (`beforeCodeSnippet` vs `afterCodeSnippet`) with synchronized scrolling.

---

## Elevation & Depth

* **Level 0 (Base)**: `#060913` flat canvas.
* **Level 1 (Panels & Cards)**: `#090d16` with `1px solid #1e293b`. No drop-shadow; crisp borders only.
* **Level 2 (Hover & Focus)**: Border transitions to `#334155`, subtle ambient glow: `box-shadow: 0 0 20px rgba(0, 0, 0, 0.6)`.
* **Level 3 (Modals & Overlays)**: `#0f172a` backdrop with `backdrop-filter: blur(12px)` and `border: 1px solid rgba(244, 129, 32, 0.2)`.

---

## Shapes

* **Buttons & Inputs**: `{rounded.md}` (`6px`) — crisp, technical aesthetic avoiding overly rounded mobile consumer curves.
* **Containers & Cards**: `{rounded.lg}` (`8px`) — structured bounding boxes with subtle `1px` borders.
* **Status Badges & Chips**: `{rounded.full}` (`9999px`) — pill shaped to distinguish categorical meta-tags from clickable buttons.

---

## Key Animations & Motion Language

Preserve all signature CSS keyframe animations exactly as deployed in `apps/web/src/index.css`:

1. **`animate-pulse-glow` (`pulseGlow 4s ease-in-out infinite`)**:
   * *Application*: Active pipeline heartbeat indicator, live Vectorize connection status, and hero feature icons.
   * *Keyframe*: Alternates drop-shadow from `rgba(244, 129, 32, 0.4)` to dual-glow `rgba(244, 129, 32, 0.8)` + `rgba(59, 130, 246, 0.6)`.
2. **`animate-shimmer` (`shimmer 4s infinite`)**:
   * *Application*: Cold loading skeletons, running extraction progress bars, and high-priority breaking change banners.
3. **`animate-laser` (`laserSweep 3.5s ease-in-out infinite`)**:
   * *Application*: Real-time web scraping and AST diff calculation status lines.
4. **`animate-gradient-text` (`gradientShift 6s ease infinite`)**:
   * *Application*: Refinery hero headings and Token Economics counter badges.
5. **`animate-float` (`floatSlow 6s ease-in-out infinite`)**:
   * *Application*: Interactive architecture diagrams and hero graphic emblems.

---

## Components

### 1. Unified Navigation Bar
* Sticky at top, `#090d16` background with `1px solid #1e293b`.
* Left: Refinery Logo + Live Edge Badge (`Cloudflare Global Network - 330+ Cities`).
* Center-Right: Workspace selector (`[Acme Autonomous Fleets v]`), Agent Prepaid Balance ticker (`$42.50 USD [Top Up]`), Quick MCP link.
* Right: Profile avatar / Founder Mode indicator.

### 2. Live Refiner Playground
* Split layout:
  * Left: Input URL field with auto-paste, target schema dropdown, custom prompt textarea, and "Refine at Edge" button (`{colors.primary}`).
  * Right: Tabbed output inspector (`Structured JSON`, `Zod Validation`, `Token Economics`, `Raw HTML Diff`).
  * Metrics Bar: Measured Latency (`42ms`), Input Tokens (`8,450`), Output Tokens (`340`), Token Reduction (`-95.9%`), Ledger Cost (`$0.005`).

### 3. AST Semantic Diff Scrubber
* Split-pane code comparison card:
  * Left pane: `v(N-1)` snippet with red diff highlighting (`rgba(239, 68, 68, 0.15)`).
  * Right pane: `v(N)` snippet with emerald diff highlighting (`rgba(16, 185, 129, 0.15)`).
  * Header: Severity Badge (`CRITICAL REMOVAL`), Entity Key (`stripe-node@15.0.0`), and Migration Directive ("Callbacks removed, switch to await").

### 4. Visual Schema Studio
* Drag-and-drop property builder:
  * Property Row: Field Name, Data Type selector (`String`, `Number`, `Boolean`, `Array<T>`, `Object`, `Enum`), Required checkbox, Validation Rules (`min`, `max`, `regex`).
  * Instant Live Compilation: Right drawer continuously generates and validates the raw JSON Schema and TypeScript Zod definition.
  * Action Bar: "Test on Live URL", "Save Draft", "Publish as MCP Tool" (with tool slug auto-generator).

---

## Do's and Don'ts

### Do
* ✅ **Keep dark-first contrast high**: Ensure all text on `#060913` canvas satisfies WCAG AA (minimum 4.5:1 ratio).
* ✅ **Always show measured units**: Display exact latency (`ms`), token counts, and price per query (`$0.005`) — never hide economics.
* ✅ **Use Monospace for machine identifiers**: All entity keys, schema slugs, and wallet IDs must render in `{typography.font-mono}`.
* ✅ **Provide 1-click copy**: Every JSON snippet, curl command, and MCP config block must have a persistent 1-click clipboard button with visual checkmark feedback.

### Don't
* ❌ **Don't use white or light backgrounds**: The interface must remain dark and edge-focused.
* ❌ **Don't use generic loaders**: Never display a spinner without explanatory status copy (e.g., "Fetching DOM at Edge...", "Synthesizing AST delta...", "Validating Zod contract...").
* ❌ **Don't conceal billing state**: If an agent wallet is below quota or receives an HTTP 402, display the exact remediation path and top-up button immediately.

# Mobile UI Redesign — Design Spec

**Date:** 2026-04-29
**Status:** Approved (pending implementation plan)

## Goal

Redesign the Solitaire UI so it works well on phones in both portrait and landscape, addressing four pain points at once:

1. Cards too small / tableau too cramped at current 45px on small phones.
2. Drag-and-drop is fiddly on touch.
3. Floating HUD and menu button feel disconnected and overlap the play area.
4. Overall mobile experience feels like a shrunk-down desktop, not a real mobile app.

Desktop layout is **out of scope** — it stays exactly as it is today.

## Non-Goals

- No changes to game logic (`src/lib/gameLogic.ts`, `src/store/gameStore.ts`).
- No new game variants.
- No changes to the desktop layout (`≥1024px`).
- No changes to themes (classic / modern both preserved).
- No new settings/preferences beyond what already exists.

## Breakpoints & Orientation

Replace the current `max-width: 1024px` and `max-width: 600px` size-based queries with orientation-aware queries below the desktop threshold.

| Range                                                          | Layout                |
|----------------------------------------------------------------|-----------------------|
| `min-width: 1024px`                                            | Desktop (unchanged)   |
| `max-width: 1023px` AND `orientation: portrait`                | Portrait (Layout C)   |
| `max-width: 1023px` AND `orientation: landscape`               | Landscape (Layout A)  |

Card sizing inside each mobile layout is fluid (computed from viewport), not breakpoint-stepped — so the 600px breakpoint goes away entirely.

## Portrait Layout (Layout C — tableau-first)

```
┌─────────────────────────────┐
│ ☰  Klondike  · 0:42 · ♠12   │  header (~36px)
├─────────────────────────────┤
│                             │
│   tableau — 7 columns       │
│   fills remaining height    │
│                             │
├─────────────────────────────┤
│ 🂠 🂡          ♠ ♥ ♦ ♣      │  dock row 1: piles
│        ↶ 💡 ✦              │  dock row 2: actions
└─────────────────────────────┘
```

**Header (slim, top, fixed)**
- Height: 36px + safe-area-inset-top.
- Left: `☰` menu button (opens existing `MobileMenu` drawer).
- Center: variant title (e.g., "Klondike").
- Right: HUD chip — time, score, moves (matches the three stats currently in `Sidebar.tsx`).
- Background: `var(--glass-bg)` with `backdrop-filter: blur(10px)`.

**Tableau (middle, flex: 1)**
- 7 columns side-by-side, filling viewport width.
- Card width: `(100vw − 16px horizontal padding − 6 × 6px gaps) / 7`. On a 390px iPhone, this is ~50px.
- Card height: maintain 5:7 aspect ratio.
- Stacking offset: 22% of card height for face-up, 8% for face-down (tighter than desktop).
- Tableau itself is **not scrollable** — long stacks compress further (clamped minimum offset 6px).

**Dock (bottom, fixed)**
- Two rows. Total height ~120px + safe-area-inset-bottom.
- Row 1 (piles): stock + waste on the left, foundations on the right (4 cells), `justify-content: space-between`. Card size in dock matches tableau card width.
- Row 2 (actions): undo, hint, new game — large icon-only buttons, ≥44×44px touch targets, evenly spaced.
- Background: `var(--bg-panel)` with top border `var(--border-gold)`.

**Removed in portrait:** the floating `.mobile-hud` (top-left) and floating `.mobile-menu-toggle` (top-right) are gone — both absorbed into the header.

## Landscape Layout (Layout A — side rails)

```
┌────┬──────────────────┬───┐
│HUD │                  │ ♠ │
│ 🂠 │                  │ ♥ │
│ 🂡 │   tableau (7)    │ ♦ │
│    │   full height    │ ♣ │
│ ↶  │                  │   │
│ 💡 │                  │   │
│ ☰  │                  │   │
└────┴──────────────────┴───┘
```

**Left rail (~72px wide + safe-area-inset-left)**
- Top: HUD chip (time / score / moves stacked vertically).
- Middle: stock pile, then waste pile.
- Bottom: action stack — undo, hint, menu (`☰`) — vertical column.

**Right rail (~56px wide + safe-area-inset-right)**
- 4 foundation cells stacked vertically, evenly spaced.

**Tableau (center, flex: 1)**
- 7 columns filling remaining width.
- Card width: `(100vw − rail widths − safe-area − padding) / 7`.
- Card height capped by available vertical space; 5:7 aspect maintained, then height becomes the constraint.
- Stacking offset: 18% of card height face-up, 8% face-down.

**Left-handed mode:** rails swap (mirroring the existing `.app-container.left-handed` behavior — extend it to flip rail positions in landscape).

**Floating elements removed in landscape too** — same as portrait, all chrome is structural.

## Touch Interactions (Model A — tap-to-move primary, drag still works)

### Tap-to-move flow
1. **Tap a face-up card** → it enters `selected` state: subtle scale (1.04) + gold outline glow.
2. All valid destinations across the board pulse with a gold dashed outline (`validDrop` state).
3. **Tap a valid destination** → move executes, selection clears, highlights fade.
4. **Tap the same card again** → selection cancelled, no move.
5. **Tap an invalid destination or empty space** → selection cancelled.
6. **Tap a different valid card** → selection switches to that card.

For tableau stacks, tapping a face-up card in the middle of a pile selects that card AND all cards below it (same as drag behavior today).

### Double-tap → auto-foundation
Existing behavior preserved (see `Board.tsx:77-155`). Double-tap finds the first foundation that accepts the card; falls back to smallest valid tableau pile.

### Drag still works
- dnd-kit configured with `PointerSensor` activation constraint: `delay: 120ms, tolerance: 6px` so a tap doesn't accidentally start a drag and a drag doesn't accidentally fire a tap.
- On drag start: `navigator.vibrate(10)` for haptic feedback (no-op on browsers without support).
- Drag overlay unchanged from current implementation.

### Touch target minimums
All interactive controls in dock/rails are ≥44×44px. Cards meet this implicitly via height even at 48–50px width (84–87px tall at 5:7).

## Component Changes

### `src/components/Game/Board.tsx`
- Add state: `selectedCardId: string | null`, `selectedSource: { type, pileIndex } | null`.
- New handler `handleCardTap(cardId, pileIndex?)` — sets/clears selection or executes move when a destination is selected.
- New handler `handleDestinationTap(destinationType, destinationIndex)` — executes pending move.
- Compute `validDestinations: Set<string>` whenever `selectedCardId` changes; pass down to `Pile`/`Card` for highlighting.
- Configure `DndContext` sensors with the activation constraint described above.

### `src/components/Game/Card.tsx`
- New props: `selected?: boolean`, `validDrop?: boolean`, `onTap?: () => void`.
- New CSS classes `.card-selected` and `.card-valid-drop` for the visual states.

### `src/components/Game/Pile.tsx`
- New props: `validDrop?: boolean`, `onPileTap?: () => void`.
- Render gold-outline overlay on the empty slot or top card when `validDrop` is true.
- Pass tap handlers through to `Card`.

### `src/components/UI/MobileMenu.tsx`
- Trigger remains a `☰` button, but rendered inline inside the new mobile header / left rail rather than as a `position: fixed` floating button. The drawer itself (slide-in from right) keeps current behavior. Settings, theme toggle, seed input, new-game options stay inside the drawer.

### `src/app/globals.css`
- Remove `.mobile-menu-toggle`, `.mobile-overlay` floating-button styles, `.mobile-hud` (the trigger absorbs into structural chrome; the overlay still backs the drawer but is repositioned cleanly).
- Replace `@media (max-width: 1024px)` and `@media (max-width: 600px)` blocks with:
  - `@media (max-width: 1023px) and (orientation: portrait)` — portrait layout.
  - `@media (max-width: 1023px) and (orientation: landscape)` — landscape layout.
- Add classes: `.mobile-header`, `.mobile-dock`, `.mobile-dock-piles`, `.mobile-dock-actions`, `.mobile-rail-left`, `.mobile-rail-right`.
- Add card states: `.card-selected`, `.card-valid-drop`.
- Make card sizes fluid using CSS `clamp()` and viewport math instead of fixed pixel values per breakpoint.
- Apply `env(safe-area-inset-*)` to header/dock/rails.

### `src/components/Game/VariantGameWrapper.tsx`
- Render the new mobile chrome (header, dock, rails) conditionally based on the same orientation-aware structure used in CSS. The component tree should always render the same children — orientation-specific wrappers are positioned via CSS, not conditional React rendering — to avoid remount on rotation.

### What stays untouched
- `src/lib/gameLogic.ts`
- `src/store/gameStore.ts`
- `src/components/UI/Sidebar.tsx` (desktop only)
- `src/components/UI/WinModal.tsx` (already centers fine)
- All ad components

## Edge Cases & Decisions

- **Very long tableau stacks:** offset compresses down to a 6px floor. Beyond that, cards visually overlap more — accepted, since this only affects late-game or unusual stacks.
- **Very small landscape (height < 380px):** accepted as-is. ~80px-wide cards on a 667-wide screen are usable; no separate fallback layout.
- **Rotation mid-game:** state is preserved (game state lives in store, layout is CSS-driven). No remount.
- **Tap on stock pile:** triggers `drawCard` (existing behavior), not selection — stock has no selectable cards.
- **Tap on face-down card:** does nothing (consistent with current behavior).
- **Selection persists across drags:** if a card is selected via tap, then the user starts dragging a different card, selection clears at drag start.

## Testing Plan

- Manual test matrix: iPhone SE (portrait + landscape), iPhone 15 (both), iPad portrait, iPad landscape, desktop (regression). Use Safari + Chrome.
- Verify tap-to-move flow end-to-end: select, valid destinations highlight, tap to place, tap to cancel.
- Verify drag still works on touch and mouse.
- Verify double-tap to foundation still works.
- Verify rotation mid-game does not reset state.
- Verify safe-area insets on a notched device (header doesn't tuck under notch, dock doesn't sit under home indicator).
- Verify desktop layout is pixel-identical to before (visual diff or screenshot comparison).

## Out of Scope (Future Work)

- Animations / card-flight transitions on moves.
- Customizable card sizes via the existing `--card-scale` CSS variable on mobile (mobile uses fluid sizing instead).
- Gesture shortcuts beyond tap and drag (e.g., swipe-to-undo).
- Reduced-motion preference handling for the highlight pulse.

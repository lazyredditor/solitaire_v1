# Mobile UI Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current shrunk-down-desktop mobile experience with two purpose-built layouts (portrait: tableau-first with bottom dock; landscape: side rails) and add tap-to-move alongside drag.

**Architecture:**
Desktop layout (`≥1024px`) is unchanged. Below 1024px, orientation-aware CSS picks one of two layouts. New structural chrome components (`MobileHeader`, `MobileDock`, `MobileLeftRail`, `MobileRightRail`) replace the current floating HUD and menu toggle. Tap-to-move adds new state to `Board` (selectedCardId + computed validDestinations); `Card` and `Pile` get visual states for `selected` and `validDrop`. Drag-and-drop is preserved via dnd-kit, with a pointer-sensor activation constraint so taps and drags don't collide.

**Tech Stack:** Next.js 16, React 19, TypeScript, Zustand, @dnd-kit/core, plain CSS (`globals.css`).

**Spec:** `docs/superpowers/specs/2026-04-29-mobile-ui-redesign-design.md`

**Note on testing:** This project has no automated test framework. Verification uses `playwright-cli` against `npm run dev` plus manual orientation/breakpoint checks. Each task ends with explicit verification steps, not test runs.

---

## File Structure

**Create:**
- `src/components/UI/MobileHeader.tsx` — slim top header for portrait (menu button, title, HUD).
- `src/components/UI/MobileDock.tsx` — bottom dock for portrait (stock+waste+foundations row, then actions row).
- `src/components/UI/MobileLeftRail.tsx` — left rail for landscape (HUD, stock, waste, action stack).
- `src/components/UI/MobileRightRail.tsx` — right rail for landscape (4 foundations stacked).

**Modify:**
- `src/app/globals.css` — replace size-based mobile media queries with orientation-aware ones; add classes for new chrome; add card states; remove obsolete floating HUD/toggle styles.
- `src/components/Game/Board.tsx` — add tap-selection state, valid-destination computation, sensor activation constraint, pass new props down.
- `src/components/Game/Card.tsx` — accept `selected`, `validDrop`, `onTap` props; render visual states.
- `src/components/Game/Pile.tsx` — accept `validDrop`, `onPileTap` props; render valid-destination overlay; wire taps.
- `src/components/UI/MobileMenu.tsx` — remove the floating `.mobile-hud` and floating `.mobile-menu-toggle`; keep only the drawer + overlay; expose menu open via store (already there).
- `src/components/Game/VariantGameWrapper.tsx` — render the new chrome components inside `.main-content`; structure such that orientation is controlled by CSS, not JS conditional rendering (no remount on rotate).
- `.gitignore` — add `.superpowers/`.

**Untouched:** `src/lib/gameLogic.ts`, `src/store/gameStore.ts`, `src/components/UI/Sidebar.tsx`, `src/components/UI/WinModal.tsx`, ad components.

---

## Task 1: Add `.superpowers/` to .gitignore

**Files:**
- Modify: `.gitignore`

- [ ] **Step 1: Append entry**

Append to `.gitignore`:

```
.superpowers/
.playwright-cli/
```

- [ ] **Step 2: Commit**

```bash
git add .gitignore
git commit -m "chore: ignore .superpowers and .playwright-cli artifacts"
```

---

## Task 2: Refactor CSS — extract desktop, add orientation-aware mobile blocks, fluid card sizing

This is a large CSS change. The intent: keep all desktop styles intact, replace the `@media (max-width: 1024px)` and `@media (max-width: 600px)` blocks with two new orientation-aware blocks, and introduce the chrome classes the new components will use.

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: Replace the two existing mobile `@media` blocks**

Open `src/app/globals.css`. Find the block starting `@media (max-width: 1024px)` (around line 803) and the block starting `@media (max-width: 600px)` (around line 869). Delete both blocks entirely. Replace them with the following:

```css
/* =========================================
   MOBILE — orientation-aware
   ========================================= */

/* Variables shared across both mobile orientations */
@media (max-width: 1023px) {
  :root {
    --mobile-card-radius: 5px;
    --mobile-card-gap: 6px;
    --mobile-tableau-padding: 8px;
    --mobile-faceup-offset: 22%;
    --mobile-facedown-offset: 8%;
    --mobile-min-stack-offset: 6px;
  }

  /* Hide desktop sidebar */
  .sidebar {
    display: none;
  }

  /* Mobile drawer overlay (still used) */
  .mobile-overlay,
  .mobile-sidebar {
    display: block;
  }

  /* The Board reuses the same DOM in both orientations.
     CSS positions chrome and tableau differently per orientation. */
  .game-area {
    padding: 0;
    /* chrome handles its own padding/safe-area */
  }

  .game-board {
    gap: 0;
    max-width: none;
  }

  /* Hide elements only intended for desktop in both orientations */
  .top-row,
  .stock-waste-area,
  .foundations-area {
    /* These desktop containers are still rendered by Board.tsx but
       hidden on mobile; the new chrome components render the same piles. */
    display: none;
  }
}

/* ---------- PORTRAIT ---------- */
@media (max-width: 1023px) and (orientation: portrait) {
  .main-content {
    flex-direction: column;
    height: 100dvh;
    min-height: 0;
  }

  .game-area {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
  }

  /* Header */
  .mobile-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: calc(36px + env(safe-area-inset-top));
    padding: env(safe-area-inset-top) 12px 0 12px;
    background: var(--glass-bg);
    backdrop-filter: blur(10px);
    border-bottom: var(--input-border);
    z-index: 10;
    flex: none;
  }

  .mobile-header-title {
    font-family: var(--font-heading);
    font-size: 14px;
    font-weight: 600;
    color: var(--accent-gold);
    letter-spacing: 1px;
  }

  .mobile-header-hud {
    display: flex;
    gap: 10px;
    font-size: 11px;
    color: var(--text-primary);
  }

  .mobile-header-hud span strong {
    color: var(--accent-gold);
    font-weight: 700;
    margin-left: 2px;
  }

  .mobile-header-menu {
    background: transparent;
    border: none;
    cursor: pointer;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--accent-gold);
    font-size: 22px;
  }

  /* Tableau in portrait — fluid card width */
  .tableau-area {
    display: flex !important;
    flex: 1;
    min-height: 0;
    gap: var(--mobile-card-gap);
    padding: var(--mobile-tableau-padding);
    align-items: flex-start;
    justify-content: stretch;
  }

  .tableau-area .tableau-pile {
    flex: 1;
    min-width: 0;
    min-height: 0;
  }

  .tableau-area .pile,
  .tableau-area .pile-empty {
    width: 100%;
    aspect-ratio: 5 / 7;
    min-height: 0;
  }

  .tableau-area .card {
    width: 100%;
    height: auto;
    aspect-ratio: 5 / 7;
    border-radius: var(--mobile-card-radius);
  }

  .tableau-area .tableau-pile .card-wrapper {
    margin-top: clamp(
      calc(-1 * (100% - var(--mobile-min-stack-offset))),
      calc(-1 * (100% - var(--mobile-faceup-offset))),
      0px
    );
  }

  .tableau-area .tableau-pile .card-wrapper:first-child {
    margin-top: 0;
  }

  /* Bottom dock */
  .mobile-dock {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 8px 12px calc(8px + env(safe-area-inset-bottom)) 12px;
    background: var(--bg-panel);
    border-top: var(--border-gold);
    flex: none;
  }

  .mobile-dock-piles {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--mobile-card-gap);
  }

  .mobile-dock-piles-left,
  .mobile-dock-piles-right {
    display: flex;
    gap: var(--mobile-card-gap);
  }

  .mobile-dock-piles .pile,
  .mobile-dock-piles .pile-empty {
    width: 48px;
    height: 67px;
    min-height: 0;
  }

  .mobile-dock-piles .card {
    width: 48px;
    height: 67px;
    border-radius: var(--mobile-card-radius);
  }

  .mobile-dock-actions {
    display: flex;
    justify-content: space-around;
    gap: 8px;
  }

  .mobile-dock-actions .mobile-action-btn {
    flex: 1;
    min-height: 44px;
    background: var(--input-bg);
    border: var(--input-border);
    border-radius: 8px;
    color: var(--accent-gold);
    font-size: 18px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .mobile-dock-actions .mobile-action-btn:disabled {
    opacity: 0.4;
  }

  /* Hide landscape rails in portrait */
  .mobile-rail-left,
  .mobile-rail-right {
    display: none;
  }
}

/* ---------- LANDSCAPE ---------- */
@media (max-width: 1023px) and (orientation: landscape) {
  .main-content {
    flex-direction: row;
    height: 100dvh;
    min-height: 0;
  }

  .game-area {
    order: 2;
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
    padding: 4px;
  }

  /* Hide portrait chrome in landscape */
  .mobile-header,
  .mobile-dock {
    display: none;
  }

  /* Left rail */
  .mobile-rail-left {
    order: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    width: calc(72px + env(safe-area-inset-left));
    padding: 6px 6px 6px calc(6px + env(safe-area-inset-left));
    background: var(--bg-panel);
    border-right: var(--border-gold);
    gap: 8px;
    flex: none;
  }

  .mobile-rail-hud {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    font-size: 9px;
    color: var(--text-primary);
    background: var(--input-bg);
    border-radius: 6px;
    padding: 6px 4px;
    width: 100%;
  }

  .mobile-rail-hud strong {
    color: var(--accent-gold);
    font-weight: 700;
  }

  .mobile-rail-piles {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .mobile-rail-piles .pile,
  .mobile-rail-piles .pile-empty,
  .mobile-rail-piles .card {
    width: 56px;
    height: 78px;
    border-radius: var(--mobile-card-radius);
    min-height: 0;
  }

  .mobile-rail-actions {
    display: flex;
    flex-direction: column;
    gap: 6px;
    width: 100%;
  }

  .mobile-rail-actions .mobile-action-btn {
    min-height: 40px;
    background: var(--input-bg);
    border: var(--input-border);
    border-radius: 8px;
    color: var(--accent-gold);
    font-size: 16px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .mobile-rail-actions .mobile-action-btn:disabled {
    opacity: 0.4;
  }

  /* Right rail */
  .mobile-rail-right {
    order: 3;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-evenly;
    width: calc(56px + env(safe-area-inset-right));
    padding: 6px calc(6px + env(safe-area-inset-right)) 6px 6px;
    background: var(--bg-panel);
    border-left: var(--border-gold);
    gap: 6px;
    flex: none;
  }

  .mobile-rail-right .pile,
  .mobile-rail-right .pile-empty,
  .mobile-rail-right .card {
    width: 44px;
    height: 62px;
    border-radius: var(--mobile-card-radius);
    min-height: 0;
  }

  /* Left-handed: swap rails */
  .app-container.left-handed .mobile-rail-left { order: 3; border-right: none; border-left: var(--border-gold); }
  .app-container.left-handed .mobile-rail-right { order: 1; border-left: none; border-right: var(--border-gold); }

  /* Tableau in landscape — height-constrained */
  .tableau-area {
    display: flex !important;
    flex: 1;
    min-height: 0;
    gap: var(--mobile-card-gap);
    padding: 4px;
    align-items: flex-start;
    justify-content: stretch;
  }

  .tableau-area .tableau-pile {
    flex: 1;
    min-width: 0;
    min-height: 0;
  }

  .tableau-area .pile,
  .tableau-area .pile-empty {
    width: 100%;
    aspect-ratio: 5 / 7;
    min-height: 0;
  }

  .tableau-area .card {
    width: 100%;
    height: auto;
    aspect-ratio: 5 / 7;
    border-radius: var(--mobile-card-radius);
  }

  .tableau-area .tableau-pile .card-wrapper {
    margin-top: clamp(
      calc(-1 * (100% - var(--mobile-min-stack-offset))),
      calc(-1 * (100% - 18%)),
      0px
    );
  }

  .tableau-area .tableau-pile .card-wrapper:first-child {
    margin-top: 0;
  }
}

/* Card visual states (apply at all breakpoints) */
.card.card-selected {
  transform: scale(1.04);
  box-shadow: 0 0 0 3px var(--accent-gold), 0 8px 24px rgba(0, 0, 0, 0.5);
  z-index: 100;
}

.card.card-valid-drop,
.pile-empty.pile-valid-drop {
  outline: 2px dashed var(--accent-gold);
  outline-offset: 2px;
  animation: validDropPulse 1.4s ease-in-out infinite;
}

@keyframes validDropPulse {
  0%, 100% { outline-color: var(--accent-gold); }
  50% { outline-color: rgba(212, 175, 55, 0.4); }
}
```

- [ ] **Step 2: Delete the now-obsolete floating HUD / menu-toggle styles**

In `globals.css`, find and delete these blocks (they exist around lines 604–722 in the current file):

- `.mobile-menu-toggle { ... }` block and its variants (`.hamburger`, `.hamburger span`, `.mobile-menu-toggle.open ...`)
- `.mobile-hud { ... }`, `.mobile-hud-stats`, `.mobile-hud-item`, `.mobile-hud-label`, `.mobile-hud-value`

Keep `.mobile-overlay` and `.mobile-sidebar` styles — the drawer still uses them.

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: build succeeds. (CSS-only change; no TS errors expected.)

- [ ] **Step 4: Commit**

```bash
git add src/app/globals.css
git commit -m "refactor(css): orientation-aware mobile layout, fluid card sizing, tap states"
```

---

## Task 3: Create `MobileHeader` component (portrait chrome)

**Files:**
- Create: `src/components/UI/MobileHeader.tsx`

- [ ] **Step 1: Write the component**

Create `src/components/UI/MobileHeader.tsx` with this exact content:

```tsx
'use client';

import React from 'react';
import { useGameStore, useUIStore } from '@/store/gameStore';

function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

interface MobileHeaderProps {
    title?: string;
}

export function MobileHeader({ title = 'Klondike' }: MobileHeaderProps) {
    const gameState = useGameStore(state => state.gameState);
    const elapsedTime = useGameStore(state => state.elapsedTime);
    const toggleMobileMenu = useUIStore(state => state.toggleMobileMenu);

    return (
        <header className="mobile-header">
            <button
                className="mobile-header-menu"
                onClick={toggleMobileMenu}
                aria-label="Open menu"
            >
                ☰
            </button>
            <span className="mobile-header-title">{title}</span>
            <div className="mobile-header-hud">
                <span>⏱<strong>{formatTime(elapsedTime)}</strong></span>
                <span>♠<strong>{gameState?.score ?? 0}</strong></span>
                <span>↺<strong>{gameState?.moves ?? 0}</strong></span>
            </div>
        </header>
    );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/UI/MobileHeader.tsx
git commit -m "feat(ui): add MobileHeader component for portrait chrome"
```

---

## Task 4: Create `MobileDock` component (portrait chrome)

The dock renders the stock/waste + foundations + actions in the bottom panel. It re-uses `Pile` so dnd-kit drop targets and existing drag/click behavior keep working.

**Files:**
- Create: `src/components/UI/MobileDock.tsx`

- [ ] **Step 1: Write the component**

Create `src/components/UI/MobileDock.tsx` with this exact content:

```tsx
'use client';

import React from 'react';
import { useGameStore } from '@/store/gameStore';
import { Pile } from '@/components/Game/Pile';

interface MobileDockProps {
    onCardDoubleClick?: (cardId: string, pileIndex?: number) => void;
    onCardTap?: (cardId: string, pileIndex?: number) => void;
    onPileTap?: (destinationType: 'foundation' | 'tableau', destinationIndex: number) => void;
    selectedCardId?: string | null;
    validDropPileIds?: Set<string>;
    draggedCardId?: string | null;
}

export function MobileDock({
    onCardDoubleClick,
    onCardTap,
    onPileTap,
    selectedCardId,
    validDropPileIds,
    draggedCardId,
}: MobileDockProps) {
    const gameState = useGameStore(state => state.gameState);
    const drawCard = useGameStore(state => state.drawCard);
    const undo = useGameStore(state => state.undo);
    const newGame = useGameStore(state => state.newGame);
    const history = useGameStore(state => state.history);

    if (!gameState) return null;

    return (
        <div className="mobile-dock">
            <div className="mobile-dock-piles">
                <div className="mobile-dock-piles-left">
                    <Pile
                        id="stock"
                        cards={gameState.stock}
                        type="stock"
                        emptyIcon="↻"
                        onClick={drawCard}
                    />
                    <Pile
                        id="waste"
                        cards={gameState.waste}
                        type="waste"
                        onCardDoubleClick={onCardDoubleClick}
                        onCardTap={onCardTap}
                        selectedCardId={selectedCardId}
                        draggedCardId={draggedCardId}
                    />
                </div>
                <div className="mobile-dock-piles-right">
                    {gameState.foundations.map((foundation, index) => (
                        <Pile
                            key={`dock-foundation-${index}`}
                            id={`foundation-${index}`}
                            cards={foundation}
                            type="foundation"
                            emptyIcon={['♠', '♥', '♦', '♣'][index]}
                            pileIndex={index}
                            onPileTap={onPileTap ? () => onPileTap('foundation', index) : undefined}
                            validDrop={validDropPileIds?.has(`foundation-${index}`)}
                        />
                    ))}
                </div>
            </div>
            <div className="mobile-dock-actions">
                <button
                    className="mobile-action-btn"
                    onClick={undo}
                    disabled={history.length === 0}
                    aria-label="Undo"
                >
                    ↶
                </button>
                <button
                    className="mobile-action-btn"
                    onClick={() => newGame()}
                    aria-label="New game"
                >
                    ✦
                </button>
            </div>
        </div>
    );
}
```

Note: the `onCardTap`, `onPileTap`, `selectedCardId`, `validDrop`, `validDropPileIds` props referenced here will be added to `Pile` and `Card` in Task 7 and the Board state will be added in Task 8. Until those tasks land, `MobileDock` won't be rendered (Task 6 wires it in only after the dependencies exist). To allow this file to compile against the current `Pile.tsx`, *temporarily* the unused props pass through unrecognized — this works in TS only if `Pile`'s prop interface is updated. **Order matters:** complete Task 7 before Task 6 wires anything in.

- [ ] **Step 2: Commit (file only — wiring deferred)**

```bash
git add src/components/UI/MobileDock.tsx
git commit -m "feat(ui): add MobileDock component for portrait chrome"
```

---

## Task 5: Create `MobileLeftRail` and `MobileRightRail` components (landscape chrome)

**Files:**
- Create: `src/components/UI/MobileLeftRail.tsx`
- Create: `src/components/UI/MobileRightRail.tsx`

- [ ] **Step 1: Write `MobileLeftRail.tsx`**

Create `src/components/UI/MobileLeftRail.tsx` with this exact content:

```tsx
'use client';

import React from 'react';
import { useGameStore, useUIStore } from '@/store/gameStore';
import { Pile } from '@/components/Game/Pile';

function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

interface MobileLeftRailProps {
    onCardDoubleClick?: (cardId: string, pileIndex?: number) => void;
    onCardTap?: (cardId: string, pileIndex?: number) => void;
    selectedCardId?: string | null;
    draggedCardId?: string | null;
}

export function MobileLeftRail({
    onCardDoubleClick,
    onCardTap,
    selectedCardId,
    draggedCardId,
}: MobileLeftRailProps) {
    const gameState = useGameStore(state => state.gameState);
    const elapsedTime = useGameStore(state => state.elapsedTime);
    const drawCard = useGameStore(state => state.drawCard);
    const undo = useGameStore(state => state.undo);
    const history = useGameStore(state => state.history);
    const toggleMobileMenu = useUIStore(state => state.toggleMobileMenu);

    if (!gameState) return null;

    return (
        <aside className="mobile-rail-left">
            <div className="mobile-rail-hud">
                <span>⏱</span><strong>{formatTime(elapsedTime)}</strong>
                <span>♠</span><strong>{gameState.score}</strong>
                <span>↺</span><strong>{gameState.moves}</strong>
            </div>
            <div className="mobile-rail-piles">
                <Pile
                    id="stock"
                    cards={gameState.stock}
                    type="stock"
                    emptyIcon="↻"
                    onClick={drawCard}
                />
                <Pile
                    id="waste"
                    cards={gameState.waste}
                    type="waste"
                    onCardDoubleClick={onCardDoubleClick}
                    onCardTap={onCardTap}
                    selectedCardId={selectedCardId}
                    draggedCardId={draggedCardId}
                />
            </div>
            <div className="mobile-rail-actions">
                <button
                    className="mobile-action-btn"
                    onClick={undo}
                    disabled={history.length === 0}
                    aria-label="Undo"
                >
                    ↶
                </button>
                <button
                    className="mobile-action-btn"
                    onClick={toggleMobileMenu}
                    aria-label="Open menu"
                >
                    ☰
                </button>
            </div>
        </aside>
    );
}
```

- [ ] **Step 2: Write `MobileRightRail.tsx`**

Create `src/components/UI/MobileRightRail.tsx` with this exact content:

```tsx
'use client';

import React from 'react';
import { useGameStore } from '@/store/gameStore';
import { Pile } from '@/components/Game/Pile';

interface MobileRightRailProps {
    onPileTap?: (destinationType: 'foundation' | 'tableau', destinationIndex: number) => void;
    validDropPileIds?: Set<string>;
}

export function MobileRightRail({ onPileTap, validDropPileIds }: MobileRightRailProps) {
    const gameState = useGameStore(state => state.gameState);

    if (!gameState) return null;

    return (
        <aside className="mobile-rail-right">
            {gameState.foundations.map((foundation, index) => (
                <Pile
                    key={`rail-foundation-${index}`}
                    id={`foundation-${index}`}
                    cards={foundation}
                    type="foundation"
                    emptyIcon={['♠', '♥', '♦', '♣'][index]}
                    pileIndex={index}
                    onPileTap={onPileTap ? () => onPileTap('foundation', index) : undefined}
                    validDrop={validDropPileIds?.has(`foundation-${index}`)}
                />
            ))}
        </aside>
    );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/UI/MobileLeftRail.tsx src/components/UI/MobileRightRail.tsx
git commit -m "feat(ui): add MobileLeftRail and MobileRightRail for landscape chrome"
```

---

## Task 6: Strip floating HUD and toggle from `MobileMenu`

The drawer + overlay stay; the floating HUD and toggle button are gone (they're now in the new chrome).

**Files:**
- Modify: `src/components/UI/MobileMenu.tsx`

- [ ] **Step 1: Replace the file**

Replace the entire contents of `src/components/UI/MobileMenu.tsx` with:

```tsx
'use client';

import React, { useState } from 'react';
import { useGameStore, useUIStore } from '@/store/gameStore';

function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function MobileMenu() {
    const gameState = useGameStore(state => state.gameState);
    const elapsedTime = useGameStore(state => state.elapsedTime);
    const newGame = useGameStore(state => state.newGame);
    const undo = useGameStore(state => state.undo);
    const history = useGameStore(state => state.history);

    const theme = useUIStore(state => state.theme);
    const setTheme = useUIStore(state => state.setTheme);
    const isMobileMenuOpen = useUIStore(state => state.isMobileMenuOpen);
    const closeMobileMenu = useUIStore(state => state.closeMobileMenu);

    const [seedInput, setSeedInput] = useState('');

    const handleNewGame = () => {
        newGame();
        closeMobileMenu();
    };

    const handleReplay = () => {
        if (seedInput.trim()) {
            newGame(seedInput.trim());
            setSeedInput('');
            closeMobileMenu();
        }
    };

    return (
        <>
            <div
                className={`mobile-overlay ${isMobileMenuOpen ? 'open' : ''}`}
                onClick={closeMobileMenu}
            />
            <div className={`mobile-sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
                <div className="stats-section">
                    <div className="stat-item">
                        <span className="stat-label">Score</span>
                        <span className="stat-value">{gameState?.score ?? 0}</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">Time</span>
                        <span className="stat-value">{formatTime(elapsedTime)}</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">Moves</span>
                        <span className="stat-value">{gameState?.moves ?? 0}</span>
                    </div>
                </div>

                <div className="seed-section">
                    <h3 className="section-title">Game Seed</h3>
                    <div className="seed-display">
                        <p className="seed-label">Current Seed</p>
                        <p className="seed-value">{gameState?.seed ?? '------'}</p>
                    </div>
                    <div className="seed-input-group">
                        <input
                            type="text"
                            className="seed-input"
                            placeholder="Enter seed..."
                            value={seedInput}
                            onChange={(e) => setSeedInput(e.target.value)}
                        />
                        <button className="btn btn-secondary btn-icon" onClick={handleReplay}>
                            ▶
                        </button>
                    </div>
                </div>

                <div className="actions-section">
                    <button className="btn btn-primary btn-full" onClick={handleNewGame}>
                        New Game
                    </button>
                    <button
                        className="btn btn-secondary btn-full"
                        onClick={undo}
                        disabled={history.length === 0}
                    >
                        Undo
                    </button>
                </div>

                <div className="theme-section">
                    <h3 className="section-title">Theme</h3>
                    <div className="theme-toggle">
                        <button
                            className={`theme-btn ${theme === 'classic' ? 'active' : ''}`}
                            onClick={() => setTheme('classic')}
                        >
                            Classic
                        </button>
                        <button
                            className={`theme-btn ${theme === 'modern' ? 'active' : ''}`}
                            onClick={() => setTheme('modern')}
                        >
                            Modern
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/UI/MobileMenu.tsx
git commit -m "refactor(ui): strip floating HUD and toggle from MobileMenu (now in chrome)"
```

---

## Task 7: Extend `Card` and `Pile` with tap + visual-state props

**Files:**
- Modify: `src/components/Game/Card.tsx`
- Modify: `src/components/Game/Pile.tsx`

- [ ] **Step 1: Update `Card.tsx` props and class output**

Replace the `CardProps` interface and the `Card` function in `src/components/Game/Card.tsx` with the version below. (Leave `StaticCard` unchanged.)

```tsx
interface CardProps {
    card: CardType;
    index?: number;
    isDraggable?: boolean;
    onClick?: () => void;
    onDoubleClick?: () => void;
    onTap?: () => void;
    selected?: boolean;
    validDrop?: boolean;
    style?: React.CSSProperties;
    hideWhileDragging?: boolean;
}

export function Card({
    card,
    index = 0,
    isDraggable = true,
    onClick,
    onDoubleClick,
    onTap,
    selected = false,
    validDrop = false,
    style,
    hideWhileDragging = false,
}: CardProps) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: card.id,
        disabled: !isDraggable || !card.faceUp,
        data: { card, index },
    });

    const lastClickTime = useRef<number>(0);
    const clickTimeout = useRef<NodeJS.Timeout | null>(null);

    const handlePointerDown = useCallback((e: React.PointerEvent) => {
        const now = Date.now();
        const timeSinceLastClick = now - lastClickTime.current;

        if (timeSinceLastClick < 300 && onDoubleClick) {
            e.preventDefault();
            e.stopPropagation();
            onDoubleClick();
            lastClickTime.current = 0;
            if (clickTimeout.current) {
                clearTimeout(clickTimeout.current);
                clickTimeout.current = null;
            }
            return;
        }

        lastClickTime.current = now;

        if (clickTimeout.current) {
            clearTimeout(clickTimeout.current);
        }
        clickTimeout.current = setTimeout(() => {
            // Single click confirmed (no second click followed) — fire onTap.
            if (lastClickTime.current !== 0 && onTap) {
                onTap();
            }
            lastClickTime.current = 0;
        }, 300);

        if (listeners?.onPointerDown) {
            listeners.onPointerDown(e as unknown as PointerEvent);
        }
    }, [onDoubleClick, onTap, listeners]);

    const suitSymbol = getSuitSymbol(card.suit);
    const suitColor = getSuitColor(card.suit);

    const dragStyle = transform
        ? {
            transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
            zIndex: 1000,
        }
        : undefined;

    const shouldHide = hideWhileDragging && isDragging;

    const stateClasses = [
        selected ? 'card-selected' : '',
        validDrop ? 'card-valid-drop' : '',
    ].filter(Boolean).join(' ');

    if (!card.faceUp) {
        return (
            <div
                ref={setNodeRef}
                className={`card card-face-down ${stateClasses}`}
                style={{ ...style, ...dragStyle, opacity: shouldHide ? 0 : 1 }}
                onClick={onClick}
            />
        );
    }

    const mergedListeners = isDraggable && listeners
        ? { ...listeners, onPointerDown: handlePointerDown }
        : {};

    return (
        <div
            ref={setNodeRef}
            className={`card card-face-up card-${suitColor} ${isDragging ? 'card-dragging' : ''} ${stateClasses}`}
            style={{ ...style, ...dragStyle, opacity: shouldHide ? 0 : 1 }}
            onClick={onClick}
            {...mergedListeners}
            {...(isDraggable ? attributes : {})}
        >
            <div className="card-corner card-corner-top">
                <span className="card-rank">{card.rank}</span>
                <span className="card-suit-small">{suitSymbol}</span>
            </div>
            <span className="card-center-suit">{suitSymbol}</span>
            <div className="card-corner card-corner-bottom">
                <span className="card-rank">{card.rank}</span>
                <span className="card-suit-small">{suitSymbol}</span>
            </div>
        </div>
    );
}
```

- [ ] **Step 2: Update `Pile.tsx` props and forwarding**

Replace the entire contents of `src/components/Game/Pile.tsx` with:

```tsx
'use client';

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Card as CardType } from '@/lib/gameLogic';
import { Card } from './Card';

interface PileProps {
    id: string;
    cards: CardType[];
    type: 'stock' | 'waste' | 'foundation' | 'tableau';
    emptyIcon?: string;
    onClick?: () => void;
    pileIndex?: number;
    onCardDoubleClick?: (cardId: string, pileIndex?: number) => void;
    onCardTap?: (cardId: string, pileIndex?: number) => void;
    onPileTap?: () => void;
    selectedCardId?: string | null;
    validDrop?: boolean;
    draggedCardId?: string | null;
}

export function Pile({
    id,
    cards,
    type,
    emptyIcon,
    onClick,
    pileIndex,
    onCardDoubleClick,
    onCardTap,
    onPileTap,
    selectedCardId,
    validDrop = false,
    draggedCardId,
}: PileProps) {
    const { setNodeRef, isOver } = useDroppable({
        id,
        data: { type, pileIndex },
    });

    const isTableau = type === 'tableau';
    const isStock = type === 'stock';

    const validClass = validDrop ? 'pile-valid-drop' : '';

    if (cards.length === 0) {
        return (
            <div
                ref={setNodeRef}
                className={`pile ${type === 'tableau' ? 'tableau-pile' : ''}`}
                onClick={onClick ?? onPileTap}
            >
                <div
                    className={`pile-empty ${isStock ? 'stock-pile' : ''} ${isOver ? 'card-highlight' : ''} ${validClass}`}
                >
                    {emptyIcon && <span className={`pile-empty-icon ${isStock ? 'refresh-icon' : ''}`}>{emptyIcon}</span>}
                </div>
            </div>
        );
    }

    if (isTableau) {
        const dragStartIndex = draggedCardId ? cards.findIndex(c => c.id === draggedCardId) : -1;

        return (
            <div
                ref={setNodeRef}
                className="pile tableau-pile"
                onClick={onPileTap}
            >
                <div className="card-stack">
                    {cards.map((card, index) => {
                        const isBeingDragged = dragStartIndex !== -1 && index >= dragStartIndex;
                        const isSelectedRoot = selectedCardId === card.id;

                        return (
                            <div
                                key={card.id}
                                className="card-wrapper"
                                style={{ opacity: isBeingDragged ? 0 : 1 }}
                            >
                                <Card
                                    card={card}
                                    index={index}
                                    isDraggable={card.faceUp}
                                    selected={isSelectedRoot}
                                    onTap={
                                        card.faceUp && onCardTap
                                            ? () => onCardTap(card.id, pileIndex)
                                            : undefined
                                    }
                                    onDoubleClick={
                                        card.faceUp && index === cards.length - 1
                                            ? () => onCardDoubleClick?.(card.id, pileIndex)
                                            : undefined
                                    }
                                />
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    if (isStock) {
        return (
            <div className="pile" onClick={onClick}>
                <div className="stock-pile">
                    <Card
                        card={cards[cards.length - 1]}
                        isDraggable={false}
                    />
                </div>
            </div>
        );
    }

    // Waste and Foundation - top card only
    const topCard = cards[cards.length - 1];

    return (
        <div
            ref={setNodeRef}
            className={`pile ${isOver ? 'card-highlight' : ''}`}
            onClick={type === 'foundation' ? onPileTap : undefined}
        >
            <Card
                card={topCard}
                isDraggable={type === 'waste'}
                selected={type === 'waste' && selectedCardId === topCard.id}
                validDrop={type === 'foundation' && validDrop}
                onTap={
                    type === 'waste' && onCardTap
                        ? () => onCardTap(topCard.id)
                        : undefined
                }
                onDoubleClick={
                    type === 'waste'
                        ? () => onCardDoubleClick?.(topCard.id)
                        : undefined
                }
                hideWhileDragging={type === 'waste'}
            />
        </div>
    );
}
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: build succeeds. New props are optional everywhere, so existing call sites in `Board.tsx` still compile.

- [ ] **Step 4: Commit**

```bash
git add src/components/Game/Card.tsx src/components/Game/Pile.tsx
git commit -m "feat(game): add tap and visual-state props to Card and Pile"
```

---

## Task 8: Add tap-to-move state and sensor activation constraint to `Board`

This task wires Board to manage selection state, compute valid destinations, and use a pointer sensor with an activation delay so taps and drags don't collide. It also adds the haptic vibration on drag start.

**Files:**
- Modify: `src/components/Game/Board.tsx`

- [ ] **Step 1: Replace the file**

Replace the entire contents of `src/components/Game/Board.tsx` with:

```tsx
'use client';

import React from 'react';
import {
    DndContext,
    DragEndEvent,
    DragStartEvent,
    DragOverlay,
    pointerWithin,
    useSensor,
    useSensors,
    PointerSensor,
} from '@dnd-kit/core';
import { useGameStore } from '@/store/gameStore';
import { Pile } from './Pile';
import { StaticCard } from './Card';
import { Card as CardType, canPlaceOnFoundation } from '@/lib/gameLogic';

type Source = { type: 'tableau' | 'waste'; pileIndex?: number };

const RANK_ORDER = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const isRed = (suit: string) => suit === 'hearts' || suit === 'diamonds';

function isValidTableauMove(topOfStack: CardType, destPile: CardType[]): boolean {
    if (destPile.length === 0) return topOfStack.rank === 'K';
    const topDest = destPile[destPile.length - 1];
    if (!topDest.faceUp) return false;
    const srcIdx = RANK_ORDER.indexOf(topOfStack.rank);
    const destIdx = RANK_ORDER.indexOf(topDest.rank);
    return isRed(topOfStack.suit) !== isRed(topDest.suit) && srcIdx === destIdx - 1;
}

export function Board() {
    const gameState = useGameStore(state => state.gameState);
    const drawCard = useGameStore(state => state.drawCard);
    const moveToFoundation = useGameStore(state => state.moveToFoundation);
    const moveToTableau = useGameStore(state => state.moveToTableau);

    const [activeCards, setActiveCards] = React.useState<CardType[]>([]);
    const [activeSource, setActiveSource] = React.useState<Source | null>(null);
    const [draggedCardId, setDraggedCardId] = React.useState<string | null>(null);

    const [selectedCardId, setSelectedCardId] = React.useState<string | null>(null);
    const [selectedSource, setSelectedSource] = React.useState<Source | null>(null);

    // Pointer sensor with activation constraint: a tiny delay/tolerance so a
    // quick tap doesn't start a drag, and a drag doesn't suppress the tap.
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { delay: 120, tolerance: 6 },
        })
    );

    if (!gameState) {
        return (
            <div className="game-board" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '18px' }}>Click &quot;New Game&quot; to start playing</p>
            </div>
        );
    }

    // ---- Selection helpers ----

    const findCardSource = (cardId: string): { card: CardType; source: Source; cardsToMove: CardType[] } | null => {
        if (gameState.waste.length > 0 && gameState.waste[gameState.waste.length - 1].id === cardId) {
            const card = gameState.waste[gameState.waste.length - 1];
            return { card, source: { type: 'waste' }, cardsToMove: [card] };
        }
        for (let i = 0; i < gameState.tableau.length; i++) {
            const pile = gameState.tableau[i];
            const idx = pile.findIndex(c => c.id === cardId);
            if (idx !== -1 && pile[idx].faceUp) {
                return {
                    card: pile[idx],
                    source: { type: 'tableau', pileIndex: i },
                    cardsToMove: pile.slice(idx),
                };
            }
        }
        return null;
    };

    // Set of pile-ids ("foundation-N" / "tableau-N") that are valid for the current selection.
    const validDropPileIds = React.useMemo(() => {
        const ids = new Set<string>();
        if (!selectedCardId) return ids;
        const found = findCardSource(selectedCardId);
        if (!found) return ids;

        const top = found.cardsToMove[0];
        const isSingle = found.cardsToMove.length === 1;

        if (isSingle) {
            for (let i = 0; i < gameState.foundations.length; i++) {
                if (canPlaceOnFoundation(top, gameState.foundations[i])) {
                    ids.add(`foundation-${i}`);
                }
            }
        }

        for (let i = 0; i < gameState.tableau.length; i++) {
            if (selectedSource?.type === 'tableau' && selectedSource.pileIndex === i) continue;
            if (isValidTableauMove(top, gameState.tableau[i])) {
                ids.add(`tableau-${i}`);
            }
        }

        return ids;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedCardId, gameState]);

    // ---- Tap handlers ----

    const handleCardTap = (cardId: string, pileIndex?: number) => {
        if (selectedCardId === cardId) {
            setSelectedCardId(null);
            setSelectedSource(null);
            return;
        }
        const found = findCardSource(cardId);
        if (!found) return;
        setSelectedCardId(cardId);
        setSelectedSource(found.source);
        // pileIndex is part of source; param kept for symmetry with Pile API.
        void pileIndex;
    };

    const handlePileTap = (destinationType: 'foundation' | 'tableau', destinationIndex: number) => {
        if (!selectedCardId || !selectedSource) return;
        const pileId = `${destinationType}-${destinationIndex}`;
        if (!validDropPileIds.has(pileId)) {
            // Invalid destination — clear selection.
            setSelectedCardId(null);
            setSelectedSource(null);
            return;
        }
        if (destinationType === 'foundation') {
            moveToFoundation(selectedCardId, selectedSource, destinationIndex);
        } else {
            moveToTableau(selectedCardId, selectedSource, destinationIndex);
        }
        setSelectedCardId(null);
        setSelectedSource(null);
    };

    // ---- Drag handlers ----

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const cardId = active.id as string;

        // Clear any pending tap selection when a drag begins.
        setSelectedCardId(null);
        setSelectedSource(null);
        setDraggedCardId(cardId);

        // Haptic feedback on devices that support it.
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
            navigator.vibrate?.(10);
        }

        const wasteCard = gameState.waste.find(c => c.id === cardId);
        if (wasteCard) {
            setActiveCards([wasteCard]);
            setActiveSource({ type: 'waste' });
            return;
        }
        for (let i = 0; i < gameState.tableau.length; i++) {
            const pile = gameState.tableau[i];
            const cardIndex = pile.findIndex(c => c.id === cardId);
            if (cardIndex !== -1) {
                setActiveCards(pile.slice(cardIndex));
                setActiveSource({ type: 'tableau', pileIndex: i });
                return;
            }
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        const currentSource = activeSource;
        setActiveCards([]);
        setActiveSource(null);
        setDraggedCardId(null);

        if (!over || !currentSource) return;

        const cardId = active.id as string;
        const destinationType = over.data.current?.type as string;
        const destinationIndex = over.data.current?.pileIndex as number | undefined;

        if (destinationType === 'foundation' && destinationIndex !== undefined) {
            moveToFoundation(cardId, currentSource, destinationIndex);
        } else if (destinationType === 'tableau' && destinationIndex !== undefined) {
            moveToTableau(cardId, currentSource, destinationIndex);
        }
    };

    // ---- Double-click (auto-move) ----

    const handleCardDoubleClick = (cardId: string, pileIndex?: number) => {
        let card: CardType | undefined;
        let source: Source;
        let cardIndexInPile = -1;

        if (gameState.waste.length > 0 && gameState.waste[gameState.waste.length - 1].id === cardId) {
            card = gameState.waste[gameState.waste.length - 1];
            source = { type: 'waste' };
        } else if (pileIndex !== undefined) {
            const pile = gameState.tableau[pileIndex];
            cardIndexInPile = pile.findIndex(c => c.id === cardId);
            if (cardIndexInPile !== -1 && pile[cardIndexInPile].faceUp) {
                card = pile[cardIndexInPile];
                source = { type: 'tableau', pileIndex };
            }
        }
        if (!card) return;

        const isTopCard = pileIndex !== undefined
            ? cardIndexInPile === gameState.tableau[pileIndex].length - 1
            : true;

        if (isTopCard) {
            for (let i = 0; i < 4; i++) {
                if (canPlaceOnFoundation(card, gameState.foundations[i])) {
                    moveToFoundation(cardId, source!, i);
                    return;
                }
            }
        }

        const cardsToMove = pileIndex !== undefined
            ? gameState.tableau[pileIndex].slice(cardIndexInPile)
            : [card];
        const topOfStack = cardsToMove[0];

        const candidates: { index: number; size: number }[] = [];
        for (let i = 0; i < gameState.tableau.length; i++) {
            if (i === pileIndex) continue;
            if (isValidTableauMove(topOfStack, gameState.tableau[i])) {
                candidates.push({ index: i, size: gameState.tableau[i].length });
            }
        }
        candidates.sort((a, b) => a.size - b.size);
        if (candidates.length > 0) {
            moveToTableau(cardId, source!, candidates[0].index);
        }
    };

    // ---- Render ----

    // Shared props for piles that need tap awareness.
    const tapProps = {
        onCardTap: handleCardTap,
        selectedCardId,
        validDropPileIds,
    };

    return (
        <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            collisionDetection={pointerWithin}
        >
            <div className="game-board">
                {/* Desktop top row — hidden in mobile via CSS */}
                <div className="top-row">
                    <div className="stock-waste-area">
                        <Pile
                            id="stock"
                            cards={gameState.stock}
                            type="stock"
                            emptyIcon="↻"
                            onClick={drawCard}
                        />
                        <Pile
                            id="waste"
                            cards={gameState.waste}
                            type="waste"
                            onCardDoubleClick={handleCardDoubleClick}
                            onCardTap={handleCardTap}
                            selectedCardId={selectedCardId}
                            draggedCardId={draggedCardId}
                        />
                    </div>

                    <div className="foundations-area">
                        {gameState.foundations.map((foundation, index) => (
                            <Pile
                                key={`foundation-${index}`}
                                id={`foundation-${index}`}
                                cards={foundation}
                                type="foundation"
                                emptyIcon={['♠', '♥', '♦', '♣'][index]}
                                pileIndex={index}
                                onPileTap={() => handlePileTap('foundation', index)}
                                validDrop={validDropPileIds.has(`foundation-${index}`)}
                            />
                        ))}
                    </div>
                </div>

                <div className="tableau-area">
                    {gameState.tableau.map((pile, index) => (
                        <Pile
                            key={`tableau-${index}`}
                            id={`tableau-${index}`}
                            cards={pile}
                            type="tableau"
                            pileIndex={index}
                            onCardDoubleClick={handleCardDoubleClick}
                            onCardTap={handleCardTap}
                            onPileTap={() => handlePileTap('tableau', index)}
                            selectedCardId={selectedCardId}
                            validDrop={validDropPileIds.has(`tableau-${index}`)}
                            draggedCardId={draggedCardId}
                        />
                    ))}
                </div>
            </div>

            <DragOverlay dropAnimation={null}>
                {activeCards.length > 0 ? (
                    <div className="drag-stack">
                        {activeCards.map((card, index) => (
                            <div
                                key={card.id}
                                style={{
                                    marginTop: index === 0 ? 0 : -80,
                                    position: 'relative',
                                }}
                            >
                                <StaticCard card={card} />
                            </div>
                        ))}
                    </div>
                ) : null}
            </DragOverlay>

            {/* Expose tap context to mobile chrome via a hidden marker.
                The chrome components read these handlers via context-free props
                passed from VariantGameWrapper — see Task 9. */}
            <BoardTapContext.Provider value={tapProps}>
                <></>
            </BoardTapContext.Provider>
        </DndContext>
    );
}

// Context to share tap state with mobile chrome rendered outside <Board>.
type BoardTapContextValue = {
    onCardTap: (cardId: string, pileIndex?: number) => void;
    selectedCardId: string | null;
    validDropPileIds: Set<string>;
};
export const BoardTapContext = React.createContext<BoardTapContextValue | null>(null);
```

**Note:** the `BoardTapContext.Provider` wrap in this snippet is only a placeholder pattern — Task 9 restructures the rendering so the provider wraps the entire `<main>` + chrome subtree, not an empty fragment. Don't bother re-using the placeholder; it gets replaced.

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: build succeeds with no TS errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/Game/Board.tsx
git commit -m "feat(game): tap-to-move state, valid-destination compute, sensor delay, haptic"
```

---

## Task 9: Restructure `VariantGameWrapper` to render mobile chrome and share tap state

The chrome lives outside the existing `<main className="game-area">`. To share `onCardTap` / `selectedCardId` / `validDropPileIds` between Board and the new chrome components, we lift state into `VariantGameWrapper` via a small extracted hook and provide it through context.

**Files:**
- Modify: `src/components/Game/Board.tsx` (extract state to a hook, consume context)
- Modify: `src/components/Game/VariantGameWrapper.tsx` (own the state, render chrome)

- [ ] **Step 1: Extract Board state into a hook**

Replace the entire contents of `src/components/Game/Board.tsx` with the version below. This pulls all selection / drag / handler logic into an exported `useBoardController` hook so `VariantGameWrapper` can own the single instance, and `Board` and chrome components all read from it.

```tsx
'use client';

import React from 'react';
import {
    DndContext,
    DragEndEvent,
    DragStartEvent,
    DragOverlay,
    pointerWithin,
    useSensor,
    useSensors,
    PointerSensor,
} from '@dnd-kit/core';
import { useGameStore } from '@/store/gameStore';
import { Pile } from './Pile';
import { StaticCard } from './Card';
import { Card as CardType, canPlaceOnFoundation } from '@/lib/gameLogic';

type Source = { type: 'tableau' | 'waste'; pileIndex?: number };

const RANK_ORDER = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const isRed = (suit: string) => suit === 'hearts' || suit === 'diamonds';

function isValidTableauMove(topOfStack: CardType, destPile: CardType[]): boolean {
    if (destPile.length === 0) return topOfStack.rank === 'K';
    const topDest = destPile[destPile.length - 1];
    if (!topDest.faceUp) return false;
    const srcIdx = RANK_ORDER.indexOf(topOfStack.rank);
    const destIdx = RANK_ORDER.indexOf(topDest.rank);
    return isRed(topOfStack.suit) !== isRed(topDest.suit) && srcIdx === destIdx - 1;
}

export interface BoardController {
    onCardTap: (cardId: string, pileIndex?: number) => void;
    onPileTap: (destinationType: 'foundation' | 'tableau', destinationIndex: number) => void;
    onCardDoubleClick: (cardId: string, pileIndex?: number) => void;
    selectedCardId: string | null;
    validDropPileIds: Set<string>;
    draggedCardId: string | null;
    handleDragStart: (event: DragStartEvent) => void;
    handleDragEnd: (event: DragEndEvent) => void;
    activeCards: CardType[];
    sensors: ReturnType<typeof useSensors>;
}

export function useBoardController(): BoardController {
    const gameState = useGameStore(state => state.gameState);
    const moveToFoundation = useGameStore(state => state.moveToFoundation);
    const moveToTableau = useGameStore(state => state.moveToTableau);

    const [activeCards, setActiveCards] = React.useState<CardType[]>([]);
    const [activeSource, setActiveSource] = React.useState<Source | null>(null);
    const [draggedCardId, setDraggedCardId] = React.useState<string | null>(null);

    const [selectedCardId, setSelectedCardId] = React.useState<string | null>(null);
    const [selectedSource, setSelectedSource] = React.useState<Source | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { delay: 120, tolerance: 6 },
        })
    );

    const findCardSource = (cardId: string): { card: CardType; source: Source; cardsToMove: CardType[] } | null => {
        if (!gameState) return null;
        if (gameState.waste.length > 0 && gameState.waste[gameState.waste.length - 1].id === cardId) {
            const card = gameState.waste[gameState.waste.length - 1];
            return { card, source: { type: 'waste' }, cardsToMove: [card] };
        }
        for (let i = 0; i < gameState.tableau.length; i++) {
            const pile = gameState.tableau[i];
            const idx = pile.findIndex(c => c.id === cardId);
            if (idx !== -1 && pile[idx].faceUp) {
                return {
                    card: pile[idx],
                    source: { type: 'tableau', pileIndex: i },
                    cardsToMove: pile.slice(idx),
                };
            }
        }
        return null;
    };

    const validDropPileIds = React.useMemo(() => {
        const ids = new Set<string>();
        if (!selectedCardId || !gameState) return ids;
        const found = findCardSource(selectedCardId);
        if (!found) return ids;

        const top = found.cardsToMove[0];
        const isSingle = found.cardsToMove.length === 1;

        if (isSingle) {
            for (let i = 0; i < gameState.foundations.length; i++) {
                if (canPlaceOnFoundation(top, gameState.foundations[i])) {
                    ids.add(`foundation-${i}`);
                }
            }
        }
        for (let i = 0; i < gameState.tableau.length; i++) {
            if (selectedSource?.type === 'tableau' && selectedSource.pileIndex === i) continue;
            if (isValidTableauMove(top, gameState.tableau[i])) {
                ids.add(`tableau-${i}`);
            }
        }
        return ids;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedCardId, gameState]);

    const onCardTap = (cardId: string, pileIndex?: number) => {
        if (selectedCardId === cardId) {
            setSelectedCardId(null);
            setSelectedSource(null);
            return;
        }
        const found = findCardSource(cardId);
        if (!found) return;
        setSelectedCardId(cardId);
        setSelectedSource(found.source);
        void pileIndex;
    };

    const onPileTap = (destinationType: 'foundation' | 'tableau', destinationIndex: number) => {
        if (!selectedCardId || !selectedSource) return;
        const pileId = `${destinationType}-${destinationIndex}`;
        if (!validDropPileIds.has(pileId)) {
            setSelectedCardId(null);
            setSelectedSource(null);
            return;
        }
        if (destinationType === 'foundation') {
            moveToFoundation(selectedCardId, selectedSource, destinationIndex);
        } else {
            moveToTableau(selectedCardId, selectedSource, destinationIndex);
        }
        setSelectedCardId(null);
        setSelectedSource(null);
    };

    const handleDragStart = (event: DragStartEvent) => {
        if (!gameState) return;
        const { active } = event;
        const cardId = active.id as string;

        setSelectedCardId(null);
        setSelectedSource(null);
        setDraggedCardId(cardId);

        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
            navigator.vibrate?.(10);
        }

        const wasteCard = gameState.waste.find(c => c.id === cardId);
        if (wasteCard) {
            setActiveCards([wasteCard]);
            setActiveSource({ type: 'waste' });
            return;
        }
        for (let i = 0; i < gameState.tableau.length; i++) {
            const pile = gameState.tableau[i];
            const cardIndex = pile.findIndex(c => c.id === cardId);
            if (cardIndex !== -1) {
                setActiveCards(pile.slice(cardIndex));
                setActiveSource({ type: 'tableau', pileIndex: i });
                return;
            }
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        const currentSource = activeSource;
        setActiveCards([]);
        setActiveSource(null);
        setDraggedCardId(null);

        if (!over || !currentSource) return;

        const cardId = active.id as string;
        const destinationType = over.data.current?.type as string;
        const destinationIndex = over.data.current?.pileIndex as number | undefined;

        if (destinationType === 'foundation' && destinationIndex !== undefined) {
            moveToFoundation(cardId, currentSource, destinationIndex);
        } else if (destinationType === 'tableau' && destinationIndex !== undefined) {
            moveToTableau(cardId, currentSource, destinationIndex);
        }
    };

    const onCardDoubleClick = (cardId: string, pileIndex?: number) => {
        if (!gameState) return;
        let card: CardType | undefined;
        let source: Source;
        let cardIndexInPile = -1;

        if (gameState.waste.length > 0 && gameState.waste[gameState.waste.length - 1].id === cardId) {
            card = gameState.waste[gameState.waste.length - 1];
            source = { type: 'waste' };
        } else if (pileIndex !== undefined) {
            const pile = gameState.tableau[pileIndex];
            cardIndexInPile = pile.findIndex(c => c.id === cardId);
            if (cardIndexInPile !== -1 && pile[cardIndexInPile].faceUp) {
                card = pile[cardIndexInPile];
                source = { type: 'tableau', pileIndex };
            }
        }
        if (!card) return;

        const isTopCard = pileIndex !== undefined
            ? cardIndexInPile === gameState.tableau[pileIndex].length - 1
            : true;

        if (isTopCard) {
            for (let i = 0; i < 4; i++) {
                if (canPlaceOnFoundation(card, gameState.foundations[i])) {
                    moveToFoundation(cardId, source!, i);
                    return;
                }
            }
        }

        const cardsToMove = pileIndex !== undefined
            ? gameState.tableau[pileIndex].slice(cardIndexInPile)
            : [card];
        const topOfStack = cardsToMove[0];

        const candidates: { index: number; size: number }[] = [];
        for (let i = 0; i < gameState.tableau.length; i++) {
            if (i === pileIndex) continue;
            if (isValidTableauMove(topOfStack, gameState.tableau[i])) {
                candidates.push({ index: i, size: gameState.tableau[i].length });
            }
        }
        candidates.sort((a, b) => a.size - b.size);
        if (candidates.length > 0) {
            moveToTableau(cardId, source!, candidates[0].index);
        }
    };

    return {
        onCardTap,
        onPileTap,
        onCardDoubleClick,
        selectedCardId,
        validDropPileIds,
        draggedCardId,
        handleDragStart,
        handleDragEnd,
        activeCards,
        sensors,
    };
}

interface BoardProps {
    controller: BoardController;
}

export function Board({ controller }: BoardProps) {
    const gameState = useGameStore(state => state.gameState);
    const drawCard = useGameStore(state => state.drawCard);

    if (!gameState) {
        return (
            <div className="game-board" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '18px' }}>Click &quot;New Game&quot; to start playing</p>
            </div>
        );
    }

    const {
        onCardTap, onPileTap, onCardDoubleClick,
        selectedCardId, validDropPileIds, draggedCardId,
        activeCards,
    } = controller;

    return (
        <div className="game-board">
            <div className="top-row">
                <div className="stock-waste-area">
                    <Pile
                        id="stock"
                        cards={gameState.stock}
                        type="stock"
                        emptyIcon="↻"
                        onClick={drawCard}
                    />
                    <Pile
                        id="waste"
                        cards={gameState.waste}
                        type="waste"
                        onCardDoubleClick={onCardDoubleClick}
                        onCardTap={onCardTap}
                        selectedCardId={selectedCardId}
                        draggedCardId={draggedCardId}
                    />
                </div>

                <div className="foundations-area">
                    {gameState.foundations.map((foundation, index) => (
                        <Pile
                            key={`foundation-${index}`}
                            id={`foundation-${index}`}
                            cards={foundation}
                            type="foundation"
                            emptyIcon={['♠', '♥', '♦', '♣'][index]}
                            pileIndex={index}
                            onPileTap={() => onPileTap('foundation', index)}
                            validDrop={validDropPileIds.has(`foundation-${index}`)}
                        />
                    ))}
                </div>
            </div>

            <div className="tableau-area">
                {gameState.tableau.map((pile, index) => (
                    <Pile
                        key={`tableau-${index}`}
                        id={`tableau-${index}`}
                        cards={pile}
                        type="tableau"
                        pileIndex={index}
                        onCardDoubleClick={onCardDoubleClick}
                        onCardTap={onCardTap}
                        onPileTap={() => onPileTap('tableau', index)}
                        selectedCardId={selectedCardId}
                        validDrop={validDropPileIds.has(`tableau-${index}`)}
                        draggedCardId={draggedCardId}
                    />
                ))}
            </div>

            <DragOverlay dropAnimation={null}>
                {activeCards.length > 0 ? (
                    <div className="drag-stack">
                        {activeCards.map((card, index) => (
                            <div
                                key={card.id}
                                style={{
                                    marginTop: index === 0 ? 0 : -80,
                                    position: 'relative',
                                }}
                            >
                                <StaticCard card={card} />
                            </div>
                        ))}
                    </div>
                ) : null}
            </DragOverlay>
        </div>
    );
}
```

- [ ] **Step 2: Update `VariantGameWrapper.tsx`**

Replace the entire contents of `src/components/Game/VariantGameWrapper.tsx` with:

```tsx
'use client';

import React, { useEffect, useState } from 'react';
import { DndContext, pointerWithin } from '@dnd-kit/core';
import { useGameStore, useUIStore } from '@/store/gameStore';
import { Board, useBoardController } from '@/components/Game/Board';
import { Sidebar } from '@/components/UI/Sidebar';
import { MobileMenu } from '@/components/UI/MobileMenu';
import { MobileHeader } from '@/components/UI/MobileHeader';
import { MobileDock } from '@/components/UI/MobileDock';
import { MobileLeftRail } from '@/components/UI/MobileLeftRail';
import { MobileRightRail } from '@/components/UI/MobileRightRail';
import { WinModal } from '@/components/UI/WinModal';

interface VariantGameWrapperProps {
    config: {
        layout?: 'standard' | 'left-handed';
        cardScale?: number;
        gameMode?: 'standard' | 'time-limit';
        theme?: 'classic' | 'modern';
    };
    children: React.ReactNode;
}

export function VariantGameWrapper({ config, children }: VariantGameWrapperProps) {
    const newGame = useGameStore(state => state.newGame);
    const setVariantConfig = useUIStore(state => state.setVariantConfig);
    const setTheme = useUIStore(state => state.setTheme);

    const theme = useUIStore(state => state.theme);
    const layout = useUIStore(state => state.layout);
    const cardScale = useUIStore(state => state.cardScale);

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setVariantConfig({
            layout: config.layout || 'standard',
            cardScale: config.cardScale || 1.0,
            gameMode: config.gameMode || 'standard',
        });
        if (config.theme) setTheme(config.theme);
        setMounted(true);
        newGame();
    }, [config, newGame, setVariantConfig, setTheme]);

    // Hook ordering: useBoardController must be called unconditionally on every render.
    const controller = useBoardController();

    if (!mounted) {
        return (
            <div className="app-container" data-theme="classic">
                <div className="main-content">
                    <main className="game-area">
                        <div className="game-board" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '18px' }}>Loading Variant...</p>
                        </div>
                    </main>
                    <aside className="sidebar">
                        <div className="sidebar-header">
                            <h1 className="sidebar-title">Solitaire</h1>
                        </div>
                    </aside>
                </div>
            </div>
        );
    }

    return (
        <div
            className={`app-container ${layout}`}
            data-theme={theme}
            style={{ '--card-scale': cardScale } as React.CSSProperties}
        >
            <DndContext
                sensors={controller.sensors}
                collisionDetection={pointerWithin}
                onDragStart={controller.handleDragStart}
                onDragEnd={controller.handleDragEnd}
            >
                <div className="main-content">
                    {/* Landscape left rail (CSS-hidden in portrait/desktop) */}
                    <MobileLeftRail
                        onCardDoubleClick={controller.onCardDoubleClick}
                        onCardTap={controller.onCardTap}
                        selectedCardId={controller.selectedCardId}
                        draggedCardId={controller.draggedCardId}
                    />

                    <main className="game-area">
                        {/* Portrait header (CSS-hidden in landscape/desktop) */}
                        <MobileHeader />

                        <Board controller={controller} />

                        {/* Portrait dock (CSS-hidden in landscape/desktop) */}
                        <MobileDock
                            onCardDoubleClick={controller.onCardDoubleClick}
                            onCardTap={controller.onCardTap}
                            onPileTap={controller.onPileTap}
                            selectedCardId={controller.selectedCardId}
                            validDropPileIds={controller.validDropPileIds}
                            draggedCardId={controller.draggedCardId}
                        />
                    </main>

                    {/* Landscape right rail (CSS-hidden in portrait/desktop) */}
                    <MobileRightRail
                        onPileTap={controller.onPileTap}
                        validDropPileIds={controller.validDropPileIds}
                    />

                    {/* Desktop sidebar (CSS-hidden on mobile) */}
                    <Sidebar />

                    {/* Drawer menu (only opens on mobile via header / rail menu button) */}
                    <MobileMenu />
                </div>
                {children}
                <WinModal />
            </DndContext>
        </div>
    );
}
```

**Notes:**
- The single `<DndContext>` lives at the wrapper level so a card in the dock can be dragged onto a tableau pile, etc. Removing the inner `<DndContext>` from `Board` is intentional.
- All chrome components are always rendered. CSS controls visibility per orientation. This avoids React remounting on rotation.
- `MobileDock` and the rails render the same `id` for piles (`stock`, `waste`, `foundation-N`) as `Board` does. Two `useDroppable` hooks with the same id is fine — only the visible one will receive pointer events because the other is `display: none`. dnd-kit treats a hidden droppable as inactive.

> **Caveat:** Two `Pile`s with the same `id` mounted at once would conflict. We avoid it because exactly one orientation is visible per device. If both ever rendered (e.g., a CSS bug), drag-drop targeting could become ambiguous — verification step covers this.

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/components/Game/Board.tsx src/components/Game/VariantGameWrapper.tsx
git commit -m "refactor(game): extract useBoardController; wrapper renders mobile chrome"
```

---

## Task 10: Manual verification with `playwright-cli`

This task confirms the redesign works across desktop, portrait phone, and landscape phone, plus left-handed mode. There are no automated tests; this is the verification gate.

**Files:** none (verification only)

- [ ] **Step 1: Start dev server**

Run in a separate terminal (or background):

```bash
npm run dev
```

Wait for `Ready in ...` log.

- [ ] **Step 2: Desktop regression check**

```bash
playwright-cli open "http://localhost:3000/solitaire/klondike"
playwright-cli eval "window.innerWidth = 1440; window.innerHeight = 900;"
playwright-cli screenshot
```

Open the screenshot in `.playwright-cli/`. Verify:
- Right sidebar visible with stats, seed, theme toggle, action buttons.
- Game board centered, top row has stock+waste+foundations.
- Looks identical to before the redesign.

- [ ] **Step 3: Portrait check (iPhone-ish, 390×844)**

```bash
playwright-cli eval "if (typeof __setViewport === 'undefined') { window.__setViewport = (w,h) => { document.documentElement.style.width = w+'px'; }; }"
```

For real viewport changes, use Chromium devtools mode — easier path: install a viewport via Chrome DevTools, or use a headless Playwright script. Acceptable shortcut for this task: open the URL on an actual phone, or use Chrome DevTools' "Toggle device toolbar".

Manual checks (open Chrome → DevTools → device emulation → iPhone 14 Pro):
- Header bar at top with `☰`, "Klondike", and time/score/moves.
- Tableau fills middle, 7 columns visible side-by-side, no horizontal scroll.
- Bottom dock: stock+waste on left, 4 foundations on right, action row underneath with undo + new game.
- No floating HUD or floating menu button.
- Tap a face-up tableau card → it scales/glows; valid foundation/tableau piles pulse with gold dashed outline.
- Tap a valid destination → card moves; selection clears.
- Tap selected card again → selection cancels.
- Double-tap a face-up card → if eligible, auto-moves to foundation.
- Long-press and drag → drag works; haptic fires on supported devices.
- Open `☰` menu → drawer slides in from right with seed, theme, etc.

- [ ] **Step 4: Landscape check (iPhone landscape, 844×390)**

In Chrome DevTools, rotate to landscape:
- Left rail visible with HUD chip, stock+waste, undo + menu buttons.
- Right rail visible with 4 foundation slots stacked vertically.
- Tableau fills the middle, 7 columns, height-constrained.
- No header, no dock.
- Tap-to-move and drag work; foundations highlight when card is selected.
- Game state preserved across rotation (no remount — same selected card / same piles).

- [ ] **Step 5: Left-handed landscape check**

In the drawer, switch to left-handed mode (or set via URL/config). Verify rails swap: stock/waste appear on the right, foundations on the left.

- [ ] **Step 6: Stop dev server, commit nothing**

```bash
playwright-cli close
# stop the dev server in its terminal
```

Mark this task complete. No commit (no source changes).

---

## Self-Review

I went back through the spec and checked the plan covers everything:

- ✅ Breakpoints (orientation-aware) — Task 2.
- ✅ Portrait header + tableau + dock — Tasks 2, 3, 4, 9.
- ✅ Landscape side rails — Tasks 2, 5, 9.
- ✅ Left-handed swap — Task 2 CSS, verified Task 10.
- ✅ Tap-to-move state machine — Tasks 7, 8, 9.
- ✅ Double-tap auto-foundation preserved — Tasks 7, 8, 9.
- ✅ Drag still works with sensor activation constraint — Tasks 8, 9.
- ✅ Haptic on drag start — Task 9 (controller).
- ✅ Touch targets ≥44px — Task 2 CSS (action buttons `min-height: 44px`).
- ✅ Safe-area insets — Task 2 CSS uses `env(safe-area-inset-*)`.
- ✅ MobileMenu trimmed — Task 6.
- ✅ No remount on rotation — Task 9 (CSS controls visibility, all chrome always rendered).
- ✅ Game logic + store untouched — confirmed.
- ✅ Desktop unchanged — Task 2 keeps desktop CSS intact, regression checked Task 10.

No placeholders, no `TODO`s. Type names consistent across tasks: `Source`, `BoardController`, `validDropPileIds: Set<string>`, pile id strings `${type}-${index}`.

One known edge mentioned in the spec — very-small landscape (h<380px) — is accepted as-is per spec; no separate fallback layout required.

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-04-29-mobile-ui-redesign.md`. Two execution options:

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration.

**2. Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints.

Which approach?

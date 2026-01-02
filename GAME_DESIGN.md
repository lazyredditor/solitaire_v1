# Solitaire Game Design Specification

## 1. Executive Summary
This document outlines the requirements and design for a distinct, premium **Classic Klondike Solitaire** web application. The application will be built using **Next.js** and prioritize fluid aesthetics, responsive design, and transparency in randomness via a seeded card shuffling mechanism.

## 2. Core Gameplay
- **Variant**: Classic Klondike Solitaire (Turn 1 or Turn 3 options - Default to Turn 3 for classic difficulty, user configurable if desired, otherwise standard Turn 1).
- **Rules**: Standard Klondike rules.
    - Foundations: Ace to King (by suit).
    - Tableau: King to Two (alternating colors).
    - Stock/Waste: Draw cards from Stock to Waste.
- **Scoring**: Standard Scoring (points for moving to foundation, moves, etc.).
- **Game Seed**: 
    - The randomness of the deck shuffle must be determined by a **seed**.
    - This seed must be visible to the user.
    - **Refresh**: Generating a new game generates a new seed.
    - **Input**: User can manually input a seed to replay a specific deal.

## 3. Visual & Layout Design

### 3.1. Desktop Layout (Landscape)
The screen is divided into a **Main Game Area** and a **Control Panel**.
- **Main Game Area (Left 80%)**:
    - Contains the Solitaire Green Felt (or Theme bg).
    - **Top Row**: Stock Pile, Waste Pile, 4 Foundation Piles.
    - **Bottom Row**: 7 Tableau Piles.
    - Centered and scaled to fit available height/width while maintaining aspect ratio.
- **Control Panel (Right 20%)**:
    - **Stats**: Score, Timer (Time Elapsed), Move Count.
    - **Seed Control**:
        - Display of Current Seed (e.g., "Seed: #847592").
        - "New Game" Button (Generates random seed).
        - "Replay / Set Seed" Input field.
    - **Settings / Appearance**: Theme toggles.
    - **Visual Style**: Distinct background to separate from the game board (e.g., wood texture or dark glass).
- **Google Ad Space**:
    - A preserved empty space at the very bottom of the viewport (approx 90px height) spanning the full width or centered. 
    - The Game Area and Control Panel heights are calculated as `100vh - AdHeight`.

### 3.2. Mobile Layout (Portrait/Responsive)
- **Game Area**: Takes up 100% of the viewport width/height (minus Ad space).
- **Navigation/Controls**:
    - The "Right Panel" becomes a **Slide-out Drawer / Side Menu**.
    - Accessible via a Hamburger Menu icon (top-left or top-right).
    - When opened, it overlays the game board and provides access to Scores, Seeds, and Settings.
- **HUD (Heads Up Display)**:
    - Essential info (Timer/Score) might need to be floating or in a minimal top bar if the menu is closed.

### 3.3. Themes
The app features rich animations and premium aesthetics.
1.  **Classic Green Felt (Default)**:
    - Texture: High-quality green felt/baize pattern.
    - Card Backs: Classical ornate design (Red/Blue).
    - UI Elements: Gold/Brass accents, serif fonts.
2.  **Modern Minimalist Dark**:
    - Background: Deep slate/charcoal (not pure black) to reduce eye strain.
    - Cards: Modern flat design, simplified suits, high contrast but soft colors.
    - UI Elements: Glassmorphism, sans-serif fonts, neon accent glows (subtle).

## 4. Technical Architecture

### 4.1. Tech Stack
- **Framework**: **Next.js** (App Router).
- **Language**: TypeScript.
- **Styling**: **Vanilla CSS** (CSS Variables for themes, Layout Grid/Flexbox).
    - *Note*: Creating a robust system of CSS variables is crucial for the Theme Switcher.
- **State Management**: **Zustand**.
    - Stores: `useGameStore` (Deck state, Move history, Score, Seed), `useUIStore` (Theme, Menu state).
    - **History**: Undo stack for functionality.
- **Drag & Drop**: **@dnd-kit/core**.
    - Modular, accessible, and lightweight.
    - `Draggable`: Card components.
    - `Droppable`: Foundation slots, Tableau piles.
- **Randomness**: A seeded PRNG library (e.g., `seedrandom` or `minstd-linear-congruential`).

### 4.2. Advertising Integration
- Dedicated layout container `footer` or `div` fixed at bottom.
- Dimensions reserved to prevent layout shift (CLS) when ad loads.

### 4.3. Code Structure (Proposed)
```
/src
  /app
    page.tsx        # Main Entry
    layout.tsx      # Global Layout (Ad space, basic meta)
  /components
    /Game
      Board.tsx
      Card.tsx
      Pile.tsx
    /UI
      Sidebar.tsx
      MobileMenu.tsx
    /Ad
      BannerPlaceholder.tsx
  /lib
    gameLogic.ts    # Pure functions for Solitaire rules (valid moves, shuffling)
    random.ts       # Seeding logic
  /store
    gameStore.ts    # Zustand state
```

## 5. Implementation Roadmap
1.  **Project Setup**: Initialize Next.js, configure CSS variables for themes.
2.  **Game Logic Engine**: Implement deck generation (seeded) and rule validation logic (independent of UI).
3.  **UI Shell**: Build the 80/20 Desktop Grid and Mobile Drawer skeleton.
4.  **Card Components**: Create the visual Card component (Classic/Modern variants).
5.  **Interactivity**: Implement Drag and Drop logic using `dnd-kit`.
6.  **Context/State**: Connect Logic Engine to Zustand and UI.
7.  **Refinement**: Animations, Theme Switching, and Scoring.


'use client';

import { create } from 'zustand';
import {
    GameState,
    initializeGame,
    drawFromStock,
    moveCardToFoundation,
    moveCardsToTableau,
    isGameWon
} from '@/lib/gameLogic';
import { generateRandomSeed } from '@/lib/random';

interface HistoryEntry {
    state: GameState;
}

interface GameStore {
    gameState: GameState | null;
    history: HistoryEntry[];
    timerStarted: boolean;
    elapsedTime: number;
    isWon: boolean;

    // Actions
    newGame: (seed?: string) => void;
    drawCard: () => void;
    moveToFoundation: (
        cardId: string,
        fromLocation: { type: 'tableau' | 'waste'; pileIndex?: number },
        foundationIndex: number
    ) => boolean;
    moveToTableau: (
        cardId: string,
        fromLocation: { type: 'tableau' | 'waste'; pileIndex?: number },
        toTableauIndex: number
    ) => boolean;
    undo: () => void;
    startTimer: () => void;
    tick: () => void;
    resetTimer: () => void;
}

interface UIStore {
    theme: 'classic' | 'modern';
    // Variant config
    layout: 'standard' | 'left-handed';
    cardScale: number;
    gameMode: 'standard' | 'time-limit';

    isMobileMenuOpen: boolean;

    // Actions
    setTheme: (theme: 'classic' | 'modern') => void;
    setVariantConfig: (config: { layout?: 'standard' | 'left-handed', cardScale?: number, gameMode?: 'standard' | 'time-limit' }) => void;
    toggleMobileMenu: () => void;
    closeMobileMenu: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
    gameState: null,
    history: [],
    timerStarted: false,
    elapsedTime: 0,
    isWon: false,

    newGame: (seed?: string) => {
        const gameSeed = seed || generateRandomSeed();
        const newState = initializeGame(gameSeed);
        set({
            gameState: newState,
            history: [],
            timerStarted: false,
            elapsedTime: 0,
            isWon: false
        });
    },

    drawCard: () => {
        const { gameState, history } = get();
        if (!gameState) return;

        const newState = drawFromStock(gameState);
        set({
            gameState: newState,
            history: [...history, { state: gameState }],
            timerStarted: true
        });
    },

    moveToFoundation: (cardId, fromLocation, foundationIndex) => {
        const { gameState, history } = get();
        if (!gameState) return false;

        const result = moveCardToFoundation(gameState, cardId, fromLocation, foundationIndex);
        if (result.success) {
            const won = isGameWon(result.state);
            set({
                gameState: result.state,
                history: [...history, { state: gameState }],
                timerStarted: true,
                isWon: won
            });
        }
        return result.success;
    },

    moveToTableau: (cardId, fromLocation, toTableauIndex) => {
        const { gameState, history } = get();
        if (!gameState) return false;

        const result = moveCardsToTableau(gameState, cardId, fromLocation, toTableauIndex);
        if (result.success) {
            set({
                gameState: result.state,
                history: [...history, { state: gameState }],
                timerStarted: true
            });
        }
        return result.success;
    },

    undo: () => {
        const { history } = get();
        if (history.length === 0) return;

        const previousEntry = history[history.length - 1];
        set({
            gameState: previousEntry.state,
            history: history.slice(0, -1),
            isWon: false
        });
    },

    startTimer: () => {
        set({ timerStarted: true });
    },

    tick: () => {
        const { timerStarted, isWon } = get();
        if (timerStarted && !isWon) {
            set(state => ({ elapsedTime: state.elapsedTime + 1 }));
        }
    },

    resetTimer: () => {
        set({ elapsedTime: 0, timerStarted: false });
    }
}));

export const useUIStore = create<UIStore>((set) => ({
    theme: 'modern',
    layout: 'standard',
    cardScale: 1.25, // Default to 125% for larger cards
    gameMode: 'standard',
    isMobileMenuOpen: false,

    setTheme: (theme) => set({ theme }),
    setVariantConfig: (config) => set((state) => ({ ...state, ...config })),
    toggleMobileMenu: () => set(state => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
    closeMobileMenu: () => set({ isMobileMenuOpen: false })
}));

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

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

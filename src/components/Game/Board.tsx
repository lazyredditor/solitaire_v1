'use client';

import React from 'react';
import { DndContext, DragEndEvent, DragStartEvent, DragOverlay, pointerWithin } from '@dnd-kit/core';
import { useGameStore } from '@/store/gameStore';
import { Pile } from './Pile';
import { StaticCard } from './Card';
import { Card as CardType, canPlaceOnFoundation } from '@/lib/gameLogic';

export function Board() {
    const gameState = useGameStore(state => state.gameState);
    const drawCard = useGameStore(state => state.drawCard);
    const moveToFoundation = useGameStore(state => state.moveToFoundation);
    const moveToTableau = useGameStore(state => state.moveToTableau);

    const [activeCards, setActiveCards] = React.useState<CardType[]>([]);
    const [activeSource, setActiveSource] = React.useState<{ type: 'tableau' | 'waste'; pileIndex?: number } | null>(null);
    const [draggedCardId, setDraggedCardId] = React.useState<string | null>(null);

    if (!gameState) {
        return (
            <div className="game-board" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '18px' }}>Click &quot;New Game&quot; to start playing</p>
            </div>
        );
    }

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const cardId = active.id as string;

        setDraggedCardId(cardId);

        // Check waste first
        const wasteCard = gameState.waste.find(c => c.id === cardId);
        if (wasteCard) {
            setActiveCards([wasteCard]);
            setActiveSource({ type: 'waste' });
            return;
        }

        // Check tableau - get the card and all cards below it
        for (let i = 0; i < gameState.tableau.length; i++) {
            const pile = gameState.tableau[i];
            const cardIndex = pile.findIndex(c => c.id === cardId);
            if (cardIndex !== -1) {
                const cardsToMove = pile.slice(cardIndex);
                setActiveCards(cardsToMove);
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

    // Double-click handler to auto-move card to foundation
    const handleCardDoubleClick = (cardId: string, pileIndex?: number) => {
        // Find the card
        let card: CardType | undefined;
        let source: { type: 'tableau' | 'waste'; pileIndex?: number };

        // Check waste
        if (gameState.waste.length > 0 && gameState.waste[gameState.waste.length - 1].id === cardId) {
            card = gameState.waste[gameState.waste.length - 1];
            source = { type: 'waste' };
        } else if (pileIndex !== undefined) {
            // Check tableau
            const pile = gameState.tableau[pileIndex];
            if (pile.length > 0 && pile[pile.length - 1].id === cardId) {
                card = pile[pile.length - 1];
                source = { type: 'tableau', pileIndex };
            }
        }

        if (!card) return;

        // Try to find a matching foundation
        for (let i = 0; i < 4; i++) {
            if (canPlaceOnFoundation(card, gameState.foundations[i])) {
                moveToFoundation(cardId, source!, i);
                return;
            }
        }
    };

    return (
        <DndContext
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            collisionDetection={pointerWithin}
        >
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
                            onCardDoubleClick={handleCardDoubleClick}
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
        </DndContext>
    );
}

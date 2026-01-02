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

    // Double-click handler to auto-move card to foundation or tableau
    const handleCardDoubleClick = (cardId: string, pileIndex?: number) => {
        // Find the card and its source
        let card: CardType | undefined;
        let source: { type: 'tableau' | 'waste'; pileIndex?: number };
        let cardIndexInPile: number = -1;

        // Check waste (only top card)
        if (gameState.waste.length > 0 && gameState.waste[gameState.waste.length - 1].id === cardId) {
            card = gameState.waste[gameState.waste.length - 1];
            source = { type: 'waste' };
        } else if (pileIndex !== undefined) {
            // Check tableau - find the card at any position (must be face up)
            const pile = gameState.tableau[pileIndex];
            cardIndexInPile = pile.findIndex(c => c.id === cardId);
            if (cardIndexInPile !== -1 && pile[cardIndexInPile].faceUp) {
                card = pile[cardIndexInPile];
                source = { type: 'tableau', pileIndex };
            }
        }

        if (!card) return;

        // Priority 1: Try to move to foundation (only works for top card of a stack or single card)
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

        // Priority 2: Move to a valid tableau pile (prefer smallest pile)
        // Get all cards from this card downward (the stack to move)
        const cardsToMove = pileIndex !== undefined
            ? gameState.tableau[pileIndex].slice(cardIndexInPile)
            : [card];

        const topCardOfStack = cardsToMove[0];

        // Find valid tableau destinations, sorted by pile size (smallest first)
        const validDestinations: { index: number; size: number }[] = [];

        for (let i = 0; i < gameState.tableau.length; i++) {
            if (i === pileIndex) continue; // Skip source pile

            const destPile = gameState.tableau[i];

            // Check if move is valid
            if (destPile.length === 0) {
                // Empty pile - only Kings can go here
                if (topCardOfStack.rank === 'K') {
                    validDestinations.push({ index: i, size: 0 });
                }
            } else {
                const topDest = destPile[destPile.length - 1];
                // Check alternating color and descending rank
                const isRed = (suit: string) => suit === 'hearts' || suit === 'diamonds';
                const rankOrder = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
                const srcRankIdx = rankOrder.indexOf(topCardOfStack.rank);
                const destRankIdx = rankOrder.indexOf(topDest.rank);

                if (isRed(topCardOfStack.suit) !== isRed(topDest.suit) && srcRankIdx === destRankIdx - 1) {
                    validDestinations.push({ index: i, size: destPile.length });
                }
            }
        }

        // Sort by size (smallest first) and pick the first valid destination
        validDestinations.sort((a, b) => a.size - b.size);

        if (validDestinations.length > 0) {
            moveToTableau(cardId, source!, validDestinations[0].index);
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

'use client';

import React from 'react';
import { DndContext, DragEndEvent, DragStartEvent, DragOverlay, pointerWithin } from '@dnd-kit/core';
import { useGameStore } from '@/store/gameStore';
import { Pile } from './Pile';
import { Card } from './Card';
import { Card as CardType } from '@/lib/gameLogic';

export function Board() {
    const gameState = useGameStore(state => state.gameState);
    const drawCard = useGameStore(state => state.drawCard);
    const moveToFoundation = useGameStore(state => state.moveToFoundation);
    const moveToTableau = useGameStore(state => state.moveToTableau);

    const [activeCard, setActiveCard] = React.useState<CardType | null>(null);
    const [activeSource, setActiveSource] = React.useState<{ type: 'tableau' | 'waste'; pileIndex?: number } | null>(null);

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

        // Find the card and its source
        // Check waste first
        const wasteCard = gameState.waste.find(c => c.id === cardId);
        if (wasteCard) {
            setActiveCard(wasteCard);
            setActiveSource({ type: 'waste' });
            return;
        }

        // Check tableau
        for (let i = 0; i < gameState.tableau.length; i++) {
            const card = gameState.tableau[i].find(c => c.id === cardId);
            if (card) {
                setActiveCard(card);
                setActiveSource({ type: 'tableau', pileIndex: i });
                return;
            }
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        setActiveCard(null);
        setActiveSource(null);

        if (!over || !activeSource) return;

        const cardId = active.id as string;
        const destinationType = over.data.current?.type as string;
        const destinationIndex = over.data.current?.pileIndex as number | undefined;

        if (destinationType === 'foundation' && destinationIndex !== undefined) {
            moveToFoundation(cardId, activeSource, destinationIndex);
        } else if (destinationType === 'tableau' && destinationIndex !== undefined) {
            moveToTableau(cardId, activeSource, destinationIndex);
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
                        />
                    ))}
                </div>
            </div>

            <DragOverlay>
                {activeCard ? <Card card={activeCard} isDraggable={false} /> : null}
            </DragOverlay>
        </DndContext>
    );
}

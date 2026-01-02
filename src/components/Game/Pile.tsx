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
    draggedCardId?: string | null;
}

export function Pile({ id, cards, type, emptyIcon, onClick, pileIndex, onCardDoubleClick, draggedCardId }: PileProps) {
    const { setNodeRef, isOver } = useDroppable({
        id,
        data: { type, pileIndex },
    });

    const isTableau = type === 'tableau';
    const isStock = type === 'stock';

    if (cards.length === 0) {
        return (
            <div
                ref={setNodeRef}
                className={`pile ${type === 'tableau' ? 'tableau-pile' : ''}`}
                onClick={onClick}
            >
                <div
                    className={`pile-empty ${isStock ? 'stock-pile' : ''} ${isOver ? 'card-highlight' : ''}`}
                >
                    {emptyIcon && <span className={`pile-empty-icon ${isStock ? 'refresh-icon' : ''}`}>{emptyIcon}</span>}
                </div>
            </div>
        );
    }

    if (isTableau) {
        // Find where the dragged card starts in this pile (if any)
        const dragStartIndex = draggedCardId ? cards.findIndex(c => c.id === draggedCardId) : -1;

        return (
            <div
                ref={setNodeRef}
                className="pile tableau-pile"
            >
                <div className="card-stack">
                    {cards.map((card, index) => {
                        // Hide cards that are being dragged (from dragStartIndex onwards)
                        const isBeingDragged = dragStartIndex !== -1 && index >= dragStartIndex;

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

    // Waste and Foundation - show only top card
    const topCard = cards[cards.length - 1];
    const isWasteDragging = type === 'waste' && draggedCardId === topCard.id;

    return (
        <div
            ref={setNodeRef}
            className={`pile ${isOver ? 'card-highlight' : ''}`}
        >
            <Card
                card={topCard}
                isDraggable={type === 'waste'}
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

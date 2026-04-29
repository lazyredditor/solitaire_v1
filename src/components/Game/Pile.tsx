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

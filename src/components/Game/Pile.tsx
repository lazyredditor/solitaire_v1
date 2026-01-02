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
}

export function Pile({ id, cards, type, emptyIcon, onClick, pileIndex }: PileProps) {
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
        return (
            <div
                ref={setNodeRef}
                className="pile tableau-pile"
            >
                <div className="card-stack">
                    {cards.map((card, index) => (
                        <div key={card.id} className="card-wrapper">
                            <Card
                                card={card}
                                index={index}
                                isDraggable={card.faceUp}
                            />
                        </div>
                    ))}
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
    return (
        <div
            ref={setNodeRef}
            className={`pile ${isOver ? 'card-highlight' : ''}`}
        >
            <Card
                card={topCard}
                isDraggable={type === 'waste'}
            />
        </div>
    );
}

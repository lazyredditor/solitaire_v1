'use client';

import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Card as CardType, getSuitSymbol, getSuitColor } from '@/lib/gameLogic';

interface CardProps {
    card: CardType;
    index?: number;
    isDraggable?: boolean;
    onClick?: () => void;
    style?: React.CSSProperties;
}

export function Card({ card, index = 0, isDraggable = true, onClick, style }: CardProps) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: card.id,
        disabled: !isDraggable || !card.faceUp,
        data: { card, index },
    });

    const suitSymbol = getSuitSymbol(card.suit);
    const suitColor = getSuitColor(card.suit);

    const dragStyle = transform
        ? {
            transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
            zIndex: 1000,
        }
        : undefined;

    if (!card.faceUp) {
        return (
            <div
                ref={setNodeRef}
                className="card card-face-down"
                style={{ ...style, ...dragStyle }}
                onClick={onClick}
            />
        );
    }

    return (
        <div
            ref={setNodeRef}
            className={`card card-face-up card-${suitColor} ${isDragging ? 'card-dragging' : ''}`}
            style={{ ...style, ...dragStyle }}
            onClick={onClick}
            {...(isDraggable ? { ...listeners, ...attributes } : {})}
        >
            <div className="card-corner card-corner-top">
                <span className="card-rank">{card.rank}</span>
                <span className="card-suit-small">{suitSymbol}</span>
            </div>
            <span className="card-center-suit">{suitSymbol}</span>
            <div className="card-corner card-corner-bottom">
                <span className="card-rank">{card.rank}</span>
                <span className="card-suit-small">{suitSymbol}</span>
            </div>
        </div>
    );
}

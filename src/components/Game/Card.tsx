'use client';

import React, { useRef, useCallback } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Card as CardType, getSuitSymbol, getSuitColor } from '@/lib/gameLogic';

interface CardProps {
    card: CardType;
    index?: number;
    isDraggable?: boolean;
    onClick?: () => void;
    onDoubleClick?: () => void;
    style?: React.CSSProperties;
    hideWhileDragging?: boolean;
}

export function Card({ card, index = 0, isDraggable = true, onClick, onDoubleClick, style, hideWhileDragging = false }: CardProps) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: card.id,
        disabled: !isDraggable || !card.faceUp,
        data: { card, index },
    });

    // Track clicks for custom double-click detection (dnd-kit blocks native dblclick)
    const lastClickTime = useRef<number>(0);
    const clickTimeout = useRef<NodeJS.Timeout | null>(null);

    const handlePointerDown = useCallback((e: React.PointerEvent) => {
        const now = Date.now();
        const timeSinceLastClick = now - lastClickTime.current;

        // If second click within 300ms, it's a double-click
        if (timeSinceLastClick < 300 && onDoubleClick) {
            e.preventDefault();
            e.stopPropagation();
            onDoubleClick();
            lastClickTime.current = 0;
            if (clickTimeout.current) {
                clearTimeout(clickTimeout.current);
                clickTimeout.current = null;
            }
            return;
        }

        lastClickTime.current = now;

        // Reset after 300ms if no second click
        if (clickTimeout.current) {
            clearTimeout(clickTimeout.current);
        }
        clickTimeout.current = setTimeout(() => {
            lastClickTime.current = 0;
        }, 300);

        // Call the original dnd-kit listener if it exists
        if (listeners?.onPointerDown) {
            listeners.onPointerDown(e as unknown as PointerEvent);
        }
    }, [onDoubleClick, listeners]);

    const suitSymbol = getSuitSymbol(card.suit);
    const suitColor = getSuitColor(card.suit);

    const dragStyle = transform
        ? {
            transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
            zIndex: 1000,
        }
        : undefined;

    // Hide the original card while dragging if using DragOverlay
    const shouldHide = hideWhileDragging && isDragging;

    if (!card.faceUp) {
        return (
            <div
                ref={setNodeRef}
                className="card card-face-down"
                style={{ ...style, ...dragStyle, opacity: shouldHide ? 0 : 1 }}
                onClick={onClick}
            />
        );
    }

    // Merge our custom pointer handler with dnd-kit listeners
    const mergedListeners = isDraggable && listeners
        ? { ...listeners, onPointerDown: handlePointerDown }
        : {};

    return (
        <div
            ref={setNodeRef}
            className={`card card-face-up card-${suitColor} ${isDragging ? 'card-dragging' : ''}`}
            style={{ ...style, ...dragStyle, opacity: shouldHide ? 0 : 1 }}
            onClick={onClick}
            {...mergedListeners}
            {...(isDraggable ? attributes : {})}
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

// A simple static card for use in DragOverlay (no draggable behavior)
export function StaticCard({ card, style }: { card: CardType; style?: React.CSSProperties }) {
    const suitSymbol = getSuitSymbol(card.suit);
    const suitColor = getSuitColor(card.suit);

    if (!card.faceUp) {
        return <div className="card card-face-down" style={style} />;
    }

    return (
        <div
            className={`card card-face-up card-${suitColor} card-dragging`}
            style={style}
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

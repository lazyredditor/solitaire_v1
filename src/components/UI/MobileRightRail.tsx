'use client';

import React from 'react';
import { useGameStore } from '@/store/gameStore';
import { Pile } from '@/components/Game/Pile';

interface MobileRightRailProps {
    onPileTap?: (destinationType: 'foundation' | 'tableau', destinationIndex: number) => void;
    validDropPileIds?: Set<string>;
}

export function MobileRightRail({ onPileTap, validDropPileIds }: MobileRightRailProps) {
    const gameState = useGameStore(state => state.gameState);

    if (!gameState) return null;

    return (
        <aside className="mobile-rail-right">
            {gameState.foundations.map((foundation, index) => (
                <Pile
                    key={`rail-foundation-${index}`}
                    id={`foundation-${index}`}
                    cards={foundation}
                    type="foundation"
                    emptyIcon={['♠', '♥', '♦', '♣'][index]}
                    pileIndex={index}
                    onPileTap={onPileTap ? () => onPileTap('foundation', index) : undefined}
                    validDrop={validDropPileIds?.has(`foundation-${index}`)}
                />
            ))}
        </aside>
    );
}

'use client';

import React from 'react';
import { useGameStore, useUIStore } from '@/store/gameStore';

function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

interface MobileHeaderProps {
    title?: string;
}

export function MobileHeader({ title = 'Klondike' }: MobileHeaderProps) {
    const gameState = useGameStore(state => state.gameState);
    const elapsedTime = useGameStore(state => state.elapsedTime);
    const toggleMobileMenu = useUIStore(state => state.toggleMobileMenu);

    return (
        <header className="mobile-header">
            <button
                className="mobile-header-menu"
                onClick={toggleMobileMenu}
                aria-label="Open menu"
            >
                ☰
            </button>
            <span className="mobile-header-title">{title}</span>
            <div className="mobile-header-hud">
                <span>⏱<strong>{formatTime(elapsedTime)}</strong></span>
                <span>♠<strong>{gameState?.score ?? 0}</strong></span>
                <span>↺<strong>{gameState?.moves ?? 0}</strong></span>
            </div>
        </header>
    );
}

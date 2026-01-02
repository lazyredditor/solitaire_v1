'use client';

import React from 'react';
import { useGameStore } from '@/store/gameStore';

function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function WinModal() {
    const isWon = useGameStore(state => state.isWon);
    const gameState = useGameStore(state => state.gameState);
    const elapsedTime = useGameStore(state => state.elapsedTime);
    const newGame = useGameStore(state => state.newGame);

    if (!isWon) return null;

    return (
        <div className="win-modal-overlay">
            <div className="win-modal">
                <h2 className="win-title">🎉 You Won! 🎉</h2>
                <div className="win-stats">
                    <div className="win-stat">
                        <p className="win-stat-value">{gameState?.score ?? 0}</p>
                        <p className="win-stat-label">Score</p>
                    </div>
                    <div className="win-stat">
                        <p className="win-stat-value">{formatTime(elapsedTime)}</p>
                        <p className="win-stat-label">Time</p>
                    </div>
                    <div className="win-stat">
                        <p className="win-stat-value">{gameState?.moves ?? 0}</p>
                        <p className="win-stat-label">Moves</p>
                    </div>
                </div>
                <button className="btn btn-primary btn-full" onClick={() => newGame()}>
                    Play Again
                </button>
            </div>
        </div>
    );
}

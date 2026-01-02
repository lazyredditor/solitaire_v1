'use client';

import React, { useState, useEffect } from 'react';
import { useGameStore, useUIStore } from '@/store/gameStore';

function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function Sidebar() {
    const gameState = useGameStore(state => state.gameState);
    const elapsedTime = useGameStore(state => state.elapsedTime);
    const tick = useGameStore(state => state.tick);
    const newGame = useGameStore(state => state.newGame);
    const undo = useGameStore(state => state.undo);
    const history = useGameStore(state => state.history);
    const timerStarted = useGameStore(state => state.timerStarted);

    const theme = useUIStore(state => state.theme);
    const setTheme = useUIStore(state => state.setTheme);

    const [seedInput, setSeedInput] = useState('');

    // Timer effect
    useEffect(() => {
        if (!timerStarted) return;

        const interval = setInterval(() => {
            tick();
        }, 1000);

        return () => clearInterval(interval);
    }, [timerStarted, tick]);

    const handleNewGame = () => {
        newGame();
    };

    const handleReplay = () => {
        if (seedInput.trim()) {
            newGame(seedInput.trim());
            setSeedInput('');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleReplay();
        }
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <h1 className="sidebar-title">Solitaire</h1>
                <p className="sidebar-subtitle">Klondike</p>
            </div>

            <div className="stats-section">
                <div className="stat-item">
                    <span className="stat-label">Score</span>
                    <span className="stat-value">{gameState?.score ?? 0}</span>
                </div>
                <div className="stat-item">
                    <span className="stat-label">Time</span>
                    <span className="stat-value">{formatTime(elapsedTime)}</span>
                </div>
                <div className="stat-item">
                    <span className="stat-label">Moves</span>
                    <span className="stat-value">{gameState?.moves ?? 0}</span>
                </div>
            </div>

            <div className="seed-section">
                <h3 className="section-title">Game Seed</h3>
                <div className="seed-display">
                    <p className="seed-label">Current Seed</p>
                    <p className="seed-value">{gameState?.seed ?? '------'}</p>
                </div>
                <div className="seed-input-group">
                    <input
                        type="text"
                        className="seed-input"
                        placeholder="Enter seed..."
                        value={seedInput}
                        onChange={(e) => setSeedInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                    <button className="btn btn-secondary btn-icon" onClick={handleReplay} title="Replay with seed">
                        ▶
                    </button>
                </div>
            </div>

            <div className="actions-section">
                <button className="btn btn-primary btn-full" onClick={handleNewGame}>
                    New Game
                </button>
                <button
                    className="btn btn-secondary btn-full"
                    onClick={undo}
                    disabled={history.length === 0}
                >
                    Undo
                </button>
            </div>

            <div className="theme-section">
                <h3 className="section-title">Theme</h3>
                <div className="theme-toggle">
                    <button
                        className={`theme-btn ${theme === 'classic' ? 'active' : ''}`}
                        onClick={() => setTheme('classic')}
                    >
                        Classic
                    </button>
                    <button
                        className={`theme-btn ${theme === 'modern' ? 'active' : ''}`}
                        onClick={() => setTheme('modern')}
                    >
                        Modern
                    </button>
                </div>
            </div>
        </aside>
    );
}

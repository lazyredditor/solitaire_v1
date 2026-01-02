'use client';

import React, { useState } from 'react';
import { useGameStore, useUIStore } from '@/store/gameStore';

function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function MobileMenu() {
    const gameState = useGameStore(state => state.gameState);
    const elapsedTime = useGameStore(state => state.elapsedTime);
    const newGame = useGameStore(state => state.newGame);
    const undo = useGameStore(state => state.undo);
    const history = useGameStore(state => state.history);

    const theme = useUIStore(state => state.theme);
    const setTheme = useUIStore(state => state.setTheme);
    const isMobileMenuOpen = useUIStore(state => state.isMobileMenuOpen);
    const toggleMobileMenu = useUIStore(state => state.toggleMobileMenu);
    const closeMobileMenu = useUIStore(state => state.closeMobileMenu);

    const [seedInput, setSeedInput] = useState('');

    const handleNewGame = () => {
        newGame();
        closeMobileMenu();
    };

    const handleReplay = () => {
        if (seedInput.trim()) {
            newGame(seedInput.trim());
            setSeedInput('');
            closeMobileMenu();
        }
    };

    return (
        <>
            {/* Mobile HUD */}
            <div className="mobile-hud">
                <div className="mobile-hud-stats">
                    <div className="mobile-hud-item">
                        <span className="mobile-hud-label">Score</span>
                        <span className="mobile-hud-value">{gameState?.score ?? 0}</span>
                    </div>
                    <div className="mobile-hud-item">
                        <span className="mobile-hud-label">Time</span>
                        <span className="mobile-hud-value">{formatTime(elapsedTime)}</span>
                    </div>
                    <div className="mobile-hud-item">
                        <span className="mobile-hud-label">Moves</span>
                        <span className="mobile-hud-value">{gameState?.moves ?? 0}</span>
                    </div>
                </div>
            </div>

            {/* Hamburger Toggle */}
            <button
                className={`mobile-menu-toggle ${isMobileMenuOpen ? 'open' : ''}`}
                onClick={toggleMobileMenu}
                aria-label="Toggle menu"
            >
                <div className="hamburger">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </button>

            {/* Overlay */}
            <div
                className={`mobile-overlay ${isMobileMenuOpen ? 'open' : ''}`}
                onClick={closeMobileMenu}
            />

            {/* Slide-out Menu */}
            <div className={`mobile-sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
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
                        />
                        <button className="btn btn-secondary btn-icon" onClick={handleReplay}>
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
            </div>
        </>
    );
}

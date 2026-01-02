'use client';

import React, { useEffect, useState } from 'react';
import { useGameStore, useUIStore } from '@/store/gameStore';
import { Board } from '@/components/Game/Board';
import { Sidebar } from '@/components/UI/Sidebar';
import { MobileMenu } from '@/components/UI/MobileMenu';
import { WinModal } from '@/components/UI/WinModal';

interface VariantGameWrapperProps {
    config: {
        layout?: 'standard' | 'left-handed';
        cardScale?: number;
        gameMode?: 'standard' | 'time-limit';
        theme?: 'classic' | 'modern';
    };
    children: React.ReactNode;
}

export function VariantGameWrapper({ config, children }: VariantGameWrapperProps) {
    const newGame = useGameStore(state => state.newGame);
    const setVariantConfig = useUIStore(state => state.setVariantConfig);
    const setTheme = useUIStore(state => state.setTheme);

    // Store state for rendering
    const theme = useUIStore(state => state.theme);
    const layout = useUIStore(state => state.layout);
    const cardScale = useUIStore(state => state.cardScale);

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // Apply variant config
        setVariantConfig({
            layout: config.layout || 'standard',
            cardScale: config.cardScale || 1.0,
            gameMode: config.gameMode || 'standard'
        });

        if (config.theme) {
            setTheme(config.theme);
        }

        setMounted(true);
        newGame();
    }, [config, newGame, setVariantConfig, setTheme]);

    if (!mounted) {
        return (
            <div className="app-container" data-theme="classic">
                <div className="main-content">
                    <main className="game-area">
                        <div className="game-board" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '18px' }}>Loading Variant...</p>
                        </div>
                    </main>
                    <aside className="sidebar">
                        <div className="sidebar-header">
                            <h1 className="sidebar-title">Solitaire</h1>
                        </div>
                    </aside>
                </div>
            </div>
        );
    }

    return (
        <div
            className={`app-container ${layout}`}
            data-theme={theme}
            style={{ '--card-scale': cardScale } as React.CSSProperties}
        >
            <div className="main-content">
                <main className="game-area">
                    <Board />
                </main>
                <Sidebar />
                <MobileMenu />
            </div>
            {children}
            <WinModal />
        </div>
    );
}

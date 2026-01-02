'use client';

import React, { useEffect, useState } from 'react';
import { useGameStore, useUIStore } from '@/store/gameStore';
import { Board } from '@/components/Game/Board';
import { Sidebar } from '@/components/UI/Sidebar';
import { MobileMenu } from '@/components/UI/MobileMenu';
import { WinModal } from '@/components/UI/WinModal';
import { BannerPlaceholder } from '@/components/Ad/BannerPlaceholder';

export default function Home() {
  const newGame = useGameStore(state => state.newGame);
  const theme = useUIStore(state => state.theme);
  const [mounted, setMounted] = useState(false);

  // Wait for hydration to complete before rendering dynamic content
  useEffect(() => {
    setMounted(true);
    newGame();
  }, [newGame]);

  // Show loading state during SSR and hydration
  if (!mounted) {
    return (
      <div className="app-container" data-theme="classic">
        <div className="main-content">
          <main className="game-area">
            <div className="game-board" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '18px' }}>Loading...</p>
            </div>
          </main>
          <aside className="sidebar">
            <div className="sidebar-header">
              <h1 className="sidebar-title">Solitaire</h1>
              <p className="sidebar-subtitle">Klondike</p>
            </div>
          </aside>
        </div>
        <BannerPlaceholder />
      </div>
    );
  }

  return (
    <div className="app-container" data-theme={theme}>
      <div className="main-content">
        <main className="game-area">
          <Board />
        </main>
        <Sidebar />
        <MobileMenu />
      </div>
      <BannerPlaceholder />
      <WinModal />
    </div>
  );
}

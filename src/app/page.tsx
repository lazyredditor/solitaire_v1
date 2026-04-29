'use client';

import React, { useEffect, useState } from 'react';
import { DndContext, pointerWithin } from '@dnd-kit/core';
import { useGameStore, useUIStore } from '@/store/gameStore';
import { Board, useBoardController } from '@/components/Game/Board';
import { Sidebar } from '@/components/UI/Sidebar';
import { MobileMenu } from '@/components/UI/MobileMenu';
import { MobileHeader } from '@/components/UI/MobileHeader';
import { MobileDock } from '@/components/UI/MobileDock';
import { MobileLeftRail } from '@/components/UI/MobileLeftRail';
import { MobileRightRail } from '@/components/UI/MobileRightRail';
import { WinModal } from '@/components/UI/WinModal';
import { BannerPlaceholder } from '@/components/Ad/BannerPlaceholder';
import { GameContent } from '@/components/Content/GameContent';

export default function Home() {
  const newGame = useGameStore(state => state.newGame);
  const theme = useUIStore(state => state.theme);
  const layout = useUIStore(state => state.layout);
  const cardScale = useUIStore(state => state.cardScale);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    newGame();
  }, [newGame]);

  // Hook ordering: useBoardController must be called unconditionally on every render.
  const controller = useBoardController();

  if (!mounted) {
    return (
      <div className="app-container" data-theme="classic" suppressHydrationWarning>
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
    <div
      className={`app-container ${layout}`}
      data-theme={theme}
      style={{ '--card-scale': cardScale } as React.CSSProperties}
    >
      <DndContext
        sensors={controller.sensors}
        collisionDetection={pointerWithin}
        onDragStart={controller.handleDragStart}
        onDragEnd={controller.handleDragEnd}
      >
        <div className="main-content">
          <MobileLeftRail
            onCardDoubleClick={controller.onCardDoubleClick}
            onCardTap={controller.onCardTap}
            selectedCardId={controller.selectedCardId}
            draggedCardId={controller.draggedCardId}
          />

          <main className="game-area">
            <MobileHeader />

            <Board controller={controller} />

            <MobileDock
              onCardDoubleClick={controller.onCardDoubleClick}
              onCardTap={controller.onCardTap}
              onPileTap={controller.onPileTap}
              selectedCardId={controller.selectedCardId}
              validDropPileIds={controller.validDropPileIds}
              draggedCardId={controller.draggedCardId}
            />
          </main>

          <MobileRightRail
            onPileTap={controller.onPileTap}
            validDropPileIds={controller.validDropPileIds}
          />

          <Sidebar />

          <MobileMenu />
        </div>
        <BannerPlaceholder />
        <WinModal />
        <GameContent />
      </DndContext>
    </div>
  );
}

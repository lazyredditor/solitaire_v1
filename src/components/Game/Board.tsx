'use client';

import React from 'react';
import {
    DragEndEvent,
    DragStartEvent,
    DragOverlay,
    useSensor,
    useSensors,
    PointerSensor,
} from '@dnd-kit/core';
import { useGameStore } from '@/store/gameStore';
import { Pile } from './Pile';
import { StaticCard } from './Card';
import { Card as CardType, canPlaceOnFoundation } from '@/lib/gameLogic';

type Source = { type: 'tableau' | 'waste'; pileIndex?: number };

const RANK_ORDER = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const isRed = (suit: string) => suit === 'hearts' || suit === 'diamonds';

function isValidTableauMove(topOfStack: CardType, destPile: CardType[]): boolean {
    if (destPile.length === 0) return topOfStack.rank === 'K';
    const topDest = destPile[destPile.length - 1];
    if (!topDest.faceUp) return false;
    const srcIdx = RANK_ORDER.indexOf(topOfStack.rank);
    const destIdx = RANK_ORDER.indexOf(topDest.rank);
    return isRed(topOfStack.suit) !== isRed(topDest.suit) && srcIdx === destIdx - 1;
}

export interface BoardController {
    onCardTap: (cardId: string, pileIndex?: number) => void;
    onPileTap: (destinationType: 'foundation' | 'tableau', destinationIndex: number) => void;
    onCardDoubleClick: (cardId: string, pileIndex?: number) => void;
    selectedCardId: string | null;
    validDropPileIds: Set<string>;
    draggedCardId: string | null;
    handleDragStart: (event: DragStartEvent) => void;
    handleDragEnd: (event: DragEndEvent) => void;
    activeCards: CardType[];
    sensors: ReturnType<typeof useSensors>;
}

export function useBoardController(): BoardController {
    const gameState = useGameStore(state => state.gameState);
    const moveToFoundation = useGameStore(state => state.moveToFoundation);
    const moveToTableau = useGameStore(state => state.moveToTableau);

    const [activeCards, setActiveCards] = React.useState<CardType[]>([]);
    const [activeSource, setActiveSource] = React.useState<Source | null>(null);
    const [draggedCardId, setDraggedCardId] = React.useState<string | null>(null);

    const [selectedCardId, setSelectedCardId] = React.useState<string | null>(null);
    const [selectedSource, setSelectedSource] = React.useState<Source | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { delay: 120, tolerance: 6 },
        })
    );

    const findCardSource = (cardId: string): { card: CardType; source: Source; cardsToMove: CardType[] } | null => {
        if (!gameState) return null;
        if (gameState.waste.length > 0 && gameState.waste[gameState.waste.length - 1].id === cardId) {
            const card = gameState.waste[gameState.waste.length - 1];
            return { card, source: { type: 'waste' }, cardsToMove: [card] };
        }
        for (let i = 0; i < gameState.tableau.length; i++) {
            const pile = gameState.tableau[i];
            const idx = pile.findIndex(c => c.id === cardId);
            if (idx !== -1 && pile[idx].faceUp) {
                return {
                    card: pile[idx],
                    source: { type: 'tableau', pileIndex: i },
                    cardsToMove: pile.slice(idx),
                };
            }
        }
        return null;
    };

    const validDropPileIds = React.useMemo(() => {
        const ids = new Set<string>();
        if (!selectedCardId || !gameState) return ids;
        const found = findCardSource(selectedCardId);
        if (!found) return ids;

        const top = found.cardsToMove[0];
        const isSingle = found.cardsToMove.length === 1;

        if (isSingle) {
            for (let i = 0; i < gameState.foundations.length; i++) {
                if (canPlaceOnFoundation(top, gameState.foundations[i])) {
                    ids.add(`foundation-${i}`);
                }
            }
        }
        for (let i = 0; i < gameState.tableau.length; i++) {
            if (selectedSource?.type === 'tableau' && selectedSource.pileIndex === i) continue;
            if (isValidTableauMove(top, gameState.tableau[i])) {
                ids.add(`tableau-${i}`);
            }
        }
        return ids;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedCardId, gameState]);

    const onCardTap = (cardId: string, pileIndex?: number) => {
        if (selectedCardId === cardId) {
            setSelectedCardId(null);
            setSelectedSource(null);
            return;
        }
        const found = findCardSource(cardId);
        if (!found) return;
        setSelectedCardId(cardId);
        setSelectedSource(found.source);
        void pileIndex;
    };

    const onPileTap = (destinationType: 'foundation' | 'tableau', destinationIndex: number) => {
        if (!selectedCardId || !selectedSource) return;
        const pileId = `${destinationType}-${destinationIndex}`;
        if (!validDropPileIds.has(pileId)) {
            setSelectedCardId(null);
            setSelectedSource(null);
            return;
        }
        if (destinationType === 'foundation') {
            moveToFoundation(selectedCardId, selectedSource, destinationIndex);
        } else {
            moveToTableau(selectedCardId, selectedSource, destinationIndex);
        }
        setSelectedCardId(null);
        setSelectedSource(null);
    };

    const handleDragStart = (event: DragStartEvent) => {
        if (!gameState) return;
        const { active } = event;
        const cardId = active.id as string;

        setSelectedCardId(null);
        setSelectedSource(null);
        setDraggedCardId(cardId);

        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
            navigator.vibrate?.(10);
        }

        const wasteCard = gameState.waste.find(c => c.id === cardId);
        if (wasteCard) {
            setActiveCards([wasteCard]);
            setActiveSource({ type: 'waste' });
            return;
        }
        for (let i = 0; i < gameState.tableau.length; i++) {
            const pile = gameState.tableau[i];
            const cardIndex = pile.findIndex(c => c.id === cardId);
            if (cardIndex !== -1) {
                setActiveCards(pile.slice(cardIndex));
                setActiveSource({ type: 'tableau', pileIndex: i });
                return;
            }
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        const currentSource = activeSource;
        setActiveCards([]);
        setActiveSource(null);
        setDraggedCardId(null);

        if (!over || !currentSource) return;

        const cardId = active.id as string;
        const destinationType = over.data.current?.type as string;
        const destinationIndex = over.data.current?.pileIndex as number | undefined;

        if (destinationType === 'foundation' && destinationIndex !== undefined) {
            moveToFoundation(cardId, currentSource, destinationIndex);
        } else if (destinationType === 'tableau' && destinationIndex !== undefined) {
            moveToTableau(cardId, currentSource, destinationIndex);
        }
    };

    const onCardDoubleClick = (cardId: string, pileIndex?: number) => {
        if (!gameState) return;
        let card: CardType | undefined;
        let source: Source;
        let cardIndexInPile = -1;

        if (gameState.waste.length > 0 && gameState.waste[gameState.waste.length - 1].id === cardId) {
            card = gameState.waste[gameState.waste.length - 1];
            source = { type: 'waste' };
        } else if (pileIndex !== undefined) {
            const pile = gameState.tableau[pileIndex];
            cardIndexInPile = pile.findIndex(c => c.id === cardId);
            if (cardIndexInPile !== -1 && pile[cardIndexInPile].faceUp) {
                card = pile[cardIndexInPile];
                source = { type: 'tableau', pileIndex };
            }
        }
        if (!card) return;

        const isTopCard = pileIndex !== undefined
            ? cardIndexInPile === gameState.tableau[pileIndex].length - 1
            : true;

        if (isTopCard) {
            for (let i = 0; i < 4; i++) {
                if (canPlaceOnFoundation(card, gameState.foundations[i])) {
                    moveToFoundation(cardId, source!, i);
                    return;
                }
            }
        }

        const cardsToMove = pileIndex !== undefined
            ? gameState.tableau[pileIndex].slice(cardIndexInPile)
            : [card];
        const topOfStack = cardsToMove[0];

        const candidates: { index: number; size: number }[] = [];
        for (let i = 0; i < gameState.tableau.length; i++) {
            if (i === pileIndex) continue;
            if (isValidTableauMove(topOfStack, gameState.tableau[i])) {
                candidates.push({ index: i, size: gameState.tableau[i].length });
            }
        }
        candidates.sort((a, b) => a.size - b.size);
        if (candidates.length > 0) {
            moveToTableau(cardId, source!, candidates[0].index);
        }
    };

    return {
        onCardTap,
        onPileTap,
        onCardDoubleClick,
        selectedCardId,
        validDropPileIds,
        draggedCardId,
        handleDragStart,
        handleDragEnd,
        activeCards,
        sensors,
    };
}

interface BoardProps {
    controller: BoardController;
}

export function Board({ controller }: BoardProps) {
    const gameState = useGameStore(state => state.gameState);
    const drawCard = useGameStore(state => state.drawCard);

    if (!gameState) {
        return (
            <div className="game-board" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '18px' }}>Click &quot;New Game&quot; to start playing</p>
            </div>
        );
    }

    const {
        onCardTap, onPileTap, onCardDoubleClick,
        selectedCardId, validDropPileIds, draggedCardId,
        activeCards,
    } = controller;

    return (
        <div className="game-board">
            <div className="top-row">
                <div className="stock-waste-area">
                    <Pile
                        id="stock"
                        cards={gameState.stock}
                        type="stock"
                        emptyIcon="↻"
                        onClick={drawCard}
                    />
                    <Pile
                        id="waste"
                        cards={gameState.waste}
                        type="waste"
                        onCardDoubleClick={onCardDoubleClick}
                        onCardTap={onCardTap}
                        selectedCardId={selectedCardId}
                        draggedCardId={draggedCardId}
                    />
                </div>

                <div className="foundations-area">
                    {gameState.foundations.map((foundation, index) => (
                        <Pile
                            key={`foundation-${index}`}
                            id={`foundation-${index}`}
                            cards={foundation}
                            type="foundation"
                            emptyIcon={['♠', '♥', '♦', '♣'][index]}
                            pileIndex={index}
                            onPileTap={() => onPileTap('foundation', index)}
                            validDrop={validDropPileIds.has(`foundation-${index}`)}
                        />
                    ))}
                </div>
            </div>

            <div className="tableau-area">
                {gameState.tableau.map((pile, index) => (
                    <Pile
                        key={`tableau-${index}`}
                        id={`tableau-${index}`}
                        cards={pile}
                        type="tableau"
                        pileIndex={index}
                        onCardDoubleClick={onCardDoubleClick}
                        onCardTap={onCardTap}
                        onPileTap={() => onPileTap('tableau', index)}
                        selectedCardId={selectedCardId}
                        validDrop={validDropPileIds.has(`tableau-${index}`)}
                        draggedCardId={draggedCardId}
                    />
                ))}
            </div>

            <DragOverlay dropAnimation={null}>
                {activeCards.length > 0 ? (
                    <div className="drag-stack">
                        {activeCards.map((card, index) => (
                            <div
                                key={card.id}
                                style={{
                                    marginTop: index === 0 ? 0 : -80,
                                    position: 'relative',
                                }}
                            >
                                <StaticCard card={card} />
                            </div>
                        ))}
                    </div>
                ) : null}
            </DragOverlay>
        </div>
    );
}

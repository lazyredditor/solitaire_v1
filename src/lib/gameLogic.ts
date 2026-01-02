import { createSeededRandom } from './random';

export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

export interface Card {
    id: string;
    suit: Suit;
    rank: Rank;
    faceUp: boolean;
}

export interface GameState {
    stock: Card[];
    waste: Card[];
    foundations: Card[][]; // 4 foundation piles
    tableau: Card[][]; // 7 tableau piles
    score: number;
    moves: number;
    seed: string;
}

const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
const RANKS: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

export function getSuitSymbol(suit: Suit): string {
    switch (suit) {
        case 'hearts': return '♥';
        case 'diamonds': return '♦';
        case 'clubs': return '♣';
        case 'spades': return '♠';
    }
}

export function getSuitColor(suit: Suit): 'red' | 'black' {
    return suit === 'hearts' || suit === 'diamonds' ? 'red' : 'black';
}

export function getRankValue(rank: Rank): number {
    const index = RANKS.indexOf(rank);
    return index + 1;
}

export function createDeck(): Card[] {
    const deck: Card[] = [];
    for (const suit of SUITS) {
        for (const rank of RANKS) {
            deck.push({
                id: `${rank}-${suit}`,
                suit,
                rank,
                faceUp: false,
            });
        }
    }
    return deck;
}

export function shuffleDeck(deck: Card[], seed: string): Card[] {
    const random = createSeededRandom(seed);
    const shuffled = [...deck];

    // Fisher-Yates shuffle
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled;
}

export function initializeGame(seed: string): GameState {
    const deck = shuffleDeck(createDeck(), seed);

    // Deal to tableau
    const tableau: Card[][] = [[], [], [], [], [], [], []];
    let cardIndex = 0;

    for (let col = 0; col < 7; col++) {
        for (let row = col; row < 7; row++) {
            const card = { ...deck[cardIndex] };
            card.faceUp = row === col; // Top card is face up
            tableau[row].push(card);
            cardIndex++;
        }
    }

    // Remaining cards go to stock
    const stock = deck.slice(cardIndex).map(card => ({ ...card, faceUp: false }));

    return {
        stock,
        waste: [],
        foundations: [[], [], [], []],
        tableau,
        score: 0,
        moves: 0,
        seed,
    };
}

export function canPlaceOnFoundation(card: Card, foundation: Card[]): boolean {
    if (foundation.length === 0) {
        return card.rank === 'A';
    }

    const topCard = foundation[foundation.length - 1];
    return (
        card.suit === topCard.suit &&
        getRankValue(card.rank) === getRankValue(topCard.rank) + 1
    );
}

export function canPlaceOnTableau(card: Card, pile: Card[]): boolean {
    if (pile.length === 0) {
        return card.rank === 'K';
    }

    const topCard = pile[pile.length - 1];
    if (!topCard.faceUp) return false;

    const cardColor = getSuitColor(card.suit);
    const topColor = getSuitColor(topCard.suit);

    return (
        cardColor !== topColor &&
        getRankValue(card.rank) === getRankValue(topCard.rank) - 1
    );
}

export function isGameWon(state: GameState): boolean {
    return state.foundations.every(foundation => foundation.length === 13);
}

export function drawFromStock(state: GameState): GameState {
    const newState = { ...state };

    if (state.stock.length === 0) {
        // Flip waste pile back to stock
        newState.stock = state.waste.reverse().map(card => ({ ...card, faceUp: false }));
        newState.waste = [];
    } else {
        // Draw one card
        const card = { ...state.stock[state.stock.length - 1], faceUp: true };
        newState.stock = state.stock.slice(0, -1);
        newState.waste = [...state.waste, card];
        newState.moves = state.moves + 1;
    }

    return newState;
}

export interface MoveResult {
    success: boolean;
    state: GameState;
    pointsEarned: number;
}

export function moveCardToFoundation(
    state: GameState,
    cardId: string,
    fromLocation: { type: 'tableau' | 'waste'; pileIndex?: number },
    foundationIndex: number
): MoveResult {
    const foundation = state.foundations[foundationIndex];
    let card: Card | undefined;
    let newState = { ...state };

    if (fromLocation.type === 'waste') {
        if (state.waste.length === 0) return { success: false, state, pointsEarned: 0 };
        card = state.waste[state.waste.length - 1];
        if (card.id !== cardId) return { success: false, state, pointsEarned: 0 };

        if (!canPlaceOnFoundation(card, foundation)) {
            return { success: false, state, pointsEarned: 0 };
        }

        newState.waste = state.waste.slice(0, -1);
        newState.foundations = [...state.foundations];
        newState.foundations[foundationIndex] = [...foundation, { ...card, faceUp: true }];
        newState.moves = state.moves + 1;
        newState.score = state.score + 10;

        return { success: true, state: newState, pointsEarned: 10 };
    }

    if (fromLocation.type === 'tableau' && fromLocation.pileIndex !== undefined) {
        const pile = state.tableau[fromLocation.pileIndex];
        const cardIndex = pile.findIndex(c => c.id === cardId);

        if (cardIndex === -1 || cardIndex !== pile.length - 1) {
            return { success: false, state, pointsEarned: 0 };
        }

        card = pile[cardIndex];

        if (!canPlaceOnFoundation(card, foundation)) {
            return { success: false, state, pointsEarned: 0 };
        }

        newState.tableau = [...state.tableau];
        const newPile = pile.slice(0, -1);

        // Flip the new top card if needed
        if (newPile.length > 0 && !newPile[newPile.length - 1].faceUp) {
            newPile[newPile.length - 1] = { ...newPile[newPile.length - 1], faceUp: true };
            newState.score = state.score + 15; // Bonus for revealing card
        } else {
            newState.score = state.score + 10;
        }

        newState.tableau[fromLocation.pileIndex] = newPile;
        newState.foundations = [...state.foundations];
        newState.foundations[foundationIndex] = [...foundation, { ...card, faceUp: true }];
        newState.moves = state.moves + 1;

        return { success: true, state: newState, pointsEarned: newState.score - state.score };
    }

    return { success: false, state, pointsEarned: 0 };
}

export function moveCardsToTableau(
    state: GameState,
    cardId: string,
    fromLocation: { type: 'tableau' | 'waste'; pileIndex?: number },
    toTableauIndex: number
): MoveResult {
    const targetPile = state.tableau[toTableauIndex];
    let newState = { ...state };

    if (fromLocation.type === 'waste') {
        if (state.waste.length === 0) return { success: false, state, pointsEarned: 0 };
        const card = state.waste[state.waste.length - 1];
        if (card.id !== cardId) return { success: false, state, pointsEarned: 0 };

        if (!canPlaceOnTableau(card, targetPile)) {
            return { success: false, state, pointsEarned: 0 };
        }

        newState.waste = state.waste.slice(0, -1);
        newState.tableau = [...state.tableau];
        newState.tableau[toTableauIndex] = [...targetPile, { ...card, faceUp: true }];
        newState.moves = state.moves + 1;
        newState.score = state.score + 5;

        return { success: true, state: newState, pointsEarned: 5 };
    }

    if (fromLocation.type === 'tableau' && fromLocation.pileIndex !== undefined) {
        if (fromLocation.pileIndex === toTableauIndex) {
            return { success: false, state, pointsEarned: 0 };
        }

        const sourcePile = state.tableau[fromLocation.pileIndex];
        const cardIndex = sourcePile.findIndex(c => c.id === cardId);

        if (cardIndex === -1 || !sourcePile[cardIndex].faceUp) {
            return { success: false, state, pointsEarned: 0 };
        }

        const cardsToMove = sourcePile.slice(cardIndex);
        const firstCard = cardsToMove[0];

        if (!canPlaceOnTableau(firstCard, targetPile)) {
            return { success: false, state, pointsEarned: 0 };
        }

        newState.tableau = [...state.tableau];
        const newSourcePile = sourcePile.slice(0, cardIndex);
        let pointsEarned = 0;

        // Flip the new top card if needed
        if (newSourcePile.length > 0 && !newSourcePile[newSourcePile.length - 1].faceUp) {
            newSourcePile[newSourcePile.length - 1] = {
                ...newSourcePile[newSourcePile.length - 1],
                faceUp: true
            };
            pointsEarned = 5; // Bonus for revealing card
        }

        newState.tableau[fromLocation.pileIndex] = newSourcePile;
        newState.tableau[toTableauIndex] = [...targetPile, ...cardsToMove];
        newState.moves = state.moves + 1;
        newState.score = state.score + pointsEarned;

        return { success: true, state: newState, pointsEarned };
    }

    return { success: false, state, pointsEarned: 0 };
}

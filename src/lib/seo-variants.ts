export interface SolitaireVariant {
    slug: string;
    title: string; // SEO Title
    description: string; // SEO Description
    h1: string; // Page H1
    config: {
        layout?: 'standard' | 'left-handed';
        cardScale?: number;
        gameMode?: 'standard' | 'time-limit';
        theme?: 'classic' | 'modern';
    };
    content?: {
        intro: string; // Text to show above the game or at the top of content
        features: string[]; // List of specific features for this variant
    };
}

export const SOLITAIRE_VARIANTS: Record<string, SolitaireVariant> = {
    'for-seniors': {
        slug: 'for-seniors',
        title: 'Solitaire for Seniors - Large Cards & Easy to Read',
        description: 'Play Solitaire with extra large cards and high contrast. Perfect for seniors or those with visual impairments. Free and ad-free.',
        h1: 'Large Card Solitaire for Seniors',
        config: {
            cardScale: 1.3,
            theme: 'classic'
        },
        content: {
            intro: "Enjoy a relaxing game of Klondike Solitaire designed specifically for visibility. We've increased the card size by 50% and ensured high contrast for a strain-free experience.",
            features: [
                "Extra Large Cards (50% bigger)",
                "High Contrast Design",
                "Simple, Classic Interface",
                "No Distracting Animations"
            ]
        }
    },
    'left-handed': {
        slug: 'left-handed',
        title: 'Left-Handed Solitaire - Reversed Layout',
        description: 'Play Solitaire with a layout optimized for left-handed users. The deck and foundations are reversed for natural play.',
        h1: 'Left-Handed Klondike Solitaire',
        config: {
            layout: 'left-handed'
        },
        content: {
            intro: "Finally, a Solitaire game that feels right. Our Left-Handed mode mirrors the board, placing the stock and waste on the left side for a more natural drag-and-drop experience for lefties.",
            features: [
                "Reversed Board Layout",
                "Optimized for Left-Handed Mouse Use",
                "Same Classic Rules",
                "Works on Touch Screens"
            ]
        }
    },
    'night-mode': {
        slug: 'night-mode',
        title: 'Dark Mode Solitaire - Easy on the Eyes',
        description: 'Play Solitaire in Night Mode. A modern dark theme that reduces eye strain for late-night gaming sessions.',
        h1: 'Dark Mode Solitaire',
        config: {
            theme: 'modern'
        },
        content: {
            intro: "Wind down with our Dark Mode Solitaire. Featuring a sleek, dark color palette designed to minimize blue light and reduce eye strain during evening play.",
            features: [
                "Sleek Dark Interface",
                "Reduced Eye Strain",
                "Modern Card Design",
                "Perfect for Low Light"
            ]
        }
    },
    'time-limit': {
        slug: 'time-limit',
        title: 'Speed Solitaire - Race Against the Clock',
        description: 'Challenge yourself with Speed Solitaire. How fast can you clear the board? optimizing for speedrunners.',
        h1: 'Speed Run Solitaire',
        config: {
            gameMode: 'time-limit'
        },
        content: {
            intro: "Think you're fast? Test your skills in our Speed Solitaire mode. While the rules are the same, the focus here is on efficiency and speed.",
            features: [
                "Timer Always Visible",
                "Track Your Best Times",
                "Fast Animations",
                "Standard Klondike Rules"
            ]
        }
    }
};

export function getVariant(slug: string): SolitaireVariant | undefined {
    return SOLITAIRE_VARIANTS[slug];
}

export function getAllVariantSlugs(): string[] {
    return Object.keys(SOLITAIRE_VARIANTS);
}

import React from 'react';

interface GameContentProps {
    titleOverride?: string;
    introOverride?: string;
    featuresOverride?: string[];
}

export const GameContent: React.FC<GameContentProps> = ({ titleOverride, introOverride, featuresOverride }) => {
    return (
        <section className="seo-content" style={{ maxWidth: '800px', margin: '4rem auto', padding: '0 1rem', color: 'var(--text-secondary)', fontFamily: 'sans-serif', lineHeight: '1.6' }}>
            {/* Variant Specific Content */}
            {(titleOverride || introOverride) && (
                <article style={{ marginBottom: '3rem', padding: '2rem', background: 'var(--bg-panel)', borderRadius: '12px', border: 'var(--border-gold)' }}>
                    {titleOverride && <h1 style={{ color: 'var(--accent-gold)', fontSize: '2.2rem', marginBottom: '1rem', lineHeight: '1.2' }}>{titleOverride}</h1>}
                    {introOverride && <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>{introOverride}</p>}

                    {featuresOverride && featuresOverride.length > 0 && (
                        <div style={{ marginTop: '1.5rem' }}>
                            <h3 style={{ color: 'var(--text-primary)', fontSize: '1.2rem', marginBottom: '0.8rem' }}>Key Features</h3>
                            <ul style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', listStyle: 'none', padding: 0 }}>
                                {featuresOverride.map((feature, index) => (
                                    <li key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <span style={{ color: 'var(--accent-gold)' }}>✓</span> {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </article>
            )}

            <article style={{ marginBottom: '3rem' }}>
                <h2 style={{ color: 'var(--text-primary)', fontSize: '1.8rem', marginBottom: '1rem' }}>How to Play Klondike Solitaire: The Rules</h2>
                <p>
                    Klondike Solitaire is played with a standard 52-card deck. The goal is to move all cards to the four foundation piles at the top right, sorted by suit from Ace to King.
                </p>
                <h3 style={{ color: 'var(--text-primary)', fontSize: '1.4rem', marginTop: '1.5rem', marginBottom: '0.5rem' }}>Setup</h3>
                <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem', marginBottom: '1rem' }}>
                    <li><strong>The Tableau:</strong> Seven piles of cards make up the main table. The first pile has one card, the second has two, and so on, up to seven. Only the top card of each pile is face up.</li>
                    <li><strong>The Stock:</strong> The remaining cards form the stock pile at the top left, face down.</li>
                    <li><strong>The Waste:</strong> Cards drawn from the stock are placed face up in the waste pile.</li>
                    <li><strong>The Foundations:</strong> Four empty piles at the top right where you build your winning sequences.</li>
                </ul>
                <h3 style={{ color: 'var(--text-primary)', fontSize: '1.4rem', marginTop: '1.5rem', marginBottom: '0.5rem' }}>Moves</h3>
                <p>
                    You can move cards between tableau piles if they are in descending order and alternating colors (e.g., a Red 6 on a Black 7).
                    Kings are the only cards that can be placed in an empty tableau spot.
                    Draw cards from the stock when you run out of moves.
                </p>
            </article>

            <article style={{ marginBottom: '3rem' }}>
                <h2 style={{ color: 'var(--text-primary)', fontSize: '1.8rem', marginBottom: '1rem' }}>Strategy: How to Win at Klondike in 5 Steps</h2>
                <ol style={{ listStyleType: 'decimal', paddingLeft: '1.5rem' }}>
                    <li style={{ marginBottom: '0.5rem' }}><strong>Always Reveal Hidden Cards:</strong> Your priority is to turn over face-down cards in the tableau. Prioritize moves that reveal them.</li>
                    <li style={{ marginBottom: '0.5rem' }}><strong>Empty Piles are for Kings:</strong> Don't clear a spot unless you have a King ready to fill it, or you need to smooth out a pile.</li>
                    <li style={{ marginBottom: '0.5rem' }}><strong>Check the Stock First:</strong> Before making complex tableau moves, flip a card from the stock. It might open up new opportunities.</li>
                    <li style={{ marginBottom: '0.5rem' }}><strong>Don't Rush the Foundations:</strong> Moving cards to the foundation too early can get you stuck. Keep them in play if you might need them to maneuver other cards.</li>
                    <li style={{ marginBottom: '0.5rem' }}><strong>Color Management:</strong> Try to keep only one color of King sequences open if possible, but more importantly, think a few steps ahead about alternating colors.</li>
                </ol>
            </article>

            <article style={{ marginBottom: '3rem' }}>
                <h2 style={{ color: 'var(--text-primary)', fontSize: '1.8rem', marginBottom: '1rem' }}>A Brief History of Solitaire</h2>
                <p>
                    Solitaire, also known as "Patience" in Europe, has roots dating back to the 18th century. It became a global phenomenon with the rise of personal computers, famously included in Microsoft Windows to teach users how to use a mouse (drag and drop).
                    The "Klondike" variation is named after the Canadian region famous for the Gold Rush, suggesting that winning the game is as rare and rewarding as striking gold.
                </p>
            </article>

            <article>
                <h2 style={{ color: 'var(--text-primary)', fontSize: '1.8rem', marginBottom: '1rem' }}>Frequently Asked Questions</h2>
                <div style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ color: 'var(--text-primary)', fontSize: '1.2rem', marginBottom: '0.5rem' }}>Is every Solitaire game winnable?</h3>
                    <p>No. In strict Klondike rules, only about 80% of games are theoretically winnable, and even fewer are won by human players.</p>
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ color: 'var(--text-primary)', fontSize: '1.2rem', marginBottom: '0.5rem' }}>What is the difference between Draw 1 and Draw 3?</h3>
                    <p>Draw 1 is easier because you see every card in the stock eventually. Draw 3 is the classic, harder difficulty where you only access every third card each pass.</p>
                </div>
                <div>
                    <h3 style={{ color: 'var(--text-primary)', fontSize: '1.2rem', marginBottom: '0.5rem' }}>Is this Solitaire specific for Mac or Windows?</h3>
                    <p>This is a Progressive Web App (PWA) Solitaire, meaning it runs directly in your browser on any device—Mac, Windows, iOS, or Android—without needing a download.</p>
                </div>
            </article>
        </section>
    );
};

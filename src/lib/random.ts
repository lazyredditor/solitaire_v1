import seedrandom from 'seedrandom';

export function createSeededRandom(seed: string): () => number {
  const rng = seedrandom(seed);
  return () => rng();
}

export function generateRandomSeed(): string {
  return Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
}

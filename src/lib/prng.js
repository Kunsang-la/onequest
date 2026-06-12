// A simple Mulberry32 seeded PRNG
// Returns a random number between 0 and 1 based on the seed
export function seededRandom(seed) {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
}

// Convert a string (like UserID + Date) into a numeric seed
export function stringToSeed(str) {
    let h = 1779033703 ^ str.length;
    for (let i = 0; i < str.length; i++) {
        h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
        h = h << 13 | h >>> 19;
    }
    return h;
}

// Shuffle an array deterministically
export function deterministicShuffle(array, seedStr) {
    let seed = stringToSeed(seedStr);
    let shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const rand = seededRandom(seed++);
        const j = Math.floor(rand * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

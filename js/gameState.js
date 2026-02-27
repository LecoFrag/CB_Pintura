// ============================================================
// gameState.js — Central game state management
// ============================================================

/** The central game state object */
const gameState = {
    // Configuration from the setup form
    config: {
        maxCapacity: 0,
        exhibitionDays: 0,
        paintingDays: 0,
        paintingBase: 0,
        divulgationLevel: 1,
        galleryFee: 15
    },

    // Current phase: 'setup' | 'painting' | 'gallery' | 'results'
    phase: 'setup',

    // Painting phase state
    currentPaintingDay: 0,
    paintingsPerDay: 1,        // 1 or 2
    paintingsDoneToday: 0,
    penaltyActive: false,

    // Created paintings
    paintings: [],

    // Sold paintings
    soldPaintings: [],

    // Remaining inspirations (IDs not yet used)
    remainingInspirations: [],

    // Used phrase indices per category to avoid repeats
    usedPhrases: {},

    // Gallery phase state
    currentGalleryDay: 0,
    currentHour: 10,
    dailyVisitors: [],
    dailySales: [],
    dailyRevenue: 0,

    // Overall stats
    stats: {
        totalVisitors: 0,
        visitorsByTier: { A: 0, B: 0, C: 0, D: 0, E: 0 },
        totalSales: 0,
        totalGrossRevenue: 0,
        totalFees: 0,
        totalNetRevenue: 0
    }
};

/**
 * Initialize game state from config form values.
 * Resets all progress.
 */
function initGameState(config) {
    gameState.config = { ...config };
    gameState.phase = 'painting';
    gameState.currentPaintingDay = 0;
    gameState.paintingsPerDay = 1;
    gameState.paintingsDoneToday = 0;
    gameState.penaltyActive = false;
    gameState.paintings = [];
    gameState.soldPaintings = [];
    gameState.currentGalleryDay = 0;
    gameState.currentHour = 10;
    gameState.dailyVisitors = [];
    gameState.dailySales = [];
    gameState.dailyRevenue = 0;

    // Shuffle all 19 inspiration IDs
    gameState.remainingInspirations = shuffle(
        PAINTINGS_DATA.map(p => p.id)
    );

    // Reset used phrases
    gameState.usedPhrases = {};
    for (const cat of Object.keys(PHRASES)) {
        gameState.usedPhrases[cat] = [];
    }

    // Reset stats
    gameState.stats = {
        totalVisitors: 0,
        visitorsByTier: { A: 0, B: 0, C: 0, D: 0, E: 0 },
        totalSales: 0,
        totalGrossRevenue: 0,
        totalFees: 0,
        totalNetRevenue: 0
    };
}

/**
 * Get a random unused phrase for a category.
 * Returns null if all phrases used.
 */
function getUnusedPhrase(category) {
    const allPhrases = PHRASES[category];
    if (!allPhrases) return null;

    const used = gameState.usedPhrases[category] || [];
    const available = allPhrases.filter((_, i) => !used.includes(i));

    if (available.length === 0) return null;

    const chosenIndex = allPhrases.indexOf(
        available[Math.floor(Math.random() * available.length)]
    );
    gameState.usedPhrases[category].push(chosenIndex);
    return allPhrases[chosenIndex];
}

/**
 * Draw N inspiration IDs from remaining pool.
 * Removes them from the pool.
 */
function drawInspirations(count) {
    const drawn = gameState.remainingInspirations.splice(0, count);
    return drawn;
}

/**
 * Return unselected inspirations back to the pool (shuffled back in).
 */
function returnInspirations(ids) {
    gameState.remainingInspirations.push(...ids);
    gameState.remainingInspirations = shuffle(gameState.remainingInspirations);
}

/**
 * Add a completed painting to the collection.
 */
function addPainting(painting) {
    gameState.paintings.push(painting);
}

/**
 * Mark a painting as sold.
 */
function sellPainting(paintingId, salePrice, fee) {
    const painting = gameState.paintings.find(p => p.id === paintingId);
    if (painting) {
        painting.sold = true;
        painting.salePrice = salePrice;
        painting.fee = fee;
        gameState.soldPaintings.push(painting);
        gameState.stats.totalSales++;
        gameState.stats.totalGrossRevenue += salePrice;
        gameState.stats.totalFees += fee;
        gameState.stats.totalNetRevenue += (salePrice - fee);
    }
}

/**
 * Get unsold paintings.
 */
function getUnsoldPaintings() {
    return gameState.paintings.filter(p => !p.sold);
}

/** Fisher-Yates shuffle */
function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

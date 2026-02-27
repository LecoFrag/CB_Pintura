// ============================================================
// painting.js — Painting phase logic
// ============================================================

let currentInspirationIds = [];
let revealedCount = 0;
let onPaintingComplete = null;
let onAllDayPaintingsDone = null;

/**
 * Start a new painting day.
 * @param {number} dayNum — 1-indexed day number
 * @param {Function} onComplete — callback when a single painting is done
 * @param {Function} onDayDone — callback when all paintings for the day are done
 */
function startPaintingDay(dayNum, onComplete, onDayDone) {
    gameState.currentPaintingDay = dayNum;
    gameState.paintingsDoneToday = 0;
    gameState.penaltyActive = false;
    gameState.paintingsPerDay = 1;
    currentInspirationIds = [];
    revealedCount = 0;
    onPaintingComplete = onComplete;
    onAllDayPaintingsDone = onDayDone;
}

/**
 * Set painting count for the day (1 or 2).
 * If 2, activates penalty.
 */
function setPaintingCount(count) {
    gameState.paintingsPerDay = count;
    gameState.penaltyActive = count === 2;
}

/**
 * Reveal initial 3 inspirations.
 * @returns {Array} Painting data objects for revealed inspirations
 */
function revealInspirations() {
    const count = Math.min(3, gameState.remainingInspirations.length);
    const ids = drawInspirations(count);
    currentInspirationIds = ids;
    revealedCount = ids.length;
    return ids.map(id => PAINTINGS_DATA.find(p => p.id === id));
}

/**
 * Reveal 3 more inspirations ("Pensar Mais").
 * @returns {Array} Additional painting data objects (up to 3 more, total 6)
 */
function revealMoreInspirations() {
    const remaining = 6 - revealedCount;
    const count = Math.min(remaining, 3, gameState.remainingInspirations.length);
    if (count <= 0) return [];

    const ids = drawInspirations(count);
    currentInspirationIds.push(...ids);
    revealedCount += ids.length;
    return ids.map(id => PAINTINGS_DATA.find(p => p.id === id));
}

/**
 * Whether "Pensar Mais" can still be used.
 */
function canRevealMore() {
    return revealedCount < 6 && gameState.remainingInspirations.length > 0;
}

/**
 * Select an inspiration and execute the roll.
 * Returns the completed painting object.
 *
 * @param {number} inspirationId — ID of the chosen painting
 * @returns {object} The completed painting with roll details and quality
 */
function selectInspiration(inspirationId) {
    // Remove chosen from current set
    const chosenIndex = currentInspirationIds.indexOf(inspirationId);
    if (chosenIndex !== -1) {
        currentInspirationIds.splice(chosenIndex, 1);
    }

    // Return unchosen inspirations back to pool
    returnInspirations(currentInspirationIds);
    currentInspirationIds = [];

    // Execute the roll
    const rollResult = performRoll(
        gameState.config.paintingBase,
        gameState.penaltyActive
    );

    // Get quality
    const quality = getQualityCategory(rollResult.finalResult);

    // Find painting data
    const paintingData = PAINTINGS_DATA.find(p => p.id === inspirationId);

    // Construct painting object
    const painting = {
        id: inspirationId,
        name: paintingData.name,
        inspiration: paintingData.inspiration,
        image: paintingData.image,
        rollResult: rollResult,
        category: quality.category,
        maxValue: quality.maxValue,
        sealClass: quality.sealClass,
        emoji: quality.emoji,
        sold: false,
        salePrice: 0,
        fee: 0,
        dayCreated: gameState.currentPaintingDay
    };

    // Add to collection
    addPainting(painting);

    // Track progress
    gameState.paintingsDoneToday++;

    return painting;
}

/**
 * Whether the day's painting quota is met.
 */
function isDayComplete() {
    return gameState.paintingsDoneToday >= gameState.paintingsPerDay;
}

/**
 * Whether there are more painting days available.
 */
function hasMorePaintingDays() {
    return gameState.currentPaintingDay < gameState.config.paintingDays;
}

/**
 * Get count of remaining inspirations in the pool.
 */
function getRemainingInspirationsCount() {
    return gameState.remainingInspirations.length;
}

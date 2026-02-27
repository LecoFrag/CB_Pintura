// ============================================================
// gallery.js — Gallery / Exhibition phase logic
// ============================================================

/**
 * Initialize a gallery exhibition day.
 * @param {number} dayNum — 1-indexed day number
 */
function startGalleryDay(dayNum) {
    gameState.currentGalleryDay = dayNum;
    gameState.currentHour = 10;
    gameState.dailyVisitors = [];
    gameState.dailySales = [];
    gameState.dailyRevenue = 0;
}

/**
 * Generate all visitors for the day.
 * Assigns each a random arrival minute (0–479 = 10:00–17:59).
 * Sorts by arrival minute for sequential processing.
 * @returns {Array} Array of visitor objects sorted by arrival
 */
function generateDailyVisitors() {
    const divLevel = gameState.config.divulgationLevel;
    const percentage = DIVULGATION_LEVELS[divLevel] || 0.30;
    const totalPeople = Math.floor(gameState.config.maxCapacity * percentage);
    const dayNum = gameState.currentGalleryDay;

    const visitors = [];

    for (const tierConfig of TIER_CONFIG) {
        const count = Math.round(totalPeople * tierConfig.percentPublic);
        for (let i = 0; i < count; i++) {
            visitors.push({
                id: `v${dayNum}_${visitors.length}`,
                tier: tierConfig.tier,
                bidChance: tierConfig.bidChance,
                bidMin: tierConfig.bidMin,
                bidMax: tierConfig.bidMax,
                color: tierConfig.color,
                hasBid: false,
                checked: false,
                arrivalMinute: Math.floor(Math.random() * 480) // 0–479 (maps to 10:00–17:59)
            });
        }
    }

    // Sort by arrival time for sequential processing
    visitors.sort((a, b) => a.arrivalMinute - b.arrivalMinute);

    gameState.dailyVisitors = visitors;
    gameState.stats.totalVisitors += visitors.length;

    // Track by tier
    for (const v of visitors) {
        gameState.stats.visitorsByTier[v.tier] = (gameState.stats.visitorsByTier[v.tier] || 0) + 1;
    }

    return visitors;
}

/**
 * Process all unchecked visitors who have arrived up to the given game minute.
 * Returns array of bid events (if any).
 * @param {number} gameMinute — 0–479 representing minutes since 10:00
 * @returns {Array} bid events
 */
function processVisitorsUpTo(gameMinute) {
    const bidEvents = [];
    const unsold = getUnsoldPaintings();

    if (unsold.length === 0) return bidEvents;

    for (const visitor of gameState.dailyVisitors) {
        if (visitor.checked) continue;
        if (visitor.arrivalMinute > gameMinute) break; // sorted, so no more arrivals

        visitor.checked = true;

        // Check if this visitor wants to place a bid
        if (Math.random() < visitor.bidChance) {
            visitor.hasBid = true;

            // Select random unsold painting
            const painting = unsold[Math.floor(Math.random() * unsold.length)];

            // Calculate bid value
            const bidRange = visitor.bidMax - visitor.bidMin;
            const bidPercent = visitor.bidMin + (Math.random() * bidRange);
            const bidValue = Math.round(painting.maxValue * bidPercent);

            // Get phrase for this painting category
            const phrase = getUnusedPhrase(painting.category) || "Uma peça interessante...";

            bidEvents.push({
                visitor,
                painting,
                bidValue,
                phrase,
                gameMinute
            });
        }
    }

    return bidEvents;
}

/**
 * Accept a bid — sell the painting.
 */
function acceptBid(bid) {
    const feePercent = gameState.config.galleryFee / 100;
    const fee = Math.round(bid.bidValue * feePercent);
    sellPainting(bid.painting.id, bid.bidValue, fee);

    gameState.dailySales.push({
        paintingId: bid.painting.id,
        paintingName: bid.painting.name,
        paintingMax: bid.painting.maxValue,
        buyerTier: bid.visitor.tier,
        grossValue: bid.bidValue,
        fee: fee,
        netValue: bid.bidValue - fee
    });

    gameState.dailyRevenue += (bid.bidValue - fee);
}

/**
 * Reject a bid — nothing happens.
 */
function rejectBid(bid) {
    // No action needed — painting stays unsold
}

/**
 * Get the day summary.
 */
function getDaySummary() {
    return {
        day: gameState.currentGalleryDay,
        soldCount: gameState.dailySales.length,
        revenue: gameState.dailyRevenue,
        totalVisitors: gameState.dailyVisitors.length,
        sales: [...gameState.dailySales],
        maxPossibleValue: gameState.dailySales.reduce((sum, s) => sum + s.paintingMax, 0)
    };
}

/**
 * Whether there are more exhibition days.
 */
function hasMoreGalleryDays() {
    return gameState.currentGalleryDay < gameState.config.exhibitionDays;
}

/**
 * Get final game results.
 */
function getFinalResults() {
    const unsold = getUnsoldPaintings();
    const unsoldMaxValue = unsold.reduce((sum, p) => sum + p.maxValue, 0);
    const galleryOffer = Math.round(unsoldMaxValue * 0.25);

    return {
        totalVisitors: gameState.stats.totalVisitors,
        visitorsByTier: { ...gameState.stats.visitorsByTier },
        totalSales: gameState.stats.totalSales,
        grossRevenue: gameState.stats.totalGrossRevenue,
        totalFees: gameState.stats.totalFees,
        netRevenue: gameState.stats.totalNetRevenue,
        unsoldPaintings: unsold,
        unsoldMaxValue: unsoldMaxValue,
        galleryOffer: galleryOffer,
        totalPaintings: gameState.paintings.length
    };
}

/**
 * Sell remaining paintings to gallery at 25% value (no fee).
 */
function sellToGallery() {
    const unsold = getUnsoldPaintings();
    const totalMaxValue = unsold.reduce((sum, p) => sum + p.maxValue, 0);
    const salePrice = Math.round(totalMaxValue * 0.25);

    for (const painting of unsold) {
        const paintingShare = Math.round(salePrice * (painting.maxValue / totalMaxValue)) || 0;
        painting.sold = true;
        painting.salePrice = paintingShare;
        painting.fee = 0;
        gameState.soldPaintings.push(painting);
    }

    gameState.stats.totalSales += unsold.length;
    gameState.stats.totalGrossRevenue += salePrice;
    gameState.stats.totalNetRevenue += salePrice;

    return salePrice;
}

/**
 * Get tier distribution for current day's visitors.
 */
function getTierDistribution() {
    const dist = { A: 0, B: 0, C: 0, D: 0, E: 0 };
    for (const v of gameState.dailyVisitors) {
        dist[v.tier]++;
    }
    return dist;
}

/**
 * Get count of visitors who have arrived up to a given game minute.
 * @param {number} gameMinute — 0–479
 */
function getArrivedVisitorCount(gameMinute) {
    return gameState.dailyVisitors.filter(v => v.arrivalMinute <= gameMinute).length;
}

/**
 * Get tier distribution only for visitors who have arrived up to a given game minute.
 * @param {number} gameMinute — 0–479
 */
function getArrivedTierDistribution(gameMinute) {
    const dist = { A: 0, B: 0, C: 0, D: 0, E: 0 };
    for (const v of gameState.dailyVisitors) {
        if (v.arrivalMinute <= gameMinute) {
            dist[v.tier]++;
        }
    }
    return dist;
}

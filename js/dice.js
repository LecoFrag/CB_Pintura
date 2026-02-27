// ============================================================
// dice.js — d10 rolling system with critical hits
// ============================================================

/**
 * Roll a single d10 (1–10).
 */
function rollD10() {
    return Math.floor(Math.random() * 10) + 1;
}

/**
 * Perform a full painting roll.
 *
 * @param {number} basePintura - The painting base value
 * @param {boolean} hasPenalty  - Whether the -5 penalty is active
 * @returns {object} Roll result details
 */
function performRoll(basePintura, hasPenalty) {
    const dice1 = rollD10();
    let dice2 = null;
    let criticalType = null; // 'positive' | 'negative' | null

    let result = basePintura + dice1;

    // Critical positive: rolled 10
    if (dice1 === 10) {
        dice2 = rollD10();
        criticalType = 'positive';
        result += dice2;
    }
    // Critical negative: rolled 1
    else if (dice1 === 1) {
        dice2 = rollD10();
        criticalType = 'negative';
        // Result = base - second die (the first die of 1 is irrelevant in this path)
        result = basePintura - dice2;
    }

    // Apply penalty
    const penalty = hasPenalty ? -5 : 0;
    result += penalty;

    // Ensure minimum 0
    result = Math.max(0, result);

    return {
        basePintura,
        dice1,
        dice2,
        criticalType,
        penalty,
        finalResult: result
    };
}

/**
 * Determine quality category from a roll result.
 *
 * @param {number} result - The final roll result
 * @returns {object} Quality tier entry from QUALITY_TABLE
 */
function getQualityCategory(result) {
    for (const tier of QUALITY_TABLE) {
        if (result >= tier.min && result <= tier.max) {
            return { ...tier };
        }
    }
    // Fallback — should not happen, but safety net
    return QUALITY_TABLE[QUALITY_TABLE.length - 1];
}

// ============================================================
// main.js — Entry point & game flow controller
// ============================================================

function init() {
    cacheDom();
    initImageModal();
    renderConfigScreen(handleStartGame);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// ── GAME START ────────────────────────────────────────────
function handleStartGame(config) {
    initGameState(config);
    startNextPaintingDay();
}

// ── PAINTING PHASE ────────────────────────────────────────
function startNextPaintingDay() {
    const day = gameState.currentPaintingDay + 1;

    if (day > gameState.config.paintingDays) {
        // All painting days done → transition to gallery
        renderTimeline('painting', gameState.config.paintingDays, gameState.config.paintingDays);
        renderPhaseTransition('painting', 'gallery', () => {
            gameState.phase = 'gallery';
            startNextGalleryDay();
        });
        return;
    }

    startPaintingDay(day);
    renderTimeline('painting', day, gameState.config.paintingDays);
    renderPaintingDayChoice(day, handlePaintingCountChoice);
    renderArtistStatusPainting();
    renderPaintingRightPanel();
}

function handlePaintingCountChoice(count) {
    setPaintingCount(count);
    renderArtistStatusPainting();
    showInspirationSelection();
}

// All currently visible inspirations
let allVisibleInspirations = [];

function showInspirationSelection() {
    const initial = revealInspirations();
    allVisibleInspirations = [...initial];

    renderInspirations(
        allVisibleInspirations,
        canRevealMore(),
        handleInspirationSelect,
        handleThinkMore
    );
}

function handleThinkMore() {
    const more = revealMoreInspirations();
    allVisibleInspirations = [...allVisibleInspirations, ...more];

    renderInspirations(
        allVisibleInspirations,
        canRevealMore(),
        handleInspirationSelect,
        handleThinkMore
    );
}

function handleInspirationSelect(inspirationId) {
    const painting = selectInspiration(inspirationId);

    renderDiceRoll(painting.rollResult, painting, () => {
        renderArtistStatusPainting();
        renderPaintingRightPanel();

        if (isDayComplete()) {
            // Day done — next day or phase transition
            startNextPaintingDay();
        } else {
            // Second painting of the day
            allVisibleInspirations = [];
            showInspirationSelection();
        }
    });
}

// ── GALLERY PHASE — Real-time 20s simulation ──────────────
const GALLERY_DAY_DURATION_MS = 20000;  // 20 seconds real time
const GALLERY_GAME_MINUTES = 480;       // 8 hours × 60 min (10:00–18:00)
const TICK_INTERVAL_MS = 500;           // update every 500ms

let galleryTimerId = null;
let galleryStartTime = 0;
let galleryPausedAt = 0;
let galleryTotalPausedMs = 0;
let pendingBids = [];

function startNextGalleryDay() {
    const day = gameState.currentGalleryDay + 1;

    if (day > gameState.config.exhibitionDays) {
        // All exhibition days done → show results
        showFinalResultsScreen();
        return;
    }

    startGalleryDay(day);
    generateDailyVisitors();
    renderTimeline('gallery', day, gameState.config.exhibitionDays);

    // Initial full render (only once per day)
    renderGalleryView(10, 0, 0, () => {
        // Start real-time simulation
        galleryStartTime = Date.now();
        galleryTotalPausedMs = 0;
        galleryPausedAt = 0;

        // Start tick interval (lightweight updates only)
        galleryTimerId = setInterval(updateGalleryTick, TICK_INTERVAL_MS);
    });
    renderVisitorPanel(getTierDistribution(), 0, gameState.config.maxCapacity);
    renderArtistStatusGallery();
}

function updateGalleryTick() {
    const elapsed = Date.now() - galleryStartTime - galleryTotalPausedMs;
    const progress = Math.min(elapsed / GALLERY_DAY_DURATION_MS, 1.0);
    const gameMinuteRaw = Math.floor(progress * GALLERY_GAME_MINUTES);
    const gameMinute = Math.min(gameMinuteRaw, GALLERY_GAME_MINUTES - 1);
    const displayHour = 10 + Math.floor(gameMinute / 60);
    const displayMin = gameMinute % 60;

    // Count arrived visitors
    const arrivedCount = getArrivedVisitorCount(gameMinute);

    // Lightweight updates only — no DOM rebuild
    updateGalleryClock(displayHour, displayMin, progress);
    updateVisitorCount(arrivedCount);

    // Process visitors and check for bids
    const bids = processVisitorsUpTo(gameMinute);

    if (bids.length > 0) {
        // Pause the timer
        pauseGalleryTimer();
        pendingBids = [...bids];
        processNextBid();
        return;
    }

    // Check if day is over OR all paintings are sold
    const allSold = gameState.paintings.every(p => p.sold);

    if (progress >= 1.0 || (allSold && pendingBids.length === 0)) {
        clearInterval(galleryTimerId);
        galleryTimerId = null;
        if (allSold) {
            // End the game instantly
            showFinalResultsScreen();
        } else {
            endGalleryDay();
        }
    }
}

function pauseGalleryTimer() {
    if (galleryTimerId) {
        clearInterval(galleryTimerId);
        galleryTimerId = null;
    }
    galleryPausedAt = Date.now();
}

function resumeGalleryTimer() {
    if (galleryPausedAt > 0) {
        galleryTotalPausedMs += Date.now() - galleryPausedAt;
        galleryPausedAt = 0;
    }
    galleryTimerId = setInterval(updateGalleryTick, TICK_INTERVAL_MS);
    updateGalleryTick(); // immediate update
}

function processNextBid() {
    if (pendingBids.length === 0) {
        // All bids processed — resume timer
        resumeGalleryTimer();
        return;
    }

    const bid = pendingBids.shift();

    showBidPopup(
        bid,
        () => {
            // Accept
            acceptBid(bid);
            updateArtistFinancials();
            markSoldPaintingOnWall(bid.painting.id);
            processNextBid();
        },
        () => {
            // Reject
            rejectBid(bid);
            processNextBid();
        }
    );
}

function endGalleryDay() {
    const summary = getDaySummary();

    if (hasMoreGalleryDays()) {
        renderDaySummary(summary, () => startNextGalleryDay());
    } else {
        renderDaySummary(summary, () => showFinalResultsScreen());
    }
}

// ── FINAL RESULTS ─────────────────────────────────────────
function showFinalResultsScreen() {
    gameState.phase = 'results';
    const results = getFinalResults();

    renderFinalResults(
        results,
        () => {
            // Sell to gallery
            const value = sellToGallery();
            renderGameOver(gameState.stats.totalNetRevenue, true, value);
        },
        () => {
            // Don't sell
            renderGameOver(gameState.stats.totalNetRevenue, false, 0);
        }
    );
}

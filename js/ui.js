// ============================================================
// ui.js — All DOM manipulation, rendering and animations
// ============================================================


// ── Cached DOM references ──────────────────────────────────
let $zone = {};

function cacheDom() {
    $zone = {
        top: document.getElementById('zone-top'),
        center: document.getElementById('zone-center'),
        right: document.getElementById('zone-right'),
        bottom: document.getElementById('zone-bottom'),
        overlay: document.getElementById('overlay')
    };
}

// ── Helpers ────────────────────────────────────────────────
function el(tag, cls, html) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html !== undefined) e.innerHTML = html;
    return e;
}

function clearZone(zone) {
    zone.innerHTML = '';
}

function formatCurrency(val) {
    return val.toLocaleString('pt-BR') + ' eb';
}

function setPhase(phaseClass) {
    document.body.className = phaseClass;
    const bgVideo = document.getElementById('painting-bg-video');
    if (bgVideo) {
        if (phaseClass === 'phase-painting') {
            bgVideo.play().catch(e => console.log('Video autoplay:', e));
        } else {
            bgVideo.pause();
        }
    }
    const resultsVideo = document.getElementById('results-bg-video');
    if (resultsVideo) {
        if (phaseClass === 'phase-results') {
            resultsVideo.play().catch(e => console.log('Results video autoplay:', e));
        } else {
            resultsVideo.pause();
        }
    }
    const bgImg = document.getElementById('gallery-bg-image');
    if (bgImg) {
        bgImg.style.display = (phaseClass === 'phase-gallery') ? 'block' : 'none';
    }
    // Start music on first non-setup phase (plays for the rest of the game)
    if (phaseClass !== 'phase-setup') {
        const music = document.getElementById('bg-music');
        if (music && music.paused) {
            music.volume = 0.5;
            music.play().catch(e => console.log('Music autoplay:', e));
        }
    }
}


// ── MUTE BUTTON + VOLUME SLIDER ─────────────────────────────
function initMuteButton() {
    const btn = document.getElementById('btn-mute');
    const music = document.getElementById('bg-music');
    const slider = document.getElementById('volume-slider');
    if (!btn || !music) return;

    // Mute toggle
    btn.addEventListener('click', () => {
        music.muted = !music.muted;
        btn.textContent = music.muted ? '🔇' : '🔊';
        btn.classList.toggle('muted', music.muted);
    });

    // Volume slider
    if (slider) {
        slider.addEventListener('input', () => {
            music.volume = parseFloat(slider.value);
            music.muted = (slider.value == 0);
            btn.textContent = (slider.value == 0) ? '🔇' : '🔊';
            btn.classList.toggle('muted', slider.value == 0);
        });
    }
}

// ── IMAGE MODAL ──────────────────────────────────────
function initImageModal() {
    // Create modal element once
    const modal = document.createElement('div');
    modal.id = 'painting-modal';
    modal.className = 'painting-modal';
    modal.innerHTML = `
        <div class="painting-modal-backdrop"></div>
        <div class="painting-modal-content">
            <img id="painting-modal-img" src="" alt="">
            <div class="painting-modal-info">
                <h2 id="painting-modal-title"></h2>
                <p id="painting-modal-category" class="painting-modal-cat"></p>
                <p id="painting-modal-value"></p>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    // Close on backdrop or Escape
    modal.querySelector('.painting-modal-backdrop').addEventListener('click', () => closeModal());
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

    // Delegate click to all .zoomable-painting images in the whole document
    document.addEventListener('click', e => {
        const img = e.target.closest('.zoomable-painting');
        if (!img) return;
        openModal(img.src, img.dataset.name || '', img.dataset.value || '', img.dataset.category || '');
    });
}

function openModal(src, name, value, category) {
    const modal = document.getElementById('painting-modal');
    if (!modal) return;
    document.getElementById('painting-modal-img').src = src;
    document.getElementById('painting-modal-title').textContent = name;
    const catEl = document.getElementById('painting-modal-category');
    if (catEl) catEl.textContent = category || '';
    document.getElementById('painting-modal-value').textContent = value ? `Valor máximo: ${value}` : '';
    modal.classList.add('active');
}

function closeModal() {
    const modal = document.getElementById('painting-modal');
    if (modal) modal.classList.remove('active');
}

// ── CONFIG SCREEN ──────────────────────────────────────────
function renderConfigScreen(onStart) {
    setPhase('phase-setup');

    clearZone($zone.top);
    clearZone($zone.right);
    clearZone($zone.bottom);

    $zone.top.innerHTML = `
        <div class="top-logo">
            <h1>🎨 Galeria de Arte</h1>
            <p class="subtitle">Simulador de Artista Plástico</p>
        </div>
    `;

    $zone.center.innerHTML = `
        <div class="config-card glass-card">
            <h2>⚙️ Configuração do Jogo</h2>
            <form id="config-form">
                <div class="form-group">
                    <label for="maxCapacity">🏛 Lotação Máxima da Galeria</label>
                    <input type="number" id="maxCapacity" min="10" max="200" value="30" required>
                </div>
                <div class="form-group">
                    <label for="exhibitionDays">📅 Dias de Exposição</label>
                    <input type="number" id="exhibitionDays" min="1" max="10" value="3" required>
                </div>
                <div class="form-group">
                    <label for="paintingDays">🎨 Dias Disponíveis para Pintura</label>
                    <input type="number" id="paintingDays" min="1" max="10" value="5" required>
                </div>
                <div class="form-group">
                    <label for="paintingBase">🖌 Base de Pintura</label>
                    <input type="number" id="paintingBase" min="1" max="30" value="10" required>
                </div>
                <div class="form-group">
                    <label for="divulgationLevel">📢 Nível de Divulgação</label>
                    <select id="divulgationLevel" required>
                        <option value="1">1 — 30% público</option>
                        <option value="2">2 — 40% público</option>
                        <option value="3" selected>3 — 70% público</option>
                        <option value="4">4 — 80% público</option>
                        <option value="5">5 — 100% público</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="galleryFee">🧾 Fee da Galeria (%)</label>
                    <input type="number" id="galleryFee" min="0" max="50" value="15" required>
                </div>
                <button type="submit" class="btn btn-primary btn-lg">
                    🎮 Iniciar Jogo
                </button>
            </form>
        </div>
    `;

    $zone.right.innerHTML = `
        <div class="info-panel glass-card">
            <h3>📖 Como Jogar</h3>
            <ul>
                <li>🎨 <strong>Fase 1:</strong> Pinte obras escolhendo inspirações e rolando dados</li>
                <li>🏛 <strong>Fase 2:</strong> Exponha na galeria e negocie com visitantes</li>
                <li>🎲 Dado d10 + Base de Pintura = Qualidade</li>
                <li>💰 Venda suas obras pelo melhor preço!</li>
            </ul>
        </div>
    `;

    $zone.bottom.innerHTML = `
        <div class="credits-bar">
            <span>🎮 Galeria de Arte — Simulador de Artista Plástico</span>
        </div>
    `;

    document.getElementById('config-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const config = {
            maxCapacity: parseInt(document.getElementById('maxCapacity').value),
            exhibitionDays: parseInt(document.getElementById('exhibitionDays').value),
            paintingDays: parseInt(document.getElementById('paintingDays').value),
            paintingBase: parseInt(document.getElementById('paintingBase').value),
            divulgationLevel: parseInt(document.getElementById('divulgationLevel').value),
            galleryFee: parseInt(document.getElementById('galleryFee').value)
        };
        onStart(config);
    });
}

// ── TIMELINE (TOP ZONE) ───────────────────────────────────
function renderTimeline(phase, currentDay, totalDays) {
    clearZone($zone.top);

    const label = phase === 'painting' ? '🎨 Fase de Pintura' : '🏛 Fase da Galeria';
    const dayLabel = phase === 'painting' ? 'Dia' : 'Exposição';

    let timelineHTML = `<div class="timeline-container">
        <div class="timeline-label">${label}</div>
        <div class="timeline-track">`;

    for (let i = 1; i <= totalDays; i++) {
        const state = i < currentDay ? 'done' : i === currentDay ? 'active' : 'pending';
        timelineHTML += `<div class="timeline-dot ${state}">
            <span class="dot-num">${i}</span>
            <span class="dot-label">${dayLabel} ${i}</span>
        </div>`;
        if (i < totalDays) {
            timelineHTML += `<div class="timeline-line ${i < currentDay ? 'done' : ''}"></div>`;
        }
    }

    timelineHTML += `</div>`;
    const soldCount = gameState.paintings.filter(p => p.sold).length;
    timelineHTML += `
        <div class="timeline-stats">
            <span>🎨 Criados: ${gameState.paintings.length}</span>
            <span>💰 Vendidos: ${soldCount}</span>
            <span>🖼 Restantes: ${gameState.paintings.length - soldCount}</span>
        </div>
    </div>`;

    $zone.top.innerHTML = timelineHTML;
}

// ── PAINTING PHASE: DAY START ─────────────────────────────
function renderPaintingDayChoice(dayNum, onChoice) {
    setPhase('phase-painting');
    clearZone($zone.center);

    const narrative = DAY_NARRATIVES[(dayNum - 1) % DAY_NARRATIVES.length];

    $zone.center.innerHTML = `
        <div class="painting-day-card glass-card fade-in\">
            <div class="day-header">
                <h2>📅 Dia ${dayNum}</h2>
                <p class="day-narrative">${narrative}</p>
            </div>
            <div class="day-choice">
                <h3>Você deseja pintar:</h3>
                <div class="choice-buttons">
                    <button class="btn btn-choice" id="btn-1q">
                        <span class="choice-icon">🖼</span>
                        <span class="choice-text">1 Quadro</span>
                    </button>
                    <button class="btn btn-choice btn-penalty" id="btn-2q">
                        <span class="choice-icon">🖼🖼</span>
                        <span class="choice-text">2 Quadros</span>
                        <span class="penalty-badge">-5 penalidade</span>
                    </button>
                </div>
            </div>
        </div>
        `;

    document.getElementById('btn-1q').addEventListener('click', () => onChoice(1));
    document.getElementById('btn-2q').addEventListener('click', () => onChoice(2));
}

// ── PAINTING PHASE: INSPIRATION CARDS ─────────────────────
function renderInspirations(paintings, canShowMore, onSelect, onShowMore) {
    clearZone($zone.center);

    let html = `<div class="inspirations-container fade-in\">
        <h2>🎨 Escolha sua Inspiração</h2>
        <div class="inspiration-grid">`;

    for (let i = 0; i < paintings.length; i++) {
        const p = paintings[i];
        html += `
            <div class="inspiration-card glass-card" data-id="${p.id}">
                <div class="insp-number">Inspiração ${i + 1}</div>
                <p class="insp-text">${p.inspiration}</p>
                <button class="btn btn-select" data-select="${p.id}">Escolher esta Inspiração</button>
            </div>
        `;
    }

    html += `</div>`;

    if (canShowMore) {
        html += `<button class="btn btn-secondary" id = "btn-think-more\">💭 Pensar Mais</button> `;
    }

    html += `</div> `;
    $zone.center.innerHTML = html;

    // Bind "Escolher" buttons
    $zone.center.querySelectorAll('[data-select]').forEach(btn => {
        btn.addEventListener('click', () => onSelect(parseInt(btn.dataset.select)));
    });

    // Bind "Pensar Mais"
    if (canShowMore) {
        document.getElementById('btn-think-more').addEventListener('click', onShowMore);
    }
}

// ── PAINTING PHASE: DICE ROLL ANIMATION ───────────────────
function renderDiceRoll(rollResult, painting, onContinue) {
    clearZone($zone.center);

    const { basePintura, dice1, dice2, criticalType, penalty, finalResult } = rollResult;

    let critHTML = '';
    if (criticalType === 'positive') {
        critHTML = `<div class="crit crit-positive\">⚡ CRÍTICO POSITIVO! + ${dice2}</div> `;
    } else if (criticalType === 'negative') {
        critHTML = `<div class="crit crit-negative\">💀 CRÍTICO NEGATIVO! - ${dice2}</div> `;
    }

    let penaltyHTML = penalty ? `<div class="roll-detail penalty-detail\">⚠️ Penalidade: ${penalty}</div> ` : '';

    $zone.center.innerHTML = `
        <div class="roll-result-card glass-card fade-in\">
            <h2>🎲 Resultado da Rolagem</h2>
            <div class="dice-animation" id="dice-anim">
                <div class="dice-face" id="dice-display">?</div>
            </div>
            <div class="roll-details" id="roll-details" style="opacity:0">
                <div class="roll-detail">🖌 Base: ${basePintura}</div>
                <div class="roll-detail">🎲 Dado 1: ${dice1}</div>
                ${dice2 !== null ? `<div class="roll-detail">🎲 Dado 2: ${dice2}</div>` : ''}
                ${critHTML}
                ${penaltyHTML}
                <div class="roll-total">
                    <span>Resultado Final:</span>
                    <span class="total-value ${painting.sealClass}">${finalResult}</span>
                </div>
            </div>
            <div id="painting-reveal" style="opacity:0">
                <div class="painting-result">
                    <div class="painting-image-frame">
                        <img src="${painting.image}" alt="${painting.name}"
                             class="zoomable-painting"
                             data-name="${painting.name}"
                             data-value="${formatCurrency(painting.maxValue)}"
                             data-category="${painting.category}">
                        <div class="seal-badge ${painting.sealClass}">${painting.category}</div>
                    </div>
                    <h3>${painting.name}</h3>
                </div>
                <button class="btn btn-primary" id="btn-continue-paint">Continuar ➤</button>
            </div>
        </div>
        `;

    // Dice roll animation
    const diceDisplay = document.getElementById('dice-display');
    let animCount = 0;
    const animInterval = setInterval(() => {
        diceDisplay.textContent = Math.floor(Math.random() * 10) + 1;
        animCount++;
        if (animCount > 15) {
            clearInterval(animInterval);
            diceDisplay.textContent = dice1;
            diceDisplay.classList.add('dice-landed');

            // Show details after a beat
            setTimeout(() => {
                document.getElementById('roll-details').style.opacity = '1';
                document.getElementById('roll-details').classList.add('fade-in');
            }, 400);

            // Show painting after another beat
            setTimeout(() => {
                document.getElementById('painting-reveal').style.opacity = '1';
                document.getElementById('painting-reveal').classList.add('fade-in');
            }, 1200);
        }
    }, 80);

    // Rebind continue button after animation
    setTimeout(() => {
        const btn = document.getElementById('btn-continue-paint');
        if (btn) btn.addEventListener('click', onContinue);
    }, 2500);
}

// ── ARTIST STATUS (BOTTOM ZONE) — PAINTING PHASE ─────────
function renderArtistStatusPainting() {
    clearZone($zone.bottom);

    const lastPainting = gameState.paintings[gameState.paintings.length - 1];

    let historyHTML = '';
    for (const p of gameState.paintings) {
        historyHTML += `
        <div class="history-item">
            <img src="${p.image}" alt="${p.name}" class="history-thumb zoomable-painting"
                 data-name="${p.name}"
                 data-value="${formatCurrency(p.maxValue)}"
                 data-category="${p.category}">
                <span class="history-name">${p.name}</span>
                <span class="seal-mini ${p.sealClass}">${p.category}</span>
            </div>
    `;
    }

    $zone.bottom.innerHTML = `
        <div class="artist-status\">
            <div class="status-section">
                <h4>🎨 Painel do Artista</h4>
                <div class="status-row">
                    <span>🖌 Base de Pintura:</span>
                    <span class="stat-value">${gameState.config.paintingBase}</span>
                </div>
                <div class="status-row">
                    <span>⚠️ Penalidade:</span>
                    <span class="stat-value ${gameState.penaltyActive ? 'penalty-active' : ''}">${gameState.penaltyActive ? '-5 ATIVA' : 'Nenhuma'}</span>
                </div>
            </div>
            <div class="status-section history-section">
                <h4>🖼 Obras Criadas (${gameState.paintings.length})</h4>
                <div class="history-scroll">${historyHTML || '<span class="empty">Nenhuma obra ainda</span>'}</div>
            </div>
        </div>
        `;
}

// ── RIGHT ZONE — PAINTING PHASE (shows created paintings) ─
function renderPaintingRightPanel() {
    clearZone($zone.right);

    $zone.right.innerHTML = `
        <div class="collection-panel glass-card">
            <h3>🖼 Coleção</h3>
            <div class="collection-count">${gameState.paintings.length} obra${gameState.paintings.length !== 1 ? 's' : ''}</div>
            <div class="collection-grid">
                ${gameState.paintings.map(p => `
                    <div class="collection-thumb">
                        <img src="${p.image}" alt="${p.name}"
                             data-name="${p.name}"
                             data-value="${formatCurrency(p.maxValue)}"
                             class="zoomable-painting">
                        <div class="seal-mini ${p.sealClass}">${p.category}</div>
                    </div>
                `).join('')}
            </div>
        </div>
        `;
}

// ── GALLERY PHASE: MAIN VIEW (render once) ────────────────
function renderGalleryView(gameHour, gameMinute, progress, onStartRealTime) {
    setPhase('phase-gallery');
    clearZone($zone.center);

    const progressPct = progress * 100;
    const unsold = gameState.paintings.filter(p => !p.sold);

    let wallHTML = '';
    for (const p of unsold) {
        wallHTML += `
        <div class="gallery-frame" data-pid="${p.id}">
            <img src="${p.image}" alt="${p.name}"
                 data-name="${p.name}"
                 data-value="${formatCurrency(p.maxValue)}"
                 class="zoomable-painting">
            <div class="frame-label">${p.name}</div>
            <div class="seal-mini ${p.sealClass}">${p.category}</div>
        </div>
    `;
    }

    $zone.center.innerHTML = `
        <div class="gallery-interior" style="position: relative; width: 100%; min-height: 100%; display: flex; flex-direction: column;">
            <div class="gallery-clock-bar">
                <div class="gallery-clock" id="gallery-clock-display">🕐 ${gameHour.toString().padStart(2, '0')}:${gameMinute.toString().padStart(2, '0')}</div>
                <div class="progress-bar-wrap">
                    <div class="progress-bar" id="gallery-progress-bar" style="width:${progressPct}%"></div>
                </div>
                <div class="gallery-clock">18:00</div>
            </div>
            <div class="gallery-wall" id="gallery-wall">
                ${wallHTML || '<p class="empty-gallery">Todas as obras foram vendidas! 🎉</p>'}
            </div>
            ${onStartRealTime ? `
            <div class="start-day-overlay" id="start-day-overlay">
                <button class="btn btn-primary btn-lg" id="btn-start-gallery-day">▶ Iniciar Dia</button>
            </div>
            ` : ''}
        </div>
        `;

    if (onStartRealTime) {
        document.getElementById('btn-start-gallery-day').addEventListener('click', () => {
            const overlay = document.getElementById('start-day-overlay');
            if (overlay) overlay.style.display = 'none';
            onStartRealTime();
        });
    }
}

/**
 * Lightweight tick update — only changes clock text and progress bar width.
 * Does NOT rebuild the DOM. No flicker.
 */
function updateGalleryClock(gameHour, gameMinute, progress) {
    const clockEl = document.getElementById('gallery-clock-display');
    const barEl = document.getElementById('gallery-progress-bar');
    if (clockEl) clockEl.textContent = `🕐 ${gameHour.toString().padStart(2, '0')}:${gameMinute.toString().padStart(2, '0')} `;
    if (barEl) barEl.style.width = `${progress * 100}% `;
}

/**
 * Mark a painting as sold with a stamp without removing it from the wall.
 */
function markSoldPaintingOnWall(paintingId) {
    const frame = document.querySelector(`.gallery-frame[data-pid="${paintingId}"]`);
    if (frame) {
        frame.classList.add('sold');
        const stamp = document.createElement('div');
        stamp.className = 'sold-stamp';
        stamp.innerText = 'VENDIDO';
        frame.appendChild(stamp);
    }
}

// ── RIGHT ZONE — GALLERY PHASE (render once) ─────────────
function renderVisitorPanel(tierDist, visitorsPresent, totalCapacity) {
    clearZone($zone.right);

    // Inicializa todas as barras com zero
    let tierBarsHTML = '';
    for (const tc of TIER_CONFIG) {
        tierBarsHTML += `
        <div class="tier-row">
            <span class="tier-label" style="color:${tc.color}">Tier ${tc.tier}</span>
            <div class="tier-bar-bg">
                <div class="tier-bar" id="tier-bar-${tc.tier}" style="width:0%;background:${tc.color}"></div>
            </div>
            <span class="tier-count" id="tier-count-${tc.tier}">0</span>
        </div>
        `;
    }

    $zone.right.innerHTML = `
        <div class="visitor-panel glass-card">
            <h3>👥 Visitantes</h3>
            <div class="visitor-counter">
                <span class="visitor-big" id="visitor-count-display">${visitorsPresent}</span>
                <span class="visitor-sep">/</span>
                <span class="visitor-max">${totalCapacity}</span>
            </div>
            <div class="tier-bars">${tierBarsHTML}</div>
        </div>
        `;
}

/**
 * Lightweight tick update — only changes visitor count number.
 */
function updateVisitorCount(count) {
    const el = document.getElementById('visitor-count-display');
    if (el) el.textContent = count;
}

/**
 * Lightweight tick update — updates tier bars and counts based on arrived visitors.
 * @param {object} arrivedTierDist — { A: n, B: n, ... } counts of arrived visitors per tier
 * @param {number} totalCapacity — max capacity for bar scaling
 */
function updateTierBars(arrivedTierDist, totalCapacity) {
    for (const tier in arrivedTierDist) {
        const count = arrivedTierDist[tier] || 0;
        const pct = totalCapacity > 0 ? (count / totalCapacity) * 100 : 0;
        const bar = document.getElementById(`tier-bar-${tier}`);
        const label = document.getElementById(`tier-count-${tier}`);
        if (bar) bar.style.width = `${pct}%`;
        if (label) label.textContent = count;
    }
}

// ── ARTIST STATUS (BOTTOM ZONE) — GALLERY PHASE (render once) ──
function renderArtistStatusGallery() {
    clearZone($zone.bottom);

    const stats = gameState.stats;
    const unsold = gameState.paintings.filter(p => !p.sold);
    const unsoldMax = unsold.reduce((s, p) => s + p.maxValue, 0);

    $zone.bottom.innerHTML = `
        <div class="artist-status gallery-status\">
            <div class="status-section">
                <h4>💰 Financeiro</h4>
                <div class="status-row"><span>Bruto:</span><span class="stat-value" id="stat-gross">${formatCurrency(stats.totalGrossRevenue)}</span></div>
                <div class="status-row"><span>Fee (${gameState.config.galleryFee}%):</span><span class="stat-value fee-val" id="stat-fees">-${formatCurrency(stats.totalFees)}</span></div>
                <div class="status-row highlight"><span>Líquido:</span><span class="stat-value" id="stat-net">${formatCurrency(stats.totalNetRevenue)}</span></div>
            </div>
            <div class="status-section">
                <h4>📊 Resumo</h4>
                <div class="status-row"><span>Vendidos:</span><span class="stat-value" id="stat-sold">${stats.totalSales}</span></div>
                <div class="status-row"><span>Restantes:</span><span class="stat-value" id="stat-remaining">${unsold.length}</span></div>
                <div class="status-row"><span>Valor Máx. Restante:</span><span class="stat-value" id="stat-unsold-max">${formatCurrency(unsoldMax)}</span></div>
            </div>
        </div>
        `;
}

/**
 * Lightweight update of financial stats after a sale.
 */
function updateArtistFinancials() {
    const stats = gameState.stats;
    const unsold = gameState.paintings.filter(p => !p.sold);
    const unsoldMax = unsold.reduce((s, p) => s + p.maxValue, 0);

    const elGross = document.getElementById('stat-gross');
    const elFees = document.getElementById('stat-fees');
    const elNet = document.getElementById('stat-net');
    const elSold = document.getElementById('stat-sold');
    const elRemaining = document.getElementById('stat-remaining');
    const elUnsoldMax = document.getElementById('stat-unsold-max');

    if (elGross) elGross.textContent = formatCurrency(stats.totalGrossRevenue);
    if (elFees) elFees.textContent = '-' + formatCurrency(stats.totalFees);
    if (elNet) elNet.textContent = formatCurrency(stats.totalNetRevenue);
    if (elSold) elSold.textContent = stats.totalSales;
    if (elRemaining) elRemaining.textContent = unsold.length;
    if (elUnsoldMax) elUnsoldMax.textContent = formatCurrency(unsoldMax);
}

// ── BID POPUP ─────────────────────────────────────────────
function showBidPopup(bid, onAccept, onReject) {
    const overlay = $zone.overlay;
    overlay.classList.add('active');

    overlay.innerHTML = `
        <div class="bid-popup glass-card slide-up\">
            <div class="bid-painting-img">
                <img src="${bid.painting.image}" alt="${bid.painting.name}">
                <div class="seal-badge ${bid.painting.sealClass}">${bid.painting.category}</div>
            </div>
            <h3>${bid.painting.name}</h3>
            <div class="bid-info">
                <div class="bid-tier">
                    <span class="tier-dot" style="background:${bid.visitor.color}"></span>
                    Comprador Tier ${bid.visitor.tier}
                </div>
                <p class="bid-phrase">"${bid.phrase}"</p>
                <div class="bid-value">${formatCurrency(bid.bidValue)}</div>
                <div class="bid-max-value">Máximo possível nesta obra: <span style="color:var(--accent-gold); font-weight:bold">${formatCurrency(bid.painting.maxValue)}</span></div>
            </div>
            <div class="bid-actions">
                <button class="btn btn-accept" id="btn-accept-bid">✅ Aceitar</button>
                <button class="btn btn-reject" id="btn-reject-bid">❌ Recusar</button>
            </div>
        </div>
        `;

    document.getElementById('btn-accept-bid').addEventListener('click', () => {
        overlay.classList.remove('active');
        overlay.innerHTML = '';
        onAccept();
    });
    document.getElementById('btn-reject-bid').addEventListener('click', () => {
        overlay.classList.remove('active');
        overlay.innerHTML = '';
        onReject();
    });
}

// ── END OF DAY SUMMARY ───────────────────────────────────
function renderDaySummary(summary, onNext) {
    clearZone($zone.center);

    $zone.center.innerHTML = `
        <div class="day-summary glass-card fade-in\">
            <h2>🌙 Resumo do Dia ${summary.day} Encerrado</h2>
            <div class="summary-stats">
                <div class="summary-stat">
                    <span class="summary-icon">👥</span>
                    <span class="summary-label">Visitantes:</span>
                    <span class="summary-value">${summary.totalVisitors}</span>
                </div>
                <div class="summary-stat">
                    <span class="summary-icon">🖼</span>
                    <span class="summary-label">Quadros Vendidos:</span>
                    <span class="summary-value">${summary.soldCount}</span>
                </div>
                <div class="summary-stat">
                    <span class="summary-icon">💰</span>
                    <span class="summary-label">Valor Arrecadado:</span>
                    <span class="summary-value">${formatCurrency(summary.revenue)}</span>
                </div>
                <div class="summary-stat summary-stat-wide">
                    <span class="summary-icon">📈</span>
                    <span class="summary-label">Valor Máx. Possível (dessas vendas):</span>
                    <span class="summary-value">${formatCurrency(summary.maxPossibleValue)}</span>
                </div>
            </div>
            ${summary.sales.length > 0 ? `
                <div class="sales-list">
                    <h4>Vendas do dia:</h4>
                    ${summary.sales.map(s => {
        const pct = Math.round((s.grossValue / s.paintingMax) * 100);
        return `
                        <div class="sale-item">
                            <span>${s.paintingName}</span>
                            <span>Tier ${s.buyerTier}</span>
                            <span>${formatCurrency(s.grossValue)} <span class="pct-badge">(${pct}%)</span></span>
                        </div>`;
    }).join('')}
                </div>
            ` : '<p class="no-sales">Nenhuma venda hoje.</p>'}
            <button class="btn btn-primary btn-lg" id="btn-next-day">Iniciar Próximo Dia ➜</button>
        </div>
    `;
    document.getElementById('btn-next-day').addEventListener('click', onNext);
}

// ── FINAL RESULTS SCREEN ─────────────────────────────────
function renderFinalResults(results, onSellToGallery, onDontSell) {
    setPhase('phase-results');
    clearZone($zone.center);
    clearZone($zone.top);

    $zone.top.innerHTML = `<div class="top-logo\"> <h1>📊 Resultado Final</h1></div> `;

    let tierStatsHTML = '';
    for (const tc of TIER_CONFIG) {
        tierStatsHTML += `<div class="tier-stat-row\">
            <span style="color:${tc.color}">Tier ${tc.tier}:</span>
            <span>${results.visitorsByTier[tc.tier] || 0}</span>
        </div> `;
    }

    let unsoldHTML = '';
    if (results.unsoldPaintings.length > 0) {
        unsoldHTML = `
        <div class="unsold-section\">
                <h3>🖼 Obras Restantes</h3>
                <div class="unsold-grid">
                    ${results.unsoldPaintings.map(p => `
                        <div class="unsold-item">
                            <img src="${p.image}" alt="${p.name}">
                            <span>${p.name}</span>
                            <span class="seal-mini ${p.sealClass}">${p.category}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="gallery-offer glass-card">
                    <h3>🏦 Oferta da Galeria</h3>
                    <p>A galeria oferece <strong>${formatCurrency(results.galleryOffer)}</strong> por todas as obras restantes.</p>
                    <p class="offer-note">(25% do valor máximo total — sem fee)</p>
                    <div class="offer-buttons">
                        <button class="btn btn-accept" id="btn-sell-gallery">💰 Vender para Galeria</button>
                        <button class="btn btn-reject" id="btn-dont-sell">🚫 Não Vender</button>
                    </div>
                </div>
            </div>
        `;
    }

    $zone.center.innerHTML = `
        <div class="final-results glass-card fade-in\">
            <div class="results-grid">
                <div class="result-block">
                    <h3>👥 Visitantes</h3>
                    <div class="result-big">${results.totalVisitors}</div>
                    <div class="tier-stats">${tierStatsHTML}</div>
                </div>
                <div class="result-block">
                    <h3>🖼 Obras</h3>
                    <div class="result-row"><span>Total criadas:</span><span>${results.totalPaintings}</span></div>
                    <div class="result-row"><span>Vendidas:</span><span>${results.totalSales}</span></div>
                    <div class="result-row"><span>Restantes:</span><span>${results.unsoldPaintings.length}</span></div>
                </div>
                <div class="result-block">
                    <h3>💰 Financeiro</h3>
                    <div class="result-row"><span>Valor Bruto:</span><span>${formatCurrency(results.grossRevenue)}</span></div>
                    <div class="result-row fee-row"><span>(-) Fee Galeria:</span><span>-${formatCurrency(results.totalFees)}</span></div>
                    <div class="result-row highlight"><span>Valor Líquido:</span><span>${formatCurrency(results.netRevenue)}</span></div>
                </div>
            </div>
            ${unsoldHTML}
        </div>
        `;

    if (results.unsoldPaintings.length > 0) {
        document.getElementById('btn-sell-gallery').addEventListener('click', onSellToGallery);
        document.getElementById('btn-dont-sell').addEventListener('click', onDontSell);
    }

    // Show all paintings in bottom zone
    clearZone($zone.bottom);
    clearZone($zone.right);
}

// ── FINAL SCREEN AFTER GALLERY SALE DECISION ─────────────
function renderGameOver(finalNetRevenue, soldToGallery, galleryValue) {
    clearZone($zone.center);

    $zone.center.innerHTML = `
        <div class="game-over glass-card fade-in\">
            <h1>🎨 Fim do Jogo</h1>
            ${soldToGallery ? `<p class="gallery-sold-msg">Você vendeu as obras restantes para a galeria por ${formatCurrency(galleryValue)}.</p>` : ''}
            <div class="final-total">
                <span>💰 Total Líquido Final:</span>
                <span class="final-value">${formatCurrency(finalNetRevenue)}</span>
            </div>
            <button class="btn btn-primary btn-lg" id="btn-restart">🔄 Jogar Novamente</button>
        </div>
        `;

    document.getElementById('btn-restart').addEventListener('click', () => {
        location.reload();
    });
}

// ── TRANSITION SCREEN ────────────────────────────────────
function renderPhaseTransition(fromPhase, toPhase, onContinue) {
    clearZone($zone.center);

    const msg = toPhase === 'gallery'
        ? `🏛 Suas ${gameState.paintings.length} obras estão prontas! É hora de abrir a exposição.`
        : '📊 A exposição terminou. Vamos ver os resultados!';

    const title = toPhase === 'gallery'
        ? '🎨 ➜ 🏛 Fase da Galeria'
        : '🏛 ➜ 📊 Resultado Final';

    $zone.center.innerHTML = `
        <div class="phase-transition glass-card fade-in\">
            <h2>${title}</h2>
            <p>${msg}</p>
            <div class="transition-paintings">
                ${gameState.paintings.map(p => `
                    <div class="trans-painting">
                        <img src="${p.image}" alt="${p.name}">
                        <div class="seal-mini ${p.sealClass}">${p.category}</div>
                    </div>
                `).join('')}
            </div>
            <button class="btn btn-primary btn-lg" id="btn-phase-continue">Continuar ➜</button>
        </div>
        `;

    document.getElementById('btn-phase-continue').addEventListener('click', onContinue);
}

// ── GLOBAL IMAGE MODAL (LIGHTBOX) ─────────────────────────
function initImageModal() {
    const modalHTML = `
        <div class="image-modal" id="image-lightbox">
            <div class="image-modal-close" id="image-lightbox-close">&times;</div>
            <img src="" id="image-lightbox-img" alt="Obra em Tela Cheia">
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    const modal = document.getElementById('image-lightbox');
    const closeBtn = document.getElementById('image-lightbox-close');
    const imgEl = document.getElementById('image-lightbox-img');

    // Close handlers
    closeBtn.addEventListener('click', () => modal.classList.remove('active'));
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('active');
    });

    // Global click delegate for any image inside specific parent containers
    document.addEventListener('click', (e) => {
        if (e.target.tagName.toLowerCase() === 'img') {
            const parent = e.target.parentElement;
            if (
                parent.classList.contains('gallery-frame') ||
                parent.classList.contains('collection-thumb') ||
                parent.classList.contains('unsold-item') ||
                parent.classList.contains('painting-image-frame') ||
                parent.classList.contains('history-item') ||
                parent.classList.contains('trans-painting') ||
                parent.classList.contains('bid-painting-img')
            ) {
                imgEl.src = e.target.src;
                modal.classList.add('active');
            }
        }
    });
}

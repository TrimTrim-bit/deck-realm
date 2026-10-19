const BET_PANELS = {};

function renderBetPanel(containerId, gameLabel = '') {
    const container = document.getElementById(containerId);
    if (!container) return null;

    const coins = state.coins;
    if (coins < 10) {
        container.innerHTML = `<div class="bet-panel">
            <p style="color:#ef4444; font-weight:bold;">Need at least 10 coins. You have ${coins}.</p>
            <button class="btn primary-btn" id="${containerId}-bonus">🎁 Claim 50 Free Coins</button>
        </div>`;
        document.getElementById(`${containerId}-bonus`).onclick = () => {
            if (state.coins >= 20) return;
            state.coins += 50; saveGameData(); updateStatsUI(); AudioFX.playWin();
            renderBetPanel(containerId, gameLabel);
        };
        return null;
    }

    const initialPct = 25;
    const initialAmt = Math.max(10, Math.floor(coins * initialPct / 100));
    container.innerHTML = `
        <div class="bet-panel">
            <div class="bet-coins">Your coins: <b>${coins}</b></div>
            <div class="bet-pct-row">
                <span id="${containerId}-pct" class="bet-pct-label">${initialPct}%</span>
                <span style="color:#94a3b8;">·</span>
                <span>Bet: <b id="${containerId}-amt" style="color:var(--accent-cyan);">${initialAmt}</b> coins</span>
            </div>
            <input type="range" id="${containerId}-slider" min="1" max="100" value="${initialPct}" class="bet-slider">
            <div class="bet-quick">
                <button class="btn tutorial-btn" data-pct="10">10%</button>
                <button class="btn tutorial-btn" data-pct="25">25%</button>
                <button class="btn tutorial-btn" data-pct="50">50%</button>
                <button class="btn tutorial-btn" data-pct="75">75%</button>
                <button class="btn primary-btn" data-pct="100">ALL IN</button>
            </div>
        </div>`;

    const slider = document.getElementById(`${containerId}-slider`);
    const pctLabel = document.getElementById(`${containerId}-pct`);
    const amtLabel = document.getElementById(`${containerId}-amt`);

    const update = () => {
        const pct = parseInt(slider.value);
        const amt = Math.max(1, Math.min(state.coins, Math.floor(state.coins * pct / 100)));
        pctLabel.textContent = pct + '%';
        amtLabel.textContent = amt;
    };
    slider.oninput = update;
    container.querySelectorAll('[data-pct]').forEach(btn => {
        btn.onclick = () => { slider.value = btn.dataset.pct; update(); };
    });
    update();

    BET_PANELS[containerId] = {
        getAmount: () => {
            const pct = parseInt(slider.value);
            return Math.max(1, Math.min(state.coins, Math.floor(state.coins * pct / 100)));
        },
        refresh: () => renderBetPanel(containerId, gameLabel)
    };
    return BET_PANELS[containerId];
}

function getBetAmount(containerId) {
    return BET_PANELS[containerId] ? BET_PANELS[containerId].getAmount() : 0;
}
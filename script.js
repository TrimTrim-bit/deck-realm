let state = {
    coins: 500, xp: 0, level: 1,
    activeSkin: 'default', unlockedSkins: ['default'],
    gamesPlayed: 0, winStreak: 0,
    stats: {},
    soundMuted: false,
    achievements: {
        firstGame:     { title: "First Deal",        desc: "Play your first card match",             reward: 100, claimed: false },
        highRoller:    { title: "Card Shark",         desc: "Earn 1,000 total coins",                 reward: 250, claimed: false },
        skinCollector: { title: "Dressed to Kill",    desc: "Unlock a custom card skin",              reward: 200, claimed: false },
        unoMaster:     { title: "UNO Master",         desc: "Win a game of UNO",                      reward: 150, claimed: false },
        warHero:       { title: "War Hero",           desc: "Win a War match",                        reward: 100, claimed: false },
        pyramid:       { title: "Pharaoh's Friend",   desc: "Solve the pyramid",                      reward: 200, claimed: false },
        trashPro:      { title: "Waste Management",   desc: "Fill all 10 Trash slots",                reward: 150, claimed: false },
        goFish:        { title: "Fish Whisperer",     desc: "Win a game of Go Fish",                  reward: 150, claimed: false },
        blackjack:     { title: "Blackjack!",         desc: "Get a natural blackjack",                reward: 200, claimed: false },
        mahjongMaster: { title: "Mahjong Master",     desc: "Clear a Mahjong board",                  reward: 200, claimed: false },
        pokerFace:     { title: "Poker Face",         desc: "Win a poker hand",                       reward: 150, claimed: false },
        crapsWinner:   { title: "Lucky Dice",         desc: "Win a Craps bet",                        reward: 100, claimed: false },
        plinkoDrop:    { title: "Plinko Pro",         desc: "Drop your first Plinko ball",            reward: 50,  claimed: false },
        chessWinner:   { title: "Grandmaster",        desc: "Win a game of Chess",                    reward: 250, claimed: false },
        checkersWinner:{ title: "Checker Champion",   desc: "Win a game of Checkers",                 reward: 150, claimed: false },
        jengaPro:      { title: "Steady Hand",        desc: "Pull 15 Jenga blocks in one game",       reward: 200, claimed: false },
        rubiksSolver:  { title: "Cube Master",        desc: "Solve a Rubik's Cube",                   reward: 300, claimed: false },
        perfect:       { title: "Perfect Run",        desc: "Win 10 games in a row across sessions",  reward: 400, claimed: false },
        casinoStarter: { title: "High Stakes",        desc: "Play any casino game",                   reward: 100, claimed: false }
    }
};

const ACHIEVEMENT_DEFAULTS = JSON.parse(JSON.stringify(state.achievements));

function loadGameData() {
    const saved = localStorage.getItem('deckRealmState');
    if (!saved) return;
    try {
        const loaded = JSON.parse(saved);
        state = { ...state, ...loaded };
        state.stats = state.stats || {};
        for (const key in ACHIEVEMENT_DEFAULTS) {
            if (!state.achievements || !state.achievements[key]) {
                if (!state.achievements) state.achievements = {};
                state.achievements[key] = { ...ACHIEVEMENT_DEFAULTS[key] };
            }
        }
        if (state.coins < 0) state.coins = 0;
    } catch (e) { console.error("Could not load save data", e); }
}

function saveGameData() { localStorage.setItem('deckRealmState', JSON.stringify(state)); }

const SHOP_ITEMS = [
    { id: 'default',   name: 'Classic White',  price: 0,    color: '#ffffff' },
    { id: 'cyberpunk', name: 'Cyber Neon',     price: 300,  color: '#00ffcc' },
    { id: 'gold',      name: 'Royal Gold',     price: 800,  color: '#ffd700' },
    { id: 'crimson',   name: 'Crimson Dragon', price: 1500, color: '#ff4d4d' }
];

function showToast(message, type = 'info', duration = 2600) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = message;
    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('toast-show'));
    setTimeout(() => { toast.classList.remove('toast-show'); setTimeout(() => toast.remove(), 250); }, duration);
}

const GameSession = {
    timers: [], currentGame: null, currentMode: '1-ai',
    setTimer(fn, ms) {
        const id = setTimeout(() => { this.timers = this.timers.filter(t => t !== id); try { fn(); } catch (e) { console.warn('Timer callback failed', e); } }, ms);
        this.timers.push(id); return id;
    },
    setInterval(fn, ms) { const id = setInterval(fn, ms); this.timers.push(id); return id; },
    start(gameId, mode) { this.clear(); this.currentGame = gameId; this.currentMode = mode; },
    clear() { this.timers.forEach(id => { clearTimeout(id); clearInterval(id); }); this.timers = []; this.currentGame = null; }
};

document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        AudioFX.playClick();
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-page').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(`tab-${btn.getAttribute('data-tab')}`).classList.add('active');
        document.getElementById('game-stage').style.display = 'none';
        GameSession.clear();
        if (btn.getAttribute('data-tab') === 'achievements') renderAchievements();
    });
});

function addCoins(amount) {
    state.coins += amount;
    if (state.coins < 0) state.coins = 0;
    checkAchievements();
    saveGameData(); updateStatsUI();
}

function addXP(amount) {
    state.xp += amount;
    let levelsGained = 0;
    while (state.xp >= state.level * 100) { state.xp -= state.level * 100; state.level++; state.coins += 200; levelsGained++; }
    if (levelsGained > 0) {
        AudioFX.playLevelUp();
        showToast(`⭐ LEVEL UP! You reached Level ${state.level}! +${200 * levelsGained} Coins`, 'success', 4000);
    }
    saveGameData(); updateStatsUI();
}

function recordGameResult(gameId, won, coinsEarned, xpEarned) {
    if (!state.stats[gameId]) state.stats[gameId] = { played: 0, won: 0, coinsEarned: 0 };
    state.stats[gameId].played++;
    if (won) state.stats[gameId].won++;
    state.stats[gameId].coinsEarned += coinsEarned || 0;
    state.gamesPlayed++;
    if (state.coins < 0) state.coins = 0;

    if (!state.achievements.firstGame.claimed && state.gamesPlayed >= 1) {
        state.achievements.firstGame.claimed = true;
        state.coins += state.achievements.firstGame.reward;
        showToast(`🏆 Achievement: ${state.achievements.firstGame.title}! +${state.achievements.firstGame.reward} Coins`, 'success', 4000);
    }

    if (won) {
        state.winStreak = (state.winStreak || 0) + 1;
        if (state.winStreak >= 10 && !state.achievements.perfect.claimed) {
            state.achievements.perfect.claimed = true;
            state.coins += state.achievements.perfect.reward;
            showToast(`🏆 Achievement: Perfect Run! +${state.achievements.perfect.reward} Coins`, 'success', 4000);
        }
    } else state.winStreak = 0;

    if (won) {
        const map = {
            'color-match': 'unoMaster', 'war': 'warHero', 'pyramid-solitaire': 'pyramid',
            'trash': 'trashPro', 'go-fish': 'goFish', 'mahjong': 'mahjongMaster',
            'poker': 'pokerFace', 'craps': 'crapsWinner', 'chess': 'chessWinner',
            'checkers': 'checkersWinner', 'rubiks': 'rubiksSolver'
        };
        const key = map[gameId];
        if (key && state.achievements[key] && !state.achievements[key].claimed) {
            state.achievements[key].claimed = true;
            state.coins += state.achievements[key].reward;
            showToast(`🏆 Achievement: ${state.achievements[key].title}! +${state.achievements[key].reward} Coins`, 'success', 4000);
        }
    }

    const casinoGames = ['baccarat', 'three-card-poker', 'roulette', 'blackjack', 'craps', 'plinko', 'poker'];
    if (casinoGames.includes(gameId) && !state.achievements.casinoStarter.claimed) {
        state.achievements.casinoStarter.claimed = true;
        state.coins += state.achievements.casinoStarter.reward;
        showToast(`🏆 Achievement: High Stakes! +${state.achievements.casinoStarter.reward} Coins`, 'success', 4000);
    }

    checkAchievements();
    saveGameData(); updateStatsUI();
}

function recordGameCompleted() {}

function checkAchievements() {
    if (state.coins >= 1000 && !state.achievements.highRoller.claimed) {
        state.achievements.highRoller.claimed = true;
        state.coins += state.achievements.highRoller.reward;
        showToast(`🏆 Achievement: Card Shark! +${state.achievements.highRoller.reward} Coins`, 'success', 4000);
    }
    saveGameData();
}

function updateStatsUI() {
    document.getElementById('coins-display').textContent = `🪙 ${state.coins} Coins`;
    document.getElementById('level-display').textContent = `⭐ Lv. ${state.level}`;
    document.getElementById('xp-display').textContent = `XP: ${state.xp}/${state.level * 100}`;
    const soundBtn = document.getElementById('sound-toggle');
    if (soundBtn) soundBtn.textContent = AudioFX.muted ? '🔇' : '🔊';
}

function renderShop() {
    document.getElementById('shop-items-container').innerHTML = SHOP_ITEMS.map(item => {
        const isUnlocked = state.unlockedSkins.includes(item.id);
        const isActive = state.activeSkin === item.id;
        return `<div class="shop-item">
            <div class="skin-preview" data-skin="${item.id}" style="height:60px; border-radius:6px; margin-bottom:10px; background:${item.color};"></div>
            <h3>${item.name}</h3>
            <p>${item.price === 0 ? 'Free Default Skin' : `Price: 🪙 ${item.price} Coins`}</p>
            <button class="btn ${isActive ? 'tutorial-btn' : 'primary-btn'}"
                onclick="AudioFX.playClick(); handleShopClick('${item.id}', ${item.price})">
                ${isActive ? 'Active' : (isUnlocked ? 'Equip' : 'Buy')}
            </button>
        </div>`;
    }).join('');
}

function handleShopClick(id, price) {
    if (state.unlockedSkins.includes(id)) {
        state.activeSkin = id;
        showToast(`Equipped: ${SHOP_ITEMS.find(i => i.id === id).name}`, 'info');
    } else if (state.coins >= price) {
        state.coins -= price;
        state.unlockedSkins.push(id);
        state.activeSkin = id;
        if (!state.achievements.skinCollector.claimed) {
            state.achievements.skinCollector.claimed = true;
            state.coins += state.achievements.skinCollector.reward;
            showToast(`🏆 Achievement: Dressed to Kill! +${state.achievements.skinCollector.reward} Coins`, 'success', 4000);
        }
        AudioFX.playWin();
        showToast(`Purchased and equipped!`, 'success');
    } else showToast(`Not enough coins! Need ${price - state.coins} more.`, 'error');
    saveGameData(); updateStatsUI(); renderShop();
}

function achievementProgress(key, ach) {
    if (ach.claimed) return null;
    switch (key) {
        case 'firstGame': return { cur: Math.min(state.gamesPlayed || 0, 1), max: 1, label: 'game' };
        case 'highRoller': return { cur: Math.min(state.coins, 1000), max: 1000, label: 'coins' };
        case 'perfect': return { cur: state.winStreak || 0, max: 10, label: 'wins in a row' };
        case 'unoMaster': return { cur: Math.min((state.stats['color-match']?.won || 0), 1), max: 1, label: 'win' };
        case 'warHero': return { cur: Math.min((state.stats['war']?.won || 0), 1), max: 1, label: 'win' };
        case 'pyramid': return { cur: Math.min((state.stats['pyramid-solitaire']?.won || 0), 1), max: 1, label: 'solve' };
        case 'trashPro': return { cur: Math.min((state.stats['trash']?.won || 0), 1), max: 1, label: 'win' };
        case 'goFish': return { cur: Math.min((state.stats['go-fish']?.won || 0), 1), max: 1, label: 'win' };
        case 'mahjongMaster': return { cur: Math.min((state.stats['mahjong']?.won || 0), 1), max: 1, label: 'clear' };
        case 'pokerFace': return { cur: Math.min((state.stats['poker']?.won || 0), 1), max: 1, label: 'win' };
        case 'crapsWinner': return { cur: Math.min((state.stats['craps']?.won || 0), 1), max: 1, label: 'win' };
        case 'chessWinner': return { cur: Math.min((state.stats['chess']?.won || 0), 1), max: 1, label: 'win' };
        case 'checkersWinner': return { cur: Math.min((state.stats['checkers']?.won || 0), 1), max: 1, label: 'win' };
        case 'jengaPro': return { cur: 0, max: 15, label: 'pulls' };
        case 'rubiksSolver': return { cur: Math.min((state.stats['rubiks']?.won || 0), 1), max: 1, label: 'solve' };
        case 'blackjack': return { cur: 0, max: 1, label: 'natural BJ' };
        case 'casinoStarter': return { cur: 0, max: 1, label: 'casino game' };
        case 'plinkoDrop': return { cur: 0, max: 1, label: 'drop' };
        default: return null;
    }
}

function renderAchievements() {
    const container = document.getElementById('achievements-container');
    const statRows = Object.entries(state.stats || {}).sort((a,b) => b[1].played - a[1].played);
    const statsHtml = `
        <div class="shop-item" style="grid-column: 1 / -1;">
            <h3>📊 Your Stats</h3>
            <p>Total games played: <b>${state.gamesPlayed || 0}</b> &nbsp;·&nbsp; Current win streak: <b>${state.winStreak || 0}</b></p>
            ${statRows.length === 0 ? `<p style="color:#94a3b8;">No games yet — jump into the Games Hub!</p>`
                : `<div style="display:grid; grid-template-columns:repeat(auto-fit,minmax(160px,1fr)); gap:8px; margin-top:10px;">
                    ${statRows.map(([id, s]) => `
                        <div style="background:#0f172a; padding:10px; border-radius:6px;">
                            <b style="color:var(--accent-cyan); text-transform:uppercase;">${id.replace(/-/g,' ')}</b><br>
                            <span style="color:#94a3b8;">Played:</span> ${s.played} &nbsp;
                            <span style="color:#22c55e;">Won:</span> ${s.won}<br>
                            <span style="color:var(--accent-gold);">🪙 ${s.coinsEarned} earned</span>
                        </div>`).join('')}
                </div>`}
        </div>`;
    const achHtml = Object.entries(state.achievements).map(([key, ach]) => {
        const prog = achievementProgress(key, ach);
        const progressHtml = prog ? `<div class="ach-progress">
            <div class="ach-bar"><div class="ach-bar-fill" style="width:${(prog.cur/prog.max)*100}%"></div></div>
            <span>${prog.cur}/${prog.max} ${prog.label}</span>
        </div>` : '';
        return `<div class="shop-item">
            <h3>🏆 ${ach.title}</h3>
            <p>${ach.desc}</p>
            <p style="color:var(--accent-gold);">Reward: 🪙 ${ach.reward} Coins</p>
            ${progressHtml}
            <button class="btn ${ach.claimed ? 'tutorial-btn' : 'primary-btn'}" disabled>
                ${ach.claimed ? 'Unlocked ✅' : 'In Progress'}
            </button>
        </div>`;
    }).join('');
    container.innerHTML = statsHtml + achHtml;
}

let pendingGameId = null;
function showGameSetup(gameId) {
    pendingGameId = gameId;
    document.getElementById('setup-game-title').textContent = `Setup: ${gameId.toUpperCase().replace(/-/g,' ')}`;
    document.getElementById('game-setup-modal').style.display = 'flex';
}
function closeGameSetup() { document.getElementById('game-setup-modal').style.display = 'none'; }
function confirmStartGame() {
    const mode = document.getElementById('game-mode-select').value;
    closeGameSetup();
    openGame(pendingGameId, mode);
}

function openGame(gameId, mode = '1-ai') {
    GameSession.start(gameId, mode);
    document.querySelectorAll('.tab-page').forEach(p => p.classList.remove('active'));
    document.getElementById('game-stage').style.display = 'block';
    const modeLabels = { '1-ai': 'vs 1 AI', '2-ai': 'vs 2 AI', 'pass-play': 'Pass & Play' };
    document.getElementById('active-game-title').textContent =
        `${gameId.toUpperCase().replace(/-/g,' ')} [${modeLabels[mode] || mode}]`;
    document.getElementById('in-game-tutorial-btn').onclick = () => { AudioFX.playClick(); startAnimatedTutorial(gameId); };
    const viewport = document.getElementById('game-viewport');
    viewport.innerHTML = '';
    try {
        if (GameEngines[gameId]) GameEngines[gameId].render(viewport, mode);
        else viewport.innerHTML = `<p style="color:#ef4444;">Unknown game: ${gameId}</p>`;
    } catch (e) {
        console.error('Game render failed:', e);
        viewport.innerHTML = `<div style="padding:20px; color:#ef4444;">
            <h3>⚠️ Something went wrong</h3>
            <p>${e.message}</p>
            <button class="btn primary-btn" onclick="closeGameStage()">Back to Hub</button>
        </div>`;
    }
}

function restartCurrentGame() {
    if (!GameSession.currentGame) return;
    openGame(GameSession.currentGame, GameSession.currentMode);
}

function closeGameStage() {
    const viewport = document.getElementById('game-viewport');
    const finished = viewport && viewport.querySelector('.end-buttons');
    if (GameSession.currentGame && !finished) {
        if (!confirm('Leave this game? Progress will be lost.')) return;
    }
    GameSession.clear();
    document.getElementById('game-stage').style.display = 'none';
    document.getElementById('tab-hub').classList.add('active');
}

loadGameData();
AudioFX.muted = !!state.soundMuted;
renderShop();
updateStatsUI();
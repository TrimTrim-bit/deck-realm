let state = {
    coins: 500, xp: 0, level: 1,
    activeSkin: 'default', unlockedSkins: ['default'],
    activeCardBack: 'classic', unlockedCardBacks: ['classic'],
    activeTheme: 'dark', unlockedThemes: ['dark'],
    activeTitle: 'novice', unlockedTitles: ['novice'],
    unlockedBoosters: [],
    unlockedTracks: ['chill'],
    currentMusic: null, musicVolume: 0.15,
    unlockedPets: [], activePet: null, petMood: 50, petLastFed: null,
    unlockedRooms: ['living'], furniture: {},
    gamesPlayed: 0, winStreak: 0,
    stats: {},
    soundMuted: false,
    lastDailyDate: null, dailyStreak: 0,
    achievements: {
        firstGame:     { title: "First Deal",         desc: "Play your first game",                        reward: 100, claimed: false },
        highRoller:    { title: "Card Shark",          desc: "Earn 1,000 coins",                            reward: 250, claimed: false },
        skinCollector: { title: "Dressed to Kill",     desc: "Unlock a custom card skin",                   reward: 200, claimed: false },
        unoMaster:     { title: "UNO Master",          desc: "Win a game of UNO",                           reward: 150, claimed: false },
        warHero:       { title: "War Hero",            desc: "Win a War match",                             reward: 100, claimed: false },
        pyramid:       { title: "Pharaoh's Friend",    desc: "Solve the pyramid",                           reward: 200, claimed: false },
        trashPro:      { title: "Waste Management",    desc: "Fill all Trash slots",                        reward: 150, claimed: false },
        goFish:        { title: "Fish Whisperer",      desc: "Win at Go Fish",                              reward: 150, claimed: false },
        blackjack:     { title: "Blackjack!",          desc: "Get a natural blackjack",                     reward: 200, claimed: false },
        mahjongMaster: { title: "Mahjong Master",      desc: "Clear a Mahjong board",                       reward: 200, claimed: false },
        pokerFace:     { title: "Poker Face",          desc: "Win a poker hand",                            reward: 150, claimed: false },
        crapsWinner:   { title: "Lucky Dice",          desc: "Win a Craps bet",                             reward: 100, claimed: false },
        plinkoDrop:    { title: "Plinko Pro",          desc: "Drop your first Plinko ball",                 reward: 50,  claimed: false },
        chessWinner:   { title: "Grandmaster",         desc: "Win a game of Chess",                         reward: 250, claimed: false },
        checkersWinner:{ title: "Checker Champion",    desc: "Win a game of Checkers",                      reward: 150, claimed: false },
        jengaPro:      { title: "Steady Hand",         desc: "Pull 15 Jenga blocks",                        reward: 200, claimed: false },
        rubiksSolver:  { title: "Cube Master",         desc: "Solve a Rubik's Cube",                        reward: 300, claimed: false },
        perfect:       { title: "Perfect Run",         desc: "Win 10 games in a row",                       reward: 400, claimed: false },
        casinoStarter: { title: "High Stakes",         desc: "Play any casino game",                        reward: 100, claimed: false },
        wordleSolver:  { title: "Wordle Wizard",       desc: "Solve a Wordle",                              reward: 200, claimed: false },
        wafflePro:     { title: "Waffle Champion",     desc: "Solve a Waffle puzzle",                       reward: 250, claimed: false },
        scrabbleWin:   { title: "Scrabble Scholar",    desc: "Score 30+ in a single Scrabble word",         reward: 200, claimed: false },
        hangmanWinner: { title: "Word Guesser",        desc: "Solve a Hangman puzzle",                      reward: 150, claimed: false },
        memoryMaster:  { title: "Total Recall",        desc: "Clear a Memory Match board",                  reward: 150, claimed: false },
        connectFourWin:{ title: "Four in a Row",       desc: "Beat the AI at Connect Four",                 reward: 200, claimed: false },
        snapPro:       { title: "Reflex Master",       desc: "Score 50+ in Snap!",                          reward: 150, claimed: false },
        bombSurvivor:  { title: "Bomb Whisperer",      desc: "Survive a full Bomb Cat game",                reward: 200, claimed: false },
        tttWinner:     { title: "X's and O's",         desc: "Win a Tic-Tac-Toe game",                      reward: 100, claimed: false },
        battleshipWin: { title: "Admiral",             desc: "Sink the enemy fleet",                        reward: 200, claimed: false },
        yahtzeeWin:    { title: "High Roller",         desc: "Score 200+ in Yahtzee",                       reward: 250, claimed: false },
        mastermindWin: { title: "Code Cracker",        desc: "Crack the Mastermind code",                   reward: 200, claimed: false },
        othelloWin:    { title: "Flip Master",         desc: "Win at Othello",                              reward: 150, claimed: false },
        klondikeWin:   { title: "Solitaire Master",    desc: "Solve Klondike",                              reward: 300, claimed: false },
        boggleWin:     { title: "Word Weaver",         desc: "Reach 30 points in Boggle",                   reward: 200, claimed: false },
        oldMaidWin:    { title: "Matchmaker",          desc: "Win at Old Maid",                             reward: 120, claimed: false },
        freecellWin:   { title: "FreeCell Master",     desc: "Solve a FreeCell game",                       reward: 250, claimed: false },
        heartsWin:     { title: "Heart Breaker",       desc: "Win a Hearts game",                           reward: 200, claimed: false },
        backgammonWin: { title: "Backgammon Baron",    desc: "Win a Backgammon game",                       reward: 250, claimed: false },
        cribbageWin:   { title: "Cribbage Champ",      desc: "Win a Cribbage game",                         reward: 200, claimed: false },
        dartsWin:      { title: "Bullseye",            desc: "Score 50+ in Darts",                          reward: 150, claimed: false },
        bowlingWin:    { title: "Strike King",         desc: "Score 10+ pins in Bowling",                   reward: 150, claimed: false },
        ginRummyWin:   { title: "Rummy Master",        desc: "Knock in Gin Rummy",                          reward: 200, claimed: false },
        miniGolfWin:   { title: "Hole in One",         desc: "Complete Mini Golf",                          reward: 200, claimed: false },
        snakeMaster:   { title: "Snake Charmer",       desc: "Score 100+ in Snake",                         reward: 150, claimed: false },
        tetrisMaster:  { title: "Line Clearer",        desc: "Score 500+ in Tetris",                        reward: 200, claimed: false },
        asteroidAce:   { title: "Asteroid Ace",        desc: "Score 300+ in Asteroids",                     reward: 200, claimed: false },
        froggerChamp:  { title: "Frog Champion",       desc: "Win a game of Frogger",                       reward: 200, claimed: false },
        digDugWin:     { title: "Tunnel Rat",          desc: "Clear all enemies in Dig Dug",                reward: 200, claimed: false },
        minesweeperWin:{ title: "Bomb Defuser",        desc: "Clear a Minesweeper board",                   reward: 150, claimed: false },
        firstPet:      { title: "Adopter",             desc: "Adopt your first pet",                        reward: 150, claimed: false },
        homeOwner:     { title: "Home Sweet Home",     desc: "Own all 4 house rooms",                       reward: 300, claimed: false },
        decorator:     { title: "Interior Designer",   desc: "Own 5+ furniture pieces",                     reward: 250, claimed: false }
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
        if (!state.unlockedCardBacks) state.unlockedCardBacks = ['classic'];
        if (!state.unlockedThemes) state.unlockedThemes = ['dark'];
        if (!state.unlockedTitles) state.unlockedTitles = ['novice'];
        if (!state.unlockedBoosters) state.unlockedBoosters = [];
        if (!state.unlockedTracks) state.unlockedTracks = ['chill'];
        if (state.activeCardBack === undefined) state.activeCardBack = 'classic';
        if (state.activeTheme === undefined) state.activeTheme = 'dark';
        if (state.activeTitle === undefined) state.activeTitle = 'novice';
        if (state.dailyStreak === undefined) state.dailyStreak = 0;
        if (state.lastDailyDate === undefined) state.lastDailyDate = null;
        if (state.musicVolume === undefined) state.musicVolume = 0.15;
        if (!state.unlockedPets) state.unlockedPets = [];
        if (!state.activePet) state.activePet = null;
        if (state.petMood === undefined) state.petMood = 50;
        if (state.petLastFed === undefined) state.petLastFed = null;
        if (!state.unlockedRooms) state.unlockedRooms = ['living'];
        if (!state.furniture) state.furniture = {};
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
    { id: 'crimson',   name: 'Crimson Dragon', price: 1500, color: '#ff4d4d' },
    { id: 'emerald',   name: 'Emerald Gem',    price: 900,  color: '#10b981' },
    { id: 'ice',       name: 'Frozen Ice',     price: 1100, color: '#7dd3fc' },
    { id: 'rainbow',   name: 'Rainbow Road',   price: 2000, color: '#f472b6' },
    { id: 'obsidian',  name: 'Obsidian Void',  price: 1800, color: '#1e1b4b' }
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
    timers: [], currentGame: null, currentMode: '1-ai', petTipUsed: false,
    setTimer(fn, ms) {
        const id = setTimeout(() => { this.timers = this.timers.filter(t => t !== id); try { fn(); } catch (e) { console.warn('Timer failed', e); } }, ms);
        this.timers.push(id); return id;
    },
    setInterval(fn, ms) { const id = setInterval(fn, ms); this.timers.push(id); return id; },
    start(gameId, mode) { this.clear(); this.currentGame = gameId; this.currentMode = mode; this.petTipUsed = false; },
    clear() { this.timers.forEach(id => { clearTimeout(id); clearInterval(id); }); this.timers = []; this.currentGame = null; }
};

document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        AudioFX.playClick();
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-page').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        const tab = btn.getAttribute('data-tab');
        document.getElementById(`tab-${tab}`).classList.add('active');
        document.getElementById('game-stage').style.display = 'none';
        GameSession.clear();
        if (tab === 'achievements') renderAchievements();
        if (tab === 'shop') renderBoutique();
        if (tab === 'jukebox') renderJukebox();
        if (tab === 'pets') renderPets();
        if (tab === 'home') renderHome();
    });
});

function addCoins(amount) {
    state.coins += amount;
    if (state.coins < 0) state.coins = 0;
    checkAchievements();
    saveGameData(); updateStatsUI();
}

function addXP(amount) {
    const mult = state.unlockedBoosters.includes('xpBoost') ? 2 : 1;
    state.xp += Math.floor(amount * mult);
    let levels = 0;
    while (state.xp >= state.level * 100) { state.xp -= state.level * 100; state.level++; state.coins += 200; levels++; }
    if (levels > 0) { AudioFX.playLevelUp(); showToast(`⭐ LEVEL UP! Level ${state.level}! +${200 * levels} Coins`, 'success', 4000); }
    saveGameData(); updateStatsUI();
}

function payoutAchievement(key) {
    const ach = state.achievements[key];
    if (!ach || ach.claimed) return;
    ach.claimed = true;
    const vipBonus = state.unlockedBoosters.includes('vipPass') ? 100 : 0;
    const total = ach.reward + vipBonus;
    state.coins += total;
    const vip = vipBonus ? ' (VIP +100)' : '';
    showToast(`🏆 ${ach.title}! +${total} Coins${vip}`, 'success', 4000);
    saveGameData(); updateStatsUI();
}

function recordGameResult(gameId, won, coinsEarned, xpEarned) {
    if (!state.stats[gameId]) state.stats[gameId] = { played: 0, won: 0, coinsEarned: 0 };
    state.stats[gameId].played++;
    if (won) state.stats[gameId].won++;
    state.stats[gameId].coinsEarned += coinsEarned || 0;
    state.gamesPlayed++;
    if (state.coins < 0) state.coins = 0;
    payoutAchievement('firstGame');
    if (won) {
        state.winStreak = (state.winStreak || 0) + 1;
        if (state.winStreak >= 10) payoutAchievement('perfect');
    } else state.winStreak = 0;
    if (won && coinsEarned > 0 && state.unlockedBoosters.includes('coinMagnet')) {
        const bonus = Math.floor(coinsEarned * 0.3);
        if (bonus > 0) { state.coins += bonus; showToast(`🧲 Coin Magnet: +${bonus} bonus coins!`, 'success', 2000); }
    }
    if (won) {
        const map = {
            'color-match': 'unoMaster', 'war': 'warHero', 'pyramid-solitaire': 'pyramid',
            'trash': 'trashPro', 'go-fish': 'goFish', 'mahjong': 'mahjongMaster',
            'poker': 'pokerFace', 'craps': 'crapsWinner', 'chess': 'chessWinner',
            'checkers': 'checkersWinner', 'rubiks': 'rubiksSolver',
            'wordle': 'wordleSolver', 'waffle': 'wafflePro', 'scrabble': 'scrabbleWin',
            'hangman': 'hangmanWinner', 'memory-match': 'memoryMaster',
            'connect-four': 'connectFourWin', 'snap': 'snapPro', 'bomb-cat': 'bombSurvivor',
            'tic-tac-toe': 'tttWinner', 'battleship': 'battleshipWin',
            'yahtzee': 'yahtzeeWin', 'mastermind': 'mastermindWin',
            'othello': 'othelloWin', 'klondike': 'klondikeWin',
            'boggle': 'boggleWin', 'old-maid': 'oldMaidWin',
            'freecell': 'freecellWin', 'hearts': 'heartsWin',
            'backgammon': 'backgammonWin', 'cribbage': 'cribbageWin',
            'darts': 'dartsWin', 'bowling': 'bowlingWin',
            'gin-rummy': 'ginRummyWin', 'mini-golf': 'miniGolfWin',
            'snake': 'snakeMaster', 'tetris': 'tetrisMaster',
            'asteroids': 'asteroidAce', 'frogger': 'froggerChamp',
            'dig-dug': 'digDugWin', 'minesweeper': 'minesweeperWin'
        };
        if (map[gameId]) payoutAchievement(map[gameId]);
    }
    const casinoGames = ['baccarat', 'three-card-poker', 'roulette', 'blackjack', 'craps', 'plinko', 'poker'];
    if (casinoGames.includes(gameId)) payoutAchievement('casinoStarter');
    checkAchievements();
    saveGameData(); updateStatsUI();
}

function recordGameCompleted() {}

function checkAchievements() {
    if (state.coins >= 1000) payoutAchievement('highRoller');
    saveGameData();
}

function updateStatsUI() {
    document.getElementById('coins-display').textContent = `🪙 ${state.coins} Coins`;
    document.getElementById('level-display').textContent = `⭐ Lv. ${state.level}`;
    document.getElementById('xp-display').textContent = `XP: ${state.xp}/${state.level * 100}`;
    const soundBtn = document.getElementById('sound-toggle');
    if (soundBtn) soundBtn.textContent = AudioFX.muted ? '🔇' : '🔊';
    const titleEl = document.getElementById('title-display');
    if (titleEl && typeof PROFILE_TITLES !== 'undefined') {
        const t = PROFILE_TITLES[state.activeTitle] || PROFILE_TITLES.novice;
        titleEl.textContent = `${t.icon} ${t.name}`;
    }
}

function checkDailyBonus() {
    const today = new Date().toISOString().slice(0, 10);
    if (state.lastDailyDate === today) return;
    let streak;
    if (state.lastDailyDate) {
        const diff = Math.floor((new Date(today) - new Date(state.lastDailyDate)) / (1000 * 60 * 60 * 24));
        streak = diff === 1 ? state.dailyStreak + 1 : 1;
    } else streak = 1;
    state.dailyStreak = streak;
    let reward = 50 + Math.min(streak, 10) * 15;
    if (state.unlockedBoosters.includes('vipPass')) reward = Math.floor(reward * 1.5);
    if (typeof HouseSystem !== 'undefined') reward += HouseSystem.getDailyBonus();
    state.coins += reward;
    state.lastDailyDate = today;
    saveGameData(); updateStatsUI();
    setTimeout(() => showToast(`🎁 Daily Bonus — Day ${state.dailyStreak}! +${reward} coins`, 'success', 6000), 800);
}

function getCoinMultiplier() {
    let mult = 1;
    if (typeof PetSystem !== 'undefined') mult += getPetCoinBonus();
    if (typeof HouseSystem !== 'undefined') mult += HouseSystem.getCoinBonus();
    return Math.min(mult, 2.0);
}
function getXPMultiplier() {
    let mult = 1;
    if (typeof PetSystem !== 'undefined') mult += getPetXPBonus();
    if (typeof HouseSystem !== 'undefined') mult += HouseSystem.getXPBonus();
    return Math.min(mult, 2.0);
}

let currentShopCategory = 'faces';
function renderBoutique() {
    const container = document.getElementById('shop-items-container');
    if (!container) return;
    let items = '';
    if (currentShopCategory === 'faces') {
        items = SHOP_ITEMS.map(item => {
            const owned = state.unlockedSkins.includes(item.id);
            const active = state.activeSkin === item.id;
            return `<div class="shop-item"><div class="preview-box" style="background:${item.color};"></div><h3>${item.name}</h3><p>${item.price === 0 ? 'Free' : `🪙 ${item.price}`}</p><button class="btn ${active ? 'tutorial-btn' : 'primary-btn'}" onclick="purchaseItem('skin','${item.id}',${item.price})">${active ? 'Active ✓' : (owned ? 'Equip' : 'Buy')}</button></div>`;
        }).join('');
    } else if (currentShopCategory === 'backs') {
        items = Object.entries(CARD_BACKS).map(([id, b]) => {
            const owned = state.unlockedCardBacks.includes(id);
            const active = state.activeCardBack === id;
            return `<div class="shop-item"><div class="preview-box" style="background:${b.css}; color:${b.color}; display:flex; align-items:center; justify-content:center; font-size:1.5rem;">🂠</div><h3>${b.name}</h3><p>${b.price === 0 ? 'Free' : `🪙 ${b.price}`}</p><button class="btn ${active ? 'tutorial-btn' : 'primary-btn'}" onclick="purchaseItem('back','${id}',${b.price})">${active ? 'Active ✓' : (owned ? 'Equip' : 'Buy')}</button></div>`;
        }).join('');
    } else if (currentShopCategory === 'themes') {
        items = Object.entries(THEMES).map(([id, t]) => {
            const owned = state.unlockedThemes.includes(id);
            const active = state.activeTheme === id;
            return `<div class="shop-item"><div class="preview-box" style="background:linear-gradient(135deg, ${t.preview}, ${t.vars['--accent-cyan']});"></div><h3>${t.name}</h3><p>${t.price === 0 ? 'Free' : `🪙 ${t.price}`}</p><button class="btn ${active ? 'tutorial-btn' : 'primary-btn'}" onclick="purchaseItem('theme','${id}',${t.price})">${active ? 'Active ✓' : (owned ? 'Equip' : 'Buy')}</button></div>`;
        }).join('');
    } else if (currentShopCategory === 'titles') {
        items = Object.entries(PROFILE_TITLES).map(([id, t]) => {
            const owned = state.unlockedTitles.includes(id);
            const active = state.activeTitle === id;
            return `<div class="shop-item"><div style="text-align:center; font-size:2.5rem; margin-bottom:8px;">${t.icon}</div><h3>${t.name}</h3><p style="font-size:0.85rem; color:var(--text-muted);">${t.desc}</p><p>${t.price === 0 ? 'Free' : `🪙 ${t.price}`}</p><button class="btn ${active ? 'tutorial-btn' : 'primary-btn'}" onclick="purchaseItem('title','${id}',${t.price})">${active ? 'Active ✓' : (owned ? 'Equip' : 'Buy')}</button></div>`;
        }).join('');
    } else if (currentShopCategory === 'boosters') {
        items = Object.entries(BOOSTERS).map(([id, b]) => {
            const owned = state.unlockedBoosters.includes(id);
            return `<div class="shop-item"><div style="text-align:center; font-size:2.5rem; margin-bottom:8px;">${b.icon}</div><h3>${b.name}</h3><p style="font-size:0.85rem; color:var(--text-muted);">${b.desc}</p><p>${owned ? 'Owned' : `🪙 ${b.price}`}</p><button class="btn ${owned ? 'tutorial-btn' : 'primary-btn'}" onclick="purchaseItem('booster','${id}',${b.price})" ${owned ? 'disabled' : ''}>${owned ? 'Owned ✓' : 'Buy'}</button></div>`;
        }).join('');
    }
    container.innerHTML = items;
}

function purchaseItem(category, id, price) {
    if (category === 'skin' && state.unlockedSkins.includes(id)) { state.activeSkin = id; saveGameData(); updateStatsUI(); renderBoutique(); showToast('Equipped!', 'info'); AudioFX.playClick(); return; }
    if (category === 'back' && state.unlockedCardBacks.includes(id)) { state.activeCardBack = id; applyCardBack(id); saveGameData(); renderBoutique(); showToast('Equipped!', 'info'); AudioFX.playClick(); return; }
    if (category === 'theme' && state.unlockedThemes.includes(id)) { state.activeTheme = id; applyTheme(id); saveGameData(); renderBoutique(); showToast('Theme applied!', 'info'); AudioFX.playClick(); return; }
    if (category === 'title' && state.unlockedTitles.includes(id)) { state.activeTitle = id; saveGameData(); updateStatsUI(); renderBoutique(); showToast('Title equipped!', 'info'); AudioFX.playClick(); return; }
    if (category === 'booster' && state.unlockedBoosters.includes(id)) return;
    if (state.coins < price) { showToast(`Not enough coins! Need ${price - state.coins} more.`, 'error'); AudioFX.playClick(); return; }
    state.coins -= price;
    if (category === 'skin') { state.unlockedSkins.push(id); state.activeSkin = id; }
    else if (category === 'back') { state.unlockedCardBacks.push(id); state.activeCardBack = id; applyCardBack(id); }
    else if (category === 'theme') { state.unlockedThemes.push(id); state.activeTheme = id; applyTheme(id); }
    else if (category === 'title') { state.unlockedTitles.push(id); state.activeTitle = id; }
    else if (category === 'booster') { state.unlockedBoosters.push(id); }
    AudioFX.playWin();
    showToast(`✅ Purchased!`, 'success');
    saveGameData(); updateStatsUI(); renderBoutique();
    if (category === 'skin') payoutAchievement('skinCollector');
}

document.querySelectorAll('.cat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        AudioFX.playClick();
        document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentShopCategory = btn.dataset.cat;
        renderBoutique();
    });
});

function renderJukebox() {
    const grid = document.getElementById('jukebox-grid');
    if (!grid) return;
    grid.innerHTML = Object.entries(TRACK_DATA).map(([id, track]) => {
        const unlocked = state.unlockedTracks.includes(id);
        const playing = MusicPlayer.currentTrackId === id;
        const price = TRACK_PRICES[id];
        let btn;
        if (!unlocked) btn = `<button class="btn primary-btn" onclick="buyTrack('${id}', ${price})">Buy (🪙 ${price})</button>`;
        else if (playing) btn = `<button class="btn tutorial-btn" onclick="stopMusic()">⏹ Stop</button>`;
        else btn = `<button class="btn primary-btn" onclick="playMusic('${id}')">▶ Play</button>`;
        return `<div class="shop-item"><div class="preview-box" style="background:linear-gradient(135deg, #1e293b, ${playing ? 'var(--accent-cyan)' : '#475569'}); display:flex; align-items:center; justify-content:center; font-size:2rem;">${playing ? '🎵' : (unlocked ? '🎵' : '🔒')}</div><h3>${track.name}</h3><p style="font-size:0.85rem; color:var(--text-muted);">${track.bpm} BPM · ${track.waveform}</p><p>${unlocked ? (playing ? '▶ Now Playing' : '✅ Owned') : '🔒 Locked'}</p>${btn}</div>`;
    }).join('');
    updateNowPlaying();
}

function playMusic(trackId) {
    if (MusicPlayer.play(trackId)) {
        AudioFX.playClick();
        showToast(`🎵 Now playing: ${TRACK_DATA[trackId].name}`, 'info');
        renderJukebox();
    }
}
function stopMusic() { MusicPlayer.stop(); AudioFX.playClick(); renderJukebox(); }
function buyTrack(trackId, price) {
    if (state.coins < price) { showToast(`Not enough coins!`, 'error'); AudioFX.playClick(); return; }
    state.coins -= price;
    state.unlockedTracks.push(trackId);
    AudioFX.playWin();
    showToast(`🎵 Unlocked: ${TRACK_DATA[trackId].name}!`, 'success');
    saveGameData(); updateStatsUI(); renderJukebox();
}
function updateNowPlaying() {
    const el = document.getElementById('now-playing');
    if (!el) return;
    if (MusicPlayer.currentTrackId) el.innerHTML = `<span style="color:var(--accent-cyan); font-weight:bold;">♪ Now Playing: ${TRACK_DATA[MusicPlayer.currentTrackId].name}</span>`;
    else el.innerHTML = `<span style="color:var(--text-muted);">🔇 Nothing playing</span>`;
}

function achievementProgress(key, ach) {
    if (ach.claimed) return null;
    const stats = state.stats || {};
    const wonCount = (id) => Math.min((stats[id]?.won || 0), 1);
    switch (key) {
        case 'firstGame': return { cur: Math.min(state.gamesPlayed || 0, 1), max: 1, label: 'game' };
        case 'highRoller': return { cur: Math.min(state.coins, 1000), max: 1000, label: 'coins' };
        case 'perfect': return { cur: state.winStreak || 0, max: 10, label: 'wins in a row' };
        case 'jengaPro': return { cur: 0, max: 15, label: 'pulls' };
        case 'snapPro': return { cur: 0, max: 50, label: 'points' };
        case 'scrabbleWin': return { cur: 0, max: 30, label: 'points' };
        case 'blackjack': return { cur: 0, max: 1, label: 'natural BJ' };
        case 'casinoStarter': return { cur: 0, max: 1, label: 'casino game' };
        case 'plinkoDrop': return { cur: 0, max: 1, label: 'drop' };
        case 'unoMaster': return { cur: wonCount('color-match'), max: 1, label: 'win' };
        case 'warHero': return { cur: wonCount('war'), max: 1, label: 'win' };
        case 'pyramid': return { cur: wonCount('pyramid-solitaire'), max: 1, label: 'solve' };
        case 'trashPro': return { cur: wonCount('trash'), max: 1, label: 'win' };
        case 'goFish': return { cur: wonCount('go-fish'), max: 1, label: 'win' };
        case 'mahjongMaster': return { cur: wonCount('mahjong'), max: 1, label: 'clear' };
        case 'pokerFace': return { cur: wonCount('poker'), max: 1, label: 'win' };
        case 'crapsWinner': return { cur: wonCount('craps'), max: 1, label: 'win' };
        case 'chessWinner': return { cur: wonCount('chess'), max: 1, label: 'win' };
        case 'checkersWinner': return { cur: wonCount('checkers'), max: 1, label: 'win' };
        case 'rubiksSolver': return { cur: wonCount('rubiks'), max: 1, label: 'solve' };
        case 'wordleSolver': return { cur: wonCount('wordle'), max: 1, label: 'solve' };
        case 'wafflePro': return { cur: wonCount('waffle'), max: 1, label: 'solve' };
        case 'hangmanWinner': return { cur: wonCount('hangman'), max: 1, label: 'solve' };
        case 'memoryMaster': return { cur: wonCount('memory-match'), max: 1, label: 'clear' };
        case 'connectFourWin': return { cur: wonCount('connect-four'), max: 1, label: 'win' };
        case 'bombSurvivor': return { cur: wonCount('bomb-cat'), max: 1, label: 'survive' };
        case 'tttWinner': return { cur: wonCount('tic-tac-toe'), max: 1, label: 'win' };
        case 'battleshipWin': return { cur: wonCount('battleship'), max: 1, label: 'win' };
        case 'yahtzeeWin': return { cur: wonCount('yahtzee'), max: 1, label: 'win' };
        case 'mastermindWin': return { cur: wonCount('mastermind'), max: 1, label: 'crack' };
        case 'othelloWin': return { cur: wonCount('othello'), max: 1, label: 'win' };
        case 'klondikeWin': return { cur: wonCount('klondike'), max: 1, label: 'solve' };
        case 'boggleWin': return { cur: wonCount('boggle'), max: 1, label: 'win' };
        case 'oldMaidWin': return { cur: wonCount('old-maid'), max: 1, label: 'win' };
        case 'freecellWin': return { cur: wonCount('freecell'), max: 1, label: 'solve' };
        case 'heartsWin': return { cur: wonCount('hearts'), max: 1, label: 'win' };
        case 'backgammonWin': return { cur: wonCount('backgammon'), max: 1, label: 'win' };
        case 'cribbageWin': return { cur: wonCount('cribbage'), max: 1, label: 'win' };
        case 'dartsWin': return { cur: wonCount('darts'), max: 1, label: 'win' };
        case 'bowlingWin': return { cur: wonCount('bowling'), max: 1, label: 'win' };
        case 'ginRummyWin': return { cur: wonCount('gin-rummy'), max: 1, label: 'knock' };
        case 'miniGolfWin': return { cur: wonCount('mini-golf'), max: 1, label: 'hole' };
        case 'snakeMaster': return { cur: wonCount('snake'), max: 1, label: 'win' };
        case 'tetrisMaster': return { cur: wonCount('tetris'), max: 1, label: 'win' };
        case 'asteroidAce': return { cur: wonCount('asteroids'), max: 1, label: 'win' };
        case 'froggerChamp': return { cur: wonCount('frogger'), max: 1, label: 'win' };
        case 'digDugWin': return { cur: wonCount('dig-dug'), max: 1, label: 'clear' };
        case 'minesweeperWin': return { cur: wonCount('minesweeper'), max: 1, label: 'clear' };
        default: return null;
    }
}

function renderAchievements() {
    const container = document.getElementById('achievements-container');
    if (!container) return;
    const statRows = Object.entries(state.stats || {}).sort((a,b) => b[1].played - a[1].played);
    const statsHtml = `<div class="shop-item" style="grid-column: 1 / -1;"><h3>📊 Your Stats</h3><p>Total games: <b>${state.gamesPlayed || 0}</b> · Streak: <b>${state.winStreak || 0}</b> · Daily streak: <b>${state.dailyStreak || 0}</b></p>${statRows.length === 0 ? `<p style="color:#94a3b8;">No games yet!</p>` : `<div style="display:grid; grid-template-columns:repeat(auto-fit,minmax(160px,1fr)); gap:8px; margin-top:10px;">${statRows.map(([id, s]) => `<div style="background:var(--surface-color); padding:10px; border-radius:6px;"><b style="color:var(--accent-cyan); text-transform:uppercase;">${id.replace(/-/g,' ')}</b><br><span style="color:var(--text-muted);">Played:</span> ${s.played} · <span style="color:#22c55e;">Won:</span> ${s.won}<br><span style="color:var(--accent-gold);">🪙 ${s.coinsEarned}</span></div>`).join('')}</div>`}</div>`;
    const achHtml = Object.entries(state.achievements).map(([key, ach]) => {
        const prog = achievementProgress(key, ach);
        const progressHtml = prog ? `<div class="ach-progress"><div class="ach-bar"><div class="ach-bar-fill" style="width:${(prog.cur/prog.max)*100}%"></div></div><span>${prog.cur}/${prog.max} ${prog.label}</span></div>` : '';
        const vip = state.unlockedBoosters.includes('vipPass') ? ' <span style="color:var(--accent-gold);">(+100 VIP)</span>' : '';
        return `<div class="shop-item"><h3>🏆 ${ach.title}</h3><p>${ach.desc}</p><p style="color:var(--accent-gold);">Reward: 🪙 ${ach.reward}${vip}</p>${progressHtml}<button class="btn ${ach.claimed ? 'tutorial-btn' : 'primary-btn'}" disabled>${ach.claimed ? 'Unlocked ✅' : 'In Progress'}</button></div>`;
    }).join('');
    container.innerHTML = statsHtml + achHtml;
}

function renderPets() {
    const container = document.getElementById('pets-container');
    if (!container) return;
    const active = PetSystem.getActive();
    let activeHtml = '';
    if (active) {
        const today = new Date().toISOString().slice(0, 10);
        const fedToday = state.petLastFed === today;
        activeHtml = `<div class="active-pet-card"><div class="pet-avatar">${active.icon}</div><div style="flex:1;"><h2>${active.name}</h2><p style="color:var(--text-muted);">${active.species} · ${active.desc}</p><p><b style="color:var(--accent-cyan);">${active.perk}</b></p><div class="pet-mood-bar"><div class="pet-mood-fill" style="width:${state.petMood || 50}%;"></div></div><p style="font-size:0.85rem; color:var(--text-muted);">Mood: ${state.petMood || 50}%</p></div><div style="display:flex; flex-direction:column; gap:8px;"><button class="btn ${fedToday ? 'tutorial-btn' : 'primary-btn'}" onclick="PetSystem.feed()">${fedToday ? '🍖 Fed Today' : '🍖 Feed (Daily)'}</button><button class="btn tutorial-btn" onclick="PetSystem.petPet()">❤️ Pet</button></div></div>`;
    } else {
        activeHtml = `<div class="active-pet-card" style="text-align:center; padding:30px;"><p style="font-size:3rem; margin:0;">🐾</p><p>You don't have an active pet yet. Choose one below!</p></div>`;
    }
    const shopHtml = `<h3 style="margin-top:30px;">🐾 Companions</h3><div class="shop-grid">${Object.values(PETS).map(pet => {
        const owned = state.unlockedPets.includes(pet.id);
        const isActive = state.activePet === pet.id;
        return `<div class="shop-item ${isActive ? 'pet-active' : ''}"><div style="text-align:center; font-size:3rem; margin-bottom:8px;">${pet.icon}</div><h3>${pet.name}</h3><p style="font-size:0.85rem; color:var(--text-muted);">${pet.species} · ${pet.desc}</p><p style="color:var(--accent-cyan); font-weight:bold; margin:8px 0;">${pet.perk}</p><p style="font-size:0.8rem; color:var(--text-muted);">💡 "${pet.tip.slice(0, 60)}..."</p><p style="font-size:0.75rem; color:var(--accent-gold); margin-top:8px;">Likes: ${pet.likes}</p>${owned ? `<button class="btn ${isActive ? 'tutorial-btn' : 'primary-btn'}" style="margin-top:12px;" onclick="PetSystem.setActive('${pet.id}')">${isActive ? '✓ Active' : 'Make Active'}</button>` : `<button class="btn primary-btn" style="margin-top:12px;" onclick="PetSystem.buy('${pet.id}')">Adopt 🪙 ${pet.price}</button>`}</div>`;
    }).join('')}</div>`;
    container.innerHTML = activeHtml + shopHtml;
}

function showPetTip() {
    if (!state.activePet) { showToast('🐾 Adopt a pet in the Pets tab to receive tips!', 'error', 4000); return; }
    if (GameSession.petTipUsed) { showToast('🐾 Your pet already gave their tip for this game!', 'info'); return; }
    const pet = PETS[state.activePet];
    GameSession.petTipUsed = true;
    AudioFX.playCardSnap();
    showToast(`${pet.icon} <b>${pet.name}'s tip:</b><br>${pet.tip}`, 'info', 10000);
}

function renderHome() {
    const container = document.getElementById('house-container');
    if (!container) return;
    const coinBonus = HouseSystem.getCoinBonus();
    const xpBonus = HouseSystem.getXPBonus();
    const dailyBonus = HouseSystem.getDailyBonus();
    const summary = `<div class="home-summary"><div class="home-stat"><span class="home-stat-label">Coin Bonus</span><b>+${Math.round(coinBonus * 100)}%</b></div><div class="home-stat"><span class="home-stat-label">XP Bonus</span><b>+${Math.round(xpBonus * 100)}%</b></div><div class="home-stat"><span class="home-stat-label">Daily Bonus</span><b>+${dailyBonus} 🪙</b></div></div>`;
    const roomsHtml = Object.values(ROOMS).map(room => {
        const owned = state.unlockedRooms.includes(room.id);
        const roomFurniture = Object.values(FURNITURE).filter(f => f.room === room.id);
        return `<div class="room-card ${owned ? '' : 'room-locked'}" style="background:${room.bg};"><div class="room-header"><div><h3>${room.icon} ${room.name}</h3><p style="font-size:0.85rem; opacity:0.85;">${room.desc}</p></div>${owned ? `<span class="room-badge">Owned</span>` : `<button class="btn primary-btn" onclick="HouseSystem.buyRoom('${room.id}')">Buy 🪙 ${room.price}</button>`}</div>${owned ? `<div class="room-furniture">${roomFurniture.map(f => { const has = state.furniture[f.id]; return `<div class="furniture-slot ${has ? 'owned' : ''}" title="${f.desc}"><div class="furn-icon">${has ? f.icon : '⬜'}</div><div class="furn-name">${has ? f.name : 'Empty slot'}</div>${has ? '' : `<button class="btn primary-btn tiny-btn" onclick="HouseSystem.buyFurniture('${f.id}')">🪙 ${f.price}</button>`}</div>`; }).join('')}</div>` : `<p style="text-align:center; opacity:0.7; margin-top:15px;">🔒 Buy this room to unlock its furniture</p>`}</div>`;
    }).join('');
    container.innerHTML = summary + `<div class="rooms-grid">${roomsHtml}</div>`;
    if (state.unlockedRooms.length >= 4 && !state.achievements.homeOwner.claimed) {
        state.achievements.homeOwner.claimed = true;
        state.coins += state.achievements.homeOwner.reward;
        showToast(`🏆 Achievement: Home Sweet Home! +${state.achievements.homeOwner.reward} Coins`, 'success', 4000);
        saveGameData(); updateStatsUI();
    }
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
    const labels = { '1-ai': 'vs AI', '2-ai': 'vs 2 AI', 'pass-play': 'Pass & Play' };
    document.getElementById('active-game-title').textContent = `${gameId.toUpperCase().replace(/-/g,' ')} [${labels[mode] || mode}]`;
    document.getElementById('in-game-tutorial-btn').onclick = () => { AudioFX.playClick(); startAnimatedTutorial(gameId); };
    const viewport = document.getElementById('game-viewport');
    viewport.innerHTML = '';
    try {
        if (GameEngines[gameId]) GameEngines[gameId].render(viewport, mode);
        else viewport.innerHTML = `<p style="color:#ef4444;">Unknown game: ${gameId}</p>`;
    } catch (e) {
        console.error('Render failed:', e);
        viewport.innerHTML = `<div style="padding:20px; color:#ef4444;"><h3>⚠️ Error</h3><p>${e.message}</p><button class="btn primary-btn" onclick="closeGameStage()">Back to Hub</button></div>`;
    }
    if (typeof applyCardBack === 'function') applyCardBack(state.activeCardBack);
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

function resetSave() {
    if (!confirm('⚠️ This will delete ALL progress. Are you sure?')) return;
    if (!confirm('Really sure? This cannot be undone!')) return;
    localStorage.removeItem('deckRealmState');
    location.reload();
}

document.addEventListener('DOMContentLoaded', () => {
    const vol = document.getElementById('music-volume');
    if (vol) {
        vol.addEventListener('input', (e) => {
            const v = parseInt(e.target.value) / 100;
            MusicPlayer.setVolume(v);
            state.musicVolume = v;
            saveGameData();
        });
    }
});

// Boot
loadGameData();
if (typeof applyTheme === 'function') applyTheme(state.activeTheme || 'dark');
if (typeof applyCardBack === 'function') applyCardBack(state.activeCardBack || 'classic');
AudioFX.muted = !!state.soundMuted;
MusicPlayer.setVolume(state.musicVolume || 0.15);
renderBoutique();
updateStatsUI();
setTimeout(checkDailyBonus, 500);
const volSlider = document.getElementById('music-volume');
if (volSlider) volSlider.value = Math.round((state.musicVolume || 0.15) * 100);
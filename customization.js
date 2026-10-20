const THEMES = {
    dark: { name: 'Dark Arcade', price: 0, preview: '#090d16', vars: { '--bg-dark': '#090d16', '--panel-bg': '#131b2e', '--accent-cyan': '#38bdf8', '--accent-purple': '#a855f7', '--accent-gold': '#f59e0b', '--text-main': '#f8fafc', '--text-muted': '#94a3b8', '--top-bar-bg': '#0f172a', '--border-color': '#1e293b', '--surface-color': '#0f172a' } },
    light: { name: 'Light Mode', price: 400, preview: '#f8fafc', vars: { '--bg-dark': '#f1f5f9', '--panel-bg': '#ffffff', '--accent-cyan': '#0284c7', '--accent-purple': '#7c3aed', '--accent-gold': '#d97706', '--text-main': '#0f172a', '--text-muted': '#64748b', '--top-bar-bg': '#ffffff', '--border-color': '#cbd5e1', '--surface-color': '#e2e8f0' } },
    neon: { name: 'Neon Pulse', price: 700, preview: '#0a0520', vars: { '--bg-dark': '#0a0520', '--panel-bg': '#150a35', '--accent-cyan': '#00f5ff', '--accent-purple': '#ff00e5', '--accent-gold': '#ffea00', '--text-main': '#ffffff', '--text-muted': '#a89ddb', '--top-bar-bg': '#0a0520', '--border-color': '#3d1a80', '--surface-color': '#1a0a4a' } },
    pastel: { name: 'Pastel Dream', price: 600, preview: '#fef3f8', vars: { '--bg-dark': '#fef3f8', '--panel-bg': '#ffffff', '--accent-cyan': '#ec4899', '--accent-purple': '#a855f7', '--accent-gold': '#f59e0b', '--text-main': '#4a044e', '--text-muted': '#9d4edd', '--top-bar-bg': '#fce7f3', '--border-color': '#fbcfe8', '--surface-color': '#ffe4ec' } },
    forest: { name: 'Forest Calm', price: 800, preview: '#0a1f13', vars: { '--bg-dark': '#0a1f13', '--panel-bg': '#15321f', '--accent-cyan': '#4ade80', '--accent-purple': '#22c55e', '--accent-gold': '#fbbf24', '--text-main': '#ecfdf5', '--text-muted': '#86efac', '--top-bar-bg': '#0a1f13', '--border-color': '#166534', '--surface-color': '#1e4530' } },
    ocean: { name: 'Ocean Deep', price: 900, preview: '#021429', vars: { '--bg-dark': '#021429', '--panel-bg': '#042042', '--accent-cyan': '#22d3ee', '--accent-purple': '#0ea5e9', '--accent-gold': '#fbbf24', '--text-main': '#ecfeff', '--text-muted': '#67e8f9', '--top-bar-bg': '#021429', '--border-color': '#075985', '--surface-color': '#052e5c' } }
};

const CARD_BACKS = {
    classic: { name: 'Classic Blue', price: 0, css: 'linear-gradient(135deg, #1e293b, #334155)', color: '#94a3b8' },
    stars: { name: 'Starry Night', price: 300, css: 'radial-gradient(circle at 20% 30%, #fff 1px, transparent 1.5px), radial-gradient(circle at 70% 60%, #fff 1px, transparent 1.5px), linear-gradient(135deg, #0f172a, #1e1b4b)', color: '#fbbf24' },
    flames: { name: 'Flames', price: 500, css: 'linear-gradient(180deg, #7f1d1d 0%, #ef4444 50%, #f97316 100%)', color: '#fef3c7' },
    waves: { name: 'Waves', price: 500, css: 'repeating-linear-gradient(45deg, #0369a1 0 10px, #075985 10px 20px, #0284c7 20px 30px)', color: '#bae6fd' },
    galaxy: { name: 'Galaxy', price: 700, css: 'radial-gradient(circle at 30% 30%, #ec4899 0%, transparent 55%), radial-gradient(circle at 70% 70%, #8b5cf6 0%, transparent 55%), radial-gradient(circle at 50% 50%, #06b6d4 0%, transparent 60%), #0f172a', color: '#f0abfc' },
    circuit: { name: 'Circuit Board', price: 600, css: 'repeating-linear-gradient(0deg, #052e16 0 8px, #166534 8px 9px), repeating-linear-gradient(90deg, #052e16 0 8px, #22c55e 8px 9px)', color: '#4ade80' }
};

const PROFILE_TITLES = {
    novice: { name: 'Card Novice', price: 0, icon: '🎴', desc: 'Where everyone starts' },
    lucky: { name: 'Lucky Ace', price: 300, icon: '🍀', desc: 'Fortune favors you' },
    shark: { name: 'Card Shark', price: 500, icon: '🦈', desc: 'You play to win' },
    highRoller: { name: 'High Roller', price: 800, icon: '💎', desc: 'Big bets, big wins' },
    master: { name: 'Deck Master', price: 1200, icon: '👑', desc: 'Dominating the arena' },
    legend: { name: 'Arena Legend', price: 2500, icon: '🏆', desc: 'The ultimate title' }
};

const BOOSTERS = {
    xpBoost: { name: 'XP Booster', price: 400, icon: '⚡', desc: 'Double all XP earned from games' },
    coinMagnet: { name: 'Coin Magnet', price: 800, icon: '🧲', desc: '+30% bonus coins from every game win' },
    vipPass: { name: 'VIP Pass', price: 1500, icon: '💳', desc: '+100 bonus coins per achievement + daily bonus boosted 50%' }
};

const TRACK_PRICES = { chill: 0, arcade: 300, mystic: 400, space: 500, lofi: 400 };

function applyTheme(themeId) {
    const theme = THEMES[themeId];
    if (!theme) return;
    const root = document.documentElement;
    for (const [key, val] of Object.entries(theme.vars)) root.style.setProperty(key, val);
    document.querySelectorAll('.top-bar').forEach(el => { el.style.background = theme.vars['--top-bar-bg']; });
}

function applyCardBack(backId) {
    const back = CARD_BACKS[backId];
    if (!back) return;
    let styleTag = document.getElementById('card-back-style');
    if (!styleTag) { styleTag = document.createElement('style'); styleTag.id = 'card-back-style'; document.head.appendChild(styleTag); }
    styleTag.textContent = `
        .playing-card.card-back {
            background: ${back.css} !important;
            color: ${back.color} !important;
            border-color: ${back.color}88 !important;
            text-shadow: 0 0 6px ${back.color};
        }`;
    document.querySelectorAll('.playing-card.card-back').forEach(el => {
        el.style.background = back.css;
        el.style.color = back.color;
        el.style.borderColor = back.color + '88';
    });
}
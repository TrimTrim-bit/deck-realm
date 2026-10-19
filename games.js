const SUITS = ['♠', '♥', '♦', '♣'];
const RANKS = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
const FACE_VALUES = { J: 11, Q: 12, K: 13, A: 1 };

function faceValue(r) { return FACE_VALUES[r] !== undefined ? FACE_VALUES[r] : parseInt(r, 10); }
function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
}
function createStandardDeck(withJokers = false) {
    const d = [];
    for (const s of SUITS) for (const r of RANKS) d.push({ rank: r, suit: s, value: faceValue(r) });
    if (withJokers) { d.push({ rank: 'JK', suit: '★', value: 13 }); d.push({ rank: 'JK', suit: '★', value: 13 }); }
    return shuffle(d);
}
function createDeck() { return createStandardDeck(true); }
let activeDeck = createStandardDeck(true);
function drawFromDeck() { if (activeDeck.length === 0) activeDeck = createStandardDeck(true); return activeDeck.pop(); }

function renderCard(rank, suit, color = '') {
    let c = color;
    if (!c) {
        if (suit === '♥' || suit === '♦' || suit === '★') c = 'red';
        else if (suit === '♠' || suit === '♣') c = 'black';
        else c = 'blue';
    }
    const skin = (typeof state !== 'undefined' && state.activeSkin) || 'default';
    return `<div class="playing-card ${c}" data-skin="${skin}">
        <div class="card-top">${rank}<br>${suit}</div>
        <div class="card-center">${suit}</div>
        <div class="card-bottom">${rank}<br>${suit}</div></div>`;
}
function cardBack() {
    const skin = (typeof state !== 'undefined' && state.activeSkin) || 'default';
    return `<div class="playing-card card-back" data-skin="${skin}">🂠</div>`;
}
function setText(id, text, color) {
    const el = document.getElementById(id); if (!el) return;
    el.innerHTML = color ? `<span style="color:${color};">${text}</span>` : text;
}
function finishGame(coins, xp) {
    if (coins > 0 && typeof addCoins === 'function') addCoins(coins);
    if (xp > 0 && typeof addXP === 'function') addXP(xp);
    if (typeof GameSession !== 'undefined' && GameSession.currentGame) {
        const gameId = GameSession.currentGame;
        if (typeof recordGameResult === 'function') recordGameResult(gameId, coins > 0, coins || 0, xp || 0);
        GameSession.setTimer(() => {
            const viewport = document.getElementById('game-viewport');
            if (!viewport || viewport.querySelector('.end-buttons')) return;
            const safeId = gameId.replace(/[^a-z0-9-]/gi, '');
            const mode = GameSession.currentMode || '1-ai';
            const bar = document.createElement('div');
            bar.className = 'end-buttons';
            bar.innerHTML = `<button class="btn primary-btn" onclick="openGame('${safeId}', '${mode}')">🔁 Play Again</button>
                <button class="btn tutorial-btn" onclick="closeGameStage()">← Back to Hub</button>`;
            viewport.appendChild(bar);
        }, 100);
    }
}

// Poker hand evaluator
function pokerValue(rank) {
    if (rank === 'A') return 14;
    if (rank === 'K') return 13;
    if (rank === 'Q') return 12;
    if (rank === 'J') return 11;
    return parseInt(rank, 10);
}
function eval5(cards) {
    const vals = cards.map(c => pokerValue(c.rank)).sort((a,b) => b-a);
    const suits = cards.map(c => c.suit);
    const flush = suits.every(s => s === suits[0]);
    const uniqueVals = [...new Set(vals)];
    const isStraight = (uniqueVals.length === 5) && (
        (vals[0] - vals[4] === 4) ||
        (vals[0] === 14 && vals[1] === 5 && vals[2] === 4 && vals[3] === 3 && vals[4] === 2)
    );
    const straightHigh = (vals[0] === 14 && vals[1] === 5) ? 5 : vals[0];
    const counts = {};
    vals.forEach(v => counts[v] = (counts[v] || 0) + 1);
    const groups = Object.entries(counts).map(([v, n]) => ({v: parseInt(v), n})).sort((a,b) => {
        if (b.n !== a.n) return b.n - a.n;
        return b.v - a.v;
    });
    if (isStraight && flush) return { rank: 8, name: straightHigh === 14 ? 'Royal Flush' : 'Straight Flush', tb: [straightHigh] };
    if (groups[0].n === 4) return { rank: 7, name: 'Four of a Kind', tb: [groups[0].v, groups[1].v] };
    if (groups[0].n === 3 && groups[1].n === 2) return { rank: 6, name: 'Full House', tb: [groups[0].v, groups[1].v] };
    if (flush) return { rank: 5, name: 'Flush', tb: vals };
    if (isStraight) return { rank: 4, name: 'Straight', tb: [straightHigh] };
    if (groups[0].n === 3) return { rank: 3, name: 'Three of a Kind', tb: [groups[0].v, ...groups.slice(1).map(g=>g.v)] };
    if (groups[0].n === 2 && groups[1] && groups[1].n === 2) return { rank: 2, name: 'Two Pair', tb: [groups[0].v, groups[1].v, groups[2].v] };
    if (groups[0].n === 2) return { rank: 1, name: 'Pair', tb: [groups[0].v, ...groups.slice(1).map(g=>g.v)] };
    return { rank: 0, name: 'High Card', tb: vals };
}
function evalBest7(cards) {
    if (cards.length === 5) return eval5(cards);
    if (cards.length < 5) return null;
    let best = null;
    const n = cards.length;
    for (let i = 0; i < n; i++) for (let j = i+1; j < n; j++) {
        const hand = [];
        for (let k = 0; k < n; k++) if (k !== i && k !== j) hand.push(cards[k]);
        if (hand.length !== 5) continue;
        const ev = eval5(hand);
        if (!best || compareHands(ev, best) > 0) best = ev;
    }
    return best;
}
function compareHands(a, b) {
    if (a.rank !== b.rank) return a.rank - b.rank;
    for (let i = 0; i < Math.max(a.tb.length, b.tb.length); i++) {
        const av = a.tb[i] || 0, bv = b.tb[i] || 0;
        if (av !== bv) return av - bv;
    }
    return 0;
}

const GameEngines = {

    // ============ 1. FLUX SHIFT ============
    'flux-shift': {
        lanes: [0,0,0], laneCards: [[],[],[]], busted: [false,false,false],
        pending: null, turn: 0, maxTurns: 6, over: false,
        render(container, mode) {
            const g = GameEngines['flux-shift'];
            activeDeck = createStandardDeck(true);
            g.lanes = [0,0,0]; g.laneCards = [[],[],[]]; g.busted = [false,false,false];
            g.pending = null; g.turn = 0; g.over = false;
            container.innerHTML = `
                <h3>⚡ Flux Shift Arena (${mode.toUpperCase()})</h3>
                <p>You get ${g.maxTurns} cards. Place each into a lane — keep every lane ≤ 21.</p>
                <div id="flux-lanes" style="display:flex; justify-content:center; gap:16px; margin:20px 0; flex-wrap:wrap;">
                    ${[0,1,2].map(i => `<div class="lane-box">
                        <h4>Lane ${i+1} — <span id="lane-sum-${i}">0</span>/21</h4>
                        <div id="lane-cards-${i}" class="lane-cards"></div>
                        <button class="btn primary-btn lane-btn" data-lane="${i}" disabled
                            onclick="AudioFX.playCardSnap(); GameEngines['flux-shift'].place(${i})">Place Here</button>
                    </div>`).join('')}
                </div>
                <div id="flux-pending" style="margin:12px 0; min-height:130px;"></div>
                <button id="flux-btn" class="btn primary-btn"
                    onclick="AudioFX.playCardSnap(); GameEngines['flux-shift'].drawCard()">Draw Card</button>
                <div id="flux-status" style="margin-top:15px; font-weight:bold;">Draw your first card!</div>`;
            g.updateUI();
        },
        updateUI() {
            const g = this;
            for (let i = 0; i < 3; i++) {
                const s = document.getElementById(`lane-sum-${i}`);
                const c = document.getElementById(`lane-cards-${i}`);
                const b = document.querySelector(`.lane-btn[data-lane="${i}"]`);
                if (!s) continue;
                s.textContent = g.busted[i] ? 'BUST' : g.lanes[i];
                s.style.color = g.busted[i] ? '#ef4444' : 'inherit';
                c.innerHTML = g.laneCards[i].map(x => renderCard(x.rank, x.suit)).join('');
                if (b) b.disabled = g.over || g.busted[i] || !g.pending || g.turn >= g.maxTurns;
            }
            const p = document.getElementById('flux-pending');
            if (p) p.innerHTML = g.pending ? `<div style="font-weight:bold;">Drawn: ${renderCard(g.pending.rank, g.pending.suit)}<br>Choose a lane.</div>` : '';
            const btn = document.getElementById('flux-btn');
            if (btn) {
                btn.disabled = g.over || !!g.pending || g.turn >= g.maxTurns;
                btn.textContent = g.turn >= g.maxTurns ? 'Game Over' : `Draw Card (${g.turn}/${g.maxTurns})`;
            }
        },
        drawCard() {
            const g = this;
            if (g.over || g.pending || g.turn >= g.maxTurns) return;
            g.pending = drawFromDeck();
            setText('flux-status', `Drew ${g.pending.rank}${g.pending.suit} (value ${g.pending.value}). Pick a lane!`);
            g.updateUI();
        },
        place(i) {
            const g = this;
            if (g.over || !g.pending || g.busted[i]) return;
            const c = g.pending; g.pending = null;
            g.laneCards[i].push(c); g.lanes[i] += c.value; g.turn++;
            if (g.lanes[i] > 21) { g.busted[i] = true; AudioFX.playClick(); setText('flux-status', `💥 Lane ${i+1} busted at ${g.lanes[i]}!`, '#ef4444'); }
            else setText('flux-status', `Placed ${c.rank}${c.suit} in Lane ${i+1}.`);
            if (g.turn >= g.maxTurns) g.endGame(); else g.updateUI();
        },
        endGame() {
            const g = this; g.over = true;
            const safe = g.busted.filter(b => !b).length;
            const coins = safe * 12 + (safe === 3 ? 15 : 0);
            AudioFX.playWin();
            setText('flux-status', `🏁 ${safe}/3 safe lanes — +${coins} Coins`, safe === 3 ? '#22c55e' : '#f59e0b');
            finishGame(coins, safe * 10);
            g.updateUI();
        }
    },

    // ============ 2. UNO ============
    'color-match': {
        COLORS: ['red','blue','green','yellow'],
        SUIT_FOR: { red: '♥', blue: '♠', green: '♣', yellow: '♦' },
        deck: [], player: [], ai: [], discard: [], color: '', over: false, aiThinking: false,
        buildUnoDeck() {
            const d = [];
            for (const c of this.COLORS) {
                d.push({ color: c, value: '0' });
                for (let n = 1; n <= 9; n++) { d.push({ color: c, value: String(n) }); d.push({ color: c, value: String(n) }); }
                for (const v of ['skip','reverse','draw2','skip','reverse','draw2']) d.push({ color: c, value: v });
            }
            for (let i = 0; i < 4; i++) { d.push({ color: 'wild', value: 'wild' }); d.push({ color: 'wild', value: 'wild_draw4' }); }
            return shuffle(d);
        },
        cardHTML(card) {
            if (card.color === 'wild') return renderCard(card.value === 'wild_draw4' ? '+4' : 'WILD', '★', 'yellow');
            const display = { skip: 'SKIP', reverse: 'REV', draw2: '+2' }[card.value] || card.value;
            return renderCard(display, this.SUIT_FOR[card.color], card.color);
        },
        topCard() { return this.discard[this.discard.length - 1]; },
        isPlayable(card) {
            if (card.color === 'wild') return true;
            return card.color === this.color || card.value === this.topCard().value;
        },
        hasColorMatch() { return this.player.some(c => c.color === this.color); },
        canPlayWildDraw4() { return !this.hasColorMatch(); },
        render(container, mode) {
            const g = this;
            g.deck = g.buildUnoDeck();
            g.player = []; g.ai = [];
            for (let i = 0; i < 7; i++) { g.player.push(g.deck.pop()); g.ai.push(g.deck.pop()); }
            let first = g.deck.pop();
            while (first.color === 'wild') { g.deck.unshift(first); first = g.deck.pop(); }
            g.discard = [first]; g.color = first.color; g.over = false; g.aiThinking = false;
            container.innerHTML = `
                <h3>🎨 Color Match (UNO!) — ${mode.toUpperCase()}</h3>
                <p>Match by colour, number, or symbol. Wilds go anywhere. Empty your hand to win!</p>
                <div id="cm-table" style="margin:20px 0; display:flex; justify-content:center; align-items:center; gap:24px; flex-wrap:wrap;">
                    <div><p>Discard Pile</p><div id="top-table-card" style="display:inline-block;"></div>
                        <p style="margin-top:8px;">Active colour: <b id="cm-color"></b></p></div>
                    <div><p>Opponent (<span id="cm-ai-count"></span> cards)</p>
                        <div id="cm-ai-hand" style="display:flex; justify-content:center; gap:2px;"></div></div>
                </div>
                <p>Your Hand:</p>
                <div id="cm-hand" style="display:flex; flex-wrap:wrap; justify-content:center; gap:8px; margin:15px 0; min-height:130px;"></div>
                <button id="cm-draw" class="btn primary-btn">Draw Card</button>
                <div id="cm-status" style="margin-top:15px; font-weight:bold;">Play a matching card or draw!</div>`;
            document.getElementById('cm-draw').onclick = () => { AudioFX.playCardSnap(); g.draw(); };
            g.refresh();
        },
        refresh() {
            const g = this;
            document.getElementById('top-table-card').innerHTML = g.cardHTML(g.topCard());
            document.getElementById('cm-color').textContent = g.color.toUpperCase();
            document.getElementById('cm-color').style.color = g.color;
            document.getElementById('cm-ai-count').textContent = g.ai.length;
            document.getElementById('cm-ai-hand').innerHTML = g.ai.slice(0, 7).map(() => cardBack()).join('');
            const canW4 = g.canPlayWildDraw4();
            document.getElementById('cm-hand').innerHTML = g.player.map((c, i) => {
                const p = g.isPlayable(c) && !(c.value === 'wild_draw4' && !canW4);
                return `<div style="cursor:pointer; ${p ? 'outline:3px solid #22c55e; border-radius:8px;' : 'opacity:0.5;'}"
                    onclick="GameEngines['color-match'].play(${i})">${g.cardHTML(c)}</div>`;
            }).join('');
            document.getElementById('cm-draw').disabled = g.over || g.aiThinking;
        },
        pickBestColor(hand) {
            const counts = {};
            for (const c of hand) if (c.color !== 'wild') counts[c.color] = (counts[c.color] || 0) + 1;
            let best = this.COLORS[0], n = -1;
            for (const c in counts) if (counts[c] > n) { best = c; n = counts[c]; }
            return best;
        },
        drawN(n) {
            const g = this, cards = [];
            for (let i = 0; i < n; i++) { if (g.deck.length === 0) g.reshuffle(); if (g.deck.length > 0) cards.push(g.deck.pop()); }
            return cards;
        },
        reshuffle() {
            const top = this.discard.pop();
            this.deck = shuffle(this.discard);
            this.discard = [top];
        },
        play(i) {
            const g = this;
            if (g.over || g.aiThinking) return;
            const card = g.player[i];
            if (!g.isPlayable(card)) { setText('cm-status', 'Card does not match.', '#ef4444'); return; }
            if (card.value === 'wild_draw4' && !g.canPlayWildDraw4()) { setText('cm-status', 'WILD+4 needs no colour match!', '#ef4444'); return; }
            g.player.splice(i, 1);
            g.discard.push(card);
            AudioFX.playCardSnap();
            const endTurn = () => {
                if (g.player.length === 0) { g.win(); return; }
                g.aiThinking = true; g.refresh();
                GameSession.setTimer(() => g.aiTurn(), 500);
            };
            if (card.color === 'wild') {
                g.color = g.pickBestColor(g.player);
                if (card.value === 'wild_draw4') {
                    g.ai.push(...g.drawN(4));
                    setText('cm-status', `WILD DRAW FOUR! Colour → ${g.color.toUpperCase()}.`, '#22c55e');
                    g.aiThinking = false; g.refresh();
                    if (g.player.length === 0) g.win();
                    return;
                }
                setText('cm-status', `WILD. Colour → ${g.color.toUpperCase()}.`, '#22c55e');
                return endTurn();
            }
            g.color = card.color;
            if (card.value === 'skip' || card.value === 'reverse') {
                setText('cm-status', `${card.value.toUpperCase()}! Opponent skipped.`, '#22c55e');
                g.aiThinking = false; g.refresh();
                if (g.player.length === 0) g.win();
                return;
            }
            if (card.value === 'draw2') {
                g.ai.push(...g.drawN(2));
                setText('cm-status', `DRAW TWO! Opponent draws 2 and is skipped.`, '#22c55e');
                g.aiThinking = false; g.refresh();
                if (g.player.length === 0) g.win();
                return;
            }
            setText('cm-status', `You played ${card.value}.`);
            endTurn();
        },
        draw() {
            const g = this;
            if (g.over || g.aiThinking) return;
            if (g.deck.length === 0) g.reshuffle();
            const card = g.deck.pop();
            g.player.push(card);
            AudioFX.playCardSnap();
            if (g.isPlayable(card)) { setText('cm-status', `Drew ${card.value} — playable!`, '#22c55e'); g.refresh(); }
            else { setText('cm-status', `Drew ${card.value} — not playable.`); g.aiThinking = true; g.refresh(); GameSession.setTimer(() => g.aiTurn(), 500); }
        },
        aiTurn() {
            const g = this;
            if (g.over) return;
            if (g.deck.length === 0) g.reshuffle();
            const canW4 = !g.ai.some(c => c.color === g.color);
            const playable = g.ai.map((c,i) => ({c,i})).filter(({c}) => g.isPlayable(c) && !(c.value === 'wild_draw4' && !canW4));
            if (playable.length === 0) {
                const drew = g.deck.pop();
                if (drew) {
                    g.ai.push(drew);
                    if (g.isPlayable(drew) && !(drew.value === 'wild_draw4' && !canW4)) {
                        g.ai.splice(g.ai.length - 1, 1);
                        g.aiPlayCard(drew);
                        return;
                    }
                }
                setText('cm-status', 'Opponent drew and passed. Your turn!');
                g.aiThinking = false; g.refresh();
                return;
            }
            const nonWild = playable.filter(({c}) => c.color !== 'wild');
            const pick = (nonWild.length > 0 ? nonWild : playable)[0];
            g.ai.splice(pick.i, 1);
            g.aiPlayCard(pick.c);
        },
        aiPlayCard(card) {
            const g = this;
            g.discard.push(card);
            AudioFX.playCardSnap();
            const endTurn = () => { g.aiThinking = false; g.refresh(); if (g.ai.length === 0) g.lose(); };
            if (card.color === 'wild') {
                g.color = g.pickBestColor(g.ai);
                if (card.value === 'wild_draw4') {
                    g.player.push(...g.drawN(4));
                    setText('cm-status', `Opponent WILD+4! You draw 4. Colour: ${g.color.toUpperCase()}.`, '#ef4444');
                    GameSession.setTimer(() => g.aiTurn(), 500);
                    return;
                }
                setText('cm-status', `Opponent WILD. Colour: ${g.color.toUpperCase()}. Your turn.`);
                endTurn(); return;
            }
            g.color = card.color;
            if (card.value === 'skip' || card.value === 'reverse' || card.value === 'draw2') {
                if (card.value === 'draw2') g.player.push(...g.drawN(2));
                setText('cm-status', `Opponent played ${card.value.toUpperCase()}! Skipped.`, '#ef4444');
                GameSession.setTimer(() => g.aiTurn(), 500);
                return;
            }
            setText('cm-status', `Opponent played ${card.value}. Your turn!`);
            endTurn();
        },
        win() { this.over = true; this.refresh(); AudioFX.playWin(); setText('cm-status', '🎉 UNO! +60 Coins', '#22c55e'); finishGame(60, 40); },
        lose() { this.over = true; this.refresh(); AudioFX.playClick(); setText('cm-status', '😅 Opponent won. No reward.', '#ef4444'); finishGame(0, 10); }
    },

    // ============ 3. PYRAMID ============
    'pyramid-solitaire': {
        rows: [], cleared: [], stock: [], waste: null, discarded: [], sel: null, over: false, recyclesLeft: 2,
        render(container, mode) {
            const g = this;
            const deck = createStandardDeck(false);
            g.rows = []; g.cleared = [];
            for (let r = 0; r < 7; r++) {
                g.rows.push([]); g.cleared.push([]);
                for (let c = 0; c <= r; c++) { g.rows[r].push(deck.pop()); g.cleared[r].push(false); }
            }
            g.stock = deck; g.waste = null; g.discarded = []; g.sel = null; g.over = false; g.recyclesLeft = 2;
            container.innerHTML = `
                <h3>🏛️ Pyramid Solitaire — ${mode.toUpperCase()}</h3>
                <p>Click two exposed cards summing to 13. Kings clear alone. 2 recycles max.</p>
                <div id="pyramid-board" style="display:flex; flex-direction:column; gap:6px; align-items:center; margin:20px 0;"></div>
                <div style="display:flex; gap:16px; align-items:center; justify-content:center; margin:15px 0; flex-wrap:wrap;">
                    <div><div style="font-size:0.8rem; color:#94a3b8; margin-bottom:4px;">Waste</div><div id="pyr-waste"></div></div>
                    <button id="pyr-draw" class="btn primary-btn"
                        onclick="AudioFX.playCardSnap(); GameEngines['pyramid-solitaire'].drawStock()">Draw Stock</button>
                </div>
                <div style="color:#94a3b8; font-size:0.85rem;" id="pyr-info"></div>
                <div id="pyr-status" style="margin-top:15px; font-weight:bold;">Select a card to begin.</div>`;
            g.refresh();
        },
        isExposed(r, c) {
            if (this.cleared[r][c]) return false;
            if (r === this.rows.length - 1) return true;
            return this.cleared[r+1][c] && this.cleared[r+1][c+1];
        },
        refresh() {
            const g = this;
            const board = document.getElementById('pyramid-board');
            if (!board) return;
            board.innerHTML = g.rows.map((row, r) => `<div style="display:flex; gap:6px; justify-content:center;">
                ${row.map((card, c) => {
                    if (g.cleared[r][c]) return `<div style="width:75px;height:110px;opacity:0.1;"></div>`;
                    const exp = g.isExposed(r, c);
                    const sel = g.sel && g.sel.type === 'pyr' && g.sel.r === r && g.sel.c === c;
                    return `<div style="opacity:${exp?1:0.5}; cursor:${exp?'pointer':'default'}; outline:${sel?'3px solid #f59e0b':'none'}; border-radius:8px;"
                        onclick="GameEngines['pyramid-solitaire'].clickPyramid(${r},${c})">${renderCard(card.rank, card.suit)}</div>`;
                }).join('')}</div>`).join('');
            const w = document.getElementById('pyr-waste');
            w.innerHTML = g.waste ? `<div style="cursor:pointer; outline:${g.sel && g.sel.type==='waste'?'3px solid #f59e0b':'none'}; border-radius:8px;"
                onclick="GameEngines['pyramid-solitaire'].clickWaste()">${renderCard(g.waste.rank, g.waste.suit)}</div>`
                : `<div class="playing-card card-empty">—</div>`;
            const btn = document.getElementById('pyr-draw');
            if (btn) {
                btn.disabled = g.over || (g.stock.length === 0 && g.discarded.length === 0);
                btn.textContent = g.stock.length > 0 ? `Draw (${g.stock.length})`
                    : g.discarded.length > 0 ? `Recycle (${g.recyclesLeft} left)` : 'Out';
            }
            const info = document.getElementById('pyr-info');
            if (info) info.textContent = `Stock: ${g.stock.length} · Discard: ${g.discarded.length} · Recycles: ${g.recyclesLeft}`;
        },
        clickPyramid(r, c) {
            const g = this;
            if (g.over || !g.isExposed(r, c)) return;
            const card = g.rows[r][c];
            if (card.value === 13) { g.cleared[r][c] = true; g.sel = null; AudioFX.playWin(); setText('pyr-status', 'King cleared!'); g.refresh(); g.checkWin(); return; }
            if (g.sel && g.sel.type === 'pyr' && g.sel.r === r && g.sel.c === c) { g.sel = null; g.refresh(); return; }
            if (g.sel) {
                const other = g.sel.type === 'pyr' ? g.rows[g.sel.r][g.sel.c] : g.waste;
                if (other && other.value + card.value === 13) {
                    if (g.sel.type === 'pyr') g.cleared[g.sel.r][g.sel.c] = true;
                    else g.waste = null;
                    g.cleared[r][c] = true; g.sel = null;
                    AudioFX.playWin();
                    setText('pyr-status', `Cleared ${other.rank} + ${card.rank} = 13!`);
                    g.refresh(); g.checkWin(); return;
                }
            }
            g.sel = { type: 'pyr', r, c };
            setText('pyr-status', `Selected ${card.rank}${card.suit}.`);
            g.refresh();
        },
        clickWaste() {
            const g = this;
            if (g.over || !g.waste) return;
            if (g.waste.value === 13) { g.waste = null; g.sel = null; AudioFX.playCardSnap(); setText('pyr-status', 'Waste King discarded.'); g.refresh(); return; }
            if (g.sel && g.sel.type === 'pyr') {
                const other = g.rows[g.sel.r][g.sel.c];
                if (other.value + g.waste.value === 13) {
                    g.cleared[g.sel.r][g.sel.c] = true;
                    const wr = g.waste.rank;
                    g.waste = null; g.sel = null;
                    AudioFX.playWin();
                    setText('pyr-status', `Cleared ${other.rank} + ${wr} = 13!`);
                    g.refresh(); g.checkWin(); return;
                }
            }
            g.sel = { type: 'waste' };
            setText('pyr-status', `Selected waste ${g.waste.rank}.`);
            g.refresh();
        },
        drawStock() {
            const g = this;
            if (g.over) return;
            if (g.stock.length === 0) {
                if (g.discarded.length === 0) return;
                if (g.recyclesLeft <= 0) { setText('pyr-status', 'No recycles left!', '#ef4444'); g.over = true; finishGame(0, 10); g.refresh(); return; }
                g.recyclesLeft--;
                g.stock = shuffle(g.discarded);
                g.discarded = [];
            }
            if (g.waste) g.discarded.push(g.waste);
            g.waste = g.stock.pop();
            g.sel = null;
            AudioFX.playCardSnap();
            g.refresh();
        },
        checkWin() {
            const g = this;
            if (g.cleared.every(row => row.every(v => v))) {
                g.over = true; AudioFX.playWin();
                setText('pyr-status', '✨ Solved! +80 Coins', '#22c55e');
                finishGame(80, 50);
                g.refresh();
            }
        }
    },

    // ============ 4. QUANTUM SWAP ============
    'quantum-swap': {
        parity: 'even', matches: 0, lives: 2, over: false,
        render(container, mode) {
            const g = this;
            activeDeck = createStandardDeck(true);
            g.parity = Math.random() < 0.5 ? 'even' : 'odd';
            g.matches = 0; g.lives = 2; g.over = false;
            container.innerHTML = `
                <h3>🌌 Quantum Swap — ${mode.toUpperCase()}</h3>
                <p>Draw cards to stabilize the portal. 2 matches wins, 2 wrongs collapse it!</p>
                <div id="qs-board" style="background:#1e293b; padding:20px; border-radius:10px; max-width:400px; margin:20px auto;">
                    <p>Portal wants: <b style="color:#38bdf8;">${g.parity.toUpperCase()}</b></p>
                    <p>Stabilizers: <b id="qs-progress">0 / 2</b> · Stability: <span id="qs-lives">❤ ❤</span></p>
                    <div id="qs-card-slot" style="min-height:130px; margin-top:10px;">🂠</div>
                </div>
                <button id="qs-btn" class="btn primary-btn"
                    onclick="AudioFX.playCardSnap(); GameEngines['quantum-swap'].draw()">Draw Card</button>
                <div id="qs-status" style="margin-top:15px; font-weight:bold;">Click to test the portal!</div>`;
        },
        draw() {
            const g = this;
            if (g.over) return;
            const card = drawFromDeck();
            const match = (g.parity === 'even') === (card.value % 2 === 0);
            document.getElementById('qs-card-slot').innerHTML = renderCard(card.rank, card.suit);
            if (match) { g.matches++; AudioFX.playWin(); setText('qs-status', `✅ ${card.rank} matched!`, '#22c55e'); }
            else { g.lives--; AudioFX.playClick(); setText('qs-status', `❌ ${card.rank} mismatched!`, '#ef4444'); }
            document.getElementById('qs-progress').textContent = `${Math.min(g.matches, 2)} / 2`;
            document.getElementById('qs-lives').textContent = g.lives <= 0 ? '💔' : ('❤ '.repeat(g.lives)).trim();
            if (g.matches >= 2) { g.over = true; document.getElementById('qs-btn').disabled = true; AudioFX.playWin(); setText('qs-status', '🎉 +40 Coins', '#22c55e'); finishGame(40, 30); }
            else if (g.lives <= 0) { g.over = true; document.getElementById('qs-btn').disabled = true; setText('qs-status', '💥 Collapsed! No reward.', '#ef4444'); finishGame(0, 8); }
        }
    },

    // ============ 5. TRASH ============
    'trash': {
        SLOTS: 10, slots: [], stock: [], over: false, drawsUsed: 0,
        render(container, mode) {
            const g = this;
            g.stock = createStandardDeck(false);
            g.slots = [];
            for (let i = 0; i < g.SLOTS; i++) g.slots.push({ card: g.stock.pop(), faceUp: false });
            g.over = false; g.drawsUsed = 0;
            container.innerHTML = `
                <h3>🗑️ Trash — ${mode.toUpperCase()}</h3>
                <p>10 face-down cards in slots 1-10. Draw a card — if it matches its slot, place it face-up and flip the card there to chain!</p>
                <p>Jacks & Queens are duds. Kings are wild. Fill all 10 slots to win.</p>
                <div id="trash-board" style="display:flex; gap:6px; justify-content:center; margin:20px 0; flex-wrap:wrap;"></div>
                <button id="trash-btn" class="btn primary-btn"
                    onclick="AudioFX.playCardSnap(); GameEngines.trash.draw()">Draw From Stock (<span id="trash-remaining">${g.stock.length}</span> left)</button>
                <div id="trash-log" style="margin-top:10px; color:#94a3b8; font-size:0.85rem; min-height:1em; line-height:1.5;"></div>
                <div id="trash-status" style="margin-top:15px; font-weight:bold;">Click to draw!</div>`;
            g.refresh();
        },
        refresh() {
            const g = this;
            const required = ['A','2','3','4','5','6','7','8','9','10'];
            const board = document.getElementById('trash-board');
            if (!board) return;
            board.innerHTML = g.slots.map((s, i) => {
                const correct = s.faceUp && s.card.rank === required[i];
                return `<div style="text-align:center;">
                    <div style="font-size:0.8rem; color:#94a3b8; margin-bottom:4px;">${required[i]}</div>
                    ${s.faceUp ? renderCard(s.card.rank, s.card.suit) : cardBack()}
                    ${correct ? '<div style="color:#22c55e; font-size:0.9rem;">✓</div>' : '<div style="height:14px;"></div>'}
                </div>`;
            }).join('');
            const rem = document.getElementById('trash-remaining');
            if (rem) rem.textContent = g.stock.length;
        },
        draw() {
            const g = this;
            if (g.over || g.stock.length === 0) return;
            let card = g.stock.pop();
            g.drawsUsed++;
            const log = [];
            let chain = 0;
            while (card && chain++ < 30) {
                if (card.rank === 'J' || card.rank === 'Q') { log.push(`${card.rank}${card.suit} → discard`); card = null; break; }
                if (card.rank === 'K') {
                    const idx = g.slots.findIndex(s => !s.faceUp);
                    if (idx < 0) { log.push(`K${card.suit} → no free slot`); card = null; break; }
                    log.push(`K${card.suit} → wild slot ${idx+1}, flips ${g.slots[idx].card.rank}`);
                    const old = g.slots[idx].card;
                    g.slots[idx].card = card; g.slots[idx].faceUp = true;
                    card = old; continue;
                }
                const num = card.rank === 'A' ? 1 : parseInt(card.rank, 10);
                if (num < 1 || num > 10) { log.push(`${card.rank} → invalid`); card = null; break; }
                const idx = num - 1;
                const slot = g.slots[idx];
                if (slot.faceUp && slot.card.rank === card.rank) { log.push(`${card.rank}${card.suit} → slot ${idx+1} already correct`); card = null; break; }
                log.push(`${card.rank}${card.suit} → slot ${idx+1}${slot.faceUp ? ' (swaps wrong card)' : ' (flips '+slot.card.rank+')'}`);
                const old = slot.card;
                slot.card = card; slot.faceUp = true;
                card = old;
            }
            document.getElementById('trash-log').innerHTML = log.join('<br>');
            AudioFX.playCardSnap();
            g.refresh();
            const required = ['A','2','3','4','5','6','7','8','9','10'];
            if (g.slots.every((s, i) => s.faceUp && s.card.rank === required[i])) { g.win(); return; }
            if (g.stock.length === 0) { g.lose(); return; }
            setText('trash-status', `Draw ${g.drawsUsed} done. Keep going!`);
        },
        win() { this.over = true; AudioFX.playWin(); setText('trash-status', `🎉 All 10 slots filled! +80 Coins`, '#22c55e'); finishGame(80, 50); },
        lose() {
            this.over = true; AudioFX.playClick();
            const req = ['A','2','3','4','5','6','7','8','9','10'];
            const filled = this.slots.filter((s, i) => s.faceUp && s.card.rank === req[i]).length;
            setText('trash-status', `⏳ Out of cards! Filled ${filled}/10. No reward.`, '#ef4444');
            finishGame(0, 10);
        }
    },

    // ============ 6. BLACKJACK ============
    'blackjack': {
        deck: [], player: [], dealer: [], over: false, hidden: true, bet: 0, _coinsAtStart: 0,
        render(container, mode) {
            container.innerHTML = `
                <h3>♠️ Vegas Blackjack — ${mode.toUpperCase()}</h3>
                <p class="play-money-note">🎲 Play money only — no real currency is involved.</p>
                <div id="bj-bet-area"></div>
                <div id="bj-game-area" style="display:none;">
                    <div style="margin:15px 0;"><h4>Dealer <span id="bj-dsum"></span></h4>
                        <div id="dealer-cards" style="display:flex; justify-content:center; gap:8px;"></div></div>
                    <div style="margin:15px 0;"><h4>You (Sum: <span id="p-sum">0</span>) · Bet: <span id="bj-bet-display">0</span></h4>
                        <div id="player-cards" style="display:flex; justify-content:center; gap:8px;"></div></div>
                    <div id="bj-buttons" style="display:flex; gap:10px; justify-content:center; margin-top:20px;">
                        <button id="hit-btn" class="btn primary-btn" onclick="AudioFX.playCardSnap(); GameEngines.blackjack.hit()">Hit</button>
                        <button id="stand-btn" class="btn tutorial-btn" onclick="AudioFX.playCardSnap(); GameEngines.blackjack.stand()">Stand</button>
                    </div>
                    <div id="bj-status" style="margin-top:20px; font-weight:bold;"></div>
                </div>`;
            this.showBetUI();
        },
        showBetUI() {
            this._betRef = renderBetPanel('bj-bet-area', 'Blackjack');
            const area = document.getElementById('bj-bet-area');
            if (!area) return;
            if (this._betRef) {
                const btn = document.createElement('button');
                btn.className = 'btn primary-btn'; btn.style.marginTop = '10px'; btn.textContent = 'Deal Cards';
                btn.onclick = () => GameEngines.blackjack.startHand();
                area.querySelector('.bet-panel').appendChild(btn);
            }
        },
        startHand() {
            const g = this;
            const bet = getBetAmount('bj-bet-area');
            if (bet < 1 || bet > state.coins) return;
            g.bet = bet; g._coinsAtStart = state.coins;
            state.coins -= bet; saveGameData(); updateStatsUI();
            g.deck = createStandardDeck(false);
            g.player = [g.deck.pop(), g.deck.pop()];
            g.dealer = [g.deck.pop(), g.deck.pop()];
            g.over = false; g.hidden = true;
            document.getElementById('bj-bet-area').style.display = 'none';
            document.getElementById('bj-game-area').style.display = 'block';
            document.getElementById('bj-bet-display').textContent = bet;
            document.getElementById('bj-status').innerHTML = 'Good luck!';
            document.getElementById('hit-btn').disabled = false;
            document.getElementById('stand-btn').disabled = false;
            g.update();
            const pBJ = g.player.length === 2 && g.handValue(g.player) === 21;
            const dBJ = g.dealer.length === 2 && g.handValue(g.dealer) === 21;
            if (pBJ || dBJ) GameSession.setTimer(() => g.natural(pBJ, dBJ), 400);
        },
        handValue(hand) {
            let total = 0, aces = 0;
            for (const c of hand) {
                if (c.rank === 'A') { total += 11; aces++; }
                else if (['J','Q','K'].includes(c.rank)) total += 10;
                else total += parseInt(c.rank, 10);
            }
            while (total > 21 && aces > 0) { total -= 10; aces--; }
            return total;
        },
        update() {
            const g = this;
            document.getElementById('p-sum').textContent = g.handValue(g.player);
            document.getElementById('player-cards').innerHTML = g.player.map(c => renderCard(c.rank, c.suit)).join('');
            if (g.hidden) {
                document.getElementById('dealer-cards').innerHTML = renderCard(g.dealer[0].rank, g.dealer[0].suit) + cardBack();
                document.getElementById('bj-dsum').textContent = '';
            } else {
                document.getElementById('dealer-cards').innerHTML = g.dealer.map(c => renderCard(c.rank, c.suit)).join('');
                document.getElementById('bj-dsum').textContent = `(${g.handValue(g.dealer)})`;
            }
        },
        hit() {
            const g = this;
            if (g.over) return;
            g.player.push(g.deck.pop());
            g.update();
            if (g.handValue(g.player) > 21) {
                g.over = true; g.hidden = false; g.update();
                AudioFX.playClick();
                setText('bj-status', `💥 Bust! Lost ${g.bet} coins.`, '#ef4444');
                g.endHand();
            }
        },
        stand() {
            const g = this;
            if (g.over) return;
            g.over = true; g.hidden = false;
            while (g.handValue(g.dealer) < 17) g.dealer.push(g.deck.pop());
            g.update();
            const p = g.handValue(g.player), d = g.handValue(g.dealer);
            if (d > 21 || p > d) {
                state.coins += g.bet * 2; saveGameData(); updateStatsUI();
                AudioFX.playWin();
                setText('bj-status', `🎉 Win ${p} vs ${d}! +${g.bet} coins.`, '#22c55e');
            } else if (p === d) {
                state.coins += g.bet; saveGameData(); updateStatsUI();
                setText('bj-status', `🤝 Push at ${p}. Bet returned.`, '#f59e0b');
            } else {
                AudioFX.playClick();
                setText('bj-status', `😢 Dealer wins ${d} vs ${p}. -${g.bet} coins.`, '#ef4444');
            }
            g.endHand();
        },
        natural(pBJ, dBJ) {
            const g = this;
            g.over = true; g.hidden = false; g.update();
            if (pBJ && dBJ) { state.coins += g.bet; saveGameData(); updateStatsUI(); setText('bj-status', '🤝 Both blackjack! Push.', '#f59e0b'); }
            else if (pBJ) {
                const payout = Math.floor(g.bet * 2.5);
                state.coins += payout; saveGameData(); updateStatsUI();
                AudioFX.playWin();
                setText('bj-status', `🌟 BLACKJACK! +${payout - g.bet} coins.`, '#22c55e');
                if (!state.achievements.blackjack.claimed) {
                    state.achievements.blackjack.claimed = true;
                    state.coins += state.achievements.blackjack.reward;
                    saveGameData(); updateStatsUI();
                    if (typeof showToast === 'function') showToast(`🏆 Achievement: Blackjack! +${state.achievements.blackjack.reward} Coins`, 'success', 4000);
                }
            } else { AudioFX.playClick(); setText('bj-status', '😢 Dealer blackjack. Lost bet.', '#ef4444'); }
            g.endHand();
        },
        endHand() {
            const g = this;
            document.getElementById('hit-btn').disabled = true;
            document.getElementById('stand-btn').disabled = true;
            if (typeof checkAchievements === 'function') checkAchievements();
            if (typeof recordGameResult === 'function' && typeof GameSession !== 'undefined' && GameSession.currentGame === 'blackjack') {
                recordGameResult('blackjack', state.coins > g._coinsAtStart, Math.max(0, state.coins - g._coinsAtStart), 0);
            }
            GameSession.setTimer(() => {
                const gameArea = document.getElementById('bj-game-area');
                const betArea = document.getElementById('bj-bet-area');
                if (!gameArea || !betArea) return;
                gameArea.style.display = 'none'; betArea.style.display = 'block';
                GameEngines.blackjack.showBetUI();
            }, 2000);
        }
    },

    // ============ 7. WAR ============
    'war': {
        playerDeck: [], aiDeck: [], playerPts: 0, aiPts: 0, round: 0, maxRounds: 8, over: false,
        render(container, mode) {
            const g = this;
            const deck = createStandardDeck(false);
            g.playerDeck = deck.slice(0, 26); g.aiDeck = deck.slice(26);
            g.playerPts = 0; g.aiPts = 0; g.round = 0; g.over = false;
            container.innerHTML = `
                <h3>⚔️ Card War — ${mode.toUpperCase()}</h3>
                <p>${g.maxRounds} battles. Aces high. Ties trigger War!</p>
                <div id="war-board" style="display:flex; justify-content:center; gap:30px; align-items:center; margin:25px 0;">
                    <div><p>${mode === 'pass-play' ? 'Player 1' : 'You'}</p><div id="war-player-card">🂠</div><p>Points: <span id="war-ppts">0</span></p></div>
                    <div style="font-size:1.5rem; font-weight:bold;">VS</div>
                    <div><p>${mode === 'pass-play' ? 'Player 2' : 'Opponent'}</p><div id="war-ai-card">🂠</div><p>Points: <span id="war-apts">0</span></p></div>
                </div>
                <button id="war-btn" class="btn primary-btn"
                    onclick="AudioFX.playCardSnap(); GameEngines.war.battle()">Fight Battle!</button>
                <div id="war-status" style="margin-top:15px; font-weight:bold;">Click to draw!</div>`;
        },
        value(card) { return card.rank === 'A' ? 14 : faceValue(card.rank); },
        battle() {
            const g = this;
            if (g.over) return;
            if (g.playerDeck.length === 0 || g.aiDeck.length === 0) { g.finish(); return; }
            let pCard = g.playerDeck.pop(), aCard = g.aiDeck.pop(), war = false;
            while (g.value(pCard) === g.value(aCard) && g.playerDeck.length > 0 && g.aiDeck.length > 0) {
                war = true;
                if (g.playerDeck.length > 1) g.playerDeck.pop();
                if (g.aiDeck.length > 1) g.aiDeck.pop();
                pCard = g.playerDeck.pop(); aCard = g.aiDeck.pop();
            }
            document.getElementById('war-player-card').innerHTML = renderCard(pCard.rank, pCard.suit);
            document.getElementById('war-ai-card').innerHTML = renderCard(aCard.rank, aCard.suit);
            const pv = g.value(pCard), av = g.value(aCard);
            const wl = war ? ' ⚔️ WAR! ' : ' ';
            if (pv > av) { g.playerPts++; AudioFX.playWin(); setText('war-status', `${wl}You win with ${pCard.rank} vs ${aCard.rank}!`, '#22c55e'); }
            else if (pv < av) { g.aiPts++; AudioFX.playClick(); setText('war-status', `${wl}Opponent wins with ${aCard.rank} vs ${pCard.rank}.`, '#ef4444'); }
            g.round++;
            document.getElementById('war-ppts').textContent = g.playerPts;
            document.getElementById('war-apts').textContent = g.aiPts;
            if (g.round >= g.maxRounds) g.finish();
        },
        finish() {
            const g = this;
            g.over = true;
            document.getElementById('war-btn').disabled = true;
            if (g.playerPts > g.aiPts) { AudioFX.playWin(); setText('war-status', `🏆 Win ${g.playerPts}–${g.aiPts}! +40 Coins`, '#22c55e'); finishGame(40, 30); }
            else if (g.playerPts === g.aiPts) { setText('war-status', `🤝 Tie ${g.playerPts}–${g.aiPts}. No reward.`, '#f59e0b'); finishGame(0, 12); }
            else { AudioFX.playClick(); setText('war-status', `😢 Lost ${g.aiPts}–${g.playerPts}. No reward.`, '#ef4444'); finishGame(0, 8); }
        }
    },

    // ============ 8. GO FISH ============
    'go-fish': {
        deck: [], player: [], ai: [], playerBooks: 0, aiBooks: 0, over: false, aiThinking: false,
        render(container, mode) {
            const g = this;
            const d = createStandardDeck(false);
            g.player = d.splice(0, 7); g.ai = d.splice(0, 7); g.deck = d;
            g.playerBooks = 0; g.aiBooks = 0; g.over = false; g.aiThinking = false;
            container.innerHTML = `
                <h3>🐟 Go Fish — ${mode.toUpperCase()}</h3>
                <p>Click a card to ask the AI for that rank. Most books at the end wins!</p>
                <p>Books — You: <b id="gf-pbooks">0</b> · AI: <b id="gf-abooks">0</b> · Deck: <b id="gf-deck"></b></p>
                <div id="gf-hand" style="display:flex; flex-wrap:wrap; justify-content:center; gap:8px; margin:20px 0; min-height:130px;"></div>
                <button id="gf-draw" class="btn primary-btn">Draw from Deck</button>
                <div id="gf-status" style="margin-top:15px; font-weight:bold;">Click a card to ask for its rank.</div>`;
            document.getElementById('gf-draw').onclick = () => { AudioFX.playCardSnap(); g.manualDraw(); };
            g.refresh();
        },
        refresh() {
            const g = this;
            document.getElementById('gf-pbooks').textContent = g.playerBooks;
            document.getElementById('gf-abooks').textContent = g.aiBooks;
            document.getElementById('gf-deck').textContent = g.deck.length;
            document.getElementById('gf-hand').innerHTML = g.player.map((c, i) =>
                `<div style="cursor:${g.over||g.aiThinking?'default':'pointer'};"
                    onclick="GameEngines['go-fish'].ask(${i})">${renderCard(c.rank, c.suit)}</div>`
            ).join('');
            document.getElementById('gf-draw').disabled = g.over || g.aiThinking || g.deck.length === 0 || g.player.length > 0;
        },
        ask(i) {
            const g = this;
            if (g.over || g.aiThinking) return;
            const rank = g.player[i].rank;
            const matches = g.ai.filter(c => c.rank === rank);
            if (matches.length > 0) {
                g.ai = g.ai.filter(c => c.rank !== rank);
                g.player.push(...matches);
                AudioFX.playWin();
                setText('gf-status', `AI had ${matches.length} ${rank}(s)!`, '#22c55e');
                g.checkBooks(true);
                if (g.checkEnd()) return;
                g.refresh(); return;
            }
            if (g.deck.length === 0) { setText('gf-status', `AI has no ${rank}s, deck empty.`); g.aiTurn(); return; }
            const card = g.deck.pop();
            g.player.push(card);
            AudioFX.playCardSnap();
            setText('gf-status', `"Go Fish!" You drew ${card.rank}${card.suit}.`);
            g.checkBooks(true);
            if (g.checkEnd()) return;
            g.refresh();
            if (card.rank !== rank) { g.aiThinking = true; g.refresh(); GameSession.setTimer(() => g.aiTurn(), 500); }
        },
        manualDraw() {
            const g = this;
            if (g.over || g.aiThinking || g.player.length > 0 || g.deck.length === 0) return;
            g.player.push(g.deck.pop());
            AudioFX.playCardSnap();
            g.checkBooks(true);
            if (g.checkEnd()) return;
            g.refresh();
        },
        aiTurn() {
            const g = this;
            if (g.over) return;
            g.aiThinking = false;
            if (g.ai.length === 0) { if (g.deck.length > 0) g.ai.push(g.deck.pop()); else { g.endGame(); return; } }
            const counts = {};
            g.ai.forEach(c => counts[c.rank] = (counts[c.rank] || 0) + 1);
            const ranks = Object.keys(counts);
            const rank = ranks[Math.floor(Math.random() * ranks.length)];
            const matches = g.player.filter(c => c.rank === rank);
            if (matches.length > 0) { g.player = g.player.filter(c => c.rank !== rank); g.ai.push(...matches); setText('gf-status', `AI took ${matches.length} ${rank}s!`, '#ef4444'); }
            else { if (g.deck.length > 0) g.ai.push(g.deck.pop()); setText('gf-status', `AI asked for ${rank}s — Go Fish!`, '#22c55e'); }
            g.checkBooks(false);
            if (g.checkEnd()) return;
            g.refresh();
        },
        checkBooks(isPlayer) {
            const g = this;
            const hand = isPlayer ? g.player : g.ai;
            const counts = {};
            hand.forEach(c => counts[c.rank] = (counts[c.rank] || 0) + 1);
            for (const rank in counts) {
                if (counts[rank] === 4) {
                    if (isPlayer) { g.player = g.player.filter(c => c.rank !== rank); g.playerBooks++; }
                    else { g.ai = g.ai.filter(c => c.rank !== rank); g.aiBooks++; }
                    AudioFX.playWin();
                }
            }
        },
        checkEnd() {
            const g = this;
            if (g.playerBooks + g.aiBooks >= 13) { g.endGame(); return true; }
            if (g.deck.length === 0 && g.player.length === 0 && g.ai.length === 0) { g.endGame(); return true; }
            return false;
        },
        endGame() {
            const g = this;
            g.over = true;
            if (g.playerBooks > g.aiBooks) { AudioFX.playWin(); setText('gf-status', `🏆 Win ${g.playerBooks}–${g.aiBooks}! +50 Coins`, '#22c55e'); finishGame(50, 40); }
            else if (g.playerBooks === g.aiBooks) { setText('gf-status', `🤝 Tie ${g.playerBooks}–${g.aiBooks}.`, '#f59e0b'); finishGame(0, 12); }
            else { AudioFX.playClick(); setText('gf-status', `😢 AI won ${g.aiBooks}–${g.playerBooks}.`, '#ef4444'); finishGame(0, 10); }
            g.refresh();
        }
    },

    // ============ 9. HIGH-LOW ============
    'high-low': {
        current: null, streak: 0, rounds: 0, maxRounds: 5, over: false,
        render(container, mode) {
            const g = this;
            activeDeck = createStandardDeck(true);
            g.current = drawFromDeck();
            g.streak = 0; g.rounds = 0; g.over = false;
            container.innerHTML = `
                <h3>🔥 Chaos High-Low — ${mode.toUpperCase()}</h3>
                <p>Up to ${g.maxRounds} guesses — one wrong guess ends the run!</p>
                <p>Correct: <b id="hl-streak">0</b> · Round <b id="hl-round">1</b>/${g.maxRounds}</p>
                <div id="hl-card-box" style="margin:20px 0; min-height:130px;"></div>
                <div id="hl-buttons" style="display:flex; gap:10px; justify-content:center;">
                    <button id="hl-higher" class="btn primary-btn" onclick="AudioFX.playCardSnap(); GameEngines['high-low'].guess('higher')">Higher ⬆️</button>
                    <button id="hl-lower" class="btn tutorial-btn" onclick="AudioFX.playCardSnap(); GameEngines['high-low'].guess('lower')">Lower ⬇️</button>
                </div>
                <div id="hl-status" style="margin-top:20px; font-weight:bold;">Will the next card be higher or lower?</div>`;
            g.refresh();
        },
        refresh() {
            const g = this;
            document.getElementById('hl-card-box').innerHTML = renderCard(g.current.rank, g.current.suit);
            document.getElementById('hl-streak').textContent = g.streak;
            document.getElementById('hl-round').textContent = Math.min(g.rounds + 1, g.maxRounds);
        },
        guess(dir) {
            const g = this;
            if (g.over) return;
            const prev = g.current, next = drawFromDeck();
            const pv = prev.value, nv = next.value;
            g.current = next; g.rounds++;
            let outcome;
            if (nv === pv) outcome = 'push';
            else if (dir === 'higher') outcome = nv > pv ? 'win' : 'lose';
            else outcome = nv < pv ? 'win' : 'lose';
            if (outcome === 'win') { g.streak++; AudioFX.playWin(); setText('hl-status', `✅ ${next.rank} beats ${prev.rank}!`, '#22c55e'); }
            else if (outcome === 'lose') { AudioFX.playClick(); setText('hl-status', `❌ Run over!`, '#ef4444'); g.finish(); return; }
            else setText('hl-status', `➖ Tie.`, '#f59e0b');
            if (g.rounds >= g.maxRounds) { g.finish(); return; }
            g.refresh();
        },
        finish() {
            const g = this;
            g.over = true;
            document.getElementById('hl-higher').disabled = true;
            document.getElementById('hl-lower').disabled = true;
            const coins = g.streak * 10;
            if (g.streak > 0) { AudioFX.playWin(); setText('hl-status', `🏁 Streak of ${g.streak}! +${coins} Coins`, '#22c55e'); }
            else setText('hl-status', '🏁 No reward.', '#ef4444');
            finishGame(coins, g.streak * 8);
        }
    },

    // ============ 10. MAHJONG ============
    'mahjong': {
        TILES: ['🀀','🀁','🀂','🀃','🀄','🀅','🀆','🀇','🀈','🀉','🀊','🀋','🀌','🀍','🀎','🀏'],
        ROWS: 4, COLS: 8, board: [], selected: null, over: false, removed: 0,
        render(container, mode) {
            const g = this;
            const tiles = [];
            for (const t of g.TILES) tiles.push(t, t);
            const sh = shuffle(tiles);
            g.board = [];
            let idx = 0;
            for (let r = 0; r < g.ROWS; r++) { g.board.push([]); for (let c = 0; c < g.COLS; c++) g.board[r].push(sh[idx++]); }
            g.selected = null; g.over = false; g.removed = 0;
            container.innerHTML = `
                <h3>🀄 Mahjong Solitaire — ${mode.toUpperCase()}</h3>
                <p>Click two matching tiles that are both <b>free</b> (no tile to the immediate left OR right in their row). Clear the board!</p>
                <div id="mahjong-board" style="display:flex; flex-direction:column; gap:4px; align-items:center; margin:20px 0;"></div>
                <div id="mahjong-status" style="margin-top:15px; font-weight:bold;">Select your first tile.</div>
                <button id="mahjong-hint" class="btn tutorial-btn" style="margin-top:15px;">💡 Hint</button>
                <button class="btn tutorial-btn" style="margin-top:15px;" onclick="openGame('mahjong','1-ai')">🔄 Reshuffle</button>`;
            document.getElementById('mahjong-hint').onclick = () => g.hint();
            g.refresh();
        },
        isFree(r, c) {
            if (this.board[r][c] === null) return false;
            const leftEmpty = c === 0 || this.board[r][c-1] === null;
            const rightEmpty = c === this.COLS - 1 || this.board[r][c+1] === null;
            return leftEmpty || rightEmpty;
        },
        refresh() {
            const g = this;
            const board = document.getElementById('mahjong-board');
            if (!board) return;
            board.innerHTML = g.board.map((row, r) => `<div style="display:flex; gap:4px;">
                ${row.map((tile, c) => {
                    if (tile === null) return `<div style="width:44px; height:60px; opacity:0.1;"></div>`;
                    const free = g.isFree(r, c);
                    const sel = g.selected && g.selected.r === r && g.selected.c === c;
                    return `<div style="width:44px; height:60px; background:${sel?'#f59e0b':'#fffef7'}; color:#0f172a; border:2px solid ${free?'#38bdf8':'#94a3b8'}; border-radius:6px; display:flex; align-items:center; justify-content:center; font-size:24px; cursor:${free?'pointer':'not-allowed'}; opacity:${free?1:0.6};"
                        onclick="GameEngines.mahjong.click(${r}, ${c})">${tile}</div>`;
                }).join('')}</div>`).join('');
        },
        click(r, c) {
            const g = this;
            if (g.over || !g.isFree(r, c)) { if (!g.over) setText('mahjong-status', 'That tile is blocked.', '#ef4444'); return; }
            if (g.selected && g.selected.r === r && g.selected.c === c) { g.selected = null; g.refresh(); return; }
            if (!g.selected) { g.selected = { r, c }; setText('mahjong-status', 'Now pick a matching free tile.'); g.refresh(); return; }
            const first = g.board[g.selected.r][g.selected.c];
            const second = g.board[r][c];
            if (first === second) {
                g.board[g.selected.r][g.selected.c] = null;
                g.board[r][c] = null;
                g.removed += 2; g.selected = null;
                AudioFX.playCardSnap();
                setText('mahjong-status', `Matched ${first}!`, '#22c55e');
                g.refresh();
                if (g.removed >= 32) g.win();
            } else { g.selected = null; setText('mahjong-status', 'Not a match.', '#ef4444'); g.refresh(); }
        },
        hint() {
            const g = this;
            for (let r1 = 0; r1 < g.ROWS; r1++) for (let c1 = 0; c1 < g.COLS; c1++) {
                if (!g.board[r1][c1] || !g.isFree(r1, c1)) continue;
                for (let r2 = 0; r2 < g.ROWS; r2++) for (let c2 = 0; c2 < g.COLS; c2++) {
                    if (r1 === r2 && c1 === c2) continue;
                    if (!g.board[r2][c2] || !g.isFree(r2, c2)) continue;
                    if (g.board[r1][c1] === g.board[r2][c2]) {
                        setText('mahjong-status', `Hint: ${g.board[r1][c1]} at row ${r1+1}, col ${c1+1} and row ${r2+1}, col ${c2+1}`, '#38bdf8');
                        return;
                    }
                }
            }
            setText('mahjong-status', 'No moves available — reshuffle!', '#f59e0b');
        },
        win() { this.over = true; AudioFX.playWin(); setText('mahjong-status', '🎉 Board cleared! +100 Coins', '#22c55e'); finishGame(100, 60); }
    },

    // ============ 11. TEXAS HOLD'EM POKER ============
    'poker': {
        deck: [], playerHand: [], aiHand: [], community: [],
        pot: 0, ante: 0, street: 'bet', over: false, aiFolded: false, _betRef: null,
        render(container, mode) {
            const g = this;
            g.over = false; g.street = 'bet'; g.aiFolded = false;
            g.playerHand = []; g.aiHand = []; g.community = [];
            g.pot = 0; g.ante = 0;
            container.innerHTML = `
                <h3>🃏 Texas Hold'em — ${mode.toUpperCase()}</h3>
                <p class="play-money-note">🎲 Play money only.</p>
                <p>You vs AI. Best 5-card hand wins the pot. Streets: Pre-flop → Flop → Turn → River → Showdown.</p>
                <div id="poker-bet-area"></div>
                <div id="poker-game-area" style="display:none;">
                    <div style="margin:15px 0;"><h4>Opponent <span id="poker-ai-fold" style="color:#ef4444;"></span></h4>
                        <div id="poker-ai-hand" style="display:flex; justify-content:center; gap:8px;"></div></div>
                    <div style="margin:15px 0;"><h4>Community Cards</h4>
                        <div id="poker-community" style="display:flex; justify-content:center; gap:8px; min-height:120px;"></div></div>
                    <div style="margin:15px 0;"><h4>Your Hand</h4>
                        <div id="poker-player-hand" style="display:flex; justify-content:center; gap:8px;"></div></div>
                    <div style="background:#1e293b; padding:12px; border-radius:8px; margin:15px 0;">
                        <b>Pot: <span id="poker-pot">0</span> coins</b> · Street: <b id="poker-street"></b>
                    </div>
                    <div id="poker-actions" style="display:flex; gap:10px; justify-content:center; margin-top:15px;"></div>
                    <div id="poker-status" style="margin-top:20px; font-weight:bold;"></div>
                </div>`;
            this.showBetUI();
        },
        showBetUI() {
            const g = this;
            g._betRef = renderBetPanel('poker-bet-area', 'Poker');
            const area = document.getElementById('poker-bet-area');
            if (!area) return;
            if (g._betRef) {
                const btn = document.createElement('button');
                btn.className = 'btn primary-btn'; btn.style.marginTop = '10px'; btn.textContent = 'Ante & Deal';
                btn.onclick = () => GameEngines.poker.startHand();
                area.querySelector('.bet-panel').appendChild(btn);
            }
        },
        startHand() {
            const g = this;
            const ante = getBetAmount('poker-bet-area');
            if (ante < 1 || ante > state.coins) return;
            g.ante = ante; g.pot = ante * 2;
            state.coins -= ante; saveGameData(); updateStatsUI();
            g.deck = createStandardDeck(false);
            g.playerHand = [g.deck.pop(), g.deck.pop()];
            g.aiHand = [g.deck.pop(), g.deck.pop()];
            g.community = []; g.street = 'preflop'; g.aiFolded = false;
            document.getElementById('poker-bet-area').style.display = 'none';
            document.getElementById('poker-game-area').style.display = 'block';
            g.updateUI(); g.showActions('preflop');
        },
        updateUI() {
            const g = this;
            document.getElementById('poker-ai-hand').innerHTML = g.aiHand.map(() => cardBack()).join('');
            document.getElementById('poker-ai-fold').textContent = g.aiFolded ? '— FOLDED' : '';
            document.getElementById('poker-community').innerHTML = g.community.map(c => renderCard(c.rank, c.suit)).join('');
            document.getElementById('poker-player-hand').innerHTML = g.playerHand.map(c => renderCard(c.rank, c.suit)).join('');
            document.getElementById('poker-pot').textContent = g.pot;
            const labels = { preflop: 'Pre-Flop', flop: 'Flop', turn: 'Turn', river: 'River', showdown: 'Showdown' };
            document.getElementById('poker-street').textContent = labels[g.street] || g.street;
        },
        showActions(street) {
            const g = this;
            const actions = document.getElementById('poker-actions');
            const betAmt = g.ante;
            actions.innerHTML = `
                <button class="btn tutorial-btn" onclick="GameEngines.poker.fold()">Fold</button>
                <button class="btn primary-btn" onclick="GameEngines.poker.check()">Check</button>
                <button class="btn primary-btn" onclick="GameEngines.poker.bet(${betAmt})">Bet ${betAmt}</button>`;
            setText('poker-status', `${street === 'preflop' ? 'Pre-flop' : street}: your action.`);
        },
        check() { const g = this; if (g.over) return; setText('poker-status', 'You checked.'); g.advanceStreet(); },
        bet(amount) {
            const g = this;
            if (g.over || amount > state.coins) { setText('poker-status', 'Not enough coins to bet.', '#ef4444'); return; }
            state.coins -= amount; saveGameData(); updateStatsUI();
            g.pot += amount; g.updateUI();
            setText('poker-status', `You bet ${amount}. AI thinking...`);
            GameSession.setTimer(() => g.aiRespond(amount), 700);
        },
        aiRespond(betAmount) {
            const g = this;
            if (g.over) return;
            const aiEval = evalBest7([...g.aiHand, ...g.community]);
            const aiStrength = aiEval ? aiEval.rank : 0;
            const shouldFold = aiStrength === 0 && Math.random() < 0.55;
            if (shouldFold) {
                g.aiFolded = true; g.updateUI(); g.winPot(); return;
            }
            // AI calls — pot grows, but no player deduction (player already paid)
            g.pot += betAmount; g.updateUI();
            setText('poker-status', `AI called ${betAmount}.`);
            g.advanceStreet();
        },
        fold() {
            const g = this;
            if (g.over) return;
            g.over = true;
            AudioFX.playClick();
            setText('poker-status', `You folded. Lost ${g.ante} coins.`, '#ef4444');
            if (typeof recordGameResult === 'function') recordGameResult('poker', false, 0, 0);
            g.showEnd();
        },
        advanceStreet() {
            const g = this;
            if (g.over) return;
            if (g.aiFolded) { g.winPot(); return; }
            if (g.street === 'preflop') { g.community.push(g.deck.pop(), g.deck.pop(), g.deck.pop()); g.street = 'flop'; g.updateUI(); g.showActions('flop'); }
            else if (g.street === 'flop') { g.community.push(g.deck.pop()); g.street = 'turn'; g.updateUI(); g.showActions('turn'); }
            else if (g.street === 'turn') { g.community.push(g.deck.pop()); g.street = 'river'; g.updateUI(); g.showActions('river'); }
            else if (g.street === 'river') { g.showdown(); }
        },
        showdown() {
            const g = this;
            g.street = 'showdown'; g.over = true;
            const pE = evalBest7([...g.playerHand, ...g.community]);
            const aE = evalBest7([...g.aiHand, ...g.community]);
            const cmp = compareHands(pE, aE);
            g.updateUI();
            if (cmp > 0) {
                state.coins += g.pot; saveGameData(); updateStatsUI();
                AudioFX.playWin();
                setText('poker-status', `🎉 You win with ${pE.name}! +${g.pot} coins.`, '#22c55e');
                if (typeof recordGameResult === 'function') recordGameResult('poker', true, g.pot, 0);
            } else if (cmp < 0) {
                AudioFX.playClick();
                setText('poker-status', `😢 AI wins with ${aE.name}. Lost.`, '#ef4444');
                if (typeof recordGameResult === 'function') recordGameResult('poker', false, 0, 0);
            } else {
                state.coins += Math.floor(g.pot / 2); saveGameData(); updateStatsUI();
                setText('poker-status', `🤝 Tie — both ${pE.name}. Half pot returned.`, '#f59e0b');
                if (typeof recordGameResult === 'function') recordGameResult('poker', false, 0, 0);
            }
            g.showEnd();
        },
        winPot() {
            const g = this;
            g.over = true;
            state.coins += g.pot; saveGameData(); updateStatsUI();
            AudioFX.playWin();
            setText('poker-status', `🎉 AI folded! You win ${g.pot} coins.`, '#22c55e');
            if (typeof recordGameResult === 'function') recordGameResult('poker', true, g.pot, 0);
            g.showEnd();
        },
        showEnd() {
            GameSession.setTimer(() => {
                const viewport = document.getElementById('game-viewport');
                if (!viewport || viewport.querySelector('.end-buttons')) return;
                const bar = document.createElement('div');
                bar.className = 'end-buttons';
                bar.innerHTML = `<button class="btn primary-btn" onclick="openGame('poker', '1-ai')">🔁 Play Again</button>
                    <button class="btn tutorial-btn" onclick="closeGameStage()">← Back to Hub</button>`;
                viewport.appendChild(bar);
            }, 200);
        }
    }
};
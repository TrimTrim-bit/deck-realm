Object.assign(GameEngines, {

    'freecell': {
        tableau: [], free: [null, null, null, null], foundations: [[], [], [], []], selected: null, over: false,
        isRed(c) { return c.suit === '♥' || c.suit === '♦'; },
        canTab(c, target) { if (!target) return faceValue(c.rank) === 13; return faceValue(c.rank) === faceValue(target.rank) - 1 && this.isRed(c) !== this.isRed(target); },
        canFound(c, fi) { const f = this.foundations[fi]; if (!f.length) return faceValue(c.rank) === 1; const t = f[f.length - 1]; return t.suit === c.suit && faceValue(c.rank) === faceValue(t.rank) + 1; },
        maxMove() { const ef = this.free.filter(c => !c).length, ec = this.tableau.filter(c => c.length === 0).length; return (ef + 1) * Math.pow(2, ec); },
        render(container, mode) {
            const g = this;
            const deck = createStandardDeck(false);
            g.tableau = Array.from({ length: 8 }, () => []);
            for (let i = 0; i < 52; i++) g.tableau[i % 8].push(deck.pop());
            g.free = [null, null, null, null]; g.foundations = [[], [], [], []];
            g.selected = null; g.over = false;
            container.innerHTML = `
                <h3>🃏 FreeCell — ${mode.toUpperCase()}</h3>
                <p>Move all 52 cards to the foundations (Ace→King per suit). Tableau builds down in alternating colors.</p>
                <div style="display:flex; gap:30px; justify-content:center; margin:15px 0; flex-wrap:wrap;">
                    <div><div style="font-size:0.8rem; color:var(--text-muted); margin-bottom:4px;">Free Cells</div><div id="fc-free" style="display:flex; gap:8px;"></div></div>
                    <div><div style="font-size:0.8rem; color:var(--text-muted); margin-bottom:4px;">Foundations</div><div id="fc-found" style="display:flex; gap:8px;"></div></div>
                </div>
                <div id="fc-tab" style="display:flex; gap:6px; justify-content:center; margin:20px 0; min-height:320px; overflow-x:auto;"></div>
                <div id="fc-status" style="margin-top:15px; font-weight:bold; min-height:24px;"></div>`;
            g.refresh();
        },
        refresh() {
            const g = this;
            document.getElementById('fc-free').innerHTML = g.free.map((c, i) => `<div onclick="GameEngines.freecell.clickFree(${i})" style="width:68px;height:100px;border:2px dashed #475569;border-radius:6px;cursor:pointer;display:flex;align-items:center;justify-content:center;">${c ? renderCard(c.rank, c.suit) : '&nbsp;'}</div>`).join('');
            document.getElementById('fc-found').innerHTML = g.foundations.map((f, i) => `<div onclick="GameEngines.freecell.clickFound(${i})" style="width:68px;height:100px;border:2px dashed #475569;border-radius:6px;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#475569;">${f.length ? renderCard(f[f.length-1].rank, f[f.length-1].suit) : ''}</div>`).join('');
            document.getElementById('fc-tab').innerHTML = g.tableau.map((col, i) => `<div style="min-width:80px;">${col.map((c, j) => { const isSel = g.selected && g.selected.type === 'tableau' && g.selected.col === i && j >= g.selected.idx; return `<div style="margin-top:${j > 0 ? -72 : 0}px; outline:${isSel ? '3px solid #f59e0b' : 'none'}; border-radius:8px; cursor:pointer; position:relative;" onclick="event.stopPropagation(); GameEngines.freecell.clickTableau(${i},${j})">${renderCard(c.rank, c.suit)}</div>`; }).join('') || '<div style="width:68px;height:100px;border:2px dashed #475569;border-radius:6px;"></div>'}</div>`).join('');
            if (g.foundations.every(f => f.length === 13) && !g.over) { g.over = true; AudioFX.playWin(); setText('fc-status', '🎉 SOLVED! +200 Coins', '#22c55e'); finishGame(200, 100, true); }
        },
        clickTableau(col, idx) {
            const g = this;
            if (g.over) return;
            if (g.selected) { const cards = g.getSelectedCards(); const target = g.tableau[col][g.tableau[col].length - 1]; if (cards.length && cards.length <= g.maxMove() && g.canTab(cards[0], target)) { g.clearSelected(); for (const c of cards) g.tableau[col].push(c); AudioFX.playCardSnap(); g.refresh(); setText('fc-status', 'Moved!'); return; } }
            const seq = g.tableau[col].slice(idx);
            for (let i = 1; i < seq.length; i++) if (faceValue(seq[i].rank) !== faceValue(seq[i-1].rank) - 1 || g.isRed(seq[i]) === g.isRed(seq[i-1])) { setText('fc-status', 'Invalid sequence.', '#ef4444'); return; }
            g.selected = { type: 'tableau', col, idx }; g.refresh();
        },
        clickFree(i) {
            const g = this;
            if (g.over) return;
            if (g.selected) { const cards = g.getSelectedCards(); if (cards.length === 1 && !g.free[i]) { g.clearSelected(); g.free[i] = cards[0]; AudioFX.playCardSnap(); g.refresh(); setText('fc-status', 'Moved to free cell.'); return; } }
            if (g.free[i]) { g.selected = { type: 'free', idx: i }; g.refresh(); }
        },
        clickFound(i) {
            const g = this;
            if (g.over) return;
            if (g.selected) { const cards = g.getSelectedCards(); if (cards.length === 1 && g.canFound(cards[0], i)) { g.clearSelected(); g.foundations[i].push(cards[0]); AudioFX.playWin(); g.refresh(); setText('fc-status', 'Foundation +1!', '#22c55e'); return; } }
            setText('fc-status', 'Invalid foundation move.', '#ef4444');
        },
        clearSelected() { const g = this; if (!g.selected) return; if (g.selected.type === 'tableau') g.tableau[g.selected.col].splice(g.selected.idx); else if (g.selected.type === 'free') g.free[g.selected.idx] = null; g.selected = null; },
        getSelectedCards() { const g = this; if (!g.selected) return []; if (g.selected.type === 'tableau') return g.tableau[g.selected.col].slice(g.selected.idx); if (g.selected.type === 'free') return g.free[g.selected.idx] ? [g.free[g.selected.idx]] : []; return []; }
    },

    'hearts': {
        hands: [[], [], [], []], trick: [], scores: [0, 0, 0, 0], heartsBroken: false, current: 0, over: false,
        render(container, mode) {
            const g = this;
            const deck = createStandardDeck(false);
            g.hands = [[], [], [], []];
            for (let i = 0; i < 52; i++) g.hands[i % 4].push(deck.pop());
            for (let p = 0; p < 4; p++) if (g.hands[p].some(c => c.suit === '♣' && c.rank === '2')) { g.startPlayer = p; g.current = p; break; }
            g.trick = []; g.scores = [0, 0, 0, 0]; g.heartsBroken = false; g.over = false;
            container.innerHTML = `
                <h3>♥️ Hearts — ${mode.toUpperCase()}</h3>
                <p>Follow suit if possible. Highest of led suit wins the trick. Avoid hearts (1 pt) and Q♠ (13 pts)! Lowest score wins.</p>
                <div style="display:flex; justify-content:space-around; margin:15px 0; flex-wrap:wrap;"><div>You: <b style="color:#22c55e;" id="h-ps">0 pts</b></div><div>AI1: <b id="h-a1">0</b> pts / <span id="h-a1c">13</span> cards</div><div>AI2: <b id="h-a2">0</b> pts / <span id="h-a2c">13</span> cards</div><div>AI3: <b id="h-a3">0</b> pts / <span id="h-a3c">13</span> cards</div></div>
                <div id="h-trick" style="display:flex; gap:15px; justify-content:center; margin:20px 0; min-height:110px; flex-wrap:wrap;"></div>
                <div style="font-weight:bold; text-align:center;" id="h-broken"></div>
                <h4>Your Hand:</h4>
                <div id="h-hand" style="display:flex; flex-wrap:wrap; gap:6px; justify-content:center; margin:15px 0; min-height:130px;"></div>
                <div id="h-status" style="margin-top:15px; font-weight:bold; min-height:24px;"></div>`;
            g.refresh(); g.advanceTurn(g.startPlayer);
        },
        refresh() {
            const g = this;
            document.getElementById('h-ps').textContent = `${g.scores[0]} pts`;
            [1,2,3].forEach(i => { document.getElementById('h-a' + i).textContent = g.scores[i]; document.getElementById('h-a' + i + 'c').textContent = g.hands[i].length; });
            document.getElementById('h-trick').innerHTML = g.trick.map(t => `<div style="text-align:center;"><div>${renderCard(t.card.rank, t.card.suit)}</div><div style="font-size:0.75rem; color:var(--text-muted);">${['You','AI1','AI2','AI3'][t.player]}</div></div>`).join('');
            document.getElementById('h-broken').innerHTML = g.heartsBroken ? '<span style="color:#ef4444;">♥ Hearts broken</span>' : '<span style="color:var(--text-muted);">♥ Hearts not broken</span>';
            document.getElementById('h-hand').innerHTML = g.hands[0].map((c, i) => { const canPlay = g.current === 0 && !g.over && g.isLegalPlay(c); return `<div onclick="GameEngines.hearts.playCard(${i})" style="cursor:${canPlay ? 'pointer' : 'not-allowed'}; opacity:${canPlay ? 1 : 0.5};">${renderCard(c.rank, c.suit)}</div>`; }).join('');
        },
        isLegalPlay(card) {
            if (this.trick.length === 0) { if (card.suit === '♥' && !this.heartsBroken && this.hands[0].some(c => c.suit !== '♥')) return false; return true; }
            const leadSuit = this.trick[0].card.suit;
            if (card.suit === leadSuit) return true;
            return !this.hands[0].some(c => c.suit === leadSuit);
        },
        advanceTurn(p) {
            const g = this;
            if (g.trick.length >= 4) { GameSession.setTimer(() => g.finishTrick(), 600); return; }
            if (p === 0) { g.current = 0; setText('h-status', 'Your turn.'); g.refresh(); return; }
            g.current = p; setText('h-status', `AI${p} thinking...`);
            GameSession.setTimer(() => g.aiPlay(p), 400);
        },
        aiPlay(p) {
            const g = this;
            if (g.over) return;
            const hand = g.hands[p];
            const leadSuit = g.trick.length > 0 ? g.trick[0].card.suit : null;
            let playable = hand;
            if (leadSuit) { const suited = hand.filter(c => c.suit === leadSuit); if (suited.length) playable = suited; }
            const safe = playable.filter(c => c.suit !== '♥' && !(c.suit === '♠' && c.rank === 'Q'));
            if (safe.length) playable = safe;
            playable.sort((a, b) => faceValue(a.rank) - faceValue(b.rank));
            const card = playable[0];
            hand.splice(hand.indexOf(card), 1);
            g.trick.push({ card, player: p });
            if (card.suit === '♥') g.heartsBroken = true;
            AudioFX.playCardSnap(); g.refresh(); g.advanceTurn((p + 1) % 4);
        },
        playCard(i) {
            const g = this;
            if (g.current !== 0 || g.over) return;
            const card = g.hands[0][i];
            if (!g.isLegalPlay(card)) { setText('h-status', 'That card is not legal.', '#ef4444'); return; }
            g.hands[0].splice(i, 1);
            g.trick.push({ card, player: 0 });
            if (card.suit === '♥') g.heartsBroken = true;
            AudioFX.playCardSnap(); g.refresh(); g.advanceTurn(1);
        },
        finishTrick() {
            const g = this;
            const leadSuit = g.trick[0].card.suit;
            let winner = 0;
            for (let i = 1; i < g.trick.length; i++) if (g.trick[i].card.suit === leadSuit && faceValue(g.trick[i].card.rank) > faceValue(g.trick[winner].card.rank)) winner = i;
            const winPlayer = g.trick[winner].player;
            let points = 0;
            for (const t of g.trick) { if (t.card.suit === '♥') points++; if (t.card.suit === '♠' && t.card.rank === 'Q') points += 13; }
            g.scores[winPlayer] += points;
            setText('h-status', `${['You','AI1','AI2','AI3'][winPlayer]} won the trick (+${points} pts)`, winPlayer === 0 ? '#22c55e' : '#94a3b8');
            g.refresh();
            GameSession.setTimer(() => { g.trick = []; if (g.hands.every(h => h.length === 0)) { g.endRound(); return; } g.advanceTurn(winPlayer); }, 1200);
        },
        endRound() {
            const g = this; g.over = true;
            const minScore = Math.min(...g.scores);
            if (g.scores[0] === minScore) { AudioFX.playWin(); setText('h-status', `🏆 You had the lowest score (${g.scores[0]})! +150 Coins`, '#22c55e'); finishGame(150, 80, true); }
            else { AudioFX.playClick(); setText('h-status', `😢 Someone beat you. Scores: ${g.scores.join(' / ')}`, '#ef4444'); finishGame(0, 20, false); }
        }
    },

    'backgammon': {
        points: [], bar: [0, 0], off: [0, 0], dice: [], selected: null, over: false, turn: 0, legalDestinations: [],
        reset() {
            this.points = Array(24).fill(0);
            this.points[0] = -2; this.points[5] = 5; this.points[7] = 3; this.points[11] = -5;
            this.points[12] = 5; this.points[16] = -3; this.points[18] = -5; this.points[23] = 2;
            this.bar = [0, 0]; this.off = [0, 0]; this.dice = []; this.selected = null; this.over = false; this.turn = 0; this.legalDestinations = [];
        },
        render(container, mode) {
            const g = this; g.reset();
            container.innerHTML = `
                <h3>🎲 Backgammon — ${mode.toUpperCase()}</h3>
                <p>You play White (⚪). Move all 15 checkers to off board. Click a point to select, then green target.</p>
                <div id="bg-board" style="max-width:640px; margin:20px auto; padding:8px; background:#78350f; border-radius:8px;"></div>
                <div style="display:flex; gap:15px; justify-content:center; align-items:center; margin:15px 0; flex-wrap:wrap;"><div>Bar: ⚪<span id="bg-bw">0</span> ⚫<span id="bg-bb">0</span></div><div>Off: ⚪<span id="bg-ow">0</span>/15 ⚫<span id="bg-ob">0</span>/15</div><div>Dice: <span id="bg-dice">—</span></div></div>
                <div style="display:flex; gap:10px; justify-content:center;"><button id="bg-roll" class="btn primary-btn" onclick="GameEngines.backgammon.roll()">🎲 Roll</button><button id="bg-end" class="btn tutorial-btn" onclick="GameEngines.backgammon.endTurn()" style="display:none;">End Turn ⏭</button></div>
                <div id="bg-status" style="margin-top:15px; font-weight:bold; min-height:24px;"></div>`;
            g.drawBoard(); setText('bg-status', 'Click Roll to start your turn.');
        },
        drawBoard() {
            const g = this;
            const board = document.getElementById('bg-board'); if (!board) return;
            const renderPt = (p) => {
                const v = g.points[p], sel = g.selected === p, canMove = g.legalDestinations && g.legalDestinations.includes(p);
                const cellColor = canMove ? '#16a34a' : '#92400e';
                return `<div onclick="GameEngines.backgammon.clickPoint(${p})" style="flex:1; min-width:38px; padding:4px; background:${cellColor}; border:1px solid #451a03; border-radius:4px; cursor:pointer; text-align:center; font-size:0.65rem; outline:${sel ? '2px solid #f59e0b' : 'none'};"><div style="color:#fcd34d; font-weight:bold;">${p + 1}</div><div style="min-height:38px;">${v > 0 ? '⚪'.repeat(Math.min(v, 4)) + (v > 4 ? '×' + v : '') : v < 0 ? '⚫'.repeat(Math.min(-v, 4)) + (-v > 4 ? '×' + (-v) : '') : ''}</div></div>`;
            };
            board.innerHTML = `<div style="display:flex; gap:3px; margin-bottom:6px;">${[12,13,14,15,16,17,18,19,20,21,22,23].map(renderPt).join('')}</div><div style="display:flex; gap:6px; margin:6px 0;"><div onclick="GameEngines.backgammon.clickBar()" style="flex:1; padding:6px; background:#451a03; color:#fcd34d; font-weight:bold; text-align:center; border-radius:4px; cursor:pointer;">BAR (${g.bar[0]} / ${g.bar[1]})</div><div onclick="GameEngines.backgammon.clickOff()" style="flex:1; padding:6px; background:#451a03; color:#fcd34d; font-weight:bold; text-align:center; border-radius:4px; cursor:pointer;">OFF</div></div><div style="display:flex; gap:3px; margin-top:6px;">${[11,10,9,8,7,6,5,4,3,2,1,0].map(renderPt).join('')}</div>`;
            const setEl = (id, v) => { const e = document.getElementById(id); if (e) e.textContent = v; };
            setEl('bg-bw', g.bar[0]); setEl('bg-bb', g.bar[1]); setEl('bg-ow', g.off[0]); setEl('bg-ob', g.off[1]); setEl('bg-dice', g.dice.length ? g.dice.join(' · ') : '—');
        },
        canBearOff(player) {
            if (this.bar[player] > 0) return false;
            if (player === 0) { for (let p = 6; p < 24; p++) if (this.points[p] > 0) return false; }
            else { for (let p = 0; p < 18; p++) if (this.points[p] < 0) return false; }
            return true;
        },
        highestWhite() { for (let p = 5; p >= 0; p--) if (this.points[p] > 0) return p; return -1; },
        highestBlack() { for (let p = 18; p < 24; p++) if (this.points[p] < 0) return p; return -1; },
        legalMoves(player) {
            const moves = [], dir = player === 0 ? -1 : 1;
            if (this.bar[player] > 0) {
                for (const die of this.dice) { if (die < 0) continue; const target = player === 0 ? 24 - die : die - 1; if (target < 0 || target > 23) continue; const tv = this.points[target]; const ok = player === 0 ? tv >= -1 : tv <= 1; if (ok) moves.push({ from: 'bar', to: target, die }); }
                return moves;
            }
            for (let p = 0; p < 24; p++) {
                const v = this.points[p], own = player === 0 ? v > 0 : v < 0;
                if (!own) continue;
                for (const die of this.dice) {
                    if (die < 0) continue;
                    const target = p + dir * die;
                    if (target < 0 || target > 23) {
                        if (this.canBearOff(player)) {
                            if (player === 0 && target < 0) { if (p === die - 1) moves.push({ from: p, to: 'off', die }); else if (this.highestWhite() === p && die > p + 1) moves.push({ from: p, to: 'off', die }); }
                            else if (player === 1 && target > 23) { if (p === 24 - die) moves.push({ from: p, to: 'off', die }); else if (this.highestBlack() === p && die > 24 - p) moves.push({ from: p, to: 'off', die }); }
                        }
                        continue;
                    }
                    const tv = this.points[target];
                    const ok = player === 0 ? tv >= -1 : tv <= 1;
                    if (ok) moves.push({ from: p, to: target, die });
                }
            }
            return moves;
        },
        cloneState() { return { points: [...this.points], bar: [...this.bar], off: [...this.off] }; },
        restoreState(s) { this.points = s.points; this.bar = s.bar; this.off = s.off; },
        applyMoveAI(move, player) {
            if (move.from === 'bar') this.bar[player]--;
            else this.points[move.from] += (player === 1 ? 1 : -1);
            if (move.to === 'off') this.off[player]++;
            else {
                if (player === 1 && this.points[move.to] === 1) { this.points[move.to] = 0; this.bar[0]++; }
                else if (player === 0 && this.points[move.to] === -1) { this.points[move.to] = 0; this.bar[1]++; }
                this.points[move.to] += (player === 1 ? -1 : 1);
            }
        },
        evaluatePosition(player) {
            let score = 0, pipCount = 0, blots = 0, madePoints = 0;
            for (let p = 0; p < 24; p++) {
                const v = this.points[p];
                if (player === 1) { if (v < 0) { pipCount += Math.abs(v) * p; if (v === -1) { blots++; if (p < 6) score -= 8; } else madePoints++; } }
                else { if (v > 0) { pipCount += v * (24 - p); if (v === 1) { blots++; if (p > 17) score -= 8; } else madePoints++; } }
            }
            if (player === 1) pipCount += this.bar[1] * 25; else pipCount += this.bar[0] * 25;
            score -= pipCount; score -= blots * 6; score += madePoints * 4;
            if (player === 1) { score += this.bar[0] * 15; score += this.off[1] * 25; }
            else { score += this.bar[1] * 15; score += this.off[0] * 25; }
            return score;
        },
        roll() {
            const g = this;
            if (g.over || g.turn !== 0 || g.dice.length) return;
            const d1 = Math.floor(Math.random() * 6) + 1, d2 = Math.floor(Math.random() * 6) + 1;
            g.dice = d1 === d2 ? [d1, d1, d1, d1] : [d1, d2];
            AudioFX.playCardSnap(); g.drawBoard();
            setText('bg-status', `Rolled ${g.dice.join(' · ')}. Select a point (or Bar) to move from.`);
            document.getElementById('bg-roll').style.display = 'none';
            document.getElementById('bg-end').style.display = 'inline-block';
            g.selected = null; g.legalDestinations = [];
        },
        clickPoint(p) {
            const g = this;
            if (g.over || g.turn !== 0 || !g.dice.length) return;
            if (g.selected !== null && g.selected !== 'bar') { const move = g.legalMoves(0).find(m => m.from === g.selected && m.to === p); if (move) { g.applyPlayerMove(move); return; } }
            const v = g.points[p];
            if (v > 0) { g.selected = p; g.legalDestinations = g.legalMoves(0).filter(m => m.from === p).map(m => m.to === 'off' ? 'off' : m.to); g.drawBoard(); }
            else { g.selected = null; g.legalDestinations = []; g.drawBoard(); }
        },
        clickBar() {
            const g = this;
            if (g.over || g.turn !== 0 || !g.dice.length) return;
            if (g.bar[0] > 0) { g.selected = 'bar'; g.legalDestinations = g.legalMoves(0).filter(m => m.from === 'bar').map(m => m.to); g.drawBoard(); setText('bg-status', 'Entering from bar — click a highlighted point.'); }
        },
        clickOff() {
            const g = this;
            if (g.over || g.turn !== 0 || g.selected === null) return;
            const move = g.legalMoves(0).find(m => m.from === g.selected && m.to === 'off');
            if (move) g.applyPlayerMove(move);
        },
        applyPlayerMove(move) {
            const g = this;
            if (move.from === 'bar') g.bar[0]--;
            else g.points[move.from]--;
            if (move.to === 'off') { g.off[0]++; AudioFX.playWin(); }
            else { if (g.points[move.to] === -1) { g.points[move.to] = 0; g.bar[1]++; AudioFX.playClick(); setText('bg-status', '💥 You hit a black checker!', '#22c55e'); } g.points[move.to]++; }
            g.dice.splice(g.dice.indexOf(move.die), 1);
            g.selected = null; g.legalDestinations = [];
            AudioFX.playCardSnap(); g.drawBoard();
            if (g.off[0] === 15) { g.win(0); return; }
            if (g.dice.length === 0) { g.endTurn(); return; }
            if (g.legalMoves(0).length === 0) { g.endTurn(); return; }
            setText('bg-status', `${g.dice.length} dice remaining.`);
        },
        endTurn() {
            const g = this;
            if (g.over) return;
            g.dice = []; g.selected = null; g.legalDestinations = [];
            g.drawBoard();
            document.getElementById('bg-roll').style.display = 'none';
            document.getElementById('bg-end').style.display = 'none';
            if (g.turn === 0) { g.turn = 1; setText('bg-status', 'Black thinking...'); GameSession.setTimer(() => g.aiTurn(), 500); }
            else { g.turn = 0; document.getElementById('bg-roll').style.display = 'inline-block'; setText('bg-status', 'Your turn! Roll the dice.'); }
        },
        aiTurn() {
            const g = this;
            if (g.over) return;
            const d1 = Math.floor(Math.random() * 6) + 1, d2 = Math.floor(Math.random() * 6) + 1;
            g.dice = d1 === d2 ? [d1, d1, d1, d1] : [d1, d2];
            g.drawBoard(); setText('bg-status', `AI rolled ${g.dice.join(' · ')}`);
            const doNext = () => {
                if (g.over || !document.getElementById('bg-board')) return;
                if (g.dice.length === 0) { g.endTurn(); return; }
                const moves = g.legalMoves(1);
                if (moves.length === 0) { g.endTurn(); return; }
                let candidates = moves;
                if (g.dice.length === 2 && g.dice[0] !== g.dice[1]) {
                    const can1 = moves.some(m => m.die === g.dice[0]), can2 = moves.some(m => m.die === g.dice[1]);
                    if (can1 && !can2) candidates = moves.filter(m => m.die === g.dice[0]);
                    else if (!can1 && can2) candidates = moves.filter(m => m.die === g.dice[1]);
                }
                let best = null, bestScore = -Infinity;
                for (const m of candidates) {
                    const saved = g.cloneState();
                    g.applyMoveAI(m, 1);
                    let remaining = [...g.dice]; remaining.splice(remaining.indexOf(m.die), 1);
                    const origDice = g.dice; g.dice = remaining;
                    let guard = 0;
                    while (g.dice.length > 0 && guard++ < 4) {
                        const followUps = g.legalMoves(1);
                        if (followUps.length === 0) break;
                        let bestF = followUps[0], bestFs = -Infinity;
                        for (const f of followUps) { const s2 = g.cloneState(); g.applyMoveAI(f, 1); const sc = g.evaluatePosition(1); g.restoreState(s2); if (sc > bestFs) { bestFs = sc; bestF = f; } }
                        g.applyMoveAI(bestF, 1); g.dice.splice(g.dice.indexOf(bestF.die), 1);
                    }
                    const finalScore = g.evaluatePosition(1);
                    g.dice = origDice; g.restoreState(saved);
                    if (finalScore > bestScore) { bestScore = finalScore; best = m; }
                }
                if (!best) { g.endTurn(); return; }
                g.applyMoveAI(best, 1); g.dice.splice(g.dice.indexOf(best.die), 1);
                AudioFX.playCardSnap(); g.drawBoard();
                if (g.off[1] === 15) { g.win(1); return; }
                GameSession.setTimer(doNext, 350);
            };
            GameSession.setTimer(doNext, 400);
        },
        win(player) {
            this.over = true;
            if (player === 0) { AudioFX.playWin(); setText('bg-status', '🏆 You won! +200 Coins', '#22c55e'); finishGame(200, 100, true); }
            else { AudioFX.playClick(); setText('bg-status', '😢 AI won.', '#ef4444'); finishGame(0, 30, false); }
        }
    },

    'cribbage': {
        playerHand: [], aiHand: [], crib: [], starter: null, playerScore: 0, aiScore: 0, dealer: 0, phase: 'discard', playerDiscards: [], round: 1, over: false,
        scoreValue(c) { const r = c.rank; if (r === 'A') return 1; if (['J', 'Q', 'K'].includes(r)) return 10; return parseInt(r, 10); },
        countFifteens(cards) { let count = 0; const n = cards.length; for (let mask = 1; mask < (1 << n); mask++) { let sum = 0; for (let i = 0; i < n; i++) if (mask & (1 << i)) sum += this.scoreValue(cards[i]); if (sum === 15) count += 2; } return count; },
        countPairs(cards) { let score = 0; for (let i = 0; i < cards.length; i++) for (let j = i + 1; j < cards.length; j++) if (cards[i].rank === cards[j].rank) score += 2; return score; },
        countRuns(cards) {
            const counts = {}; cards.forEach(c => { const v = faceValue(c.rank); counts[v] = (counts[v] || 0) + 1; });
            const values = Object.keys(counts).map(Number).sort((a, b) => a - b);
            let bestLen = 1, curLen = 1;
            for (let i = 1; i < values.length; i++) { if (values[i] === values[i - 1] + 1) { curLen++; if (curLen > bestLen) bestLen = curLen; } else curLen = 1; }
            if (bestLen < 3) return 0;
            let score = 0;
            for (let i = 0; i + bestLen <= values.length; i++) { let consec = true; for (let j = 1; j < bestLen; j++) if (values[i + j] !== values[i + j - 1] + 1) { consec = false; break; } if (consec) { let mult = 1; for (let j = i; j < i + bestLen; j++) mult *= counts[values[j]]; score += bestLen * mult; } }
            return score;
        },
        countFlush(hand, starter, isCrib) { const suit = hand[0].suit; if (!hand.every(c => c.suit === suit)) return 0; if (isCrib) return starter.suit === suit ? 5 : 0; return starter.suit === suit ? 5 : 4; },
        countNobs(hand, starter) { return hand.some(c => c.rank === 'J' && c.suit === starter.suit) ? 1 : 0; },
        scoreHand(hand, starter, isCrib) { const all = [...hand, starter]; return this.countFifteens(all) + this.countPairs(all) + this.countRuns(all) + this.countFlush(hand, starter, isCrib) + this.countNobs(hand, starter); },
        render(container, mode) {
            const g = this;
            g.playerScore = 0; g.aiScore = 0; g.round = 1; g.over = false; g.dealer = 1;
            g.dealRound();
            container.innerHTML = `
                <h3>🃏 Cribbage — ${mode.toUpperCase()}</h3>
                <p>Discard 2 cards to the crib. Then score: 15s, pairs, runs, flushes, nobs. First to 61 wins!</p>
                <div style="display:flex; gap:20px; justify-content:center; flex-wrap:wrap; margin:15px 0;"><div>You: <b style="color:var(--accent-cyan);" id="cr-ps">0</b></div><div>AI: <b style="color:var(--accent-gold);" id="cr-as">0</b></div><div>Round <b id="cr-round">1</b></div><div>Dealer: <b id="cr-dealer">AI</b></div></div>
                <div id="cr-zone"><h4>Your Hand — pick 2 to discard to the crib:</h4><div id="cr-hand" style="display:flex; gap:8px; justify-content:center; margin:15px 0; min-height:130px;"></div><button class="btn primary-btn" id="cr-discard" onclick="GameEngines.cribbage.confirmDiscard()" disabled>Confirm Discard</button></div>
                <div id="cr-score" style="margin-top:20px;"></div>
                <div id="cr-status" style="margin-top:15px; font-weight:bold; min-height:24px;"></div>`;
            g.refresh();
        },
        dealRound() {
            const g = this;
            const deck = createStandardDeck(false);
            g.playerHand = deck.splice(0, 6); g.aiHand = deck.splice(0, 6);
            g.crib = []; g.starter = null; g.playerDiscards = []; g.phase = 'discard';
        },
        refresh() {
            const g = this;
            document.getElementById('cr-ps').textContent = g.playerScore;
            document.getElementById('cr-as').textContent = g.aiScore;
            document.getElementById('cr-round').textContent = g.round;
            document.getElementById('cr-dealer').textContent = g.dealer === 0 ? 'You' : 'AI';
            if (g.phase === 'discard') {
                document.getElementById('cr-hand').innerHTML = g.playerHand.map((c, i) => { const sel = g.playerDiscards.includes(i); return `<div onclick="GameEngines.cribbage.toggleDiscard(${i})" style="cursor:pointer; outline:${sel ? '3px solid #f59e0b' : 'none'}; border-radius:8px;">${renderCard(c.rank, c.suit)}</div>`; }).join('');
                document.getElementById('cr-discard').disabled = g.playerDiscards.length !== 2;
            }
        },
        toggleDiscard(i) { const g = this; if (g.phase !== 'discard') return; const idx = g.playerDiscards.indexOf(i); if (idx >= 0) g.playerDiscards.splice(idx, 1); else if (g.playerDiscards.length < 2) g.playerDiscards.push(i); AudioFX.playClick(); g.refresh(); },
        confirmDiscard() {
            const g = this;
            if (g.playerDiscards.length !== 2) return;
            const sorted = [...g.playerDiscards].sort((a, b) => b - a);
            for (const idx of sorted) g.crib.push(g.playerHand.splice(idx, 1)[0]);
            g.playerDiscards = [];
            for (let i = 0; i < 2; i++) g.crib.push(g.aiHand.splice(Math.floor(Math.random() * g.aiHand.length), 1)[0]);
            const deck = createStandardDeck(false);
            g.starter = deck.pop();
            AudioFX.playCardSnap(); g.phase = 'score'; g.showScoring();
        },
        showScoring() {
            const g = this;
            const nonDealer = g.dealer === 0 ? 'ai' : 'player';
            const order = nonDealer === 'player'
                ? [{ who: 'player', hand: g.playerHand, crib: false, label: 'Your hand' }, { who: 'ai', hand: g.aiHand, crib: false, label: 'AI hand' }, { who: 'crib', hand: g.crib, crib: true, label: 'Crib (goes to ' + (g.dealer === 0 ? 'you' : 'AI') + ')' }]
                : [{ who: 'ai', hand: g.aiHand, crib: false, label: 'AI hand' }, { who: 'player', hand: g.playerHand, crib: false, label: 'Your hand' }, { who: 'crib', hand: g.crib, crib: true, label: 'Crib (goes to ' + (g.dealer === 0 ? 'you' : 'AI') + ')' }];
            let html = `<h4>Cut Card: ${renderCard(g.starter.rank, g.starter.suit)}</h4>`;
            for (const o of order) {
                const s = g.scoreHand(o.hand, g.starter, o.crib);
                if (o.who === 'player') g.playerScore += s;
                else if (o.who === 'ai') g.aiScore += s;
                else if (g.dealer === 0) g.playerScore += s;
                else g.aiScore += s;
                html += `<div style="margin:8px 0; padding:10px; background:var(--surface-color); border-radius:8px;"><b>${o.label}:</b> ${s} points<br><div style="display:flex; gap:4px; justify-content:center; margin-top:8px;">${o.hand.map(c => renderCard(c.rank, c.suit)).join('')}</div></div>`;
            }
            document.getElementById('cr-zone').style.display = 'none';
            document.getElementById('cr-score').innerHTML = html + `<div style="text-align:center; margin:20px 0;"><button class="btn primary-btn" onclick="GameEngines.cribbage.nextRound()">Next Round →</button></div>`;
            AudioFX.playWin(); g.refresh();
            setText('cr-status', `Scored! You: ${g.playerScore}, AI: ${g.aiScore}`, '#22c55e');
        },
        nextRound() {
            const g = this;
            if (g.playerScore >= 61 || g.aiScore >= 61) { g.finish(); return; }
            g.round++; g.dealer = g.dealer === 0 ? 1 : 0;
            g.dealRound();
            document.getElementById('cr-zone').style.display = 'block';
            document.getElementById('cr-score').innerHTML = '';
            document.getElementById('cr-status').innerHTML = '';
            g.refresh();
            setText('cr-status', 'Discard 2 cards to the crib.');
        },
        finish() {
            this.over = true;
            if (this.playerScore >= 61 && this.playerScore > this.aiScore) { AudioFX.playWin(); setText('cr-status', `🏆 You win ${this.playerScore}–${this.aiScore}! +200 Coins`, '#22c55e'); finishGame(200, 100, true); }
            else { AudioFX.playClick(); setText('cr-status', `😢 AI wins ${this.aiScore}–${this.playerScore}.`, '#ef4444'); finishGame(0, 25, false); }
        }
    }
});
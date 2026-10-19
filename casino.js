const PLAY_MONEY_NOTE = `<p class="play-money-note">🎲 Play money only — no real currency is involved.</p>`;

function pokerValueCasino(rank) {
    if (rank === 'A') return 14;
    if (rank === 'K') return 13;
    if (rank === 'Q') return 12;
    if (rank === 'J') return 11;
    return parseInt(rank, 10);
}

function evaluateThreeCardHand(cards) {
    const vals = cards.map(c => pokerValueCasino(c.rank)).sort((a, b) => a - b);
    const raw = cards.map(c => c.rank === 'A' ? 1 : pokerValueCasino(c.rank)).sort((a, b) => a - b);
    const suits = cards.map(c => c.suit);
    const isFlush = suits[0] === suits[1] && suits[1] === suits[2];
    const isStraightNormal = vals[1] === vals[0] + 1 && vals[2] === vals[1] + 1;
    const isStraightAceLow = raw[0] === 1 && raw[1] === 2 && raw[2] === 3;
    const isStraight = isStraightNormal || isStraightAceLow;
    const straightHigh = isStraightAceLow ? 3 : vals[2];
    const counts = {};
    vals.forEach(v => counts[v] = (counts[v] || 0) + 1);
    const countVals = Object.values(counts);
    if (isFlush && isStraight) return { rank: 6, name: 'Straight Flush', tiebreakers: [straightHigh] };
    if (countVals.includes(3)) return { rank: 5, name: 'Three of a Kind', tiebreakers: [vals[0]] };
    if (isStraight) return { rank: 4, name: 'Straight', tiebreakers: [straightHigh] };
    if (isFlush) return { rank: 3, name: 'Flush', tiebreakers: [vals[2], vals[1], vals[0]] };
    if (countVals.includes(2)) {
        let pv, kicker;
        for (const v in counts) { if (counts[v] === 2) pv = parseInt(v, 10); else kicker = parseInt(v, 10); }
        return { rank: 2, name: 'Pair', tiebreakers: [pv, kicker] };
    }
    return { rank: 1, name: 'High Card', tiebreakers: [vals[2], vals[1], vals[0]] };
}

function compareThreeCardHands(a, b) {
    if (a.rank !== b.rank) return a.rank - b.rank;
    for (let i = 0; i < Math.max(a.tiebreakers.length, b.tiebreakers.length); i++) {
        const av = a.tiebreakers[i] || 0, bv = b.tiebreakers[i] || 0;
        if (av !== bv) return av - bv;
    }
    return 0;
}

function dealerQualifies(ev) { return ev.rank >= 2 || ev.tiebreakers[0] >= 12; }

const RED_NUMS = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36];

function recordCasinoResult(gameId, net) {
    if (typeof recordGameResult === 'function') recordGameResult(gameId, net > 0, Math.max(0, net), 0);
}

function showCasinoEnd(gameId) {
    GameSession.setTimer(() => {
        const viewport = document.getElementById('game-viewport');
        if (!viewport || viewport.querySelector('.end-buttons')) return;
        const bar = document.createElement('div');
        bar.className = 'end-buttons';
        bar.innerHTML = `<button class="btn primary-btn" onclick="openGame('${gameId}', '1-ai')">🔁 Play Again</button>
            <button class="btn tutorial-btn" onclick="closeGameStage()">← Back to Hub</button>`;
        viewport.appendChild(bar);
    }, 100);
}

Object.assign(GameEngines, {

    // ============ BACCARAT ============
    'baccarat': {
        bacValue(card) {
            if (card.rank === 'A') return 1;
            if (['10','J','Q','K'].includes(card.rank)) return 0;
            return parseInt(card.rank, 10);
        },
        total(hand) { return hand.reduce((s, c) => s + this.bacValue(c), 0) % 10; },
        render(container, mode) {
            container.innerHTML = `
                <h3>🎰 Baccarat — ${mode.toUpperCase()}</h3>
                ${PLAY_MONEY_NOTE}
                <p>Bet Player, Banker, or Tie. Closest to 9 wins. Tens & faces = 0, Ace = 1. Tie pays 8:1.</p>
                <div id="bac-bet-area"></div>
                <div id="bac-table" style="display:none; margin-top:20px;">
                    <div style="display:flex; gap:30px; justify-content:center; flex-wrap:wrap;">
                        <div><h4>Player (<span id="bac-psum">0</span>)</h4>
                            <div id="bac-player" style="display:flex; gap:8px; justify-content:center;"></div></div>
                        <div><h4>Banker (<span id="bac-bsum">0</span>)</h4>
                            <div id="bac-banker" style="display:flex; gap:8px; justify-content:center;"></div></div>
                    </div>
                </div>
                <div id="bac-status" style="margin-top:15px; font-weight:bold;"></div>`;
            this.setupUI();
        },
        setupUI() {
            const ref = renderBetPanel('bac-bet-area', 'Baccarat');
            if (!ref) return;
            const area = document.getElementById('bac-bet-area');
            const row = document.createElement('div');
            row.style.cssText = 'display:flex; gap:10px; justify-content:center; flex-wrap:wrap; margin-top:10px;';
            row.innerHTML = `
                <button class="btn primary-btn" onclick="GameEngines.baccarat.placeBet('player')">Bet Player (1:1)</button>
                <button class="btn primary-btn" onclick="GameEngines.baccarat.placeBet('banker')">Bet Banker (1:1)</button>
                <button class="btn primary-btn" onclick="GameEngines.baccarat.placeBet('tie')">Bet Tie (8:1)</button>`;
            area.querySelector('.bet-panel').appendChild(row);
        },
        placeBet(choice) {
            const g = this;
            const amount = getBetAmount('bac-bet-area');
            if (amount < 1 || amount > state.coins) return;
            state.coins -= amount; saveGameData(); updateStatsUI();
            document.getElementById('bac-bet-area').style.display = 'none';
            const deck = createStandardDeck(false);
            const player = [deck.pop(), deck.pop()];
            const banker = [deck.pop(), deck.pop()];
            const pNat = g.total(player) >= 8, bNat = g.total(banker) >= 8;
            if (!pNat && !bNat) {
                let pd = false;
                if (g.total(player) <= 5) { player.push(deck.pop()); pd = true; }
                const bt = g.total(banker);
                if (!pd) { if (bt <= 5) banker.push(deck.pop()); }
                else {
                    const third = g.bacValue(player[2]);
                    if (bt <= 2) banker.push(deck.pop());
                    else if (bt === 3 && third !== 8) banker.push(deck.pop());
                    else if (bt === 4 && third >= 2 && third <= 7) banker.push(deck.pop());
                    else if (bt === 5 && third >= 4 && third <= 7) banker.push(deck.pop());
                    else if (bt === 6 && third >= 6 && third <= 7) banker.push(deck.pop());
                }
            }
            const pF = g.total(player), bF = g.total(banker);
            document.getElementById('bac-table').style.display = 'block';
            document.getElementById('bac-player').innerHTML = player.map(c => renderCard(c.rank, c.suit)).join('');
            document.getElementById('bac-banker').innerHTML = banker.map(c => renderCard(c.rank, c.suit)).join('');
            document.getElementById('bac-psum').textContent = pF;
            document.getElementById('bac-bsum').textContent = bF;
            const winner = pF > bF ? 'player' : bF > pF ? 'banker' : 'tie';
            let payout = 0;
            if (choice === 'tie') { if (winner === 'tie') payout = amount * 9; }
            else if (choice === winner) payout = amount * 2;
            else if (winner === 'tie') payout = amount;
            state.coins += payout; saveGameData(); updateStatsUI();
            const net = payout - amount;
            recordCasinoResult('baccarat', net);
            if (net > 0) AudioFX.playWin(); else AudioFX.playClick();
            const color = net > 0 ? '#22c55e' : net < 0 ? '#ef4444' : '#f59e0b';
            const label = winner === 'tie' ? 'TIE' : winner.toUpperCase() + ' wins';
            setText('bac-status', `${label} — ${pF} vs ${bF} · ${net > 0 ? '+' : ''}${net} coins`, color);
            showCasinoEnd('baccarat');
        }
    },

    // ============ THREE CARD POKER ============
    'three-card-poker': {
        ante: 0, play: 0, playerHand: [], dealerHand: [], stage: 'bet',
        render(container, mode) {
            this.stage = 'bet';
            container.innerHTML = `
                <h3>🃏 Three Card Poker — ${mode.toUpperCase()}</h3>
                ${PLAY_MONEY_NOTE}
                <p>Straight beats Flush! Dealer qualifies with Q-high or better. Ante bonus: Straight 1:1, Trips 4:1, Straight Flush 5:1.</p>
                <div id="tcp-bet-area"></div>
                <div id="tcp-game-area" style="display:none; margin-top:20px;">
                    <div style="display:flex; gap:30px; justify-content:center; flex-wrap:wrap;">
                        <div><h4>Dealer</h4><div id="tcp-dealer" style="display:flex; gap:8px; justify-content:center;"></div></div>
                        <div><h4>You</h4><div id="tcp-player" style="display:flex; gap:8px; justify-content:center;"></div></div>
                    </div>
                    <div id="tcp-actions" style="display:flex; gap:10px; justify-content:center; margin-top:20px;"></div>
                </div>
                <div id="tcp-status" style="margin-top:15px; font-weight:bold;"></div>`;
            this.setupUI();
        },
        setupUI() {
            const ref = renderBetPanel('tcp-bet-area', 'Three Card Poker');
            if (!ref) return;
            const area = document.getElementById('tcp-bet-area');
            const btn = document.createElement('button');
            btn.className = 'btn primary-btn'; btn.style.marginTop = '10px'; btn.textContent = 'Deal Cards';
            btn.onclick = () => GameEngines['three-card-poker'].deal();
            area.querySelector('.bet-panel').appendChild(btn);
        },
        deal() {
            const g = this;
            const ante = getBetAmount('tcp-bet-area');
            if (ante < 1 || ante > state.coins) return;
            state.coins -= ante; saveGameData(); updateStatsUI();
            g.ante = ante; g.play = ante; g.stage = 'play';
            const deck = createStandardDeck(false);
            g.playerHand = [deck.pop(), deck.pop(), deck.pop()];
            g.dealerHand = [deck.pop(), deck.pop(), deck.pop()];
            document.getElementById('tcp-bet-area').style.display = 'none';
            document.getElementById('tcp-game-area').style.display = 'block';
            document.getElementById('tcp-player').innerHTML = g.playerHand.map(c => renderCard(c.rank, c.suit)).join('');
            document.getElementById('tcp-dealer').innerHTML = g.dealerHand.map(() => cardBack()).join('');
            document.getElementById('tcp-actions').innerHTML = `
                <button class="btn primary-btn" onclick="AudioFX.playCardSnap(); GameEngines['three-card-poker'].resolve('play')">Play (match ante)</button>
                <button class="btn tutorial-btn" onclick="AudioFX.playClick(); GameEngines['three-card-poker'].resolve('fold')">Fold (lose ante)</button>`;
            setText('tcp-status', `Your hand: ${evaluateThreeCardHand(g.playerHand).name}.`);
        },
        resolve(choice) {
            const g = this;
            if (g.stage !== 'play') return;
            g.stage = 'done';
            document.getElementById('tcp-dealer').innerHTML = g.dealerHand.map(c => renderCard(c.rank, c.suit)).join('');
            const pEval = evaluateThreeCardHand(g.playerHand);
            const dEval = evaluateThreeCardHand(g.dealerHand);
            if (choice === 'fold') {
                AudioFX.playClick();
                setText('tcp-status', `Folded. Lost ${g.ante} coins.`, '#ef4444');
                recordCasinoResult('three-card-poker', -g.ante);
                return showCasinoEnd('three-card-poker');
            }
            state.coins -= g.play;
            let bonus = 0;
            if (pEval.rank === 6) bonus = g.ante * 5;
            else if (pEval.rank === 5) bonus = g.ante * 4;
            else if (pEval.rank === 4) bonus = g.ante * 1;
            let ret = 0, msg = '', color = '#f59e0b';
            if (!dealerQualifies(dEval)) {
                ret = g.ante * 2 + g.play + bonus;
                msg = `Dealer doesn't qualify. Ante wins, Play pushes.`;
                color = '#22c55e';
            } else {
                const cmp = compareThreeCardHands(pEval, dEval);
                if (cmp > 0) { ret = g.ante * 2 + g.play * 2 + bonus; msg = `You win! ${pEval.name} beats ${dEval.name}.`; color = '#22c55e'; }
                else if (cmp < 0) { ret = bonus; msg = `Dealer wins with ${dEval.name}.`; color = '#ef4444'; }
                else { ret = g.ante + g.play + bonus; msg = `Tie — both ${pEval.name}.`; }
            }
            state.coins += ret; saveGameData(); updateStatsUI();
            const net = ret - (g.ante + g.play);
            recordCasinoResult('three-card-poker', net);
            if (net > 0) AudioFX.playWin(); else AudioFX.playClick();
            const bonusStr = bonus > 0 ? ` (Ante bonus +${bonus})` : '';
            setText('tcp-status', `${msg}${bonusStr} Net: ${net > 0 ? '+' : ''}${net} coins.`, color);
            showCasinoEnd('three-card-poker');
        }
    },

    // ============ ROULETTE ============
    'roulette': {
        spinning: false,
        render(container, mode) {
            const g = this;
            g.spinning = false;
            const numsRow = (arr) => arr.map(n => {
                const c = RED_NUMS.includes(n) ? '#dc2626' : '#0f172a';
                return `<button class="roul-num" style="background:${c}; color:white; border:1px solid #334155; padding:6px; border-radius:4px; cursor:pointer; font-weight:bold; font-size:0.75rem;"
                    onclick="GameEngines.roulette.spin(${n})">${n}</button>`;
            }).join('');
            container.innerHTML = `
                <h3>🎡 European Roulette — ${mode.toUpperCase()}</h3>
                ${PLAY_MONEY_NOTE}
                <div id="roul-bet-area"></div>
                <div id="roul-wheel" style="margin:20px 0; font-size:2rem; font-weight:bold; min-height:70px;">🎡</div>
                <div id="roul-bets">
                    <p style="margin-bottom:6px; font-weight:bold;">Even-money (1:1):</p>
                    <div style="display:flex; gap:8px; justify-content:center; flex-wrap:wrap; margin-bottom:16px;">
                        <button class="btn primary-btn" onclick="GameEngines.roulette.spin('red')">🔴 Red</button>
                        <button class="btn tutorial-btn" onclick="GameEngines.roulette.spin('black')">⚫ Black</button>
                        <button class="btn primary-btn" onclick="GameEngines.roulette.spin('odd')">Odd</button>
                        <button class="btn primary-btn" onclick="GameEngines.roulette.spin('even')">Even</button>
                        <button class="btn primary-btn" onclick="GameEngines.roulette.spin('low')">1–18</button>
                        <button class="btn primary-btn" onclick="GameEngines.roulette.spin('high')">19–36</button>
                    </div>
                    <p style="margin-bottom:6px; font-weight:bold;">Single numbers (35:1):</p>
                    <div style="max-width:340px; margin:0 auto;">
                        <button style="background:#16a34a; color:white; border:1px solid #334155; padding:6px; border-radius:4px; cursor:pointer; font-weight:bold; width:100%; margin-bottom:4px;"
                            onclick="GameEngines.roulette.spin(0)">0 — Green (35:1)</button>
                        <div id="roul-grid" style="display:grid; grid-template-columns:repeat(3, 1fr); gap:4px;">
                            ${numsRow([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36])}
                        </div>
                    </div>
                </div>
                <div id="roul-status" style="margin-top:15px; font-weight:bold;"></div>`;
            renderBetPanel('roul-bet-area', 'Roulette');
        },
        spin(choice) {
            const g = this;
            if (g.spinning) return;
            const amount = getBetAmount('roul-bet-area');
            if (amount < 1 || amount > state.coins) return;
            state.coins -= amount; saveGameData(); updateStatsUI();
            g.spinning = true;
            document.getElementById('roul-bets').style.pointerEvents = 'none';
            document.getElementById('roul-bets').style.opacity = '0.5';
            let ticks = 0;
            const tickTimer = GameSession.setInterval(() => {
                const n = Math.floor(Math.random() * 37);
                const c = n === 0 ? '#22c55e' : RED_NUMS.includes(n) ? '#dc2626' : '#0f172a';
                const wEl = document.getElementById('roul-wheel');
                if (!wEl) { clearInterval(tickTimer); return; }
                wEl.innerHTML = `<span style="background:${c}; color:white; padding:12px 22px; border-radius:50%;">${n}</span>`;
                AudioFX.playClick();
                if (++ticks >= 12) { clearInterval(tickTimer); g.land(choice, amount, n); }
            }, 90);
        },
        land(choice, amount, result) {
            const g = this;
            g.spinning = false;
            document.getElementById('roul-bets').style.pointerEvents = '';
            document.getElementById('roul-bets').style.opacity = '1';
            const c = result === 0 ? '#22c55e' : RED_NUMS.includes(result) ? '#dc2626' : '#0f172a';
            document.getElementById('roul-wheel').innerHTML = `<span style="background:${c}; color:white; padding:12px 22px; border-radius:50%;">${result}</span>`;
            let win = false, payout = 0;
            if (typeof choice === 'number') { if (result === choice) { win = true; payout = amount * 36; } }
            else {
                if (choice === 'red') win = result !== 0 && RED_NUMS.includes(result);
                else if (choice === 'black') win = result !== 0 && !RED_NUMS.includes(result);
                else if (choice === 'odd') win = result !== 0 && result % 2 === 1;
                else if (choice === 'even') win = result !== 0 && result % 2 === 0;
                else if (choice === 'low') win = result !== 0 && result <= 18;
                else if (choice === 'high') win = result !== 0 && result >= 19;
                if (win) payout = amount * 2;
            }
            state.coins += payout; saveGameData(); updateStatsUI();
            const net = payout - amount;
            recordCasinoResult('roulette', net);
            if (win) AudioFX.playWin(); else AudioFX.playClick();
            const label = typeof choice === 'number' ? `Number ${choice}` : choice.toUpperCase();
            setText('roul-status', `${result} hit — you bet ${label}. ${net > 0 ? '+' : ''}${net} coins.`, win ? '#22c55e' : '#ef4444');
            showCasinoEnd('roulette');
        }
    },

    // ============ CRAPS ============
    'craps': {
        point: 0, bet: 0, rolling: false, over: false, _coinsBefore: 0,
        render(container, mode) {
            const g = this;
            g.point = 0; g.bet = 0; g.rolling = false; g.over = false;
            container.innerHTML = `
                <h3>🎲 Craps — ${mode.toUpperCase()}</h3>
                ${PLAY_MONEY_NOTE}
                <p><b>Come-out:</b> Win on 7 or 11 (1:1), lose on 2/3/12. Any other number sets the <b>point</b>.<br>
                <b>Point phase:</b> Roll the point again to win — but 7 loses!</p>
                <div id="craps-bet-area"></div>
                <div id="craps-dice" style="display:flex; gap:20px; justify-content:center; margin:20px 0;">
                    <div class="die" id="die1">?</div>
                    <div class="die" id="die2">?</div>
                </div>
                <div id="craps-point" style="font-size:1.2rem; min-height:30px; font-weight:bold;"></div>
                <div id="craps-status" style="margin-top:15px; font-weight:bold; min-height:30px;"></div>`;
            g.setupUI();
        },
        setupUI() {
            const g = this;
            const ref = renderBetPanel('craps-bet-area', 'Craps');
            if (!ref) return;
            const area = document.getElementById('craps-bet-area');
            const btn = document.createElement('button');
            btn.className = 'btn primary-btn'; btn.style.marginTop = '10px'; btn.textContent = 'Roll Dice';
            btn.onclick = () => g.roll();
            area.querySelector('.bet-panel').appendChild(btn);
        },
        roll() {
            const g = this;
            if (g.rolling || g.over) return;
            if (g.point === 0) {
                const amt = getBetAmount('craps-bet-area');
                if (amt < 1 || amt > state.coins) return;
                g.bet = amt; g._coinsBefore = state.coins;
                state.coins -= amt; saveGameData(); updateStatsUI();
            }
            g.rolling = true;
            AudioFX.playCardSnap();
            const d1 = Math.floor(Math.random() * 6) + 1;
            const d2 = Math.floor(Math.random() * 6) + 1;
            const total = d1 + d2;
            document.getElementById('die1').textContent = d1;
            document.getElementById('die2').textContent = d2;
            GameSession.setTimer(() => g.resolve(total), 400);
        },
        resolve(total) {
            const g = this;
            if (g.point === 0) {
                if (total === 7 || total === 11) {
                    AudioFX.playWin();
                    state.coins += g.bet * 2; saveGameData(); updateStatsUI();
                    setText('craps-status', `🎉 Natural ${total}! +${g.bet} coins!`, '#22c55e');
                    g.finishRound();
                } else if (total === 2 || total === 3 || total === 12) {
                    AudioFX.playClick();
                    setText('craps-status', `💥 Craps! Rolled ${total}. Lost ${g.bet} coins.`, '#ef4444');
                    g.finishRound();
                } else {
                    g.point = total;
                    document.getElementById('craps-point').innerHTML = `Point: <b style="color:#38bdf8;">${total}</b> — roll again!`;
                    setText('craps-status', `Keep rolling. Hit ${total} to win, avoid 7.`);
                    g.rolling = false;
                }
            } else {
                if (total === g.point) {
                    AudioFX.playWin();
                    state.coins += g.bet * 2; saveGameData(); updateStatsUI();
                    setText('craps-status', `🎉 Hit the point ${total}! +${g.bet} coins!`, '#22c55e');
                    g.finishRound();
                } else if (total === 7) {
                    AudioFX.playClick();
                    setText('craps-status', `💀 Seven out! Lost ${g.bet} coins.`, '#ef4444');
                    g.finishRound();
                } else {
                    setText('craps-status', `Rolled ${total}. Point still ${g.point}.`);
                    g.rolling = false;
                }
            }
        },
        finishRound() {
            const g = this;
            g.over = true; g.rolling = false; g.point = 0;
            const net = state.coins - g._coinsBefore;
            recordCasinoResult('craps', net);
            showCasinoEnd('craps');
        }
    },

    // ============ PLINKO ============
    'plinko': {
        canvas: null, ctx: null, balls: [], pegs: [], buckets: [],
        animationId: null, betRef: null,
        MULTIPLIERS: [10, 3, 1.5, 0.5, 0.2, 0.5, 1.5, 3, 10],
        ROWS: 8, WIDTH: 500, HEIGHT: 460, PEG_R: 6, SPACING: 46, BUCKET_H: 40, BALL_R: 8,
        render(container, mode) {
            const g = this;
            g.balls = []; g.animationId = null;
            g.pegs = [];
            for (let r = 0; r < g.ROWS; r++) {
                const n = r + 3;
                const startX = g.WIDTH / 2 - (n - 1) * g.SPACING / 2;
                for (let p = 0; p < n; p++) g.pegs.push({ x: startX + p * g.SPACING, y: 80 + r * 38, r: g.PEG_R });
            }
            g.buckets = [];
            const bw = g.WIDTH / g.MULTIPLIERS.length;
            for (let i = 0; i < g.MULTIPLIERS.length; i++) {
                g.buckets.push({ x: i * bw, y: g.HEIGHT - g.BUCKET_H, width: bw, height: g.BUCKET_H, multiplier: g.MULTIPLIERS[i] });
            }
            container.innerHTML = `
                <h3>🎲 Plinko — ${mode.toUpperCase()}</h3>
                ${PLAY_MONEY_NOTE}
                <p>Drop a ball from the top. Every peg bounce is random! Land in a high-multiplier bucket for big payouts.</p>
                <div id="plinko-bet-area"></div>
                <div style="position:relative; display:inline-block; margin:20px 0;">
                    <canvas id="plinko-canvas" width="${g.WIDTH}" height="${g.HEIGHT}"
                        style="background:#0a0e1a; border-radius:12px; max-width:100%; display:block; margin:0 auto;"></canvas>
                </div>
                <div id="plinko-status" style="margin-top:15px; font-weight:bold;"></div>`;
            g.canvas = document.getElementById('plinko-canvas');
            g.ctx = g.canvas.getContext('2d');
            g.betRef = renderBetPanel('plinko-bet-area', 'Plinko');
            const area = document.getElementById('plinko-bet-area');
            if (area && g.betRef) {
                const btn = document.createElement('button');
                btn.className = 'btn primary-btn'; btn.style.marginTop = '10px'; btn.textContent = '🪙 Drop Ball';
                btn.onclick = () => g.dropBall();
                area.querySelector('.bet-panel').appendChild(btn);
            }
            g.draw();
        },
        dropBall() {
            const g = this;
            const bet = getBetAmount('plinko-bet-area');
            if (bet < 1 || bet > state.coins) return;
            state.coins -= bet; saveGameData(); updateStatsUI();
            if (!state.achievements.plinkoDrop.claimed) {
                state.achievements.plinkoDrop.claimed = true;
                state.coins += state.achievements.plinkoDrop.reward;
                saveGameData(); updateStatsUI();
                if (typeof showToast === 'function') showToast(`🏆 Achievement: Plinko Pro! +${state.achievements.plinkoDrop.reward} Coins`, 'success', 4000);
            }
            g.balls.push({ x: g.WIDTH / 2 + (Math.random() - 0.5) * 6, y: 20, vx: (Math.random() - 0.5) * 1.5, vy: 0, r: g.BALL_R, bet: bet, color: '#ffd700', active: true });
            if (!g.animationId) g.startLoop();
        },
        startLoop() {
            const g = this;
            const step = () => {
                if (!document.getElementById('plinko-canvas')) { g.animationId = null; return; }
                g.update(); g.draw();
                if (g.balls.some(b => b.active)) g.animationId = requestAnimationFrame(step);
                else { g.balls = []; g.animationId = null; }
            };
            g.animationId = requestAnimationFrame(step);
        },
        update() {
            const g = this;
            const gravity = 0.35, damping = 0.72, wallBounce = 0.7;
            for (const ball of g.balls) {
                if (!ball.active) continue;
                ball.vy += gravity; ball.x += ball.vx; ball.y += ball.vy;
                if (ball.x < ball.r) { ball.x = ball.r; ball.vx = -ball.vx * wallBounce; }
                if (ball.x > g.WIDTH - ball.r) { ball.x = g.WIDTH - ball.r; ball.vx = -ball.vx * wallBounce; }
                for (const peg of g.pegs) {
                    const dx = ball.x - peg.x, dy = ball.y - peg.y;
                    const dist = Math.sqrt(dx*dx + dy*dy);
                    const minDist = ball.r + peg.r;
                    if (dist < minDist && dist > 0.01) {
                        const nx = dx / dist, ny = dy / dist;
                        const dot = ball.vx * nx + ball.vy * ny;
                        ball.vx = (ball.vx - 2 * dot * nx) * damping;
                        ball.vy = (ball.vy - 2 * dot * ny) * damping;
                        ball.vx += (Math.random() - 0.5) * 1.2;
                        ball.x = peg.x + nx * minDist; ball.y = peg.y + ny * minDist;
                    }
                }
                if (ball.y + ball.r >= g.buckets[0].y) {
                    for (const b of g.buckets) {
                        if (ball.x >= b.x && ball.x < b.x + b.width) {
                            ball.active = false;
                            const payout = Math.floor(ball.bet * b.multiplier);
                            state.coins += payout; saveGameData(); updateStatsUI();
                            const net = payout - ball.bet;
                            recordCasinoResult('plinko', net);
                            if (net > 0) AudioFX.playWin(); else AudioFX.playClick();
                            setText('plinko-status', `${b.multiplier}x! You won ${payout} coins (bet ${ball.bet}). Net: ${net > 0 ? '+' : ''}${net}`, net > 0 ? '#22c55e' : '#f59e0b');
                            showCasinoEnd('plinko');
                            break;
                        }
                    }
                    if (ball.active) ball.active = false;
                }
            }
        },
        draw() {
            const g = this, ctx = g.ctx;
            if (!ctx) return;
            ctx.clearRect(0, 0, g.WIDTH, g.HEIGHT);
            for (const peg of g.pegs) {
                ctx.beginPath(); ctx.arc(peg.x, peg.y, peg.r, 0, Math.PI * 2);
                ctx.fillStyle = '#38bdf8'; ctx.fill();
                ctx.strokeStyle = '#1e293b'; ctx.lineWidth = 2; ctx.stroke();
            }
            for (const b of g.buckets) {
                const color = b.multiplier >= 5 ? '#dc2626' : b.multiplier >= 2 ? '#f59e0b' : b.multiplier >= 1 ? '#eab308' : '#22c55e';
                ctx.fillStyle = color; ctx.fillRect(b.x + 2, b.y, b.width - 4, b.height);
                ctx.fillStyle = '#fff'; ctx.font = 'bold 14px sans-serif';
                ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                ctx.fillText(b.multiplier + 'x', b.x + b.width / 2, b.y + b.height / 2);
            }
            for (const ball of g.balls) {
                ctx.beginPath(); ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
                ctx.fillStyle = ball.color; ctx.fill();
                ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
            }
        }
    }
});
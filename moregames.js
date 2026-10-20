Object.assign(GameEngines, {

    'memory-match': {
        cards: [], firstFlip: null, matched: 0, moves: 0, maxMoves: 20, over: false, lock: false,
        render(container, mode) {
            const g = this;
            const ranks = ['A','2','3','4','5','6','7','8'];
            const deck = [...ranks, ...ranks];
            g.cards = shuffle(deck).map(r => ({ rank: r, state: 'down' }));
            g.firstFlip = null; g.matched = 0; g.moves = 0; g.over = false; g.lock = false;
            container.innerHTML = `
                <h3>🃏 Memory Match — ${mode.toUpperCase()}</h3>
                <p>Flip 2 cards at a time. Find all 8 matching pairs in ${g.maxMoves} flips!</p>
                <p>Pairs: <b id="mm-matched" style="color:#22c55e;">0</b>/8 · Flips: <b id="mm-moves" style="color:var(--accent-cyan);">0</b>/${g.maxMoves}</p>
                <div id="mm-board" style="display:grid; grid-template-columns:repeat(4,1fr); gap:10px; max-width:380px; margin:20px auto;"></div>
                <div id="mm-status" style="margin-top:15px; font-weight:bold; min-height:24px;"></div>`;
            g.refresh();
        },
        refresh() {
            const g = this;
            const board = document.getElementById('mm-board'); if (!board) return;
            board.innerHTML = g.cards.map((card, i) => {
                if (card.state === 'up' || card.state === 'matched') { const opacity = card.state === 'matched' ? 0.6 : 1; return `<div style="opacity:${opacity};" onclick="GameEngines['memory-match'].click(${i})">${renderCard(card.rank, '♠')}</div>`; }
                return `<div class="mm-card" style="width:75px; height:110px; border-radius:8px; background:linear-gradient(135deg,#1e293b,#334155); border:2px solid #475569; display:flex; align-items:center; justify-content:center; font-size:2rem; color:#94a3b8; cursor:pointer; margin:6px;" onclick="GameEngines['memory-match'].click(${i})">?</div>`;
            }).join('');
            document.getElementById('mm-matched').textContent = g.matched / 2;
            document.getElementById('mm-moves').textContent = g.moves;
        },
        click(i) {
            const g = this;
            if (g.over || g.lock) return;
            const card = g.cards[i];
            if (card.state !== 'down') return;
            card.state = 'up';
            AudioFX.playCardSnap();
            g.refresh();
            if (g.firstFlip === null) { g.firstFlip = i; return; }
            g.moves++;
            const first = g.cards[g.firstFlip];
            if (first.rank === card.rank) {
                first.state = 'matched'; card.state = 'matched';
                g.matched += 2; g.firstFlip = null;
                AudioFX.playWin();
                setText('mm-status', `✅ Match!`, '#22c55e');
                g.refresh();
                if (g.matched === 16) { g.over = true; AudioFX.playWin(); const coins = 60 + Math.max(0, (g.maxMoves - g.moves) * 5); setText('mm-status', `🎉 All pairs found in ${g.moves} flips! +${coins} Coins`, '#22c55e'); finishGame(coins, 50, true); }
            } else {
                g.lock = true;
                setText('mm-status', `Not a match — ${first.rank} vs ${card.rank}`);
                GameSession.setTimer(() => { first.state = 'down'; card.state = 'down'; g.firstFlip = null; g.lock = false; g.refresh(); if (g.moves >= g.maxMoves) { g.over = true; AudioFX.playClick(); setText('mm-status', `😢 Out of flips! ${g.matched/2}/8 pairs.`, '#ef4444'); finishGame(0, 10, false); } }, 900);
            }
        }
    },

    'connect-four': {
        board: null, turn: 'r', over: false, aiThinking: false, ROWS: 6, COLS: 7,
        render(container, mode) {
            const g = this;
            g.board = Array.from({ length: g.ROWS }, () => Array(g.COLS).fill(null));
            g.turn = 'r'; g.over = false; g.aiThinking = false;
            container.innerHTML = `
                <h3>🔴 Connect Four — ${mode.toUpperCase()}</h3>
                <p>You play red. Drop pieces into columns and get 4 in a row!</p>
                <div id="cf-board" style="display:inline-block; background:#1e40af; padding:8px; border-radius:8px; margin:20px auto;"></div>
                <div id="cf-status" style="margin-top:15px; font-weight:bold; min-height:24px;"></div>`;
            g.refresh();
        },
        refresh() {
            const g = this;
            const board = document.getElementById('cf-board'); if (!board) return;
            const cols = [];
            const canClick = g.turn === 'r' && !g.over && !g.aiThinking;
            for (let c = 0; c < g.COLS; c++) {
                cols.push(`<div style="display:flex; flex-direction:column; gap:4px; cursor:${canClick ? 'pointer' : 'default'};" onclick="GameEngines['connect-four'].drop(${c})">${g.board.map(row => { const v = row[c]; const color = v === 'r' ? 'radial-gradient(circle at 30% 30%, #ff5555, #dc2626)' : v === 'y' ? 'radial-gradient(circle at 30% 30%, #fde047, #eab308)' : '#0f172a'; return `<div style="width:40px; height:40px; border-radius:50%; background:${color}; box-shadow:inset 0 2px 4px rgba(0,0,0,0.5);"></div>`; }).join('')}</div>`);
            }
            board.innerHTML = `<div style="display:flex; gap:4px;">${cols.join('')}</div>`;
        },
        drop(col) {
            const g = this;
            if (g.over || g.turn !== 'r' || g.aiThinking) return;
            let row = -1;
            for (let r = g.ROWS - 1; r >= 0; r--) if (!g.board[r][col]) { row = r; break; }
            if (row === -1) return;
            g.board[row][col] = 'r';
            AudioFX.playCardSnap();
            g.refresh();
            if (g.checkWin(row, col, 'r')) { g.win('r'); return; }
            if (g.isFull()) { g.drawGame(); return; }
            g.turn = 'y'; g.aiThinking = true; g.refresh();
            GameSession.setTimer(() => g.aiMove(), 500);
        },
        aiMove() {
            const g = this;
            if (g.over) return;
            let bestCol = -1;
            for (let c = 0; c < g.COLS; c++) if (g.canPlace(c)) { const r = g.getDropRow(c); g.board[r][c] = 'y'; if (g.checkWin(r, c, 'y')) { g.board[r][c] = null; bestCol = c; break; } g.board[r][c] = null; }
            if (bestCol === -1) for (let c = 0; c < g.COLS; c++) if (g.canPlace(c)) { const r = g.getDropRow(c); g.board[r][c] = 'r'; if (g.checkWin(r, c, 'r')) { g.board[r][c] = null; bestCol = c; break; } g.board[r][c] = null; }
            if (bestCol === -1) for (const c of [3, 2, 4, 1, 5, 0, 6]) if (g.canPlace(c)) { bestCol = c; break; }
            if (bestCol !== -1) { const r = g.getDropRow(bestCol); g.board[r][bestCol] = 'y'; AudioFX.playCardSnap(); g.turn = 'r'; g.aiThinking = false; g.refresh(); if (g.checkWin(r, bestCol, 'y')) { g.win('y'); return; } if (g.isFull()) { g.drawGame(); } }
            else { g.turn = 'r'; g.aiThinking = false; g.refresh(); }
        },
        canPlace(c) { return !this.board[0][c]; },
        getDropRow(c) { for (let r = this.ROWS - 1; r >= 0; r--) if (!this.board[r][c]) return r; return -1; },
        checkWin(row, col, color) {
            const dirs = [[0,1],[1,0],[1,1],[1,-1]];
            for (const [dr, dc] of dirs) { let count = 1; for (const sign of [1, -1]) { let r = row + sign * dr, c = col + sign * dc; while (r >= 0 && r < this.ROWS && c >= 0 && c < this.COLS && this.board[r][c] === color) { count++; r += sign * dr; c += sign * dc; } } if (count >= 4) return true; }
            return false;
        },
        isFull() { return this.board[0].every(v => v); },
        win(color) {
            this.over = true;
            if (color === 'r') { AudioFX.playWin(); setText('cf-status', '🎉 You win! +100 Coins', '#22c55e'); finishGame(100, 60, true); }
            else { AudioFX.playClick(); setText('cf-status', '😢 AI wins. No reward.', '#ef4444'); finishGame(0, 15, false); }
            this.refresh();
        },
        drawGame() { this.over = true; setText('cf-status', '🤝 Draw! +30 Coins', '#f59e0b'); finishGame(30, 25, false); this.refresh(); }
    },

    'snap': {
        deck: [], currentCard: null, previousCard: null, points: 0, misses: 0, maxMisses: 3, round: 0, maxRounds: 20, over: false, awaitingSnap: false, reactionStart: 0, started: false,
        render(container, mode) {
            const g = this;
            g.deck = createStandardDeck(false);
            g.currentCard = null; g.previousCard = null; g.points = 0; g.misses = 0; g.round = 0; g.over = false; g.awaitingSnap = false; g.started = false;
            container.innerHTML = `
                <h3>🖐️ Snap! — ${mode.toUpperCase()}</h3>
                <p>Cards flip quickly. When two cards in a row have the <b>same rank</b>, click SNAP within 1.5 seconds!</p>
                <p>Score: <b id="snap-points" style="color:var(--accent-cyan);">0</b> · Misses: <b id="snap-misses" style="color:#ef4444;">0/3</b> · Round: <b id="snap-round">0/${g.maxRounds}</b></p>
                <div style="margin:20px 0; min-height:130px; display:flex; gap:20px; justify-content:center; align-items:center;"><div id="snap-prev">🂠</div><div style="font-size:1.5rem; color:var(--text-muted);">→</div><div id="snap-current">🂠</div></div>
                <button id="snap-btn" class="btn primary-btn" style="padding:20px 60px; font-size:1.5rem; font-weight:900; background:#dc2626; margin:10px;" onclick="GameEngines.snap.clickSnap()" disabled>SNAP!</button>
                <br>
                <button id="snap-start" class="btn tutorial-btn" style="padding:12px 30px; margin-top:10px;" onclick="GameEngines.snap.start()">▶ Start Game</button>
                <div id="snap-status" style="margin-top:15px; font-weight:bold; min-height:24px;"></div>`;
        },
        start() { const g = this; if (g.started) return; g.started = true; document.getElementById('snap-start').style.display = 'none'; document.getElementById('snap-btn').disabled = false; setText('snap-status', 'Get ready...'); GameSession.setTimer(() => g.nextCard(), 800); },
        nextCard() {
            const g = this;
            if (g.over) return;
            if (g.round >= g.maxRounds) { g.finish(); return; }
            if (g.deck.length === 0) g.deck = createStandardDeck(false);
            g.previousCard = g.currentCard;
            g.currentCard = g.deck.pop();
            g.round++;
            document.getElementById('snap-prev').innerHTML = g.previousCard ? renderCard(g.previousCard.rank, g.previousCard.suit) : '🂠';
            document.getElementById('snap-current').innerHTML = renderCard(g.currentCard.rank, g.currentCard.suit);
            document.getElementById('snap-round').textContent = g.round;
            if (g.previousCard && g.previousCard.rank === g.currentCard.rank) {
                g.awaitingSnap = true; g.reactionStart = Date.now();
                g.snapWindow = GameSession.setTimer(() => {
                    if (g.awaitingSnap) {
                        g.awaitingSnap = false; g.misses++; g.points = Math.max(0, g.points - 5); updateSnapUI();
                        AudioFX.playClick(); setText('snap-status', '😴 Too slow! -5', '#ef4444');
                        if (g.misses >= g.maxMisses) { g.finish(); return; }
                        GameSession.setTimer(() => g.nextCard(), 500);
                    }
                }, 1500);
            } else { setText('snap-status', 'No match. Keep watching...'); GameSession.setTimer(() => g.nextCard(), 700); }
        },
        clickSnap() {
            const g = this;
            if (g.over) return;
            if (g.awaitingSnap) {
                const reaction = Date.now() - g.reactionStart;
                g.awaitingSnap = false;
                const bonus = Math.max(0, 10 - Math.floor(reaction / 150));
                g.points += 10 + bonus; updateSnapUI();
                AudioFX.playWin(); setText('snap-status', `✅ SNAP! +${10 + bonus} (${reaction}ms)`, '#22c55e');
                GameSession.setTimer(() => g.nextCard(), 500);
            } else {
                g.misses++; g.points = Math.max(0, g.points - 10); updateSnapUI();
                AudioFX.playClick(); setText('snap-status', '❌ False snap! -10', '#ef4444');
                if (g.misses >= g.maxMisses) g.finish();
            }
        },
        finish() {
            const g = this;
            g.over = true;
            document.getElementById('snap-btn').disabled = true;
            const coins = Math.max(0, g.points * 2);
            const won = g.points >= 30;
            if (won) { AudioFX.playWin(); setText('snap-status', `🏁 Final score: ${g.points}! +${coins} Coins`, '#22c55e'); }
            else { AudioFX.playClick(); setText('snap-status', `🏁 Final score: ${g.points}.`, '#ef4444'); }
            finishGame(coins, won ? 40 : 15, won);
        }
    },

    'bomb-cat': {
        deck: [], hand: [], lives: 3, turn: 0, maxTurns: 25, over: false,
        render(container, mode) {
            const g = this;
            const deck = [];
            for (let i = 0; i < 3; i++) deck.push({ type: 'bomb', icon: '💣', name: 'Bomb' });
            for (let i = 0; i < 3; i++) deck.push({ type: 'defuse', icon: '🔧', name: 'Defuse' });
            for (let i = 0; i < 4; i++) deck.push({ type: 'skip', icon: '⏭️', name: 'Skip' });
            for (let i = 0; i < 3; i++) deck.push({ type: 'peek', icon: '👀', name: 'See Future' });
            for (let i = 0; i < 12; i++) deck.push({ type: 'cat', icon: '🐱', name: 'Cat' });
            g.deck = shuffle(deck);
            g.hand = [{ type: 'defuse', icon: '🔧', name: 'Defuse' }];
            g.lives = 3; g.turn = 0; g.over = false;
            container.innerHTML = `
                <h3>💣 Bomb Cat — ${mode.toUpperCase()}</h3>
                <p>Draw cards. If you draw a bomb, an auto-defuse saves you. Survive 25 turns!</p>
                <p>Lives: <b id="bc-lives" style="color:#ef4444;">❤❤❤</b> · Turns: <b id="bc-turns">0/25</b> · Deck: <b id="bc-deck">${g.deck.length}</b></p>
                <div id="bc-hand" style="display:flex; gap:8px; justify-content:center; flex-wrap:wrap; margin:15px 0;"></div>
                <div id="bc-drawn" style="min-height:130px; margin:15px 0;"></div>
                <button id="bc-draw" class="btn primary-btn" onclick="GameEngines['bomb-cat'].draw()">Draw Card</button>
                <div id="bc-status" style="margin-top:15px; font-weight:bold; min-height:24px;"></div>`;
            g.refresh();
        },
        refresh() {
            const g = this;
            document.getElementById('bc-lives').textContent = '❤'.repeat(g.lives) || '💀';
            document.getElementById('bc-turns').textContent = g.turn;
            document.getElementById('bc-deck').textContent = g.deck.length;
            document.getElementById('bc-hand').innerHTML = g.hand.map((c, i) => `<div class="bc-card" onclick="GameEngines['bomb-cat'].useCard(${i})" style="background:var(--surface-color); border:2px solid var(--border-color); padding:10px 14px; border-radius:8px; cursor:pointer; text-align:center; min-width:70px;"><div style="font-size:2rem;">${c.icon}</div><div style="font-size:0.75rem; color:var(--text-muted);">${c.name}</div></div>`).join('') || '<span style="color:#94a3b8;">(empty hand)</span>';
        },
        draw() {
            const g = this;
            if (g.over) return;
            if (g.deck.length === 0) g.deck = shuffle(g.deck);
            const card = g.deck.pop();
            g.turn++;
            document.getElementById('bc-drawn').innerHTML = `<div style="font-size:1.2rem; color:var(--text-muted);">You drew:</div><div style="font-size:3.5rem;">${card.icon}</div><div style="font-weight:bold;">${card.name}</div>`;
            if (card.type === 'bomb') {
                const defuseIdx = g.hand.findIndex(c => c.type === 'defuse');
                if (defuseIdx >= 0) { g.hand.splice(defuseIdx, 1); AudioFX.playWin(); setText('bc-status', '🔧 Defused!', '#22c55e'); const insertAt = Math.floor(Math.random() * (g.deck.length + 1)); g.deck.splice(insertAt, 0, card); }
                else { g.lives--; AudioFX.playClick(); setText('bc-status', '💥 BOOM! Lost a life!', '#ef4444'); if (g.lives <= 0) { g.lose(); return; } }
            } else { g.hand.push(card); AudioFX.playCardSnap(); setText('bc-status', `Got ${card.name}.`); }
            if (g.turn >= g.maxTurns) { g.win(); return; }
            g.refresh();
        },
        useCard(i) {
            const g = this;
            if (g.over) return;
            const card = g.hand[i];
            if (card.type === 'defuse') { setText('bc-status', 'Save defuses for bombs!', '#f59e0b'); return; }
            if (card.type === 'skip') { g.hand.splice(i, 1); AudioFX.playCardSnap(); setText('bc-status', '⏭️ Skipped!'); g.refresh(); return; }
            if (card.type === 'peek') { g.hand.splice(i, 1); AudioFX.playCardSnap(); const peek = g.deck.slice(-3).reverse(); setText('bc-status', `👀 Next 3: ${peek.map(c => c.icon).join(' ')}`, '#38bdf8'); g.refresh(); return; }
            if (card.type === 'cat') { setText('bc-status', '🐱 Just a cat!', '#94a3b8'); return; }
        },
        win() { this.over = true; AudioFX.playWin(); setText('bc-status', `🎉 Survived ${this.turn} turns! +120 Coins`, '#22c55e'); finishGame(120, 80, true); },
        lose() { this.over = true; AudioFX.playClick(); setText('bc-status', '💀 Game over!', '#ef4444'); finishGame(0, 15, false); }
    },

    'tic-tac-toe': {
        board: null, turn: 'x', over: false,
        render(container, mode) {
            const g = this;
            g.board = Array(9).fill(null); g.turn = 'x'; g.over = false;
            container.innerHTML = `
                <h3>⭕ Tic-Tac-Toe — ${mode.toUpperCase()}</h3>
                <p>You are X. Get 3 in a row to win!</p>
                <div id="ttt-board" style="display:grid; grid-template-columns:repeat(3,1fr); gap:8px; max-width:300px; margin:20px auto;"></div>
                <div id="ttt-status" style="margin-top:15px; font-weight:bold; min-height:24px;"></div>`;
            g.refresh();
        },
        refresh() {
            const g = this;
            const board = document.getElementById('ttt-board'); if (!board) return;
            board.innerHTML = g.board.map((v, i) => { const color = v === 'x' ? '#38bdf8' : v === 'o' ? '#f59e0b' : 'var(--text-muted)'; const cursor = v || g.over || g.turn !== 'x' ? 'default' : 'pointer'; return `<div onclick="GameEngines['tic-tac-toe'].click(${i})" style="width:90px; height:90px; background:var(--surface-color); border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:3rem; font-weight:900; color:${color}; cursor:${cursor};">${v ? v.toUpperCase() : ''}</div>`; }).join('');
        },
        click(i) {
            const g = this;
            if (g.over || g.board[i] || g.turn !== 'x') return;
            g.board[i] = 'x'; AudioFX.playCardSnap(); g.refresh();
            if (g.check()) { g.end('x'); return; }
            if (g.board.every(v => v)) { g.end('draw'); return; }
            g.turn = 'o';
            GameSession.setTimer(() => g.aiMove(), 400);
        },
        aiMove() {
            const g = this;
            if (g.over) return;
            const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
            let move = -1;
            for (const line of lines) { const vals = line.map(i => g.board[i]); if (vals.filter(v => v === 'o').length === 2 && vals.includes(null)) { move = line[vals.indexOf(null)]; break; } }
            if (move === -1) for (const line of lines) { const vals = line.map(i => g.board[i]); if (vals.filter(v => v === 'x').length === 2 && vals.includes(null)) { move = line[vals.indexOf(null)]; break; } }
            if (move === -1 && !g.board[4]) move = 4;
            if (move === -1) for (const c of [0,2,6,8]) if (!g.board[c]) { move = c; break; }
            if (move === -1) move = g.board.findIndex(v => !v);
            if (move === -1) return;
            g.board[move] = 'o'; AudioFX.playCardSnap(); g.turn = 'x'; g.refresh();
            if (g.check()) { g.end('o'); return; }
            if (g.board.every(v => v)) { g.end('draw'); return; }
        },
        check() {
            const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
            for (const [a,b,c] of lines) if (this.board[a] && this.board[a] === this.board[b] && this.board[b] === this.board[c]) return true;
            return false;
        },
        end(winner) {
            this.over = true;
            if (winner === 'x') { AudioFX.playWin(); setText('ttt-status', '🎉 You win! +50 Coins', '#22c55e'); finishGame(50, 40, true); }
            else if (winner === 'o') { AudioFX.playClick(); setText('ttt-status', '😢 AI wins.', '#ef4444'); finishGame(0, 10, false); }
            else { setText('ttt-status', '🤝 Draw! +20 Coins', '#f59e0b'); finishGame(20, 20, false); }
            this.refresh();
        }
    }
});

function updateSnapUI() {
    const p = document.getElementById('snap-points');
    const m = document.getElementById('snap-misses');
    if (p && typeof GameEngines !== 'undefined' && GameEngines.snap) { p.textContent = GameEngines.snap.points; m.textContent = `${GameEngines.snap.misses}/3`; }
}
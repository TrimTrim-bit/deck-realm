Object.assign(GameEngines, {

    'battleship': {
        SIZE: 8, SHIPS: [{ name: 'Carrier', len: 4 }, { name: 'Battleship', len: 3 }, { name: 'Destroyer', len: 3 }, { name: 'Submarine', len: 2 }],
        playerBoard: null, aiBoard: null, playerShots: null, aiShots: null,
        phase: 'place', over: false, shipIndex: 0, horizontal: true,
        emptyGrid() { return Array.from({ length: this.SIZE }, () => Array(this.SIZE).fill(null)); },
        placeShip(board, row, col, len, horiz) {
            if (horiz) { if (col + len > this.SIZE) return false; for (let i = 0; i < len; i++) if (board[row][col + i]) return false; }
            else { if (row + len > this.SIZE) return false; for (let i = 0; i < len; i++) if (board[row + i][col]) return false; }
            for (let i = 0; i < len; i++) { if (horiz) board[row][col + i] = 'ship'; else board[row + i][col] = 'ship'; }
            return true;
        },
        autoPlace(board) {
            for (const ship of this.SHIPS) {
                let placed = false, attempts = 0;
                while (!placed && attempts < 200) { const horiz = Math.random() < 0.5; const r = Math.floor(Math.random() * this.SIZE); const c = Math.floor(Math.random() * this.SIZE); if (this.placeShip(board, r, c, ship.len, horiz)) placed = true; attempts++; }
            }
        },
        render(container, mode) {
            const g = this;
            g.playerBoard = g.emptyGrid(); g.aiBoard = g.emptyGrid();
            g.playerShots = g.emptyGrid(); g.aiShots = g.emptyGrid();
            g.phase = 'place'; g.over = false; g.shipIndex = 0; g.horizontal = true;
            g.autoPlace(g.aiBoard);
            container.innerHTML = `
                <h3>🚢 Battleship — ${mode.toUpperCase()}</h3>
                <p id="bs-instructions">Click to place <b>${g.SHIPS[0].name}</b> (length ${g.SHIPS[0].len}). Press R to rotate.</p>
                <div style="display:flex; gap:20px; justify-content:center; flex-wrap:wrap; margin:20px 0;">
                    <div><h4>Your Fleet</h4><div id="bs-player-board"></div></div>
                    <div><h4>Enemy Waters</h4><div id="bs-ai-board"></div></div>
                </div>
                <div style="display:flex; gap:10px; justify-content:center; flex-wrap:wrap;"><button class="btn tutorial-btn" id="bs-rotate">↻ Rotate (R)</button></div>
                <div id="bs-status" style="margin-top:15px; font-weight:bold; min-height:24px;"></div>`;
            g.bindRotate(); g.refresh();
        },
        bindRotate() {
            const g = this;
            g._rotateHandler = (e) => { if (e.key === 'r' || e.key === 'R') g.horizontal = !g.horizontal; };
            document.removeEventListener('keydown', g._rotateHandler);
            document.addEventListener('keydown', g._rotateHandler);
        },
        gridHTML(grid, shots, hidden, onClick) {
            let html = '<div style="display:inline-grid; grid-template-columns:repeat(8,32px); gap:2px; background:#0f172a; padding:6px; border-radius:6px;">';
            for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
                const ship = grid[r][c], shot = shots[r][c];
                let bg = '#1e293b', content = '';
                if (shot === 'hit') { bg = '#dc2626'; content = '✕'; }
                else if (shot === 'miss') { bg = '#475569'; content = '•'; }
                else if (!hidden && ship) { bg = '#64748b'; }
                html += `<div onclick="${onClick}" style="width:32px; height:32px; background:${bg}; border-radius:3px; cursor:pointer; display:flex; align-items:center; justify-content:center; color:#fff; font-weight:bold;">${content}</div>`;
            }
            html += '</div>';
            return html;
        },
        refresh() {
            const g = this;
            const pb = document.getElementById('bs-player-board'), ab = document.getElementById('bs-ai-board');
            if (!pb) return;
            pb.innerHTML = g.gridHTML(g.playerBoard, g.playerShots, false, `GameEngines.battleship.playerPlaceClick(this)`);
            ab.innerHTML = g.gridHTML(g.aiBoard, g.playerShots, true, `GameEngines.battleship.playerFireClick(this)`);
            const pbCells = pb.querySelectorAll('div > div'), abCells = ab.querySelectorAll('div > div');
            pbCells.forEach((el, i) => { el.dataset.r = Math.floor(i / 8); el.dataset.c = i % 8; });
            abCells.forEach((el, i) => { el.dataset.r = Math.floor(i / 8); el.dataset.c = i % 8; });
        },
        playerPlaceClick(el) {
            const g = this;
            if (g.phase !== 'place') return;
            const r = parseInt(el.dataset.r), c = parseInt(el.dataset.c);
            const ship = g.SHIPS[g.shipIndex]; if (!ship) return;
            if (g.placeShip(g.playerBoard, r, c, ship.len, g.horizontal)) {
                g.shipIndex++; AudioFX.playCardSnap();
                if (g.shipIndex >= g.SHIPS.length) { g.phase = 'battle'; document.getElementById('bs-instructions').innerHTML = '🎯 <b>Battle!</b> Click on Enemy Waters to fire.'; document.getElementById('bs-rotate').style.display = 'none'; setText('bs-status', 'Fire at the enemy fleet!'); }
                else { const next = g.SHIPS[g.shipIndex]; document.getElementById('bs-instructions').innerHTML = `Place <b>${next.name}</b> (length ${next.len}). Press R to rotate.`; }
                g.refresh();
            }
        },
        playerFireClick(el) {
            const g = this;
            if (g.phase !== 'battle' || g.over) return;
            const r = parseInt(el.dataset.r), c = parseInt(el.dataset.c);
            if (g.playerShots[r][c]) return;
            g.fire(g.aiBoard, g.playerShots, r, c);
            if (g.checkAllSunk(g.aiBoard, g.playerShots)) { g.end('player'); return; }
            g.refresh(); GameSession.setTimer(() => g.aiTurn(), 500);
        },
        fire(board, shots, r, c) { if (board[r][c] === 'ship') { shots[r][c] = 'hit'; AudioFX.playWin(); } else { shots[r][c] = 'miss'; AudioFX.playClick(); } },
        aiTurn() {
            const g = this;
            if (g.over) return;
            let r, c, tries = 0;
            do { r = Math.floor(Math.random() * 8); c = Math.floor(Math.random() * 8); tries++; } while (g.aiShots[r][c] && tries < 100);
            if (tries >= 100) return;
            g.fire(g.playerBoard, g.aiShots, r, c);
            if (g.checkAllSunk(g.playerBoard, g.aiShots)) { g.end('ai'); return; }
            g.refresh();
        },
        checkAllSunk(board, shots) {
            for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) if (board[r][c] === 'ship' && shots[r][c] !== 'hit') return false;
            return true;
        },
        end(winner) {
            this.over = true; this.refresh();
            if (winner === 'player') { AudioFX.playWin(); setText('bs-status', '🏆 You sank the enemy fleet! +150 Coins', '#22c55e'); finishGame(150, 100, true); }
            else { AudioFX.playClick(); setText('bs-status', '💀 Your fleet was destroyed. No reward.', '#ef4444'); finishGame(0, 20, false); }
        }
    },

    'yahtzee': {
        dice: [1,1,1,1,1], held: [false,false,false,false,false], rollsLeft: 3, turn: 1, maxTurns: 13, scores: {},
        CATEGORIES: [
            { id: 'ones', name: 'Ones', calc: d => d.filter(x => x === 1).length * 1 },
            { id: 'twos', name: 'Twos', calc: d => d.filter(x => x === 2).length * 2 },
            { id: 'threes', name: 'Threes', calc: d => d.filter(x => x === 3).length * 3 },
            { id: 'fours', name: 'Fours', calc: d => d.filter(x => x === 4).length * 4 },
            { id: 'fives', name: 'Fives', calc: d => d.filter(x => x === 5).length * 5 },
            { id: 'sixes', name: 'Sixes', calc: d => d.filter(x => x === 6).length * 6 },
            { id: 'threeOfKind', name: 'Three of a Kind', calc: d => this.hasN(d, 3) ? d.reduce((a,b)=>a+b,0) : 0 },
            { id: 'fourOfKind', name: 'Four of a Kind', calc: d => this.hasN(d, 4) ? d.reduce((a,b)=>a+b,0) : 0 },
            { id: 'fullHouse', name: 'Full House (25)', calc: d => this.isFullHouse(d) ? 25 : 0 },
            { id: 'smallStraight', name: 'Small Straight (30)', calc: d => this.hasSmallStraight(d) ? 30 : 0 },
            { id: 'largeStraight', name: 'Large Straight (40)', calc: d => this.hasLargeStraight(d) ? 40 : 0 },
            { id: 'yahtzee', name: 'YAHTZEE (50)', calc: d => d.every(x => x === d[0]) ? 50 : 0 },
            { id: 'chance', name: 'Chance', calc: d => d.reduce((a,b)=>a+b,0) }
        ],
        hasN(d, n) { const c = {}; d.forEach(x => c[x] = (c[x] || 0) + 1); return Object.values(c).some(v => v >= n); },
        isFullHouse(d) { const c = {}; d.forEach(x => c[x] = (c[x] || 0) + 1); const v = Object.values(c).sort(); return v.length === 2 && v[0] === 2 && v[1] === 3; },
        hasSmallStraight(d) { const s = new Set(d); return [[1,2,3,4],[2,3,4,5],[3,4,5,6]].some(q => q.every(x => s.has(x))); },
        hasLargeStraight(d) { const s = [...d].sort((a,b) => a-b).join(''); return s === '12345' || s === '23456'; },
        render(container, mode) {
            const g = this;
            g.dice = [1,1,1,1,1]; g.held = [false,false,false,false,false]; g.rollsLeft = 3; g.turn = 1; g.scores = {};
            container.innerHTML = `
                <h3>🎲 Yahtzee — ${mode.toUpperCase()}</h3>
                <p>Roll 5 dice, up to 3 rolls per turn. Score in one category per turn. 13 turns!</p>
                <div id="yz-dice" style="display:flex; gap:10px; justify-content:center; margin:20px 0;"></div>
                <p>Rolls left: <b id="yz-rolls" style="color:var(--accent-cyan);">3</b> · Turn <b id="yz-turn">1</b>/13</p>
                <button id="yz-roll-btn" class="btn primary-btn" onclick="GameEngines.yahtzee.roll()">🎲 Roll Dice</button>
                <div id="yz-scorecard" style="max-width:600px; margin:20px auto; background:var(--surface-color); border-radius:10px; padding:15px;"></div>
                <div id="yz-status" style="margin-top:15px; font-weight:bold; min-height:24px;"></div>`;
            g.refresh();
        },
        refresh() {
            const g = this;
            document.getElementById('yz-dice').innerHTML = g.dice.map((d, i) => `<button onclick="GameEngines.yahtzee.toggleHold(${i})" style="width:60px; height:60px; border-radius:12px; background:${g.held[i] ? '#22c55e' : '#f8fafc'}; color:#0f172a; border:2px solid ${g.held[i] ? '#16a34a' : '#cbd5e1'}; font-size:1.8rem; font-weight:900; cursor:pointer;">${['⚀','⚁','⚂','⚃','⚄','⚅'][d-1]}</button>`).join('');
            document.getElementById('yz-rolls').textContent = g.rollsLeft;
            document.getElementById('yz-turn').textContent = g.turn;
            document.getElementById('yz-roll-btn').disabled = g.rollsLeft === 0;
            document.getElementById('yz-roll-btn').textContent = g.rollsLeft === 0 ? 'Pick a category →' : `🎲 Roll Dice (${g.rollsLeft} left)`;
            const total = Object.values(g.scores).reduce((a,b) => a+b, 0);
            document.getElementById('yz-scorecard').innerHTML = `<div style="display:grid; grid-template-columns:1fr auto auto; gap:8px;">${g.CATEGORIES.map(cat => { const scored = g.scores[cat.id] !== undefined; const potential = cat.calc(g.dice); return `<div style="padding:8px; border-bottom:1px solid var(--border-color);">${cat.name}</div><div style="padding:8px; text-align:right; color:var(--text-muted); border-bottom:1px solid var(--border-color);">${scored ? '' : potential}</div><div style="padding:8px; border-bottom:1px solid var(--border-color);">${scored ? `<b style="color:var(--accent-cyan);">${g.scores[cat.id]}</b>` : `<button class="btn primary-btn" style="padding:4px 10px; font-size:0.8rem;" onclick="GameEngines.yahtzee.score('${cat.id}')">Score</button>`}</div>`; }).join('')}</div><div style="margin-top:15px; font-size:1.2rem; text-align:right;"><b>Total: <span style="color:var(--accent-gold);">${total}</span></b></div>`;
        },
        roll() {
            const g = this; if (g.rollsLeft <= 0) return;
            for (let i = 0; i < 5; i++) if (!g.held[i]) g.dice[i] = Math.floor(Math.random() * 6) + 1;
            g.rollsLeft--; AudioFX.playCardSnap(); g.refresh();
        },
        toggleHold(i) { const g = this; if (g.rollsLeft === 3) return; g.held[i] = !g.held[i]; AudioFX.playClick(); g.refresh(); },
        score(catId) {
            const g = this; const cat = g.CATEGORIES.find(c => c.id === catId); if (!cat) return;
            g.scores[catId] = cat.calc(g.dice); AudioFX.playWin();
            g.turn++; g.dice = [1,1,1,1,1]; g.held = [false,false,false,false,false]; g.rollsLeft = 3;
            if (g.turn > g.maxTurns) { g.finish(); return; }
            g.refresh(); setText('yz-status', `Scored ${g.scores[catId]} in ${cat.name}.`);
        },
        finish() {
            const total = Object.values(this.scores).reduce((a,b) => a+b, 0);
            const coins = total * 2;
            AudioFX.playWin();
            setText('yz-status', `🏁 Final score: ${total}! +${coins} Coins`, '#22c55e');
            finishGame(coins, 80, total >= 200);
        }
    },

    'mastermind': {
        COLORS: ['🔴','🔵','🟢','🟡','🟣','🟠'],
        code: [], guesses: [], current: [], maxGuesses: 10, over: false,
        render(container, mode) {
            const g = this;
            g.code = Array.from({ length: 4 }, () => g.COLORS[Math.floor(Math.random() * g.COLORS.length)]);
            g.guesses = []; g.current = []; g.over = false;
            container.innerHTML = `
                <h3>🔮 Mastermind — ${mode.toUpperCase()}</h3>
                <p>Guess the 4-color code. Black ✓ = right color right spot. White ○ = right color wrong spot. ${g.maxGuesses} guesses!</p>
                <div id="mm-secret" style="text-align:center; font-size:2rem; margin:15px 0; letter-spacing:8px;">${g.code.map(() => '⬜').join('')}</div>
                <div id="mm-current" style="text-align:center; font-size:2.5rem; margin:15px 0; min-height:60px;"></div>
                <div id="mm-picker" style="display:flex; gap:10px; justify-content:center; margin:15px 0;"></div>
                <div style="display:flex; gap:10px; justify-content:center;"><button class="btn primary-btn" onclick="GameEngines.mastermind.submit()">✅ Submit Guess</button><button class="btn tutorial-btn" onclick="GameEngines.mastermind.clearRow()">↻ Clear</button></div>
                <div id="mm-guesses" style="max-width:400px; margin:20px auto;"></div>
                <div id="mm-status" style="margin-top:15px; font-weight:bold; min-height:24px;"></div>`;
            g.refresh();
        },
        refresh() {
            const g = this;
            document.getElementById('mm-current').innerHTML = [0,1,2,3].map(i => `<span style="display:inline-block; width:50px; height:50px; background:${g.current[i] ? 'transparent' : 'var(--surface-color)'}; border-radius:50%; margin:0 5px; line-height:50px;">${g.current[i] || ''}</span>`).join('');
            document.getElementById('mm-picker').innerHTML = g.COLORS.map(c => `<button class="btn primary-btn" style="font-size:1.8rem; padding:10px;" onclick="GameEngines.mastermind.pickColor('${c}')">${c}</button>`).join('');
            document.getElementById('mm-guesses').innerHTML = g.guesses.map(guess => { const fb = g.evaluate(guess.colors); return `<div style="display:flex; justify-content:space-between; padding:6px; margin:4px 0; background:var(--surface-color); border-radius:6px;"><span style="font-size:1.5rem; letter-spacing:2px;">${guess.colors.join('')}</span><span>${'✓'.repeat(fb.black)}${'○'.repeat(fb.white)}</span></div>`; }).join('');
        },
        pickColor(c) { const g = this; if (g.over || g.current.length >= 4) return; g.current.push(c); AudioFX.playClick(); g.refresh(); },
        clearRow() { this.current = []; this.refresh(); },
        submit() {
            const g = this;
            if (g.current.length !== 4) { setText('mm-status', 'Place 4 colors first.', '#ef4444'); return; }
            g.guesses.push({ colors: [...g.current] }); AudioFX.playCardSnap(); g.current = []; g.refresh();
            const fb = g.evaluate(g.guesses[g.guesses.length - 1].colors);
            if (fb.black === 4) { g.over = true; document.getElementById('mm-secret').innerHTML = g.code.join(''); AudioFX.playWin(); const coins = 100 + (g.maxGuesses - g.guesses.length) * 20; setText('mm-status', `🎉 Cracked in ${g.guesses.length} guesses! +${coins} Coins`, '#22c55e'); finishGame(coins, 80, true); return; }
            if (g.guesses.length >= g.maxGuesses) { g.over = true; document.getElementById('mm-secret').innerHTML = g.code.join(''); AudioFX.playClick(); setText('mm-status', `😢 Out of guesses! Code was ${g.code.join('')}.`, '#ef4444'); finishGame(0, 20, false); return; }
            setText('mm-status', `${g.maxGuesses - g.guesses.length} guesses remaining.`);
        },
        evaluate(guess) {
            const g = this;
            let black = 0, white = 0;
            const code = [...g.code], guessCopy = [...guess];
            for (let i = 0; i < 4; i++) if (code[i] === guessCopy[i]) { black++; code[i] = null; guessCopy[i] = null; }
            for (let i = 0; i < 4; i++) { if (guessCopy[i] === null) continue; const idx = code.indexOf(guessCopy[i]); if (idx >= 0) { white++; code[idx] = null; } }
            return { black, white };
        }
    },

    'othello': {
        board: null, turn: 'b', over: false, aiThinking: false, SIZE: 8,
        newBoard() { const b = Array.from({ length: 8 }, () => Array(8).fill(null)); b[3][3] = 'w'; b[4][4] = 'w'; b[3][4] = 'b'; b[4][3] = 'b'; return b; },
        render(container, mode) {
            const g = this;
            g.board = g.newBoard(); g.turn = 'b'; g.over = false; g.aiThinking = false;
            container.innerHTML = `
                <h3>⚫ Othello — ${mode.toUpperCase()}</h3>
                <p>You are Black. Place pieces to sandwich enemy pieces — they flip! Most pieces wins.</p>
                <p>Black: <b id="oth-b" style="color:#1e293b;">2</b> · White: <b id="oth-w" style="color:#94a3b8;">2</b></p>
                <div id="oth-board" style="display:inline-block; background:#14532d; padding:8px; border-radius:8px; margin:15px auto;"></div>
                <div id="oth-status" style="margin-top:15px; font-weight:bold; min-height:24px;"></div>`;
            g.refresh();
        },
        validMoves(board, color) {
            const opp = color === 'b' ? 'w' : 'b';
            const moves = [];
            for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
                if (board[r][c]) continue;
                for (const [dr, dc] of [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]]) {
                    let rr = r + dr, cc = c + dc, found = false;
                    while (rr >= 0 && rr < 8 && cc >= 0 && cc < 8 && board[rr][cc] === opp) { rr += dr; cc += dc; found = true; }
                    if (found && rr >= 0 && rr < 8 && cc >= 0 && cc < 8 && board[rr][cc] === color) { moves.push({ r, c }); break; }
                }
            }
            return moves;
        },
        place(board, r, c, color) {
            const opp = color === 'b' ? 'w' : 'b';
            board[r][c] = color;
            for (const [dr, dc] of [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]]) {
                const flips = [];
                let rr = r + dr, cc = c + dc;
                while (rr >= 0 && rr < 8 && cc >= 0 && cc < 8 && board[rr][cc] === opp) { flips.push([rr, cc]); rr += dr; cc += dc; }
                if (flips.length && rr >= 0 && rr < 8 && cc >= 0 && cc < 8 && board[rr][cc] === color) flips.forEach(([fr, fc]) => board[fr][fc] = color);
            }
        },
        refresh() {
            const g = this;
            const valid = g.turn === 'b' ? g.validMoves(g.board, 'b') : [];
            let b = 0, w = 0;
            g.board.forEach(row => row.forEach(v => { if (v === 'b') b++; else if (v === 'w') w++; }));
            document.getElementById('oth-b').textContent = b;
            document.getElementById('oth-w').textContent = w;
            let html = '<div style="display:inline-grid; grid-template-columns:repeat(8, 42px); gap:2px;">';
            for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
                const v = g.board[r][c];
                const isHint = valid.some(m => m.r === r && m.c === c);
                const bg = v === 'b' ? 'radial-gradient(circle at 30% 30%, #334155, #0f172a)' : v === 'w' ? 'radial-gradient(circle at 30% 30%, #f1f5f9, #94a3b8)' : 'transparent';
                html += `<div onclick="GameEngines.othello.click(${r},${c})" style="width:42px; height:42px; background:${isHint && !v ? 'rgba(34,197,94,0.4)' : '#166534'}; border:1px solid #14532d; display:flex; align-items:center; justify-content:center; cursor:pointer;">${v ? `<div style="width:34px; height:34px; border-radius:50%; background:${bg};"></div>` : ''}</div>`;
            }
            html += '</div>';
            document.getElementById('oth-board').innerHTML = html;
        },
        click(r, c) {
            const g = this;
            if (g.over || g.turn !== 'b' || g.aiThinking || g.board[r][c]) return;
            const valid = g.validMoves(g.board, 'b');
            if (!valid.some(m => m.r === r && m.c === c)) return;
            g.place(g.board, r, c, 'b');
            AudioFX.playCardSnap(); g.turn = 'w'; g.refresh();
            if (g.checkEnd()) return;
            g.aiThinking = true;
            GameSession.setTimer(() => g.aiTurn(), 400);
        },
        aiTurn() {
            const g = this;
            if (g.over) return;
            const moves = g.validMoves(g.board, 'w');
            if (moves.length === 0) { g.turn = 'b'; g.aiThinking = false; g.refresh(); g.checkEnd(); return; }
            const corners = [[0,0],[0,7],[7,0],[7,7]];
            let best = moves.find(m => corners.some(([cr, cc]) => cr === m.r && cc === m.c));
            if (!best) best = moves[Math.floor(Math.random() * moves.length)];
            g.place(g.board, best.r, best.c, 'w');
            AudioFX.playCardSnap(); g.turn = 'b'; g.aiThinking = false; g.refresh();
            if (g.checkEnd()) return;
            if (g.validMoves(g.board, 'b').length === 0) { setText('oth-status', 'You have no moves — AI plays again.'); g.turn = 'w'; g.aiThinking = true; GameSession.setTimer(() => g.aiTurn(), 500); }
        },
        checkEnd() {
            const g = this;
            const bMoves = g.validMoves(g.board, 'b').length, wMoves = g.validMoves(g.board, 'w').length;
            if (bMoves === 0 && wMoves === 0) {
                g.over = true;
                let b = 0, w = 0;
                g.board.forEach(row => row.forEach(v => { if (v === 'b') b++; else if (v === 'w') w++; }));
                if (b > w) { AudioFX.playWin(); setText('oth-status', `🏆 You win ${b}–${w}! +120 Coins`, '#22c55e'); finishGame(120, 70, true); }
                else if (b < w) { AudioFX.playClick(); setText('oth-status', `😢 AI wins ${w}–${b}.`, '#ef4444'); finishGame(0, 15, false); }
                else { setText('oth-status', `🤝 Tie ${b}–${w}! +30 Coins`, '#f59e0b'); finishGame(30, 30, false); }
                return true;
            }
            return false;
        }
    },

    'klondike': {
        tableau: [], foundations: [], stock: [], waste: [], over: false, selected: null,
        isRed(c) { return c.suit === '♥' || c.suit === '♦'; },
        render(container, mode) {
            const g = this;
            const deck = createStandardDeck(false);
            g.tableau = Array.from({ length: 7 }, () => []);
            for (let i = 0; i < 7; i++) for (let j = 0; j <= i; j++) g.tableau[i].push({ card: deck.pop(), faceUp: j === i });
            g.foundations = [[], [], [], []];
            g.stock = deck; g.waste = []; g.over = false; g.selected = null;
            container.innerHTML = `
                <h3>🃏 Klondike Solitaire</h3>
                <p>Build 4 foundations from Ace→King. Tableau builds down in alternating colors. Click stock to draw.</p>
                <div style="display:flex; gap:15px; justify-content:center; margin:20px 0;">
                    <div onclick="GameEngines.klondike.drawStock()" style="cursor:pointer;"><div style="width:60px; height:85px; border:2px dashed #475569; border-radius:6px; display:flex; align-items:center; justify-content:center; color:#94a3b8;">${g.stock.length > 0 ? '🂠' : '↻'}</div></div>
                    <div id="kl-waste"></div>
                </div>
                <div id="kl-foundations" style="display:flex; gap:10px; justify-content:center; margin:15px 0;"></div>
                <div id="kl-tableau" style="display:flex; gap:10px; justify-content:center; margin:20px 0; flex-wrap:wrap;"></div>
                <div id="kl-status" style="margin-top:15px; font-weight:bold; min-height:24px;"></div>`;
            g.refresh();
        },
        refresh() {
            const g = this;
            document.getElementById('kl-waste').innerHTML = g.waste.length > 0 ? `<div style="cursor:pointer;" onclick="GameEngines.klondike.clickWaste()">${renderCard(g.waste[g.waste.length - 1].rank, g.waste[g.waste.length - 1].suit)}</div>` : '<div style="width:60px; height:85px;"></div>';
            document.getElementById('kl-foundations').innerHTML = g.foundations.map((f, i) => { const top = f[f.length - 1]; const isSel = g.selected && g.selected.type === 'foundation' && g.selected.idx === i; return `<div onclick="GameEngines.klondike.clickFoundation(${i})" style="width:60px; height:85px; border:2px dashed ${isSel ? '#22c55e' : '#475569'}; border-radius:6px; display:flex; align-items:center; justify-content:center; color:#94a3b8; cursor:pointer;">${top ? renderCard(top.rank, top.suit) : ['A','2','3','4'][i]}</div>`; }).join('');
            document.getElementById('kl-tableau').innerHTML = g.tableau.map((col, i) => `<div onclick="GameEngines.klondike.clickTableau(${i})" style="min-width:70px; cursor:pointer;">${col.map((t, j) => t.faceUp ? `<div style="margin-bottom:-70px;">${renderCard(t.card.rank, t.card.suit)}</div>` : `<div style="margin-bottom:-70px;">${cardBack()}</div>`).join('') || '<div style="width:60px; height:85px; border:2px dashed #475569; border-radius:6px;"></div>'}</div>`).join('');
            if (g.foundations.every(f => f.length === 13) && !g.over) { g.over = true; AudioFX.playWin(); setText('kl-status', '🎉 SOLVED! +200 Coins', '#22c55e'); finishGame(200, 100, true); }
        },
        drawStock() {
            const g = this;
            if (g.over) return;
            if (g.stock.length === 0) { g.stock = g.waste.reverse(); g.waste = []; }
            else { g.waste.push(g.stock.pop()); AudioFX.playCardSnap(); }
            g.refresh();
        },
        clickWaste() { const g = this; if (g.over || g.waste.length === 0) return; g.selected = g.selected && g.selected.type === 'waste' ? null : { type: 'waste' }; g.refresh(); },
        clickFoundation(i) {
            const g = this;
            if (g.over) return;
            const f = g.foundations[i], top = f[f.length - 1];
            if (g.selected) { const card = g.getSelectedCard(); if (card && (!top ? card.rank === 'A' : (top.suit === card.suit && faceValue(card.rank) === faceValue(top.rank) + 1))) { g.removeSelected(); f.push(card); g.selected = null; AudioFX.playWin(); g.refresh(); } else { g.selected = null; g.refresh(); } return; }
            if (top) { g.selected = { type: 'foundation', idx: i }; g.refresh(); }
        },
        clickTableau(i) {
            const g = this;
            if (g.over) return;
            const col = g.tableau[i];
            if (g.selected) {
                const card = g.getSelectedCard(), top = col[col.length - 1];
                const canPlace = !top ? (card && card.rank === 'K') : (top.faceUp && (top.card.suit === '♥' || top.card.suit === '♦') !== (card.suit === '♥' || card.suit === '♦') && faceValue(card.rank) === faceValue(top.card.rank) - 1);
                if (card && canPlace) { g.removeSelected(); col.push({ card, faceUp: true }); g.selected = null; AudioFX.playCardSnap(); g.refresh(); } else { g.selected = null; g.refresh(); }
                return;
            }
            if (col.length > 0 && col[col.length - 1].faceUp) g.selected = { type: 'tableau', idx: i };
            g.refresh();
        },
        getSelectedCard() {
            const g = this;
            if (!g.selected) return null;
            if (g.selected.type === 'waste') return g.waste[g.waste.length - 1];
            if (g.selected.type === 'tableau') { const col = g.tableau[g.selected.idx]; const top = col[col.length - 1]; return top && top.faceUp ? top.card : null; }
            if (g.selected.type === 'foundation') { const f = g.foundations[g.selected.idx]; return f[f.length - 1]; }
            return null;
        },
        removeSelected() {
            const g = this;
            if (g.selected.type === 'waste') g.waste.pop();
            else if (g.selected.type === 'tableau') { g.tableau[g.selected.idx].pop(); const col = g.tableau[g.selected.idx]; if (col.length > 0) col[col.length - 1].faceUp = true; }
            else if (g.selected.type === 'foundation') g.foundations[g.selected.idx].pop();
        }
    },

    'old-maid': {
        playerHand: [], aiHand: [], over: false, aiThinking: false,
        render(container, mode) {
            const g = this;
            const deck = createStandardDeck(false).filter(c => !['J','Q','K'].includes(c.rank));
            deck.pop();
            const pairs = {}, dealt = [];
            for (const c of deck) { if (!pairs[c.rank]) pairs[c.rank] = []; pairs[c.rank].push(c); }
            for (const key in pairs) { const arr = pairs[key]; for (let i = 0; i < arr.length - 1; i += 2) dealt.push(arr[i], arr[i + 1]); }
            const sh = shuffle(dealt);
            g.playerHand = sh.slice(0, Math.floor(sh.length / 2));
            g.aiHand = sh.slice(Math.floor(sh.length / 2));
            g.over = false; g.aiThinking = false;
            container.innerHTML = `
                <h3>💌 Old Maid — ${mode.toUpperCase()}</h3>
                <p>Collect matching pairs and empty your hand!</p>
                <p>AI cards: <b id="om-ai-count">${g.aiHand.length}</b></p>
                <div id="om-ai-hand" style="display:flex; gap:8px; justify-content:center; margin:15px 0;"></div>
                <h4>Your Hand:</h4>
                <div id="om-player-hand" style="display:flex; flex-wrap:wrap; gap:8px; justify-content:center; margin:15px 0;"></div>
                <div id="om-status" style="margin-top:15px; font-weight:bold; min-height:24px;"></div>`;
            g.refresh();
        },
        refresh() {
            const g = this;
            document.getElementById('om-ai-count').textContent = g.aiHand.length;
            document.getElementById('om-ai-hand').innerHTML = g.aiHand.map(() => cardBack()).join('');
            document.getElementById('om-player-hand').innerHTML = g.playerHand.map((c, i) => `<div style="cursor:pointer;" onclick="GameEngines['old-maid'].clickCard(${i})">${renderCard(c.rank, c.suit)}</div>`).join('');
            document.getElementById('om-status').innerHTML = '';
        },
        autoMatch() {
            const g = this; let matched = 0;
            for (const hand of ['playerHand', 'aiHand']) {
                const counts = {};
                g[hand].forEach((c, i) => { if (!counts[c.rank]) counts[c.rank] = []; counts[c.rank].push(i); });
                for (const rank in counts) { if (counts[rank].length >= 2) { const indices = counts[rank].slice(0, 2).sort((a,b) => b-a); for (const idx of indices) g[hand].splice(idx, 1); matched++; } }
            }
            if (matched > 0) AudioFX.playWin();
        },
        clickCard(i) {
            const g = this;
            if (g.over || g.aiThinking || g.aiHand.length === 0) return;
            const aiIdx = Math.floor(Math.random() * g.aiHand.length);
            const card = g.aiHand.splice(aiIdx, 1)[0];
            g.playerHand.push(card);
            AudioFX.playCardSnap();
            g.autoMatch();
            if (g.aiHand.length === 0 && g.playerHand.length === 0) { g.finish('draw'); return; }
            g.refresh();
            if (g.playerHand.length === 0) { g.finish('player'); return; }
            g.aiThinking = true;
            GameSession.setTimer(() => g.aiTurn(), 800);
        },
        aiTurn() {
            const g = this;
            if (g.over || g.aiHand.length === 0) { g.aiThinking = false; return; }
            const playerIdx = Math.floor(Math.random() * g.playerHand.length);
            const card = g.playerHand.splice(playerIdx, 1)[0];
            g.aiHand.push(card);
            AudioFX.playCardSnap();
            g.autoMatch();
            if (g.aiHand.length === 0) { g.finish('ai'); return; }
            if (g.playerHand.length === 0) { g.finish('player'); return; }
            g.aiThinking = false; g.refresh();
            setText('om-status', 'Your turn — pick a card from the AI.');
        },
        finish(winner) {
            this.over = true; this.refresh();
            if (winner === 'player') { AudioFX.playWin(); setText('om-status', '🎉 You emptied your hand first! +80 Coins', '#22c55e'); finishGame(80, 60, true); }
            else if (winner === 'ai') { AudioFX.playClick(); setText('om-status', '😢 AI emptied their hand first. No reward.', '#ef4444'); finishGame(0, 15, false); }
            else { setText('om-status', '🤝 Draw! +30 Coins', '#f59e0b'); finishGame(30, 25, false); }
        }
    }
});
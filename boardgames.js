const ChessPieces = {
    'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙',
    'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟'
};

Object.assign(GameEngines, {

    // ============ CHESS ============
    'chess': {
        board: null, turn: 'w', selected: null, legalMoves: [], over: false, lastMove: null, history: [],
        init() {
            const back = ['r','n','b','q','k','b','n','r'];
            this.board = [];
            this.board.push(back.map(p => p.toUpperCase()));
            this.board.push(Array(8).fill('P'));
            for (let i = 0; i < 4; i++) this.board.push(Array(8).fill(''));
            this.board.push(Array(8).fill('p'));
            this.board.push(back.slice());
            this.turn = 'w'; this.selected = null; this.legalMoves = [];
            this.over = false; this.lastMove = null; this.history = [];
        },
        isWhite(p) { return p && p === p.toUpperCase(); },
        isBlack(p) { return p && p === p.toLowerCase(); },
        sameColor(p1, p2) { if (!p1 || !p2) return false; return (this.isWhite(p1) && this.isWhite(p2)) || (this.isBlack(p1) && this.isBlack(p2)); },
        inBounds(r, c) { return r >= 0 && r < 8 && c >= 0 && c < 8; },
        genMoves(r, c) {
            const piece = this.board[r][c];
            if (!piece) return [];
            const moves = [], white = this.isWhite(piece), type = piece.toLowerCase();
            const slide = (dr, dc) => {
                let nr = r + dr, nc = c + dc;
                while (this.inBounds(nr, nc)) {
                    if (!this.board[nr][nc]) moves.push({ from: [r,c], to: [nr,nc] });
                    else { if (!this.sameColor(piece, this.board[nr][nc])) moves.push({ from: [r,c], to: [nr,nc] }); break; }
                    nr += dr; nc += dc;
                }
            };
            if (type === 'p') {
                const dir = white ? -1 : 1, start = white ? 6 : 1;
                if (this.inBounds(r+dir, c) && !this.board[r+dir][c]) {
                    moves.push({ from: [r,c], to: [r+dir,c] });
                    if (r === start && !this.board[r+2*dir][c]) moves.push({ from: [r,c], to: [r+2*dir,c] });
                }
                for (const dc of [-1,1]) if (this.inBounds(r+dir, c+dc) && this.board[r+dir][c+dc] && !this.sameColor(piece, this.board[r+dir][c+dc]))
                    moves.push({ from: [r,c], to: [r+dir,c+dc] });
                if (this.lastMove && this.lastMove.piece && this.lastMove.piece.toLowerCase() === 'p' &&
                    Math.abs(this.lastMove.from[0] - this.lastMove.to[0]) === 2 &&
                    Math.abs(this.lastMove.to[1] - c) === 1 && this.lastMove.to[0] === r)
                    moves.push({ from: [r,c], to: [r+dir, this.lastMove.to[1]], enPassant: true });
            } else if (type === 'n') {
                for (const [dr,dc] of [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]]) {
                    const nr = r+dr, nc = c+dc;
                    if (this.inBounds(nr,nc) && !this.sameColor(piece, this.board[nr][nc])) moves.push({ from: [r,c], to: [nr,nc] });
                }
            } else if (type === 'b') { for (const [dr,dc] of [[-1,-1],[-1,1],[1,-1],[1,1]]) slide(dr,dc); }
            else if (type === 'r') { for (const [dr,dc] of [[-1,0],[1,0],[0,-1],[0,1]]) slide(dr,dc); }
            else if (type === 'q') { for (const [dr,dc] of [[-1,-1],[-1,1],[1,-1],[1,1],[-1,0],[1,0],[0,-1],[0,1]]) slide(dr,dc); }
            else if (type === 'k') {
                for (const [dr,dc] of [[-1,-1],[-1,1],[1,-1],[1,1],[-1,0],[1,0],[0,-1],[0,1]]) {
                    const nr = r+dr, nc = c+dc;
                    if (this.inBounds(nr,nc) && !this.sameColor(piece, this.board[nr][nc])) moves.push({ from: [r,c], to: [nr,nc] });
                }
                const br = white ? 7 : 0;
                if (r === br && c === 4) {
                    if (!this.board[br][5] && !this.board[br][6] && this.board[br][7] === (white ? 'R' : 'r') &&
                        !this.isAttacked(br,4,!white) && !this.isAttacked(br,5,!white) && !this.isAttacked(br,6,!white))
                        moves.push({ from: [r,c], to: [br,6], castle: 'K' });
                    if (!this.board[br][3] && !this.board[br][2] && !this.board[br][1] && this.board[br][0] === (white ? 'R' : 'r') &&
                        !this.isAttacked(br,4,!white) && !this.isAttacked(br,3,!white) && !this.isAttacked(br,2,!white))
                        moves.push({ from: [r,c], to: [br,2], castle: 'Q' });
                }
            }
            return moves;
        },
        findKing(white) {
            const target = white ? 'K' : 'k';
            for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) if (this.board[r][c] === target) return [r,c];
            return null;
        },
        isAttacked(r, c, byWhite) {
            for (let fr = 0; fr < 8; fr++) for (let fc = 0; fc < 8; fc++) {
                const p = this.board[fr][fc];
                if (!p || this.isWhite(p) !== byWhite) continue;
                if (this.genMoves(fr,fc).some(m => m.to[0] === r && m.to[1] === c)) return true;
            }
            return false;
        },
        inCheck(white) { const k = this.findKing(white); return k ? this.isAttacked(k[0],k[1],!white) : false; },
        legalMovesFor(r, c) {
            const piece = this.board[r][c];
            if (!piece) return [];
            const white = this.isWhite(piece);
            return this.genMoves(r, c).filter(m => {
                const saved = this.board.map(row => [...row]);
                this.board[m.to[0]][m.to[1]] = piece;
                this.board[r][c] = '';
                if (m.enPassant) this.board[r][m.to[1]] = '';
                const ok = !this.inCheck(white);
                this.board = saved;
                return ok;
            });
        },
        allLegalMoves(white) {
            const moves = [];
            for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
                const p = this.board[r][c];
                if (!p || this.isWhite(p) !== white) continue;
                moves.push(...this.legalMovesFor(r, c));
            }
            return moves;
        },
        makeMove(move, simulate = false) {
            if (!simulate) this.history.push({
                board: this.board.map(r => [...r]),
                turn: this.turn,
                lastMove: this.lastMove ? { ...this.lastMove, from: [...this.lastMove.from], to: [...this.lastMove.to] } : null
            });
            const [fr,fc] = move.from, [tr,tc] = move.to;
            const piece = this.board[fr][fc];
            this.board[tr][tc] = piece;
            this.board[fr][fc] = '';
            if (move.enPassant) this.board[fr][tc] = '';
            if (move.castle === 'K') { this.board[fr][5] = this.board[fr][7]; this.board[fr][7] = ''; }
            if (move.castle === 'Q') { this.board[fr][3] = this.board[fr][0]; this.board[fr][0] = ''; }
            if (piece === 'P' && tr === 0) this.board[tr][tc] = 'Q';
            if (piece === 'p' && tr === 7) this.board[tr][tc] = 'q';
            this.lastMove = { from: [fr,fc], to: [tr,tc], piece };
            this.turn = this.turn === 'w' ? 'b' : 'w';
        },
        evaluate() {
            const v = { p:1, n:3, b:3, r:5, q:9, k:0 };
            let s = 0;
            for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
                const p = this.board[r][c];
                if (!p) continue;
                s += (this.isWhite(p) ? 1 : -1) * (v[p.toLowerCase()] || 0);
            }
            return s;
        },
        aiMove() {
            const moves = this.allLegalMoves(false);
            if (moves.length === 0) return null;
            let best = null, bestScore = -Infinity;
            for (const m of moves) {
                const saved = this.board.map(r => [...r]);
                const savedTurn = this.turn, savedLast = this.lastMove;
                this.makeMove(m, true);
                const score = -this.evaluate() + Math.random() * 0.1;
                this.board = saved; this.turn = savedTurn; this.lastMove = savedLast;
                if (score > bestScore) { bestScore = score; best = m; }
            }
            return best;
        },
        render(container, mode) {
            this.init();
            container.innerHTML = `
                <h3>♟️ Chess — ${mode.toUpperCase()}</h3>
                <p>Click a white piece, then click a highlighted square. You play White.</p>
                <div style="display:flex; justify-content:center; margin:20px 0;">
                    <div id="chess-board" class="chess-board"></div>
                </div>
                <div style="display:flex; gap:10px; justify-content:center;">
                    <button class="btn tutorial-btn" onclick="GameEngines.chess.undo()">↶ Undo</button>
                    <button class="btn tutorial-btn" onclick="openGame('chess','1-ai')">🔄 New Game</button>
                </div>
                <div id="chess-status" style="margin-top:15px; font-weight:bold; min-height:24px;"></div>`;
            this.refresh();
            this.updateStatus();
        },
        refresh() {
            const board = document.getElementById('chess-board');
            if (!board) return;
            let html = '';
            for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
                const isLight = (r + c) % 2 === 0;
                const piece = this.board[r][c];
                const sym = ChessPieces[piece] || '';
                const isSel = this.selected && this.selected[0] === r && this.selected[1] === c;
                const isTarget = this.legalMoves.some(m => m.to[0] === r && m.to[1] === c);
                const isLast = this.lastMove && (
                    (this.lastMove.from[0] === r && this.lastMove.from[1] === c) ||
                    (this.lastMove.to[0] === r && this.lastMove.to[1] === c)
                );
                html += `<div class="chess-square ${isLight?'light':'dark'}${isSel?' selected':''}${isLast?' last-move':''}"
                    onclick="GameEngines.chess.click(${r},${c})">
                    ${sym ? `<span class="chess-piece ${this.isWhite(piece)?'white':'black'}">${sym}</span>` : ''}
                    ${isTarget && !piece ? '<span class="legal-dot"></span>' : ''}
                    ${isTarget && piece ? '<span class="capture-ring"></span>' : ''}
                </div>`;
            }
            board.innerHTML = html;
        },
        click(r, c) {
            if (this.over || this.turn !== 'w') return;
            if (this.selected) {
                const move = this.legalMoves.find(m => m.to[0] === r && m.to[1] === c);
                if (move) {
                    this.makeMove(move);
                    AudioFX.playCardSnap();
                    this.selected = null; this.legalMoves = [];
                    this.refresh(); this.updateStatus();
                    if (this.checkGameOver()) return;
                    GameSession.setTimer(() => this.aiTurn(), 350);
                    return;
                }
            }
            const piece = this.board[r][c];
            if (piece && this.isWhite(piece)) { this.selected = [r,c]; this.legalMoves = this.legalMovesFor(r, c); }
            else { this.selected = null; this.legalMoves = []; }
            this.refresh();
        },
        aiTurn() {
            if (this.over || this.turn !== 'b') return;
            const move = this.aiMove();
            if (!move) { this.checkGameOver(); return; }
            this.makeMove(move);
            AudioFX.playCardSnap();
            this.refresh(); this.updateStatus();
            this.checkGameOver();
        },
        updateStatus() {
            if (this.over) return;
            const wC = this.inCheck(true), bC = this.inCheck(false);
            let msg, color;
            if (this.turn === 'w') { msg = wC ? '⚠️ You are in check!' : 'Your turn (White)'; color = wC ? '#ef4444' : '#94a3b8'; }
            else { msg = bC ? '⚠️ Black is in check — AI thinking...' : 'Black thinking...'; color = bC ? '#ef4444' : '#94a3b8'; }
            setText('chess-status', msg, color);
        },
        checkGameOver() {
            const wM = this.allLegalMoves(true);
            const bM = this.allLegalMoves(false);
            if (wM.length === 0 && this.turn === 'w') {
                this.over = true;
                if (this.inCheck(true)) { AudioFX.playClick(); setText('chess-status', '♟️ Checkmate! Black wins. No reward.', '#ef4444'); finishGame(0, 20); }
                else { setText('chess-status', '🤝 Stalemate! Draw. +30 Coins', '#f59e0b'); finishGame(30, 25); }
                return true;
            }
            if (bM.length === 0 && this.turn === 'b') {
                this.over = true;
                if (this.inCheck(false)) { AudioFX.playWin(); setText('chess-status', '🏆 Checkmate! You win! +150 Coins', '#22c55e'); finishGame(150, 80); }
                else { setText('chess-status', '🤝 Stalemate! Draw. +30 Coins', '#f59e0b'); finishGame(30, 25); }
                return true;
            }
            return false;
        },
        undo() {
            if (this.history.length === 0) return;
            const steps = Math.min(this.history.length, 2);
            for (let i = 0; i < steps; i++) {
                const snap = this.history.pop();
                this.board = snap.board; this.turn = snap.turn; this.lastMove = snap.lastMove;
            }
            this.selected = null; this.legalMoves = []; this.over = false;
            AudioFX.playClick();
            this.refresh(); this.updateStatus();
        }
    },

    // ============ CHECKERS ============
    'checkers': {
        board: null, turn: 'w', selected: null, legalMoves: [], over: false,
        init() {
            this.board = [];
            for (let r = 0; r < 8; r++) {
                this.board.push(Array(8).fill(''));
                for (let c = 0; c < 8; c++) {
                    if ((r + c) % 2 === 1 && r < 3) this.board[r][c] = 'b';
                    else if ((r + c) % 2 === 1 && r > 4) this.board[r][c] = 'w';
                }
            }
            this.turn = 'w'; this.selected = null; this.legalMoves = []; this.over = false;
        },
        inBounds(r, c) { return r >= 0 && r < 8 && c >= 0 && c < 8; },
        genMoves(r, c) {
            const p = this.board[r][c];
            if (!p) return [];
            const moves = [];
            const isKing = p === 'W' || p === 'B';
            const color = p.toLowerCase();
            const dirs = isKing ? [-1,1] : (color === 'w' ? [-1] : [1]);
            for (const dr of dirs) for (const dc of [-1,1]) {
                const mr = r+dr, mc = c+dc, tr = r+2*dr, tc = c+2*dc;
                if (this.inBounds(tr,tc) && this.inBounds(mr,mc)) {
                    const mid = this.board[mr][mc];
                    if (mid && mid.toLowerCase() !== color && !this.board[tr][tc])
                        moves.push({ from: [r,c], to: [tr,tc], capture: [mr,mc] });
                }
            }
            if (moves.length > 0) return moves;
            for (const dr of dirs) for (const dc of [-1,1]) {
                const tr = r+dr, tc = c+dc;
                if (this.inBounds(tr,tc) && !this.board[tr][tc]) moves.push({ from: [r,c], to: [tr,tc] });
            }
            return moves;
        },
        allMoves(color) {
            const moves = [];
            for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
                const p = this.board[r][c];
                if (p && p.toLowerCase() === color) moves.push(...this.genMoves(r,c));
            }
            return moves;
        },
        makeMove(move) {
            const [fr,fc] = move.from, [tr,tc] = move.to;
            const piece = this.board[fr][fc];
            this.board[tr][tc] = piece;
            this.board[fr][fc] = '';
            if (move.capture) this.board[move.capture[0]][move.capture[1]] = '';
            if (piece === 'w' && tr === 0) this.board[tr][tc] = 'W';
            if (piece === 'b' && tr === 7) this.board[tr][tc] = 'B';
            this.turn = this.turn === 'w' ? 'b' : 'w';
        },
        aiMove() {
            const moves = this.allMoves('b');
            if (moves.length === 0) return null;
            const caps = moves.filter(m => m.capture);
            return caps.length > 0 ? caps[Math.floor(Math.random()*caps.length)] : moves[Math.floor(Math.random()*moves.length)];
        },
        render(container, mode) {
            this.init();
            container.innerHTML = `
                <h3>🔴 Checkers — ${mode.toUpperCase()}</h3>
                <p>You play Red. Forced captures: if you can jump, you must. Reach the far row to become a King (♛).</p>
                <div style="display:flex; justify-content:center; margin:20px 0;">
                    <div id="checkers-board" class="checkers-board"></div>
                </div>
                <div id="checkers-status" style="margin-top:15px; font-weight:bold; min-height:24px;"></div>`;
            this.refresh(); this.updateStatus();
        },
        refresh() {
            const board = document.getElementById('checkers-board');
            if (!board) return;
            let html = '';
            for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
                const light = (r + c) % 2 === 0;
                const p = this.board[r][c];
                const isSel = this.selected && this.selected[0] === r && this.selected[1] === c;
                const isTarget = this.legalMoves.some(m => m.to[0] === r && m.to[1] === c);
                html += `<div class="checkers-square ${light?'light':'dark'}${isSel?' selected':''}"
                    onclick="GameEngines.checkers.click(${r},${c})">
                    ${p ? `<div class="checker-piece ${p.toLowerCase()==='w'?'red':'black'}${p===p.toUpperCase()?' king':''}">${p===p.toUpperCase()?'♛':''}</div>` : ''}
                    ${isTarget ? `<div class="checkers-target"></div>` : ''}
                </div>`;
            }
            board.innerHTML = html;
        },
        click(r, c) {
            if (this.over || this.turn !== 'w') return;
            if (this.selected) {
                const move = this.legalMoves.find(m => m.to[0] === r && m.to[1] === c);
                if (move) {
                    this.makeMove(move);
                    AudioFX.playCardSnap();
                    this.selected = null; this.legalMoves = [];
                    this.refresh(); this.updateStatus();
                    if (this.checkOver()) return;
                    GameSession.setTimer(() => this.aiTurn(), 400);
                    return;
                }
            }
            const p = this.board[r][c];
            if (p && p.toLowerCase() === 'w') { this.selected = [r,c]; this.legalMoves = this.genMoves(r, c); }
            else { this.selected = null; this.legalMoves = []; }
            this.refresh();
        },
        aiTurn() {
            if (this.over || this.turn !== 'b') return;
            const move = this.aiMove();
            if (!move) { this.checkOver(); return; }
            this.makeMove(move);
            AudioFX.playCardSnap();
            this.refresh(); this.updateStatus(); this.checkOver();
        },
        updateStatus() { if (this.over) return; setText('checkers-status', this.turn === 'w' ? 'Your turn (Red)' : 'Black thinking...', '#94a3b8'); },
        checkOver() {
            const wM = this.allMoves('w'), bM = this.allMoves('b');
            if (wM.length === 0) { this.over = true; AudioFX.playClick(); setText('checkers-status', '😢 No moves left. You lose. No reward.', '#ef4444'); finishGame(0, 15); return true; }
            if (bM.length === 0) { this.over = true; AudioFX.playWin(); setText('checkers-status', '🏆 You win! +100 Coins', '#22c55e'); finishGame(100, 60); return true; }
            return false;
        }
    },

    // ============ JENGA ============
    'jenga': {
        levels: [], over: false, pulls: 0, maxPulls: 20,
        init() {
            this.levels = [];
            for (let i = 0; i < 18; i++) this.levels.push([{ removed: false }, { removed: false }, { removed: false }]);
            this.over = false; this.pulls = 0;
        },
        blocksLeft(level) { return this.levels[level].filter(b => !b.removed).length; },
        canPull(level, idx) {
            if (level < 0 || level >= this.levels.length) return false;
            const b = this.levels[level][idx];
            if (!b || b.removed) return false;
            if (this.blocksLeft(level) <= 1) return false;
            if (level === this.levels.length - 1) return false;
            return true;
        },
        checkJengaAch() {
            if (this.pulls >= 15 && !state.achievements.jengaPro.claimed) {
                state.achievements.jengaPro.claimed = true;
                state.coins += state.achievements.jengaPro.reward;
                saveGameData(); updateStatsUI();
                if (typeof showToast === 'function') showToast(`🏆 Achievement: Steady Hand! +${state.achievements.jengaPro.reward} Coins`, 'success', 4000);
            }
        },
        pull(level, idx) {
            if (!this.canPull(level, idx)) return false;
            this.levels[level][idx].removed = true;
            this.pulls++;
            const risk = 0.02 + this.pulls * 0.01;
            if (Math.random() < risk) { this.collapse(); return true; }
            if (this.pulls >= this.maxPulls) this.win();
            return true;
        },
        collapse() {
            this.over = true;
            AudioFX.playClick();
            setText('jenga-status', `💥 The tower collapsed after ${this.pulls} pulls! +${this.pulls * 8} Coins`, '#ef4444');
            this.checkJengaAch();
            finishGame(this.pulls * 8, this.pulls * 4);
        },
        win() {
            this.over = true;
            AudioFX.playWin();
            setText('jenga-status', `🏆 You pulled ${this.pulls} blocks without collapse! +${this.pulls * 10 + 40} Coins`, '#22c55e');
            this.checkJengaAch();
            finishGame(this.pulls * 10 + 40, 60);
        },
        render(container, mode) {
            this.init();
            container.innerHTML = `
                <h3>🧱 Jenga — ${mode.toUpperCase()}</h3>
                <p>Click any wood block to pull it out. Each pull increases the collapse risk — pull ${this.maxPulls} blocks to win!</p>
                <p>Blocks pulled: <b id="jenga-count">0</b> / ${this.maxPulls} &nbsp;·&nbsp; Risk: <b id="jenga-risk" style="color:#f59e0b;">5%</b></p>
                <div style="display:flex; justify-content:center; max-height:520px; overflow-y:auto; margin:20px 0;">
                    <div id="jenga-tower" class="jenga-tower"></div>
                </div>
                <div id="jenga-status" style="margin-top:15px; font-weight:bold; min-height:24px;"></div>`;
            this.refresh();
        },
        refresh() {
            const tower = document.getElementById('jenga-tower');
            if (!tower) return;
            tower.innerHTML = this.levels.map((blocks, i) => {
                const ori = i % 2 === 0 ? 'h' : 'v';
                return `<div class="jenga-level ori-${ori}">
                    ${blocks.map((b, j) =>
                        `<div class="jenga-block${b.removed ? ' removed' : ''}"
                            onclick="GameEngines.jenga.click(${i},${j})"></div>`).join('')}
                </div>`;
            }).reverse().join('');
            const c = document.getElementById('jenga-count');
            if (c) c.textContent = this.pulls;
            const r = document.getElementById('jenga-risk');
            if (r) r.textContent = Math.round((0.02 + (this.pulls + 1) * 0.01) * 100) + '%';
        },
        click(level, idx) {
            if (this.over) return;
            if (!this.canPull(level, idx)) { setText('jenga-status', 'That block can\'t be pulled — it\'s needed to hold the tower.', '#f59e0b'); return; }
            this.pull(level, idx);
            AudioFX.playCardSnap();
            if (!this.over) {
                setText('jenga-status', `Pulled block ${this.pulls}. Risk now ${Math.round((0.02 + (this.pulls + 1) * 0.01) * 100)}%`);
                this.refresh();
            } else { this.refresh(); }
        }
    },

    // ============ RUBIK'S CUBE ============
    'rubiks': {
        faces: null, moves: 0, scrambled: false, solved: true,
        init() {
            this.faces = {};
            for (const f of ['U','D','F','B','L','R']) this.faces[f] = Array(9).fill(f);
            this.moves = 0; this.scrambled = false; this.solved = true;
        },
        rotateFace(face) {
            const f = this.faces[face];
            this.faces[face] = [f[6],f[3],f[0], f[7],f[4],f[1], f[8],f[5],f[2]];
        },
        U() {
            this.rotateFace('U');
            const {F,R,B,L} = this.faces;
            const t = [F[0],F[1],F[2]];
            F[0]=R[0]; F[1]=R[1]; F[2]=R[2];
            R[0]=B[0]; R[1]=B[1]; R[2]=B[2];
            B[0]=L[0]; B[1]=L[1]; B[2]=L[2];
            L[0]=t[0]; L[1]=t[1]; L[2]=t[2];
            this.afterMove();
        },
        D() {
            this.rotateFace('D');
            const {F,R,B,L} = this.faces;
            const t = [F[6],F[7],F[8]];
            F[6]=L[6]; F[7]=L[7]; F[8]=L[8];
            L[6]=B[6]; L[7]=B[7]; L[8]=B[8];
            B[6]=R[6]; B[7]=R[7]; B[8]=R[8];
            R[6]=t[0]; R[7]=t[1]; R[8]=t[2];
            this.afterMove();
        },
        R() {
            this.rotateFace('R');
            const {U,F,D,B} = this.faces;
            const t = [U[2],U[5],U[8]];
            U[2]=F[2]; U[5]=F[5]; U[8]=F[8];
            F[2]=D[2]; F[5]=D[5]; F[8]=D[8];
            D[2]=B[6]; D[5]=B[3]; D[8]=B[0];
            B[6]=t[0]; B[3]=t[1]; B[0]=t[2];
            this.afterMove();
        },
        L() {
            this.rotateFace('L');
            const {U,F,D,B} = this.faces;
            const t = [U[0],U[3],U[6]];
            U[0]=B[8]; U[3]=B[5]; U[6]=B[2];
            B[8]=D[0]; B[5]=D[3]; B[2]=D[6];
            D[0]=F[0]; D[3]=F[3]; D[6]=F[6];
            F[0]=t[0]; F[3]=t[1]; F[6]=t[2];
            this.afterMove();
        },
        F() {
            this.rotateFace('F');
            const {U,R,D,L} = this.faces;
            const t = [U[6],U[7],U[8]];
            U[6]=L[8]; U[7]=L[5]; U[8]=L[2];
            L[8]=D[0]; L[5]=D[1]; L[2]=D[2];
            D[0]=R[6]; D[1]=R[3]; D[2]=R[0];
            R[6]=t[0]; R[3]=t[1]; R[0]=t[2];
            this.afterMove();
        },
        B() {
            this.rotateFace('B');
            const {U,R,D,L} = this.faces;
            const t = [U[0],U[1],U[2]];
            U[0]=R[2]; U[1]=R[5]; U[2]=R[8];
            R[2]=D[8]; R[5]=D[7]; R[8]=D[6];
            D[8]=L[0]; D[7]=L[3]; D[6]=L[6];
            L[0]=t[2]; L[3]=t[1]; L[6]=t[0];
            this.afterMove();
        },
        prime(fn) { fn(); fn(); fn(); },
        afterMove() {
            this.moves++;
            this.checkSolved();
            this.refresh();
            const s = document.getElementById('rubiks-status');
            if (s && this.solved && this.scrambled) {
                AudioFX.playWin();
                setText('rubiks-status', `🏆 SOLVED in ${this.moves} moves! +150 Coins`, '#22c55e');
                this.scrambled = false;
                finishGame(150, 100);
            } else if (s) setText('rubiks-status', `Moves: ${this.moves}`, '#94a3b8');
            const mEl = document.getElementById('rubiks-moves');
            if (mEl) mEl.textContent = this.moves;
        },
        checkSolved() {
            this.solved = ['U','D','F','B','L','R'].every(f => {
                const face = this.faces[f];
                return face.every(s => s === face[0]);
            });
        },
        scramble() {
            const moves = [this.U, this.D, this.R, this.L, this.F, this.B];
            for (let i = 0; i < 20; i++) moves[Math.floor(Math.random() * 6)].call(this);
            this.moves = 0; this.scrambled = true; this.solved = false;
            AudioFX.playClick(); this.refresh();
            setText('rubiks-status', 'Cube scrambled! Solve it to win 150 Coins.', '#f59e0b');
        },
        reset() { this.init(); AudioFX.playClick(); this.refresh(); setText('rubiks-status', 'Cube reset. Press Scramble to begin.', '#94a3b8'); },
        render(container, mode) {
            this.init();
            container.innerHTML = `
                <h3>🎨 Rubik's Cube — ${mode.toUpperCase()}</h3>
                <p>Scramble the cube, then rotate faces to solve it. Each face must show all one color.</p>
                <div style="text-align:center; margin:15px 0;"><b>Moves: <span id="rubiks-moves">0</span></b></div>
                <div style="display:flex; justify-content:center; margin:20px 0;">
                    <div class="rubiks-net" id="rubiks-net"></div>
                </div>
                <div style="display:flex; flex-wrap:wrap; gap:6px; justify-content:center; max-width:500px; margin:0 auto;">
                    <button class="btn primary-btn rubik-btn" onclick="GameEngines.rubiks.U()">U</button>
                    <button class="btn primary-btn rubik-btn" onclick="GameEngines.rubiks.D()">D</button>
                    <button class="btn primary-btn rubik-btn" onclick="GameEngines.rubiks.R()">R</button>
                    <button class="btn primary-btn rubik-btn" onclick="GameEngines.rubiks.L()">L</button>
                    <button class="btn primary-btn rubik-btn" onclick="GameEngines.rubiks.F()">F</button>
                    <button class="btn primary-btn rubik-btn" onclick="GameEngines.rubiks.B()">B</button>
                    <button class="btn tutorial-btn rubik-btn" onclick="GameEngines.rubiks.prime(GameEngines.rubiks.U.bind(GameEngines.rubiks))">U'</button>
                    <button class="btn tutorial-btn rubik-btn" onclick="GameEngines.rubiks.prime(GameEngines.rubiks.D.bind(GameEngines.rubiks))">D'</button>
                    <button class="btn tutorial-btn rubik-btn" onclick="GameEngines.rubiks.prime(GameEngines.rubiks.R.bind(GameEngines.rubiks))">R'</button>
                    <button class="btn tutorial-btn rubik-btn" onclick="GameEngines.rubiks.prime(GameEngines.rubiks.L.bind(GameEngines.rubiks))">L'</button>
                    <button class="btn tutorial-btn rubik-btn" onclick="GameEngines.rubiks.prime(GameEngines.rubiks.F.bind(GameEngines.rubiks))">F'</button>
                    <button class="btn tutorial-btn rubik-btn" onclick="GameEngines.rubiks.prime(GameEngines.rubiks.B.bind(GameEngines.rubiks))">B'</button>
                </div>
                <div style="display:flex; gap:10px; justify-content:center; margin-top:20px;">
                    <button class="btn primary-btn" onclick="GameEngines.rubiks.scramble()">🌀 Scramble</button>
                    <button class="btn tutorial-btn" onclick="GameEngines.rubiks.reset()">↻ Reset</button>
                </div>
                <div id="rubiks-status" style="margin-top:15px; font-weight:bold; min-height:24px; text-align:center;"></div>`;
            this.refresh();
        },
        refresh() {
            const net = document.getElementById('rubiks-net');
            if (!net) return;
            const colorHex = { U: '#ffffff', D: '#ffd700', F: '#22c55e', B: '#3b82f6', L: '#f97316', R: '#dc2626' };
            const faceHTML = (f) => `<div class="rubiks-face" style="grid-column:${f.col}; grid-row:${f.row};">
                ${this.faces[f.name].map(sticker =>
                    `<div class="rubiks-sticker" style="background:${colorHex[sticker]};"></div>`
                ).join('')}
            </div>`;
            const layout = [
                { name: 'U', row: 1, col: 2 },
                { name: 'L', row: 2, col: 1 },
                { name: 'F', row: 2, col: 2 },
                { name: 'R', row: 2, col: 3 },
                { name: 'B', row: 2, col: 4 },
                { name: 'D', row: 3, col: 2 }
            ];
            net.innerHTML = layout.map(faceHTML).join('');
        }
    }
});
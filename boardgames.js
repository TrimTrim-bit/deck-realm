const ChessPieces = {
    'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙',
    'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟'
};

Object.assign(GameEngines, {

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
        genMoves(r, c, skipCastle = false) {
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
                if (this.inBounds(r+dir, c) && !this.board[r+dir][c]) { moves.push({ from: [r,c], to: [r+dir,c] }); if (r === start && !this.board[r+2*dir][c]) moves.push({ from: [r,c], to: [r+2*dir,c] }); }
                for (const dc of [-1,1]) if (this.inBounds(r+dir, c+dc) && this.board[r+dir][c+dc] && !this.sameColor(piece, this.board[r+dir][c+dc])) moves.push({ from: [r,c], to: [r+dir,c+dc] });
                if (this.lastMove && this.lastMove.piece && this.lastMove.piece.toLowerCase() === 'p' && Math.abs(this.lastMove.from[0] - this.lastMove.to[0]) === 2 && Math.abs(this.lastMove.to[1] - c) === 1 && this.lastMove.to[0] === r) moves.push({ from: [r,c], to: [r+dir, this.lastMove.to[1]], enPassant: true });
            } else if (type === 'n') {
                for (const [dr,dc] of [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]]) { const nr = r+dr, nc = c+dc; if (this.inBounds(nr,nc) && !this.sameColor(piece, this.board[nr][nc])) moves.push({ from: [r,c], to: [nr,nc] }); }
            } else if (type === 'b') { for (const [dr,dc] of [[-1,-1],[-1,1],[1,-1],[1,1]]) slide(dr,dc); }
            else if (type === 'r') { for (const [dr,dc] of [[-1,0],[1,0],[0,-1],[0,1]]) slide(dr,dc); }
            else if (type === 'q') { for (const [dr,dc] of [[-1,-1],[-1,1],[1,-1],[1,1],[-1,0],[1,0],[0,-1],[0,1]]) slide(dr,dc); }
            else if (type === 'k') {
                for (const [dr,dc] of [[-1,-1],[-1,1],[1,-1],[1,1],[-1,0],[1,0],[0,-1],[0,1]]) { const nr = r+dr, nc = c+dc; if (this.inBounds(nr,nc) && !this.sameColor(piece, this.board[nr][nc])) moves.push({ from: [r,c], to: [nr,nc] }); }
                if (skipCastle) return moves;
                const br = white ? 7 : 0;
                if (r === br && c === 4) {
                    if (!this.board[br][5] && !this.board[br][6] && this.board[br][7] === (white ? 'R' : 'r') && !this.isAttacked(br,4,!white) && !this.isAttacked(br,5,!white) && !this.isAttacked(br,6,!white)) moves.push({ from: [r,c], to: [br,6], castle: 'K' });
                    if (!this.board[br][3] && !this.board[br][2] && !this.board[br][1] && this.board[br][0] === (white ? 'R' : 'r') && !this.isAttacked(br,4,!white) && !this.isAttacked(br,3,!white) && !this.isAttacked(br,2,!white)) moves.push({ from: [r,c], to: [br,2], castle: 'Q' });
                }
            }
            return moves;
        },
        findKing(white) { const target = white ? 'K' : 'k'; for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) if (this.board[r][c] === target) return [r,c]; return null; },
        isAttacked(r, c, byWhite) {
            for (let fr = 0; fr < 8; fr++) for (let fc = 0; fc < 8; fc++) {
                const p = this.board[fr][fc];
                if (!p || this.isWhite(p) !== byWhite) continue;
                if (this.genMoves(fr, fc, true).some(m => m.to[0] === r && m.to[1] === c)) return true;
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
            for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) { const p = this.board[r][c]; if (!p || this.isWhite(p) !== white) continue; moves.push(...this.legalMovesFor(r, c)); }
            return moves;
        },
        makeMove(move, simulate = false) {
            if (!simulate) this.history.push({ board: this.board.map(r => [...r]), turn: this.turn, lastMove: this.lastMove ? { ...this.lastMove, from: [...this.lastMove.from], to: [...this.lastMove.to] } : null });
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
            const v = { p:1, n:3, b:3.2, r:5, q:9, k:0 };
            let s = 0;
            for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
                const p = this.board[r][c];
                if (!p) continue;
                const sign = this.isWhite(p) ? 1 : -1;
                s += sign * (v[p.toLowerCase()] || 0);
                const dist = Math.abs(r - 3.5) + Math.abs(c - 3.5);
                s += sign * (3.5 - dist) * 0.05;
            }
            return s;
        },
        aiMove() {
            const moves = this.allLegalMoves(false);
            if (moves.length === 0) return null;
            let best = null, bestScore = -Infinity;
            const vals = { p:1, n:3, b:3, r:5, q:9, k:0 };
            for (const m of moves) {
                const saved = this.board.map(r => [...r]);
                const savedTurn = this.turn, savedLast = this.lastMove;
                this.makeMove(m, true);
                const myEval = this.evaluate();
                let oppBest = 0;
                const oppMoves = this.allLegalMoves(true);
                for (const om of oppMoves) { const target = this.board[om.to[0]][om.to[1]]; if (target) { const val = vals[target.toLowerCase()] || 0; if (val > oppBest) oppBest = val; } }
                const score = myEval - oppBest * 0.8 + Math.random() * 0.15;
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
                <div style="display:flex; justify-content:center; margin:20px 0;"><div id="chess-board" class="chess-board"></div></div>
                <div style="display:flex; gap:10px; justify-content:center;">
                    <button class="btn tutorial-btn" onclick="GameEngines.chess.undo()">↶ Undo</button>
                    <button class="btn tutorial-btn" onclick="openGame('chess','1-ai')">🔄 New Game</button>
                </div>
                <div id="chess-status" style="margin-top:15px; font-weight:bold; min-height:24px;"></div>`;
            this.refresh(); this.updateStatus();
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
                const isLast = this.lastMove && ((this.lastMove.from[0] === r && this.lastMove.from[1] === c) || (this.lastMove.to[0] === r && this.lastMove.to[1] === c));
                html += `<div class="chess-square ${isLight?'light':'dark'}${isSel?' selected':''}${isLast?' last-move':''}" onclick="GameEngines.chess.click(${r},${c})">${sym ? `<span class="chess-piece ${this.isWhite(piece)?'white':'black'}">${sym}</span>` : ''}${isTarget && !piece ? '<span class="legal-dot"></span>' : ''}${isTarget && piece ? '<span class="capture-ring"></span>' : ''}</div>`;
            }
            board.innerHTML = html;
        },
        click(r, c) {
            if (this.over || this.turn !== 'w') return;
            if (this.selected) {
                const move = this.legalMoves.find(m => m.to[0] === r && m.to[1] === c);
                if (move) {
                    const wasPromo = this.board[move.from[0]][move.from[1]] === 'P' && move.to[0] === 0;
                    this.makeMove(move); AudioFX.playCardSnap();
                    if (wasPromo) showToast('♛ Pawn promoted to Queen!', 'info');
                    this.selected = null; this.legalMoves = [];
                    this.refresh(); this.updateStatus();
                    if (this.checkGameOver()) return;
                    GameSession.setTimer(() => this.aiTurn(), 300);
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
            this.refresh(); this.updateStatus(); this.checkGameOver();
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
            const wM = this.allLegalMoves(true), bM = this.allLegalMoves(false);
            if (wM.length === 0 && this.turn === 'w') {
                this.over = true;
                if (this.inCheck(true)) { AudioFX.playClick(); setText('chess-status', '♟️ Checkmate! Black wins.', '#ef4444'); finishGame(0, 20, false); }
                else { setText('chess-status', '🤝 Stalemate! Draw. +30 Coins', '#f59e0b'); finishGame(30, 25, false); }
                return true;
            }
            if (bM.length === 0 && this.turn === 'b') {
                this.over = true;
                if (this.inCheck(false)) { AudioFX.playWin(); setText('chess-status', '🏆 Checkmate! You win! +150 Coins', '#22c55e'); finishGame(150, 80, true); }
                else { setText('chess-status', '🤝 Stalemate! Draw. +30 Coins', '#f59e0b'); finishGame(30, 25, false); }
                return true;
            }
            return false;
        },
        undo() {
            if (this.history.length === 0) return;
            const steps = Math.min(this.history.length, 2);
            for (let i = 0; i < steps; i++) { const snap = this.history.pop(); this.board = snap.board; this.turn = snap.turn; this.lastMove = snap.lastMove; }
            this.selected = null; this.legalMoves = []; this.over = false;
            AudioFX.playClick(); this.refresh(); this.updateStatus();
        }
    },

    'checkers': {
        board: null, turn: 'w', selected: null, legalMoves: [], over: false, multiJump: null,
        init() {
            this.board = [];
            for (let r = 0; r < 8; r++) { this.board.push(Array(8).fill('')); for (let c = 0; c < 8; c++) { if ((r + c) % 2 === 1 && r < 3) this.board[r][c] = 'b'; else if ((r + c) % 2 === 1 && r > 4) this.board[r][c] = 'w'; } }
            this.turn = 'w'; this.selected = null; this.legalMoves = []; this.over = false; this.multiJump = null;
        },
        inBounds(r, c) { return r >= 0 && r < 8 && c >= 0 && c < 8; },
        genMoves(r, c) {
            const p = this.board[r][c]; if (!p) return [];
            const moves = [], isKing = p === 'W' || p === 'B', color = p.toLowerCase();
            const dirs = isKing ? [-1,1] : (color === 'w' ? [-1] : [1]);
            for (const dr of dirs) for (const dc of [-1,1]) { const mr = r+dr, mc = c+dc, tr = r+2*dr, tc = c+2*dc; if (this.inBounds(tr,tc) && this.inBounds(mr,mc)) { const mid = this.board[mr][mc]; if (mid && mid.toLowerCase() !== color && !this.board[tr][tc]) moves.push({ from: [r,c], to: [tr,tc], capture: [mr,mc] }); } }
            if (moves.length > 0) return moves;
            for (const dr of dirs) for (const dc of [-1,1]) { const tr = r+dr, tc = c+dc; if (this.inBounds(tr,tc) && !this.board[tr][tc]) moves.push({ from: [r,c], to: [tr,tc] }); }
            return moves;
        },
        allMoves(color) {
            const all = [];
            for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) { const p = this.board[r][c]; if (p && p.toLowerCase() === color) all.push(...this.genMoves(r,c)); }
            const jumps = all.filter(m => m.capture);
            return jumps.length > 0 ? jumps : all;
        },
        makeMove(move) {
            const [fr,fc] = move.from, [tr,tc] = move.to;
            const piece = this.board[fr][fc];
            this.board[tr][tc] = piece; this.board[fr][fc] = '';
            if (move.capture) this.board[move.capture[0]][move.capture[1]] = '';
            if (piece === 'w' && tr === 0) this.board[tr][tc] = 'W';
            if (piece === 'b' && tr === 7) this.board[tr][tc] = 'B';
            if (move.capture) { const more = this.genMoves(tr, tc).filter(m => m.capture); if (more.length > 0) { this.multiJump = { r: tr, c: tc }; return { multiJump: true }; } }
            this.multiJump = null;
            this.turn = this.turn === 'w' ? 'b' : 'w';
            return {};
        },
        aiMove() {
            const moves = this.allMoves('b');
            if (moves.length === 0) return null;
            let best = null, bestScore = -Infinity;
            for (const m of moves) {
                let score = 0;
                if (m.capture) { const t = this.board[m.capture[0]][m.capture[1]]; score += t === 'W' ? 10 : 5; if (m.to[0] === 7) score += 5; }
                const savedPiece = this.board[m.to[0]][m.to[1]];
                this.board[m.to[0]][m.to[1]] = 'B';
                this.board[m.from[0]][m.from[1]] = '';
                let recaptureThreat = 0;
                for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) { const p = this.board[r][c]; if (p === 'w' || p === 'W') { const em = this.genMoves(r, c).filter(x => x.capture && x.capture[0] === m.to[0] && x.capture[1] === m.to[1]); if (em.length > 0) recaptureThreat++; } }
                this.board[m.from[0]][m.from[1]] = 'b';
                this.board[m.to[0]][m.to[1]] = savedPiece;
                score -= recaptureThreat * 3;
                score += Math.random() * 0.5;
                if (score > bestScore) { bestScore = score; best = m; }
            }
            return best;
        },
        render(container, mode) {
            this.init();
            container.innerHTML = `
                <h3>🔴 Checkers — ${mode.toUpperCase()}</h3>
                <p>You play Red. <b>Forced captures</b>: if you can jump, you must. Reach the far row to become a King (♛).</p>
                <div style="display:flex; justify-content:center; margin:20px 0;"><div id="checkers-board" class="checkers-board"></div></div>
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
                html += `<div class="checkers-square ${light?'light':'dark'}${isSel?' selected':''}" onclick="GameEngines.checkers.click(${r},${c})">${p ? `<div class="checker-piece ${p.toLowerCase()==='w'?'red':'black'}${p===p.toUpperCase()?' king':''}">${p===p.toUpperCase()?'♛':''}</div>` : ''}${isTarget ? `<div class="checkers-target"></div>` : ''}</div>`;
            }
            board.innerHTML = html;
        },
        click(r, c) {
            const g = this;
            if (g.over || g.turn !== 'w') return;
            if (g.multiJump) { if (r === g.multiJump.r && c === g.multiJump.c) return; const move = g.legalMoves.find(m => m.to[0] === r && m.to[1] === c); if (move) g.applyAndContinue(move); return; }
            if (g.selected) { const move = g.legalMoves.find(m => m.to[0] === r && m.to[1] === c); if (move) { g.applyAndContinue(move); return; } }
            const p = g.board[r][c];
            if (p && p.toLowerCase() === 'w') { const allP = g.allMoves('w'); const pieceMoves = allP.filter(m => m.from[0] === r && m.from[1] === c); g.selected = [r,c]; g.legalMoves = pieceMoves; if (allP.some(m => m.capture) && pieceMoves.length === 0) setText('checkers-status', '⚠️ You must capture! Pick a piece that can jump.', '#f59e0b'); }
            else { g.selected = null; g.legalMoves = []; }
            g.refresh();
        },
        applyAndContinue(move) {
            const g = this;
            const result = g.makeMove(move);
            AudioFX.playWin();
            if (result.multiJump) { g.selected = [g.multiJump.r, g.multiJump.c]; g.legalMoves = g.genMoves(g.multiJump.r, g.multiJump.c).filter(m => m.capture); setText('checkers-status', '⚡ Multi-jump! Continue capturing.', '#22c55e'); g.refresh(); return; }
            g.selected = null; g.legalMoves = [];
            g.refresh(); g.updateStatus();
            if (g.checkOver()) return;
            GameSession.setTimer(() => g.aiTurn(), 400);
        },
        aiTurn() {
            const g = this;
            if (g.over || g.turn !== 'b') return;
            const move = g.aiMove();
            if (!move) { g.checkOver(); return; }
            const result = g.makeMove(move);
            AudioFX.playCardSnap();
            if (result.multiJump) { GameSession.setTimer(() => g.aiTurn(), 300); return; }
            g.refresh(); g.updateStatus(); g.checkOver();
        },
        updateStatus() { if (this.over) return; setText('checkers-status', this.turn === 'w' ? 'Your turn (Red)' : 'Black thinking...', '#94a3b8'); },
        checkOver() {
            const wM = this.allMoves('w'), bM = this.allMoves('b');
            if (wM.length === 0) { this.over = true; AudioFX.playClick(); setText('checkers-status', '😢 No moves left. You lose.', '#ef4444'); finishGame(0, 15, false); return true; }
            if (bM.length === 0) { this.over = true; AudioFX.playWin(); setText('checkers-status', '🏆 You win! +100 Coins', '#22c55e'); finishGame(100, 60, true); return true; }
            return false;
        }
    },

    'jenga': {
        levels: [], wobble: 0, pulls: 0, goal: 15, over: false,
        init() {
            this.levels = [];
            for (let i = 0; i < 18; i++) this.levels.push([0,1,2].map(() => ({ removed: false, grip: 0.4 + Math.random() * 0.8 })));
            this.wobble = 0; this.pulls = 0; this.over = false;
        },
        blocksLeft(level) { return this.levels[level].filter(b => !b.removed).length; },
        canPull(level, idx) { if (level < 0 || level >= this.levels.length) return false; const b = this.levels[level][idx]; if (!b || b.removed) return false; return this.blocksLeft(level) >= 2; },
        pull(level, idx) {
            const g = this;
            if (!g.canPull(level, idx) || g.over) return;
            const block = g.levels[level][idx];
            block.removed = true;
            g.pulls++;
            const gripRisk = (1.2 - block.grip) * 6;
            const riskIncrement = 3 + gripRisk + (g.pulls * 0.5);
            g.wobble = Math.min(100, g.wobble + riskIncrement);
            AudioFX.playCardSnap();
            if (g.wobble >= 100) { g.collapse(); return; }
            if (g.pulls >= g.goal) { g.win(); return; }
            g.refresh();
            const coins = g.pulls * 8;
            setText('jenga-status', `Pulled! Wobble ${Math.round(g.wobble)}% · +${coins} coins secured`, '#22c55e');
            g.drawWobbleBar();
        },
        collapse() {
            const g = this; g.over = true;
            const coins = g.pulls * 8;
            AudioFX.playClick();
            const tower = document.getElementById('jenga-tower');
            if (tower) { tower.style.animation = 'jengaShake 0.6s ease'; setTimeout(() => { if (tower) tower.style.transform = 'translateY(40px) rotate(15deg)'; }, 600); }
            setText('jenga-status', `💥 Tower collapsed after ${g.pulls} pulls! +${coins} Coins`, '#ef4444');
            finishGame(coins, g.pulls * 4, false);
        },
        win() {
            const g = this;
            g.over = true;
            AudioFX.playWin();
            setText('jenga-status', `🏆 Pulled ${g.pulls} blocks without collapse! +${g.pulls * 10 + 40} Coins`, '#22c55e');
            finishGame(g.pulls * 10 + 40, 60, true);
        },
        render(container, mode) {
            this.init();
            container.innerHTML = `
                <h3>🧱 Jenga — ${mode.toUpperCase()}</h3>
                <p>Click a block to pull it. Each pull adds to the <b>wobble meter</b> — hit 100% and it collapses! Goal: pull ${this.goal} blocks.</p>
                <div id="jenga-wobble" style="max-width:400px; margin:15px auto;">
                    <div style="display:flex; justify-content:space-between; font-size:0.85rem; color:var(--text-muted);"><span>Wobble</span><span id="jenga-wobble-pct">0%</span></div>
                    <div style="height:14px; background:var(--surface-color); border-radius:7px; overflow:hidden; margin-top:4px;"><div id="jenga-wobble-fill" style="height:100%; width:0%; background:linear-gradient(90deg,#22c55e,#eab308,#ef4444); transition:width 0.3s;"></div></div>
                    <div style="display:flex; justify-content:space-between; margin-top:8px; font-size:0.9rem;"><span>Pulls: <b id="jenga-pulls" style="color:var(--accent-cyan);">0</b>/${this.goal}</span><span>Risk shown on blocks</span></div>
                </div>
                <div style="display:flex; justify-content:center; max-height:520px; overflow-y:auto; margin:20px 0;"><div id="jenga-tower" class="jenga-tower" style="transition:transform 0.6s;"></div></div>
                <div id="jenga-status" style="margin-top:15px; font-weight:bold; min-height:24px;"></div>`;
            this.refresh();
        },
        refresh() {
            const g = this;
            const tower = document.getElementById('jenga-tower');
            if (!tower) return;
            tower.innerHTML = g.levels.map((blocks, i) => {
                const ori = i % 2 === 0 ? 'h' : 'v';
                return `<div class="jenga-level ori-${ori}">${blocks.map((b, j) => {
                    if (b.removed) return `<div class="jenga-block removed"></div>`;
                    const risk = b.grip >= 0.9 ? 'low' : b.grip >= 0.6 ? 'med' : 'high';
                    return `<div class="jenga-block risk-${risk}" title="Risk: ${risk}" onclick="GameEngines.jenga.click(${i},${j})"><div class="jenga-risk-dot risk-${risk}"></div></div>`;
                }).join('')}</div>`;
            }).reverse().join('');
            const pulls = document.getElementById('jenga-pulls');
            if (pulls) pulls.textContent = g.pulls;
        },
        drawWobbleBar() {
            const fill = document.getElementById('jenga-wobble-fill');
            const pct = document.getElementById('jenga-wobble-pct');
            if (fill) fill.style.width = this.wobble + '%';
            if (pct) pct.textContent = Math.round(this.wobble) + '%';
        },
        click(level, idx) {
            const g = this;
            if (g.over) return;
            if (!g.canPull(level, idx)) { setText('jenga-status', 'Can\'t pull — that block is load-bearing!', '#f59e0b'); return; }
            g.pull(level, idx);
        }
    },

    'rubiks': {
        faces: null, moves: 0, maxMoves: 12, scrambled: false, solved: true, scrambleSeq: [], lastScrambleStep: 0,
        init() {
            this.faces = {};
            for (const f of ['U','D','F','B','L','R']) this.faces[f] = Array(9).fill(f);
            this.moves = 0; this.scrambled = false; this.solved = true;
            this.scrambleSeq = []; this.lastScrambleStep = 0;
        },
        rotateFace(face) { const f = this.faces[face]; this.faces[face] = [f[6],f[3],f[0], f[7],f[4],f[1], f[8],f[5],f[2]]; },
        U() { this.rotateFace('U'); const {F,R,B,L} = this.faces; const t = [F[0],F[1],F[2]]; F[0]=R[0]; F[1]=R[1]; F[2]=R[2]; R[0]=B[0]; R[1]=B[1]; R[2]=B[2]; B[0]=L[0]; B[1]=L[1]; B[2]=L[2]; L[0]=t[0]; L[1]=t[1]; L[2]=t[2]; this.afterMove(); },
        D() { this.rotateFace('D'); const {F,R,B,L} = this.faces; const t = [F[6],F[7],F[8]]; F[6]=L[6]; F[7]=L[7]; F[8]=L[8]; L[6]=B[6]; L[7]=B[7]; L[8]=B[8]; B[6]=R[6]; B[7]=R[7]; B[8]=R[8]; R[6]=t[0]; R[7]=t[1]; R[8]=t[2]; this.afterMove(); },
        R() { this.rotateFace('R'); const {U,F,D,B} = this.faces; const t = [U[2],U[5],U[8]]; U[2]=F[2]; U[5]=F[5]; U[8]=F[8]; F[2]=D[2]; F[5]=D[5]; F[8]=D[8]; D[2]=B[6]; D[5]=B[3]; D[8]=B[0]; B[6]=t[0]; B[3]=t[1]; B[0]=t[2]; this.afterMove(); },
        L() { this.rotateFace('L'); const {U,F,D,B} = this.faces; const t = [U[0],U[3],U[6]]; U[0]=B[8]; U[3]=B[5]; U[6]=B[2]; B[8]=D[0]; B[5]=D[3]; B[2]=D[6]; D[0]=F[0]; D[3]=F[3]; D[6]=F[6]; F[0]=t[0]; F[3]=t[1]; F[6]=t[2]; this.afterMove(); },
        F() { this.rotateFace('F'); const {U,R,D,L} = this.faces; const t = [U[6],U[7],U[8]]; U[6]=L[8]; U[7]=L[5]; U[8]=L[2]; L[8]=D[0]; L[5]=D[1]; L[2]=D[2]; D[0]=R[6]; D[1]=R[3]; D[2]=R[0]; R[6]=t[0]; R[3]=t[1]; R[0]=t[2]; this.afterMove(); },
        B() { this.rotateFace('B'); const {U,R,D,L} = this.faces; const t = [U[0],U[1],U[2]]; U[0]=R[2]; U[1]=R[5]; U[2]=R[8]; R[2]=D[8]; R[5]=D[7]; R[8]=D[6]; D[8]=L[0]; D[7]=L[3]; D[6]=L[6]; L[0]=t[2]; L[3]=t[1]; L[6]=t[0]; this.afterMove(); },
        prime(fn) { fn.call(this); fn.call(this); fn.call(this); },
        afterMove() {
            if (this._suppress) return;
            this.moves++;
            this.checkSolved();
            this.refresh();
            const s = document.getElementById('rubiks-status');
            if (this.solved && this.scrambled) { this.scrambled = false; AudioFX.playWin(); setText('rubiks-status', `🏆 SOLVED in ${this.moves} moves! +150 Coins`, '#22c55e'); finishGame(150, 100, true); return; }
            if (this.moves >= this.maxMoves && this.scrambled) { this.scrambled = false; AudioFX.playClick(); setText('rubiks-status', `😢 Out of moves! (${this.moves}/${this.maxMoves}) No reward.`, '#ef4444'); finishGame(0, 20, false); return; }
            if (s) setText('rubiks-status', `Moves: ${this.moves}/${this.maxMoves}`, '#94a3b8');
            const mEl = document.getElementById('rubiks-moves');
            if (mEl) mEl.textContent = `${this.moves}/${this.maxMoves}`;
        },
        checkSolved() { this.solved = ['U','D','F','B','L','R'].every(f => { const face = this.faces[f]; return face.every(s => s === face[0]); }); },
        scramble() {
            const faces = ['U','D','R','L','F','B'];
            this.init();
            this._suppress = true;
            this.scrambleSeq = [];
            for (let i = 0; i < 3; i++) { const f = faces[Math.floor(Math.random() * 6)]; this.scrambleSeq.push(f); this[f].call(this); }
            this._suppress = false;
            this.moves = 0; this.scrambled = true; this.solved = false;
            this.lastScrambleStep = this.scrambleSeq.length - 1;
            AudioFX.playClick(); this.refresh();
            setText('rubiks-status', `Cube scrambled with 3 moves. You have ${this.maxMoves} moves to solve it! Click 💡 for a hint.`, '#f59e0b');
            const mEl = document.getElementById('rubiks-moves');
            if (mEl) mEl.textContent = `0/${this.maxMoves}`;
        },
        hint() {
            if (this.scrambleSeq.length === 0) { setText('rubiks-status', 'Scramble first!', '#f59e0b'); return; }
            const reverseSolution = [...this.scrambleSeq].reverse().map(m => m + "'");
            const next = reverseSolution[reverseSolution.length - this.lastScrambleStep - 1] || reverseSolution[reverseSolution.length - 1];
            setText('rubiks-status', `💡 Try: ${next}`, '#38bdf8');
        },
        reset() { this.init(); AudioFX.playClick(); this.refresh(); setText('rubiks-status', 'Cube reset. Press Scramble to begin.', '#94a3b8'); },
        render(container, mode) {
            this.init();
            container.innerHTML = `
                <h3>🎨 Rubik's Cube — ${mode.toUpperCase()}</h3>
                <p>Scramble the cube (3 random moves), then solve it in ${this.maxMoves} moves. Use 💡 Hint if you get stuck!</p>
                <div style="text-align:center; margin:15px 0;"><b>Moves: <span id="rubiks-moves">0/${this.maxMoves}</span></b></div>
                <div style="display:flex; justify-content:center; margin:20px 0;"><div class="rubiks-net" id="rubiks-net"></div></div>
                <div style="display:flex; flex-wrap:wrap; gap:6px; justify-content:center; max-width:500px; margin:0 auto;">
                    <button class="btn primary-btn rubik-btn" onclick="GameEngines.rubiks.U()">U</button>
                    <button class="btn primary-btn rubik-btn" onclick="GameEngines.rubiks.D()">D</button>
                    <button class="btn primary-btn rubik-btn" onclick="GameEngines.rubiks.R()">R</button>
                    <button class="btn primary-btn rubik-btn" onclick="GameEngines.rubiks.L()">L</button>
                    <button class="btn primary-btn rubik-btn" onclick="GameEngines.rubiks.F()">F</button>
                    <button class="btn primary-btn rubik-btn" onclick="GameEngines.rubiks.B()">B</button>
                    <button class="btn tutorial-btn rubik-btn" onclick="GameEngines.rubiks.prime(GameEngines.rubiks.U)">U'</button>
                    <button class="btn tutorial-btn rubik-btn" onclick="GameEngines.rubiks.prime(GameEngines.rubiks.D)">D'</button>
                    <button class="btn tutorial-btn rubik-btn" onclick="GameEngines.rubiks.prime(GameEngines.rubiks.R)">R'</button>
                    <button class="btn tutorial-btn rubik-btn" onclick="GameEngines.rubiks.prime(GameEngines.rubiks.L)">L'</button>
                    <button class="btn tutorial-btn rubik-btn" onclick="GameEngines.rubiks.prime(GameEngines.rubiks.F)">F'</button>
                    <button class="btn tutorial-btn rubik-btn" onclick="GameEngines.rubiks.prime(GameEngines.rubiks.B)">B'</button>
                </div>
                <div style="display:flex; gap:10px; justify-content:center; margin-top:20px;">
                    <button class="btn primary-btn" onclick="GameEngines.rubiks.scramble()">🌀 Scramble</button>
                    <button class="btn tutorial-btn" onclick="GameEngines.rubiks.hint()">💡 Hint</button>
                    <button class="btn tutorial-btn" onclick="GameEngines.rubiks.reset()">↻ Reset</button>
                </div>
                <div id="rubiks-status" style="margin-top:15px; font-weight:bold; min-height:24px; text-align:center;"></div>`;
            this.refresh();
        },
        refresh() {
            const net = document.getElementById('rubiks-net');
            if (!net) return;
            const colorHex = { U: '#ffffff', D: '#ffd700', F: '#22c55e', B: '#3b82f6', L: '#f97316', R: '#dc2626' };
            const faceHTML = (f) => `<div class="rubiks-face" style="grid-column:${f.col}; grid-row:${f.row};">${this.faces[f.name].map(sticker => `<div class="rubiks-sticker" style="background:${colorHex[sticker]};"></div>`).join('')}</div>`;
            const layout = [{ name: 'U', row: 1, col: 2 }, { name: 'L', row: 2, col: 1 }, { name: 'F', row: 2, col: 2 }, { name: 'R', row: 2, col: 3 }, { name: 'B', row: 2, col: 4 }, { name: 'D', row: 3, col: 2 }];
            net.innerHTML = layout.map(faceHTML).join('');
        }
    }
});
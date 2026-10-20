Object.assign(GameEngines, {
    'minesweeper': {
        ROWS: 9, COLS: 9, MINES: 10,
        board: [], revealed: [], flagged: [],
        gameOver: false, flagMode: false, cellsRevealed: 0,

        render(container, mode) {
            const g = this;
            g.board = []; g.revealed = []; g.flagged = [];
            g.gameOver = false; g.flagMode = false; g.cellsRevealed = 0;
            for (let r = 0; r < g.ROWS; r++) {
                g.board.push(Array(g.COLS).fill(0));
                g.revealed.push(Array(g.COLS).fill(false));
                g.flagged.push(Array(g.COLS).fill(false));
            }
            let placed = 0;
            while (placed < g.MINES) {
                const r = Math.floor(Math.random() * g.ROWS);
                const c = Math.floor(Math.random() * g.COLS);
                if (g.board[r][c] !== -1) { g.board[r][c] = -1; placed++; }
            }
            for (let r = 0; r < g.ROWS; r++) for (let c = 0; c < g.COLS; c++) {
                if (g.board[r][c] === -1) continue;
                let count = 0;
                for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
                    if (dr === 0 && dc === 0) continue;
                    const nr = r + dr, nc = c + dc;
                    if (nr >= 0 && nr < g.ROWS && nc >= 0 && nc < g.COLS && g.board[nr][nc] === -1) count++;
                }
                g.board[r][c] = count;
            }
            container.innerHTML = `
                <h3>💣 Minesweeper — ${mode.toUpperCase()}</h3>
                <p>Left-click to reveal. Right-click (or toggle flag mode) to flag a mine. Reveal all safe cells to win!</p>
                <p>Mines: <b>${g.MINES}</b> · Flags: <b id="ms-flags">0</b>/${g.MINES}</p>
                <div style="display:flex; gap:10px; justify-content:center; margin:10px 0;">
                    <button class="btn tutorial-btn" id="ms-flag-btn" onclick="GameEngines.minesweeper.toggleFlag()">🚩 Flag Mode: OFF</button>
                </div>
                <div id="ms-board" style="display:inline-grid; grid-template-columns:repeat(${g.COLS}, 34px); gap:2px; background:#0f172a; padding:6px; border-radius:8px; margin:15px auto;"></div>
                <div id="ms-status" style="margin-top:15px; font-weight:bold; min-height:24px;"></div>`;
            g.draw();
        },
        draw() {
            const g = this;
            const board = document.getElementById('ms-board');
            if (!board) return;
            board.innerHTML = g.board.map((row, r) => row.map((cell, c) => {
                const rev = g.revealed[r][c], flag = g.flagged[r][c];
                let bg = '#475569', content = '', color = '#fff';
                if (rev) {
                    if (cell === -1) { bg = '#dc2626'; content = '💣'; }
                    else if (cell === 0) { bg = '#94a3b8'; }
                    else { bg = '#64748b'; content = cell; color = ['#38bdf8','#22c55e','#ef4444','#a855f7','#f59e0b','#06b6d4','#e2e8f0','#f8fafc'][cell-1] || '#fff'; }
                } else if (flag) { bg = '#f59e0b'; content = '🚩'; }
                return `<div onclick="GameEngines.minesweeper.click(${r},${c})" oncontextmenu="event.preventDefault(); GameEngines.minesweeper.rightClick(${r},${c})" style="width:34px; height:34px; background:${bg}; border-radius:3px; display:flex; align-items:center; justify-content:center; color:${color}; font-weight:bold; cursor:pointer; font-size:1rem; user-select:none;">${content}</div>`;
            }).join('')).join('');
            const flagCount = g.flagged.flat().filter(Boolean).length;
            const el = document.getElementById('ms-flags');
            if (el) el.textContent = flagCount;
        },
        toggleFlag() {
            this.flagMode = !this.flagMode;
            const btn = document.getElementById('ms-flag-btn');
            if (btn) btn.textContent = `🚩 Flag Mode: ${this.flagMode ? 'ON' : 'OFF'}`;
        },
        click(r, c) {
            const g = this;
            if (g.gameOver || g.revealed[r][c]) return;
            if (g.flagMode) { g.rightClick(r, c); return; }
            if (g.flagged[r][c]) return;
            g.reveal(r, c);
            g.draw();
            if (g.board[r][c] === -1) { g.lose(); return; }
            g.checkWin();
        },
        rightClick(r, c) {
            const g = this;
            if (g.gameOver || g.revealed[r][c]) return;
            g.flagged[r][c] = !g.flagged[r][c];
            AudioFX.playClick();
            g.draw();
        },
        reveal(r, c) {
            const g = this;
            if (r < 0 || r >= g.ROWS || c < 0 || c >= g.COLS) return;
            if (g.revealed[r][c] || g.flagged[r][c]) return;
            g.revealed[r][c] = true;
            g.cellsRevealed++;
            if (g.board[r][c] === 0) {
                for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
                    if (dr === 0 && dc === 0) continue;
                    g.reveal(r + dr, c + dc);
                }
            }
        },
        checkWin() {
            const g = this;
            const totalSafe = g.ROWS * g.COLS - g.MINES;
            if (g.cellsRevealed >= totalSafe && !g.gameOver) {
                g.gameOver = true;
                AudioFX.playWin();
                setText('ms-status', '🎉 Board cleared! +150 Coins', '#22c55e');
                finishGame(150, 80, true);
            }
        },
        lose() {
            const g = this;
            if (g.gameOver) return;
            g.gameOver = true;
            for (let r = 0; r < g.ROWS; r++) for (let c = 0; c < g.COLS; c++) {
                if (g.board[r][c] === -1) g.revealed[r][c] = true;
            }
            g.draw();
            AudioFX.playClick();
            setText('ms-status', '💥 Boom! You hit a mine. No reward.', '#ef4444');
            finishGame(0, 20, false);
        }
    }
});
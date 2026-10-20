Object.assign(GameEngines, {

    'wordle': {
        answer: '', guesses: [], currentGuess: '', gameOver: false, maxGuesses: 6,
        render(container, mode) {
            const g = this;
            g.answer = WORDS_5[Math.floor(Math.random() * WORDS_5.length)].toUpperCase();
            g.guesses = []; g.currentGuess = ''; g.gameOver = false;
            container.innerHTML = `
                <h3>📝 Wordle — ${mode.toUpperCase()}</h3>
                <p>Guess the 5-letter word in 6 tries. <span style="color:#22c55e;">🟩 = right spot</span> · <span style="color:#eab308;">🟨 = wrong spot</span> · <span style="color:#64748b;">⬛ = not in word</span></p>
                <div id="wordle-board" style="display:flex; flex-direction:column; gap:6px; align-items:center; margin:20px 0;"></div>
                <div id="wordle-status" style="margin:15px 0; font-weight:bold; min-height:24px; color:#f59e0b;"></div>
                <div id="wordle-keyboard" style="max-width:520px; margin:0 auto;"></div>`;
            g.drawBoard(); g.drawKeyboard(); g.bindKeyboard();
        },
        drawBoard() {
            const g = this;
            const board = document.getElementById('wordle-board'); if (!board) return;
            const rows = [];
            for (let i = 0; i < g.maxGuesses; i++) {
                const guess = g.guesses[i];
                const cells = [];
                for (let j = 0; j < 5; j++) {
                    let letter = '', bg = 'var(--surface-color)', color = 'var(--text-main)';
                    if (guess) { letter = guess.word[j]; bg = guess.marks[j] === 'G' ? '#22c55e' : guess.marks[j] === 'Y' ? '#eab308' : '#64748b'; color = '#fff'; }
                    else if (i === g.guesses.length) letter = g.currentGuess[j] || '';
                    cells.push(`<div class="wordle-tile" style="background:${bg}; color:${color}; border:2px solid ${letter ? '#94a3b8' : 'var(--border-color)'};">${letter}</div>`);
                }
                rows.push(`<div style="display:flex; gap:6px;">${cells.join('')}</div>`);
            }
            board.innerHTML = rows.join('');
        },
        drawKeyboard() {
            const g = this;
            const kb = document.getElementById('wordle-keyboard'); if (!kb) return;
            const rows = ['QWERTYUIOP', 'ASDFGHJKL', '⏎ZXCVBNM⌫'];
            const statusMap = {};
            for (const guess of g.guesses) for (let i = 0; i < 5; i++) { const l = guess.word[i], m = guess.marks[i]; if (m === 'G') statusMap[l] = 'G'; else if (m === 'Y' && statusMap[l] !== 'G') statusMap[l] = 'Y'; else if (m === 'X' && !statusMap[l]) statusMap[l] = 'X'; }
            kb.innerHTML = rows.map(row => `<div style="display:flex; gap:5px; justify-content:center; margin-bottom:6px;">${[...row].map(k => { let bg = 'var(--surface-color)'; if (statusMap[k] === 'G') bg = '#22c55e'; else if (statusMap[k] === 'Y') bg = '#eab308'; else if (statusMap[k] === 'X') bg = '#475569'; const wide = (k === '⏎' || k === '⌫'); return `<button class="wordle-key" style="background:${bg}; min-width:${wide ? 56 : 34}px;" onclick="GameEngines.wordle.pressKey('${k === '⏎' ? 'ENTER' : k === '⌫' ? 'BACK' : k}')">${k}</button>`; }).join('')}</div>`).join('');
        },
        bindKeyboard() {
            const g = this;
            g._handler = (e) => {
                if (g.gameOver || GameSession.currentGame !== 'wordle') return;
                const k = e.key;
                if (k === 'Enter') g.pressKey('ENTER');
                else if (k === 'Backspace') g.pressKey('BACK');
                else if (/^[a-zA-Z]$/.test(k)) g.pressKey(k.toUpperCase());
            };
            document.removeEventListener('keydown', g._handler);
            document.addEventListener('keydown', g._handler);
        },
        pressKey(key) {
            const g = this;
            if (g.gameOver) return;
            if (key === 'ENTER') { g.submit(); return; }
            if (key === 'BACK') { g.currentGuess = g.currentGuess.slice(0, -1); g.drawBoard(); return; }
            if (g.currentGuess.length < 5 && /^[A-Z]$/.test(key)) { g.currentGuess += key; g.drawBoard(); }
        },
        submit() {
            const g = this;
            if (g.currentGuess.length !== 5) { setText('wordle-status', 'Not enough letters.', '#ef4444'); return; }
            const word = g.currentGuess;
            if (!WORDLE_VALID.has(word.toLowerCase())) { setText('wordle-status', `"${word}" isn't in the dictionary.`, '#ef4444'); return; }
            const marks = g.scoreGuess(word, g.answer);
            g.guesses.push({ word, marks });
            AudioFX.playCardSnap();
            g.currentGuess = '';
            g.drawBoard(); g.drawKeyboard();
            if (word === g.answer) {
                g.gameOver = true;
                AudioFX.playWin();
                setText('wordle-status', `🎉 SOLVED in ${g.guesses.length}/6! +${50 + (6 - g.guesses.length) * 15} Coins`, '#22c55e');
                finishGame(50 + (6 - g.guesses.length) * 15, 40, true);
                return;
            }
            if (g.guesses.length >= g.maxGuesses) {
                g.gameOver = true;
                AudioFX.playClick();
                setText('wordle-status', `😢 Out of guesses. The word was ${g.answer}.`, '#ef4444');
                finishGame(0, 10, false);
                return;
            }
            setText('wordle-status', `${g.maxGuesses - g.guesses.length} guesses left.`);
        },
        scoreGuess(word, answer) {
            const marks = ['X', 'X', 'X', 'X', 'X'];
            const answerCounts = {};
            for (const c of answer) answerCounts[c] = (answerCounts[c] || 0) + 1;
            for (let i = 0; i < 5; i++) if (word[i] === answer[i]) { marks[i] = 'G'; answerCounts[word[i]]--; }
            for (let i = 0; i < 5; i++) {
                if (marks[i] === 'G') continue;
                const c = word[i];
                if (answerCounts[c] > 0) { marks[i] = 'Y'; answerCounts[c]--; }
            }
            return marks;
        }
    },

    'waffle': {
        grid: null, solution: null, swaps: 10, gameOver: false, selected: null, puzzle: null,
        generatePuzzle() {
            for (let attempts = 0; attempts < 200; attempts++) {
                const r0 = WORDS_5[Math.floor(Math.random() * WORDS_5.length)].toUpperCase();
                const r1 = WORDS_5[Math.floor(Math.random() * WORDS_5.length)].toUpperCase();
                const r2 = WORDS_5[Math.floor(Math.random() * WORDS_5.length)].toUpperCase();
                const rows = [r0, r1, r2];
                const cols = [];
                let ok = true;
                for (const i of [0, 2, 4]) {
                    const pat = [rows[0][i], rows[1][i], rows[2][i]];
                    const matches = WORDS_5.filter(w => { const u = w.toUpperCase(); return u[0] === pat[0] && u[2] === pat[1] && u[4] === pat[2]; });
                    if (matches.length === 0) { ok = false; break; }
                    cols.push(matches[0].toUpperCase());
                }
                if (ok) return { rows, cols };
            }
            return { rows: WAFFLE_FALLBACK.rows, cols: WAFFLE_FALLBACK.cols };
        },
        render(container, mode) {
            const g = this;
            const puzzle = g.generatePuzzle();
            g.puzzle = puzzle;
            const sol = Array.from({ length: 5 }, () => Array(5).fill(''));
            for (let r = 0; r < 5; r++) { if (r % 2 === 0) { const w = puzzle.rows[r / 2]; for (let c = 0; c < 5; c++) sol[r][c] = w[c]; } }
            for (let c = 0; c < 5; c += 2) { const w = puzzle.cols[c / 2]; for (let r = 0; r < 5; r++) sol[r][c] = w[r]; }
            sol[1][1] = 'A'; sol[1][3] = 'E'; sol[3][1] = 'I'; sol[3][3] = 'O';
            g.solution = sol.map(r => [...r]);
            const cells = [];
            for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) { if ((r === 1 || r === 3) && (c === 1 || c === 3)) continue; cells.push({ r, c, letter: g.solution[r][c], locked: Math.random() < 0.3 }); }
            const unlocked = cells.filter(x => !x.locked);
            const letters = unlocked.map(x => x.letter);
            for (let i = letters.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [letters[i], letters[j]] = [letters[j], letters[i]]; }
            let idx = 0;
            for (const cell of unlocked) cell.letter = letters[idx++];
            g.grid = Array.from({ length: 5 }, () => Array(5).fill(null));
            for (const cell of cells) g.grid[cell.r][cell.c] = { letter: cell.letter, locked: cell.locked };
            g.swaps = 10; g.gameOver = false; g.selected = null;
            container.innerHTML = `
                <h3>🧇 Waffle — ${mode.toUpperCase()}</h3>
                <p>Swap letters to form 6 valid words — 3 rows and 3 columns. <b>Swaps left:</b> <span id="waffle-swaps">10</span></p>
                <div id="waffle-board" style="display:inline-block; margin:20px auto; padding:12px; background:var(--surface-color); border-radius:12px;"></div>
                <div id="waffle-status" style="margin:15px 0; font-weight:bold; min-height:24px;"></div>
                <button class="btn tutorial-btn" onclick="openGame('waffle','1-ai')">🔄 New Puzzle</button>`;
            g.drawBoard();
        },
        drawBoard() {
            const g = this;
            const board = document.getElementById('waffle-board'); if (!board) return;
            const lines = [];
            for (let r = 0; r < 5; r++) {
                const row = [];
                for (let c = 0; c < 5; c++) {
                    if ((r === 1 || r === 3) && (c === 1 || c === 3)) { row.push(`<div style="width:52px; height:52px;"></div>`); continue; }
                    const cell = g.grid[r][c];
                    const correct = cell.letter === g.solution[r][c];
                    const sel = g.selected && g.selected.r === r && g.selected.c === c;
                    const bg = cell.locked ? '#f59e0b' : (correct ? '#22c55e' : '#eab308');
                    const color = cell.locked ? '#1e1b4b' : '#fff';
                    row.push(`<div class="waffle-tile" onclick="GameEngines.waffle.click(${r},${c})" style="background:${bg}; color:${color}; outline:${sel ? '3px solid #38bdf8' : 'none'}; cursor:${cell.locked ? 'default' : 'pointer'};">${cell.letter}</div>`);
                }
                lines.push(`<div style="display:flex; gap:4px;">${row.join('')}</div>`);
            }
            board.innerHTML = lines.join('');
            const swapsEl = document.getElementById('waffle-swaps');
            if (swapsEl) swapsEl.textContent = g.swaps;
        },
        click(r, c) {
            const g = this;
            if (g.gameOver) return;
            const cell = g.grid[r][c];
            if (!cell || cell.locked) return;
            if (!g.selected) { g.selected = { r, c }; g.drawBoard(); return; }
            if (g.selected.r === r && g.selected.c === c) { g.selected = null; g.drawBoard(); return; }
            const a = g.grid[g.selected.r][g.selected.c], b = g.grid[r][c];
            if (a.locked || b.locked) { g.selected = null; g.drawBoard(); return; }
            [a.letter, b.letter] = [b.letter, a.letter];
            g.swaps--; g.selected = null;
            AudioFX.playCardSnap();
            g.drawBoard();
            g.checkWin();
        },
        checkWin() {
            const g = this;
            for (const r of [0, 2, 4]) { const w = g.grid[r].map(c => c.letter).join(''); if (!SCRABBLE_DICT.has(w.toLowerCase())) { setText('waffle-status', `${g.swaps} swaps left. Not all rows/cols valid.`, '#f59e0b'); return; } }
            for (const c of [0, 2, 4]) { const w = [0,1,2,3,4].map(r => g.grid[r][c].letter).join(''); if (!SCRABBLE_DICT.has(w.toLowerCase())) { setText('waffle-status', `${g.swaps} swaps left. Not all rows/cols valid.`, '#f59e0b'); return; } }
            g.gameOver = true;
            AudioFX.playWin();
            const bonus = g.swaps * 15;
            setText('waffle-status', `🎉 Waffle solved with ${g.swaps} swaps left! +${100 + bonus} Coins`, '#22c55e');
            finishGame(100 + bonus, 60, true);
        }
    },

    'scrabble': {
        BOARD_SIZE: 11, board: null, playerRack: [], aiRack: [], bag: [], turn: 'player', over: false, placed: [], selectedTileIdx: null,
        LETTER_VALUES: { A:1,B:3,C:3,D:2,E:1,F:4,G:2,H:4,I:1,J:8,K:5,L:1,M:3,N:1,O:1,P:3,Q:10,R:1,S:1,T:1,U:1,V:4,W:4,X:8,Y:4,Z:10 },
        buildBag() {
            const bag = [];
            const counts = { A:9,B:2,C:2,D:4,E:12,F:2,G:3,H:2,I:9,J:1,K:1,L:4,M:2,N:6,O:8,P:2,Q:1,R:6,S:4,T:6,U:4,V:2,W:2,X:1,Y:2,Z:1 };
            for (const [letter, count] of Object.entries(counts)) for (let i = 0; i < count; i++) bag.push(letter);
            return shuffle(bag);
        },
        drawTiles(n) { const tiles = []; for (let i = 0; i < n && this.bag.length > 0; i++) tiles.push(this.bag.pop()); return tiles; },
        render(container, mode) {
            const g = this;
            g.bag = g.buildBag();
            g.playerRack = g.drawTiles(7); g.aiRack = g.drawTiles(7);
            g.board = Array.from({ length: g.BOARD_SIZE }, () => Array(g.BOARD_SIZE).fill(null));
            g.turn = 'player'; g.over = false; g.placed = []; g.selectedTileIdx = null;
            container.innerHTML = `
                <h3>🔤 Scrabble — ${mode.toUpperCase()}</h3>
                <p>Play words from your rack. First word must cover the center. Later words must connect to existing letters.</p>
                <div style="display:flex; justify-content:center; margin:15px 0; overflow-x:auto;"><div id="scrabble-board" style="background:#0f172a; padding:6px; border-radius:8px;"></div></div>
                <div id="scrabble-rack" style="display:flex; gap:6px; justify-content:center; flex-wrap:wrap; margin:15px 0;"></div>
                <div style="display:flex; gap:10px; justify-content:center; margin-top:10px;">
                    <button class="btn primary-btn" id="scrabble-submit" onclick="GameEngines.scrabble.submitWord()">✅ Submit Word</button>
                    <button class="btn tutorial-btn" onclick="GameEngines.scrabble.clearPlacements()">❌ Clear</button>
                    <button class="btn tutorial-btn" onclick="GameEngines.scrabble.passTurn()">⏭ Pass</button>
                </div>
                <div id="scrabble-status" style="margin-top:15px; font-weight:bold; min-height:24px;"></div>`;
            g.drawBoard(); g.drawRack();
            setText('scrabble-status', 'Select a tile, then click a board cell to place it.');
        },
        drawBoard() {
            const g = this;
            const board = document.getElementById('scrabble-board'); if (!board) return;
            const CENTER = Math.floor(g.BOARD_SIZE / 2);
            const rows = [];
            for (let r = 0; r < g.BOARD_SIZE; r++) {
                const cells = [];
                for (let c = 0; c < g.BOARD_SIZE; c++) {
                    const tile = g.board[r][c];
                    const isCenter = r === CENTER && c === CENTER;
                    const pending = g.placed.find(p => p.r === r && p.c === c);
                    let bg = '#1e293b', color = '#fff';
                    if (tile) { bg = '#f59e0b'; color = '#1e1b4b'; }
                    else if (pending) { bg = '#38bdf8'; color = '#0f172a'; }
                    else if (isCenter) { bg = '#7c3aed'; }
                    const letter = tile || (pending ? pending.letter : '');
                    cells.push(`<div class="scrabble-cell" onclick="GameEngines.scrabble.clickCell(${r},${c})" style="background:${bg}; color:${color}; cursor:pointer;">${letter}</div>`);
                }
                rows.push(`<div style="display:flex; gap:2px;">${cells.join('')}</div>`);
            }
            board.innerHTML = rows.join('');
        },
        drawRack() {
            const g = this;
            const rack = document.getElementById('scrabble-rack'); if (!rack) return;
            rack.innerHTML = g.playerRack.map((letter, i) => {
                const used = g.placed.some(p => p.tileIdx === i);
                const sel = g.selectedTileIdx === i;
                return `<button class="scrabble-tile" onclick="GameEngines.scrabble.selectTile(${i})" style="opacity:${used ? 0.2 : 1}; outline:${sel ? '3px solid #38bdf8' : 'none'}; pointer-events:${used ? 'none' : 'auto'};"><div style="font-size:1.4rem; font-weight:900;">${letter}</div><div style="font-size:0.7rem;">${g.LETTER_VALUES[letter]}</div></button>`;
            }).join('');
        },
        selectTile(i) { const g = this; if (g.turn !== 'player' || g.over) return; g.selectedTileIdx = g.selectedTileIdx === i ? null : i; g.drawRack(); },
        clickCell(r, c) {
            const g = this;
            if (g.turn !== 'player' || g.over) return;
            if (g.board[r][c]) { setText('scrabble-status', 'That cell is already filled.', '#ef4444'); return; }
            const placedIdx = g.placed.findIndex(p => p.r === r && p.c === c);
            if (placedIdx >= 0) { const p = g.placed.splice(placedIdx, 1)[0]; g.drawBoard(); g.drawRack(); setText('scrabble-status', `Removed ${p.letter}.`); return; }
            if (g.selectedTileIdx === null) { setText('scrabble-status', 'Select a tile from your rack first.', '#f59e0b'); return; }
            const letter = g.playerRack[g.selectedTileIdx];
            g.placed.push({ r, c, letter, tileIdx: g.selectedTileIdx });
            g.selectedTileIdx = null;
            AudioFX.playCardSnap();
            g.drawBoard(); g.drawRack();
            setText('scrabble-status', `Placed ${letter}.`);
        },
        clearPlacements() { const g = this; g.placed = []; g.selectedTileIdx = null; g.drawBoard(); g.drawRack(); setText('scrabble-status', 'Cleared.'); },
        validatePlacement() {
            const g = this;
            if (g.placed.length === 0) return { ok: false, msg: 'Place at least one tile.' };
            const rows = new Set(g.placed.map(p => p.r)), cols = new Set(g.placed.map(p => p.c));
            if (rows.size > 1 && cols.size > 1) return { ok: false, msg: 'Tiles must be in one line.' };
            const isHorizontal = rows.size === 1;
            const cells = [...g.placed].sort((a, b) => isHorizontal ? a.c - b.c : a.r - b.r);
            const start = isHorizontal ? cells[0].c : cells[0].r, end = isHorizontal ? cells[cells.length - 1].c : cells[cells.length - 1].r;
            const lineLetters = [];
            for (let i = start; i <= end; i++) { const r = isHorizontal ? cells[0].r : i; const c = isHorizontal ? i : cells[0].c; const existing = g.board[r][c]; const pending = g.placed.find(p => p.r === r && p.c === c); if (existing) lineLetters.push(existing); else if (pending) lineLetters.push(pending.letter); else return { ok: false, msg: 'Gap in the word!' }; }
            const word = lineLetters.join('');
            if (word.length < 2) return { ok: false, msg: 'Word must be at least 2 letters.' };
            if (!SCRABBLE_DICT.has(word.toLowerCase())) return { ok: false, msg: `"${word}" is not in the dictionary.` };
            const CENTER = Math.floor(g.BOARD_SIZE / 2);
            const isFirstWord = g.board.flat().every(x => x === null);
            if (isFirstWord) { if (!g.placed.some(p => p.r === CENTER && p.c === CENTER)) return { ok: false, msg: 'First word must cover the center.' }; }
            else {
                let touches = false;
                for (const p of g.placed) { for (const [dr, dc] of [[-1,0],[1,0],[0,-1],[0,1]]) { const nr = p.r + dr, nc = p.c + dc; if (nr >= 0 && nr < g.BOARD_SIZE && nc >= 0 && nc < g.BOARD_SIZE && g.board[nr][nc]) { touches = true; break; } } if (touches) break; }
                if (!touches) return { ok: false, msg: 'New word must touch existing tiles.' };
            }
            return { ok: true, word, isHorizontal };
        },
        submitWord() {
            const g = this;
            if (g.turn !== 'player' || g.over) return;
            const result = g.validatePlacement();
            if (!result.ok) { setText('scrabble-status', '❌ ' + result.msg, '#ef4444'); return; }
            let score = 0;
            for (const p of g.placed) score += g.LETTER_VALUES[p.letter];
            if (g.placed.length === 7) score += 50;
            for (const p of g.placed) { g.board[p.r][p.c] = p.letter; g.playerRack[p.tileIdx] = null; }
            g.playerRack = g.playerRack.filter(x => x !== null);
            g.playerRack.push(...g.drawTiles(7 - g.playerRack.length));
            g.placed = []; g.selectedTileIdx = null;
            g.drawBoard(); g.drawRack();
            state.coins += score; saveGameData(); updateStatsUI();
            AudioFX.playWin();
            setText('scrabble-status', `✅ Played "${result.word}" for ${score} points! (+${score} coins)`, '#22c55e');
            g.turn = 'ai';
            setTimeout(() => g.aiTurn(), 800);
        },
        passTurn() { const g = this; if (g.turn !== 'player' || g.over) return; g.placed = []; g.selectedTileIdx = null; g.drawBoard(); g.drawRack(); setText('scrabble-status', 'Passed. AI thinking...'); g.turn = 'ai'; setTimeout(() => g.aiTurn(), 500); },
        aiTurn() {
            const g = this;
            if (g.over) return;
            const isFirstWord = g.board.flat().every(x => x === null);
            const CENTER = Math.floor(g.BOARD_SIZE / 2);
            let bestPlay = null, bestScore = 0;
            for (const word of SCRABBLE_DICT) {
                const w = word.toUpperCase(); if (w.length < 2) continue;
                const testRack = [...g.aiRack]; let canForm = true;
                for (const letter of w) { const idx = testRack.indexOf(letter); if (idx === -1) { canForm = false; break; } testRack.splice(idx, 1); }
                if (!canForm) continue;
                for (const horizontal of [true, false]) for (let r = 0; r < g.BOARD_SIZE; r++) for (let c = 0; c < g.BOARD_SIZE; c++) {
                    if (horizontal && c + w.length > g.BOARD_SIZE) continue;
                    if (!horizontal && r + w.length > g.BOARD_SIZE) continue;
                    let fits = true, coversCenter = false;
                    for (let i = 0; i < w.length; i++) { const rr = horizontal ? r : r + i; const cc = horizontal ? c + i : c; if (g.board[rr][cc]) { fits = false; break; } if (rr === CENTER && cc === CENTER) coversCenter = true; }
                    if (!fits) continue;
                    if (isFirstWord && !coversCenter) continue;
                    if (!isFirstWord) { let touches = false; for (let i = 0; i < w.length; i++) { const rr = horizontal ? r : r + i; const cc = horizontal ? c + i : c; for (const [dr, dc] of [[-1,0],[1,0],[0,-1],[0,1]]) { const nr = rr + dr, nc = cc + dc; if (nr >= 0 && nr < g.BOARD_SIZE && nc >= 0 && nc < g.BOARD_SIZE && g.board[nr][nc]) { touches = true; break; } } if (touches) break; } if (!touches) continue; }
                    let score = 0; for (const letter of w) score += g.LETTER_VALUES[letter];
                    if (score > bestScore) { bestScore = score; bestPlay = { word: w, r, c, horizontal }; }
                }
            }
            if (!bestPlay) { setText('scrabble-status', 'AI passes. Your turn!'); g.turn = 'player'; return; }
            for (let i = 0; i < bestPlay.word.length; i++) { const rr = bestPlay.horizontal ? bestPlay.r : bestPlay.r + i; const cc = bestPlay.horizontal ? bestPlay.c + i : bestPlay.c; g.board[rr][cc] = bestPlay.word[i]; }
            const newRack = [...g.aiRack];
            for (let i = bestPlay.word.length - 1; i >= 0; i--) { const idx = newRack.indexOf(bestPlay.word[i]); if (idx >= 0) newRack.splice(idx, 1); }
            g.aiRack = newRack;
            g.aiRack.push(...g.drawTiles(7 - g.aiRack.length));
            g.drawBoard();
            AudioFX.playClick();
            setText('scrabble-status', `🤖 AI played "${bestPlay.word}" for ${bestScore} points. Your turn!`);
            g.turn = 'player';
        }
    },

    'hangman': {
        word: '', guessed: [], wrong: 0, maxWrong: 6, gameOver: false,
        render(container, mode) {
            const g = this;
            const allWords = [...WORDS_5, ...WORDS_6_7].filter(w => w.length >= 4 && w.length <= 8);
            g.word = allWords[Math.floor(Math.random() * allWords.length)].toUpperCase();
            g.guessed = []; g.wrong = 0; g.gameOver = false;
            container.innerHTML = `
                <h3>🎯 Hangman — ${mode.toUpperCase()}</h3>
                <p>Guess the ${g.word.length}-letter word. You have ${g.maxWrong} wrong guesses!</p>
                <div style="display:flex; gap:20px; justify-content:center; align-items:center; margin:20px 0; flex-wrap:wrap;">
                    <div id="hangman-drawing" style="width:180px; height:220px; background:var(--surface-color); border-radius:8px; padding:10px;"></div>
                    <div style="text-align:left;"><p>Wrong guesses: <b id="hangman-wrong" style="color:#ef4444;">0/${g.maxWrong}</b></p><div id="hangman-word" style="font-family:monospace; font-size:1.6rem; letter-spacing:6px; font-weight:bold; margin:10px 0;"></div></div>
                </div>
                <div id="hangman-keyboard" style="max-width:520px; margin:0 auto;"></div>
                <div id="hangman-status" style="margin:15px 0; font-weight:bold; min-height:24px;"></div>`;
            g.drawHangman(); g.drawWord(); g.drawKeyboard(); g.bindKeyboard();
        },
        drawHangman() {
            const g = this;
            const el = document.getElementById('hangman-drawing'); if (!el) return;
            const parts = [];
            parts.push(`<line x1="20" y1="200" x2="160" y2="200" stroke="#94a3b8" stroke-width="4"/>`);
            if (g.wrong >= 1) parts.push(`<line x1="50" y1="200" x2="50" y2="20" stroke="#94a3b8" stroke-width="4"/>`);
            if (g.wrong >= 2) parts.push(`<line x1="50" y1="20" x2="120" y2="20" stroke="#94a3b8" stroke-width="4"/>`);
            if (g.wrong >= 3) parts.push(`<line x1="120" y1="20" x2="120" y2="50" stroke="#94a3b8" stroke-width="3"/>`);
            if (g.wrong >= 4) parts.push(`<circle cx="120" cy="65" r="15" fill="none" stroke="#f59e0b" stroke-width="3"/>`);
            if (g.wrong >= 5) parts.push(`<line x1="120" y1="80" x2="120" y2="140" stroke="#f59e0b" stroke-width="3"/>`);
            if (g.wrong >= 6) { parts.push(`<line x1="120" y1="95" x2="100" y2="115" stroke="#f59e0b" stroke-width="3"/>`); parts.push(`<line x1="120" y1="95" x2="140" y2="115" stroke="#f59e0b" stroke-width="3"/>`); parts.push(`<line x1="120" y1="140" x2="105" y2="170" stroke="#f59e0b" stroke-width="3"/>`); parts.push(`<line x1="120" y1="140" x2="135" y2="170" stroke="#f59e0b" stroke-width="3"/>`); }
            el.innerHTML = `<svg viewBox="0 0 180 220" width="100%" height="100%">${parts.join('')}</svg>`;
            const wEl = document.getElementById('hangman-wrong');
            if (wEl) wEl.textContent = `${g.wrong}/${g.maxWrong}`;
        },
        drawWord() {
            const g = this;
            const el = document.getElementById('hangman-word'); if (!el) return;
            el.innerHTML = g.word.split('').map(l => { const show = g.guessed.includes(l) || g.gameOver; return `<span style="display:inline-block; border-bottom:3px solid var(--text-muted); min-width:28px; text-align:center; padding:0 2px; color:${show ? 'var(--accent-cyan)' : 'transparent'};">${show ? l : '_'}</span>`; }).join('');
        },
        drawKeyboard() {
            const g = this;
            const el = document.getElementById('hangman-keyboard'); if (!el) return;
            const rows = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'];
            el.innerHTML = rows.map(row => `<div style="display:flex; gap:5px; justify-content:center; margin-bottom:6px;">${[...row].map(l => { const used = g.guessed.includes(l); const correct = g.word.includes(l); let bg = 'var(--surface-color)'; if (used) bg = correct ? '#22c55e' : '#475569'; return `<button class="wordle-key" style="background:${bg}; min-width:34px; opacity:${used ? 0.65 : 1};" onclick="GameEngines.hangman.guess('${l}')" ${used ? 'disabled' : ''}>${l}</button>`; }).join('')}</div>`).join('');
        },
        bindKeyboard() {
            const g = this;
            g._handler = (e) => { if (g.gameOver || GameSession.currentGame !== 'hangman') return; if (/^[a-zA-Z]$/.test(e.key)) g.guess(e.key.toUpperCase()); };
            document.removeEventListener('keydown', g._handler);
            document.addEventListener('keydown', g._handler);
        },
        guess(letter) {
            const g = this;
            if (g.gameOver || g.guessed.includes(letter)) return;
            g.guessed.push(letter);
            if (!g.word.includes(letter)) { g.wrong++; AudioFX.playClick(); } else AudioFX.playCardSnap();
            g.drawHangman(); g.drawWord(); g.drawKeyboard();
            const solved = g.word.split('').every(l => g.guessed.includes(l));
            if (solved) { g.gameOver = true; AudioFX.playWin(); const coins = 60 + (g.maxWrong - g.wrong) * 15; setText('hangman-status', `🎉 Solved! +${coins} Coins`, '#22c55e'); finishGame(coins, 50, true); return; }
            if (g.wrong >= g.maxWrong) { g.gameOver = true; AudioFX.playClick(); setText('hangman-status', `😢 Out of guesses! The word was ${g.word}.`, '#ef4444'); finishGame(0, 10, false); return; }
            setText('hangman-status', `${g.maxWrong - g.wrong} wrong guesses left.`);
        }
    },

    'boggle': {
        grid: null, foundWords: [], currentPath: [], targetScore: 30, over: false,
        buildGrid() { const letters = 'ABCDEFGHIJKLMNOPRSTUVWXYZEEEEAAAIIIOOO'; return Array.from({ length: 4 }, () => Array.from({ length: 4 }, () => letters[Math.floor(Math.random() * letters.length)])); },
        render(container, mode) {
            const g = this;
            g.grid = g.buildGrid();
            g.foundWords = []; g.currentPath = []; g.over = false;
            container.innerHTML = `
                <h3>🎰 Boggle — ${mode.toUpperCase()}</h3>
                <p>Trace words by clicking adjacent letters. Words ≥3 letters. Reach ${g.targetScore} points to win!</p>
                <p>Score: <b id="bg-score" style="color:var(--accent-cyan);">0</b>/${g.targetScore}</p>
                <div id="bg-grid" style="display:inline-grid; grid-template-columns:repeat(4,60px); gap:6px; margin:20px auto;"></div>
                <div style="margin:15px 0;"><b>Current word:</b> <span id="bg-current" style="font-size:1.4rem; color:var(--accent-gold); letter-spacing:3px;"></span></div>
                <div style="display:flex; gap:10px; justify-content:center;"><button class="btn primary-btn" onclick="GameEngines.boggle.submitWord()">✅ Submit Word</button><button class="btn tutorial-btn" onclick="GameEngines.boggle.clearPath()">↻ Clear</button></div>
                <div id="bg-found" style="margin-top:15px; max-width:500px; margin-left:auto; margin-right:auto; text-align:left;"></div>
                <div id="bg-status" style="margin-top:15px; font-weight:bold; min-height:24px;"></div>`;
            g.refresh();
        },
        refresh() {
            const g = this;
            const grid = document.getElementById('bg-grid');
            grid.innerHTML = g.grid.map((row, r) => row.map((l, c) => {
                const inPath = g.currentPath.some(p => p.r === r && p.c === c);
                return `<div class="boggle-cell" onclick="GameEngines.boggle.clickLetter(${r},${c})" style="width:60px; height:60px; background:${inPath ? '#22c55e' : 'var(--surface-color)'}; color:${inPath ? '#fff' : 'var(--text-main)'}; border:2px solid var(--border-color); border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:1.6rem; font-weight:900; cursor:pointer;">${l}</div>`;
            }).join('')).join('');
            document.getElementById('bg-current').textContent = g.currentPath.map(p => g.grid[p.r][p.c]).join('');
            document.getElementById('bg-score').textContent = g.foundWords.reduce((s, w) => s + w.length, 0);
            document.getElementById('bg-found').innerHTML = g.foundWords.map(w => `<span style="display:inline-block; background:var(--surface-color); padding:4px 10px; border-radius:6px; margin:3px;">${w.toUpperCase()}</span>`).join('');
        },
        clickLetter(r, c) {
            const g = this;
            if (g.over) return;
            if (g.currentPath.length > 0) { const last = g.currentPath[g.currentPath.length - 1]; const dr = Math.abs(r - last.r), dc = Math.abs(c - last.c); if ((dr === 0 && dc === 0) || dr > 1 || dc > 1 || g.currentPath.some(p => p.r === r && p.c === c)) return; }
            g.currentPath.push({ r, c });
            AudioFX.playClick(); g.refresh();
        },
        clearPath() { this.currentPath = []; this.refresh(); },
        submitWord() {
            const g = this;
            const word = g.currentPath.map(p => g.grid[p.r][p.c]).join('').toLowerCase();
            if (word.length < 3) { setText('bg-status', 'Word must be at least 3 letters.', '#ef4444'); return; }
            if (g.foundWords.includes(word)) { setText('bg-status', 'Already found!', '#f59e0b'); return; }
            if (!SCRABBLE_DICT.has(word)) { setText('bg-status', `"${word.toUpperCase()}" not in dictionary.`, '#ef4444'); return; }
            g.foundWords.push(word);
            AudioFX.playWin();
            setText('bg-status', `✅ +${word.length} points for "${word.toUpperCase()}"`, '#22c55e');
            g.currentPath = [];
            g.refresh();
            const score = g.foundWords.reduce((s, w) => s + w.length, 0);
            if (score >= g.targetScore) { g.over = true; AudioFX.playWin(); setText('bg-status', `🎉 Reached ${score} points! +100 Coins`, '#22c55e'); finishGame(100, 70, true); }
        }
    }
});
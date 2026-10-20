Object.assign(GameEngines, {

    'snake': {
        snake: [], dir: {x: 1, y: 0}, nextDir: {x: 1, y: 0}, food: null, cellSize: 20, cols: 20, rows: 20, score: 0, over: false, speed: 150, canvas: null, ctx: null,
        render(container, mode) {
            const g = this;
            g.snake = [{x: 10, y: 10}, {x: 9, y: 10}, {x: 8, y: 10}];
            g.dir = {x: 1, y: 0}; g.nextDir = {x: 1, y: 0}; g.score = 0; g.over = false; g.speed = 150;
            g.placeFood();
            container.innerHTML = `
                <h3>🐍 Snake — ${mode.toUpperCase()}</h3>
                <p>Arrow keys to move. Eat apples, avoid walls and your own tail!</p>
                <p>Score: <b id="snake-score" style="color:var(--accent-cyan);">0</b> · Length: <b id="snake-len">3</b></p>
                <div style="display:flex; justify-content:center; margin:15px 0;"><canvas id="snake-canvas" width="${g.cols * g.cellSize}" height="${g.rows * g.cellSize}" style="background:#0f172a; border:2px solid var(--border-color); border-radius:8px; max-width:100%;"></canvas></div>
                <div id="snake-status" style="margin-top:15px; font-weight:bold; min-height:24px;"></div>`;
            g.canvas = document.getElementById('snake-canvas'); g.ctx = g.canvas.getContext('2d');
            g.bindKeys(); g.draw(); g.startTick();
        },
        startTick() { const g = this; const tick = () => { if (!document.getElementById('snake-canvas') || g.over) return; g.step(); g.draw(); GameSession.setTimer(tick, g.speed); }; GameSession.setTimer(tick, g.speed); },
        bindKeys() {
            const g = this;
            g._keyHandler = (e) => {
                if (g.over || !document.getElementById('snake-canvas')) return;
                if (e.key === 'ArrowUp' && g.dir.y !== 1) { e.preventDefault(); g.nextDir = {x: 0, y: -1}; }
                else if (e.key === 'ArrowDown' && g.dir.y !== -1) { e.preventDefault(); g.nextDir = {x: 0, y: 1}; }
                else if (e.key === 'ArrowLeft' && g.dir.x !== 1) { e.preventDefault(); g.nextDir = {x: -1, y: 0}; }
                else if (e.key === 'ArrowRight' && g.dir.x !== -1) { e.preventDefault(); g.nextDir = {x: 1, y: 0}; }
            };
            document.removeEventListener('keydown', g._keyHandler);
            document.addEventListener('keydown', g._keyHandler);
        },
        placeFood() { const g = this; let t = 0; while (t++ < 500) { const f = {x: Math.floor(Math.random() * g.cols), y: Math.floor(Math.random() * g.rows)}; if (!g.snake.some(s => s.x === f.x && s.y === f.y)) { g.food = f; return; } } },
        step() {
            const g = this;
            g.dir = g.nextDir;
            const head = {x: g.snake[0].x + g.dir.x, y: g.snake[0].y + g.dir.y};
            if (head.x < 0 || head.x >= g.cols || head.y < 0 || head.y >= g.rows || g.snake.some(s => s.x === head.x && s.y === head.y)) { g.gameOver(); return; }
            g.snake.unshift(head);
            if (head.x === g.food.x && head.y === g.food.y) { g.score += 10; AudioFX.playWin(); const sEl = document.getElementById('snake-score'), lEl = document.getElementById('snake-len'); if (sEl) sEl.textContent = g.score; if (lEl) lEl.textContent = g.snake.length; if (g.speed > 60) g.speed -= 3; g.placeFood(); }
            else g.snake.pop();
        },
        draw() {
            const g = this; if (!g.ctx) return;
            g.ctx.clearRect(0, 0, g.canvas.width, g.canvas.height);
            g.ctx.fillStyle = '#ef4444'; g.ctx.beginPath(); g.ctx.arc(g.food.x * g.cellSize + g.cellSize/2, g.food.y * g.cellSize + g.cellSize/2, g.cellSize/2 - 2, 0, Math.PI * 2); g.ctx.fill();
            for (let i = 0; i < g.snake.length; i++) { const s = g.snake[i]; g.ctx.fillStyle = i === 0 ? '#38bdf8' : '#0ea5e9'; g.ctx.fillRect(s.x * g.cellSize + 1, s.y * g.cellSize + 1, g.cellSize - 2, g.cellSize - 2); }
        },
        gameOver() { this.over = true; AudioFX.playClick(); const won = this.score >= 100; setText('snake-status', `💥 Crashed! Score: ${this.score}. +${this.score} Coins`, '#ef4444'); finishGame(this.score, Math.floor(this.score / 2), won); }
    },

    'tetris': {
        COLS: 10, ROWS: 20, BLOCK: 24, board: null, piece: null, nextPiece: null, score: 0, level: 1, lines: 0, over: false, dropInterval: 800, canvas: null, nextCanvas: null, ctx: null, nextCtx: null,
        SHAPES: { I: [[1,1,1,1]], O: [[1,1],[1,1]], T: [[0,1,0],[1,1,1]], S: [[0,1,1],[1,1,0]], Z: [[1,1,0],[0,1,1]], J: [[1,0,0],[1,1,1]], L: [[0,0,1],[1,1,1]] },
        COLORS: { I: '#38bdf8', O: '#fbbf24', T: '#a855f7', S: '#22c55e', Z: '#ef4444', J: '#3b82f6', L: '#f97316' },
        render(container, mode) {
            const g = this;
            g.board = Array.from({length: g.ROWS}, () => Array(g.COLS).fill(null));
            g.score = 0; g.level = 1; g.lines = 0; g.over = false; g.dropInterval = 800; g.nextPiece = null;
            container.innerHTML = `
                <h3>🧱 Tetris — ${mode.toUpperCase()}</h3>
                <p>← → move · ↑ rotate · ↓ soft drop · Space hard drop</p>
                <div style="display:flex; gap:20px; justify-content:center; align-items:flex-start; flex-wrap:wrap; margin:15px 0;">
                    <canvas id="tetris-canvas" width="${g.COLS * g.BLOCK}" height="${g.ROWS * g.BLOCK}" style="background:#0f172a; border:2px solid var(--border-color); border-radius:8px;"></canvas>
                    <div><div style="background:var(--surface-color); padding:10px; border-radius:8px; text-align:center;"><div style="font-size:0.85rem; color:var(--text-muted); margin-bottom:4px;">NEXT</div><canvas id="tetris-next" width="80" height="80" style="background:#0f172a; border-radius:4px;"></canvas></div><p style="margin-top:15px;">Score: <b id="tetris-score" style="color:var(--accent-cyan);">0</b></p><p>Level: <b id="tetris-level">1</b></p><p>Lines: <b id="tetris-lines">0</b></p></div>
                </div>
                <div id="tetris-status" style="margin-top:15px; font-weight:bold; min-height:24px;"></div>`;
            g.canvas = document.getElementById('tetris-canvas'); g.ctx = g.canvas.getContext('2d');
            g.nextCanvas = document.getElementById('tetris-next'); g.nextCtx = g.nextCanvas.getContext('2d');
            g.spawn(); g.spawnNext(); g.bindKeys(); g.draw(); g.startDrop();
        },
        startDrop() { const g = this; const tick = () => { if (!document.getElementById('tetris-canvas') || g.over) return; g.step(); GameSession.setTimer(tick, g.dropInterval); }; GameSession.setTimer(tick, g.dropInterval); },
        bindKeys() {
            const g = this;
            g._keyHandler = (e) => {
                if (g.over || !document.getElementById('tetris-canvas')) return;
                if (e.key === 'ArrowLeft') { e.preventDefault(); g.move(-1, 0); }
                else if (e.key === 'ArrowRight') { e.preventDefault(); g.move(1, 0); }
                else if (e.key === 'ArrowDown') { e.preventDefault(); g.move(0, 1); }
                else if (e.key === 'ArrowUp') { e.preventDefault(); g.rotate(); }
                else if (e.key === ' ') { e.preventDefault(); g.hardDrop(); }
            };
            document.removeEventListener('keydown', g._keyHandler);
            document.addEventListener('keydown', g._keyHandler);
        },
        spawn() { const g = this; const type = g.nextPiece ? g.nextPiece.type : g.randomType(); g.piece = { type, cells: g.SHAPES[type].map(r => [...r]), x: Math.floor((g.COLS - g.SHAPES[type][0].length) / 2), y: 0, color: g.COLORS[type] }; if (g.collides(g.piece)) g.gameOver(); },
        spawnNext() { const g = this; const type = g.randomType(); g.nextPiece = { type, color: g.COLORS[type] }; g.drawNext(); },
        randomType() { const types = Object.keys(this.SHAPES); return types[Math.floor(Math.random() * types.length)]; },
        collides(piece, ox = 0, oy = 0) {
            const g = this;
            for (let r = 0; r < piece.cells.length; r++) for (let c = 0; c < piece.cells[r].length; c++) { if (!piece.cells[r][c]) continue; const x = piece.x + c + ox, y = piece.y + r + oy; if (x < 0 || x >= g.COLS || y >= g.ROWS) return true; if (y >= 0 && g.board[y][x]) return true; }
            return false;
        },
        move(dx, dy) { const g = this; if (!g.collides(g.piece, dx, dy)) { g.piece.x += dx; g.piece.y += dy; g.draw(); } else if (dy > 0) g.lockPiece(); },
        rotate() { const g = this; const rotated = g.piece.cells[0].map((_, i) => g.piece.cells.map(row => row[i]).reverse()); const test = { ...g.piece, cells: rotated }; if (!g.collides(test)) { g.piece.cells = rotated; g.draw(); } },
        step() { const g = this; if (!g.collides(g.piece, 0, 1)) { g.piece.y += 1; g.draw(); } else g.lockPiece(); },
        hardDrop() { const g = this; while (!g.collides(g.piece, 0, 1)) g.piece.y++; g.lockPiece(); },
        lockPiece() { const g = this; for (let r = 0; r < g.piece.cells.length; r++) for (let c = 0; c < g.piece.cells[r].length; c++) { if (g.piece.cells[r][c]) { const y = g.piece.y + r, x = g.piece.x + c; if (y >= 0) g.board[y][x] = g.piece.color; } } g.checkLines(); AudioFX.playCardSnap(); g.spawn(); g.spawnNext(); g.draw(); },
        checkLines() {
            const g = this; let cleared = 0;
            for (let r = g.ROWS - 1; r >= 0; r--) if (g.board[r].every(c => c)) { g.board.splice(r, 1); g.board.unshift(Array(g.COLS).fill(null)); cleared++; r++; }
            if (cleared > 0) { const pts = [0, 100, 300, 500, 800][cleared] * g.level; g.score += pts; g.lines += cleared; g.level = Math.floor(g.lines / 10) + 1; g.dropInterval = Math.max(100, 800 - (g.level - 1) * 70); const s = document.getElementById('tetris-score'); if (s) s.textContent = g.score; const l = document.getElementById('tetris-level'); if (l) l.textContent = g.level; const ln = document.getElementById('tetris-lines'); if (ln) ln.textContent = g.lines; AudioFX.playWin(); }
        },
        draw() {
            const g = this; if (!g.ctx) return;
            g.ctx.clearRect(0, 0, g.canvas.width, g.canvas.height);
            g.ctx.strokeStyle = '#1e293b'; g.ctx.lineWidth = 1;
            for (let i = 0; i <= g.COLS; i++) { g.ctx.beginPath(); g.ctx.moveTo(i * g.BLOCK, 0); g.ctx.lineTo(i * g.BLOCK, g.canvas.height); g.ctx.stroke(); }
            for (let i = 0; i <= g.ROWS; i++) { g.ctx.beginPath(); g.ctx.moveTo(0, i * g.BLOCK); g.ctx.lineTo(g.canvas.width, i * g.BLOCK); g.ctx.stroke(); }
            for (let r = 0; r < g.ROWS; r++) for (let c = 0; c < g.COLS; c++) if (g.board[r][c]) g.drawBlock(g.ctx, c * g.BLOCK, r * g.BLOCK, g.board[r][c]);
            if (g.piece) for (let r = 0; r < g.piece.cells.length; r++) for (let c = 0; c < g.piece.cells[r].length; c++) if (g.piece.cells[r][c]) g.drawBlock(g.ctx, (g.piece.x + c) * g.BLOCK, (g.piece.y + r) * g.BLOCK, g.piece.color);
        },
        drawBlock(ctx, x, y, color) { const B = this.BLOCK; ctx.fillStyle = color; ctx.fillRect(x + 1, y + 1, B - 2, B - 2); ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.fillRect(x + 1, y + 1, B - 2, 3); ctx.fillRect(x + 1, y + 1, 3, B - 2); },
        drawNext() {
            const g = this; if (!g.nextCtx || !g.nextPiece) return;
            g.nextCtx.clearRect(0, 0, 80, 80);
            const shape = g.SHAPES[g.nextPiece.type], size = 18;
            const ox = (80 - shape[0].length * size) / 2, oy = (80 - shape.length * size) / 2;
            for (let r = 0; r < shape.length; r++) for (let c = 0; c < shape[r].length; c++) if (shape[r][c]) { g.nextCtx.fillStyle = g.nextPiece.color; g.nextCtx.fillRect(ox + c * size + 1, oy + r * size + 1, size - 2, size - 2); }
        },
        gameOver() { this.over = true; AudioFX.playClick(); const won = this.score >= 500; setText('tetris-status', `💥 Game over! Score: ${this.score}. +${Math.floor(this.score / 5)} Coins`, '#ef4444'); finishGame(Math.floor(this.score / 5), Math.floor(this.score / 20), won); }
    },

    'asteroids': {
        W: 600, H: 480, ship: null, asteroids: [], bullets: [], lives: 3, score: 0, level: 1, over: false, keys: {}, canvas: null, ctx: null, lastTime: 0,
        render(container, mode) {
            const g = this;
            g.ship = { x: g.W/2, y: g.H/2, vx: 0, vy: 0, angle: -Math.PI/2, radius: 12 };
            g.asteroids = []; g.bullets = []; g.lives = 3; g.score = 0; g.level = 1; g.over = false; g.keys = {};
            g.spawnAsteroids(3);
            container.innerHTML = `
                <h3>🚀 Asteroids — ${mode.toUpperCase()}</h3>
                <p>← → rotate · ↑ thrust · Space fire. Destroy all asteroids!</p>
                <p>Lives: <b id="ast-lives" style="color:#ef4444;">❤❤❤</b> · Score: <b id="ast-score" style="color:var(--accent-cyan);">0</b> · Level: <b id="ast-level">1</b></p>
                <div style="display:flex; justify-content:center; margin:15px 0;"><canvas id="ast-canvas" width="${g.W}" height="${g.H}" style="background:#000; border:2px solid var(--border-color); border-radius:8px; max-width:100%;"></canvas></div>
                <div id="ast-status" style="margin-top:15px; font-weight:bold; min-height:24px;"></div>`;
            g.canvas = document.getElementById('ast-canvas'); g.ctx = g.canvas.getContext('2d');
            g.bindKeys(); g.lastTime = performance.now(); g.startLoop();
        },
        startLoop() { const g = this; const step = (t) => { if (!document.getElementById('ast-canvas')) return; const dt = Math.min(0.05, (t - g.lastTime) / 1000); g.lastTime = t; if (!g.over) g.update(dt); g.draw(); requestAnimationFrame(step); }; requestAnimationFrame(step); },
        bindKeys() {
            const g = this;
            g._down = (e) => { if (!document.getElementById('ast-canvas') || g.over) return; g.keys[e.key] = true; if (e.key === ' ') { e.preventDefault(); g.fire(); } };
            g._up = (e) => { g.keys[e.key] = false; };
            document.removeEventListener('keydown', g._down); document.removeEventListener('keyup', g._up);
            document.addEventListener('keydown', g._down); document.addEventListener('keyup', g._up);
        },
        spawnAsteroids(n) {
            const g = this;
            for (let i = 0; i < n; i++) {
                let x, y, tries = 0;
                do { x = Math.random() * g.W; y = Math.random() * g.H; tries++; } while (Math.hypot(x - g.ship.x, y - g.ship.y) < 120 && tries < 100);
                g.asteroids.push({ x, y, size: 3, radius: 30, vx: (Math.random() - 0.5) * 60, vy: (Math.random() - 0.5) * 60, angle: Math.random() * Math.PI * 2, spin: (Math.random() - 0.5) * 2, shape: Array.from({length: 10}, () => 0.7 + Math.random() * 0.4) });
            }
        },
        update(dt) {
            const g = this, s = g.ship;
            if (g.keys['ArrowLeft']) s.angle -= 3 * dt;
            if (g.keys['ArrowRight']) s.angle += 3 * dt;
            if (g.keys['ArrowUp']) { s.vx += Math.cos(s.angle) * 200 * dt; s.vy += Math.sin(s.angle) * 200 * dt; }
            s.vx *= 0.99; s.vy *= 0.99;
            s.x += s.vx * dt; s.y += s.vy * dt;
            if (s.x < 0) s.x = g.W; if (s.x > g.W) s.x = 0;
            if (s.y < 0) s.y = g.H; if (s.y > g.H) s.y = 0;
            for (const a of g.asteroids) {
                a.x += a.vx * dt; a.y += a.vy * dt; a.angle += a.spin * dt;
                if (a.x < 0) a.x = g.W; if (a.x > g.W) a.x = 0;
                if (a.y < 0) a.y = g.H; if (a.y > g.H) a.y = 0;
                if (Math.hypot(a.x - s.x, a.y - s.y) < a.radius + s.radius - 4) { g.hitShip(); return; }
            }
            for (let i = g.bullets.length - 1; i >= 0; i--) {
                const b = g.bullets[i];
                b.x += b.vx * dt; b.y += b.vy * dt; b.life -= dt;
                if (b.life <= 0 || b.x < 0 || b.x > g.W || b.y < 0 || b.y > g.H) { g.bullets.splice(i, 1); continue; }
                for (let j = g.asteroids.length - 1; j >= 0; j--) {
                    const a = g.asteroids[j];
                    if (Math.hypot(a.x - b.x, a.y - b.y) < a.radius) {
                        g.bullets.splice(i, 1); g.asteroids.splice(j, 1);
                        g.score += a.size * 20; const sEl = document.getElementById('ast-score'); if (sEl) sEl.textContent = g.score;
                        AudioFX.playWin();
                        if (a.size > 1) for (let k = 0; k < 2; k++) g.asteroids.push({ x: a.x, y: a.y, size: a.size - 1, radius: 15 + (a.size - 1) * 5, vx: (Math.random() - 0.5) * 100, vy: (Math.random() - 0.5) * 100, angle: Math.random() * Math.PI * 2, spin: (Math.random() - 0.5) * 3, shape: Array.from({length: 10}, () => 0.7 + Math.random() * 0.4) });
                        break;
                    }
                }
            }
            if (g.asteroids.length === 0) { g.level++; const lEl = document.getElementById('ast-level'); if (lEl) lEl.textContent = g.level; g.spawnAsteroids(2 + g.level); }
        },
        fire() { const g = this; if (g.over) return; const s = g.ship; g.bullets.push({ x: s.x + Math.cos(s.angle) * s.radius, y: s.y + Math.sin(s.angle) * s.radius, vx: Math.cos(s.angle) * 400, vy: Math.sin(s.angle) * 400, life: 1.2 }); AudioFX.playCardSnap(); },
        hitShip() { const g = this; g.lives--; const lEl = document.getElementById('ast-lives'); if (lEl) lEl.textContent = '❤'.repeat(Math.max(0, g.lives)) || '💀'; AudioFX.playClick(); if (g.lives <= 0) { g.gameOver(); return; } g.ship.x = g.W/2; g.ship.y = g.H/2; g.ship.vx = 0; g.ship.vy = 0; },
        draw() {
            const g = this; if (!g.ctx) return;
            g.ctx.fillStyle = '#000'; g.ctx.fillRect(0, 0, g.W, g.H);
            g.ctx.strokeStyle = '#94a3b8'; g.ctx.lineWidth = 2;
            for (const a of g.asteroids) { g.ctx.save(); g.ctx.translate(a.x, a.y); g.ctx.rotate(a.angle); g.ctx.beginPath(); for (let i = 0; i < 10; i++) { const ang = (i / 10) * Math.PI * 2; const r = a.radius * a.shape[i]; const px = Math.cos(ang) * r, py = Math.sin(ang) * r; if (i === 0) g.ctx.moveTo(px, py); else g.ctx.lineTo(px, py); } g.ctx.closePath(); g.ctx.stroke(); g.ctx.restore(); }
            g.ctx.fillStyle = '#fbbf24'; for (const b of g.bullets) { g.ctx.beginPath(); g.ctx.arc(b.x, b.y, 2, 0, Math.PI * 2); g.ctx.fill(); }
            g.ctx.save(); g.ctx.translate(g.ship.x, g.ship.y); g.ctx.rotate(g.ship.angle); g.ctx.strokeStyle = '#38bdf8'; g.ctx.lineWidth = 2; g.ctx.beginPath(); g.ctx.moveTo(15, 0); g.ctx.lineTo(-10, -10); g.ctx.lineTo(-5, 0); g.ctx.lineTo(-10, 10); g.ctx.closePath(); g.ctx.stroke(); g.ctx.restore();
        },
        gameOver() { this.over = true; AudioFX.playClick(); const won = this.score >= 300; setText('ast-status', `💥 Game over! Score: ${this.score}. +${Math.floor(this.score / 3)} Coins`, '#ef4444'); finishGame(Math.floor(this.score / 3), Math.floor(this.score / 10), won); }
    },

    'frogger': {
        W: 600, H: 480, CELL: 40, COLS: 15, ROWS: 12, frog: null, lanes: [], over: false, lastTime: 0, score: 0, lives: 3, homes: 0,
        render(container, mode) {
            const g = this;
            g.frog = { x: 7, y: 11 }; g.lives = 3; g.score = 0; g.homes = 0; g.over = false; g.lanes = [];
            for (let i = 0; i < 5; i++) { const lane = { type: 'water', y: i + 1, items: [], dir: i % 2 === 0 ? 1 : -1, speed: 40 + i * 15 }; let x = 0; while (x < g.W + 100) { const w = 80 + Math.random() * 50; lane.items.push({ x, w }); x += w + 20 + Math.random() * 30; } g.lanes.push(lane); }
            for (let i = 0; i < 4; i++) { const lane = { type: 'road', y: 7 + i, items: [], dir: i % 2 === 0 ? -1 : 1, speed: 60 + i * 25 }; let x = 0; while (x < g.W + 100) { const w = 40; lane.items.push({ x, w }); x += w + 100 + Math.random() * 60; } g.lanes.push(lane); }
            container.innerHTML = `
                <h3>🐸 Frogger — ${mode.toUpperCase()}</h3>
                <p>Arrow keys to move. Cross the road, ride logs, reach home 5 times!</p>
                <p>Lives: <b id="frog-lives" style="color:#ef4444;">❤❤❤</b> · Score: <b id="frog-score" style="color:var(--accent-cyan);">0</b> · Homes: <b id="frog-homes">0/5</b></p>
                <div style="display:flex; justify-content:center; margin:15px 0;"><canvas id="frog-canvas" width="${g.W}" height="${g.H}" style="background:#000; border:2px solid var(--border-color); border-radius:8px; max-width:100%;"></canvas></div>
                <div id="frog-status" style="margin-top:15px; font-weight:bold; min-height:24px;"></div>`;
            g.canvas = document.getElementById('frog-canvas'); g.ctx = g.canvas.getContext('2d');
            g.bindKeys(); g.lastTime = performance.now(); g.startLoop();
        },
        startLoop() { const g = this; const step = (t) => { if (!document.getElementById('frog-canvas')) return; const dt = Math.min(0.05, (t - g.lastTime) / 1000); g.lastTime = t; if (!g.over) g.update(dt); g.draw(); requestAnimationFrame(step); }; requestAnimationFrame(step); },
        bindKeys() {
            const g = this;
            g._keyHandler = (e) => { if (g.over || !document.getElementById('frog-canvas')) return; if (e.key === 'ArrowUp') { e.preventDefault(); g.move(0, -1); } else if (e.key === 'ArrowDown') { e.preventDefault(); g.move(0, 1); } else if (e.key === 'ArrowLeft') { e.preventDefault(); g.move(-1, 0); } else if (e.key === 'ArrowRight') { e.preventDefault(); g.move(1, 0); } };
            document.removeEventListener('keydown', g._keyHandler);
            document.addEventListener('keydown', g._keyHandler);
        },
        move(dx, dy) { const g = this; const nx = Math.round(g.frog.x + dx), ny = g.frog.y + dy; if (nx < 0 || nx >= g.COLS || ny < 0 || ny >= g.ROWS) return; g.frog.x = nx; g.frog.y = ny; AudioFX.playClick(); if (ny === 0) g.winHome(); },
        winHome() { const g = this; g.homes++; g.score += 100; AudioFX.playWin(); const sEl = document.getElementById('frog-score'), hEl = document.getElementById('frog-homes'); if (sEl) sEl.textContent = g.score; if (hEl) hEl.textContent = `${g.homes}/5`; g.frog = { x: 7, y: 11 }; if (g.homes >= 5) g.gameOver(true); },
        update(dt) {
            const g = this;
            for (const lane of g.lanes) for (const item of lane.items) { item.x += lane.dir * lane.speed * dt; if (item.x < -150) item.x = g.W + 50; if (item.x > g.W + 150) item.x = -100; }
            const fy = g.frog.y, fx = g.frog.x * g.CELL + g.CELL / 2;
            if (fy >= 7 && fy <= 10) { const lane = g.lanes.find(l => l.y === fy && l.type === 'road'); if (lane) for (const item of lane.items) if (fx > item.x && fx < item.x + item.w) { g.hit(); return; } }
            else if (fy >= 1 && fy <= 5) {
                const lane = g.lanes.find(l => l.y === fy && l.type === 'water');
                if (lane) { let onLog = false; for (const item of lane.items) if (fx > item.x && fx < item.x + item.w) { onLog = true; const nx = (fx + lane.dir * lane.speed * dt - g.CELL / 2) / g.CELL; if (nx < -0.5 || nx > g.COLS - 0.5) { g.hit(); return; } g.frog.x = nx; break; } if (!onLog) { g.hit(); return; } }
            }
        },
        hit() { const g = this; g.lives--; const el = document.getElementById('frog-lives'); if (el) el.textContent = '❤'.repeat(Math.max(0, g.lives)) || '💀'; AudioFX.playClick(); if (g.lives <= 0) { g.gameOver(false); return; } g.frog = { x: 7, y: 11 }; },
        draw() {
            const g = this; if (!g.ctx) return;
            g.ctx.fillStyle = '#000'; g.ctx.fillRect(0, 0, g.W, g.H);
            g.ctx.fillStyle = '#166534'; g.ctx.fillRect(0, 0, g.W, g.CELL); g.ctx.fillRect(0, 6 * g.CELL, g.W, g.CELL); g.ctx.fillRect(0, 11 * g.CELL, g.W, g.CELL);
            g.ctx.fillStyle = '#1e3a8a'; g.ctx.fillRect(0, g.CELL, g.W, 5 * g.CELL);
            g.ctx.fillStyle = '#1e293b'; g.ctx.fillRect(0, 7 * g.CELL, g.W, 4 * g.CELL);
            for (const lane of g.lanes) for (const item of lane.items) { if (lane.type === 'water') { g.ctx.fillStyle = '#78350f'; g.ctx.fillRect(item.x, lane.y * g.CELL + 6, item.w, g.CELL - 12); } else { g.ctx.fillStyle = '#ef4444'; g.ctx.fillRect(item.x, lane.y * g.CELL + 10, item.w, g.CELL - 20); } }
            g.ctx.fillStyle = '#22c55e'; g.ctx.beginPath(); g.ctx.arc(g.frog.x * g.CELL + g.CELL / 2, g.frog.y * g.CELL + g.CELL / 2, g.CELL / 2 - 4, 0, Math.PI * 2); g.ctx.fill();
        },
        gameOver(won) { this.over = true; if (won) { AudioFX.playWin(); setText('frog-status', `🏆 You won! Score: ${this.score}. +${Math.floor(this.score / 3)} Coins`, '#22c55e'); finishGame(Math.floor(this.score / 3), 60, true); } else { AudioFX.playClick(); setText('frog-status', `💥 Game over! Score: ${this.score}. +${Math.floor(this.score / 10)} Coins`, '#ef4444'); finishGame(Math.floor(this.score / 10), 15, false); } }
    },

    'dig-dug': {
        GRID: 15, CELL: 32, grid: null, player: null, enemies: [], over: false, lastTime: 0, enemyTimer: 0, score: 0,
        render(container, mode) {
            const g = this;
            g.grid = Array.from({length: g.GRID}, () => Array(g.GRID).fill(0));
            g.grid[g.GRID - 1][Math.floor(g.GRID / 2)] = 1;
            g.player = { x: Math.floor(g.GRID / 2), y: g.GRID - 1 };
            g.enemies = [];
            for (let i = 0; i < 3; i++) { const ex = Math.floor(g.GRID / 2) + (i - 1) * 3; g.grid[0][ex] = 1; g.enemies.push({ x: ex, y: 0 }); }
            g.score = 0; g.over = false; g.enemyTimer = 0;
            container.innerHTML = `
                <h3>⛏️ Dig Dug — ${mode.toUpperCase()}</h3>
                <p>Arrow keys to dig. Walk onto an enemy to eliminate it. Don't let them catch you!</p>
                <p>Score: <b id="dd-score" style="color:var(--accent-cyan);">0</b> · Enemies: <b id="dd-enemies">3</b></p>
                <div style="display:flex; justify-content:center; margin:15px 0;"><canvas id="dd-canvas" width="${g.GRID * g.CELL}" height="${g.GRID * g.CELL}" style="background:#4a2c1a; border:2px solid var(--border-color); border-radius:8px; max-width:100%;"></canvas></div>
                <div id="dd-status" style="margin-top:15px; font-weight:bold; min-height:24px;"></div>`;
            g.canvas = document.getElementById('dd-canvas'); g.ctx = g.canvas.getContext('2d');
            g.bindKeys(); g.lastTime = performance.now(); g.startLoop();
        },
        startLoop() { const g = this; const step = (t) => { if (!document.getElementById('dd-canvas')) return; const dt = Math.min(0.05, (t - g.lastTime) / 1000); g.lastTime = t; if (!g.over) g.update(dt); g.draw(); requestAnimationFrame(step); }; requestAnimationFrame(step); },
        bindKeys() {
            const g = this;
            g._keyHandler = (e) => { if (g.over || !document.getElementById('dd-canvas')) return; const dirs = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] }; if (dirs[e.key]) { e.preventDefault(); g.move(dirs[e.key][0], dirs[e.key][1]); } };
            document.removeEventListener('keydown', g._keyHandler);
            document.addEventListener('keydown', g._keyHandler);
        },
        move(dx, dy) {
            const g = this; const nx = g.player.x + dx, ny = g.player.y + dy;
            if (nx < 0 || nx >= g.GRID || ny < 0 || ny >= g.GRID) return;
            g.grid[ny][nx] = 1; g.player.x = nx; g.player.y = ny; AudioFX.playClick();
            const hitIdx = g.enemies.findIndex(e => e.x === nx && e.y === ny);
            if (hitIdx >= 0) { g.enemies.splice(hitIdx, 1); g.score += 50; const sEl = document.getElementById('dd-score'), eEl = document.getElementById('dd-enemies'); if (sEl) sEl.textContent = g.score; if (eEl) eEl.textContent = g.enemies.length; AudioFX.playWin(); if (g.enemies.length === 0) g.gameOver(true); }
        },
        update(dt) {
            const g = this;
            g.enemyTimer += dt;
            if (g.enemyTimer > 1.2) {
                g.enemyTimer = 0;
                for (const e of g.enemies) {
                    const dirs = [[0, -1], [0, 1], [-1, 0], [1, 0]]; shuffle(dirs);
                    for (const [dx, dy] of dirs) { const nx = e.x + dx, ny = e.y + dy; if (nx >= 0 && nx < g.GRID && ny >= 0 && ny < g.GRID && g.grid[ny][nx] === 1) { e.x = nx; e.y = ny; if (nx === g.player.x && ny === g.player.y) { g.gameOver(false); return; } break; } }
                }
            }
        },
        draw() {
            const g = this; if (!g.ctx) return;
            for (let y = 0; y < g.GRID; y++) for (let x = 0; x < g.GRID; x++) { const cell = g.grid[y][x]; g.ctx.fillStyle = cell === 1 ? '#0f172a' : '#4a2c1a'; g.ctx.fillRect(x * g.CELL, y * g.CELL, g.CELL, g.CELL); if (cell === 0) { g.ctx.strokeStyle = '#2c1810'; g.ctx.lineWidth = 1; g.ctx.strokeRect(x * g.CELL + 0.5, y * g.CELL + 0.5, g.CELL - 1, g.CELL - 1); } }
            for (const e of g.enemies) { g.ctx.fillStyle = '#ef4444'; g.ctx.beginPath(); g.ctx.arc(e.x * g.CELL + g.CELL / 2, e.y * g.CELL + g.CELL / 2, g.CELL / 2 - 4, 0, Math.PI * 2); g.ctx.fill(); }
            g.ctx.fillStyle = '#38bdf8'; g.ctx.beginPath(); g.ctx.arc(g.player.x * g.CELL + g.CELL / 2, g.player.y * g.CELL + g.CELL / 2, g.CELL / 2 - 4, 0, Math.PI * 2); g.ctx.fill();
        },
        gameOver(won) { this.over = true; if (won) { AudioFX.playWin(); setText('dd-status', `🏆 Level clear! Score: ${this.score}. +${this.score} Coins`, '#22c55e'); finishGame(this.score, 80, true); } else { AudioFX.playClick(); setText('dd-status', `💥 Caught! Score: ${this.score}. +${Math.floor(this.score / 2)} Coins`, '#ef4444'); finishGame(Math.floor(this.score / 2), 20, false); } }
    }
});
Object.assign(GameEngines, {

    'darts': {
        throws: 0, maxThrows: 5, score: 0, throwing: false, over: false,
        render(container, mode) {
            const g = this;
            g.throws = 0; g.score = 0; g.throwing = false; g.over = false;
            container.innerHTML = `
                <h3>🎯 Darts — ${mode.toUpperCase()}</h3>
                <p>Click inside the target to throw. Bullseye = 50, inner = 25, middle = 15, outer = 10. 5 throws!</p>
                <p>Throws: <b id="darts-throws">0</b>/${g.maxThrows} · Score: <b id="darts-score" style="color:var(--accent-cyan);">0</b></p>
                <div style="display:flex; justify-content:center; margin:20px 0;"><div id="darts-board" style="position:relative; width:340px; height:340px; background:var(--surface-color); border-radius:12px; cursor:crosshair; overflow:hidden;"></div></div>
                <div id="darts-status" style="margin-top:15px; font-weight:bold; min-height:24px;"></div>`;
            g.drawBoard();
            const board = document.getElementById('darts-board');
            board.onclick = (e) => g.throwDart(e);
        },
        drawBoard() {
            const board = document.getElementById('darts-board'); if (!board) return;
            board.innerHTML = `<div style="position:absolute; inset:0; display:flex; align-items:center; justify-content:center;"><div style="width:300px; height:300px; border-radius:50%; background:radial-gradient(circle,#fef3c7 0 10%,#22c55e 10% 15%,#fef3c7 15% 30%,#ef4444 30% 35%,#fef3c7 35% 55%,#1e293b 55% 60%,#fef3c7 60% 80%,#1e293b 80% 100%); box-shadow:0 0 20px rgba(0,0,0,0.5);"></div></div><div id="darts-markers"></div>`;
        },
        throwDart(e) {
            const g = this;
            if (g.throwing || g.over || g.throws >= g.maxThrows) return;
            g.throwing = true;
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left, y = e.clientY - rect.top;
            const randX = x + (Math.random() - 0.5) * 24, randY = y + (Math.random() - 0.5) * 24;
            const cx = 170, cy = 170;
            const dist = Math.sqrt((randX - cx) ** 2 + (randY - cy) ** 2);
            let pts = 0, label = '';
            if (dist < 15) { pts = 50; label = 'BULLSEYE! 🎯'; }
            else if (dist < 30) { pts = 25; label = 'Inner ring'; }
            else if (dist < 45) { pts = 15; label = 'Middle ring'; }
            else if (dist < 75) { pts = 10; label = 'Outer ring'; }
            else if (dist < 100) { pts = 5; label = 'Edge'; }
            else { pts = 0; label = 'Miss'; }
            g.score += pts; g.throws++;
            const marker = document.createElement('div');
            marker.style.cssText = `position:absolute; left:${randX - 5}px; top:${randY - 5}px; width:10px; height:10px; border-radius:50%; background:${pts > 0 ? '#fbbf24' : '#94a3b8'}; box-shadow:0 0 6px ${pts > 0 ? '#fbbf24' : '#94a3b8'};`;
            document.getElementById('darts-markers').appendChild(marker);
            AudioFX.playCardSnap();
            document.getElementById('darts-throws').textContent = g.throws;
            document.getElementById('darts-score').textContent = g.score;
            setText('darts-status', `${label} +${pts} points`, pts > 0 ? '#22c55e' : '#94a3b8');
            GameSession.setTimer(() => { g.throwing = false; if (g.throws >= g.maxThrows) g.finish(); }, 300);
        },
        finish() {
            const g = this; g.over = true;
            const coins = Math.floor(g.score * 1.5);
            const won = g.score >= 50;
            if (won) { AudioFX.playWin(); setText('darts-status', `🏁 Final score: ${g.score}! +${coins} Coins`, '#22c55e'); }
            else { AudioFX.playClick(); setText('darts-status', `🏁 Final score: ${g.score}.`, '#ef4444'); }
            finishGame(coins, won ? 50 : 20, won);
        }
    },

    'bowling': {
        frame: 1, roll: 1, pins: [], totalScore: 0, gameOver: false,
        render(container, mode) {
            const g = this;
            g.frame = 1; g.roll = 1; g.totalScore = 0; g.gameOver = false;
            g.resetPins();
            container.innerHTML = `
                <h3>🎳 Bowling — ${mode.toUpperCase()}</h3>
                <p>Drag the aim slider to adjust spin, then click <b>Roll</b>. Knock down all 10 pins!</p>
                <div id="bowling-alley" style="position:relative; width:100%; max-width:360px; height:340px; margin:20px auto; background:linear-gradient(to bottom,#0f172a,#1e293b); border-radius:12px; overflow:hidden;"><div id="bowling-pins" style="position:absolute; bottom:20px; left:0; right:0; height:120px;"></div><div id="bowling-ball" style="position:absolute; bottom:20px; left:50%; transform:translateX(-50%); width:30px; height:30px; border-radius:50%; background:radial-gradient(circle at 30% 30%, #38bdf8, #0369a1); display:none;"></div></div>
                <p>Frame <b id="bowling-frame">1</b>/3 · Roll <b id="bowling-roll">1</b> · Score: <b id="bowling-score" style="color:var(--accent-cyan);">0</b></p>
                <div style="display:flex; gap:10px; justify-content:center; align-items:center; margin:15px 0;"><span style="font-size:0.9rem;">← Aim →</span><input type="range" id="bowling-aim" min="-50" max="50" value="0" style="width:200px; accent-color:var(--accent-cyan);"><button class="btn primary-btn" id="bowling-roll-btn" onclick="GameEngines.bowling.rollBall()">🎳 Roll!</button></div>
                <div id="bowling-status" style="margin-top:15px; font-weight:bold; min-height:24px;"></div>`;
            g.drawPins();
        },
        resetPins() { this.pins = [[1,1,1,1],[1,1,1],[1,1],[1]]; },
        countDown() { return this.pins.flat().filter(p => p).length; },
        drawPins() {
            const el = document.getElementById('bowling-pins'); if (!el) return;
            el.innerHTML = this.pins.map(row => `<div style="display:flex; justify-content:center; gap:16px; margin-bottom:8px;">${row.map(p => `<div style="width:22px; height:22px; border-radius:50% 50% 30% 30%; background:${p ? 'linear-gradient(180deg,#fff,#94a3b8)' : 'transparent'};"></div>`).join('')}</div>`).join('');
        },
        rollBall() {
            const g = this;
            if (g.gameOver) return;
            const aim = parseInt(document.getElementById('bowling-aim').value);
            document.getElementById('bowling-roll-btn').disabled = true;
            const ball = document.getElementById('bowling-ball');
            ball.style.display = 'block';
            let pos = 20;
            const interval = GameSession.setInterval(() => {
                pos += 15; ball.style.bottom = pos + 'px';
                if (pos >= 220) { clearInterval(interval); ball.style.display = 'none'; g.resolveKnock(aim); }
            }, 40);
        },
        resolveKnock(aim) {
            const g = this;
            const accuracy = 1 - Math.abs(aim) / 60;
            const down = g.countDown();
            let knocked = 0;
            if (accuracy > 0.85 && Math.random() > 0.3) knocked = down;
            else if (accuracy > 0.6) knocked = Math.min(down, Math.floor(down * (0.6 + Math.random() * 0.3)));
            else knocked = Math.min(down, Math.floor(down * (0.2 + Math.random() * 0.4)));
            let removed = 0;
            for (let r = g.pins.length - 1; r >= 0; r--) { for (let c = 0; c < g.pins[r].length; c++) { if (removed >= knocked) break; if (g.pins[r][c]) { g.pins[r][c] = 0; removed++; } } if (removed >= knocked) break; }
            g.totalScore += knocked;
            g.drawPins();
            AudioFX.playCardSnap();
            document.getElementById('bowling-score').textContent = g.totalScore;
            setText('bowling-status', `Knocked down ${knocked} pin${knocked !== 1 ? 's' : ''}!`, knocked > 0 ? '#22c55e' : '#94a3b8');
            const remaining = g.countDown();
            if (remaining === 0 || g.roll >= 2) GameSession.setTimer(() => g.nextFrame(), 800);
            else { g.roll++; document.getElementById('bowling-roll').textContent = g.roll; GameSession.setTimer(() => { document.getElementById('bowling-roll-btn').disabled = false; }, 400); }
        },
        nextFrame() {
            const g = this;
            g.frame++; g.roll = 1;
            if (g.frame > 3) { g.finish(); return; }
            g.resetPins(); g.drawPins();
            document.getElementById('bowling-frame').textContent = g.frame;
            document.getElementById('bowling-roll').textContent = 1;
            document.getElementById('bowling-roll-btn').disabled = false;
            setText('bowling-status', `Frame ${g.frame} — take aim!`);
        },
        finish() {
            this.gameOver = true;
            document.getElementById('bowling-roll-btn').disabled = true;
            const coins = Math.floor(this.totalScore * 1.5);
            const won = this.totalScore >= 10;
            if (won) { AudioFX.playWin(); setText('bowling-status', `🏆 Final: ${this.totalScore} pins! +${coins} Coins`, '#22c55e'); }
            else { AudioFX.playClick(); setText('bowling-status', `🏁 Final: ${this.totalScore} pins.`, '#ef4444'); }
            finishGame(coins, won ? 50 : 20, won);
        }
    },

    'gin-rummy': {
        deck: [], discard: [], playerHand: [], aiHand: [], turn: 'player', over: false, hasDrawn: false, aiThinking: false,
        render(container, mode) {
            const g = this;
            g.deck = createStandardDeck(false);
            g.playerHand = g.deck.splice(0, 10); g.aiHand = g.deck.splice(0, 10);
            g.discard = [g.deck.pop()];
            g.turn = 'player'; g.over = false; g.hasDrawn = false; g.aiThinking = false;
            container.innerHTML = `
                <h3>🃏 Gin Rummy — ${mode.toUpperCase()}</h3>
                <p>Collect melds (sets/runs). Draw, then discard. Click <b>Knock</b> when your hand is worth ≥10 meld points to win!</p>
                <div style="display:flex; gap:20px; justify-content:center; margin:20px 0; flex-wrap:wrap;">
                    <div><div style="font-size:0.85rem; color:var(--text-muted);">Stock (<span id="gin-stock">${g.deck.length}</span>)</div><div id="gin-stock-pile" style="cursor:pointer;" onclick="GameEngines['gin-rummy'].drawFromStock()">${cardBack()}</div></div>
                    <div><div style="font-size:0.85rem; color:var(--text-muted);">Discard Pile</div><div id="gin-discard" onclick="GameEngines['gin-rummy'].drawFromDiscard()"></div></div>
                </div>
                <h4>Your Hand:</h4>
                <div id="gin-hand" style="display:flex; flex-wrap:wrap; justify-content:center; gap:8px; margin:15px 0;"></div>
                <p>Meld value: <b id="gin-meld" style="color:var(--accent-cyan);">0</b> points</p>
                <div style="display:flex; gap:10px; justify-content:center;"><button class="btn primary-btn" id="gin-knock" onclick="GameEngines['gin-rummy'].knock()">🔔 Knock</button></div>
                <div id="gin-status" style="margin-top:15px; font-weight:bold; min-height:24px;"></div>`;
            g.refresh();
        },
        refresh() {
            const g = this;
            document.getElementById('gin-stock').textContent = g.deck.length;
            const dTop = g.discard[g.discard.length - 1];
            document.getElementById('gin-discard').innerHTML = dTop ? renderCard(dTop.rank, dTop.suit) : '';
            document.getElementById('gin-hand').innerHTML = g.playerHand.map((c, i) => { const sel = g._selectedCard === i; return `<div style="cursor:pointer; outline:${sel ? '3px solid #f59e0b' : 'none'}; border-radius:8px;" onclick="GameEngines['gin-rummy'].clickCard(${i})">${renderCard(c.rank, c.suit)}</div>`; }).join('');
            const meld = g.calculateMeldValue(g.playerHand);
            document.getElementById('gin-meld').textContent = meld;
            document.getElementById('gin-knock').disabled = g.turn !== 'player' || !g.hasDrawn || meld < 10;
        },
        clickCard(i) {
            const g = this;
            if (g.turn !== 'player' || g.over) return;
            if (!g.hasDrawn) { setText('gin-status', 'Draw a card first.', '#f59e0b'); return; }
            if (g._selectedCard === i) {
                const card = g.playerHand.splice(i, 1)[0];
                g.discard.push(card);
                g._selectedCard = undefined; g.hasDrawn = false;
                AudioFX.playCardSnap(); g.refresh();
                g.turn = 'ai'; g.aiThinking = true;
                setText('gin-status', 'AI thinking...');
                GameSession.setTimer(() => g.aiTurn(), 800);
                return;
            }
            g._selectedCard = i; g.refresh();
            setText('gin-status', 'Click again to discard.');
        },
        drawFromStock() {
            const g = this;
            if (g.turn !== 'player' || g.hasDrawn || g.over || g.deck.length === 0) return;
            g.playerHand.push(g.deck.pop()); g.hasDrawn = true;
            AudioFX.playCardSnap(); g.refresh();
            setText('gin-status', 'Click a card to discard it.');
        },
        drawFromDiscard() {
            const g = this;
            if (g.turn !== 'player' || g.hasDrawn || g.over || g.discard.length === 0) return;
            g.playerHand.push(g.discard.pop()); g.hasDrawn = true;
            AudioFX.playCardSnap(); g.refresh();
            setText('gin-status', 'Click a card to discard it.');
        },
        aiTurn() {
            const g = this;
            if (g.over) return;
            g.aiThinking = false;
            if (g.deck.length === 0) { g.endGame('draw'); return; }
            g.aiHand.push(g.deck.pop());
            let worstIdx = 0, worstScore = -Infinity;
            for (let i = 0; i < g.aiHand.length; i++) {
                const card = g.aiHand[i];
                const others = g.aiHand.filter((_, j) => j !== i);
                const score = others.filter(o => o.rank === card.rank || (o.suit === card.suit && Math.abs(faceValue(o.rank) - faceValue(card.rank)) <= 2)).length;
                if (-score > worstScore) { worstScore = -score; worstIdx = i; }
            }
            g.discard.push(g.aiHand.splice(worstIdx, 1)[0]);
            g.turn = 'player'; g.hasDrawn = false;
            g.refresh();
            setText('gin-status', 'Your turn — draw a card.');
            const aiMeld = g.calculateMeldValue(g.aiHand);
            if (aiMeld >= 40) { setText('gin-status', 'AI knocked!', '#f59e0b'); g.endGame('ai-knock'); }
        },
        calculateMeldValue(hand) {
            let best = 0;
            const used = new Set();
            const byRank = {};
            hand.forEach((c, i) => { if (!byRank[c.rank]) byRank[c.rank] = []; byRank[c.rank].push(i); });
            for (const rank in byRank) if (byRank[rank].length >= 3) byRank[rank].forEach(i => used.add(i));
            const bySuit = {};
            hand.forEach((c, i) => { if (used.has(i)) return; if (!bySuit[c.suit]) bySuit[c.suit] = []; bySuit[c.suit].push({ i, val: faceValue(c.rank) }); });
            for (const suit in bySuit) {
                const sorted = bySuit[suit].sort((a,b) => a.val - b.val);
                for (let i = 0; i < sorted.length; i++) { let j = i; while (j + 1 < sorted.length && sorted[j+1].val === sorted[j].val + 1) j++; if (j - i + 1 >= 3) for (let k = i; k <= j; k++) used.add(sorted[k].i); }
            }
            used.forEach(i => best += Math.min(10, faceValue(hand[i].rank)));
            return best;
        },
        knock() {
            const g = this;
            if (g.turn !== 'player' || !g.hasDrawn) return;
            const meld = g.calculateMeldValue(g.playerHand);
            if (meld < 10) { setText('gin-status', 'Need 10+ meld points.', '#ef4444'); return; }
            g.endGame('player-knock');
        },
        endGame(reason) {
            const g = this; g.over = true;
            if (reason === 'player-knock') { AudioFX.playWin(); setText('gin-status', `🎉 You knocked with ${g.calculateMeldValue(g.playerHand)} points! +150 Coins`, '#22c55e'); finishGame(150, 80, true); }
            else if (reason === 'ai-knock') { AudioFX.playClick(); setText('gin-status', '😢 AI knocked first.', '#ef4444'); finishGame(0, 20, false); }
            else { setText('gin-status', '🤝 Draw! +30 Coins', '#f59e0b'); finishGame(30, 30, false); }
        }
    },

    'mini-golf': {
        ball: null, hole: null, strokes: 0, maxStrokes: 6, aiming: false, dragStart: null, obstacles: [], over: false,
        render(container, mode) {
            const g = this;
            g.ball = { x: 200, y: 400, vx: 0, vy: 0 };
            g.hole = { x: 200, y: 60, r: 18 };
            g.obstacles = [{ x: 100, y: 180, w: 60, h: 20 }, { x: 240, y: 280, w: 60, h: 20 }, { x: 120, y: 320, w: 20, h: 60 }];
            g.strokes = 0; g.aiming = false; g.dragStart = null; g.over = false;
            container.innerHTML = `
                <h3>⛳ Mini Golf — ${mode.toUpperCase()}</h3>
                <p>Click and drag FROM the ball to aim. Release to putt. Get in the hole in ≤${g.maxStrokes} strokes!</p>
                <p>Strokes: <b id="mg-strokes">0</b>/${g.maxStrokes}</p>
                <div style="display:flex; justify-content:center; margin:20px 0;"><canvas id="mg-canvas" width="400" height="460" style="background:#22c55e; border-radius:12px; cursor:pointer;"></canvas></div>
                <div id="mg-status" style="margin-top:15px; font-weight:bold; min-height:24px;"></div>`;
            g.canvas = document.getElementById('mg-canvas');
            g.ctx = g.canvas.getContext('2d');
            g.setupInputs(); g.draw(); g.gameLoop();
        },
        setupInputs() {
            const g = this; const c = g.canvas;
            const getPos = (e) => { const rect = c.getBoundingClientRect(); return { x: (e.clientX - rect.left) * (c.width / rect.width), y: (e.clientY - rect.top) * (c.height / rect.height) }; };
            c.onmousedown = (e) => { if (g.over) return; const pos = getPos(e); if (Math.hypot(pos.x - g.ball.x, pos.y - g.ball.y) < 30 && Math.abs(g.ball.vx) < 0.1 && Math.abs(g.ball.vy) < 0.1) { g.aiming = true; g.dragStart = pos; } };
            c.onmousemove = (e) => { if (!g.aiming) return; g.dragCurrent = getPos(e); g.draw(); };
            c.onmouseup = (e) => {
                if (!g.aiming) return;
                const pos = getPos(e);
                const dx = g.dragStart.x - pos.x, dy = g.dragStart.y - pos.y;
                const power = Math.min(15, Math.hypot(dx, dy) * 0.15);
                if (power > 0.5) { g.ball.vx = Math.cos(Math.atan2(dy, dx)) * power; g.ball.vy = Math.sin(Math.atan2(dy, dx)) * power; g.strokes++; AudioFX.playCardSnap(); document.getElementById('mg-strokes').textContent = g.strokes; }
                g.aiming = false; g.dragStart = null;
            };
        },
        draw() {
            const g = this; const ctx = g.ctx; if (!ctx) return;
            ctx.clearRect(0, 0, 400, 460);
            ctx.fillStyle = '#16a34a'; ctx.fillRect(0, 0, 400, 460);
            ctx.fillStyle = '#15803d'; for (let i = 0; i < 10; i++) ctx.fillRect(0, i * 46, 400, 23);
            ctx.fillStyle = '#78350f'; g.obstacles.forEach(o => ctx.fillRect(o.x, o.y, o.w, o.h));
            ctx.beginPath(); ctx.arc(g.hole.x, g.hole.y, g.hole.r, 0, Math.PI * 2); ctx.fillStyle = '#0f172a'; ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
            ctx.strokeStyle = '#fff'; ctx.beginPath(); ctx.moveTo(g.hole.x, g.hole.y); ctx.lineTo(g.hole.x, g.hole.y - 40); ctx.stroke();
            ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.moveTo(g.hole.x, g.hole.y - 40); ctx.lineTo(g.hole.x + 20, g.hole.y - 32); ctx.lineTo(g.hole.x, g.hole.y - 24); ctx.fill();
            ctx.beginPath(); ctx.arc(g.ball.x, g.ball.y, 8, 0, Math.PI * 2); ctx.fillStyle = '#fff'; ctx.fill(); ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 1; ctx.stroke();
            if (g.aiming && g.dragCurrent) { ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 2; ctx.setLineDash([5, 5]); ctx.beginPath(); ctx.moveTo(g.ball.x, g.ball.y); ctx.lineTo(g.ball.x + (g.ball.x - g.dragCurrent.x), g.ball.y + (g.ball.y - g.dragCurrent.y)); ctx.stroke(); ctx.setLineDash([]); }
        },
        gameLoop() {
            const g = this;
            if (!document.getElementById('mg-canvas')) return;
            if (!g.over) {
                g.ball.x += g.ball.vx; g.ball.y += g.ball.vy;
                g.ball.vx *= 0.97; g.ball.vy *= 0.97;
                if (Math.abs(g.ball.vx) < 0.05) g.ball.vx = 0;
                if (Math.abs(g.ball.vy) < 0.05) g.ball.vy = 0;
                if (g.ball.x < 8) { g.ball.x = 8; g.ball.vx = -g.ball.vx * 0.7; }
                if (g.ball.x > 392) { g.ball.x = 392; g.ball.vx = -g.ball.vx * 0.7; }
                if (g.ball.y < 8) { g.ball.y = 8; g.ball.vy = -g.ball.vy * 0.7; }
                if (g.ball.y > 452) { g.ball.y = 452; g.ball.vy = -g.ball.vy * 0.7; }
                for (const o of g.obstacles) { if (g.ball.x > o.x - 8 && g.ball.x < o.x + o.w + 8 && g.ball.y > o.y - 8 && g.ball.y < o.y + o.h + 8) { const ox = Math.min(Math.abs(g.ball.x - o.x), Math.abs(g.ball.x - (o.x + o.w))); const oy = Math.min(Math.abs(g.ball.y - o.y), Math.abs(g.ball.y - (o.y + o.h))); if (ox < oy) g.ball.vx = -g.ball.vx * 0.7; else g.ball.vy = -g.ball.vy * 0.7; } }
                if (Math.hypot(g.ball.x - g.hole.x, g.ball.y - g.hole.y) < g.hole.r - 2 && Math.abs(g.ball.vx) < 3 && Math.abs(g.ball.vy) < 3) g.hole();
                if (g.strokes >= g.maxStrokes && Math.abs(g.ball.vx) < 0.1 && Math.abs(g.ball.vy) < 0.1) g.lose();
            }
            g.draw();
            requestAnimationFrame(() => g.gameLoop());
        },
        hole() {
            this.over = true; AudioFX.playWin();
            const coins = Math.max(30, 200 - this.strokes * 25);
            setText('mg-status', `🎉 Hole in ${this.strokes} stroke${this.strokes !== 1 ? 's' : ''}! +${coins} Coins`, '#22c55e');
            finishGame(coins, 60, true);
        },
        lose() {
            this.over = true; AudioFX.playClick();
            setText('mg-status', `😢 Out of strokes!`, '#ef4444');
            finishGame(0, 20, false);
        }
    }
});
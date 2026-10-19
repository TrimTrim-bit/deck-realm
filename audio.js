const AudioFX = {
    ctx: null, muted: false,
    init() {
        if (this.muted) return;
        if (!this.ctx) {
            try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); }
            catch (e) { console.warn('Audio unavailable', e); this.muted = true; }
        }
    },
    toggle() { this.muted = !this.muted; if (!this.muted) this.playClick(); return this.muted; },
    playClick() {
        if (this.muted) return; this.init(); if (!this.ctx) return;
        const o = this.ctx.createOscillator(), g = this.ctx.createGain();
        o.type = 'sine'; o.frequency.setValueAtTime(400, this.ctx.currentTime);
        o.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.05);
        g.gain.setValueAtTime(0.1, this.ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);
        o.connect(g); g.connect(this.ctx.destination);
        o.start(); o.stop(this.ctx.currentTime + 0.05);
    },
    playCardSnap() {
        if (this.muted) return; this.init(); if (!this.ctx) return;
        const o = this.ctx.createOscillator(), g = this.ctx.createGain();
        o.type = 'triangle'; o.frequency.setValueAtTime(300, this.ctx.currentTime);
        o.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.08);
        g.gain.setValueAtTime(0.15, this.ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);
        o.connect(g); g.connect(this.ctx.destination);
        o.start(); o.stop(this.ctx.currentTime + 0.08);
    },
    playWin() {
        if (this.muted) return; this.init(); if (!this.ctx) return;
        const now = this.ctx.currentTime;
        [523.25, 659.25, 783.99, 1046.50].forEach((f, i) => {
            const o = this.ctx.createOscillator(), g = this.ctx.createGain();
            o.type = 'sine'; o.frequency.setValueAtTime(f, now + i * 0.08);
            g.gain.setValueAtTime(0.15, now + i * 0.08);
            g.gain.exponentialRampToValueAtTime(0.01, now + i * 0.08 + 0.2);
            o.connect(g); g.connect(this.ctx.destination);
            o.start(now + i * 0.08); o.stop(now + i * 0.08 + 0.2);
        });
    },
    playLevelUp() {
        if (this.muted) return; this.init(); if (!this.ctx) return;
        const now = this.ctx.currentTime;
        [440, 554.37, 659.25, 880].forEach((f, i) => {
            const o = this.ctx.createOscillator(), g = this.ctx.createGain();
            o.type = 'square'; o.frequency.setValueAtTime(f, now + i * 0.1);
            g.gain.setValueAtTime(0.1, now + i * 0.1);
            g.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.25);
            o.connect(g); g.connect(this.ctx.destination);
            o.start(now + i * 0.1); o.stop(now + i * 0.1 + 0.25);
        });
    }
};
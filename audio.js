const AudioFX = {
    ctx: null, muted: false,
    init() {
        if (this.muted) return;
        if (!this.ctx) {
            try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); }
            catch (e) { console.warn('Audio unavailable', e); this.muted = true; }
        }
        if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
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

const N = {
    C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.00, A3: 220.00, B3: 246.94,
    C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
    C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.00, B5: 987.77,
    C6: 1046.50
};

const TRACK_DATA = {
    chill: { name: 'Chill Cafe', bpm: 80, waveform: 'sine', noteDur: 0.5,
        pattern: [N.C4,N.E4,N.G4,N.E4, N.A3,N.C4,N.E4,N.C4, N.F4,N.A4,N.C5,N.A4, N.G4,N.B4,N.D5,N.B4] },
    arcade: { name: 'Arcade Rush', bpm: 140, waveform: 'square', noteDur: 0.15,
        pattern: [N.E5,null,N.E5,null,N.G5,null,N.E5,null, N.C5,null,N.E5,null,N.G5,N.B5,N.G5,null,
                  N.D5,null,N.F5,null,N.A5,null,N.F5,null, N.C6,N.B5,N.G5,N.E5,N.C5,null,null,null] },
    mystic: { name: 'Mystic Garden', bpm: 100, waveform: 'triangle', noteDur: 0.4,
        pattern: [N.A3,N.C4,N.E4,N.A4, N.E4,N.C4,N.A3,N.E3, N.D4,N.F4,N.A4,N.D5, N.A4,N.F4,N.D4,N.A3] },
    space: { name: 'Space Drift', bpm: 65, waveform: 'sine', noteDur: 0.9,
        pattern: [N.C3,null,null,null, N.G3,null,null,null, N.E4,null,null,null, N.G4,null,N.E4,null] },
    lofi: { name: 'Lofi Study', bpm: 90, waveform: 'triangle', noteDur: 0.35,
        pattern: [N.D4,N.F4,N.A4,N.C5, N.A4,N.F4,N.E4,N.G4, N.B4,N.D5,N.B4,N.G4, N.A4,N.C5,N.E5,N.C5] }
};

const MusicPlayer = {
    ctx: null, timerId: null, currentTrackId: null,
    step: 0, nextNoteTime: 0, isPlaying: false, volume: 0.15,
    init() {
        if (!this.ctx) { try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {} }
        if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    },
    isUnlocked(trackId) {
        return typeof state !== 'undefined' && state.unlockedTracks && state.unlockedTracks.includes(trackId);
    },
    play(trackId) {
        this.init();
        if (!this.ctx || !TRACK_DATA[trackId] || !this.isUnlocked(trackId)) return false;
        this.stop();
        this.currentTrackId = trackId;
        this.step = 0;
        this.nextNoteTime = this.ctx.currentTime + 0.15;
        this.isPlaying = true;
        this._schedule();
        if (typeof state !== 'undefined') { state.currentMusic = trackId; saveGameData(); }
        return true;
    },
    stop() {
        if (this.timerId) clearTimeout(this.timerId);
        this.timerId = null; this.isPlaying = false; this.currentTrackId = null;
        if (typeof state !== 'undefined') { state.currentMusic = null; saveGameData(); }
    },
    _schedule() {
        if (!this.isPlaying || !this.currentTrackId) return;
        const track = TRACK_DATA[this.currentTrackId];
        if (!track) return;
        const lookahead = 0.15, horizon = 0.3;
        while (this.nextNoteTime < this.ctx.currentTime + horizon) {
            const note = track.pattern[this.step % track.pattern.length];
            if (note !== null && note !== 0) this._playNote(note, this.nextNoteTime, track.waveform, track.noteDur);
            this.nextNoteTime += (60 / track.bpm) / 2;
            this.step++;
        }
        this.timerId = setTimeout(() => this._schedule(), lookahead * 1000);
    },
    _playNote(freq, time, waveform, dur) {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator(), gain = this.ctx.createGain();
        osc.type = waveform || 'sine';
        osc.frequency.setValueAtTime(freq, time);
        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(this.volume, time + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, time + dur);
        osc.connect(gain); gain.connect(this.ctx.destination);
        osc.start(time); osc.stop(time + dur);
    },
    setVolume(v) { this.volume = Math.max(0, Math.min(1, v)); }
};
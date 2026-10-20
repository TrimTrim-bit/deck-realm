const ANIMATED_TUTORIALS = {
    'flux-shift': [
        { title: "⚡ Welcome to Flux Shift!", text: "You get 6 cards. Place each into one of three lanes — keep every lane at 21 or below!", target: null },
        { title: "🎯 The Lanes", text: "Draw a card, then click 'Place Here' under whichever lane you want.", target: "#flux-lanes" },
        { title: "💥 Busts", text: "If a lane goes over 21 it busts and scores 0.", target: "#flux-lanes" },
        { title: "🚀 Ready!", text: "Click 'Got It' and press Draw Card.", target: ".primary-btn" }
    ],
    'color-match': [
        { title: "🎨 Welcome to UNO!", text: "You and your opponent start with 7 cards. Empty your hand first to win!", target: null },
        { title: "🌈 Matching", text: "Play a card matching the discard pile's colour OR value. Playable cards glow green.", target: "#cm-hand" },
        { title: "🃏 Action Cards", text: "SKIP skips, REVERSE flips, +2 forces draws. Wilds change color!", target: "#cm-hand" },
        { title: "🚀 Ready!", text: "Empty your hand to win 60 coins!", target: ".primary-btn" }
    ],
    'pyramid-solitaire': [
        { title: "🏛️ Pyramid Solitaire", text: "Clear all 28 cards by pairing to 13.", target: null },
        { title: "🧮 Pairing", text: "Click two exposed cards summing to 13. Kings (13) clear alone.", target: "#pyramid-board" },
        { title: "📚 Stock", text: "Draw from the stock when stuck. You get 2 recycles!", target: "#pyr-draw" },
        { title: "🚀 Ready!", text: "Clear it for 80 coins.", target: ".primary-btn" }
    ],
    'quantum-swap': [
        { title: "🌌 Quantum Swap", text: "Draw cards to stabilize the portal.", target: null },
        { title: "⚛️ Portal", text: "You need 2 cards of the shown parity (Even/Odd). Two wrong draws collapse it!", target: "#qs-board" },
        { title: "🚀 Ready!", text: "Draw 2 matches before 2 wrongs.", target: ".primary-btn" }
    ],
    'trash': [
        { title: "🗑️ Welcome to Trash!", text: "10 face-down cards in numbered slots.", target: null },
        { title: "🔢 Placing", text: "Draw a card — a 3 goes to slot 3. If filled, the old card chains into its slot!", target: "#trash-board" },
        { title: "👑 Kings", text: "Kings are wild, fill any empty slot. Jacks/Queens are duds.", target: "#trash-btn" },
        { title: "🚀 Ready!", text: "Fill all 10 slots for 80 coins!", target: ".primary-btn" }
    ],
    'war': [
        { title: "⚔️ Card War", text: "You and your opponent flip cards.", target: null },
        { title: "👑 High Card", text: "Higher rank wins the battle and points.", target: "#war-board" },
        { title: "⚔️ Ties", text: "Both players burn cards and draw again!", target: "#war-board" },
        { title: "🚀 Ready!", text: "8 battles — win the most!", target: ".primary-btn" }
    ],
    'go-fish': [
        { title: "🐟 Go Fish", text: "Collect 4-of-a-kind books.", target: null },
        { title: "🃏 Asking", text: "Click a card to ask the AI for that rank.", target: "#gf-hand" },
        { title: "📚 Books", text: "Collect 4 of a rank = book. Most books wins!", target: "#gf-hand" },
        { title: "🚀 Ready!", text: "Win for 50 coins!", target: ".primary-btn" }
    ],
    'high-low': [
        { title: "🔥 Chaos High-Low", text: "Guess if the next card is higher or lower.", target: null },
        { title: "📈 Streaks", text: "Correct guesses build streaks. One wrong ends your run!", target: "#hl-card-box" },
        { title: "🚀 Ready!", text: "Max 5 guesses, aim for high streaks.", target: ".primary-btn" }
    ],
    'mahjong': [
        { title: "🀄 Mahjong Solitaire", text: "32 tiles in a 4×8 grid.", target: null },
        { title: "🎯 Free Tiles", text: "Only free tiles (no neighbor left OR right) can be clicked. Blue border = free.", target: "#mahjong-board" },
        { title: "💡 Hints", text: "Stuck? Click Hint for a valid pair.", target: "#mahjong-hint" },
        { title: "🚀 Ready!", text: "Clear the board for 100 coins!", target: ".primary-btn" }
    ],
    'poker': [
        { title: "🃏 Texas Hold'em", text: "You vs AI. Best 5-card hand wins.", target: null },
        { title: "💰 Ante", text: "Use the % slider to choose ante. Both put in, winner takes pot.", target: "#poker-bet-area" },
        { title: "🃏 Streets", text: "Pre-flop → Flop → Turn → River. Bet or check each street.", target: "#poker-actions" },
        { title: "🎯 Rankings", text: "High Card < Pair < Two Pair < Three of a Kind < Straight < Flush < Full House < Four of a Kind < Straight Flush.", target: "#poker-community" },
        { title: "🚀 Ready!", text: "Ante up!", target: ".primary-btn" }
    ],
    'memory-match': [
        { title: "🃏 Memory Match", text: "16 cards face down. Match 8 pairs.", target: "#mm-board" },
        { title: "🎯 20 Flips", text: "Fewer flips = more coins.", target: "#mm-matched" },
        { title: "🚀 Ready!", text: "Find all 8 pairs!", target: ".primary-btn" }
    ],
    'snap': [
        { title: "🖐️ Snap!", text: "Cards flip fast. When two consecutive cards share a rank, SNAP!", target: "#snap-current" },
        { title: "⚡ Speed", text: "Faster snap = more bonus. False snaps cost points.", target: "#snap-btn" },
        { title: "🚀 Ready!", text: "Score 30+ for coins!", target: ".primary-btn" }
    ],
    'bomb-cat': [
        { title: "💣 Bomb Cat", text: "Draw cards. Some are bombs!", target: null },
        { title: "🃏 Your Cards", text: "Skip = free redraw. Peek = see next 3. Defuse = save for bombs.", target: "#bc-hand" },
        { title: "❤️ Lives", text: "3 lives, 25 turns to win. Start with one defuse.", target: "#bc-lives" },
        { title: "🚀 Ready!", text: "Survive 25 turns for 120 coins!", target: ".primary-btn" }
    ],
    'klondike': [
        { title: "🃏 Klondike", text: "The classic solitaire!", target: null },
        { title: "🎯 Tableau", text: "7 columns build down in alternating colors. Only Kings go in empty columns.", target: "#kl-tableau" },
        { title: "📚 Stock", text: "Click stock to draw. Click again to recycle.", target: "#kl-waste" },
        { title: "🚀 Ready!", text: "Solve for 200 coins!", target: ".primary-btn" }
    ],
    'old-maid': [
        { title: "💌 Old Maid", text: "Cards come in pairs — but one is unpaired!", target: null },
        { title: "🃏 Your Turn", text: "Click any card to blindly draw from the AI. Pairs are auto-removed.", target: "#om-player-hand" },
        { title: "🎯 Goal", text: "Empty your hand first!", target: "#om-status" },
        { title: "🚀 Ready!", text: "Win for 80 coins!", target: ".primary-btn" }
    ],
    'darts': [
        { title: "🎯 Darts", text: "Click the target to throw.", target: "#darts-board" },
        { title: "🎯 Scoring", text: "Bullseye 50, inner 25, middle 15, outer 10, edge 5.", target: "#darts-board" },
        { title: "🚀 Ready!", text: "5 throws. Score 50+!", target: ".primary-btn" }
    ],
    'bowling': [
        { title: "🎳 Bowling", text: "3 frames, 2 rolls each.", target: "#bowling-alley" },
        { title: "🎯 Aim", text: "Slide the bar — keep it centered for strikes.", target: "#bowling-aim" },
        { title: "🚀 Ready!", text: "Knock down 10+ pins total!", target: ".primary-btn" }
    ],
    'gin-rummy': [
        { title: "🃏 Gin Rummy", text: "10 cards each. Collect melds.", target: null },
        { title: "🎯 Drawing", text: "Draw from stock or discard, then discard one.", target: "#gin-stock-pile" },
        { title: "🎯 Melds", text: "Sets (3+ same rank) or Runs (3+ consecutive same suit).", target: "#gin-hand" },
        { title: "🔔 Knock", text: "10+ meld points = click Knock!", target: "#gin-knock" },
        { title: "🚀 Ready!", text: "Knock first for 150 coins!", target: ".primary-btn" }
    ],
    'mini-golf': [
        { title: "⛳ Mini Golf", text: "Click and drag FROM the ball to aim.", target: "#mg-canvas" },
        { title: "🎯 Obstacles", text: "Brown blocks bounce you off. Get in the hole in ≤6 strokes.", target: "#mg-canvas" },
        { title: "🚀 Ready!", text: "Fewer strokes = more coins!", target: ".primary-btn" }
    ],
    'freecell': [
        { title: "🃏 FreeCell", text: "All 52 cards visible. Move to foundations A→K per suit.", target: null },
        { title: "🎯 Tableau", text: "8 columns. Build DOWN in alternating colors.", target: "#fc-tab" },
        { title: "📦 Free Cells", text: "4 cells hold 1 card each. Use for parking.", target: "#fc-free" },
        { title: "🚀 Ready!", text: "Solve for 200 coins!", target: ".primary-btn" }
    ],
    'hearts': [
        { title: "♥️ Hearts", text: "4 players, one card per trick. Highest of led suit wins.", target: null },
        { title: "🎯 Points", text: "Each ♥ = 1 point. Q♠ = 13. Lowest score wins!", target: "#h-trick" },
        { title: "🎯 Follow Suit", text: "Must follow led suit if possible.", target: "#h-hand" },
        { title: "🚀 Ready!", text: "Lowest score wins 150 coins!", target: ".primary-btn" }
    ],
    'cribbage': [
        { title: "🃏 Cribbage", text: "6 cards each, discard 2 to crib, cut starter, score!", target: null },
        { title: "🎯 Discard", text: "The crib scores for the dealer — don't give the AI good cards!", target: "#cr-hand" },
        { title: "🎯 Scoring", text: "15s (2pts), pairs (2pts), runs (1pt/card), flush (4-5), nobs (J of cut suit = 1).", target: "#cr-score" },
        { title: "🚀 Ready!", text: "First to 61 wins 200 coins!", target: ".primary-btn" }
    ],
    'chess': [
        { title: "♟️ Welcome to Chess!", text: "You play White. Trap the enemy king in checkmate!", target: null },
        { title: "🎯 Moving", text: "Click a white piece, then click a green dot to move or red ring to capture.", target: "#chess-board" },
        { title: "♔ Pieces", text: "Pawn 1 forward (2 from start). Knight L-shape. Bishop diagonal. Rook straight. Queen all. King 1 square.", target: "#chess-board" },
        { title: "🛡️ Check", text: "In check? You MUST escape. Checkmate = no escape, you lose.", target: "#chess-status" },
        { title: "🚀 Ready!", text: "Beat the AI for 150 coins!", target: ".primary-btn" }
    ],
    'checkers': [
        { title: "🔴 Checkers", text: "You play Red. Move diagonally forward.", target: null },
        { title: "⚔️ Forced Captures", text: "If you can jump, you MUST jump. Multi-jumps chain!", target: "#checkers-board" },
        { title: "👑 Kings", text: "Reach the far row to become a King (♛). Kings move both directions.", target: "#checkers-board" },
        { title: "🚀 Ready!", text: "Win for 100 coins!", target: ".primary-btn" }
    ],
    'jenga': [
        { title: "🧱 Jenga", text: "18 levels of 3 blocks. Pull blocks without collapsing!", target: null },
        { title: "🎯 Wobble", text: "Each pull adds to the wobble meter. Hit 100% and it collapses!", target: "#jenga-wobble" },
        { title: "⚖️ Risk", text: "Green dot = safe, yellow = risky, red = very risky. Pull 15 blocks to win!", target: "#jenga-tower" },
        { title: "🚀 Ready!", text: "Steady hands win!", target: ".primary-btn" }
    ],
    'rubiks': [
        { title: "🎨 Rubik's Cube", text: "3×3 cube shown as 2D net. Solve by making every face one color!", target: null },
        { title: "🔄 Rotations", text: "Press U, D, R, L, F, B to rotate faces. Add prime (U') for counter-clockwise.", target: ".rubik-btn" },
        { title: "🌀 Scramble", text: "Click Scramble for a 3-move scramble. You have 12 moves to solve!", target: ".btn.primary-btn" },
        { title: "💡 Hint", text: "Use the Hint button to see the next move!", target: ".rubik-btn" },
        { title: "🚀 Ready!", text: "Solve for 150 coins!", target: ".primary-btn" }
    ],
    'connect-four': [
        { title: "🔴 Connect Four", text: "You're red. Drop discs, get 4 in a row!", target: "#cf-board" },
        { title: "🎯 Strategy", text: "Control the center column. Watch for AI diagonals!", target: "#cf-board" },
        { title: "🚀 Ready!", text: "Beat the AI for 100 coins!", target: ".primary-btn" }
    ],
    'tic-tac-toe': [
        { title: "⭕ Tic-Tac-Toe", text: "You're X. Get 3 in a row!", target: "#ttt-board" },
        { title: "🎯 Strategy", text: "Center first — it's part of 4 winning lines. Then corners!", target: "#ttt-board" },
        { title: "🚀 Ready!", text: "Beat the AI for 50 coins!", target: ".primary-btn" }
    ],
    'battleship': [
        { title: "🚢 Battleship", text: "Place 4 ships, then hunt the enemy fleet!", target: "#bs-instructions" },
        { title: "🎯 Placing", text: "Click to place. Press R to rotate. Ships can't overlap.", target: "#bs-player-board" },
        { title: "💥 Firing", text: "Red ✕ = hit, gray • = miss. Sink all 4 enemy ships!", target: "#bs-ai-board" },
        { title: "🚀 Ready!", text: "Sink the fleet for 150 coins!", target: ".primary-btn" }
    ],
    'yahtzee': [
        { title: "🎲 Yahtzee", text: "Roll 5 dice, up to 3 rolls per turn. Hold the dice you keep.", target: "#yz-dice" },
        { title: "📊 Scoring", text: "13 categories — upper (Ones-Sixes), three/four of a kind, full house, straights, Yahtzee, chance.", target: "#yz-scorecard" },
        { title: "🏆 Yahtzee!", text: "5 of the same = 50 points! Use Chance as dump slot if stuck.", target: "#yz-scorecard" },
        { title: "🚀 Ready!", text: "Score 200+ for big payout!", target: ".primary-btn" }
    ],
    'mastermind': [
        { title: "🔮 Mastermind", text: "Crack the 4-color code!", target: "#mm-secret" },
        { title: "🎨 Placing", text: "Click 4 colors to build your guess, then submit. 10 guesses total.", target: "#mm-picker" },
        { title: "✅ Feedback", text: "Black ✓ = right color, right spot. White ○ = right color, wrong spot.", target: "#mm-guesses" },
        { title: "🚀 Ready!", text: "Fewer guesses = more coins!", target: ".primary-btn" }
    ],
    'othello': [
        { title: "⚫ Othello", text: "You're Black. Sandwich enemy pieces to flip them!", target: "#oth-board" },
        { title: "🎯 Legal Moves", text: "Green dots show where you can play.", target: "#oth-board" },
        { title: "🏆 Winning", text: "Most pieces when no moves remain wins. Corners are gold!", target: "#oth-status" },
        { title: "🚀 Ready!", text: "Beat the AI for 120 coins!", target: ".primary-btn" }
    ],
    'backgammon': [
        { title: "🎲 Backgammon", text: "You play White (⚪). Move checkers toward point 1, bear off all 15.", target: null },
        { title: "🎯 Moving", text: "Roll dice, click a point to select, click a green target to move.", target: "#bg-board" },
        { title: "💥 Hitting", text: "Land on a point with 1 opponent checker to send it to the bar!", target: "#bg-board" },
        { title: "🚀 Ready!", text: "Beat the AI for 200 coins!", target: ".primary-btn" }
    ],
    'wordle': [
        { title: "📝 Wordle", text: "Guess the 5-letter word in 6 tries.", target: "#wordle-board" },
        { title: "🟩🟨⬛ Feedback", text: "Green = right spot, yellow = wrong spot, gray = not in word.", target: "#wordle-status" },
        { title: "🚀 Ready!", text: "Solve in fewer guesses for more coins!", target: ".primary-btn" }
    ],
    'waffle': [
        { title: "🧇 Waffle", text: "5×5 grid with 6 words (3 rows + 3 columns).", target: "#waffle-board" },
        { title: "🔄 Swapping", text: "Click one tile, then another to swap. 10 swaps total.", target: "#waffle-board" },
        { title: "🎨 Colors", text: "Orange = locked. Green = correct. Yellow = wrong spot.", target: "#waffle-board" },
        { title: "🚀 Ready!", text: "Solve with swaps left for bonus coins!", target: ".primary-btn" }
    ],
    'scrabble': [
        { title: "🔤 Scrabble", text: "Form words on the board using your tiles.", target: null },
        { title: "🎯 Placing", text: "Click a tile, then a board cell. First word must cover center!", target: "#scrabble-board" },
        { title: "📏 Rules", text: "Words in a straight line, touch existing tiles, in the dictionary.", target: "#scrabble-rack" },
        { title: "🎁 Bonus", text: "Use all 7 tiles = +50 bingo!", target: "#scrabble-submit" },
        { title: "🚀 Ready!", text: "Score points → earn coins!", target: ".primary-btn" }
    ],
    'hangman': [
        { title: "🎯 Hangman", text: "Guess the hidden word. 6 wrong guesses allowed!", target: "#hangman-word" },
        { title: "⌨️ Typing", text: "Type or click letters. Green = correct, gray = wrong.", target: "#hangman-keyboard" },
        { title: "🚀 Ready!", text: "Fewer wrongs = more coins!", target: ".primary-btn" }
    ],
    'boggle': [
        { title: "🎰 Boggle", text: "Trace words by clicking adjacent letters in 4×4 grid.", target: "#bg-grid" },
        { title: "🎯 Building", text: "Click letters to form a word (3+ letters), then Submit.", target: "#bg-current" },
        { title: "🚀 Ready!", text: "Reach 30 points for 100 coins!", target: ".primary-btn" }
    ],
    'snake': [
        { title: "🐍 Snake", text: "Control a growing snake. Eat apples!", target: "#snake-canvas" },
        { title: "🎯 Controls", text: "Arrow keys to turn. Can't reverse into yourself.", target: "#snake-canvas" },
        { title: "💥 Game Over", text: "Hit a wall or tail = game over. Speed increases with score!", target: "#snake-status" },
        { title: "🚀 Ready!", text: "Score 100+ for achievement!", target: ".primary-btn" }
    ],
    'tetris': [
        { title: "🧱 Tetris", text: "Blocks fall. Rotate and stack to fill complete lines!", target: "#tetris-canvas" },
        { title: "🎯 Controls", text: "← → move, ↑ rotate, ↓ soft drop, Space hard drop.", target: "#tetris-canvas" },
        { title: "🏆 Scoring", text: "1/2/3/4 lines = 100/300/500/800 × level. Every 10 lines = level up!", target: "#tetris-score" },
        { title: "🚀 Ready!", text: "Score 500+ for achievement!", target: ".primary-btn" }
    ],
    'asteroids': [
        { title: "🚀 Asteroids", text: "Destroy all asteroids!", target: "#ast-canvas" },
        { title: "🎯 Controls", text: "← → rotate, ↑ thrust, Space fire. Momentum is real!", target: "#ast-canvas" },
        { title: "💥 Splitting", text: "Large asteroids split into smaller ones. Small ones worth most!", target: "#ast-score" },
        { title: "🚀 Ready!", text: "3 lives. Score 300+!", target: ".primary-btn" }
    ],
    'frogger': [
        { title: "🐸 Frogger", text: "Cross road then river. Reach home 5 times!", target: "#frog-canvas" },
        { title: "🎯 Controls", text: "Arrow keys move one cell at a time.", target: "#frog-canvas" },
        { title: "🚗 Roads & Rivers", text: "Cars kill. Logs carry you. Not on log = drown!", target: "#frog-canvas" },
        { title: "🚀 Ready!", text: "3 lives. Win for achievement!", target: ".primary-btn" }
    ],
    'dig-dug': [
        { title: "⛏️ Dig Dug", text: "Dig through dirt to hunt enemies!", target: "#dd-canvas" },
        { title: "🎯 Moving", text: "Arrow keys. Every cell you touch becomes tunnel.", target: "#dd-canvas" },
        { title: "💀 Danger", text: "Enemies chase through tunnels. Walk onto one to kill it!", target: "#dd-canvas" },
        { title: "🚀 Ready!", text: "Eliminate all 3 enemies!", target: ".primary-btn" }
    ],
    'minesweeper': [
        { title: "💣 Minesweeper", text: "9×9 grid with 10 hidden mines.", target: "#ms-board" },
        { title: "🎯 Numbers", text: "Each number = mines in 8 surrounding cells.", target: "#ms-board" },
        { title: "🚩 Flagging", text: "Right-click or toggle Flag Mode to mark mines.", target: "#ms-flag-btn" },
        { title: "🚀 Ready!", text: "Clear all 71 safe cells for 150 coins!", target: ".primary-btn" }
    ],
    'blackjack': [
        { title: "♠️ Blackjack", text: "Beat the dealer without going over 21.", target: null },
        { title: "💰 Betting", text: "Use % slider to bet. Then Deal!", target: "#bj-bet-area" },
        { title: "🃏 Your Hand", text: "Face cards = 10, Aces = 11 or 1.", target: "#player-cards" },
        { title: "➕ Hit or Stand", text: "Hit = draw. Stand = lock in. Blackjack pays 3:2!", target: "#bj-buttons" },
        { title: "🚀 Ready!", text: "Good luck!", target: ".primary-btn" }
    ],
    'baccarat': [
        { title: "🎰 Baccarat", text: "Bet on Player, Banker, or Tie.", target: null },
        { title: "🃏 Values", text: "Ace=1, 2-9=face, 10/J/Q/K=0. Total wraps (15=5).", target: "#bac-table" },
        { title: "💰 Betting", text: "Player/Banker pay 1:1. Tie pays 8:1.", target: "#bac-bet-area" },
        { title: "🚀 Ready!", text: "Good luck!", target: ".primary-btn" }
    ],
    'three-card-poker': [
        { title: "🃏 Three Card Poker", text: "You and dealer each get 3 cards.", target: null },
        { title: "🎯 Ante", text: "Place ante, then Play (match) or Fold (lose ante).", target: "#tcp-bet-area" },
        { title: "🏆 Rankings", text: "High < Pair < Flush < Straight < Trips < Straight Flush. Straights beat flushes!", target: "#tcp-game-area" },
        { title: "🎁 Ante Bonus", text: "Straight+ = bonus on ante regardless of dealer.", target: "#tcp-actions" },
        { title: "🚀 Ready!", text: "Good luck!", target: ".primary-btn" }
    ],
    'roulette': [
        { title: "🎡 Roulette", text: "37 numbers (0-36). Ball lands on one.", target: null },
        { title: "🔴 Even Money", text: "Red/Black, Odd/Even, 1-18/19-36 all pay 1:1.", target: "#roul-bets" },
        { title: "🎯 Numbers", text: "Single number = 35:1 (about 1 in 37 odds).", target: "#roul-grid" },
        { title: "🚀 Ready!", text: "Play money only!", target: ".primary-btn" }
    ],
    'craps': [
        { title: "🎲 Craps", text: "Come-out: 7/11 wins, 2/3/12 loses. Else sets point.", target: null },
        { title: "🎯 Point Phase", text: "Match the point to win. Roll 7 = lose.", target: "#craps-point" },
        { title: "💰 Betting", text: "Pick amount, click Roll.", target: "#craps-bet-area" },
        { title: "🚀 Ready!", text: "Good luck!", target: ".primary-btn" }
    ],
    'plinko': [
        { title: "🎲 Plinko", text: "Drop a ball from the top!", target: null },
        { title: "🎯 Multipliers", text: "Center buckets pay 0.2x, edges up to 10x. Real physics!", target: "#plinko-canvas" },
        { title: "🚀 Ready!", text: "Drop for big multipliers!", target: ".primary-btn" }
    ]
};

let currentTutGame = null;
let currentTutStep = 0;

function startAnimatedTutorial(gameId) {
    currentTutGame = gameId;
    currentTutStep = 0;
    document.getElementById('tutorial-modal').style.display = 'flex';
    openGame(gameId, '1-ai');
    setTimeout(renderCoachStep, 100);
}

function renderCoachStep() {
    const steps = ANIMATED_TUTORIALS[currentTutGame];
    if (!steps) return;
    const step = steps[currentTutStep];
    document.getElementById('coach-title').textContent = step.title;
    document.getElementById('coach-message').textContent = step.text;
    document.querySelectorAll('.tutorial-highlight').forEach(el => el.classList.remove('tutorial-highlight'));
    if (step.target) {
        const targetEl = document.querySelector(step.target);
        if (targetEl) {
            targetEl.classList.add('tutorial-highlight');
            targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
    if (currentTutStep >= steps.length - 1) document.getElementById('coach-next-btn').textContent = "Finish 🎉";
    else document.getElementById('coach-next-btn').textContent = "Next ➡️";
}

function nextCoachStep() {
    const steps = ANIMATED_TUTORIALS[currentTutGame];
    currentTutStep++;
    if (currentTutStep < steps.length) renderCoachStep();
    else closeTutorial();
}

function closeTutorial() {
    document.querySelectorAll('.tutorial-highlight').forEach(el => el.classList.remove('tutorial-highlight'));
    document.getElementById('tutorial-modal').style.display = 'none';
}
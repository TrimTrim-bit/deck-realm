const ANIMATED_TUTORIALS = {
    'flux-shift': [
        { title: "⚡ Welcome to Flux Shift!", text: "You'll get 6 cards. Each one goes into one of three lanes — keep every lane at 21 or below!", target: null },
        { title: "🎯 The Lanes", text: "Draw a card, then click 'Place Here' under whichever lane you want. The lane total updates instantly.", target: "#flux-lanes" },
        { title: "💥 Watch Out for Busts!", text: "If a lane goes over 21 it busts and scores 0. Safe lanes earn coins — all three safe earns a bonus!", target: "#flux-lanes" },
        { title: "🚀 Ready to Play!", text: "Click 'Got It' and press 'Draw Card' to start!", target: ".primary-btn" }
    ],
    'color-match': [
        { title: "🎨 Welcome to UNO!", text: "You and your opponent each start with 7 cards. Your goal: be the first to empty your hand!", target: null },
        { title: "🌈 Matching", text: "Play a card that matches the discard pile's colour OR number. Playable cards glow green — the rest are dim.", target: "#cm-hand" },
        { title: "🃏 Action Cards", text: "SKIP skips your opponent. REVERSE flips direction (in 2-player that's the same as Skip!). +2 forces them to draw 2 and lose a turn.", target: "#cm-hand" },
        { title: "🌟 Wilds", text: "WILD can be played anytime — you pick the colour. WILD +4 also makes the opponent draw 4, but only if you have no matching colour!", target: "#top-table-card" },
        { title: "🖐 Can't Play?", text: "Click 'Draw Card'. If the card you draw is playable, you may play it. Otherwise, your turn passes.", target: "#cm-draw" },
        { title: "🚀 Ready to Play!", text: "Empty your hand to win 60 coins. Good luck!", target: ".primary-btn" }
    ],
    'pyramid-solitaire': [
        { title: "🏛️ Pyramid Solitaire!", text: "Clear all 28 cards from the pyramid by pairing them up. Every pair must sum to exactly 13.", target: null },
        { title: "🧮 Pairing to 13", text: "Click two exposed cards whose values add to 13. Kings (value 13) clear alone. Aces = 1, Jacks = 11, Queens = 12.", target: "#pyramid-board" },
        { title: "📚 Stock & Waste", text: "When you're stuck, draw from the stock. The card shows as waste — pair it with a pyramid card if you can. You get 2 recycles!", target: "#pyr-draw" },
        { title: "🚀 Ready to Play!", text: "Clear the pyramid for 80 coins. Some puzzles are unsolvable — if you get stuck, just restart!", target: ".primary-btn" }
    ],
    'quantum-swap': [
        { title: "🌌 Quantum Swap!", text: "The portal needs two cards of a specific parity (Even or Odd). Read the portal's demand first!", target: null },
        { title: "⚛️ Stabilizers & Stability", text: "Each correct draw adds a stabilizer. Each wrong draw costs one stability heart — two wrongs and the portal collapses!", target: "#qs-board" },
        { title: "🚀 Ready to Play!", text: "Let's warp through the dimensions!", target: ".primary-btn" }
    ],
    'trash': [
        { title: "🗑️ Welcome to Trash!", text: "10 numbered slots (1–10). Your goal: fill them all before you run out of draws.", target: null },
        { title: "🔢 Placing Cards", text: "Draw a card — an Ace goes to slot 1, a 3 to slot 3, and so on. If that slot is filled, the old card chains into ITS slot!", target: "#trash-board" },
        { title: "⚡ The Chain", text: "Chains can fill multiple slots from a single draw. Watch the log below to see the chain unfold.", target: "#trash-log" },
        { title: "👑 Kings & Duds", text: "Kings are WILD — they fill any empty slot. Jacks and Queens are duds.", target: "#trash-btn" },
        { title: "🚀 Ready to Play!", text: "Fill all 10 slots for 80 coins. Good luck!", target: ".primary-btn" }
    ],
    'blackjack': [
        { title: "♠️ Vegas Blackjack!", text: "Hey rookie! The dealer wants to beat you, but we want 21. Let's look at your cards.", target: null },
        { title: "💰 Place a Bet", text: "Use the slider to choose your bet — try 25% or use a quick button. Then click 'Deal Cards'.", target: "#bj-bet-area" },
        { title: "🃏 Your Hand", text: "These are your visual playing cards. Face cards count as 10, and Aces count as 11 or 1!", target: "#player-cards" },
        { title: "➕ Hit or Stand", text: "Click 'Hit' to draw another card, or 'Stand' if your score is high enough and you want to lock it in!", target: "#bj-buttons" },
        { title: "🚀 Ready to Play!", text: "Beat the dealer without busting over 21. Let's go!", target: ".primary-btn" }
    ],
    'war': [
        { title: "⚔️ Card War!", text: "War is the easiest game ever! You and your opponent both flip over a card at the same time.", target: null },
        { title: "👑 High Card Wins", text: "Whichever card has the higher rank wins the battle and takes the loot coins!", target: "#war-board" },
        { title: "⚔️ Ties Trigger War!", text: "If both cards tie, both players burn a card and draw again. Highest card after the war wins!", target: "#war-board" },
        { title: "🚀 Ready to Play!", text: "Let's draw your first battle card!", target: ".primary-btn" }
    ],
    'go-fish': [
        { title: "🐟 Go Fish Master!", text: "You have a hand of cards. Your goal is to collect matching sets of 4-of-a-kind (called 'Books').", target: null },
        { title: "🃏 Your Visual Hand", text: "Here are your cards. Click any card to ask your opponent for that rank!", target: "#gf-hand" },
        { title: "📚 Books & Victory", text: "When you collect all 4 of a rank, that's a Book. Most books at the end wins!", target: "#gf-hand" },
        { title: "🚀 Ready to Play!", text: "Ask for cards and complete your sets. Let's play!", target: ".primary-btn" }
    ],
    'high-low': [
        { title: "🔥 Chaos High-Low!", text: "A card is shown on the table. You just have to guess if the next card will be Higher or Lower!", target: null },
        { title: "📈 Stack Multipliers", text: "Every correct guess increases your streak multiplier. One wrong guess resets it!", target: "#hl-card-box" },
        { title: "🚀 Ready to Play!", text: "Test your luck and prediction streak now!", target: ".primary-btn" }
    ],
    'mahjong': [
        { title: "🀄 Welcome to Mahjong Solitaire!", text: "A 32-tile board (4 rows × 8 columns). Your goal: clear every tile by matching pairs of the same symbol!", target: null },
        { title: "🎯 Free Tiles Only", text: "You can only click a tile if it has NO tile immediately to its left OR right. Blue border = free, gray = blocked.", target: "#mahjong-board" },
        { title: "💡 Use Hints", text: "Stuck? Click the Hint button to see a valid pair. If no pairs exist, reshuffle!", target: "#mahjong-hint" },
        { title: "🚀 Ready to Play!", text: "Clear the board for 100 coins. Good luck!", target: ".primary-btn" }
    ],
    'poker': [
        { title: "🃏 Texas Hold'em!", text: "You and the AI each get 2 private cards, then 5 community cards are dealt face-up. Best 5-card hand wins!", target: null },
        { title: "💰 Place Your Ante", text: "Use the % slider to choose your ante. Both you and the AI put in the same amount — the winner takes the pot.", target: "#poker-bet-area" },
        { title: "🃏 Betting Streets", text: "After your 2 cards (Pre-Flop), 3 community cards (Flop), 1 more (Turn), then 1 more (River). Bet or check each street.", target: "#poker-actions" },
        { title: "🎯 Hand Rankings", text: "High Card < Pair < Two Pair < Three of a Kind < Straight < Flush < Full House < Four of a Kind < Straight Flush.", target: "#poker-community" },
        { title: "🚀 Ready to Play!", text: "Ante up and see what Lady Luck deals you.", target: ".primary-btn" }
    ],
    'baccarat': [
        { title: "🎰 Welcome to Baccarat!", text: "Baccarat is all about the number 9. You're betting on which side gets closer — Player, Banker, or a Tie.", target: null },
        { title: "🃏 Card Values", text: "Aces count as 1, Tens and Face cards count as 0, and 2-9 count face value. The total wraps around, so 15 becomes 5!", target: "#bac-table" },
        { title: "💰 Picking Your Bet", text: "Bet Player or Banker for 1:1. Tie pays 8:1 but hits less often. Use the % slider to size your bet.", target: "#bac-bet-area" },
        { title: "🚀 Ready to Play!", text: "Let's ride the shoe! Click Got It and place your first bet.", target: ".primary-btn" }
    ],
    'three-card-poker': [
        { title: "🃏 Three Card Poker!", text: "You and the dealer both get 3 cards. Best hand wins — but the dealer needs at least Q-high to qualify!", target: null },
        { title: "🎯 Ante, Play, or Fold", text: "First you place an Ante bet. Then look at your cards and either Play (match your ante) or Fold (lose the ante).", target: "#tcp-bet-area" },
        { title: "🏆 Hand Rankings", text: "In 3-card poker the order is: High Card → Pair → Flush → Straight → Trips → Straight Flush. Straights beat flushes here!", target: "#tcp-game-area" },
        { title: "🎁 Ante Bonus", text: "Get a Straight or better and you win a bonus on your Ante, even if the dealer beats you.", target: "#tcp-actions" },
        { title: "🚀 Ready to Play!", text: "Ante up and see what Lady Luck deals you.", target: ".primary-btn" }
    ],
    'roulette': [
        { title: "🎡 Welcome to Roulette!", text: "A little ball spins around a wheel with 37 numbers (0-36). Wherever it lands is the winning number.", target: null },
        { title: "🔴 Even-Money Bets", text: "Bet on Red, Black, Odd, Even, 1-18, or 19-36 — all pay 1:1. Simple and safe-ish.", target: "#roul-bets" },
        { title: "🎯 Single Numbers", text: "Bet on one exact number for a huge 35:1 payout — but it only hits about 1 in 37 spins.", target: "#roul-grid" },
        { title: "🚀 Ready to Play!", text: "Pick a bet and spin the wheel. Remember — play money only!", target: ".primary-btn" }
    ],
    'craps': [
        { title: "🎲 Welcome to Craps!", text: "The classic dice game! On the come-out roll, a 7 or 11 wins, 2/3/12 loses, and anything else sets the point.", target: null },
        { title: "🎯 The Point Phase", text: "Once a point is set, roll that number again to win — but roll a 7 and you lose everything.", target: "#craps-point" },
        { title: "💰 Place Your Bet", text: "Choose your bet amount, then click Roll Dice. Both phases use the same bet until the round ends.", target: "#craps-bet-area" },
        { title: "🚀 Ready to Play!", text: "Good luck — the dice decide everything!", target: ".primary-btn" }
    ],
    'plinko': [
        { title: "🎲 Welcome to Plinko!", text: "Drop a golden ball from the top. It bounces off every peg — the bucket it lands in multiplies your bet!", target: null },
        { title: "🎯 The Multipliers", text: "Center buckets pay less (0.2x), the edges pay up to 10x! The ball physics are real — every drop is different.", target: "#plinko-canvas" },
        { title: "🚀 Ready to Play!", text: "Set your bet with the % slider and hit Drop Ball. Good luck!", target: ".primary-btn" }
    ],
    'chess': [
        { title: "♟️ Welcome to Chess!", text: "You play White. The goal: trap the enemy king in checkmate — attack him with no escape possible!", target: null },
        { title: "🎯 How to Move", text: "Click a white piece, then click a highlighted square. Legal moves show as green dots, captures show with a red ring.", target: "#chess-board" },
        { title: "♔ The Pieces", text: "Pawn moves 1 forward (2 from start). Knight is an L-shape. Bishop and Rook are long-range. Queen is all directions. King moves 1 square.", target: "#chess-board" },
        { title: "🛡️ Check & Checkmate", text: "If your king is attacked, you're in check — you MUST escape. Checkmate = no legal escape, and you lose!", target: "#chess-status" },
        { title: "🚀 Ready to Play!", text: "Beat the AI for 150 coins. Good luck!", target: ".primary-btn" }
    ],
    'checkers': [
        { title: "🔴 Welcome to Checkers!", text: "You play Red. Move diagonally one square forward. Reach the far row to become a King!", target: null },
        { title: "⚔️ Forced Captures", text: "If you can jump over an opponent piece to land behind it, you MUST. Jumping removes their piece!", target: "#checkers-board" },
        { title: "👑 Kings", text: "A Red or Black piece that reaches the opposite end becomes a King — shown with a crown. Kings can move and capture both directions!", target: "#checkers-board" },
        { title: "🚀 Ready to Play!", text: "Win for 100 coins. Good luck!", target: ".primary-btn" }
    ],
    'jenga': [
        { title: "🧱 Welcome to Jenga!", text: "The tower has 18 levels of 3 wooden blocks each. Your job: pull as many as you can without making it collapse!", target: null },
        { title: "🎯 Pulling Blocks", text: "Click any block that still has 2+ neighbors in its level. Each successful pull raises the risk of collapse by 1%.", target: "#jenga-tower" },
        { title: "⚖️ Push Your Luck", text: "Pull 20 blocks successfully to win big, but the risk grows fast. Pull 15+ for the 'Steady Hand' achievement.", target: "#jenga-count" },
        { title: "🚀 Ready to Play!", text: "Careful hands win the tower! Click Got It to start.", target: ".primary-btn" }
    ],
    'rubiks': [
        { title: "🎨 Welcome to Rubik's Cube!", text: "A real 3×3 cube shown as a 2D net. Six faces, each with 9 stickers. Solve it by making every face a single color!", target: null },
        { title: "🔄 Rotating Faces", text: "Press U, D, R, L, F, or B to rotate the corresponding face 90° clockwise. Add a prime (U', D', etc.) for counter-clockwise.", target: ".rubik-btn" },
        { title: "🌀 Scramble First", text: "Click 'Scramble' to randomize the cube. Then try to solve it. Your move count is tracked!", target: ".btn.primary-btn" },
        { title: "🚀 Ready to Play!", text: "Solving the cube earns you 150 coins. Good luck!", target: ".primary-btn" }
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
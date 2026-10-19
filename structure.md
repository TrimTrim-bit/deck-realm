# Deck Realm - Ultimate Platform Structure

deck-realm/
│
├── index.html       # 5 tabs: Hub, Board Games, Casino, Shop, Achievements
├── style.css        # All styling including chess/checkers/jenga/rubiks/toasts
├── script.js        # Controller, saves, 19 achievements, session timers, betting helper
├── games.js         # 11 card game engines + poker evaluator + card renderer
├── boardgames.js    # Chess, Checkers, Jenga, Rubik's Cube
├── casino.js        # Baccarat, Three Card Poker, Roulette, Craps, Plinko
├── betting.js       # Shared %-of-coins betting panel
├── tutorials.js     # Animated coach for all 20 games
├── audio.js         # Web Audio synthesizer with mute toggle
├── README.md        # Player-facing docs
├── start.bat        # Windows quick launcher
└── check.bat        # File integrity verification script
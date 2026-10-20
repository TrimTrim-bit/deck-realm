const PETS = {
    cat: { id: 'cat', name: 'Whiskers', icon: '🐱', price: 400, species: 'Cat', desc: 'A nimble cat who always lands on their feet.', coinBonus: 0.10, xpBonus: 0, perk: '+10% coins', tip: 'In UNO, save Wild cards for when you have 1-2 cards left.', likes: 'Sunbeams, warm laps' },
    dog: { id: 'dog', name: 'Buddy', icon: '🐶', price: 600, species: 'Dog', desc: 'Man\'s best friend and cheerleader.', coinBonus: 0, xpBonus: 0.15, perk: '+15% XP', tip: 'In Blackjack, assume the dealer\'s hidden card is worth 10.', likes: 'Walks, treats' },
    bird: { id: 'bird', name: 'Tweety', icon: '🐦', price: 800, species: 'Bird', desc: 'A chatty bird who gossips about the AI.', coinBonus: 0.05, xpBonus: 0.05, perk: '+5% coins, +5% XP', tip: 'In War, ties burn cards fast — watch your count.', likes: 'Mirrors, seeds' },
    fox: { id: 'fox', name: 'Vixen', icon: '🦊', price: 1200, species: 'Fox', desc: 'A cunning fox who knows the odds.', coinBonus: 0.20, xpBonus: 0, perk: '+20% coins', tip: 'In Poker, position matters — acting last lets you react.', likes: 'Hiding spots, tricks' },
    owl: { id: 'owl', name: 'Hoot', icon: '🦉', price: 1800, species: 'Owl', desc: 'A wise owl who has seen a thousand hands.', coinBonus: 0.05, xpBonus: 0.30, perk: '+5% coins, +30% XP', tip: 'In Mahjong, clear edge tiles first.', likes: 'Nighttime, silence' },
    dragon: { id: 'dragon', name: 'Ember', icon: '🐉', price: 2500, species: 'Dragon', desc: 'A tiny dragon hoarding coins.', coinBonus: 0.25, xpBonus: 0.10, perk: '+25% coins, +10% XP', tip: 'In Flux Shift, place high cards in lanes with 10 or fewer.', likes: 'Gold, warm rocks' }
};

const PetSystem = {
    getActive() { return state.activePet ? PETS[state.activePet] || null : null; },
    setActive(petId) {
        if (!state.unlockedPets.includes(petId)) return false;
        state.activePet = petId;
        saveGameData(); AudioFX.playWin();
        showToast(`${PETS[petId].icon} ${PETS[petId].name} is now your active companion!`, 'success', 3000);
        if (typeof renderPets === 'function') renderPets();
        return true;
    },
    buy(petId) {
        const pet = PETS[petId];
        if (!pet) return;
        if (state.unlockedPets.includes(petId)) { this.setActive(petId); return; }
        if (state.coins < pet.price) { showToast(`Need ${pet.price - state.coins} more coins.`, 'error'); return; }
        state.coins -= pet.price;
        state.unlockedPets.push(petId);
        state.activePet = petId;
        AudioFX.playWin();
        showToast(`🎉 Adopted ${pet.icon} ${pet.name}!`, 'success', 4000);
        saveGameData(); updateStatsUI();
        if (!state.achievements.firstPet.claimed) {
            state.achievements.firstPet.claimed = true;
            state.coins += state.achievements.firstPet.reward;
            showToast(`🏆 Achievement: ${state.achievements.firstPet.title}! +${state.achievements.firstPet.reward} Coins`, 'success', 4000);
            saveGameData(); updateStatsUI();
        }
        if (typeof renderPets === 'function') renderPets();
    },
    feed() {
        if (!state.activePet) { showToast('No active pet. Choose one first!', 'error'); return; }
        const today = new Date().toISOString().slice(0, 10);
        if (state.petLastFed === today) { showToast(`🍖 ${PETS[state.activePet].name} is already full!`, 'info'); return; }
        state.petLastFed = today;
        state.petMood = Math.min(100, (state.petMood || 50) + 15);
        const reward = 20 + Math.floor(Math.random() * 30);
        state.coins += reward;
        AudioFX.playWin();
        showToast(`🍖 ${PETS[state.activePet].name} eats happily! +${reward} coins in the bowl.`, 'success', 4000);
        saveGameData(); updateStatsUI();
        if (typeof renderPets === 'function') renderPets();
    },
    petPet() {
        if (!state.activePet) return;
        state.petMood = Math.min(100, (state.petMood || 50) + 5);
        AudioFX.playCardSnap();
        showToast(`❤️ ${PETS[state.activePet].name} purrs with delight!`, 'info', 2000);
        saveGameData();
        if (typeof renderPets === 'function') renderPets();
    }
};

function getPetCoinBonus() { const p = PetSystem.getActive(); return p ? (p.coinBonus || 0) : 0; }
function getPetXPBonus() { const p = PetSystem.getActive(); return p ? (p.xpBonus || 0) : 0; }
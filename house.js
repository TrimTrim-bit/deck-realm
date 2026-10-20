const ROOMS = {
    living: { id: 'living', name: 'Living Room', icon: '🛋️', price: 0, desc: 'The cozy center.', bg: 'linear-gradient(135deg, #4a3728, #6b4a30)' },
    study: { id: 'study', name: 'Study', icon: '📚', price: 500, desc: 'A quiet place to learn.', bg: 'linear-gradient(135deg, #2d3748, #4a5568)' },
    kitchen: { id: 'kitchen', name: 'Kitchen', icon: '🍳', price: 800, desc: 'Where the magic happens.', bg: 'linear-gradient(135deg, #78350f, #d97706)' },
    garden: { id: 'garden', name: 'Garden', icon: '🌿', price: 1200, desc: 'Fresh air, big bonuses.', bg: 'linear-gradient(135deg, #14532d, #16a34a)' }
};

const FURNITURE = {
    couch: { id: 'couch', name: 'Cozy Couch', icon: '🛋️', price: 200, room: 'living', bonusType: 'coins', bonusValue: 0.02, desc: '+2% coins' },
    fireplace: { id: 'fireplace', name: 'Fireplace', icon: '🔥', price: 600, room: 'living', bonusType: 'coins', bonusValue: 0.04, desc: '+4% coins' },
    plant: { id: 'plant', name: 'House Plant', icon: '🪴', price: 150, room: 'living', bonusType: 'daily', bonusValue: 10, desc: '+10 coins in daily bonus' },
    lamp: { id: 'lamp', name: 'Warm Lamp', icon: '💡', price: 250, room: 'living', bonusType: 'xp', bonusValue: 0.03, desc: '+3% XP' },
    bookshelf: { id: 'bookshelf', name: 'Bookshelf', icon: '📚', price: 300, room: 'study', bonusType: 'xp', bonusValue: 0.05, desc: '+5% XP' },
    telescope: { id: 'telescope', name: 'Telescope', icon: '🔭', price: 500, room: 'study', bonusType: 'xp', bonusValue: 0.10, desc: '+10% XP' },
    desk: { id: 'desk', name: 'Writing Desk', icon: '🪑', price: 350, room: 'study', bonusType: 'coins', bonusValue: 0.03, desc: '+3% coins' },
    fridge: { id: 'fridge', name: 'Smart Fridge', icon: '🧊', price: 700, room: 'kitchen', bonusType: 'xp', bonusValue: 0.08, desc: '+8% XP' },
    stove: { id: 'stove', name: 'Chef Stove', icon: '🍳', price: 900, room: 'kitchen', bonusType: 'coins', bonusValue: 0.06, desc: '+6% coins' },
    fountain: { id: 'fountain', name: 'Fountain', icon: '⛲', price: 1500, room: 'garden', bonusType: 'coins', bonusValue: 0.10, desc: '+10% coins' },
    cherrytree: { id: 'cherrytree', name: 'Cherry Tree', icon: '🌸', price: 1000, room: 'garden', bonusType: 'xp', bonusValue: 0.15, desc: '+15% XP' }
};

const HouseSystem = {
    getCoinBonus() {
        let total = 0;
        for (const fId in state.furniture) {
            if (state.furniture[fId]) { const f = FURNITURE[fId]; if (f && f.bonusType === 'coins') total += f.bonusValue; }
        }
        return total;
    },
    getXPBonus() {
        let total = 0;
        for (const fId in state.furniture) {
            if (state.furniture[fId]) { const f = FURNITURE[fId]; if (f && f.bonusType === 'xp') total += f.bonusValue; }
        }
        return total;
    },
    getDailyBonus() {
        let total = 0;
        for (const fId in state.furniture) {
            if (state.furniture[fId]) { const f = FURNITURE[fId]; if (f && f.bonusType === 'daily') total += f.bonusValue; }
        }
        return total;
    },
    buyRoom(roomId) {
        const room = ROOMS[roomId];
        if (!room) return;
        if (state.unlockedRooms.includes(roomId)) { showToast('You already own this room!', 'info'); return; }
        if (state.coins < room.price) { showToast(`Need ${room.price - state.coins} more coins.`, 'error'); return; }
        state.coins -= room.price;
        state.unlockedRooms.push(roomId);
        AudioFX.playWin();
        showToast(`🏠 You now own the ${room.name}!`, 'success', 4000);
        saveGameData(); updateStatsUI();
        if (typeof renderHome === 'function') renderHome();
    },
    buyFurniture(furnitureId) {
        const f = FURNITURE[furnitureId];
        if (!f) return;
        if (state.furniture[furnitureId]) { showToast('You already own this!', 'info'); return; }
        if (!state.unlockedRooms.includes(f.room)) { showToast(`You need the ${ROOMS[f.room].name} first!`, 'error'); return; }
        if (state.coins < f.price) { showToast(`Need ${f.price - state.coins} more coins.`, 'error'); return; }
        state.coins -= f.price;
        state.furniture[furnitureId] = true;
        AudioFX.playWin();
        showToast(`✅ Bought ${f.icon} ${f.name}!`, 'success', 3000);
        saveGameData(); updateStatsUI();
        const owned = Object.keys(state.furniture).filter(k => state.furniture[k]).length;
        if (owned >= 5 && !state.achievements.decorator.claimed) {
            state.achievements.decorator.claimed = true;
            state.coins += state.achievements.decorator.reward;
            showToast(`🏆 Achievement: ${state.achievements.decorator.title}! +${state.achievements.decorator.reward} Coins`, 'success', 4000);
            saveGameData(); updateStatsUI();
        }
        if (typeof renderHome === 'function') renderHome();
    }
};

function getHouseCoinBonus() { return HouseSystem.getCoinBonus(); }
function getHouseXPBonus() { return HouseSystem.getXPBonus(); }
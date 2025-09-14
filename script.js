// DOM Elements
const characterImage = document.getElementById('character-image');
const clickCount = document.getElementById('click-count');
const clicksPerSecond = document.getElementById('clicks-per-second');
const nextLevelInfo = document.getElementById('next-level-info');
const upgradeList = document.getElementById('upgrade-list');
const galleryContainer = document.getElementById('gallery-container');
const finalMessage = document.getElementById('final-message');
const feverTimeIndicator = document.getElementById('fever-time-indicator');
const clickPowerList = document.getElementById('click-power-list');
const autoClickList = document.getElementById('auto-click-list');


// Game State
let state = {
    clicks: 0,
    cps: 0,
    clicksPerClick: 1,
    luckyHeartChance: 0.01, // 1% base chance
    feverTimeChance: 0.005, // 0.5% base chance
    feverTimeActive: false,
    feverTimeEnd: 0,
    feverTimeMultiplier: 2, // CPS doubles during fever
    level: 1,
    viewingLevel: 1,
};

// Character Levels (Unchanged)
const characterLevels = [
    { level: 1, clicks: 0, image: 'images/girl_lv1.jpg' },
    { level: 2, clicks: 100, image: 'images/girl_lv2.jpg' },
    { level: 3, clicks: 1000, image: 'images/girl_lv3.jpg' },
    { level: 4, clicks: 10000, image: 'images/girl_lv4.jpg' },
    { level: 5, clicks: 100000, image: 'images/girl_lv5.jpg' },
    { level: 6, clicks: 500000, image: 'images/girl_lv6.jpg' },
    { level: 7, clicks: 2500000, image: 'images/girl_lv7.jpg' },
    { level: 8, clicks: 10000000, image: 'images/girl_lv8.jpg' },
    { level: 9, clicks: 50000000, image: 'images/girl_lv9.jpg' },
    { level: 10, clicks: 100000000, image: 'images/girl_lv10.jpg' },
];

// --- New Upgrades System ---
const clickPowerUpgrades = [
    { id: 'click_power_1', name: '+1', type: 'cpc', cost: 200, value: 1, owned: 0, icon: 'icons/C1.png' },
    { id: 'click_power_5', name: '+5', type: 'cpc', cost: 500, value: 5, owned: 0, icon: 'icons/C2.png' },
    { id: 'click_power_10', name: '+10', type: 'cpc', cost: 1500, value: 10, owned: 0, icon: 'icons/C3.png' },
    { id: 'click_power_100', name: '+100', type: 'cpc', cost: 7500, value: 100, owned: 0, icon: 'icons/C4.png' }
];

const autoClickUpgrades = [
    { id: 'auto_click_1', name: '1/s', type: 'cps', cost: 100, value: 1, owned: 0, icon: 'icons/A1.png' },
    { id: 'auto_click_5', name: '5/s', type: 'cps', cost: 300, value: 5, owned: 0, icon: 'icons/A2.png' },
    { id: 'auto_click_10', name: '10/s', type: 'cps', cost: 500, value: 10, owned: 0, icon: 'icons/A3.png' },
    { id: 'auto_click_50', name: '50/s', type: 'cps', cost: 2500, value: 50, owned: 0, icon: 'icons/A4.png' },
    { id: 'auto_click_100', name: '100/s', type: 'cps', cost: 10000, value: 100, owned: 0, icon: 'icons/A5.png' }
];

// Legacy upgrades for special effects
const specialUpgrades = [
    { id: 'lucky_heart', name: '幸運のハート', type: 'lucky_chance', cost: 500, value: 0.005, owned: 0, description: 'クリック時、幸運のハートが出現する確率が上がる。', icon: 'icons/lucky_heart.png' },
    { id: 'fever_time', name: 'フィーバータイム', type: 'fever_chance', cost: 1000, value: 0.002, owned: 0, description: 'クリック時、フィーバータイムが発動する確率が上がる。', icon: 'icons/fever_time.png' }
];

// --- Event Listeners ---

characterImage.addEventListener('click', (e) => {
    state.clicks += state.clicksPerClick;
    updateUI();

    // Normal heart effect
    const heart = document.createElement('span');
    heart.className = 'floating-heart';
    heart.textContent = '♥';
    const colors = ['#ff69b4', '#ff1493', '#c71585', '#db7093', '#da70d6', '#e60073'];
    heart.style.color = colors[Math.floor(Math.random() * colors.length)];
    heart.style.fontSize = `${Math.random() * 28 + 20}px`;
    heart.style.setProperty('--random-x', `${Math.random() * 100 - 50}px`);
    const rect = characterImage.parentElement.getBoundingClientRect();
    heart.style.left = `${e.clientX - rect.left}px`;
    heart.style.top = `${e.clientY - rect.top}px`;
    characterImage.parentElement.appendChild(heart);
    setTimeout(() => heart.remove(), 1500);

    // Check for special events
    if (Math.random() < state.luckyHeartChance) spawnLuckyHeart();
    if (Math.random() < state.feverTimeChance) activateFeverTime();
});

// --- Functions ---

function formatTime(seconds) {
    if (seconds === Infinity || seconds > 3.154e7 * 10) { // if over 10 years, just show infinity
        return '...';
    }
    if (seconds < 60) return `${Math.ceil(seconds)}秒`;
    if (seconds < 3600) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.ceil(seconds % 60);
        return `${minutes}分${remainingSeconds}秒`;
    }
    if (seconds < 86400) {
        const hours = Math.floor(seconds / 3600);
        const remainingMinutes = Math.ceil((seconds % 3600) / 60);
        return `${hours}時間${remainingMinutes}分`;
    }
    const days = Math.floor(seconds / 86400);
    const remainingHours = Math.ceil((seconds % 86400) / 3600);
    return `${days}日${remainingHours}時間`;
}


function spawnLuckyHeart() {
    const luckyHeart = document.createElement('div');
    luckyHeart.className = 'lucky-heart';
    luckyHeart.textContent = '♥';

    // Position randomly on the character image
    luckyHeart.style.left = `${Math.random() * 80 + 10}%`; // 10% to 90%
    luckyHeart.style.top = `${Math.random() * 80 + 10}%`;

    luckyHeart.onclick = () => {
        const bonus = state.cps * 30 + state.clicksPerClick * 100; // 30s of CPS + 100 clicks
        state.clicks += bonus;
        luckyHeart.remove();
    };

    characterImage.parentElement.appendChild(luckyHeart);
    setTimeout(() => luckyHeart.remove(), 5000); // Remove after 5s if not clicked
}

function spawnAutoClickHeart() {
    const heart = document.createElement('span');
    heart.className = 'floating-heart';
    heart.textContent = '♥';

    // Style for auto-click hearts (slightly different)
    const colors = ['#ff9aee', '#ff60d3', '#e742b5']; // Lighter palette
    heart.style.color = colors[Math.floor(Math.random() * colors.length)];
    heart.style.fontSize = `${Math.random() * 15 + 10}px`; // Smaller size
    heart.style.opacity = '0.7';
    heart.style.setProperty('--random-x', `${Math.random() * 60 - 30}px`);

    // Position randomly on the character image
    heart.style.left = `${Math.random() * 60 + 20}%`; // Centered horizontally
    heart.style.top = `${Math.random() * 60 + 20}%`; // Centered vertically

    characterImage.parentElement.appendChild(heart);
    setTimeout(() => heart.remove(), 1500);
}

function activateFeverTime() {
    if (state.feverTimeActive) return;
    state.feverTimeActive = true;
    state.feverTimeEnd = Date.now() + 10000;
}

window.buyUpgrade = function(id) {
    console.log(`Attempting to buy upgrade: ${id}. Current clicks: ${Math.floor(state.clicks)}`);

    let upgrade = clickPowerUpgrades.find(u => u.id === id);
    if (upgrade) {
        console.log(`Found in clickPowerUpgrades. Cost: ${upgrade.cost}`);
        if (state.clicks >= upgrade.cost) {
            console.log('Purchase affordable. Processing...');
            state.clicks -= upgrade.cost;
            upgrade.owned++;
            state.clicksPerClick += upgrade.value;
            upgrade.cost = Math.ceil(upgrade.cost * 1.25);
            console.log(`Purchase successful. New clicks: ${Math.floor(state.clicks)}. New CPC: ${state.clicksPerClick}`);
        } else {
            console.log('Purchase unaffordable.');
        }
        return;
    }

    upgrade = autoClickUpgrades.find(u => u.id === id);
    if (upgrade) {
        console.log(`Found in autoClickUpgrades. Cost: ${upgrade.cost}`);
        if (state.clicks >= upgrade.cost) {
            console.log('Purchase affordable. Processing...');
            state.clicks -= upgrade.cost;
            upgrade.owned++;
            state.cps += upgrade.value;
            upgrade.cost = Math.ceil(upgrade.cost * 1.25);
            console.log(`Purchase successful. New clicks: ${Math.floor(state.clicks)}. New CPS: ${state.cps}`);
        } else {
            console.log('Purchase unaffordable.');
        }
        return;
    }

    // No need to add logging for special upgrades for now, as the user mentioned click power and auto click.
    upgrade = specialUpgrades.find(u => u.id === id);
    if (upgrade) {
        if (state.clicks >= upgrade.cost) {
            state.clicks -= upgrade.cost;
            upgrade.owned++;
            switch (upgrade.type) {
                case 'lucky_chance': state.luckyHeartChance += upgrade.value; break;
                case 'fever_chance': state.feverTimeChance += upgrade.value; break;
            }
            upgrade.cost = Math.ceil(upgrade.cost * 1.25);
        }
    } else {
        console.log(`Upgrade with id ${id} not found.`);
    }
};

function renderClickPowerUpgrades() {
    clickPowerList.innerHTML = '';
    clickPowerUpgrades.forEach(upgrade => {
        const li = document.createElement('li');
        const canAfford = state.clicks >= upgrade.cost;
        li.className = `click-power-item upgrade-item ${canAfford ? 'affordable' : 'unaffordable'}`;
        li.style.backgroundImage = `url('${upgrade.icon}')`;

        li.innerHTML = `
            <div class="upgrade-info-overlay">
                <strong class="upgrade-name">${upgrade.name}</strong>
                <span class="upgrade-cost">${upgrade.cost.toLocaleString()} C</span>
            </div>
        `;
        
        li.addEventListener('click', () => {
            if (canAfford) {
                buyUpgrade(upgrade.id);
                updateUI();
            }
        });
        clickPowerList.appendChild(li);
    });
}

function renderAutoClickUpgrades() {
    autoClickList.innerHTML = '';
    autoClickUpgrades.forEach(upgrade => {
        const li = document.createElement('li');
        const canAfford = state.clicks >= upgrade.cost;
        li.className = `auto-click-item upgrade-item ${canAfford ? 'affordable' : 'unaffordable'}`;
        li.style.backgroundImage = `url('${upgrade.icon}')`;

        li.innerHTML = `
            <div class="upgrade-info-overlay">
                <strong class="upgrade-name">${upgrade.name}</strong>
                <span class="upgrade-cost">${upgrade.cost.toLocaleString()} C</span>
            </div>
        `;
        
        li.addEventListener('click', () => {
            if (canAfford) {
                buyUpgrade(upgrade.id);
                updateUI();
            }
        });
        autoClickList.appendChild(li);
    });
}

let gameTicks = 0;

function gameLoop() {
    gameTicks++;
    let currentCps = state.cps;
    let heartSpawnRate = 5; // Normal rate

    if (state.feverTimeActive) {
        if (Date.now() > state.feverTimeEnd) {
            state.feverTimeActive = false;
        } else {
            currentCps *= state.feverTimeMultiplier;
            heartSpawnRate = 2; // Increased heart rate
        }
    }

    // Spawn auto-click hearts periodically
    if (gameTicks % 10 === 0 && state.cps > 0) {
        const autoClickCount = Math.min(Math.ceil(state.cps / heartSpawnRate), 10);
        for (let i = 0; i < autoClickCount; i++) {
            spawnAutoClickHeart();
        }
    }

    state.clicks += currentCps / 10;
    checkLevelUp();

    // Update expensive UI less frequently (e.g., every 5 ticks = 500ms)
    if (gameTicks % 5 === 0) {
        updateUI();
    } else {
        // On other ticks, only update the most critical, fast-changing numbers
        clickCount.textContent = Math.floor(state.clicks).toLocaleString();
        const effectiveCps = state.feverTimeActive ? (state.cps * state.feverTimeMultiplier) : state.cps;
        clicksPerSecond.textContent = effectiveCps.toFixed(1);
    }
}

// --- Unchanged Functions (Gallery, LevelUp, UI) ---
// --- Image Transition & Level Up ---
let isTransitioning = false; // Global flag for any image transition

function transitionImage(newImageSrc, newViewingLevel) {
    if (isTransitioning) return;
    isTransitioning = true;

    characterImage.style.opacity = 0;

    setTimeout(() => {
        // Update src and state after fade-out
        if (newViewingLevel) {
            state.viewingLevel = newViewingLevel;
        }
        characterImage.src = newImageSrc;
        renderGallery();

        // Use rAF to ensure fade-in happens on the next frame
        requestAnimationFrame(() => {
            characterImage.style.opacity = 1;
            setTimeout(() => {
                isTransitioning = false;
            }, 300); // Allow fade-in to complete before enabling next transition
        });
    }, 300); // Corresponds to opacity transition time
}

function checkLevelUp() {
    const nextLevel = characterLevels.find(l => l.level === state.level + 1);
    if (nextLevel && state.clicks >= nextLevel.clicks && !isTransitioning) {
        state.level = nextLevel.level; // Update level immediately to prevent re-triggering
        transitionImage(nextLevel.image, nextLevel.level);

        if (state.level === characterLevels[characterLevels.length - 1].level) {
            finalMessage.textContent = 'Thank you for playing!\nCONGRATULATIONS!';
            finalMessage.classList.remove('hidden');
        }
    }
}

function selectGalleryImage(level) {
    const selected = characterLevels.find(l => l.level === level);
    if (selected && selected.level <= state.level) {
        transitionImage(selected.image, level);
    }
}

function renderGallery() {
    if (!galleryContainer) {
        return;
    }
    
    galleryContainer.innerHTML = '';
    characterLevels.forEach(levelInfo => {
        if (levelInfo.level <= state.level) {
            const thumb = document.createElement('img');
            thumb.src = levelInfo.image;
            thumb.className = 'gallery-thumbnail';
            if (levelInfo.level === state.viewingLevel) thumb.classList.add('selected');
            thumb.onclick = () => selectGalleryImage(levelInfo.level);
            galleryContainer.appendChild(thumb);
        }
    });
}

function updateUI() {
    clickCount.textContent = Math.floor(state.clicks).toLocaleString();
    const effectiveCps = state.feverTimeActive ? (state.cps * state.feverTimeMultiplier) : state.cps;
    clicksPerSecond.textContent = effectiveCps.toFixed(1);

    // Fever Time UI Management
    if (state.feverTimeActive) {
        const remaining = Math.max(0, state.feverTimeEnd - Date.now());
        feverTimeIndicator.textContent = `FEVER TIME! (${(remaining / 1000).toFixed(1)}s)`;
        feverTimeIndicator.classList.remove('hidden');
        feverTimeIndicator.classList.add('active');
        document.body.classList.add('fever-active');
    } else {
        feverTimeIndicator.classList.add('hidden');
        feverTimeIndicator.classList.remove('active');
        document.body.classList.remove('fever-active');
    }
    
    const nextLevel = characterLevels.find(l => l.level === state.level + 1);
    if (nextLevel) {
        const clicksNeeded = nextLevel.clicks - state.clicks;
        if (clicksNeeded > 0) {
            const timeToNextLevel = effectiveCps > 0 ? clicksNeeded / effectiveCps : Infinity;
            let infoText = `次のレベル (Lv.${nextLevel.level}) まであと ${Math.ceil(clicksNeeded).toLocaleString()} クリック`;
            if (timeToNextLevel !== Infinity) {
                infoText += ` (約 ${formatTime(timeToNextLevel)})`;
            }
            nextLevelInfo.textContent = infoText;
        } else {
            nextLevelInfo.textContent = `レベルアップ可能！`;
        }
    } else {
        nextLevelInfo.textContent = 'すべてのレベルをクリアしました！';
    }

    updateUpgradeButtons(); // Call the new lightweight function
}

function updateUpgradeButtons() {
    // Re-render both upgrade lists to update visual states
    renderClickPowerUpgrades();
    renderAutoClickUpgrades();
}


// --- Save/Load ---
const saveButton = document.getElementById('save-button');
const loadButton = document.getElementById('load-button');
const SAVE_KEY = 'clickerGirlSave';

function saveGame() {
    const saveData = { 
        state, 
        clickPowerUpgrades, 
        autoClickUpgrades, 
        specialUpgrades 
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
}

function loadGame() {
    const savedData = localStorage.getItem(SAVE_KEY);
    if (savedData) {
        const parsedData = JSON.parse(savedData);
        // Overwrite state and upgrades carefully
        Object.assign(state, parsedData.state);
        
        if (parsedData.clickPowerUpgrades) {
            parsedData.clickPowerUpgrades.forEach((savedUpgrade, index) => {
                Object.assign(clickPowerUpgrades[index], savedUpgrade);
            });
        }
        
        if (parsedData.autoClickUpgrades) {
            parsedData.autoClickUpgrades.forEach((savedUpgrade, index) => {
                Object.assign(autoClickUpgrades[index], savedUpgrade);
            });
        }
        
        if (parsedData.specialUpgrades) {
            parsedData.specialUpgrades.forEach((savedUpgrade, index) => {
                Object.assign(specialUpgrades[index], savedUpgrade);
            });
        }
        
        renderClickPowerUpgrades(); // Re-render upgrades with loaded data
        renderAutoClickUpgrades();
        updateUI();
        renderGallery();
        const currentImage = characterLevels.find(l => l.level === state.viewingLevel)?.image;
        if (currentImage) characterImage.src = currentImage;
    }
}

saveButton.addEventListener('click', () => {
    saveGame();
    alert('ゲームをセーブしました！');
});
loadButton.addEventListener('click', () => {
    loadGame();
    alert('ロードしました！');
});

// --- Initialization & Animation ---
function initializeGame() {
    const characterContainer = document.getElementById('character-container');
    const initialImageSrc = characterLevels.find(l => l.level === 1)?.image;

    if (initialImageSrc) {
        const img = new Image();
        img.onload = function() {
            // Set the container's aspect ratio based on the first image
            characterContainer.style.aspectRatio = this.naturalWidth + ' / ' + this.naturalHeight;

            // Now set the main image src
            characterImage.src = initialImageSrc;

            // Run animation loop after the container is sized
            setTimeout(() => {
                animationLoop();
            }, 500);
        };
        img.src = initialImageSrc;
    }

    renderClickPowerUpgrades(); // Initial render of click power upgrades
    renderAutoClickUpgrades(); // Initial render of auto click upgrades
    updateUI();
    renderGallery();
}

const animState = {
    isZoomed: false,
    lastDuration: '8s',
    lastOrigin: '50% 50%',
};

function animationLoop() {
    // キャラクター画像が存在することを確認
    if (!characterImage) {
        console.warn('Character image not found, retrying animation loop...');
        setTimeout(animationLoop, 1000);
        return;
    }

    if (!animState.isZoomed) {
        // --- ZOOM IN ---
        // より広いスピード範囲（2秒〜12秒）でランダムに決定
        const randomDuration = (2 + Math.random() * 10).toFixed(2);
        // 画像の中央付近のより広い範囲（30%〜70%）でランダムに中心点を決定
        const randomOriginX = (30 + Math.random() * 40).toFixed(2);
        const randomOriginY = (30 + Math.random() * 40).toFixed(2);
        const randomScale = (1.1 + Math.random() * 0.5).toFixed(2);

        const newOrigin = `${randomOriginX}% ${randomOriginY}%`;
        const newTransform = `scale(${randomScale})`;
        
        animState.lastOrigin = newOrigin;
        animState.lastDuration = `${randomDuration}s`;

        characterImage.style.transition = `transform ${randomDuration}s ease-in-out, opacity 0.3s ease-in-out`;
        characterImage.style.transformOrigin = newOrigin;
        characterImage.style.transform = newTransform;
        
        animState.isZoomed = true;
        setTimeout(animationLoop, randomDuration * 1000);

    } else {
        // --- ZOOM OUT ---
        characterImage.style.transition = `transform ${animState.lastDuration} ease-in-out, opacity 0.3s ease-in-out`;
        characterImage.style.transformOrigin = animState.lastOrigin; // Use the same origin
        characterImage.style.transform = 'scale(1)'; // Go back to base scale

        animState.isZoomed = false;
        setTimeout(animationLoop, parseFloat(animState.lastDuration) * 1000);
    }
}

// DOMContentLoadedイベントで初期化を確実に実行
document.addEventListener('DOMContentLoaded', function() {
    initializeGame();
    // loadGame(); // Auto-load is disabled
    setInterval(gameLoop, 100);
});

// Disable right-click on all images
document.addEventListener('contextmenu', function(e) {
  if (e.target.tagName === 'IMG') {
    e.preventDefault();
  }
});
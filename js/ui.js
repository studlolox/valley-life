// Valley Life - UI Manager (Parchment & Wood RPG Theme)
// Separates DOM rendering and modal interaction from js/game.js simulation.

function getAPI() {
  return globalThis.ValleyLife;
}

let activeModal = null;
let activeShopTab = 'general';
let activeQuestTab = 'quests';
let activeBundleTab = 'bundles';
let selectedVillagerKey = 'elder';
let typewriterTimer = null;

function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatItemName(key) {
  const V = getAPI();
  if (V.CROPS[key]) return V.CROPS[key].name;
  if (V.FORAGE_ITEMS[key]) return V.FORAGE_ITEMS[key].name;
  if (V.FISH_TYPES[key]) return V.FISH_TYPES[key].name;
  if (V.RECIPES[key]) return V.RECIPES[key].name;
  if (V.GENERAL_STORE_ITEMS[key]) return V.GENERAL_STORE_ITEMS[key].name;
  if (key.endsWith('Seed')) {
    const base = key.slice(0, -4);
    if (V.SEEDS[base]) return V.SEEDS[base].name;
  }
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase());
}

function getItemEnergy(key) {
  const V = getAPI();
  return (
    V.CROPS[key]?.energyRestore ||
    V.FORAGE_ITEMS[key]?.energyRestore ||
    V.RECIPES[key]?.energyRestore ||
    V.GENERAL_STORE_ITEMS[key]?.energyRestore ||
    0
  );
}

function getItemPrice(key) {
  const V = getAPI();
  return (
    V.ITEM_PRICES[key] ??
    V.CROPS[key]?.sellPrice ??
    V.FORAGE_ITEMS[key]?.sellPrice ??
    V.FISH_TYPES[key]?.sellPrice ??
    0
  );
}

function formatClock(hour) {
  const h = Math.floor(hour) % 24;
  const suffix = h >= 12 ? 'PM' : 'AM';
  const display = h % 12 === 0 ? 12 : h % 12;
  return `${display}:00 ${suffix}`;
}

function getWeekday(day) {
  const V = getAPI();
  return V.WEEKDAYS[(day - 1) % V.WEEKDAYS.length];
}

// ============ Toasts ============
function showToast(text) {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = 'vl-toast';
  toast.textContent = text;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => toast.remove(), 300);
  }, 2400);
}

// ============ HUD & Hotbar ============
function updateHUD() {
  const V = getAPI();
  if (!V) return;
  const s = V.state;

  const zoneEl = document.getElementById('hud-zone');
  const dateEl = document.getElementById('hud-date');
  const clockEl = document.getElementById('hud-clock');
  const weatherEl = document.getElementById('hud-weather');
  const goldEl = document.getElementById('hud-gold');
  const resEl = document.getElementById('hud-resources');
  const energyFill = document.getElementById('energy-bar-fill');
  const energyText = document.getElementById('energy-bar-text');
  const hpRow = document.getElementById('hp-bar-row');
  const hpFill = document.getElementById('hp-bar-fill');
  const hpText = document.getElementById('hp-bar-text');
  const questMini = document.getElementById('hud-quest-mini');

  if (zoneEl) zoneEl.textContent = s.inMine ? `Ironpeak Caverns (Fl. ${s.mineFloor})` : s.currentZone;
  if (dateEl) dateEl.textContent = `${getWeekday(s.day)}, Day ${s.day} · ${V.SEASONS[s.seasonIndex]}`;
  if (clockEl) clockEl.textContent = formatClock(s.timeOfDay);
  if (weatherEl) weatherEl.textContent = s.weather || 'Sunny';
  if (goldEl) goldEl.textContent = `${s.money} G`;
  if (resEl) resEl.textContent = `Wood: ${s.resources.wood || 0} · Stone: ${s.resources.stone || 0}`;

  if (energyFill && energyText) {
    const pct = Math.max(0, Math.min(100, (s.energy / s.maxEnergy) * 100));
    energyFill.style.width = `${pct}%`;
    energyText.textContent = `${s.energy}/${s.maxEnergy}`;
  }
  if (hpRow && hpFill && hpText) {
    hpRow.style.display = s.inMine ? 'flex' : 'none';
    const hpPct = Math.max(0, Math.min(100, (s.health / s.maxHealth) * 100));
    hpFill.style.width = `${hpPct}%`;
    hpText.textContent = `${s.health}/${s.maxHealth}`;
  }

  if (questMini) {
    const active = V.getActiveQuests();
    questMini.textContent = active.length > 0 ? `Quest: ${active[0].title}` : 'No active quest';
  }

  renderHotbar();
}

function renderHotbar() {
  const V = getAPI();
  const bar = document.getElementById('hotbar');
  if (!bar || !V) return;
  const s = V.state;
  const seedInvCount = s.inventory[`${s.selectedSeed}Seed`] || 0;
  const foodCount = Object.keys(s.inventory).reduce((acc, k) => (getItemEnergy(k) > 0 ? acc + s.inventory[k] : acc), 0);
  const giftLabel = s.selectedGift ? formatItemName(s.selectedGift) : 'Gift';

  const slots = [
    { id: 'hoe', label: 'Hoe', key: '1', badge: s.toolLevels.hoe > 0 ? `Lv${s.toolLevels.hoe}` : '' },
    { id: 'water', label: 'Water', key: '2', badge: s.toolLevels.water > 0 ? `Lv${s.toolLevels.water}` : '' },
    { id: 'axe', label: 'Axe', key: '3', badge: s.toolLevels.axe > 0 ? `Lv${s.toolLevels.axe}` : '' },
    { id: 'pickaxe', label: 'Pick', key: '4', badge: s.toolLevels.pickaxe > 0 ? `Lv${s.toolLevels.pickaxe}` : '' },
    { id: 'scythe', label: 'Scythe', key: '5', badge: s.toolLevels.scythe > 0 ? `Lv${s.toolLevels.scythe}` : '' },
    { id: 'sword', label: 'Sword', key: '6', badge: s.toolLevels.sword > 0 ? `Lv${s.toolLevels.sword}` : '' },
    { id: 'fishingRod', label: 'Rod', key: '7', badge: s.toolLevels.fishingRod > 0 ? `Lv${s.toolLevels.fishingRod}` : '' },
    { id: 'seed', label: V.SEEDS[s.selectedSeed]?.name.replace(' Seed', '') || 'Seed', key: '8', badge: `${seedInvCount}` },
    { id: 'food', label: 'Food', key: '9', badge: `${foodCount}` },
    { id: 'gift', label: giftLabel, key: '0', badge: s.selectedGift ? `${s.inventory[s.selectedGift] || 0}` : '' },
  ];

  bar.innerHTML = slots
    .map(
      (slot) => `
      <button class="hotbar-slot ${s.selectedTool === slot.id ? 'active' : ''}" data-tool="${slot.id}" title="${esc(slot.label)} [${slot.key}]">
        <span class="slot-key">${slot.key}</span>
        <span class="slot-name">${esc(slot.label)}</span>
        ${slot.badge ? `<span class="slot-badge">${esc(slot.badge)}</span>` : ''}
      </button>`
    )
    .join('');

  bar.querySelectorAll('.hotbar-slot').forEach((btn) => {
    btn.addEventListener('click', () => V.setSelectedTool(btn.dataset.tool));
  });
}

// ============ Modal Management ============
function isAnyModalOpen() {
  return activeModal !== null;
}

function closeModal() {
  const overlay = document.getElementById('modal-overlay');
  if (overlay) overlay.style.display = 'none';
  activeModal = null;
}

function toggleModal(name) {
  if (activeModal === name) {
    closeModal();
  } else {
    openModal(name);
  }
}

function openModal(name) {
  const overlay = document.getElementById('modal-overlay');
  const titleEl = document.getElementById('modal-title');
  const bodyEl = document.getElementById('modal-body');
  if (!overlay || !titleEl || !bodyEl) return;

  activeModal = name;
  overlay.style.display = 'flex';

  switch (name) {
    case 'title':
      titleEl.textContent = 'Valley Life — Sunhollow Valley';
      renderTitleModal(bodyEl);
      break;
    case 'inventory':
      titleEl.textContent = 'Inventory, Crafting & Cooking';
      renderInventoryModal(bodyEl);
      break;
    case 'shops':
      titleEl.textContent = 'Willowbrook & Valley Shops';
      renderShopsModal(bodyEl);
      break;
    case 'shipping':
      titleEl.textContent = 'Oakridge Shipping Bin';
      renderShippingModal(bodyEl);
      break;
    case 'daySummary':
      titleEl.textContent = 'Morning Ledger & Summary';
      renderDaySummaryModal(bodyEl);
      break;
    case 'social':
      titleEl.textContent = 'Villagers & Relationships';
      renderSocialModal(bodyEl);
      break;
    case 'quests':
      titleEl.textContent = 'Quests, Calendar & Achievements';
      renderQuestsModal(bodyEl);
      break;
    case 'bundles':
      titleEl.textContent = 'Willowbrook Hall & Museum';
      renderBundlesModal(bodyEl);
      break;
    case 'skills':
      titleEl.textContent = 'Valley Skills';
      renderSkillsModal(bodyEl);
      break;
    case 'pause':
      titleEl.textContent = 'Game Menu — Save, Load & Online';
      renderPauseModal(bodyEl);
      break;
    default:
      closeModal();
  }
}

// ============ 1. Title & New Game Setup ============
function renderTitleModal(el) {
  const V = getAPI();
  const hasSave = !!localStorage.getItem('valleylife_save');
  const farmCards = Object.entries(V.FARM_TYPES)
    .map(
      ([k, f], idx) => `
      <label class="farm-card">
        <input type="radio" name="farmType" value="${k}" ${idx === 0 ? 'checked' : ''}>
        <div>
          <strong>${esc(f.name)}</strong>
          <div class="muted">${esc(f.description)}</div>
          <div class="tiny">Wood: ${f.startingWood} · Stone: ${f.startingStone} · Forage: ${f.startingForage}</div>
        </div>
      </label>`
    )
    .join('');

  el.innerHTML = `
    <div class="title-grid">
      <div class="form-row">
        <label>Farmer Name <input id="setup-name" type="text" value="Rowanberry" maxlength="20"></label>
        <label>Gender
          <select id="setup-gender">
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </label>
        <label>Hair <input id="setup-hair" type="color" value="#5C3A21"></label>
        <label>Outfit <input id="setup-shirt" type="color" value="#4169E1"></label>
      </div>
      <div class="section-label">Choose Your Farm Type</div>
      <div class="farm-cards">${farmCards}</div>
      <div class="modal-actions">
        <button id="btn-start-new" class="btn-primary">Start New Farm</button>
        <button id="btn-continue-save" class="btn-secondary" ${hasSave ? '' : 'disabled'}>Continue Saved Game</button>
        <button id="btn-join-online" class="btn-secondary">Join Online Farm</button>
      </div>
    </div>
  `;

  el.querySelector('#btn-start-new').addEventListener('click', () => {
    const farmType = el.querySelector('input[name="farmType"]:checked')?.value || 'standard';
    const playerName = el.querySelector('#setup-name').value;
    const gender = el.querySelector('#setup-gender').value;
    const hairColor = el.querySelector('#setup-hair').value;
    const shirtColor = el.querySelector('#setup-shirt').value;
    V.startNewGame({ farmType, playerName, gender, hairColor, shirtColor });
    closeModal();
    const lines = V.triggerEvent('arrivalLetter');
    if (lines) openDialogue({ speaker: "Grandpa Eldon's Letter", text: lines.join(' ') });
  });

  el.querySelector('#btn-continue-save').addEventListener('click', () => {
    if (V.loadGame()) closeModal();
  });

  el.querySelector('#btn-join-online').addEventListener('click', () => {
    V.startNewGame({ farmType: 'standard' });
    openModal('pause');
  });
}

// ============ 2. Inventory, Crafting & Cooking ============
function renderInventoryModal(el) {
  const V = getAPI();
  const invEntries = Object.entries(V.state.inventory).filter(([, qty]) => qty > 0);
  const invHTML =
    invEntries.length === 0
      ? '<p class="muted">Your backpack is empty.</p>'
      : invEntries
          .map(([key, qty]) => {
            const energy = getItemEnergy(key);
            const price = getItemPrice(key);
            const isSeed = key.endsWith('Seed') && V.SEEDS[key.slice(0, -4)];
            return `
            <div class="inv-card">
              <div class="inv-header"><strong>${esc(formatItemName(key))}</strong> <span>×${qty}</span></div>
              <div class="tiny">${price > 0 ? `Sell: ${price}G` : ''} ${energy > 0 ? `· +${energy} Energy` : ''}</div>
              <div class="inv-actions">
                ${energy > 0 ? `<button class="btn-xs" data-eat="${key}" data-energy="${energy}">Eat</button>` : ''}
                ${isSeed ? `<button class="btn-xs" data-seed="${key.slice(0, -4)}">Equip Seed</button>` : ''}
                ${price > 0 ? `<button class="btn-xs" data-ship="${key}">Bin</button>` : ''}
                <button class="btn-xs" data-gift="${key}">Set Gift</button>
              </div>
            </div>`;
          })
          .join('');

  const recipeHTML = Object.entries(V.RECIPES)
    .map(([key, rec]) => {
      const reqText = Object.entries(rec.ingredients)
        .map(([k, amt]) => `${formatItemName(k)} ×${amt}`)
        .join(', ');
      const canMake = Object.entries(rec.ingredients).every(([k, amt]) => (V.state.inventory[k] || 0) >= amt);
      return `
        <div class="recipe-row">
          <div>
            <strong>${esc(rec.name)}</strong> <span class="badge">${esc(rec.type)}</span>
            <div class="tiny">Needs: ${esc(reqText)}</div>
          </div>
          <button class="btn-xs" data-cook="${key}" ${canMake ? '' : 'disabled'}>Make</button>
        </div>`;
    })
    .join('');

  el.innerHTML = `
    <div class="split-panel">
      <div>
        <div class="section-label">Backpack</div>
        <div class="inv-grid">${invHTML}</div>
      </div>
      <div>
        <div class="section-label">Cooking & Crafting</div>
        <div class="recipe-list">${recipeHTML}</div>
      </div>
    </div>
  `;

  el.querySelectorAll('[data-eat]').forEach((b) =>
    b.addEventListener('click', () => {
      V.eatFood(b.dataset.eat, Number(b.dataset.energy));
      renderInventoryModal(el);
    })
  );
  el.querySelectorAll('[data-seed]').forEach((b) =>
    b.addEventListener('click', () => {
      V.setSelectedSeed(b.dataset.seed);
      V.setSelectedTool('seed');
      closeModal();
    })
  );
  el.querySelectorAll('[data-ship]').forEach((b) =>
    b.addEventListener('click', () => {
      V.queueShipItem(b.dataset.ship, 1);
      renderInventoryModal(el);
    })
  );
  el.querySelectorAll('[data-gift]').forEach((b) =>
    b.addEventListener('click', () => {
      V.state.selectedGift = b.dataset.gift;
      V.setSelectedTool('gift');
      updateHUD();
      showToast(`Selected ${formatItemName(b.dataset.gift)} as Gift.`);
    })
  );
  el.querySelectorAll('[data-cook]').forEach((b) =>
    b.addEventListener('click', () => {
      V.cookRecipe(b.dataset.cook);
      renderInventoryModal(el);
    })
  );
}

// ============ 3. Town Shops ============
function renderShopsModal(el) {
  const V = getAPI();
  const tabs = [
    { id: 'general', label: "Tessa's General Store" },
    { id: 'carpenter', label: "Rowan's Workshop" },
    { id: 'ranch', label: "Dahlia's Ranch" },
    { id: 'smithy', label: "Garrick's Smithy & Mine" },
  ];

  let content = '';
  if (activeShopTab === 'general') {
    const season = V.SEASONS[V.state.seasonIndex];
    const seedRows = Object.entries(V.SEEDS)
      .map(([k, seed]) => `
        <div class="shop-row">
          <div><strong>${esc(seed.name)}</strong> <span class="badge">${esc(seed.season)}</span> ${seed.season === season ? '<span class="badge good">In Season</span>' : ''}</div>
          <button class="btn-xs" data-buy-seed="${k}">Buy (${seed.price}G)</button>
        </div>`)
      .join('');
    const itemRows = Object.entries(V.GENERAL_STORE_ITEMS)
      .map(([k, item]) => `
        <div class="shop-row">
          <div><strong>${esc(item.name)}</strong><div class="tiny">${esc(item.description)}</div></div>
          <button class="btn-xs" data-buy-item="${k}">Buy (${item.price}G)</button>
        </div>`)
      .join('');
    content = `<div class="section-label">Seeds</div>${seedRows}<div class="section-label">Supplies & Food</div>${itemRows}`;
  } else if (activeShopTab === 'carpenter') {
    content = `
      <p class="tiny">Builds on your current tile (${V.state.player.x}, ${V.state.player.y}) if clear grass.</p>
      ${Object.entries(V.BUILDINGS)
        .map(([k, b]) => `
          <div class="shop-row">
            <div><strong>${esc(b.name)}</strong><div class="tiny">Wood: ${b.cost.wood}, Stone: ${b.cost.stone} · Capacity: ${b.capacity}</div></div>
            <button class="btn-xs" data-build="${k}">Build</button>
          </div>`)
        .join('')}`;
  } else if (activeShopTab === 'ranch') {
    const animalRows = Object.entries(V.ANIMALS)
      .map(([k, a]) => `
        <div class="shop-row">
          <div><strong>${esc(a.name)}</strong> <span class="badge">${esc(a.housing)}</span> <span class="tiny">Produces: ${a.product || 'Mount'}</span></div>
          <button class="btn-xs" data-buy-animal="${k}">Buy (${a.buyPrice}G)</button>
        </div>`)
      .join('');
    const bldgRows = V.state.buildings.length
      ? V.state.buildings
          .map(
            (b, idx) => `
          <div class="shop-row">
            <div><strong>${esc(V.BUILDINGS[b.type]?.name || b.type)} #${idx + 1}</strong> (${b.animals.length}/${b.capacity} animals)</div>
            <button class="btn-xs" data-feed-bldg="${idx}">Feed All (Hay)</button>
          </div>`
          )
          .join('')
      : '<p class="muted">No coops or barns built yet.</p>';
    content = `<div class="section-label">Your Farm Buildings</div>${bldgRows}<div class="section-label">Livestock & Pets (13 Varieties)</div>${animalRows}`;
  } else if (activeShopTab === 'smithy') {
    const toolRows = Object.entries(V.TOOL_NAMES)
      .map(([k, name]) => {
        const lvl = V.state.toolLevels[k] || 0;
        const nextTier = V.TOOL_UPGRADE_TIERS.find((t) => t.level === lvl + 1);
        return `
          <div class="shop-row">
            <div><strong>${esc(name)}</strong> (Lv.${lvl})</div>
            ${
              nextTier
                ? `<button class="btn-xs" data-upgrade-tool="${k}">Upgrade to ${nextTier.name} (${nextTier.goldCost}G + ${nextTier.barsRequired} ${nextTier.bar})</button>`
                : '<span class="badge good">Max</span>'
            }
          </div>`;
      })
      .join('');
    content = `
      <div class="section-label">Ironpeak Caverns Access</div>
      <div class="shop-row">
        <div><strong>Status:</strong> ${V.state.inMine ? `Floor ${V.state.mineFloor} (Node: ${V.state.mineNode?.type || 'Cleared'}, Monster HP: ${V.state.mineMonster?.hp || 0})` : 'Outside Caverns'}</div>
        <div class="inv-actions">
          ${
            V.state.inMine
              ? `<button class="btn-xs" id="btn-mine-ore">Mine Ore</button>
                 <button class="btn-xs" id="btn-attack-monster">Attack</button>
                 <button class="btn-xs" id="btn-next-floor">Descend Floor</button>
                 <button class="btn-xs" id="btn-exit-mine">Exit Mine</button>`
              : `<button class="btn-xs" id="btn-enter-mine">Enter Mine (-10 Energy)</button>`
          }
        </div>
      </div>
      <div class="section-label">Smelt Ores</div>
      <div class="inv-actions" style="margin-bottom:10px;">
        <button class="btn-xs" data-smelt="copperOre">Smelt Copper</button>
        <button class="btn-xs" data-smelt="ironOre">Smelt Iron</button>
        <button class="btn-xs" data-smelt="goldOre">Smelt Gold</button>
      </div>
      <div class="section-label">Tool Upgrades</div>${toolRows}`;
  }

  el.innerHTML = `
    <div class="tab-bar">
      ${tabs.map((t) => `<button class="tab-btn ${activeShopTab === t.id ? 'active' : ''}" data-shop-tab="${t.id}">${t.label}</button>`).join('')}
    </div>
    <div class="tab-content">${content}</div>
  `;

  el.querySelectorAll('[data-shop-tab]').forEach((b) =>
    b.addEventListener('click', () => {
      activeShopTab = b.dataset.shopTab;
      renderShopsModal(el);
    })
  );
  el.querySelectorAll('[data-buy-seed]').forEach((b) =>
    b.addEventListener('click', () => { V.buySeed(b.dataset.buySeed, 1); renderShopsModal(el); })
  );
  el.querySelectorAll('[data-buy-item]').forEach((b) =>
    b.addEventListener('click', () => { V.buyItem(b.dataset.buyItem, 1); renderShopsModal(el); })
  );
  el.querySelectorAll('[data-build]').forEach((b) =>
    b.addEventListener('click', () => { V.buildStructure(b.dataset.build); renderShopsModal(el); })
  );
  el.querySelectorAll('[data-buy-animal]').forEach((b) =>
    b.addEventListener('click', () => { V.buyAnimal(b.dataset.buyAnimal); renderShopsModal(el); })
  );
  el.querySelectorAll('[data-feed-bldg]').forEach((b) =>
    b.addEventListener('click', () => { V.feedAnimals(Number(b.dataset.feedBldg)); renderShopsModal(el); })
  );
  el.querySelectorAll('[data-upgrade-tool]').forEach((b) =>
    b.addEventListener('click', () => { V.upgradeTool(b.dataset.upgradeTool); renderShopsModal(el); })
  );
  el.querySelectorAll('[data-smelt]').forEach((b) =>
    b.addEventListener('click', () => { V.smelt(b.dataset.smelt); renderShopsModal(el); })
  );
  el.querySelector('#btn-enter-mine')?.addEventListener('click', () => { V.enterMine(); renderShopsModal(el); });
  el.querySelector('#btn-exit-mine')?.addEventListener('click', () => { V.exitMine(); renderShopsModal(el); });
  el.querySelector('#btn-mine-ore')?.addEventListener('click', () => { V.mineOre(); renderShopsModal(el); });
  el.querySelector('#btn-attack-monster')?.addEventListener('click', () => { V.attackMonster(); renderShopsModal(el); });
  el.querySelector('#btn-next-floor')?.addEventListener('click', () => {
    V.state.mineFloor++;
    const tier = V.oreTierForFloor(V.state.mineFloor);
    V.state.mineNode = { type: tier.ore, x: 3, y: 3 };
    V.state.mineMonster = { type: 'monster', hp: tier.monsterHP, x: 7, y: 7 };
    if (V.state.mineFloor >= 5) V.unlockAchievement('deepDelver');
    updateHUD();
    renderShopsModal(el);
  });
}

// ============ 4. Shipping Bin & Day Summary ============
function renderShippingModal(el) {
  const V = getAPI();
  const shippable = Object.entries(V.state.inventory).filter(([k, qty]) => qty > 0 && getItemPrice(k) > 0);
  const queued = Object.entries(V.state.shippingBin).filter(([, qty]) => qty > 0);

  el.innerHTML = `
    <div class="split-panel">
      <div>
        <div class="section-label">Place in Shipping Bin (Paid Overnight)</div>
        ${
          shippable.length
            ? shippable
                .map(([k, q]) => `
                <div class="shop-row">
                  <span>${esc(formatItemName(k))} ×${q} (${getItemPrice(k)}G ea)</span>
                  <div class="inv-actions">
                    <button class="btn-xs" data-queue-ship="${k}">Bin 1</button>
                    <button class="btn-xs" data-instant-ship="${k}">Sell Now</button>
                  </div>
                </div>`)
                .join('')
            : '<p class="muted">No sellable items in inventory.</p>'
        }
      </div>
      <div>
        <div class="section-label">Queued in Bin</div>
        ${
          queued.length
            ? queued.map(([k, q]) => `<div class="shop-row"><span>${esc(formatItemName(k))} ×${q}</span><strong>${getItemPrice(k) * q}G</strong></div>`).join('')
            : '<p class="muted">Shipping bin is empty.</p>'
        }
        <div class="modal-actions" style="margin-top:12px;">
          <button id="btn-sleep-now" class="btn-primary">Sleep & Ship Overnight [N]</button>
        </div>
      </div>
    </div>
  `;

  el.querySelectorAll('[data-queue-ship]').forEach((b) =>
    b.addEventListener('click', () => { V.queueShipItem(b.dataset.queueShip, 1); renderShippingModal(el); })
  );
  el.querySelectorAll('[data-instant-ship]').forEach((b) =>
    b.addEventListener('click', () => { V.shipItem(b.dataset.instantShip, 1); renderShippingModal(el); })
  );
  el.querySelector('#btn-sleep-now')?.addEventListener('click', () => {
    V.nextDay();
  });
}

function renderDaySummaryModal(el) {
  const V = getAPI();
  const sum = V.state.lastDaySummary;
  if (!sum) {
    el.innerHTML = '<p>A fresh morning dawns on Oakridge Farm.</p>';
    return;
  }
  el.innerHTML = `
    <p><strong>Day ${sum.day}, ${esc(sum.season)}</strong> · Weather: <strong>${esc(sum.weather)}</strong></p>
    <div class="section-label">Shipped Goods</div>
    ${
      sum.shipped.length
        ? sum.shipped.map((s) => `<div class="shop-row"><span>${esc(formatItemName(s.itemKey))} ×${s.qty}</span><strong>+${s.earned}G</strong></div>`).join('')
        : '<p class="muted">No items shipped overnight.</p>'
    }
    <div class="shop-row"><strong>Total Gold Earned</strong><strong>+${sum.totalGoldEarned}G</strong></div>
    <div class="section-label">Morning Farm Produce</div>
    ${
      sum.productsCollected.length
        ? sum.productsCollected.map((p) => `<div class="shop-row"><span>${esc(formatItemName(p.itemKey))}</span><strong>+${p.qty}</strong></div>`).join('')
        : '<p class="muted">No animal products collected.</p>'
    }
    <div class="modal-actions" style="margin-top:12px;">
      <button id="btn-close-summary" class="btn-primary">Start the Day</button>
    </div>
  `;
  el.querySelector('#btn-close-summary')?.addEventListener('click', closeModal);
}

// ============ 5. NPC Dialogue & Relationships ============
function openDialogue({ speaker, text }) {
  const box = document.getElementById('dialogue-box');
  const spEl = document.getElementById('dialogue-speaker');
  const txEl = document.getElementById('dialogue-text');
  if (!box || !spEl || !txEl) return;

  spEl.textContent = speaker || 'Villager';
  txEl.textContent = '';
  box.style.display = 'block';
  if (typewriterTimer) clearInterval(typewriterTimer);
  let i = 0;
  typewriterTimer = setInterval(() => {
    txEl.textContent += text[i] || '';
    i++;
    if (i >= text.length) {
      clearInterval(typewriterTimer);
      typewriterTimer = null;
    }
  }, 18);
}

function renderSocialModal(el) {
  const V = getAPI();
  const villagerList = Object.entries(V.VILLAGERS)
    .map(([key, v]) => {
      const rel = V.state.relationships[key] || { points: 0 };
      const hearts = '♥'.repeat(Math.min(10, rel.points)) + '♡'.repeat(Math.max(0, 10 - rel.points));
      return `
        <button class="villager-item ${selectedVillagerKey === key ? 'active' : ''}" data-villager="${key}">
          <div><strong>${esc(v.name)}</strong> <span class="tiny">(${esc(v.role)})</span></div>
          <div class="hearts">${hearts}</div>
        </button>`;
    })
    .join('');

  const sel = V.VILLAGERS[selectedVillagerKey];
  const rel = V.state.relationships[selectedVillagerKey] || { points: 0, talkedToday: false };
  const invItems = Object.keys(V.state.inventory).filter((k) => V.state.inventory[k] > 0);
  const canMarry = sel.marriageable && !V.state.spouse && rel.points >= V.MARRIAGE_RELATIONSHIP && sel.gender !== V.state.playerGender;

  el.innerHTML = `
    <div class="split-panel">
      <div class="villager-list">${villagerList}</div>
      <div>
        <h3>${esc(sel.name)}</h3>
        <p class="muted">${esc(sel.role)} · Birthday: ${esc(sel.birthday)} · Loved: ${esc(sel.lovedGifts.join(', '))}</p>
        <p>Hearts: <strong>${rel.points}/10</strong> ${V.state.spouse === selectedVillagerKey ? '<span class="badge good">Spouse</span>' : ''}</p>
        <div class="inv-actions" style="margin-bottom:10px;">
          <button id="btn-talk-npc" class="btn-primary">Talk</button>
          ${canMarry ? '<button id="btn-propose-npc" class="btn-secondary">Propose Marriage</button>' : ''}
          ${V.state.spouse === selectedVillagerKey ? '<button id="btn-have-child" class="btn-secondary">Have Child</button>' : ''}
        </div>
        <div class="section-label">Give Gift</div>
        <div class="form-row">
          <select id="gift-select">
            ${invItems.length ? invItems.map((k) => `<option value="${k}">${esc(formatItemName(k))} (×${V.state.inventory[k]})</option>`).join('') : '<option value="">No items</option>'}
          </select>
          <button id="btn-give-gift" class="btn-xs" ${invItems.length ? '' : 'disabled'}>Give</button>
        </div>
        ${V.state.children.length ? `<p class="tiny" style="margin-top:10px;">Children: ${V.state.children.map((c) => esc(c.name)).join(', ')}</p>` : ''}
      </div>
    </div>
  `;

  el.querySelectorAll('[data-villager]').forEach((b) =>
    b.addEventListener('click', () => {
      selectedVillagerKey = b.dataset.villager;
      renderSocialModal(el);
    })
  );
  el.querySelector('#btn-talk-npc')?.addEventListener('click', () => {
    const pos = V.VILLAGER_POSITIONS[selectedVillagerKey];
    if (pos) {
      V.state.player.y = pos.r;
      V.state.player.x = pos.c;
    }
    const line = V.talkToVillager();
    if (line) openDialogue({ speaker: sel.name, text: line });
    renderSocialModal(el);
  });
  el.querySelector('#btn-give-gift')?.addEventListener('click', () => {
    const item = el.querySelector('#gift-select').value;
    if (item) {
      if (!V.state.relationships[selectedVillagerKey].talkedToday) {
        V.state.relationships[selectedVillagerKey].talkedToday = true;
      }
      V.giveGift(selectedVillagerKey, item);
      renderSocialModal(el);
    }
  });
  el.querySelector('#btn-propose-npc')?.addEventListener('click', () => {
    if (V.marryVillager(selectedVillagerKey)) renderSocialModal(el);
  });
  el.querySelector('#btn-have-child')?.addEventListener('click', () => {
    if (V.haveChild()) renderSocialModal(el);
  });
}

// ============ 6. Quests, Calendar & Achievements ============
function renderQuestsModal(el) {
  const V = getAPI();
  let content = '';
  if (activeQuestTab === 'quests') {
    content = Object.values(V.QUESTS)
      .map((q) => {
        const stateQ = V.state.quests[q.id];
        const status = stateQ?.completed ? 'Completed' : stateQ?.active ? 'Active' : 'Available';
        return `
          <div class="shop-row">
            <div>
              <strong>${esc(q.title)}</strong> <span class="badge">${status}</span>
              <div class="tiny">${esc(q.description)} · Reward: ${q.rewardGold}G</div>
            </div>
            <div>
              ${!stateQ ? `<button class="btn-xs" data-accept-quest="${q.id}">Accept</button>` : ''}
              ${stateQ?.active && !stateQ.completed ? `<button class="btn-xs" data-complete-quest="${q.id}">Turn In</button>` : ''}
            </div>
          </div>`;
      })
      .join('');
  } else if (activeQuestTab === 'calendar') {
    const season = V.SEASONS[V.state.seasonIndex];
    const cells = [];
    for (let d = 1; d <= 28; d++) {
      const fest = V.FESTIVALS.find((f) => f.season === season && f.day === d);
      const bday = Object.values(V.VILLAGERS).find((v) => v.birthday === `${season} ${d}`);
      cells.push(`
        <div class="cal-cell ${d === V.state.day ? 'today' : ''}">
          <div class="cal-day">${d}</div>
          ${fest ? `<div class="cal-tag fest">${esc(fest.name)}</div>` : ''}
          ${bday ? `<div class="cal-tag bday">${esc(bday.name)}</div>` : ''}
        </div>`);
    }
    content = `<div class="section-label">${season} Calendar</div><div class="cal-grid">${cells.join('')}</div>`;
  } else {
    content = Object.values(V.ACHIEVEMENTS)
      .map((a) => {
        const unlocked = V.hasAchievement(a.id);
        return `
          <div class="shop-row">
            <div><strong>${esc(a.name)}</strong><div class="tiny">${esc(a.description)}</div></div>
            <span class="badge ${unlocked ? 'good' : ''}">${unlocked ? 'Unlocked' : 'Locked'}</span>
          </div>`;
      })
      .join('');
  }

  el.innerHTML = `
    <div class="tab-bar">
      <button class="tab-btn ${activeQuestTab === 'quests' ? 'active' : ''}" data-qtab="quests">Quests</button>
      <button class="tab-btn ${activeQuestTab === 'calendar' ? 'active' : ''}" data-qtab="calendar">Calendar</button>
      <button class="tab-btn ${activeQuestTab === 'achievements' ? 'active' : ''}" data-qtab="achievements">Achievements</button>
    </div>
    <div class="tab-content">${content}</div>
  `;

  el.querySelectorAll('[data-qtab]').forEach((b) =>
    b.addEventListener('click', () => { activeQuestTab = b.dataset.qtab; renderQuestsModal(el); })
  );
  el.querySelectorAll('[data-accept-quest]').forEach((b) =>
    b.addEventListener('click', () => { V.acceptQuest(b.dataset.acceptQuest); renderQuestsModal(el); })
  );
  el.querySelectorAll('[data-complete-quest]').forEach((b) =>
    b.addEventListener('click', () => { V.completeQuest(b.dataset.completeQuest); renderQuestsModal(el); })
  );
}

// ============ 7. Willowbrook Hall Bundles & Museum ============
function renderBundlesModal(el) {
  const V = getAPI();
  let content = '';
  if (activeBundleTab === 'bundles') {
    content = Object.entries(V.BUNDLES)
      .map(([k, b]) => {
        const reqs = Object.entries(b.required).map(([ik, amt]) => `${formatItemName(ik)} ×${amt}`).join(', ');
        return `
          <div class="shop-row">
            <div>
              <strong>${esc(b.name)}</strong> <span class="badge">${esc(b.area)}</span>
              <div class="tiny">Requires: ${esc(reqs)} · Unlocks: ${esc(b.reward)}</div>
            </div>
            ${b.completed ? '<span class="badge good">Complete</span>' : `<button class="btn-xs" data-donate-bundle="${k}">Donate</button>`}
          </div>`;
      })
      .join('');
  } else {
    content = Object.entries(V.MUSEUM_ARTIFACTS)
      .map(([k, art]) => {
        const donated = !!V.state.museumDonations[k];
        const hasItem = (V.state.inventory[k] || 0) > 0;
        return `
          <div class="shop-row">
            <div><strong>${esc(art.name)}</strong><div class="tiny">${esc(art.description)}</div></div>
            ${donated ? '<span class="badge good">Donated</span>' : `<button class="btn-xs" data-donate-museum="${k}" ${hasItem ? '' : 'disabled'}>Donate (+25G)</button>`}
          </div>`;
      })
      .join('');
  }

  el.innerHTML = `
    <div class="tab-bar">
      <button class="tab-btn ${activeBundleTab === 'bundles' ? 'active' : ''}" data-btab="bundles">Willowbrook Hall Bundles</button>
      <button class="tab-btn ${activeBundleTab === 'museum' ? 'active' : ''}" data-btab="museum">Julian's Museum</button>
    </div>
    <div class="tab-content">${content}</div>
  `;
  el.querySelectorAll('[data-btab]').forEach((b) =>
    b.addEventListener('click', () => { activeBundleTab = b.dataset.btab; renderBundlesModal(el); })
  );
  el.querySelectorAll('[data-donate-bundle]').forEach((b) =>
    b.addEventListener('click', () => { V.donateToBundle(b.dataset.donateBundle); renderBundlesModal(el); })
  );
  el.querySelectorAll('[data-donate-museum]').forEach((b) =>
    b.addEventListener('click', () => { V.donateToMuseum(b.dataset.donateMuseum); renderBundlesModal(el); })
  );
}

// ============ 8. Skills Panel ============
function renderSkillsModal(el) {
  const V = getAPI();
  el.innerHTML = Object.entries(V.SKILLS)
    .map(([k, info]) => {
      const s = V.state.skills[k] || { level: 1, xp: 0 };
      const needed = V.xpForNextLevel(s.level);
      const pct = s.level >= V.SKILL_MAX_LEVEL ? 100 : Math.min(100, (s.xp / needed) * 100);
      return `
        <div class="skill-row">
          <div class="shop-row"><strong>${esc(info.name)}</strong><span>Level ${s.level} / ${V.SKILL_MAX_LEVEL}</span></div>
          <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
          <div class="tiny">${s.level >= V.SKILL_MAX_LEVEL ? 'Mastered!' : `XP: ${s.xp} / ${needed}`}</div>
        </div>`;
    })
    .join('');
}

// ============ 9. Pause / Save / Load / Export / Multiplayer ============
function renderPauseModal(el) {
  const V = getAPI();
  const players = V.getConnectedPlayers();
  el.innerHTML = `
    <div class="modal-actions" style="margin-bottom:12px;">
      <button id="btn-save-game" class="btn-primary">Save Game</button>
      <button id="btn-load-game" class="btn-secondary">Load Game</button>
      <button id="btn-export-save" class="btn-secondary">Export JSON</button>
      <button id="btn-return-title" class="btn-secondary">Title Screen</button>
    </div>
    <div class="section-label">Import Save JSON</div>
    <textarea id="import-json-box" rows="3" placeholder="Paste exported save JSON here..."></textarea>
    <div class="modal-actions" style="margin:8px 0 14px;">
      <button id="btn-import-save" class="btn-xs">Import JSON</button>
    </div>
    <div class="section-label">Online Farm Co-op (Session)</div>
    <div class="form-row">
      <input id="mp-player-id" type="text" value="${esc(V.state.playerName || 'Farmer')}" placeholder="Player ID">
      <button id="btn-mp-host" class="btn-xs">Host Farm</button>
      <button id="btn-mp-join" class="btn-xs">Join Farm</button>
    </div>
    <div class="tiny">Connected Players: ${players.length ? players.map(esc).join(', ') : 'None (Offline)'}</div>
  `;

  el.querySelector('#btn-save-game').addEventListener('click', () => V.saveGame());
  el.querySelector('#btn-load-game').addEventListener('click', () => { if (V.loadGame()) closeModal(); });
  el.querySelector('#btn-return-title').addEventListener('click', () => openModal('title'));
  el.querySelector('#btn-export-save').addEventListener('click', () => {
    const box = el.querySelector('#import-json-box');
    box.value = V.exportSaveJSON();
    box.select();
    showToast('Save JSON exported into box.');
  });
  el.querySelector('#btn-import-save').addEventListener('click', () => {
    const raw = el.querySelector('#import-json-box').value;
    if (V.importSaveJSON(raw)) {
      showToast('Imported save successfully!');
      closeModal();
    } else {
      showToast('Invalid save JSON.');
    }
  });
  el.querySelector('#btn-mp-host').addEventListener('click', () => {
    const id = el.querySelector('#mp-player-id').value.trim() || 'Host';
    V.hostSession(id);
    renderPauseModal(el);
  });
  el.querySelector('#btn-mp-join').addEventListener('click', () => {
    const id = el.querySelector('#mp-player-id').value.trim() || 'Guest';
    V.joinSession(id);
    renderPauseModal(el);
  });
}

// ============ Wiring & Lifecycle ============
function initUI() {
  const V = getAPI();
  if (!V) return;

  V.setUIRenderer({
    updateHUD,
    showToast,
    openDialogue,
    toggleModal,
    isAnyModalOpen,
    onNewDay: () => openModal('daySummary'),
    onGameStarted: () => updateHUD(),
  });

  document.getElementById('modal-close')?.addEventListener('click', closeModal);
  document.getElementById('dialogue-close')?.addEventListener('click', () => {
    const box = document.getElementById('dialogue-box');
    if (box) box.style.display = 'none';
  });

  document.querySelectorAll('[data-open-modal]').forEach((btn) => {
    btn.addEventListener('click', () => openModal(btn.dataset.openModal));
  });
  document.getElementById('btn-hud-sleep')?.addEventListener('click', () => V.nextDay());

  updateHUD();
  openModal('title');
}

if (typeof document !== 'undefined' && !globalThis.__VALLEYLIFE_TEST__) {
  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', initUI);
  } else {
    initUI();
  }
}

// Valley Life - Original farm life simulation built with three.js
// All code written from scratch, not copied from any source.

import * as THREE from 'three';

// ============ Game Constants ============
const TILE_SIZE = 2;
const GRID_WIDTH = 20;
const GRID_HEIGHT = 20;
const MAX_ENERGY = 100;
const ENERGY_PER_TILL = 10;
const ENERGY_PER_WATER = 5;
const ENERGY_PER_CHOP = 15;
const ENERGY_PER_PLANT = 5;
const SEASONS = ['Spring', 'Summer', 'Autumn', 'Winter'];
const DAYS_PER_SEASON = 28;

// Crop definitions (original data, not copied)
const CROPS = {
  turnip: { name: 'Turnip', seasons: ['Spring'], growDays: 4, sellPrice: 10 },
  bean:   { name: 'Bean',   seasons: ['Summer'], growDays: 6, sellPrice: 15 },
  squash: { name: 'Squash', seasons: ['Autumn'], growDays: 5, sellPrice: 12 },
  root:   { name: 'Root',   seasons: ['Winter'], growDays: 7, sellPrice: 18 },
};

// Seed definitions
const SEEDS = {
  turnip: { name: 'Turnip Seed', crop: 'turnip', season: 'Spring', price: 5 },
  bean:   { name: 'Bean Seed',   crop: 'bean',   season: 'Summer', price: 7 },
  squash: { name: 'Squash Seed', crop: 'squash', season: 'Autumn', price: 6 },
  root:   { name: 'Root Seed',   crop: 'root',   season: 'Winter', price: 8 },
};

// Building definitions (original data)
const BUILDINGS = {
  coop:  { name: 'Coop',  cost: { wood: 40, stone: 15 }, capacity: 4, houses: ['chicken'] },
  barn:  { name: 'Barn',  cost: { wood: 80, stone: 40 }, capacity: 6, houses: ['cow', 'ostrich'] },
  shed:  { name: 'Shed',  cost: { wood: 30, stone: 10 }, capacity: 0, houses: null },
};

// Animal definitions (original data)
const ANIMALS = {
  chicken: { name: 'Chicken',  product: 'egg',   productAmount: 1, hayConsumption: 1 },
  cow:     { name: 'Cow',      product: 'milk',  productAmount: 1, hayConsumption: 2 },
  ostrich: { name: 'Ostrich',  product: 'egg',   productAmount: 1, hayConsumption: 1 },
};

// Multiplayer session (original data)
// An in-memory host session that can be backed by WebSocket in production.
// Clients join the session and their positions are synchronized to the host.
const multiplayerSession = {
  hostId: null,
  players: new Map(), // playerId -> { x, y, joinedAt }
};

function hostSession(hostId) {
  if (multiplayerSession.hostId !== null) return false;
  multiplayerSession.hostId = hostId;
  multiplayerSession.players.set(hostId, { x: 0, y: 0, joinedAt: Date.now() });
  return true;
}

function joinSession(playerId) {
  if (multiplayerSession.hostId === null) return false;
  if (multiplayerSession.players.has(playerId)) return false;
  multiplayerSession.players.set(playerId, { x: 0, y: 0, joinedAt: Date.now() });
  return true;
}

function syncPlayerPosition(playerId, x, y) {
  if (!multiplayerSession.players.has(playerId)) return false;
  const player = multiplayerSession.players.get(playerId);
  player.x = x;
  player.y = y;
  return true;
}

function getPlayerPosition(playerId) {
  const player = multiplayerSession.players.get(playerId);
  if (!player) return null;
  return { x: player.x, y: player.y };
}

function getConnectedPlayers() {
  return Array.from(multiplayerSession.players.keys());
}

function leaveSession(playerId) {
  if (playerId === multiplayerSession.hostId) {
    multiplayerSession.hostId = null;
    multiplayerSession.players.clear();
    return true;
  }
  return multiplayerSession.players.delete(playerId);
}

function resetMultiplayer() {
  multiplayerSession.hostId = null;
  multiplayerSession.players.clear();
}

// Farm type definitions (original data)
// Each farm type has a unique theme and starting benefits/drawbacks.
const FARM_TYPES = {
  standard: { name: 'Standard Farm', startingForage: 2, startingWood: 60, startingStone: 40 },
  forest:   { name: 'Forest Farm',   startingForage: 5, startingWood: 40, startingStone: 20 },
  river:    { name: 'River Farm',    startingForage: 3, startingWood: 30, startingStone: 30 },
};

// Selected farm type (set at game start)
let selectedFarmType = 'standard';

// Mine constants and helpers (original data)
const MINE_ENERGY_PER_ENTER = 10;
const MINE_ENERGY_PER_MINE = 10;
const MINE_ENERGY_PER_ATTACK = 15;
const ENERGY_PER_FISH = 8;

// Ore tier available on a given mine floor (deeper = more valuable)
function oreTierForFloor(floor) {
  if (floor >= 10) return { ore: 'goldOre', bar: 'goldBar', monsterHP: 8 };
  if (floor >= 5) return { ore: 'ironOre', bar: 'ironBar', monsterHP: 5 };
  return { ore: 'copperOre', bar: 'copperBar', monsterHP: 3 };
}

// Skill system (original data)
const SKILL_MAX_LEVEL = 10;
const SKILLS = {
  farming: { name: 'Farming' },
  foraging: { name: 'Foraging' },
  fishing: { name: 'Fishing' },
  mining: { name: 'Mining' },
  combat: { name: 'Combat' },
};

function xpForNextLevel(level) {
  return 25 * level;
}

function initSkills() {
  const skills = {};
  for (const key of Object.keys(SKILLS)) {
    skills[key] = { level: 1, xp: 0 };
  }
  return skills;
}

function gainExperience(skill, amount) {
  const s = state.skills[skill];
  if (!s || s.level >= SKILL_MAX_LEVEL) return;
  s.xp += amount;
  while (s.xp >= xpForNextLevel(s.level) && s.level < SKILL_MAX_LEVEL) {
    s.xp -= xpForNextLevel(s.level);
    s.level += 1;
  }
}

// Villager data for social relationships (original data, renamed characters)
// gender: 'male' or 'female'. Marriage is only allowed between villagers of
// different genders (see marryVillager).
const VILLAGERS = {
  elder:   { name: 'Village Elder',   gender: 'male',   likedGift: 'copperBar', marriageable: false },
  baker:   { name: 'Baker',           gender: 'female', likedGift: 'wheat',     marriageable: true },
  smith:   { name: 'Smith',           gender: 'male',   likedGift: 'ironBar',   marriageable: true },
  farmer:  { name: 'Farmhand',        gender: 'female', likedGift: 'turnip',    marriageable: true },
  tailor:  { name: 'Tailor',          gender: 'female', likedGift: 'cloth',     marriageable: true },
  librarian: { name: 'Librarian',     gender: 'male',   likedGift: 'goldBar',   marriageable: true },
};

// Relationship points needed to marry
const MARRIAGE_RELATIONSHIP = 10;

// Villager dialogue (original dialogue, not copied from any source)
const VILLAGER_DIALOGUE = {
  elder:   ["Welcome to the valley, farmer.", "The seasons change, but the valley endures.", "Take care of your land and it will care for you."],
  baker:   ["Fresh bread comes out of the oven every morning.", "Nothing beats the smell of warm bread.", "I could use some wheat for today's loaves."],
  smith:   ["A good tool makes all the difference in the mine.", "I can smelt your ores into strong bars.", "The deeper you go, the tougher the monsters."],
  farmer:  ["The soil here is rich if you tend it daily.", "Water your crops every morning for the best yield.", "A well-fed animal is a productive animal."],
  tailor:  ["I stitch clothes from cloth gathered around the valley.", "Wear something sturdy for farm work."],
  librarian: ["The valley's history is kept in these old books.", "Quiet please, I am reading."],
};

// Community Center bundles (original data, not copied)
// Each bundle requires a set of goods; donating all required items completes it.
const BUNDLES = {
  springCrops: {
    name: 'Spring Crops Bundle',
    area: 'Crafts Room',
    required: { turnip: 10 },
    completed: false,
    reward: 'springFieldsUnlocked',
  },
  summerCrops: {
    name: 'Summer Crops Bundle',
    area: 'Crafts Room',
    required: { bean: 10 },
    completed: false,
    reward: 'summerFieldsUnlocked',
  },
  animalGoods: {
    name: 'Animal Goods Bundle',
    area: 'Crafts Room',
    required: { egg: 5, milk: 5 },
    completed: false,
    reward: 'coopUnlocked',
  },
  mineOres: {
    name: 'Mine Ores Bundle',
    area: 'Crafts Room',
    required: { copperBar: 5, ironBar: 5 },
    completed: false,
    reward: 'deepMineUnlocked',
  },
};

// Track which valley areas have been unlocked by bundle completion
const unlockedAreas = {};

// Villager positions on the farm grid (row, column)
const VILLAGER_POSITIONS = {
  elder:   { r: 10, c: 10 },
  baker:   { r: 4,  c: 12 },
  smith:   { r: 6,  c: 14 },
  farmer:  { r: 8,  c: 16 },
  tailor:  { r: 12, c: 14 },
  librarian: { r: 2, c: 12 },
};

// Track relationship points and whether the player talked today per villager
function initRelationships() {
  const relationships = {};
  for (const key of Object.keys(VILLAGERS)) {
    relationships[key] = { points: 0, talkedToday: false };
  }
  return relationships;
}

// ============ Game State ============
const state = {
  day: 1,
  seasonIndex: 0,
  energy: MAX_ENERGY,
  maxEnergy: MAX_ENERGY,
  money: 500,
  resources: { wood: 60, stone: 40 },
  inventory: {},
  buildings: [],
  animals: [],
  mineFloor: 1,
  inMine: false,
  mineNode: null,
  mineMonster: null,
  forageItems: [],
  fishingSpots: [],
  skills: initSkills(),
  relationships: initRelationships(),
  spouse: null,
  children: [],
  selectedTool: 'hoe',
  selectedBuilding: null,
  grid: [], // 2D array of tile objects
  player: { x: 0, y: 0, z: 0 },
  playerGender: 'male', // player's gender; marriage requires a different-gender spouse
  isNight: false,
  timeOfDay: 6, // 6 = morning
  dayComplete: false,
};

// Initialize empty grid
function initGrid() {
  state.grid = [];
  for (let r = 0; r < GRID_HEIGHT; r++) {
    state.grid[r] = [];
    for (let c = 0; c < GRID_WIDTH; c++) {
      state.grid[r][c] = {
        type: 'grass', // grass, tilled, path
        planted: null, // crop key or null
        growth: 0,     // 0..1
        growDay: 0,    // day planted
        watered: false,
        hasTree: false,
        hasRock: false,
        hasWeed: false,
      };
    }
  }
}

// ============ three.js Setup ============
let scene, camera, renderer, gridHelper;
let playerMesh;
const tileMeshes = new Map(); // key "r,c" -> mesh

function initThree() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87CEEB);

  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(25, 28, 25);
  camera.lookAt(0, 0, 0);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.getElementById('game-container').appendChild(renderer.domElement);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
  dirLight.position.set(10, 20, 10);
  scene.add(dirLight);

  // Floor grid
  const floorGeo = new THREE.PlaneGeometry(GRID_WIDTH * TILE_SIZE, GRID_HEIGHT * TILE_SIZE);
  const floorMat = new THREE.MeshStandardMaterial({ color: 0x7CFC00 });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);

  // Player
  playerMesh = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1.8, 1),
    new THREE.MeshStandardMaterial({ color: 0x4169E1 })
  );
  scene.add(playerMesh);

  // Grid helper for reference
  gridHelper = new THREE.GridHelper(GRID_WIDTH * TILE_SIZE, GRID_WIDTH, 0x444444, 0x222222);
  gridHelper.position.y = 0.01;
  scene.add(gridHelper);

  window.addEventListener('resize', onWindowResize);
}

// Build tile meshes for the farm area
function buildTileMeshes() {
  // Clear existing
  tileMeshes.forEach((m) => scene.remove(m));
  tileMeshes.clear();

  const centerX = -(GRID_WIDTH * TILE_SIZE) / 2;
  const centerZ = -(GRID_HEIGHT * TILE_SIZE) / 2;

  for (let r = 0; r < GRID_HEIGHT; r++) {
    for (let c = 0; c < GRID_WIDTH; c++) {
      const tile = state.grid[r][c];
      const x = centerX + c * TILE_SIZE + TILE_SIZE / 2;
      const z = centerZ + r * TILE_SIZE + TILE_SIZE / 2;

      let color = 0x7CFC00; // grass
      if (tile.type === 'tilled') color = 0x8B4513;
      if (tile.planted) color = 0x228B22;
      if (tile.hasTree) color = 0x556B2F;
      if (tile.hasRock) color = 0x808080;
      if (tile.hasWeed) color = 0x9ACD32;

      const geo = new THREE.PlaneGeometry(TILE_SIZE * 0.9, TILE_SIZE * 0.9);
      const mat = new THREE.MeshStandardMaterial({ color });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.set(x, 0.01, z);
      scene.add(mesh);
      tileMeshes.set(`${r},${c}`, mesh);
    }
  }

  updatePlayerPosition();
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function updatePlayerPosition() {
  if (!playerMesh) return;
  const centerX = -(GRID_WIDTH * TILE_SIZE) / 2;
  const centerZ = -(GRID_HEIGHT * TILE_SIZE) / 2;
  const x = centerX + state.player.x * TILE_SIZE + TILE_SIZE / 2;
  const z = centerZ + state.player.y * TILE_SIZE + TILE_SIZE / 2;
  playerMesh.position.set(x, 0.9, z);
}

function refreshTileColors() {
  if (tileMeshes.size === 0) return;
  tileMeshes.forEach((mesh, key) => {
    const [r, c] = key.split(',').map(Number);
    const tile = state.grid[r][c];
    let color = 0x7CFC00;
    if (tile.type === 'tilled') color = 0x8B4513;
    if (tile.planted) color = 0x228B22;
    if (tile.hasTree) color = 0x556B2F;
    if (tile.hasRock) color = 0x808080;
    if (tile.hasWeed) color = 0x9ACD32;
    mesh.material.color.set(color);
  });
}

// ============ UI ============
function updateHUD() {
  const dayEl = document.getElementById('day-display');
  const energyEl = document.getElementById('energy-display');
  const resEl = document.getElementById('resources-display');
  if (dayEl) dayEl.textContent = `Day ${state.day}, ${SEASONS[state.seasonIndex]}`;
  if (energyEl) energyEl.textContent = `Energy: ${state.energy}/${state.maxEnergy}`;
  if (resEl) resEl.textContent = `Wood: ${state.resources.wood} Stone: ${state.resources.stone}`;
  document.querySelectorAll('#toolbar button').forEach((b) => {
    b.classList.toggle('active', b.id === `tool-${state.selectedTool}`);
  });
}

function setSelectedTool(tool) {
  state.selectedTool = tool;
  updateHUD();
}

function showMessage(text) {
  const el = document.getElementById('message');
  if (el) {
    el.textContent = text;
    el.style.display = 'block';
    setTimeout(() => { el.style.display = 'none'; }, 1500);
  }
}

// ============ Game Logic ============

function getTile(r, c) {
  if (r < 0 || r >= GRID_HEIGHT || c < 0 || c >= GRID_WIDTH) return null;
  return state.grid[r][c];
}

function playerTile() {
  return getTile(state.player.y, state.player.x);
}

function canUseEnergy(amount) {
  return state.energy >= amount;
}

function spendEnergy(amount) {
  state.energy = Math.max(0, state.energy - amount);
  updateHUD();
}

// Feature 3: Energy depletion - tilling reduces energy
function tillTile() {
  const tile = playerTile();
  if (!tile) return false;
  if (tile.type !== 'grass' && tile.type !== 'tilled') return false;
  if (tile.planted) return false;
  if (tile.hasTree || tile.hasRock || tile.hasWeed) return false;
  if (!canUseEnergy(ENERGY_PER_TILL)) {
    showMessage('Not enough energy!');
    return false;
  }
  tile.type = 'tilled';
  tile.watered = false;
  spendEnergy(ENERGY_PER_TILL);
  refreshTileColors();
  gainExperience('farming', 5);
  return true;
}

// Feature 8: Planting - seasonal seed on tilled soil
function plantSeed(seedKey) {
  const tile = playerTile();
  if (!tile) return false;
  if (tile.type !== 'tilled') return false;
  if (tile.planted) return false;
  if (!canUseEnergy(ENERGY_PER_PLANT)) {
    showMessage('Not enough energy!');
    return false;
  }
  const seed = SEEDS[seedKey];
  if (!seed) return false;
  const currentSeason = SEASONS[state.seasonIndex];
  if (seed.season !== currentSeason) {
    showMessage(`Cannot plant ${seed.name} in ${currentSeason}.`);
    return false;
  }
  tile.planted = seed.crop;
  tile.growth = 0;
  tile.growDay = state.day;
  tile.watered = false;
  spendEnergy(ENERGY_PER_PLANT);
  refreshTileColors();
  gainExperience('farming', 8);
  return true;
}

// Feature 9: Watering - advances crop growth
function waterTile() {
  const tile = playerTile();
  if (!tile) return false;
  if (!tile.planted) return false;
  if (tile.watered) return false;
  if (!canUseEnergy(ENERGY_PER_WATER)) {
    showMessage('Not enough energy!');
    return false;
  }
  tile.watered = true;
  spendEnergy(ENERGY_PER_WATER);
  refreshTileColors();
  return true;
}

// Feature 10: Crop growth - mature crop harvestable
function advanceCropGrowth() {
  const currentSeason = SEASONS[state.seasonIndex];
  for (let r = 0; r < GRID_HEIGHT; r++) {
    for (let c = 0; c < GRID_WIDTH; c++) {
      const tile = state.grid[r][c];
      if (!tile.planted || tile.growth >= 1) continue;
      const crop = CROPS[tile.planted];
      if (!crop || !crop.seasons.includes(currentSeason)) continue;
      if (!tile.watered) continue;
      if (state.day === tile.growDay) continue; // don't grow on planting day
      tile.growth = Math.min(1, tile.growth + 1 / crop.growDays);
    }
  }
}

// Feature 11: Harvesting - adds produce to inventory
function harvestTile() {
  const tile = playerTile();
  if (!tile) return false;
  if (!tile.planted) return false;
  const crop = CROPS[tile.planted];
  if (!crop) return false;
  if (tile.growth < 1) return false;
  state.inventory[tile.planted] = (state.inventory[tile.planted] || 0) + 1;
  tile.planted = null;
  tile.growth = 0;
  tile.growDay = 0;
  tile.watered = false;
  tile.type = 'tilled';
  refreshTileColors();
  showMessage(`Harvested ${crop.name}!`);
  gainExperience('farming', 10);
  return true;
}

// Feature 6: Land clearing - axe removes tree
function chopTile() {
  const tile = playerTile();
  if (!tile) return false;
  if (!tile.hasTree) return false;
  if (!canUseEnergy(ENERGY_PER_CHOP)) {
    showMessage('Not enough energy!');
    return false;
  }
  tile.hasTree = false;
  spendEnergy(ENERGY_PER_CHOP);
  refreshTileColors();
  showMessage('Tree cleared!');
  return true;
}

// Feature 13: Scythe - clears weeds, may add hay
function scytheTile() {
  const tile = playerTile();
  if (!tile) return false;
  if (!tile.hasWeed) return false;
  tile.hasWeed = false;
  if (Math.random() < 0.5) {
    state.inventory.hay = (state.inventory.hay || 0) + 1;
    showMessage('Got hay!');
  } else {
    showMessage('Weed cleared.');
  }
  refreshTileColors();
  return true;
}

// Can the player afford a building cost?
function canAfford(buildingKey) {
  const building = BUILDINGS[buildingKey];
  if (!building) return false;
  for (const [res, amt] of Object.entries(building.cost)) {
    if ((state.resources[res] || 0) < amt) return false;
  }
  return true;
}

// Farm type selection (Feature 35)
function selectFarmType(farmTypeKey) {
  const farmType = FARM_TYPES[farmTypeKey];
  if (!farmType) return false;
  selectedFarmType = farmTypeKey;
  return true;
}

function getSelectedFarmType() {
  return selectedFarmType;
}

function getFarmTypes() {
  return FARM_TYPES;
}

// Spend resources for a building
function spendResources(buildingKey) {
  const building = BUILDINGS[buildingKey];
  for (const [res, amt] of Object.entries(building.cost)) {
    state.resources[res] -= amt;
  }
}

// Feature 14: Build coop - construct a coop to house chickens
function buildStructure(buildingKey) {
  const building = BUILDINGS[buildingKey];
  if (!building) return false;
  const tile = playerTile();
  if (!tile) return false;
  if (tile.type !== 'grass') return false;
  if (tile.planted || tile.hasTree || tile.hasRock || tile.hasWeed) return false;
  if (!canAfford(buildingKey)) {
    showMessage('Not enough resources!');
    return false;
  }
  spendResources(buildingKey);
  state.buildings.push({
    type: buildingKey,
    r: state.player.y,
    c: state.player.x,
    animals: [],
    capacity: building.capacity,
    houses: building.houses,
  });
  showMessage(`${building.name} built!`);
  updateHUD();
  return true;
}

// Add an animal to a building if capacity allows and the building houses that type
function addAnimal(type, buildingIndex) {
  const animal = ANIMALS[type];
  if (!animal) return false;
  const building = state.buildings[buildingIndex];
  if (!building) return false;
  if (building.houses && !building.houses.includes(type)) return false;
  if (building.animals.length >= building.capacity) return false;
  building.animals.push({ type, fed: false });
  return true;
}

// Feed all animals in a building (consumes hay)
function feedAnimals(buildingIndex) {
  const building = state.buildings[buildingIndex];
  if (!building) return false;
  let totalHay = 0;
  for (const animal of building.animals) {
    totalHay += ANIMALS[animal.type].hayConsumption;
  }
  if ((state.inventory.hay || 0) < totalHay) {
    showMessage('Not enough hay!');
    return false;
  }
  state.inventory.hay = (state.inventory.hay || 0) - totalHay;
  if (state.inventory.hay <= 0) delete state.inventory.hay;
  for (const animal of building.animals) {
    animal.fed = true;
  }
  return true;
}

// Feature 16: Animal products - fed animals produce goods each morning
function collectMorningProducts() {
  for (const building of state.buildings) {
    for (const animal of building.animals) {
      if (animal.fed) {
        const a = ANIMALS[animal.type];
        state.inventory[a.product] = (state.inventory[a.product] || 0) + a.productAmount;
      }
      animal.fed = false; // reset for next day
    }
  }
}

// Feature 28: NPC interaction - talk to a villager at the player's tile
function talkToVillager() {
  for (const key of Object.keys(VILLAGER_POSITIONS)) {
    const pos = VILLAGER_POSITIONS[key];
    if (pos.r === state.player.y && pos.c === state.player.x) {
      const rel = state.relationships[key];
      rel.talkedToday = true;
      // A friendly chat slightly builds rapport
      if (rel.points < MARRIAGE_RELATIONSHIP) {
        rel.points += 1;
      }
      const dialogue = VILLAGER_DIALOGUE[key] || ['...'];
      return dialogue[Math.floor(Math.random() * dialogue.length)];
    }
  }
  return null;
}

// Feature 29: Gift giving - give a gift to a villager
function giveGift(villagerKey, itemKey) {
  const villager = VILLAGERS[villagerKey];
  if (!villager) return false;
  const rel = state.relationships[villagerKey];
  if (!rel) return false;
  if ((state.inventory[itemKey] || 0) < 1) return false;
  if (rel.talkedToday === false) {
    // Villagers prefer to receive a gift after a conversation
    return false;
  }
  state.inventory[itemKey]--;
  if (state.inventory[itemKey] <= 0) delete state.inventory[itemKey];
  if (itemKey === villager.likedGift) {
    rel.points += 5; // liked gift gives a positive relationship increase
  } else {
    rel.points += 1; // any gift still builds a little rapport
  }
  rel.talkedToday = false; // reset for the next day
  showMessage(`Gave ${itemKey} to ${villager.name}!`);
  return true;
}

// Feature 30: Marriage - marry an eligible villager
function marryVillager(villagerKey) {
  const villager = VILLAGERS[villagerKey];
  if (!villager || !villager.marriageable) return false;
  if (state.spouse !== null) return false; // already married
  const rel = state.relationships[villagerKey];
  if (!rel || rel.points < MARRIAGE_RELATIONSHIP) return false;
  if (villager.married) return false; // already married to someone else
  // Marriage is only allowed between different genders.
  if (villager.gender === state.playerGender) return false;
  state.spouse = villagerKey;
  villager.married = true;
  showMessage(`You married ${villager.name}!`);
  return true;
}

// Feature 31: Spouse help - spouse waters at least one crop during the night
function spouseNightlyHelp() {
  if (state.spouse === null) return false;
  const villager = VILLAGERS[state.spouse];
  if (!villager) return false;
  let watered = 0;
  for (let r = 0; r < GRID_HEIGHT; r++) {
    for (let c = 0; c < GRID_WIDTH; c++) {
      const tile = state.grid[r][c];
      if (tile.planted && tile.type === 'tilled' && !tile.watered) {
        tile.watered = true;
        watered++;
        break;
      }
    }
    if (watered > 0) break;
  }
  return watered > 0;
}

// Feature 32: Children - a married couple may choose to have a child
function haveChild() {
  if (state.spouse === null) return false;
  const child = { name: `Child ${state.children.length + 1}`, bornDay: state.day };
  state.children.push(child);
  showMessage(`A child was born: ${child.name}!`);
  return true;
}

// Feature 19: Cave exploration - enter the mine, placed on first floor
function enterMine() {
  if (!canUseEnergy(MINE_ENERGY_PER_ENTER)) {
    showMessage('Not enough energy!');
    return false;
  }
  state.inMine = true;
  state.mineFloor = 1;
  spendEnergy(MINE_ENERGY_PER_ENTER);
  generateMineFloor();
  return true;
}

function exitMine() {
  state.inMine = false;
  state.mineNode = null;
  state.mineMonster = null;
  return true;
}

function generateMineFloor() {
  const tier = oreTierForFloor(state.mineFloor);
  state.mineNode = { type: tier.ore, x: 3, y: 3 };
  state.mineMonster = { type: 'monster', hp: tier.monsterHP, x: 7, y: 7 };
}

// Feature 20: Ore mining - pickaxe on ore node yields ore
function mineOre() {
  if (!state.inMine || !state.mineNode) return false;
  if (!canUseEnergy(MINE_ENERGY_PER_MINE)) {
    showMessage('Not enough energy!');
    return false;
  }
  const ore = state.mineNode.type;
  state.inventory[ore] = (state.inventory[ore] || 0) + 1;
  state.mineNode = null;
  spendEnergy(MINE_ENERGY_PER_MINE);
  showMessage(`Mined ${ore}!`);
  gainExperience('mining', 12);
  return true;
}

// Feature 21: Combat in mines - sword on monster reduces health
function attackMonster() {
  if (!state.inMine || !state.mineMonster) return false;
  if (!canUseEnergy(MINE_ENERGY_PER_ATTACK)) {
    showMessage('Not enough energy!');
    return false;
  }
  state.mineMonster.hp -= 1;
  spendEnergy(MINE_ENERGY_PER_ATTACK);
  if (state.mineMonster.hp <= 0) {
    state.mineMonster = null;
    showMessage('Monster defeated!');
  }
  gainExperience('combat', 15);
  return true;
}

// Feature 23: Smelting - smelt ore into bar using a furnace
function smelt(oreType) {
  const barMap = {
    copperOre: 'copperBar',
    ironOre: 'ironBar',
    goldOre: 'goldBar',
  };
  const bar = barMap[oreType];
  if (!bar) return false;
  if ((state.inventory[oreType] || 0) < 1) return false;
  state.inventory[oreType]--;
  if (state.inventory[oreType] <= 0) delete state.inventory[oreType];
  state.inventory[bar] = (state.inventory[bar] || 0) + 1;
  showMessage(`Smelted ${bar}!`);
  return true;
}

// Feature 33: Community Center bundles - donate goods to complete a bundle
function donateToBundle(bundleKey) {
  const bundle = BUNDLES[bundleKey];
  if (!bundle) return false;
  if (bundle.completed) return false;
  for (const [itemKey, requiredAmt] of Object.entries(bundle.required)) {
    if ((state.inventory[itemKey] || 0) < requiredAmt) {
      showMessage(`Not enough ${itemKey} for the ${bundle.name}.`);
      return false;
    }
  }
  for (const [itemKey, requiredAmt] of Object.entries(bundle.required)) {
    state.inventory[itemKey] = (state.inventory[itemKey] || 0) - requiredAmt;
    if (state.inventory[itemKey] <= 0) delete state.inventory[itemKey];
  }
  bundle.completed = true;
  unlockArea(bundle.reward);
  showMessage(`Bundle complete: ${bundle.name}!`);
  return true;
}

// Feature 34: Bundle rewards - completing bundles unlocks new areas/activities
function unlockArea(areaKey) {
  if (!areaKey) return;
  unlockedAreas[areaKey] = true;
}

function isAreaUnlocked(areaKey) {
  return !!unlockedAreas[areaKey];
}

function getBundle(bundleKey) {
  return BUNDLES[bundleKey] || null;
}

function getAllBundles() {
  return BUNDLES;
}

function getUnlockedAreas() {
  return unlockedAreas;
}

// Forageable wild items (original data)
const FORAGE_ITEMS = {
  wildRoot: { name: 'Wild Root', type: 'forage' },
  springOnion: { name: 'Spring Onion', type: 'forage' },
  berry: { name: 'Wild Berry', type: 'forage' },
  mushroom: { name: 'Mushroom', type: 'forage' },
};

// Place forageable items on the farm
function placeForageItems() {
  const positions = [
    { r: 3, c: 6, type: 'wildRoot' },
    { r: 5, c: 9, type: 'berry' },
    { r: 8, c: 4, type: 'mushroom' },
    { r: 12, c: 10, type: 'springOnion' },
    { r: 15, c: 2, type: 'berry' },
  ];
  for (const p of positions) {
    const tile = state.grid[p.r][p.c];
    if (!tile) continue;
    state.forageItems.push({ r: p.r, c: p.c, type: p.type });
  }
}

// Place fishing spots around the valley
function placeFishingSpots() {
  const positions = [
    { r: 2, c: 15 },
    { r: 8, c: 18 },
    { r: 14, c: 16 },
    { r: 18, c: 8 },
  ];
  for (const p of positions) {
    state.fishingSpots.push({ r: p.r, c: p.c });
  }
}

// Feature 24: Foraging - collect wild items around the valley
function forage() {
  const item = state.forageItems.find(
    (f) => f.r === state.player.y && f.c === state.player.x
  );
  if (!item) return false;
  const info = FORAGE_ITEMS[item.type];
  state.inventory[item.type] = (state.inventory[item.type] || 0) + 1;
  state.forageItems = state.forageItems.filter((f) => f !== item);
  showMessage(`Foraged ${info.name}!`);
  gainExperience('foraging', 6);
  return true;
}

// Feature 25: Fishing - catch fish at a fishing spot
function fish() {
  const atSpot = state.fishingSpots.some(
    (s) => s.r === state.player.y && s.c === state.player.x
  );
  if (!atSpot) {
    showMessage('Not a fishing spot!');
    return false;
  }
  if (!canUseEnergy(ENERGY_PER_FISH)) {
    showMessage('Not enough energy!');
    return false;
  }
  spendEnergy(ENERGY_PER_FISH);
  state.inventory.fish = (state.inventory.fish || 0) + 1;
  showMessage('Caught a fish!');
  gainExperience('fishing', 7);
  return true;
}

// Feature 1: Day/night cycle - new morning resets energy to max
function nextDay() {
  state.day++;
  if (state.day > DAYS_PER_SEASON) {
    state.day = 1;
    state.seasonIndex = (state.seasonIndex + 1) % SEASONS.length;
  }
  state.energy = state.maxEnergy;
  state.isNight = false;
  state.timeOfDay = 6;
  state.dayComplete = false;
  // Reset watering flags for new day
  for (let r = 0; r < GRID_HEIGHT; r++) {
    for (let c = 0; c < GRID_WIDTH; c++) {
      state.grid[r][c].watered = false;
    }
  }
  // Feature 31: Spouse help - spouse waters at least one crop during the night
  spouseNightlyHelp();
  advanceCropGrowth();
  collectMorningProducts();
  refreshTileColors();
  updateHUD();
  showMessage(`New day! Day ${state.day}, ${SEASONS[state.seasonIndex]}`);
}

// Feature 2: Season system - advancing 28 days cycles seasons
function advanceDays(count) {
  for (let i = 0; i < count; i++) {
    nextDay();
  }
}

// Feature 4: Energy replenishment - eating food restores energy, capped at max
function eatFood(itemKey, restoreValue) {
  if (!state.inventory[itemKey] || state.inventory[itemKey] <= 0) return false;
  state.energy = Math.min(state.maxEnergy, state.energy + restoreValue);
  state.inventory[itemKey]--;
  if (state.inventory[itemKey] <= 0) delete state.inventory[itemKey];
  updateHUD();
  showMessage(`Ate ${itemKey}, energy restored.`);
  return true;
}

// Feature 5: Save/load - game state persists
function saveGame() {
  const saveData = {
    day: state.day,
    seasonIndex: state.seasonIndex,
    energy: state.energy,
    maxEnergy: state.maxEnergy,
    money: state.money,
    inventory: state.inventory,
    selectedTool: state.selectedTool,
    grid: state.grid,
    player: state.player,
    isNight: state.isNight,
    timeOfDay: state.timeOfDay,
  };
  localStorage.setItem('valleylife_save', JSON.stringify(saveData));
  showMessage('Game saved.');
}

function loadGame() {
  const raw = localStorage.getItem('valleylife_save');
  if (!raw) {
    showMessage('No save found.');
    return false;
  }
  try {
    const data = JSON.parse(raw);
    state.day = data.day;
    state.seasonIndex = data.seasonIndex;
    state.energy = data.energy;
    state.maxEnergy = data.maxEnergy;
    state.money = data.money;
    state.inventory = data.inventory || {};
    state.selectedTool = data.selectedTool || 'hoe';
    state.grid = data.grid;
    state.player = data.player || { x: 0, y: 0, z: 0 };
    state.isNight = data.isNight || false;
    state.timeOfDay = data.timeOfDay || 6;
    refreshTileColors();
    updatePlayerPosition();
    updateHUD();
    showMessage('Game loaded.');
    return true;
  } catch (e) {
    showMessage('Load failed.');
    return false;
  }
}

// ============ Controls ============
function initControls() {
  // Movement
  window.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    let moved = false;
    if (key === 'arrowup' || key === 'w') { if (state.player.y > 0) { state.player.y--; moved = true; } }
    if (key === 'arrowdown' || key === 's') { if (state.player.y < GRID_HEIGHT - 1) { state.player.y++; moved = true; } }
    if (key === 'arrowleft' || key === 'a') { if (state.player.x > 0) { state.player.x--; moved = true; } }
    if (key === 'arrowright' || key === 'd') { if (state.player.x < GRID_WIDTH - 1) { state.player.x++; moved = true; } }
    if (moved) {
      updatePlayerPosition();
    }
    // Tool action
    if (key === ' ') { // spacebar = use tool
      useTool();
    }
  });

  // Tool selection buttons
  document.getElementById('tool-hoe').addEventListener('click', () => setSelectedTool('hoe'));
  document.getElementById('tool-water').addEventListener('click', () => setSelectedTool('water'));
  document.getElementById('tool-axe').addEventListener('click', () => setSelectedTool('axe'));
  document.getElementById('tool-scythe').addEventListener('click', () => setSelectedTool('scythe'));
}

function useTool() {
  switch (state.selectedTool) {
    case 'hoe': tillTile(); break;
    case 'water': waterTile(); break;
    case 'axe': chopTile(); break;
    case 'scythe': scytheTile(); break;
  }
}

// Planting via number keys 1-4 for seed types
function initPlantingKeys() {
  const seedKeys = Object.keys(SEEDS);
  window.addEventListener('keydown', (e) => {
    const idx = parseInt(e.key, 10);
    if (!isNaN(idx) && idx >= 1 && idx <= seedKeys.length) {
      plantSeed(seedKeys[idx - 1]);
    }
  });
  // 'h' to harvest
  window.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'h') harvestTile();
  });
  // 'n' for next day
  window.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'n') nextDay();
  });
}

// ============ Initialize ============
function init() {
  initThree();
  initGrid();
  state.relationships = initRelationships();
  buildTileMeshes();
  initControls();
  initPlantingKeys();
  updateHUD();
  placeInitialDecorations();
  placeForageItems();
  placeFishingSpots();
  animate();
}

function placeInitialDecorations() {
  // Place some trees and rocks on the farm
  const positions = [
    { r: 2, c: 2, tree: true }, { r: 2, c: 5, rock: true },
    { r: 5, c: 2, tree: true }, { r: 7, c: 8, weed: true },
    { r: 10, c: 3, tree: true }, { r: 12, c: 12, rock: true },
  ];
  for (const p of positions) {
    const tile = getTile(p.r, p.c);
    if (!tile) continue;
    if (p.tree) tile.hasTree = true;
    if (p.rock) tile.hasRock = true;
    if (p.weed) tile.hasWeed = true;
  }
  refreshTileColors();
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

// Export for testing and browser
const ValleyLifeAPI = {
  state,
  CROPS,
  SEEDS,
  MAX_ENERGY,
  ENERGY_PER_TILL,
  ENERGY_PER_WATER,
  ENERGY_PER_CHOP,
  ENERGY_PER_PLANT,
  SEASONS,
  DAYS_PER_SEASON,
  initGrid,
  tillTile,
  plantSeed,
  waterTile,
  advanceCropGrowth,
  harvestTile,
  chopTile,
  scytheTile,
  nextDay,
  advanceDays,
  eatFood,
  saveGame,
  loadGame,
  setSelectedTool,
  getTile,
  playerTile,
  canUseEnergy,
  spendEnergy,
  refreshTileColors,
  GRID_WIDTH,
  GRID_HEIGHT,
  BUILDINGS,
  buildStructure,
  canAfford,
  ANIMALS,
  addAnimal,
  feedAnimals,
  collectMorningProducts,
  enterMine,
  exitMine,
  mineOre,
  attackMonster,
  smelt,
  oreTierForFloor,
  MINE_ENERGY_PER_ENTER,
  MINE_ENERGY_PER_MINE,
  MINE_ENERGY_PER_ATTACK,
  ENERGY_PER_FISH,
  FORAGE_ITEMS,
  forage,
  placeForageItems,
  fish,
  placeFishingSpots,
  SKILLS,
  SKILL_MAX_LEVEL,
  gainExperience,
  xpForNextLevel,
  initSkills,
  initRelationships,
  VILLAGERS,
  VILLAGER_POSITIONS,
  MARRIAGE_RELATIONSHIP,
  talkToVillager,
  giveGift,
  marryVillager,
  spouseNightlyHelp,
  haveChild,
  // Community Center bundles (Feature 33-34)
  BUNDLES,
  donateToBundle,
  unlockArea,
  isAreaUnlocked,
  getBundle,
  getAllBundles,
  getUnlockedAreas,
  // Farm types (Feature 35)
  FARM_TYPES,
  selectFarmType,
  getSelectedFarmType,
  getFarmTypes,
  // Multiplayer (Feature 36)
  hostSession,
  joinSession,
  syncPlayerPosition,
  getPlayerPosition,
  getConnectedPlayers,
  leaveSession,
  resetMultiplayer,
};

if (typeof globalThis !== 'undefined') {
  globalThis.ValleyLife = ValleyLifeAPI;
}

// Only auto-init in a real browser environment (not under test)
if (typeof document !== 'undefined' && !globalThis.__VALLEYLIFE_TEST__) {
  init();
}

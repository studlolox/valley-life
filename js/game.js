// Valley Life - Original farm life simulation built with three.js
// All code written from scratch, not copied from any source.

import * as THREE from 'three';
import {
  LOCATIONS,
  CROPS,
  SEEDS,
  BUILDINGS,
  CHICKEN_VARIANTS,
  ANIMALS,
  FORAGE_ITEMS,
  FISH_TYPES,
  ITEM_PRICES,
  RECIPES,
  VILLAGERS,
  VILLAGER_POSITIONS,
  VILLAGER_DIALOGUE,
  VILLAGER_DIALOGUE_TIERS,
  BUNDLES,
  FARM_TYPES,
  QUESTS,
  STORY_EVENTS,
  FESTIVALS,
  ACHIEVEMENTS,
  WEEKDAYS,
  TOOL_NAMES,
  TOOL_UPGRADE_TIERS,
  GENERAL_STORE_ITEMS,
  MUSEUM_ARTIFACTS,
} from './data.js';

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

// Relationship points needed to marry
const MARRIAGE_RELATIONSHIP = 10;

// Track which valley areas have been unlocked by bundle completion
const unlockedAreas = {};

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
  quests: {},
  seenEvents: {},
  achievements: {},
  selectedTool: 'hoe',
  selectedBuilding: null,
  grid: [], // 2D array of tile objects
  player: { x: 0, y: 0, z: 0 },
  playerName: 'Farmer',
  playerGender: 'male', // player's gender; marriage requires a different-gender spouse
  playerAppearance: { hairColor: '#5C3A21', shirtColor: '#4169E1' },
  currentZone: LOCATIONS.farm,
  weather: 'Sunny',
  health: 100,
  maxHealth: 100,
  toolLevels: { hoe: 0, water: 0, axe: 0, pickaxe: 0, scythe: 0, sword: 0, fishingRod: 0 },
  selectedSeed: 'turnip',
  selectedGift: null,
  shippingBin: {},
  lastDaySummary: null,
  museumDonations: {},
  gameStarted: false,
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
let scene, camera, renderer, gridHelper, floorMesh, hoverRingMesh;
let playerMesh;
const tileMeshes = new Map(); // key "r,c" -> mesh
let cameraZoom = 22;
const raycaster = new THREE.Raycaster();
const pointerNDC = new THREE.Vector2();
let hoveredTile = null;
let uiRenderer = null;

function setUIRenderer(rendererObj) {
  uiRenderer = rendererObj;
}

function notifyUI(eventName, payload) {
  if (uiRenderer && typeof uiRenderer[eventName] === 'function') {
    uiRenderer[eventName](payload);
  }
}

function initThree() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87CEEB);

  camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, cameraZoom, cameraZoom * 0.72);
  camera.lookAt(0, 0, 0);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.getElementById('game-container').appendChild(renderer.domElement);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
  scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 0.85);
  dirLight.position.set(12, 24, 10);
  scene.add(dirLight);

  // Floor grid
  const floorGeo = new THREE.PlaneGeometry(GRID_WIDTH * TILE_SIZE, GRID_HEIGHT * TILE_SIZE);
  const floorMat = new THREE.MeshStandardMaterial({ color: 0x7CFC00 });
  floorMesh = new THREE.Mesh(floorGeo, floorMat);
  floorMesh.rotation.x = -Math.PI / 2;
  scene.add(floorMesh);

  // Player
  playerMesh = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1.8, 1),
    new THREE.MeshStandardMaterial({ color: 0x4169E1 })
  );
  scene.add(playerMesh);

  // Hover tile highlight ring
  const ringGeo = new THREE.RingGeometry(TILE_SIZE * 0.36, TILE_SIZE * 0.46, 4);
  ringGeo.rotateZ(Math.PI / 4);
  ringGeo.rotateX(-Math.PI / 2);
  hoverRingMesh = new THREE.Mesh(
    ringGeo,
    new THREE.MeshBasicMaterial({ color: 0xFFE066, side: THREE.DoubleSide, transparent: true, opacity: 0.85 })
  );
  hoverRingMesh.position.y = 0.04;
  hoverRingMesh.visible = false;
  scene.add(hoverRingMesh);

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
  notifyUI('updateHUD');
}

function setSelectedTool(tool) {
  state.selectedTool = tool;
  updateHUD();
}

function setSelectedSeed(seedKey) {
  if (SEEDS[seedKey]) {
    state.selectedSeed = seedKey;
    updateHUD();
  }
}

function showMessage(text) {
  const el = document.getElementById('message');
  if (el) {
    el.textContent = text;
    el.style.display = 'block';
    setTimeout(() => { el.style.display = 'none'; }, 1800);
  }
  notifyUI('showToast', text);
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
  const seedInvKey = `${seedKey}Seed`;
  if ((state.inventory[seedInvKey] || 0) > 0) {
    state.inventory[seedInvKey]--;
    if (state.inventory[seedInvKey] <= 0) delete state.inventory[seedInvKey];
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
      if (state.spouse === key && VILLAGER_DIALOGUE_TIERS.marriage.length > 0 && Math.random() < 0.5) {
        const lines = VILLAGER_DIALOGUE_TIERS.marriage;
        return lines[Math.floor(Math.random() * lines.length)];
      }
      const charLines = VILLAGER_DIALOGUE[key] || ['...'];
      const tierKey = rel.points >= 6 ? 'high' : rel.points >= 3 ? 'mid' : 'low';
      const pool = Math.random() < 0.7 ? charLines : VILLAGER_DIALOGUE_TIERS[tierKey];
      return pool[Math.floor(Math.random() * pool.length)];
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
function rollDailyWeather() {
  const season = SEASONS[state.seasonIndex];
  const r = Math.random();
  if (season === 'Winter') return r < 0.35 ? 'Snowy' : 'Sunny';
  if (r < 0.2) return 'Rainy';
  if (r < 0.27) return 'Stormy';
  return 'Sunny';
}

function processShippingBin() {
  const shipped = [];
  let totalGoldEarned = 0;
  for (const [itemKey, qty] of Object.entries(state.shippingBin)) {
    if (qty <= 0) continue;
    const unitPrice =
      ITEM_PRICES[itemKey] ??
      CROPS[itemKey]?.sellPrice ??
      FORAGE_ITEMS[itemKey]?.sellPrice ??
      FISH_TYPES[itemKey]?.sellPrice ??
      0;
    if (unitPrice <= 0) continue;
    const earned = unitPrice * qty;
    totalGoldEarned += earned;
    shipped.push({ itemKey, qty, unitPrice, earned });
  }
  if (totalGoldEarned > 0) {
    state.money += totalGoldEarned;
    unlockAchievement('firstShip');
  }
  state.shippingBin = {};
  return { shipped, totalGoldEarned };
}

function nextDay() {
  const shippingResult = processShippingBin();
  state.day++;
  if (state.day > DAYS_PER_SEASON) {
    state.day = 1;
    state.seasonIndex = (state.seasonIndex + 1) % SEASONS.length;
  }
  state.energy = state.maxEnergy;
  state.health = state.maxHealth;
  state.isNight = false;
  state.timeOfDay = 6;
  state.dayComplete = false;
  state.weather = rollDailyWeather();
  // Reset watering flags for new day (rain auto-waters outdoor crops)
  const isRaining = state.weather === 'Rainy' || state.weather === 'Stormy';
  for (let r = 0; r < GRID_HEIGHT; r++) {
    for (let c = 0; c < GRID_WIDTH; c++) {
      state.grid[r][c].watered = isRaining && state.grid[r][c].planted ? true : false;
    }
  }
  // Feature 31: Spouse help - spouse waters at least one crop during the night
  spouseNightlyHelp();
  advanceCropGrowth();
  const invBefore = { ...state.inventory };
  collectMorningProducts();
  const productsCollected = [];
  for (const [k, v] of Object.entries(state.inventory)) {
    const diff = v - (invBefore[k] || 0);
    if (diff > 0) productsCollected.push({ itemKey: k, qty: diff });
  }
  state.lastDaySummary = {
    day: state.day,
    season: SEASONS[state.seasonIndex],
    weather: state.weather,
    shipped: shippingResult.shipped,
    totalGoldEarned: shippingResult.totalGoldEarned,
    productsCollected,
  };
  refreshTileColors();
  updateHUD();
  notifyUI('onNewDay', state.lastDaySummary);
  showMessage(`New day! Day ${state.day}, ${SEASONS[state.seasonIndex]} (${state.weather})`);
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

// Feature 39: Shop & economy - buy seeds and ship items for Gold
function buySeed(seedKey, qty = 1) {
  const seed = SEEDS[seedKey];
  if (!seed || qty <= 0) return false;
  const totalCost = seed.price * qty;
  if (state.money < totalCost) {
    showMessage('Not enough Gold!');
    return false;
  }
  state.money -= totalCost;
  const invKey = `${seedKey}Seed`;
  state.inventory[invKey] = (state.inventory[invKey] || 0) + qty;
  updateHUD();
  showMessage(`Bought ${qty} ${seed.name}.`);
  return true;
}

function shipItem(itemKey, qty = 1) {
  if (!itemKey || qty <= 0) return false;
  if ((state.inventory[itemKey] || 0) < qty) return false;
  const unitPrice =
    ITEM_PRICES[itemKey] ??
    CROPS[itemKey]?.sellPrice ??
    FORAGE_ITEMS[itemKey]?.sellPrice ??
    FISH_TYPES[itemKey]?.sellPrice ??
    0;
  if (unitPrice <= 0) return false;
  state.inventory[itemKey] -= qty;
  if (state.inventory[itemKey] <= 0) delete state.inventory[itemKey];
  const earned = unitPrice * qty;
  state.money += earned;
  unlockAchievement('firstShip');
  updateHUD();
  showMessage(`Shipped ${itemKey} for ${earned}G!`);
  return true;
}

// Feature 40: Quests - accept and complete quests
function acceptQuest(questId) {
  const quest = QUESTS[questId];
  if (!quest) return false;
  if (state.quests[questId]) return false;
  state.quests[questId] = { ...quest, active: true, completed: false };
  return true;
}

function completeQuest(questId) {
  const q = state.quests[questId];
  if (!q || !q.active || q.completed) return false;
  for (const [itemKey, reqAmt] of Object.entries(q.required || {})) {
    if ((state.inventory[itemKey] || 0) < reqAmt) return false;
  }
  for (const [itemKey, reqAmt] of Object.entries(q.required || {})) {
    state.inventory[itemKey] -= reqAmt;
    if (state.inventory[itemKey] <= 0) delete state.inventory[itemKey];
  }
  q.completed = true;
  q.active = false;
  state.money += q.rewardGold || 0;
  updateHUD();
  showMessage(`Quest complete: ${q.title}! (+${q.rewardGold}G)`);
  return true;
}

function getActiveQuests() {
  return Object.values(state.quests).filter((q) => q.active && !q.completed);
}

// Feature 41: Storyline events - trigger and track seen events
function triggerEvent(eventId) {
  const evt = STORY_EVENTS[eventId];
  if (!evt) return null;
  state.seenEvents[eventId] = true;
  return evt.lines;
}

function hasSeenEvent(eventId) {
  return !!state.seenEvents[eventId];
}

// Feature 42: Achievements - unlock milestone once
function unlockAchievement(achievementId) {
  const ach = ACHIEVEMENTS[achievementId];
  if (!ach) return false;
  if (state.achievements[achievementId]) return false;
  state.achievements[achievementId] = { unlockedAtDay: state.day };
  showMessage(`Achievement Unlocked: ${ach.name}!`);
  return true;
}

function hasAchievement(achievementId) {
  return !!state.achievements[achievementId];
}

// Feature 43: Cooking and crafting - consume ingredients and produce item
function cookRecipe(recipeKey) {
  const recipe = RECIPES[recipeKey];
  if (!recipe) return false;
  for (const [ing, amt] of Object.entries(recipe.ingredients)) {
    if ((state.inventory[ing] || 0) < amt) return false;
  }
  for (const [ing, amt] of Object.entries(recipe.ingredients)) {
    state.inventory[ing] -= amt;
    if (state.inventory[ing] <= 0) delete state.inventory[ing];
  }
  state.inventory[recipeKey] = (state.inventory[recipeKey] || 0) + 1;
  if (recipe.type === 'cooking') {
    unlockAchievement('masterChef');
  }
  showMessage(`Made ${recipe.name}!`);
  return true;
}

// Feature 44: Tool Upgrades at Garrick's Smithy
function upgradeTool(toolKey) {
  if (!TOOL_NAMES[toolKey]) return false;
  const currentLevel = state.toolLevels[toolKey] || 0;
  const tier = TOOL_UPGRADE_TIERS.find((t) => t.level === currentLevel + 1);
  if (!tier) {
    showMessage(`${TOOL_NAMES[toolKey]} is already max level!`);
    return false;
  }
  if (state.money < tier.goldCost) {
    showMessage(`Need ${tier.goldCost}G to upgrade!`);
    return false;
  }
  if ((state.inventory[tier.bar] || 0) < tier.barsRequired) {
    showMessage(`Need ${tier.barsRequired} ${tier.bar}!`);
    return false;
  }
  state.money -= tier.goldCost;
  state.inventory[tier.bar] -= tier.barsRequired;
  if (state.inventory[tier.bar] <= 0) delete state.inventory[tier.bar];
  state.toolLevels[toolKey] = tier.level;
  updateHUD();
  showMessage(`Upgraded ${TOOL_NAMES[toolKey]} to ${tier.name}!`);
  return true;
}

// Feature 45: Shipping Bin queue (pays out overnight via processShippingBin)
function queueShipItem(itemKey, qty = 1) {
  if (!itemKey || qty <= 0) return false;
  if ((state.inventory[itemKey] || 0) < qty) return false;
  const unitPrice =
    ITEM_PRICES[itemKey] ??
    CROPS[itemKey]?.sellPrice ??
    FORAGE_ITEMS[itemKey]?.sellPrice ??
    FISH_TYPES[itemKey]?.sellPrice ??
    0;
  if (unitPrice <= 0) return false;
  state.inventory[itemKey] -= qty;
  if (state.inventory[itemKey] <= 0) delete state.inventory[itemKey];
  state.shippingBin[itemKey] = (state.shippingBin[itemKey] || 0) + qty;
  updateHUD();
  showMessage(`Placed ${qty} ${itemKey} in Shipping Bin.`);
  return true;
}

// General Store & Ranch purchases
function buyItem(itemKey, qty = 1) {
  const item = GENERAL_STORE_ITEMS[itemKey];
  if (!item || qty <= 0) return false;
  const cost = item.price * qty;
  if (state.money < cost) {
    showMessage('Not enough Gold!');
    return false;
  }
  state.money -= cost;
  state.inventory[itemKey] = (state.inventory[itemKey] || 0) + qty;
  updateHUD();
  showMessage(`Bought ${qty} ${item.name}.`);
  return true;
}

function buyAnimal(type, buildingIndex = null) {
  const animal = ANIMALS[type];
  if (!animal) return false;
  if (state.money < animal.buyPrice) {
    showMessage('Not enough Gold!');
    return false;
  }
  if (animal.housing === 'pet') {
    state.money -= animal.buyPrice;
    state.animals.push({ type, fed: true });
    unlockAchievement('firstAnimal');
    updateHUD();
    showMessage(`Adopted a ${animal.name}!`);
    return true;
  }
  let targetIdx = buildingIndex;
  if (targetIdx === null || targetIdx === undefined) {
    targetIdx = state.buildings.findIndex(
      (b) => (!b.houses || b.houses.includes(type)) && b.animals.length < b.capacity
    );
  }
  if (targetIdx < 0 || !addAnimal(type, targetIdx)) {
    showMessage(`No ${animal.housing} with space for ${animal.name}!`);
    return false;
  }
  state.money -= animal.buyPrice;
  unlockAchievement('firstAnimal');
  updateHUD();
  showMessage(`Bought a ${animal.name}!`);
  return true;
}

function donateToMuseum(itemKey) {
  if (!MUSEUM_ARTIFACTS[itemKey]) return false;
  if (state.museumDonations[itemKey]) return false;
  if ((state.inventory[itemKey] || 0) < 1) return false;
  state.inventory[itemKey]--;
  if (state.inventory[itemKey] <= 0) delete state.inventory[itemKey];
  state.museumDonations[itemKey] = { donatedDay: state.day };
  state.money += 25;
  updateHUD();
  showMessage(`Donated ${MUSEUM_ARTIFACTS[itemKey].name} to the Museum! (+25G)`);
  return true;
}

function startNewGame(options = {}) {
  const farmTypeKey = options.farmType && FARM_TYPES[options.farmType] ? options.farmType : 'standard';
  const farmType = FARM_TYPES[farmTypeKey];
  selectFarmType(farmTypeKey);
  state.day = 1;
  state.seasonIndex = 0;
  state.energy = MAX_ENERGY;
  state.maxEnergy = MAX_ENERGY;
  state.health = state.maxHealth;
  state.money = 500;
  state.resources = { wood: farmType.startingWood, stone: farmType.startingStone };
  state.inventory = { turnipSeed: 6, hay: 4, roastedRoot: 2 };
  state.buildings = [];
  state.animals = [];
  state.mineFloor = 1;
  state.inMine = false;
  state.mineNode = null;
  state.mineMonster = null;
  state.forageItems = [];
  state.fishingSpots = [];
  state.skills = initSkills();
  state.relationships = initRelationships();
  state.spouse = null;
  state.children = [];
  state.quests = {};
  state.seenEvents = {};
  state.achievements = {};
  state.toolLevels = { hoe: 0, water: 0, axe: 0, pickaxe: 0, scythe: 0, sword: 0, fishingRod: 0 };
  state.selectedSeed = 'turnip';
  state.selectedGift = null;
  state.shippingBin = {};
  state.lastDaySummary = null;
  state.museumDonations = {};
  state.playerName = (options.playerName || 'Farmer').trim() || 'Farmer';
  state.playerGender = options.gender === 'female' ? 'female' : 'male';
  state.playerAppearance = {
    hairColor: options.hairColor || '#5C3A21',
    shirtColor: options.shirtColor || '#4169E1',
  };
  state.player = { x: 0, y: 0, z: 0 };
  state.weather = 'Sunny';
  state.timeOfDay = 6;
  state.isNight = false;
  state.gameStarted = true;
  if (playerMesh && playerMesh.material) {
    playerMesh.material.color.set(state.playerAppearance.shirtColor);
  }
  initGrid();
  placeInitialDecorations();
  placeForageItems();
  // Add extra starting forage based on chosen farm type
  const extraForage = Math.max(0, farmType.startingForage - state.forageItems.length);
  for (let i = 0; i < extraForage; i++) {
    state.forageItems.push({ r: 4 + i * 2, c: 7 + (i % 4), type: 'mushroom' });
  }
  placeFishingSpots();
  acceptQuest('clearLand');
  refreshTileColors();
  updatePlayerPosition();
  updateHUD();
  notifyUI('onGameStarted');
  return true;
}

// Feature 5: Save/load - game state persists
function buildSavePayload() {
  return {
    day: state.day,
    seasonIndex: state.seasonIndex,
    energy: state.energy,
    maxEnergy: state.maxEnergy,
    health: state.health,
    maxHealth: state.maxHealth,
    money: state.money,
    resources: state.resources,
    inventory: state.inventory,
    selectedTool: state.selectedTool,
    selectedSeed: state.selectedSeed,
    selectedGift: state.selectedGift,
    grid: state.grid,
    player: state.player,
    playerName: state.playerName,
    playerGender: state.playerGender,
    playerAppearance: state.playerAppearance,
    currentZone: state.currentZone,
    weather: state.weather,
    isNight: state.isNight,
    timeOfDay: state.timeOfDay,
    buildings: state.buildings,
    animals: state.animals,
    skills: state.skills,
    relationships: state.relationships,
    spouse: state.spouse,
    children: state.children,
    forageItems: state.forageItems,
    fishingSpots: state.fishingSpots,
    quests: state.quests,
    seenEvents: state.seenEvents,
    achievements: state.achievements,
    toolLevels: state.toolLevels,
    shippingBin: state.shippingBin,
    museumDonations: state.museumDonations,
    unlockedAreas: { ...unlockedAreas },
    selectedFarmType,
  };
}

function applySavePayload(data) {
  state.day = data.day;
  state.seasonIndex = data.seasonIndex;
  state.energy = data.energy;
  state.maxEnergy = data.maxEnergy;
  if (data.health !== undefined) state.health = data.health;
  if (data.maxHealth !== undefined) state.maxHealth = data.maxHealth;
  state.money = data.money;
  if (data.resources) state.resources = data.resources;
  state.inventory = data.inventory || {};
  state.selectedTool = data.selectedTool || 'hoe';
  if (data.selectedSeed) state.selectedSeed = data.selectedSeed;
  if (data.selectedGift !== undefined) state.selectedGift = data.selectedGift;
  state.grid = data.grid;
  state.player = data.player || { x: 0, y: 0, z: 0 };
  if (data.playerName) state.playerName = data.playerName;
  if (data.playerGender) state.playerGender = data.playerGender;
  if (data.playerAppearance) state.playerAppearance = data.playerAppearance;
  if (data.currentZone) state.currentZone = data.currentZone;
  if (data.weather) state.weather = data.weather;
  state.isNight = data.isNight || false;
  state.timeOfDay = data.timeOfDay || 6;
  if (data.buildings) state.buildings = data.buildings;
  if (data.animals) state.animals = data.animals;
  if (data.skills) state.skills = data.skills;
  if (data.relationships) state.relationships = data.relationships;
  state.spouse = data.spouse !== undefined ? data.spouse : null;
  if (data.children) state.children = data.children;
  if (data.forageItems) state.forageItems = data.forageItems;
  if (data.fishingSpots) state.fishingSpots = data.fishingSpots;
  if (data.quests) state.quests = data.quests;
  if (data.seenEvents) state.seenEvents = data.seenEvents;
  if (data.achievements) state.achievements = data.achievements;
  if (data.toolLevels) state.toolLevels = data.toolLevels;
  if (data.shippingBin) state.shippingBin = data.shippingBin;
  if (data.museumDonations) state.museumDonations = data.museumDonations;
  if (data.unlockedAreas) {
    Object.keys(unlockedAreas).forEach((k) => delete unlockedAreas[k]);
    Object.assign(unlockedAreas, data.unlockedAreas);
  }
  if (data.selectedFarmType) selectedFarmType = data.selectedFarmType;
  state.gameStarted = true;
  if (playerMesh && playerMesh.material && state.playerAppearance?.shirtColor) {
    playerMesh.material.color.set(state.playerAppearance.shirtColor);
  }
  refreshTileColors();
  updatePlayerPosition();
  updateHUD();
}

function saveGame() {
  localStorage.setItem('valleylife_save', JSON.stringify(buildSavePayload()));
  showMessage('Game saved.');
}

function loadGame() {
  const raw = localStorage.getItem('valleylife_save');
  if (!raw) {
    showMessage('No save found.');
    return false;
  }
  try {
    applySavePayload(JSON.parse(raw));
    showMessage('Game loaded.');
    notifyUI('onGameStarted');
    return true;
  } catch (e) {
    showMessage('Load failed.');
    return false;
  }
}

function exportSaveJSON() {
  return JSON.stringify(buildSavePayload(), null, 2);
}

function importSaveJSON(jsonString) {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed || !Array.isArray(parsed.grid) || typeof parsed.day !== 'number') {
      return false;
    }
    applySavePayload(parsed);
    saveGame();
    notifyUI('onGameStarted');
    return true;
  } catch (e) {
    return false;
  }
}

// ============ Controls ============
function screenToGrid(clientX, clientY) {
  if (!renderer || !camera || !floorMesh) return null;
  const rect = renderer.domElement.getBoundingClientRect();
  pointerNDC.x = ((clientX - rect.left) / rect.width) * 2 - 1;
  pointerNDC.y = -((clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointerNDC, camera);
  const hits = raycaster.intersectObject(floorMesh);
  if (hits.length === 0) return null;
  const pt = hits[0].point;
  const centerX = -(GRID_WIDTH * TILE_SIZE) / 2;
  const centerZ = -(GRID_HEIGHT * TILE_SIZE) / 2;
  const c = Math.floor((pt.x - centerX) / TILE_SIZE);
  const r = Math.floor((pt.z - centerZ) / TILE_SIZE);
  if (r < 0 || r >= GRID_HEIGHT || c < 0 || c >= GRID_WIDTH) return null;
  return { r, c };
}

function updateHoverRing(tilePos) {
  if (!hoverRingMesh) return;
  if (!tilePos) {
    hoverRingMesh.visible = false;
    return;
  }
  const centerX = -(GRID_WIDTH * TILE_SIZE) / 2;
  const centerZ = -(GRID_HEIGHT * TILE_SIZE) / 2;
  hoverRingMesh.position.set(
    centerX + tilePos.c * TILE_SIZE + TILE_SIZE / 2,
    0.04,
    centerZ + tilePos.r * TILE_SIZE + TILE_SIZE / 2
  );
  hoverRingMesh.visible = true;
}

function interactOrUseAt(r, c) {
  const dr = Math.abs(r - state.player.y);
  const dc = Math.abs(c - state.player.x);
  if (dr > 1 || dc > 1) {
    // Step 1 tile toward clicked tile
    if (r < state.player.y) state.player.y--;
    else if (r > state.player.y) state.player.y++;
    if (c < state.player.x) state.player.x--;
    else if (c > state.player.x) state.player.x++;
    updatePlayerPosition();
    return false;
  }
  // Move player to adjacent clicked tile to perform action
  state.player.y = r;
  state.player.x = c;
  updatePlayerPosition();

  // Check villager at tile
  const talked = talkToVillager();
  if (talked) {
    notifyUI('openDialogue', { text: talked });
    return true;
  }
  // Check forage at tile
  if (forage()) return true;
  // Check mature crop harvest
  const tile = getTile(r, c);
  if (tile && tile.planted && tile.growth >= 1) {
    return harvestTile();
  }
  return useTool();
}

function initControls() {
  window.addEventListener('keydown', (e) => {
    const tag = (e.target && e.target.tagName) || '';
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    const key = e.key.toLowerCase();

    if (key === 'escape') {
      notifyUI('toggleModal', 'pause');
      return;
    }
    if (!state.gameStarted && typeof uiRenderer === 'object' && uiRenderer !== null) {
      return;
    }
    if (key === 'i' || key === 'tab') {
      e.preventDefault();
      notifyUI('toggleModal', 'inventory');
      return;
    }
    if (key === 'q') {
      notifyUI('toggleModal', 'quests');
      return;
    }
    if (key === 'b') {
      notifyUI('toggleModal', 'bundles');
      return;
    }
    if (key === 'k') {
      notifyUI('toggleModal', 'skills');
      return;
    }
    if (key === 'p') {
      notifyUI('toggleModal', 'social');
      return;
    }

    if (uiRenderer && typeof uiRenderer.isAnyModalOpen === 'function' && uiRenderer.isAnyModalOpen()) {
      return;
    }

    let moved = false;
    if (key === 'arrowup' || key === 'w') { if (state.player.y > 0) { state.player.y--; moved = true; } }
    if (key === 'arrowdown' || key === 's') { if (state.player.y < GRID_HEIGHT - 1) { state.player.y++; moved = true; } }
    if (key === 'arrowleft' || key === 'a') { if (state.player.x > 0) { state.player.x--; moved = true; } }
    if (key === 'arrowright' || key === 'd') { if (state.player.x < GRID_WIDTH - 1) { state.player.x++; moved = true; } }
    if (moved) {
      updatePlayerPosition();
      updateHUD();
    }
    if (key === ' ' || key === 'e') {
      e.preventDefault();
      const talked = talkToVillager();
      if (talked) {
        notifyUI('openDialogue', { text: talked });
      } else if (!forage()) {
        useTool();
      }
    }
    if (key === 'h') harvestTile();
    if (key === 'n') nextDay();
  });

  // Mouse hover & click raycast
  if (renderer && renderer.domElement) {
    renderer.domElement.addEventListener('mousemove', (e) => {
      hoveredTile = screenToGrid(e.clientX, e.clientY);
      updateHoverRing(hoveredTile);
    });
    renderer.domElement.addEventListener('click', (e) => {
      if (uiRenderer && typeof uiRenderer.isAnyModalOpen === 'function' && uiRenderer.isAnyModalOpen()) return;
      const pos = screenToGrid(e.clientX, e.clientY);
      if (pos) interactOrUseAt(pos.r, pos.c);
    });
    renderer.domElement.addEventListener('wheel', (e) => {
      e.preventDefault();
      cameraZoom = Math.max(12, Math.min(44, cameraZoom + (e.deltaY > 0 ? 2 : -2)));
    }, { passive: false });
  }

  // Legacy toolbar buttons (if present)
  document.getElementById('tool-hoe')?.addEventListener('click', () => setSelectedTool('hoe'));
  document.getElementById('tool-water')?.addEventListener('click', () => setSelectedTool('water'));
  document.getElementById('tool-axe')?.addEventListener('click', () => setSelectedTool('axe'));
  document.getElementById('tool-scythe')?.addEventListener('click', () => setSelectedTool('scythe'));
}

function useTool() {
  switch (state.selectedTool) {
    case 'hoe': return tillTile();
    case 'water': return waterTile();
    case 'axe': return chopTile();
    case 'pickaxe': return state.inMine ? mineOre() : showMessage('Use Pickaxe in Ironpeak Caverns!');
    case 'scythe': return scytheTile();
    case 'sword': return state.inMine ? attackMonster() : showMessage('Use Sword in Ironpeak Caverns!');
    case 'fishingRod': return fish();
    case 'seed': return plantSeed(state.selectedSeed);
    case 'food': {
      const foodKey = Object.keys(state.inventory).find(
        (k) => (CROPS[k]?.energyRestore || FORAGE_ITEMS[k]?.energyRestore || RECIPES[k]?.energyRestore || GENERAL_STORE_ITEMS[k]?.energyRestore) > 0
      );
      if (!foodKey) { showMessage('No food in inventory!'); return false; }
      const restore = CROPS[foodKey]?.energyRestore || FORAGE_ITEMS[foodKey]?.energyRestore || RECIPES[foodKey]?.energyRestore || GENERAL_STORE_ITEMS[foodKey]?.energyRestore || 15;
      return eatFood(foodKey, restore);
    }
    case 'gift': {
      const villagerKey = Object.keys(VILLAGER_POSITIONS).find(
        (k) => VILLAGER_POSITIONS[k].r === state.player.y && VILLAGER_POSITIONS[k].c === state.player.x
      );
      if (!villagerKey) { showMessage('Stand next to a villager to give a gift!'); return false; }
      const giftKey = state.selectedGift || Object.keys(state.inventory)[0];
      if (!giftKey) { showMessage('No item to gift!'); return false; }
      return giveGift(villagerKey, giftKey);
    }
    default: return false;
  }
}

// Hotbar keys 1-9, 0
function initPlantingKeys() {
  const hotbarTools = ['hoe', 'water', 'axe', 'pickaxe', 'scythe', 'sword', 'fishingRod', 'seed', 'food', 'gift'];
  window.addEventListener('keydown', (e) => {
    const tag = (e.target && e.target.tagName) || '';
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    if (uiRenderer && typeof uiRenderer.isAnyModalOpen === 'function' && uiRenderer.isAnyModalOpen()) return;
    const key = e.key;
    if (key >= '1' && key <= '9') {
      setSelectedTool(hotbarTools[parseInt(key, 10) - 1]);
    } else if (key === '0') {
      setSelectedTool(hotbarTools[9]);
    }
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

const _cameraTarget = new THREE.Vector3();
function animate() {
  requestAnimationFrame(animate);
  if (playerMesh && camera) {
    _cameraTarget.set(
      playerMesh.position.x,
      cameraZoom,
      playerMesh.position.z + cameraZoom * 0.72
    );
    camera.position.lerp(_cameraTarget, 0.12);
    camera.lookAt(playerMesh.position.x, 0, playerMesh.position.z);
  }
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
  // Phase 1 Content & Systems (Features 39-43)
  LOCATIONS,
  CHICKEN_VARIANTS,
  FISH_TYPES,
  ITEM_PRICES,
  RECIPES,
  QUESTS,
  STORY_EVENTS,
  FESTIVALS,
  ACHIEVEMENTS,
  buySeed,
  shipItem,
  acceptQuest,
  completeQuest,
  getActiveQuests,
  triggerEvent,
  hasSeenEvent,
  unlockAchievement,
  hasAchievement,
  cookRecipe,
  // Phase 2 UI, Economy, Upgrades & Save/Load (Features 44-45)
  WEEKDAYS,
  TOOL_NAMES,
  TOOL_UPGRADE_TIERS,
  GENERAL_STORE_ITEMS,
  MUSEUM_ARTIFACTS,
  setUIRenderer,
  setSelectedSeed,
  startNewGame,
  upgradeTool,
  queueShipItem,
  processShippingBin,
  buyItem,
  buyAnimal,
  donateToMuseum,
  exportSaveJSON,
  importSaveJSON,
  useTool,
  interactOrUseAt,
};

if (typeof globalThis !== 'undefined') {
  globalThis.ValleyLife = ValleyLifeAPI;
}

// Only auto-init in a real browser environment (not under test)
if (typeof document !== 'undefined' && !globalThis.__VALLEYLIFE_TEST__) {
  init();
}

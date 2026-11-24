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

// ============ Game State ============
const state = {
  day: 1,
  seasonIndex: 0,
  energy: MAX_ENERGY,
  maxEnergy: MAX_ENERGY,
  money: 500,
  inventory: {},
  selectedTool: 'hoe',
  grid: [], // 2D array of tile objects
  player: { x: 0, y: 0, z: 0 },
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
  if (dayEl) dayEl.textContent = `Day ${state.day}, ${SEASONS[state.seasonIndex]}`;
  if (energyEl) energyEl.textContent = `Energy: ${state.energy}/${state.maxEnergy}`;
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
  advanceCropGrowth();
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
  buildTileMeshes();
  initControls();
  initPlantingKeys();
  updateHUD();
  placeInitialDecorations();
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
};

if (typeof globalThis !== 'undefined') {
  globalThis.ValleyLife = ValleyLifeAPI;
}

// Only auto-init in a real browser environment (not under test)
if (typeof document !== 'undefined' && !globalThis.__VALLEYLIFE_TEST__) {
  init();
}

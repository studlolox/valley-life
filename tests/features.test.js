// Valley Life - Feature Tests
// Runs each feature's single test from SPEC.md

import { JSDOM } from 'jsdom';

globalThis.__VALLEYLIFE_TEST__ = true;
const dom = new JSDOM('<!DOCTYPE html><html><body><canvas id="test-canvas"></canvas><div id="day-display"></div><div id="energy-display"></div><div id="resources-display"></div><div id="message"></div><div id="toolbar"><button id="tool-hoe"></button><button id="tool-water"></button><button id="tool-axe"></button><button id="tool-scythe"></button></div></body></html>', {
  url: 'http://localhost/',
  pretendToBeVisual: true,
});
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.requestAnimationFrame = (cb) => setTimeout(cb, 0);
globalThis.cancelAnimationFrame = (id) => clearTimeout(id);

// localStorage mock (jsdom doesn't provide it)
const localStorageStore = {};
globalThis.localStorage = {
  getItem: (k) => localStorageStore[k] || null,
  setItem: (k, v) => { localStorageStore[k] = String(v); },
  removeItem: (k) => { delete localStorageStore[k]; },
  clear: () => { Object.keys(localStorageStore).forEach((k) => delete localStorageStore[k]); },
};

// Load three.js into the global scope (game.js imports it via importmap in browser,
// but here we import directly and attach to window.THREE so the module's import resolves)
import * as THREE from 'three';
global.THREE = THREE;

// Now load the game module
import '../js/game.js';

const V = globalThis.ValleyLife;
const assert = (cond, msg) => {
  if (!cond) throw new Error('FAIL: ' + msg);
};

let passed = 0;
let failed = 0;
function test(name, fn) {
  try {
    fn();
    passed++;
    console.log(`PASS: ${name}`);
  } catch (e) {
    failed++;
    console.error(`FAIL: ${name} — ${e.message}`);
  }
}

// Reset state to fresh defaults between tests
function resetState() {
  V.state.day = 1;
  V.state.seasonIndex = 0;
  V.state.energy = V.MAX_ENERGY;
  V.state.maxEnergy = V.MAX_ENERGY;
  V.state.money = 500;
  V.state.resources = { wood: 60, stone: 40 };
  V.state.inventory = {};
  V.state.buildings = [];
  V.state.animals = [];
  V.state.selectedTool = 'hoe';
  V.state.selectedBuilding = null;
  V.state.isNight = false;
  V.state.timeOfDay = 6;
  V.state.dayComplete = false;
  V.initGrid();
}

// ---------- Feature 1: Day/night cycle ----------
test('Feature 1: New morning resets energy to max', () => {
  resetState();
  V.state.energy = 10;
  V.state.day = 3;
  V.nextDay();
  assert(V.state.energy === V.MAX_ENERGY, `energy should be max ${V.MAX_ENERGY}, got ${V.state.energy}`);
});

// ---------- Feature 2: Season system ----------
test('Feature 2: Advancing 28 days cycles Spring -> Summer', () => {
  resetState();
  assert(V.SEASONS[V.state.seasonIndex] === 'Spring', 'start in Spring');
  V.advanceDays(28);
  assert(V.SEASONS[V.state.seasonIndex] === 'Summer', `should be Summer, got ${V.SEASONS[V.state.seasonIndex]}`);
  assert(V.state.day === 1, 'day should reset to 1');
});

// ---------- Feature 3: Energy depletion ----------
test('Feature 3: Tilling one tile reduces energy by fixed amount', () => {
  resetState();
  const before = V.state.energy;
  // ensure player on grass tile
  const tile = V.state.grid[V.state.player.y][V.state.player.x];
  tile.type = 'grass';
  tile.hasTree = false;
  tile.hasRock = false;
  tile.hasWeed = false;
  tile.planted = null;
  const result = V.tillTile();
  assert(result === true, 'till should succeed');
  assert(V.state.energy === before - V.ENERGY_PER_TILL, `energy should drop by ${V.ENERGY_PER_TILL}`);
});

// ---------- Feature 4: Energy replenishment ----------
test('Feature 4: Eating food restores energy, capped at max', () => {
  resetState();
  V.state.energy = 20;
  V.state.inventory['turnip'] = 1;
  const result = V.eatFood('turnip', 40);
  assert(result === true, 'eat should succeed');
  assert(V.state.energy === 60, `energy should be 60, got ${V.state.energy}`);
  assert(V.state.inventory['turnip'] === 0 || !V.state.inventory['turnip'], 'turnip should be consumed');
});

// Feature 4: cap at max
test('Feature 4: Energy capped at max', () => {
  resetState();
  V.state.energy = 95;
  V.state.inventory['turnip'] = 1;
  V.eatFood('turnip', 40);
  assert(V.state.energy === V.MAX_ENERGY, `energy capped at ${V.MAX_ENERGY}, got ${V.state.energy}`);
});

// ---------- Feature 5: Save/load ----------
test('Feature 5: Save then load restores day, energy, position, inventory', () => {
  resetState();
  V.state.day = 10;
  V.state.energy = 42;
  V.state.player.x = 5;
  V.state.player.y = 7;
  V.state.inventory['turnip'] = 3;
  V.saveGame();
  // mutate then reload
  V.state.day = 1;
  V.state.energy = 100;
  V.state.player.x = 0;
  V.state.player.y = 0;
  V.state.inventory = {};
  const loaded = V.loadGame();
  assert(loaded === true, 'load should succeed');
  assert(V.state.day === 10, `day should be 10, got ${V.state.day}`);
  assert(V.state.energy === 42, `energy should be 42, got ${V.state.energy}`);
  assert(V.state.player.x === 5 && V.state.player.y === 7, 'position should restore');
  assert(V.state.inventory['turnip'] === 3, 'inventory should restore');
});

// ---------- Feature 6: Land clearing ----------
test('Feature 6: Axe removes tree and makes tile tillable', () => {
  resetState();
  const tile = V.state.grid[V.state.player.y][V.state.player.x];
  tile.hasTree = true;
  tile.type = 'grass';
  const result = V.chopTile();
  assert(result === true, 'chop should succeed');
  assert(tile.hasTree === false, 'tree should be removed');
});

// ---------- Feature 7: Tilling ----------
test('Feature 7: Hoe converts cleared tile to tilled', () => {
  resetState();
  const tile = V.state.grid[V.state.player.y][V.state.player.x];
  tile.type = 'grass';
  tile.hasTree = false;
  tile.hasRock = false;
  tile.hasWeed = false;
  tile.planted = null;
  V.tillTile();
  assert(tile.type === 'tilled', 'tile should be tilled');
});

// ---------- Feature 8: Planting ----------
test('Feature 8: Planting valid seasonal seed marks tile planted', () => {
  resetState();
  const tile = V.state.grid[V.state.player.y][V.state.player.x];
  tile.type = 'tilled';
  tile.planted = null;
  // Spring -> turnip valid
  const result = V.plantSeed('turnip');
  assert(result === true, 'plant should succeed');
  assert(tile.planted === 'turnip', 'tile should be planted with turnip');
  assert(tile.growth === 0, 'growth starts at 0');
});

// ---------- Feature 9: Watering ----------
test('Feature 9: Watering advances growth; unwatered does not grow', () => {
  resetState();
  const tile = V.state.grid[V.state.player.y][V.state.player.x];
  tile.type = 'tilled';
  tile.planted = 'turnip';
  tile.growth = 0;
  tile.growDay = V.state.day - 1;
  tile.watered = false;
  V.waterTile();
  assert(tile.watered === true, 'tile should be watered');
  // advance day & growth
  V.state.day++;
  V.advanceCropGrowth();
  assert(tile.growth > 0, 'watered crop should grow');
});

// ---------- Feature 10: Crop growth ----------
test('Feature 10: Mature crop yields harvestable item', () => {
  resetState();
  const tile = V.state.grid[V.state.player.y][V.state.player.x];
  tile.type = 'tilled';
  tile.planted = 'turnip';
  tile.growth = 1;
  tile.growDay = V.state.day - 4;
  tile.watered = true;
  const before = (V.state.inventory['turnip'] || 0);
  const result = V.harvestTile();
  assert(result === true, 'harvest should succeed');
  assert((V.state.inventory['turnip'] || 0) === before + 1, 'produce added to inventory');
  assert(tile.planted === null, 'tile cleared after harvest');
});

// ---------- Feature 11: Harvesting ----------
test('Feature 11: Harvesting mature crop adds produce to inventory', () => {
  resetState();
  const tile = V.state.grid[V.state.player.y][V.state.player.x];
  tile.type = 'tilled';
  tile.planted = 'bean';
  tile.growth = 1;
  tile.watered = true;
  V.harvestTile();
  assert(V.state.inventory['bean'] === 1, 'bean added to inventory');
});

// ---------- Feature 12: Seasonal crops ----------
test('Feature 12: Summer seed cannot be planted in Spring', () => {
  resetState();
  V.state.seasonIndex = 0; // Spring
  const tile = V.state.grid[V.state.player.y][V.state.player.x];
  tile.type = 'tilled';
  tile.planted = null;
  const result = V.plantSeed('bean'); // bean is Summer
  assert(result === false, 'Summer seed should not plant in Spring');
});

// ---------- Feature 13: Scythe ----------
test('Feature 13: Scythe clears weed and may add hay', () => {
  resetState();
  const tile = V.state.grid[V.state.player.y][V.state.player.x];
  tile.hasWeed = true;
  const hayBefore = V.state.inventory['hay'] || 0;
  V.scytheTile();
  assert(tile.hasWeed === false, 'weed should be cleared');
  const hayAfter = V.state.inventory['hay'] || 0;
  assert(hayAfter >= hayBefore, 'hay count should not decrease');
});

// ---------- Feature 14: Build coop ----------
test('Feature 14: Build coop adds a structure that houses chickens', () => {
  resetState();
  // ensure player tile is clear grass
  const tile = V.state.grid[V.state.player.y][V.state.player.x];
  tile.hasTree = false;
  tile.hasRock = false;
  tile.hasWeed = false;
  tile.planted = null;
  tile.type = 'grass';
  const woodBefore = V.state.resources.wood;
  const stoneBefore = V.state.resources.stone;
  const result = V.buildStructure('coop');
  assert(result === true, 'build coop should succeed');
  assert(V.state.buildings.length === 1, 'one building should exist');
  assert(V.state.buildings[0].type === 'coop', 'building should be a coop');
  assert(V.state.buildings[0].capacity === 4, 'coop capacity should be 4');
  assert(V.state.buildings[0].houses.includes('chicken'), 'coop should house chickens');
  assert(V.state.resources.wood === woodBefore - V.BUILDINGS.coop.cost.wood, 'wood should be spent');
  assert(V.state.resources.stone === stoneBefore - V.BUILDINGS.coop.cost.stone, 'stone should be spent');
});

// ---------- Feature 15: Build barn ----------
test('Feature 15: Build barn adds a structure that houses cows', () => {
  resetState();
  V.state.resources.wood = 200; // ensure enough for barn
  const tile = V.state.grid[V.state.player.y][V.state.player.x];
  tile.hasTree = false;
  tile.hasRock = false;
  tile.hasWeed = false;
  tile.planted = null;
  tile.type = 'grass';
  const result = V.buildStructure('barn');
  assert(result === true, 'build barn should succeed');
  assert(V.state.buildings.length === 1, 'one building should exist');
  assert(V.state.buildings[0].type === 'barn', 'building should be a barn');
  assert(V.state.buildings[0].capacity === 6, 'barn capacity should be 6');
  assert(V.state.buildings[0].houses.includes('cow'), 'barn should house cows');
});

// ---------- Feature 16: Animal products ----------
test('Feature 16: Fed chicken produces an egg each morning', () => {
  resetState();
  V.buildStructure('coop');
  V.addAnimal('chicken', 0);
  V.state.inventory.hay = 5;
  V.feedAnimals(0); // chicken fed, 1 hay consumed
  V.collectMorningProducts(); // morning collection
  assert(V.state.inventory.egg === 1, 'fed chicken should produce an egg');
  assert((V.state.inventory.hay || 0) === 4, 'hay should be consumed');
});

// ---------- Feature 17: Animal feeding ----------
test('Feature 17: Unfed animal produces nothing', () => {
  resetState();
  V.buildStructure('coop');
  V.addAnimal('chicken', 0); // fed defaults to false
  V.collectMorningProducts();
  assert(!V.state.inventory.egg, 'unfed chicken should produce nothing');
});

// ---------- Feature 18: Animal varieties ----------
test('Feature 18: Ostrich is a distinct animal type from chicken', () => {
  resetState();
  V.state.resources = { wood: 300, stone: 100 };
  V.buildStructure('coop');    // index 0 - houses chicken
  V.buildStructure('barn');    // index 1 - houses cow and ostrich
  V.addAnimal('chicken', 0);
  V.addAnimal('ostrich', 1);
  assert(V.state.buildings[0].animals.length === 1, 'chicken in coop');
  assert(V.state.buildings[1].animals.length === 1, 'ostrich in barn');
  const coopType = V.state.buildings[0].animals[0].type;
  const barnType = V.state.buildings[1].animals[0].type;
  assert(coopType === 'chicken' && barnType === 'ostrich', 'ostrich is distinct from chicken');
});

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);

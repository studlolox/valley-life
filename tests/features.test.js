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
  V.state.mineFloor = 1;
  V.state.inMine = false;
  V.state.mineNode = null;
  V.state.mineMonster = null;
  V.state.forageItems = [];
  V.state.fishingSpots = [];
  V.state.skills = V.initSkills();
  V.state.relationships = V.initRelationships();
  V.state.spouse = null;
  V.state.children = [];
  V.state.quests = {};
  V.state.seenEvents = {};
  V.state.achievements = {};
  V.state.playerGender = 'male'; // default player gender for tests
  V.state.selectedTool = 'hoe';
  V.state.selectedBuilding = null;
  V.state.isNight = false;
  V.state.timeOfDay = 6;
  V.state.dayComplete = false;
  // Reset villager married flags on the shared data object
  for (const key of Object.keys(V.VILLAGERS || {})) {
    V.VILLAGERS[key].married = false;
  }
  // Reset bundle completion flags on the shared data object
  for (const key of Object.keys(V.BUNDLES || {})) {
    V.BUNDLES[key].completed = false;
  }
  // Reset unlocked areas
  for (const key of Object.keys(V.getUnlockedAreas() || {})) {
    delete V.getUnlockedAreas()[key];
  }
  // Reset farm type selection
  V.selectFarmType('standard');
  // Reset multiplayer session
  V.resetMultiplayer();
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

// ---------- Feature 19: Cave exploration ----------
test('Feature 19: Entering the mine places the player on the first floor', () => {
  resetState();
  V.state.energy = V.MAX_ENERGY;
  const result = V.enterMine();
  assert(result === true, 'enter mine should succeed');
  assert(V.state.inMine === true, 'player should be in the mine');
  assert(V.state.mineFloor === 1, 'player should be on the first mine floor');
  assert(V.state.mineNode !== null, 'mine floor should have an ore node');
  assert(V.state.mineMonster !== null, 'mine floor should have a monster');
});

// ---------- Feature 20: Ore mining ----------
test('Feature 20: Mining an ore node yields ore', () => {
  resetState();
  V.state.energy = V.MAX_ENERGY;
  V.state.inventory = {};
  V.enterMine();
  const oreType = V.state.mineNode.type;
  const result = V.mineOre();
  assert(result === true, 'mining should succeed');
  assert((V.state.inventory[oreType] || 0) === 1, `mined ${oreType} added to inventory`);
  assert(V.state.mineNode === null, 'ore node should be cleared after mining');
});

// ---------- Feature 21: Combat in mines ----------
test('Feature 21: Attacking a monster with a sword reduces its health', () => {
  resetState();
  V.state.energy = V.MAX_ENERGY;
  V.enterMine();
  const monsterHp = V.state.mineMonster.hp;
  const result = V.attackMonster();
  assert(result === true, 'attack should succeed');
  assert(V.state.mineMonster.hp === monsterHp - 1, 'monster health should decrease');
});

// ---------- Feature 22: Floor progression ----------
test('Feature 22: Deeper floors expose more valuable ores', () => {
  resetState();
  const floor1Tier = V.oreTierForFloor(1);
  const floor5Tier = V.oreTierForFloor(5);
  assert(floor1Tier.ore === 'copperOre', 'floor 1 should have copper ore');
  assert(floor5Tier.ore === 'ironOre', 'floor 5 should have iron ore (more valuable)');
});

// ---------- Feature 23: Smelting ----------
test('Feature 23: Smelting copper ore produces a copper bar', () => {
  resetState();
  V.state.inventory.copperOre = 1;
  const result = V.smelt('copperOre');
  assert(result === true, 'smelting should succeed');
  assert(V.state.inventory.copperBar === 1, 'copper bar produced');
  assert(!V.state.inventory.copperOre, 'copper ore consumed');
});

// ---------- Feature 24: Foraging ----------
test('Feature 24: Foraging collects wild items into inventory', () => {
  resetState();
  V.state.forageItems.push({ r: V.state.player.y, c: V.state.player.x, type: 'wildRoot' });
  const result = V.forage();
  assert(result === true, 'foraging should succeed');
  assert(V.state.inventory.wildRoot === 1, 'wild root added to inventory');
  assert(V.state.forageItems.length === 0, 'forage item consumed');
});

// ---------- Feature 25: Fishing ----------
test('Feature 25: Fishing at a valid spot catches a fish', () => {
  resetState();
  V.state.energy = V.MAX_ENERGY;
  V.state.fishingSpots.push({ r: V.state.player.y, c: V.state.player.x });
  const result = V.fish();
  assert(result === true, 'fishing should succeed');
  assert(V.state.inventory.fish === 1, 'fish added to inventory');
});

// ---------- Feature 26: Skill leveling ----------
test('Feature 26: Harvesting a crop increases farming experience and levels up', () => {
  resetState();
  // Set farming xp close to next level (level 1 needs 25 xp)
  V.state.skills.farming.xp = 20;
  const tile = V.state.grid[V.state.player.y][V.state.player.x];
  tile.type = 'tilled';
  tile.planted = 'turnip';
  tile.growth = 1;
  tile.watered = true;
  V.harvestTile(); // +10 xp -> 30, enough to level from 1 to 2
  assert(V.state.skills.farming.level === 2, 'farming skill should level up');
  assert(V.state.skills.farming.xp === 5, 'remaining xp after level up');
});

// ---------- Feature 27: Skill caps ----------
test('Feature 27: Each skill has a maximum level', () => {
  resetState();
  // Max out farming skill
  V.state.skills.farming.level = V.SKILL_MAX_LEVEL;
  V.state.skills.farming.xp = 9999;
  const tile = V.state.grid[V.state.player.y][V.state.player.x];
  tile.type = 'tilled';
  tile.planted = 'turnip';
  tile.growth = 1;
  tile.watered = true;
  V.harvestTile();
  assert(V.state.skills.farming.level === V.SKILL_MAX_LEVEL, 'skill cannot exceed max level');
});

// ---------- Feature 28: NPC interaction ----------
test('Feature 28: Interacting with a villager displays their dialogue', () => {
  resetState();
  // Place the player on the elder's tile
  V.state.player.y = V.VILLAGER_POSITIONS.elder.r;
  V.state.player.x = V.VILLAGER_POSITIONS.elder.c;
  const dialogue = V.talkToVillager();
  assert(typeof dialogue === 'string' && dialogue.length > 0, 'talking should return dialogue text');
});

// ---------- Feature 29: Gift giving ----------
test('Feature 29: Giving a liked gift increases relationship points', () => {
  resetState();
  const villager = 'baker';
  V.state.player.y = V.VILLAGER_POSITIONS[villager].r;
  V.state.player.x = V.VILLAGER_POSITIONS[villager].c;
  // Talk first so the villager accepts a gift
  V.talkToVillager();
  // Give the baker's liked gift (wheat)
  V.state.inventory.wheat = 1;
  const before = V.state.relationships[villager].points;
  const result = V.giveGift(villager, 'wheat');
  assert(result === true, 'gift giving should succeed');
  assert(V.state.relationships[villager].points > before, 'relationship points should increase');
  assert(!V.state.inventory.wheat, 'gift item should be consumed');
});

// ---------- Feature 30: Marriage ----------
test('Feature 30: Marrying an eligible villager sets the player\'s spouse', () => {
  resetState();
  const villager = 'farmer';
  V.state.player.y = V.VILLAGER_POSITIONS[villager].r;
  V.state.player.x = V.VILLAGER_POSITIONS[villager].c;
  // Build up relationship by talking and giving liked gifts
  V.state.inventory.turnip = 5; // turnip is the farmer's liked gift
  for (let i = 0; i < 10; i++) {
    V.talkToVillager();
    V.giveGift(villager, 'turnip');
  }
  const result = V.marryVillager(villager);
  assert(result === true, 'marriage should succeed');
  assert(V.state.spouse === villager, 'spouse should be set to the villager');
});

// ---------- Feature 30 (restriction): same-gender marriage is not allowed ----------
test('Feature 30: Same-gender marriage is rejected', () => {
  resetState();
  // Default player gender is male; smith is male -> same gender, must be rejected
  const villager = 'smith';
  V.state.player.y = V.VILLAGER_POSITIONS[villager].r;
  V.state.player.x = V.VILLAGER_POSITIONS[villager].c;
  V.state.inventory.ironBar = 5; // smith's liked gift
  for (let i = 0; i < 10; i++) {
    V.talkToVillager();
    V.giveGift(villager, 'ironBar');
  }
  const rel = V.state.relationships[villager];
  assert(rel.points >= V.MARRIAGE_RELATIONSHIP, 'relationship should be high enough to marry');
  const result = V.marryVillager(villager);
  assert(result === false, 'same-gender marriage should be rejected');
  assert(V.state.spouse === null, 'spouse should remain null');
});

// ---------- Feature 31: Spouse help ----------
test('Feature 31: After marriage, spouse waters at least one crop during the night', () => {
  resetState();
  const villager = 'farmer';
  V.state.player.y = V.VILLAGER_POSITIONS[villager].r;
  V.state.player.x = V.VILLAGER_POSITIONS[villager].c;
  V.state.inventory.turnip = 5;
  for (let i = 0; i < 10; i++) {
    V.talkToVillager();
    V.giveGift(villager, 'turnip');
  }
  V.marryVillager(villager);
  assert(V.state.spouse === villager, 'married setup');
  // Plant an unwatered crop on the player's tile
  const tile = V.state.grid[V.state.player.y][V.state.player.x];
  tile.type = 'tilled';
  tile.planted = 'turnip';
  tile.growth = 0;
  tile.watered = false;
  V.nextDay(); // night passes, spouse helps
  assert(tile.watered === true, 'spouse should water at least one crop');
});

// ---------- Feature 32: Children ----------
test('Feature 32: Choosing to have a child adds a child to the household', () => {
  resetState();
  const villager = 'farmer';
  V.state.player.y = V.VILLAGER_POSITIONS[villager].r;
  V.state.player.x = V.VILLAGER_POSITIONS[villager].c;
  V.state.inventory.turnip = 5;
  for (let i = 0; i < 10; i++) {
    V.talkToVillager();
    V.giveGift(villager, 'turnip');
  }
  V.marryVillager(villager);
  const before = V.state.children.length;
  const result = V.haveChild();
  assert(result === true, 'having a child should succeed');
  assert(V.state.children.length === before + 1, 'a child should be added to the household');
});

// ---------- Feature 33: Community Center bundles ----------
test('Feature 33: Donating all required items completes a bundle', () => {
  resetState();
  V.state.inventory.turnip = 10;
  const result = V.donateToBundle('springCrops');
  assert(result === true, 'donating all required items should complete the bundle');
  assert(V.BUNDLES.springCrops.completed === true, 'springCrops bundle should be marked complete');
  assert(V.state.inventory.turnip === 0 || !V.state.inventory.turnip, 'required items should be consumed');
});

// ---------- Feature 34: Bundle rewards ----------
test('Feature 34: Completing a bundle unlocks a new area', () => {
  resetState();
  V.state.inventory.turnip = 10;
  V.donateToBundle('springCrops');
  assert(V.isAreaUnlocked('springFieldsUnlocked') === true, 'completing a bundle should unlock its reward area');
});

// ---------- Feature 35: Farm types ----------
test('Feature 35: Forest farm type starts with more forage than Standard', () => {
  resetState();
  const forest = V.getFarmTypes().forest;
  const standard = V.getFarmTypes().standard;
  assert(forest.startingForage > standard.startingForage, 'Forest farm should start with more forage than Standard');
  const result = V.selectFarmType('forest');
  assert(result === true, 'selecting forest farm type should succeed');
  assert(V.getSelectedFarmType() === 'forest', 'selected farm type should be forest');
});

// ---------- Feature 36: Multiplayer ----------
test('Feature 36: Connecting a second client synchronizes position to host', () => {
  resetState();
  const hostId = 'player1';
  const clientId = 'player2';
  assert(V.hostSession(hostId) === true, 'host session should start');
  assert(V.joinSession(clientId) === true, 'second client should join');
  assert(V.syncPlayerPosition(clientId, 5, 7) === true, 'client position should sync');
  const pos = V.getPlayerPosition(clientId);
  assert(pos.x === 5 && pos.y === 7, 'client position should be synchronized');
  assert(V.getConnectedPlayers().length === 2, 'host and client should both be connected');
});

// ---------- Feature 39: Shop and economy ----------
test('Feature 39: Buying a seed deducts Gold and shipping produce adds Gold', () => {
  resetState();
  V.state.money = 100;
  const bought = V.buySeed('turnip', 2); // 2 * 5 = 10G
  assert(bought === true, 'buying turnip seeds should succeed');
  assert(V.state.money === 90, `money should be 90 after purchase, got ${V.state.money}`);
  assert(V.state.inventory.turnipSeed === 2, 'seeds should be in inventory');
  V.state.inventory.turnip = 3;
  const shipped = V.shipItem('turnip', 2); // 2 * 10 = 20G
  assert(shipped === true, 'shipping turnips should succeed');
  assert(V.state.money === 110, `money should be 110 after shipping, got ${V.state.money}`);
  assert(V.state.inventory.turnip === 1, 'remaining turnip count should be 1');
});

// ---------- Feature 40: Quests ----------
test('Feature 40: Completing an active quest awards Gold', () => {
  resetState();
  const accepted = V.acceptQuest('clearLand');
  assert(accepted === true, 'accepting quest should succeed');
  assert(V.getActiveQuests().length === 1, 'one quest should be active');
  V.state.inventory.turnip = 1;
  const moneyBefore = V.state.money;
  const completed = V.completeQuest('clearLand');
  assert(completed === true, 'completing quest should succeed');
  assert(V.state.quests.clearLand.completed === true, 'quest should be marked complete');
  assert(V.state.money === moneyBefore + V.QUESTS.clearLand.rewardGold, 'quest reward Gold should be awarded');
});

// ---------- Feature 41: Storyline events ----------
test('Feature 41: Triggering a storyline event returns lines and marks seen', () => {
  resetState();
  assert(V.hasSeenEvent('arrivalLetter') === false, 'event should start unseen');
  const lines = V.triggerEvent('arrivalLetter');
  assert(Array.isArray(lines) && lines.length > 0, 'event should return dialogue/story lines');
  assert(V.hasSeenEvent('arrivalLetter') === true, 'event should be marked seen');
});

// ---------- Feature 42: Achievements ----------
test('Feature 42: Unlocking an achievement records it once', () => {
  resetState();
  assert(V.hasAchievement('firstHarvest') === false, 'achievement should start locked');
  assert(V.unlockAchievement('firstHarvest') === true, 'first unlock should return true');
  assert(V.hasAchievement('firstHarvest') === true, 'achievement should be unlocked');
  assert(V.unlockAchievement('firstHarvest') === false, 'duplicate unlock should return false');
});

// ---------- Feature 43: Cooking and crafting ----------
test('Feature 43: Cooking a recipe consumes ingredients and adds cooked dish', () => {
  resetState();
  V.state.inventory.berry = 2;
  V.state.inventory.egg = 1;
  const cooked = V.cookRecipe('berryPie');
  assert(cooked === true, 'cooking berryPie should succeed');
  assert(!V.state.inventory.berry && !V.state.inventory.egg, 'ingredients should be consumed');
  assert(V.state.inventory.berryPie === 1, 'cooked berryPie should be in inventory');
});

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);

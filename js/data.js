// Valley Life - Original Game Content & Catalogs
// All code, names, dialogue, and data written from scratch for Valley Life.

export const LOCATIONS = {
  valley: 'Sunhollow Valley',
  town: 'Willowbrook',
  farm: 'Oakridge Farm',
  hall: 'Willowbrook Hall',
  mine: 'Ironpeak Caverns',
  river: 'Clearwater River',
  coast: 'Silverfin Coast',
  rival: 'Apex Mart',
};

// 16 Seasonal Crops (4 per season)
export const CROPS = {
  // Spring
  turnip:      { name: 'Turnip',      seasons: ['Spring'], growDays: 4, sellPrice: 10, energyRestore: 15 },
  strawberry:  { name: 'Strawberry',  seasons: ['Spring'], growDays: 6, sellPrice: 24, energyRestore: 25 },
  potato:      { name: 'Potato',      seasons: ['Spring'], growDays: 5, sellPrice: 16, energyRestore: 20 },
  cauliflower: { name: 'Cauliflower', seasons: ['Spring'], growDays: 8, sellPrice: 35, energyRestore: 35 },
  // Summer
  bean:        { name: 'Bean',        seasons: ['Summer'], growDays: 6, sellPrice: 15, energyRestore: 18 },
  melon:       { name: 'Melon',       seasons: ['Summer'], growDays: 8, sellPrice: 40, energyRestore: 40 },
  tomato:      { name: 'Tomato',      seasons: ['Summer'], growDays: 5, sellPrice: 18, energyRestore: 20 },
  blueberry:   { name: 'Blueberry',   seasons: ['Summer'], growDays: 7, sellPrice: 28, energyRestore: 25 },
  // Autumn
  squash:      { name: 'Squash',      seasons: ['Autumn'], growDays: 5, sellPrice: 12, energyRestore: 18 },
  pumpkin:     { name: 'Pumpkin',     seasons: ['Autumn'], growDays: 8, sellPrice: 42, energyRestore: 35 },
  corn:        { name: 'Corn',        seasons: ['Autumn'], growDays: 6, sellPrice: 22, energyRestore: 22 },
  cranberry:   { name: 'Cranberry',   seasons: ['Autumn'], growDays: 5, sellPrice: 20, energyRestore: 20 },
  // Winter
  root:        { name: 'Root',        seasons: ['Winter'], growDays: 7, sellPrice: 18, energyRestore: 22 },
  frostherb:   { name: 'Frost Herb',  seasons: ['Winter'], growDays: 4, sellPrice: 20, energyRestore: 24 },
  snowdrop:    { name: 'Snowdrop',    seasons: ['Winter'], growDays: 5, sellPrice: 26, energyRestore: 15 },
  iceberry:    { name: 'Ice Berry',   seasons: ['Winter'], growDays: 6, sellPrice: 32, energyRestore: 30 },
};

// Matching Seed Definitions
export const SEEDS = {
  turnip:      { name: 'Turnip Seed',      crop: 'turnip',      season: 'Spring', price: 5 },
  strawberry:  { name: 'Strawberry Seed',  crop: 'strawberry',  season: 'Spring', price: 12 },
  potato:      { name: 'Potato Seed',      crop: 'potato',      season: 'Spring', price: 8 },
  cauliflower: { name: 'Cauliflower Seed', crop: 'cauliflower', season: 'Spring', price: 16 },
  bean:        { name: 'Bean Seed',        crop: 'bean',        season: 'Summer', price: 7 },
  melon:       { name: 'Melon Seed',       crop: 'melon',       season: 'Summer', price: 18 },
  tomato:      { name: 'Tomato Seed',      crop: 'tomato',      season: 'Summer', price: 9 },
  blueberry:   { name: 'Blueberry Seed',   crop: 'blueberry',   season: 'Summer', price: 14 },
  squash:      { name: 'Squash Seed',      crop: 'squash',      season: 'Autumn', price: 6 },
  pumpkin:     { name: 'Pumpkin Seed',     crop: 'pumpkin',     season: 'Autumn', price: 20 },
  corn:        { name: 'Corn Seed',        crop: 'corn',        season: 'Autumn', price: 10 },
  cranberry:   { name: 'Cranberry Seed',   crop: 'cranberry',   season: 'Autumn', price: 10 },
  root:        { name: 'Root Seed',        crop: 'root',        season: 'Winter', price: 8 },
  frostherb:   { name: 'Frost Herb Seed',  crop: 'frostherb',   season: 'Winter', price: 10 },
  snowdrop:    { name: 'Snowdrop Seed',    crop: 'snowdrop',    season: 'Winter', price: 12 },
  iceberry:    { name: 'Ice Berry Seed',   crop: 'iceberry',    season: 'Winter', price: 15 },
};

// Buildings (preserving existing capacities & housing for tests)
export const BUILDINGS = {
  coop:   { name: 'Coop',   cost: { wood: 40, stone: 15 }, goldCost: 200, capacity: 4, houses: ['chicken', 'duck', 'rabbit', 'dinosaur'] },
  barn:   { name: 'Barn',   cost: { wood: 80, stone: 40 }, goldCost: 400, capacity: 6, houses: ['cow', 'ostrich', 'goat', 'sheep', 'pig'] },
  shed:   { name: 'Shed',   cost: { wood: 30, stone: 10 }, goldCost: 150, capacity: 0, houses: null },
  stable: { name: 'Stable', cost: { wood: 60, stone: 25 }, goldCost: 350, capacity: 2, houses: ['horse'] },
};

// Chicken color variants
export const CHICKEN_VARIANTS = ['white', 'brown', 'blue', 'void', 'golden'];

// All 13 Animal Varieties from SPEC.md
export const ANIMALS = {
  chicken:  { name: 'Chicken',  product: 'egg',         productAmount: 1, hayConsumption: 1, buyPrice: 80,  housing: 'coop' },
  cow:      { name: 'Cow',      product: 'milk',        productAmount: 1, hayConsumption: 2, buyPrice: 150, housing: 'barn' },
  goat:     { name: 'Goat',     product: 'goatMilk',    productAmount: 1, hayConsumption: 2, buyPrice: 200, housing: 'barn' },
  sheep:    { name: 'Sheep',    product: 'wool',        productAmount: 1, hayConsumption: 2, buyPrice: 220, housing: 'barn' },
  pig:      { name: 'Pig',      product: 'truffle',     productAmount: 1, hayConsumption: 2, buyPrice: 320, housing: 'barn' },
  rabbit:   { name: 'Rabbit',   product: 'rabbitWool',  productAmount: 1, hayConsumption: 1, buyPrice: 160, housing: 'coop' },
  duck:     { name: 'Duck',     product: 'duckEgg',     productAmount: 1, hayConsumption: 1, buyPrice: 120, housing: 'coop' },
  dinosaur: { name: 'Dinosaur', product: 'dinoEgg',     productAmount: 1, hayConsumption: 2, buyPrice: 500, housing: 'coop' },
  ostrich:  { name: 'Ostrich',  product: 'egg',         productAmount: 1, hayConsumption: 1, buyPrice: 350, housing: 'barn' },
  turtle:   { name: 'Turtle',   product: 'mossShell',   productAmount: 1, hayConsumption: 1, buyPrice: 140, housing: 'pet' },
  cat:      { name: 'Cat',      product: 'purrGift',    productAmount: 1, hayConsumption: 1, buyPrice: 100, housing: 'pet' },
  dog:      { name: 'Dog',      product: 'boneFind',    productAmount: 1, hayConsumption: 1, buyPrice: 100, housing: 'pet' },
  horse:    { name: 'Horse',    product: null,          productAmount: 0, hayConsumption: 1, buyPrice: 400, housing: 'stable' },
};

// Forageable wild items
export const FORAGE_ITEMS = {
  wildRoot:    { name: 'Wild Root',    type: 'forage', seasons: ['Spring', 'Autumn'], sellPrice: 8,  energyRestore: 12 },
  springOnion: { name: 'Spring Onion', type: 'forage', seasons: ['Spring'],           sellPrice: 10, energyRestore: 15 },
  berry:       { name: 'Wild Berry',   type: 'forage', seasons: ['Summer', 'Autumn'], sellPrice: 12, energyRestore: 18 },
  mushroom:    { name: 'Mushroom',     type: 'forage', seasons: ['Autumn', 'Winter'], sellPrice: 16, energyRestore: 20 },
  seashell:    { name: 'Seashell',     type: 'forage', seasons: ['Spring', 'Summer', 'Autumn', 'Winter'], sellPrice: 14, energyRestore: 0 },
  purpleHerb:  { name: 'Purple Herb',  type: 'forage', seasons: ['Summer', 'Autumn'], sellPrice: 22, energyRestore: 30 },
  snowBerry:   { name: 'Snow Berry',   type: 'forage', seasons: ['Winter'],           sellPrice: 18, energyRestore: 22 },
};

// Fish catalog
export const FISH_TYPES = {
  fish:        { name: 'River Perch',    zone: 'river', rarity: 1, sellPrice: 15, energyRestore: 15 },
  sunCarp:     { name: 'Sun Carp',       zone: 'river', rarity: 2, sellPrice: 24, energyRestore: 20 },
  seaBream:    { name: 'Silverfin Bream',zone: 'coast', rarity: 2, sellPrice: 30, energyRestore: 22 },
  tideEel:     { name: 'Tide Eel',       zone: 'coast', rarity: 3, sellPrice: 45, energyRestore: 30 },
  glacierTrout:{ name: 'Glacier Trout',  zone: 'river', rarity: 3, sellPrice: 40, energyRestore: 28 },
};

// General item sell prices & energy values (products, bars, cooked goods)
export const ITEM_PRICES = {
  turnip: 10, strawberry: 24, potato: 16, cauliflower: 35,
  bean: 15, melon: 40, tomato: 18, blueberry: 28,
  squash: 12, pumpkin: 42, corn: 22, cranberry: 20,
  root: 18, frostherb: 20, snowdrop: 26, iceberry: 32,
  egg: 15, milk: 25, goatMilk: 35, wool: 40, truffle: 65,
  rabbitWool: 35, duckEgg: 25, dinoEgg: 90,
  copperOre: 5, ironOre: 10, goldOre: 20,
  copperBar: 30, ironBar: 60, goldBar: 120,
  fish: 15, sunCarp: 24, seaBream: 30, tideEel: 45, glacierTrout: 40,
  wheat: 14, cloth: 35, hay: 5,
  roastedRoot: 25, berryPie: 45, fishStew: 50, herbSalad: 38, honeyCake: 55, agedCheese: 50,
};

// Cooking & Crafting Recipes
export const RECIPES = {
  roastedRoot: { name: 'Roasted Root',  type: 'cooking',  ingredients: { root: 1 },                energyRestore: 45, sellPrice: 25 },
  herbSalad:   { name: 'Herb Salad',    type: 'cooking',  ingredients: { springOnion: 1, wildRoot: 1 }, energyRestore: 50, sellPrice: 38 },
  berryPie:    { name: 'Berry Pie',     type: 'cooking',  ingredients: { berry: 2, egg: 1 },       energyRestore: 75, sellPrice: 45 },
  fishStew:    { name: 'Fish Stew',     type: 'cooking',  ingredients: { fish: 1, tomato: 1 },       energyRestore: 80, sellPrice: 50 },
  agedCheese:  { name: 'Aged Cheese',   type: 'cooking',  ingredients: { milk: 1 },                energyRestore: 60, sellPrice: 50 },
  cloth:       { name: 'Woven Cloth',   type: 'crafting', ingredients: { wool: 1 },                energyRestore: 0,  sellPrice: 35 },
  furnace:     { name: 'Stone Furnace', type: 'crafting', ingredients: { copperOre: 5 },           energyRestore: 0,  sellPrice: 0 },
  scarecrow:   { name: 'Scarecrow',     type: 'crafting', ingredients: { turnip: 1 },              energyRestore: 0,  sellPrice: 15 },
  chest:       { name: 'Storage Chest', type: 'crafting', ingredients: { copperOre: 2 },           energyRestore: 0,  sellPrice: 20 },
  sprinkler:   { name: 'Sprinkler',     type: 'crafting', ingredients: { copperBar: 1, ironBar: 1 }, energyRestore: 0, sellPrice: 60 },
};

// Weekdays & Tool Upgrades
export const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const TOOL_NAMES = {
  hoe: 'Hoe',
  water: 'Watering Can',
  axe: 'Axe',
  pickaxe: 'Pickaxe',
  scythe: 'Scythe',
  sword: 'Sword',
  fishingRod: 'Fishing Rod',
};

export const TOOL_UPGRADE_TIERS = [
  { level: 1, name: 'Copper', bar: 'copperBar', barsRequired: 3, goldCost: 150 },
  { level: 2, name: 'Iron',   bar: 'ironBar',   barsRequired: 3, goldCost: 350 },
  { level: 3, name: 'Gold',   bar: 'goldBar',   barsRequired: 3, goldCost: 700 },
];

// General Store Items (Tessa's Shop)
export const GENERAL_STORE_ITEMS = {
  hay:           { name: 'Animal Hay',     price: 10,  description: 'Feed for coop and barn animals.' },
  roastedRoot:   { name: 'Roasted Root',   price: 35,  description: 'Warm snack that restores 45 Energy.', energyRestore: 45 },
  berryPie:      { name: 'Berry Pie',      price: 65,  description: 'Sweet pastry that restores 75 Energy.', energyRestore: 75 },
  flowerBouquet: { name: 'Flower Bouquet', price: 100, description: 'A romantic gift for a special villager.' },
};

// Museum Artifacts (Julian's Archive)
export const MUSEUM_ARTIFACTS = {
  copperOre:  { name: 'Copper Specimen',  description: 'Raw copper ore from upper Ironpeak Caverns.' },
  ironOre:    { name: 'Iron Specimen',    description: 'Dense iron ore from mid-level caverns.' },
  goldOre:    { name: 'Gold Specimen',    description: 'Gleaming gold ore from deep caverns.' },
  seashell:   { name: 'Silverfin Shell',  description: 'A pearlescent shell from Silverfin Coast.' },
  dinoEgg:    { name: 'Fossilized Egg',   description: 'An ancient speckled egg of unknown age.' },
  ancientRelic:{ name: 'Valley Relic',    description: 'A carved stone emblem from Sunhollow history.' },
};

// 12 Original Named Villagers (preserving existing keys elder, baker, smith, farmer, tailor, librarian)
export const VILLAGERS = {
  elder:     { name: 'Mayor Cedric', role: 'Town Mayor',          gender: 'male',   likedGift: 'copperBar', lovedGifts: ['goldBar', 'agedCheese'], marriageable: false, birthday: 'Spring 7',  color: 0x8B4513 },
  baker:     { name: 'Clara',        role: 'Willowbrook Baker',   gender: 'female', likedGift: 'wheat',     lovedGifts: ['berryPie', 'strawberry'], marriageable: true,  birthday: 'Spring 19', color: 0xF4A460 },
  smith:     { name: 'Garrick',      role: 'Ironpeak Blacksmith', gender: 'male',   likedGift: 'ironBar',   lovedGifts: ['goldBar', 'copperBar'],  marriageable: true,  birthday: 'Summer 5',  color: 0x696969 },
  farmer:    { name: 'Maeve',        role: 'Oakridge Agronomist', gender: 'female', likedGift: 'turnip',    lovedGifts: ['cauliflower', 'pumpkin'], marriageable: true, birthday: 'Autumn 10', color: 0x2E8B57 },
  tailor:    { name: 'Nora',         role: 'Silk & Spindle Tailor',gender: 'female', likedGift: 'cloth',     lovedGifts: ['wool', 'snowdrop'],      marriageable: true,  birthday: 'Winter 12', color: 0xBA55D3 },
  librarian: { name: 'Julian',       role: 'Willowbrook Archivist',gender: 'male',  likedGift: 'goldBar',   lovedGifts: ['frostherb', 'herbSalad'],marriageable: true,  birthday: 'Autumn 22', color: 0x4682B4 },
  carpenter: { name: 'Rowan',        role: 'Timbercraft Carpenter',gender: 'female',likedGift: 'squash',    lovedGifts: ['mushroom', 'agedCheese'],marriageable: false, birthday: 'Summer 14', color: 0xCD853F },
  angler:    { name: 'Bram',         role: 'Silverfin Angler',    gender: 'male',   likedGift: 'fish',      lovedGifts: ['seaBream', 'fishStew'],  marriageable: true,  birthday: 'Summer 24', color: 0x1E90FF },
  merchant:  { name: 'Tessa',        role: 'General Store Owner', gender: 'female', likedGift: 'melon',     lovedGifts: ['blueberry', 'truffle'],  marriageable: true,  birthday: 'Spring 25', color: 0xFF69B4 },
  mystic:    { name: 'Orin',         role: 'Deepwoods Herbalist', gender: 'male',   likedGift: 'mushroom',  lovedGifts: ['purpleHerb', 'iceberry'],marriageable: false, birthday: 'Winter 3',  color: 0x6A5ACD },
  rancher:   { name: 'Dahlia',       role: 'Meadowgate Rancher',  gender: 'female', likedGift: 'milk',      lovedGifts: ['egg', 'dinoEgg'],        marriageable: true,  birthday: 'Autumn 4',  color: 0xDAA520 },
  innkeeper: { name: 'Felix',        role: 'Hearthside Innkeeper',gender: 'male',   likedGift: 'potato',    lovedGifts: ['berryPie', 'roastedRoot'],marriageable: true, birthday: 'Winter 18', color: 0xB22222 },
};

// Default grid positions for NPCs
export const VILLAGER_POSITIONS = {
  elder:     { r: 10, c: 10 },
  baker:     { r: 4,  c: 12 },
  smith:     { r: 6,  c: 14 },
  farmer:    { r: 8,  c: 16 },
  tailor:    { r: 12, c: 14 },
  librarian: { r: 2,  c: 12 },
  carpenter: { r: 3,  c: 6 },
  angler:    { r: 16, c: 16 },
  merchant:  { r: 5,  c: 10 },
  mystic:    { r: 14, c: 3 },
  rancher:   { r: 11, c: 8 },
  innkeeper: { r: 7,  c: 11 },
};

// Base & multi-tier dialogue (original writing for Valley Life)
export const VILLAGER_DIALOGUE = {
  elder: [
    'Welcome to Willowbrook, farmer. Your grandfather Eldon spoke of you often.',
    'The seasons turn in Sunhollow Valley, yet good neighbors remain steady.',
    'Willowbrook Hall has stood quiet too long—perhaps you can help restore it.',
  ],
  baker: [
    'Fresh loaves come out of the brick oven every morning at dawn.',
    'Nothing beats the smell of warm crust and wild berries.',
    'If you grow wheat or strawberries, bring some by the bakery!',
  ],
  smith: [
    'A balanced pickaxe makes all the difference in Ironpeak Caverns.',
    'Bring me copper, iron, or gold ore and we will forge them into fine bars.',
    'Careful past floor five—the cavern bats and golems hit harder down there.',
  ],
  farmer: [
    'Oakridge soil is rich once you clear away the weeds and stones.',
    'Water your crops daily unless rain clouds roll over Sunhollow Valley.',
    'A well-fed animal greets the morning with better produce.',
  ],
  tailor: [
    'I weave sturdy jackets and bright scarves from valley wool and cloth.',
    'Every season deserves its own colors—even snowy Winter.',
  ],
  librarian: [
    'The chronicle of Sunhollow Valley fills three shelves in the Archive.',
    'Quiet please—I am cataloging relics from the old Ironpeak shaft.',
  ],
  carpenter: [
    'Need a coop, barn, or shed? Timbercraft Workshop builds to last.',
    'Your grandfather built that farmhouse porch with his own hands.',
  ],
  angler: [
    'Clearwater River runs gentle, while Silverfin Coast hides the big catches.',
    'Patience at the pier always pays off with a full creel.',
  ],
  merchant: [
    'Seeds for every season are stocked fresh at Willowbrook General Store!',
    'Apex Mart across the ridge sells cheap tins, but nothing beats local produce.',
  ],
  mystic: [
    'The Mosskin still linger around Willowbrook Hall, waiting for kindness.',
    'Listen to the wind through the pines—the valley remembers those who care for it.',
  ],
  rancher: [
    'Chickens, cows, ostriches, even rare creatures thrive with daily hay.',
    'Stop by Meadowgate Ranch whenever your coop or barn has room!',
  ],
  innkeeper: [
    'Warm stew and a crackling hearth await at the Hearthside every evening.',
    'Long day in the fields? A hot meal restores your strength right away.',
  ],
};

// Heart-tier, weather, and marriage dialogue tiers
export const VILLAGER_DIALOGUE_TIERS = {
  low: [
    'Good morning, neighbor. Settling into Oakridge Farm?',
    'Let me know if you need pointers around Willowbrook.',
  ],
  mid: [
    'It is always a bright spot in my day seeing you in town!',
    'Your farm is starting to look lively again.',
  ],
  high: [
    'You have brought real warmth back to Sunhollow Valley.',
    'I look forward to our chats more than anything else.',
  ],
  rainy: [
    'Rainy days are great—your crops get watered without lifting a can!',
    'Listen to that steady rain on the rooftops.',
  ],
  marriage: [
    'Good morning, love! I watered a crop outside before you woke up.',
    'Whatever today brings on Oakridge Farm, we face it together.',
    'Dinner smells wonderful—make sure to rest before it gets too late.',
  ],
};

// Community Center (Willowbrook Hall) Bundles
export const BUNDLES = {
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
    area: 'Pantry',
    required: { egg: 5, milk: 5 },
    completed: false,
    reward: 'coopUnlocked',
  },
  mineOres: {
    name: 'Mine Ores Bundle',
    area: 'Boiler Room',
    required: { copperBar: 5, ironBar: 5 },
    completed: false,
    reward: 'deepMineUnlocked',
  },
};

// Farm Types
export const FARM_TYPES = {
  standard: { name: 'Standard Farm', startingForage: 2, startingWood: 60, startingStone: 40, description: 'Open fertile fields ideal for large-scale seasonal crops.' },
  forest:   { name: 'Forest Farm',   startingForage: 5, startingWood: 40, startingStone: 20, description: 'Shaded glades rich with wild forage and mushrooms.' },
  river:    { name: 'River Farm',    startingForage: 3, startingWood: 30, startingStone: 30, description: 'Streams wind through the farm with prime fishing spots.' },
  hilltop:  { name: 'Hilltop Farm',  startingForage: 2, startingWood: 45, startingStone: 65, description: 'Rocky terraces offering extra stone and mineral outcrops.' },
};

// Storyline & Bulletin Quests
export const QUESTS = {
  clearLand: {
    id: 'clearLand',
    title: 'A New Beginning',
    giver: 'carpenter',
    type: 'story',
    description: 'Clear overgrown land on Oakridge Farm and harvest your first Turnip.',
    required: { turnip: 1 },
    rewardGold: 100,
    completed: false,
  },
  meetTown: {
    id: 'meetTown',
    title: 'Meet Willowbrook',
    giver: 'elder',
    type: 'story',
    description: 'Introduce yourself to Mayor Cedric and bring him a Copper Bar.',
    required: { copperBar: 1 },
    rewardGold: 150,
    completed: false,
  },
  intoCaverns: {
    id: 'intoCaverns',
    title: 'Into Ironpeak Caverns',
    giver: 'smith',
    type: 'story',
    description: 'Explore Ironpeak Caverns and bring Garrick 3 Copper Ore.',
    required: { copperOre: 3 },
    rewardGold: 200,
    completed: false,
  },
  bakeryOrder: {
    id: 'bakeryOrder',
    title: 'Fresh Berry Delivery',
    giver: 'baker',
    type: 'bulletin',
    description: 'Clara needs 2 Wild Berries for the morning pastries.',
    required: { berry: 2 },
    rewardGold: 80,
    completed: false,
  },
  anglerCatch: {
    id: 'anglerCatch',
    title: 'Pier Supper',
    giver: 'angler',
    type: 'bulletin',
    description: 'Catch 2 fish from Clearwater River or Silverfin Coast for Bram.',
    required: { fish: 2 },
    rewardGold: 90,
    completed: false,
  },
};

// Storyline Events & Cutscenes
export const STORY_EVENTS = {
  arrivalLetter: {
    id: 'arrivalLetter',
    title: "Grandpa Eldon's Letter",
    triggerDay: 1,
    lines: [
      'My dearest grandchild, if you are reading this, the bustle of the city has grown too heavy.',
      'I leave Oakridge Farm in Sunhollow Valley to you. Clear the fields, meet the good people of Willowbrook, and build a life you love.',
      '— With all my heart, Grandpa Eldon',
    ],
  },
  rowanWelcome: {
    id: 'rowanWelcome',
    title: 'Welcome to Oakridge Farm',
    triggerDay: 1,
    lines: [
      "Rowan: Hello there! You must be the new owner of Oakridge Farm. I'm Rowan, the local carpenter.",
      'Mayor Cedric asked me to show you around. Your farmhouse, shipping bin, and tools are all ready.',
    ],
  },
  hallAwakening: {
    id: 'hallAwakening',
    title: 'The Mosskin of Willowbrook Hall',
    triggerDay: 5,
    lines: [
      'Mayor Cedric: This old hall used to be the pride of Willowbrook before Apex Mart opened.',
      'Look closely—glowing Mosskin sprites are tending a stone tablet! Complete their bundles to restore the valley.',
    ],
  },
  grandpaEvaluation: {
    id: 'grandpaEvaluation',
    title: "Grandpa Eldon's Evaluation",
    triggerDay: 113, // Year 2 Day 1
    lines: [
      'A warm golden light fills the farmhouse porch...',
      'Grandpa Eldon: Look at how Oakridge Farm thrives once more! You have honored Sunhollow Valley.',
    ],
  },
};

// 4 Annual Seasonal Festivals
export const FESTIVALS = [
  { season: 'Spring', day: 13, name: 'Blossom Day',    location: 'Willowbrook Square', description: 'Celebrate Spring with flower crowns, music, and dancing.' },
  { season: 'Summer', day: 11, name: 'Tide Feast',     location: 'Silverfin Coast',    description: 'Share a seaside potluck simmered over driftwood embers.' },
  { season: 'Autumn', day: 16, name: 'Harvest Fair',   location: 'Willowbrook Square', description: 'Display your finest crops, cheeses, and artisan goods.' },
  { season: 'Winter', day: 25, name: 'Starlight Night',location: 'Willowbrook Square', description: 'Exchange secret gifts beneath glowing winter lanterns.' },
];

// Achievements Catalog
export const ACHIEVEMENTS = {
  firstHarvest:   { id: 'firstHarvest',   name: 'Sprouting Wealth',   description: 'Harvest your first crop on Oakridge Farm.' },
  firstShip:      { id: 'firstShip',      name: 'Local Shipper',      description: 'Ship produce through the Shipping Bin for Gold.' },
  firstAnimal:    { id: 'firstAnimal',    name: 'Barnyard Friend',    description: 'Welcome your first animal into a Coop or Barn.' },
  deepDelver:     { id: 'deepDelver',     name: 'Ironpeak Delver',    description: 'Reach floor 5 or deeper in Ironpeak Caverns.' },
  silverfinAngler:{ id: 'silverfinAngler',name: 'Silverfin Angler',   description: 'Catch a fish from the waters of Sunhollow Valley.' },
  masterChef:     { id: 'masterChef',     name: 'Hearthside Cook',    description: 'Cook your first meal from a Valley Life recipe.' },
  belovedNeighbor:{ id: 'belovedNeighbor',name: 'Beloved Neighbor',   description: 'Reach 10 relationship points with a villager.' },
  hallRestorer:   { id: 'hallRestorer',   name: 'Hall Restorer',      description: 'Complete a bundle at Willowbrook Hall.' },
};

# Valley Life — Specification

Valley Life is an open-ended farm life simulation game inspired by Stardew Valley, built with three.js so it runs in a web browser.

This document is the source of truth. It lists every feature, exactly one test per feature, and the 3-part build plan.

---

## 1. Features and tests

Each feature below has exactly one test that verifies that feature. Tests are written as plain-language assertions that can be automated with a browser test runner.

### 1.1 Game loop and time

| # | Feature | Test |
|---|---------|------|
| 1 | **Day/night cycle** — Time advances through day-length segments; each new morning resets energy to full. | Starting a new day sets the player's energy to its maximum value. |
| 2 | **Season system** — Four seasons, each 28 days long; crops must be harvested before the season changes. | Advancing 28 days cycles from Spring to Summer, and a crop planted in Spring does not auto-harvest when Summer begins. |
| 3 | **Energy depletion** — Performing tasks (tilling, watering, mining, chopping) consumes energy. | Tilling one tile of soil reduces the player's energy by a fixed, non-zero amount. |
| 4 | **Energy replenishment** — Eating food restores energy. | Consuming a food item increases the player's energy by the food's restore value, capped at maximum. |
| 5 | **Save/load** — Game state can be saved and reloaded. | Saving the game then reloading restores the player's position, energy, day, and inventory exactly. |

### 1.2 Farming

| # | Feature | Test |
|---|---------|------|
| 6 | **Land clearing** — Cut trees, break rocks, and cut weeds to clear space. | Using an axe on a tree tile removes the tree and makes the tile tillable. |
| 7 | **Tilling** — Till soil to prepare it for planting. | Using a hoe on a cleared tile converts it from untilled to tilled state. |
| 8 | **Planting** — Plant seasonal seeds on tilled soil. | Planting a valid seasonal seed on a tilled tile marks the tile as planted with that crop. |
| 9 | **Watering** — Crops require daily watering to grow. | Watering a planted crop on day N advances its growth; an unwatered crop does not grow that day. |
| 10 | **Crop growth** — Crops grow over several days and are harvestable when mature. | A mature crop tile yields a harvestable item when interacted with. |
| 11 | **Harvesting** — Harvest mature crops to obtain produce. | Harvesting a mature crop adds the corresponding produce to the player's inventory. |
| 12 | **Seasonal crops** — Each season has its own valid crop seeds; crops wither or stop growing at season change. | A Summer crop seed cannot be planted in Spring, and a Spring crop does not advance growth when Summer starts. |
| 13 | **Scythe** — Use a scythe to clear weeds and harvest hay. | Using a scythe on a weed tile removes the weed and may add hay to inventory. |

### 1.3 Animals

| # | Feature | Test |
|---|---------|------|
| 14 | **Build coop** — Construct a coop to house chickens. | Building a coop adds a structure that can house a defined number of chickens. |
| 15 | **Build barn** — Construct a barn to house cows and other livestock. | Building a barn adds a structure that can house a defined number of cows. |
| 16 | **Animal products** — Animals produce goods such as eggs and milk daily when fed. | A fed chicken in a coop produces one egg each morning. |
| 17 | **Animal feeding** — Animals must be fed daily to produce goods. | An unfed animal produces no goods that day. |

### 1.4 Mining

| # | Feature | Test |
|---|---------|------|
| 18 | **Cave exploration** — Enter and explore the mine cave system. | Entering the mine places the player on the first mine floor. |
| 19 | **Ore mining** — Break rocks with a pickaxe to collect ores. | Using a pickaxe on a mine rock node yields ore and may clear the node. |
| 20 | **Combat in mines** — Fight monsters with a sword while mining. | Attacking a monster with a sword reduces its health; defeating it removes it from the floor. |
| 21 | **Floor progression** — Deeper floors contain more valuable ores and stronger monsters. | Reaching floor 5 of the mine exposes ore nodes of a higher tier than floor 1. |
| 22 | **Smelting** — Smelt ores into bars using a furnace. | Smelting copper ore in a furnace produces a copper bar. |

### 1.5 Foraging and fishing

| # | Feature | Test |
|---|---------|------|
| 23 | **Foraging** — Collect wild items around the valley. | Interacting with a forage item on the ground adds it to the player's inventory. |
| 24 | **Fishing** — Catch fish in rivers, lakes, and the ocean. | Completing the fishing minigame at a valid fishing spot adds a fish to the player's inventory. |

### 1.6 Skills

| # | Feature | Test |
|---|---------|------|
| 25 | **Skill leveling** — Gain experience in farming, foraging, fishing, mining, and combat by performing related actions. | Harvesting a crop increases farming experience; reaching the threshold levels up the farming skill. |
| 26 | **Skill caps** — Each skill has a maximum level. | The farming skill cannot exceed its defined maximum level. |

### 1.7 Social and relationships

| # | Feature | Test |
|---|---------|------|
| 27 | **NPC interaction** — Talk to townspeople. | Interacting with a villager displays their dialogue. |
| 28 | **Gift giving** — Give gifts to villagers to build relationship points. | Giving a liked gift to a villager increases their relationship points by a positive amount. |
| 29 | **Marriage** — Marry an eligible villager regardless of gender. | Marrying an eligible villager sets the player's spouse to that villager. |
| 30 | **Spouse help** — A spouse helps with daily farm chores such as cooking, feeding animals, or watering crops. | After marriage, the spouse waters at least one crop on a farm tile during the night. |
| 31 | **Children** — A married couple may choose to have children. | Choosing to have a child adds a child to the player's household. |

### 1.8 Community Center

| # | Feature | Test |
|---|---------|------|
| 32 | **Bundles** — Complete bundles by collecting a set amount of goods. | Donating all required items for a bundle marks that bundle as complete. |
| 33 | **Bundle rewards** — Completing bundles unlocks new areas and activities. | Completing the first bundle unlocks a new area of the valley. |

### 1.9 Farm types

| # | Feature | Test |
|---|---------|------|
| 34 | **Farm type selection** — Choose from several farm types at game start, each with a unique theme and benefits/drawbacks. | Selecting the "Forest" farm type starts the player with more foragable items on the farm than the "Standard" farm type. |

### 1.10 Multiplayer

| # | Feature | Test |
|---|---------|------|
| 35 | **Online multiplayer** — Play online with other players. | Connecting a second client to a host session synchronizes the second player's position to the host. |

### 1.11 Rendering and platform

| # | Feature | Test |
|---|---------|------|
| 36 | **Top-down 3D rendering** — The game world is rendered in top-down perspective using three.js. | The game initializes a three.js Scene, PerspectiveCamera (or OrthographicCamera), and WebGLRenderer without throwing. |
| 37 | **Browser execution** — The game runs in a web browser with no native dependencies. | Opening `index.html` in a browser loads and starts the game without requiring a build step or native install. |

---

## 2. Build plan (3 parts)

### Part 1 — Foundation and core loop

Set up the three.js project skeleton and implement the core game loop: time system (days, seasons, energy), player movement, and the farm clearing/tilling/planting/watering/harvesting cycle. Deliverable: a playable browser prototype where the player can clear a tile, till it, plant a seasonal crop, water it, watch it grow over days, and harvest it.

### Part 2 — World systems

Add animals (coops/barns and animal products), the mine cave system (ores, combat, floors, smelting), foraging, fishing, skills, energy/food, NPC relationships, marriage, and children. Deliverable: a feature-complete single-player valley with farming, animals, mining, foraging, fishing, skills, and social systems.

### Part 3 — Content and multiplayer

Add the Community Center bundle system, multiple farm types, save/load, and online multiplayer. Polish UI, balance, and ship the playable game. Deliverable: the complete Valley Life game with all features from SPEC.md, save/load support, and multiplayer.

---

## 3. Constraints

- All code must be original (written by hand, never copied).
- The game runs in the browser using three.js.
- Each feature has exactly one test.
- All documents and code are committed to Git.

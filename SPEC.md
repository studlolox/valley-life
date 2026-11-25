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
| 18 | **Animal varieties** — The valley supports multiple animal types (chickens, cows, goats, sheep, pigs, rabbits, ducks, dinosaurs, ostriches, turtles, cats, dogs, horses). | Placing an ostrich in a barn registers the ostrich as a distinct animal type from a chicken. |


### 1.4 Mining

| # | Feature | Test |
|---|---------|------|
| 19 | **Cave exploration** — Enter and explore the mine cave system. | Entering the mine places the player on the first mine floor. |
| 20 | **Ore mining** — Break rocks with a pickaxe to collect ores. | Using a pickaxe on a mine rock node yields ore and may clear the node. |
| 21 | **Combat in mines** — Fight monsters with a sword while mining. | Attacking a monster with a sword reduces its health; defeating it removes it from the floor. |
| 22 | **Floor progression** — Deeper floors contain more valuable ores and stronger monsters. | Reaching floor 5 of the mine exposes ore nodes of a higher tier than floor 1. |
| 23 | **Smelting** — Smelt ores into bars using a furnace. | Smelting copper ore in a furnace produces a copper bar. |

### 1.5 Foraging and fishing

| # | Feature | Test |
|---|---------|------|
| 24 | **Foraging** — Collect wild items around the valley. | Interacting with a forage item on the ground adds it to the player's inventory. |
| 25 | **Fishing** — Catch fish in rivers, lakes, and the ocean. | Completing the fishing minigame at a valid fishing spot adds a fish to the player's inventory. |

### 1.6 Skills

| # | Feature | Test |
|---|---------|------|
| 26 | **Skill leveling** — Gain experience in farming, foraging, fishing, mining, and combat by performing related actions. | Harvesting a crop increases farming experience; reaching the threshold levels up the farming skill. |
| 27 | **Skill caps** — Each skill has a maximum level. | The farming skill cannot exceed its defined maximum level. |

### 1.7 Social and relationships

| # | Feature | Test |
|---|---------|------|
| 28 | **NPC interaction** — Talk to townspeople. | Interacting with a villager displays their dialogue. |
| 29 | **Gift giving** — Give gifts to villagers to build relationship points. | Giving a liked gift to a villager increases their relationship points by a positive amount. |
| 30 | **Marriage** — Marry an eligible villager of a different gender; relationship points must reach the threshold. | Marrying an eligible villager of a different gender sets the player's spouse to that villager; marrying a villager of the same gender is rejected. |
| 31 | **Spouse help** — A spouse helps with daily farm chores such as cooking, feeding animals, or watering crops. | After marriage, the spouse waters at least one crop on a farm tile during the night. |
| 32 | **Children** — A married couple may choose to have children. | Choosing to have a child adds a child to the player's household. |

### 1.8 Community Center

| # | Feature | Test |
|---|---------|------|
| 33 | **Bundles** — Complete bundles by collecting a set amount of goods. | Donating all required items for a bundle marks that bundle as complete. |
| 34 | **Bundle rewards** — Completing bundles unlocks new areas and activities. | Completing the first bundle unlocks a new area of the valley. |

### 1.9 Farm types

| # | Feature | Test |
|---|---------|------|
| 35 | **Farm type selection** — Choose from several farm types at game start, each with a unique theme and benefits/drawbacks. | Selecting the "Forest" farm type starts the player with more foragable items on the farm than the "Standard" farm type. |

### 1.10 Multiplayer

| # | Feature | Test |
|---|---------|------|
| 36 | **Online multiplayer** — Play online with other players. | Connecting a second client to a host session synchronizes the second player's position to the host. |

### 1.11 Rendering and platform

| # | Feature | Test |
|---|---------|------|
| 37 | **Top-down 3D rendering** — The game world is rendered in top-down perspective using three.js. | The game initializes a three.js Scene, PerspectiveCamera (or OrthographicCamera), and WebGLRenderer without throwing. |
| 38 | **Browser execution** — The game runs in a web browser with no native dependencies. | Opening `index.html` in a browser loads and starts the game without requiring a build step or native install. |

### 1.12 Economy, quests, events, cooking, and achievements

| # | Feature | Test |
|---|---------|------|
| 39 | **Shop and economy** — Buy seeds with Gold and ship produce for Gold. | Buying a seed deducts Gold and adds the seed to inventory; shipping produce adds its sell price to Gold. |
| 40 | **Quests** — Accept and complete story or bulletin quests for rewards. | Completing an active quest with required items marks it complete and awards Gold. |
| 41 | **Storyline events** — Trigger narrative events and record seen events. | Triggering an unseen storyline event returns its script lines and marks it as seen. |
| 42 | **Achievements** — Unlock player milestones based on progress. | Reaching an achievement condition unlocks that achievement once. |
| 43 | **Cooking and crafting** — Cook food or craft items from inventory ingredients. | Cooking a recipe consumes its required ingredients and adds the cooked dish to inventory. |
| 44 | **Tool upgrades** — Upgrade tools at Garrick's Smithy using Gold and smelted metal bars. | Upgrading a tool deducts the required Gold and bars and increments the tool's upgrade level. |
| 45 | **Shipping bin ledger** — Queue goods in the Shipping Bin to be sold overnight for Gold with a morning summary. | Queuing an item in the Shipping Bin and sleeping adds its sell price to Gold and records it in the day summary. |
| 46 | **Procedural 3D assets** — Render articulated characters, 16×4 crop stages, seasonal trees, buildings, 13 animals, and mine monsters using procedural Three.js meshes and textures. | Building meshes for characters, all 16 crops × 4 stages, all 13 animals, buildings, seasonal trees, and monsters returns valid THREE.Object3D instances without throwing. |

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

---

## 4. Reference — Stardew Valley APK study (REA)

The Stardew Valley APK (`stardew-valley-mod-1.6.15.3-an1.com.apk`, SHA-256 `060d5e5e8fba383cb205fa6ae60a35c9b2335d579c539f00f004c9495f7aea19`, ~388 MB) was studied with REA's static artifact inspection (no execution, no JADX decompilation available).

### Observed facts (from shipped artifact, static inspection only)

- **Format**: APK signed with v1/v2/v3 schemes; min SDK 24; signer is a self-signed test certificate (C=RU, O=A1, CN=A1), not the original ConcernedApe/Chucklefish signing identity.
- **Content layout**: `assets/Content/` contains XNA `.xnb` content files organized into:
  - `Animals/` — chickens (white, brown, blue, void, golden), cows (white, brown), goats, sheep, pigs, rabbits, ducks, dinosaurs, ostriches, turtles, cats, dogs, horses
  - `Buildings/` — barn (Big/Deluxe), coop (Big/Deluxe), shed, slime hutch, fish pond, greenhouse, junimo hut, mill, shipping bin, silo, stable, obelisks, cabins
  - `Characters/Dialogue/` — per-villager dialogue files (Abigail, Alex, Caroline, Clint, Demetrius, Dwarf, Emily, Evelyn, George, Gil, Gus, Haley, Harvey, Jodi, Kent, Krobus, Leah, Leo, Lewis, Linus, Marnie, Pam, Penny, Pierre, Robin, Sam, Sandy, Sebastian, Shane, Willy, Wizard) plus `MarriageDialogue*` for romanceable candidates
- **Inventory**: 3,694 archive entries / 3,658 nodes; all hashes verified.

### What this means for Valley Life

These confirmed content categories map directly to the features in SPEC.md:
- Animals → features 14–18 (coop/barn, products, feeding, varieties)
- Buildings → farm structures (barn, coop, shed, slime hutch, greenhouse, etc.)
- Characters/Dialogue → features 28–32 (NPC interaction, gift giving, marriage, spouse help, children)
- Multiple marriage dialogue files → supports the "marry regardless of gender" feature (30)

### Limitations

- Static structural inspection only; no DEX decompilation (JADX not configured), no runtime execution, no adb/device involved.
- Does not establish game logic, balance values, or runtime behavior; those remain design decisions for Valley Life, informed by but not copied from Stardew Valley.


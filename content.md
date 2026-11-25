# Valley Life — Game Content Reference

This document extracts all game content (storyline, dialogue, NPCs, characters, items, crops, animals, buildings, mine, bundles, farm types, skills) from `js/game.js`, `SPEC.md`, and `features.md`. It is intended as a reference during game creation and expansion.

Per AGENTS.md rule #4 (Rename): all character, place, and creature names are original Valley Life names — none are taken from Stardew Valley.

---

## 1. Storyline & Setting

**Game identity:** Valley Life — an open-ended farm life simulation (top-down, three.js, browser-based).

**Premise:** The player inherits a dilapidated farm outside the valley town and restores it by clearing land, tilling soil, planting seasonal crops, watering them, raising animals, mining, foraging, fishing, building relationships, and completing Community Center bundles. There is no fixed win condition; play is open-ended and nonlinear.

**World:**
- Top-down perspective rendered with three.js.
- Four seasons, each 28 days long (Spring, Summer, Autumn, Winter).
- The valley town is the central hub with townspeople, shops, and the Community Center.
- Each morning begins with a full energy bar; time advances through day-length segments.

---

## 2. NPCs / Townspeople

All names are original. Each villager has a position on the farm grid, dialogue lines, a liked gift, and a marriageable flag.

| Key | Name | Position (r, c) | Liked Gift | Marriageable |
|-----|------|-----------------|------------|--------------|
| elder | Village Elder | (10, 10) | copperBar | No |
| baker | Baker | (4, 12) | wheat | Yes |
| smith | Smith | (6, 14) | ironBar | Yes |
| farmer | Farmhand | (8, 16) | turnip | Yes |
| tailor | Tailor | (12, 14) | cloth | Yes |
| librarian | Librarian | (2, 12) | goldBar | Yes |

**Relationship points needed to marry:** 10

---

## 3. Villager Dialogue

Original dialogue (not copied from any source). Talking to a villager returns a random line from their list and slightly builds rapport (+1 point, capped at the marriage threshold).

| Villager | Dialogue Lines |
|----------|----------------|
| Village Elder | "Welcome to the valley, farmer." / "The seasons change, but the valley endures." / "Take care of your land and it will care for you." |
| Baker | "Fresh bread comes out of the oven every morning." / "Nothing beats the smell of warm bread." / "I could use some wheat for today's loaves." |
| Smith | "A good tool makes all the difference in the mine." / "I can smelt your ores into strong bars." / "The deeper you go, the tougher the monsters." |
| Farmhand | "The soil here is rich if you tend it daily." / "Water your crops every morning for the best yield." / "A well-fed animal is a productive animal." |
| Tailor | "I stitch clothes from cloth gathered around the valley." / "Wear something sturdy for farm work." |
| Librarian | "The valley's history is kept in these old books." / "Quiet please, I am reading." |

---

## 4. Crops & Seeds

Crop definitions (original data). Each crop is valid in one season and grows over a set number of days.

| Crop Key | Name | Season | Grow Days | Sell Price |
|----------|------|--------|-----------|------------|
| turnip | Turnip | Spring | 4 | 10 |
| bean | Bean | Summer | 6 | 15 |
| squash | Squash | Autumn | 5 | 12 |
| root | Root | Winter | 7 | 18 |

Seed definitions:

| Seed Key | Name | Crop | Season | Price |
|----------|------|------|--------|-------|
| turnip | Turnip Seed | turnip | Spring | 5 |
| bean | Bean Seed | bean | Summer | 7 |
| squash | Squash Seed | squash | Autumn | 6 |
| root | Root Seed | root | Winter | 8 |

**Seasonal rule:** A seed can only be planted in its matching season. Crops stop growing / do not auto-harvest when the season changes.

---

## 5. Animals & Animal Products

| Animal Key | Name | Product | Product Amount | Hay Consumption |
|------------|------|---------|----------------|-----------------|
| chicken | Chicken | egg | 1 | 1 |
| cow | Cow | milk | 1 | 2 |
| ostrich | Ostrich | egg | 1 | 1 |

**Buildings that house animals:**

| Building | Cost | Capacity | Houses |
|----------|------|----------|--------|
| Coop | 40 wood, 15 stone | 4 | chicken |
| Barn | 80 wood, 40 stone | 6 | cow, ostrich |

**Rules:**
- Animals must be fed daily (hay) to produce goods.
- A fed animal produces its product each morning.
- An unfed animal produces nothing that day.
- Feeding resets the `fed` flag each morning for the next cycle.

---

## 6. Buildings (Farm Structures)

| Building | Cost | Capacity | Houses | Notes |
|----------|------|----------|--------|-------|
| Coop | 40 wood, 15 stone | 4 | chicken | Houses chickens |
| Barn | 80 wood, 40 stone | 6 | cow, ostrich | Houses cows and ostriches |
| Shed | 30 wood, 10 stone | 0 | — | General storage |

**Build rules:** Place on a clear grass tile (no tree/rock/weed/planting). Player must afford the resource cost.

---

## 7. Mine System

**Cave exploration:** Entering the mine places the player on the first mine floor (floor 1). Each floor has an ore node and a monster.

**Ore tier by floor** (deeper = more valuable):

| Floor Range | Ore | Bar | Monster HP |
|-------------|-----|-----|------------|
| 1–4 | copperOre | copperBar | 3 |
| 5–9 | ironOre | ironBar | 5 |
| 10+ | goldOre | goldBar | 8 |

**Mining:** Using a pickaxe on a mine rock node yields ore and clears the node.
**Combat:** Attacking a monster with a sword reduces its health by 1 per attack; defeating it (HP ≤ 0) removes it from the floor.
**Smelting:** Smelt ores into bars using a furnace:
- copperOre → copperBar
- ironOre → ironBar
- goldOre → goldBar

---

## 8. Foraging

Forageable wild items placed around the valley:

| Item Key | Name | Type |
|----------|------|------|
| wildRoot | Wild Root | forage |
| springOnion | Spring Onion | forage |
| berry | Wild Berry | forage |
| mushroom | Mushroom | forage |

**Rule:** Interacting with a forage item on the ground adds it to the player's inventory and removes it from the ground.

---

## 9. Fishing

Fishing spots are placed around the valley (rivers, lakes, ocean). Completing the fishing action at a valid fishing spot adds a fish to the player's inventory.

---

## 10. Skills

| Skill Key | Name | Max Level |
|-----------|------|-----------|
| farming | Farming | 10 |
| foraging | Foraging | 10 |
| fishing | Fishing | 10 |
| mining | Mining | 10 |
| combat | Combat | 10 |

**XP to next level:** `25 × currentLevel`. Gaining XP beyond the max level is ignored — skills cannot exceed level 10.

**XP sources (examples):**
- Tilling: +5 farming
- Planting: +8 farming
- Harvesting: +10 farming
- Mining ore: +12 mining
- Attacking monster: +15 combat
- Foraging: +6 foraging
- Fishing: +7 fishing

---

## 11. Energy System

| Constant | Value |
|----------|-------|
| Max Energy | 100 |
| Energy per till | 10 |
| Energy per water | 5 |
| Energy per chop | 15 |
| Energy per plant | 5 |
| Energy per mine | 10 |
| Energy per attack | 15 |
| Energy per fish | 8 |
| Energy to enter mine | 10 |

**Rules:**
- Each morning begins with full energy.
- Performing tasks (tilling, watering, mining, chopping, planting, fishing, combat) consumes energy.
- Eating food restores energy by the food's restore value, capped at max.

---

## 12. Time System

- Four seasons: Spring → Summer → Autumn → Winter (cycle).
- 28 days per season.
- Advancing 28 days cycles to the next season and resets the day to 1.
- Each new morning resets energy to max.
- Crops must be harvested before the season changes.

---

## 13. Community Center Bundles

| Bundle Key | Name | Area | Required Items | Reward |
|------------|------|------|----------------|--------|
| springCrops | Spring Crops Bundle | Crafts Room | 10 × turnip | springFieldsUnlocked |
| summerCrops | Summer Crops Bundle | Crafts Room | 10 × bean | summerFieldsUnlocked |
| animalGoods | Animal Goods Bundle | Crafts Room | 5 × egg, 5 × milk | coopUnlocked |
| mineOres | Mine Ores Bundle | Crafts Room | 5 × copperBar, 5 × ironBar | deepMineUnlocked |

**Rules:**
- Donate all required items to complete a bundle.
- Completing a bundle unlocks its reward area/activity.
- Required items are consumed from inventory on donation.

---

## 14. Farm Types

| Farm Type Key | Name | Starting Forage | Starting Wood | Starting Stone |
|---------------|------|-----------------|---------------|----------------|
| standard | Standard Farm | 2 | 60 | 40 |
| forest | Forest Farm | 5 | 40 | 20 |
| river | River Farm | 3 | 30 | 30 |

**Rule:** Selecting the Forest farm type starts the player with more forageable items than the Standard farm type. Each type has a unique theme and different benefits/drawbacks.

---

## 15. Marriage & Family

- Marry any eligible (marriageable) villager regardless of gender, once relationship points reach 10.
- After marriage, the spouse is set and can help with daily farm chores (waters at least one crop during the night).
- A married couple may choose to have children; choosing to have a child adds a child to the player's household.

---

## 16. Source Notes

- `js/game.js` — all constants, data definitions, and game logic (original code, written from scratch).
- `SPEC.md` — feature specification, tests, 3-part build plan, and Stardew Valley APK study (static inspection only; animals/buildings/dialogue categories confirmed from the shipped APK content layout).
- `features.md` — human-readable feature list derived from SPEC.md.
- `AGENTS.md` — project rules: original code only, renamed characters/places, one test per feature, 3-part build plan, commit all work to Git.

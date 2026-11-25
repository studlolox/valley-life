# Valley Life — Concrete Phased Implementation Plan

This plan details the end-to-end roadmap to transform **Valley Life** from its current headless simulation prototype (`js/game.js`, 38 passing unit tests in `tests/features.test.js`) into a complete, rich, playable 3D browser farm-life RPG with full procedural 3D assets, original storyline, multi-tier NPC dialogue, quests, events, audio, UI, and multiplayer.

All work must strictly follow [AGENTS.md](file:///Volumes/En.Sol-SSD/WebProject/valley-life/AGENTS.md):
- Original code written from scratch (no copied code).
- Original Valley Life names for all characters, places, and creatures (no Stardew Valley names).
- Pure browser execution via `three.js` (no native dependencies or required build step).
- One test per feature in `SPEC.md` (`tests/features.test.js`), keeping `SPEC.md`'s 3-part build plan intact.
- Every document and code change committed to Git.

---

## 1. Current Baseline & Gap Audit

### What Already Works
- **Core Simulation (`js/game.js` / `ValleyLifeAPI`):** 20×20 farm grid, 4 seasons × 28 days, energy depletion & food restoration, 4 crops (`turnip`, `bean`, `squash`, `root`), 3 buildings (`coop`, `barn`, `shed`), 3 animals (`chicken`, `cow`, `ostrich`), basic mine state (floors, ores, monster HP, smelting), 4 forage types, fishing action, 5 skills (`farming`, `foraging`, `fishing`, `mining`, `combat`), 6 generic villagers (`elder`, `baker`, `smith`, `farmer`, `tailor`, `librarian`), different-gender marriage & nightly spouse watering, children, 4 Community Center bundles, 3 farm types (`standard`, `forest`, `river`), and in-memory multiplayer session state.
- **Content Reference (`content.md`):** Documents current game definitions plus extracted APK reference sections (achievements, events, quests, storyline arcs, dialogue patterns) for design inspiration.
- **Automated Tests (`tests/features.test.js`):** 38 passing feature tests via `npm test`.

### Critical Gaps Blocking Playability
1. **Broken/Incomplete UI (`index.html`, `css/style.css`):**
   - `#ui` lacks `height: 100%`, collapsing to `0` and pushing `#toolbar` (`bottom: 20px`) off-screen.
   - `js/game.js` writes to `#resources-display`, which does not exist in `index.html`.
   - Only 4 tool buttons exist (`Hoe`, `Water`, `Axe`, `Scythe`). There is no UI for Title/Farm selection, Gold, Inventory, Seeds, Food, Shops, Shipping Bin, Animals, Buildings, Mine/Combat/Smelting, Skills, Villager Dialogue/Gifts/Marriage, Quests, Bundles, Achievements, or Save/Load.
2. **Minimal 3D Visuals (`js/game.js`):**
   - `three.js` only renders a flat green 20×20 `PlaneGeometry` with 6 colored floor squares (`placeInitialDecorations()`) and one blue `BoxGeometry` player.
   - No 3D meshes exist for trees, rocks, crops, water, farmhouse, barns/coops, animals, villagers, forageables, mine caverns, or monsters.
3. **Incomplete Economy & Progression:**
   - `state.money` (`500`) and crop `sellPrice` / seed `price` are defined, but there are no `buyItem`, `sellItem`, `shipItem`, or shop/upgrade functions.
   - `saveGame()` / `loadGame()` currently omit `resources`, `buildings`, `animals`, `skills`, `relationships`, `spouse`, `children`, `forageItems`, `fishingSpots`, `unlockedAreas`, and `selectedFarmType`.
4. **Placeholder Lore & Renaming Cleanup:**
   - `SPEC.md`, `features.md`, and `CHECKLIST.md` still mention `"Pelican Town"` (must be renamed per Rule #4).
   - NPCs use generic role titles (`elder`, `baker`, `smith`, `farmer`, `tailor`, `librarian`) with 2–3 static lines instead of named characters, schedules, heart-tier dialogue, gift preferences, events, and quests.
   - Features referenced in `SPEC.md` / `content.md` (13 animal types, quests, storyline events, festivals, achievements, cooking, tool upgrades) need full gameplay implementation.

---

## 2. World & Character Naming Bible (Original Valley Life Canon)

Per `AGENTS.md` Rule #4, all locations, characters, factions, and creatures use original names:

### Locations
- **Valley:** Sunhollow Valley
- **Town Hub:** Willowbrook (replaces any `"Pelican Town"` references)
- **Player's Farm:** Oakridge Farm
- **Community Center:** Willowbrook Hall (restored with the help of **Mosskin** grove sprites)
- **Mine:** Ironpeak Caverns
- **Waterways:** Clearwater River & Silverfin Coast
- **Rival Store (Story Background):** Apex Mart (managed by **Victor**)

### Cast (12 Villagers — 8 Marriageable)
Keep existing `VILLAGERS` keys mapped or aliased cleanly so existing tests remain valid while exposing rich named characters:

| Key | Name | Role / Shop | Gender | Marriageable | Loved / Liked Gifts |
|-----|------|-------------|--------|--------------|---------------------|
| `elder` | **Mayor Cedric** | Town Mayor | Male | No | `copperBar`, `goldBar`, `agedCheese` |
| `baker` | **Clara** | Willowbrook Bakery | Female | Yes | `wheat`, `strawberry`, `honeyCake` |
| `smith` | **Garrick** | Ironpeak Smithy & Tool Upgrades | Male | Yes | `ironBar`, `goldBar`, `ruby` |
| `farmer` | **Maeve** | Oakridge Neighbor / Agronomist | Female | Yes | `turnip`, `pumpkin`, `herbSalad` |
| `tailor` | **Nora** | Silk & Spindle Tailor | Female | Yes | `cloth`, `wool`, `sunflower` |
| `librarian` | **Julian** | Willowbrook Archive & Museum | Male | Yes | `goldBar`, `ancientRelic`, `tea` |
| `carpenter` | **Rowan** | Timbercraft Workshop (Buildings) | Female | No | `hardwood`, `peach`, `mushroomSoup` |
| `angler` | **Bram** | Silverfin Pier & Tackle Shop | Male | Yes | `fish`, `seaBream`, `fishStew` |
| `merchant` | **Tessa** | Willowbrook Seed & General Store | Female | Yes | `melon`, `flowerBouquet`, `truffle` |
| `mystic` | **Orin** | Deepwoods Herbalist & Shrine Keeper | Male | No | `mushroom`, `purpleHerb`, `crystalShard` |
| `rancher` | **Dahlia** | Meadowgate Ranch (Animals & Hay) | Female | Yes | `milk`, `egg`, `ostrichEgg` |
| `innkeeper` | **Felix** | Hearthside Tavern & Kitchen | Male | Yes | `squash`, `roastedRoot`, `berryPie` |

- **Grandfather:** Grandpa Eldon (appears via opening letter and Year-2 Farm Evaluation event).

---

## 3. Implementation Phases

### Phase 1 — Narrative Bible, Full Content Expansion & Naming Sync
**Goal:** Finalize all storyline arcs, dialogue trees, quests, events, achievements, expanded crops/animals/recipes, and clean up remaining unrenamed references before UI and 3D work.

- **Files to Update / Create:**
  - `SPEC.md`, `features.md`, `CHECKLIST.md` — Replace `"Pelican Town"` with **Willowbrook**; add new numbered features (+1 test each in `SPEC.md` and `tests/features.test.js`) for Economy/Shop, Quests, Story Events, Achievements, Cooking, Tool Upgrades, and Museum Donations while preserving the 3-part build plan section in `SPEC.md`.
  - `content.md` — Expand Sections 1–17 with complete original data:
    - **Storyline & Cutscenes:**
      1. *Prologue (Day 1):* Grandpa Eldon's farewell letter leaving Oakridge Farm; Carpenter Rowan greeting the player at the farm gate; Mayor Cedric introducing Willowbrook.
      2. *Willowbrook Hall Awakening (Day 5+):* Mayor Cedric unlocks the dilapidated hall; player discovers the Mosskin tablet unlocking Bundles.
      3. *Ironpeak Opening (Day 3+):* Garrick clears the rockslide at the Ironpeak Caverns entrance and gifts a Rusty Sword + Pickaxe.
      4. *Bundle Room Restorations:* Individual celebrations for Crafts Room, Pantry, Fish Tank, Boiler Room, and Bulletin Room, culminating in the Grand Reopening festival (or Apex Mart closure).
      5. *Grandpa Eldon's Evaluation (Year 2, Day 1):* Spirit visit scoring crops, relationships, skills, animals, and bundles, rewarding the **Golden Hearth Trophy**.
    - **Multi-Tier Dialogue Matrix:** For all 12 NPCs, define:
      - First-meeting introductions
      - Seasonal & weather lines (Sunny, Rainy, Snowy)
      - Heart-tier lines (Hearts 0–2, 3–5, 6–8, 9–10)
      - Gift response lines (Loved, Liked, Neutral, Disliked)
      - Marriage dialogue (Morning chore help, Rainy day, Evening, Anniversary) + Heart Events (2, 5, 8, 10 hearts)
    - **Quests & Bulletin Board:** 6 Main Story Quests + 12 repeatable "Help Wanted" requests (crop delivery, ore mining, fish catch, monster slay, gift/cooking delivery).
    - **Expanded Item Catalog:**
      - **Crops (16 total, 4 per season):** Spring (`turnip`, `strawberry`, `potato`, `cauliflower`), Summer (`bean`, `melon`, `tomato`, `blueberry`), Autumn (`squash`, `pumpkin`, `corn`, `cranberry`), Winter (`root`, `frostherb`, `snowdrop`, `iceberry`).
      - **All 13 Animal Varieties:** `chicken` (white, brown, blue, void, golden), `cow`, `goat`, `sheep`, `pig`, `rabbit`, `duck`, `dinosaur`, `ostrich`, `turtle`, `cat`, `dog`, `horse` (with distinct products, housing rules, and pet/mount behaviors).
      - **Artisan Machines & Cooking:** Furnace, Mayonnaise Press, Cheese Press, Loom, Preserves Jar, plus 12 kitchen recipes for stamina/buff food.
      - **Achievements (20+):** Adapted to original Valley Life names (e.g., *Sprouting Wealth*, *Master Harvester*, *Deep Delver*, *Silverfin Angler*, *Beloved Neighbor*, *Hall Restorer*, *Grandpa's Pride*).
  - `js/data.js` — Extract static catalogs (crops, seeds, animals, buildings, villagers, dialogue, quests, bundles, recipes, achievements, fish, ores) into a clean original data module imported by `js/game.js`.

**Deliverable:** Complete content bible (`content.md`), synchronized `SPEC.md`/`features.md`/`CHECKLIST.md`, and clean `js/data.js` preserving 100% passing tests.

---

### Phase 2 — Complete UI Overhaul, Economy, Save/Load & Input Controls
**Goal:** Fix all HTML/CSS layout defects and wire every simulation system to intuitive, responsive browser UI and mouse/keyboard controls.

- **Files to Update / Create:**
  - `index.html`, `css/style.css` — Parchment-and-wood RPG theme; fix `#ui { height: 100vh; }` and add all missing HUD/modal containers.
  - `js/ui.js` — Dedicated UI manager module separating DOM rendering from simulation logic.
  - `js/game.js` — Add economy, cooking, crafting, tool upgrades, quest state, achievement triggers, complete `saveGame`/`loadGame`, and mouse raycast controls.

- **Concrete Features & Screens:**
  1. **Title & New Game Setup Modal:** Choose Farm Type (`Standard`, `Forest`, `River`, `Hilltop`), Player Name, Gender (`male`/`female`), Outfit/Hair color, or `Continue Saved Game` / `Join Online Farm`.
  2. **Always-Visible Top HUD:**
     - Day, Season, Weekday (`Mon`–`Sun`), Time-of-Day clock (`6:00 AM`–`2:00 AM`), Weather badge.
     - Gold (`G`), Wood, Stone, and current Zone name.
     - Energy bar (`100/100`+) and Mine Health bar (`HP`) when in Ironpeak Caverns.
     - Mini Active Quest tracker + Notification toast queue.
  3. **10-Slot Bottom Hotbar (`1–0` keys or click):**
     - Tools: Hoe, Watering Can, Axe, Pickaxe, Scythe, Sword, Fishing Rod.
     - Quick-use item slots: Selected Seed packet, Food, Gift item.
  4. **Interactive Modals (Keyboard shortcuts + HUD buttons):**
     - **Inventory, Crafting & Cooking (`I` / `Tab`):** Item grid with tooltips, Eat Food button, Craft Machines (Furnace, Scarecrow, Chest, Sprinkler), Kitchen Cooking when at Farmhouse stove.
     - **Town Shops (`Shop`):** Tessa's Seed & General Store (buy seeds/food/bouquet), Rowan's Carpenter Shop (build Coop/Barn/Shed/House Upgrade), Dahlia's Ranch (buy any of the 13 animals + hay), Garrick's Smithy (upgrade tools & smelt bars).
     - **Shipping Bin & End-of-Day Summary:** Drop items into the bin; sleeping triggers a breakdown ledger of shipped goods, Gold earned, skill level-ups, and morning animal products.
     - **NPC Dialogue & Relationship Panel (`P`):** Typewriter dialogue box with character portrait badge, heart meter, gift-giving selector, quest turn-in, **Propose Marriage** (at 10 hearts, different gender), and **Have Child** option when married.
     - **Quests, Calendar & Achievements (`Q`):** Active story/bulletin quests, 28-day season calendar showing birthdays & festival dates, and unlocked achievements.
     - **Willowbrook Hall Bundles & Museum (`B`):** Bundle room tabs with one-click item donation and unlocked-area indicators; Julian's Museum artifact grid.
     - **Skills Panel (`K`):** Level 1–10 bars, XP counters, and perk milestones for Farming, Foraging, Fishing, Mining, and Combat.
     - **Pause / Save / Load / Export (`Esc`):** Fix `saveGame()` and `loadGame()` to persist *full* state (`money`, `resources`, `buildings`, `animals`, `skills`, `relationships`, `spouse`, `children`, `forageItems`, `unlockedAreas`, `quests`, `achievements`, `farmType`) plus JSON save export/import.
  5. **Controls & Camera:**
     - Smooth top-down follow camera (`lerp` tracking `playerMesh`) with mouse-wheel zoom.
     - Mouse hover tile highlight ring + Left-Click to use active tool/plant/harvest/interact on adjacent tile; `WASD`/Arrows to move, `Space`/`E` to interact, `H` to harvest, `N` or Farmhouse Bed to sleep.

**Deliverable:** Every mechanic in `ValleyLifeAPI` is fully playable in the browser via UI panels, mouse clicks, and keyboard shortcuts.

---

### Phase 3 — Procedural 3D Assets, Textures & Animations (`js/assets.js`)
**Goal:** Replace flat colored squares and the single blue box with a complete library of recognizable procedural `three.js` 3D meshes, canvas textures, and animations with zero external asset files required.

- **Files to Create / Update:**
  - `js/assets.js` — Modular 3D mesh builders using shared `BufferGeometry` / `MeshStandardMaterial` and procedural `<canvas>` pixel/painted textures (`THREE.CanvasTexture`) for crisp visual detail at 60 FPS.

- **Asset Roster to Build:**
  1. **Ground & Tile Textures:** Painted grass blades, dirt path, cobblestone town plaza, tilled soil furrows, dark wet watered soil, wooden pier planks, sandy beach, cave stone floor.
  2. **Articulated Characters (`createCharacterMesh`):**
     - Head, hair/hat style, eyes, torso, swinging arms/legs, held tool mesh (hoe, watering can, axe, pickaxe, sword, fishing rod).
     - Distinct appearance presets for the Player, all 12 NPCs, Spouse, Children, and Mosskin sprites.
     - Animations: walk leg/arm swing, tool-use swing, fishing cast pose, floating `!` / `?` / `<3` overhead icons.
  3. **Nature & Seasonal Foliage:**
     - Trees: tapering bark trunk + 3-tier foliage canopy (Spring pink blossoms & bright green, Summer rich emerald, Autumn orange/crimson, Winter snow-capped pine/bare branches) + gentle wind sway + chop-shake animation.
     - Rocks & Ore Nodes: faceted icosahedron boulders + copper/iron/gold crystal clusters protruding from mine ore veins.
     - Weeds, Wildflowers, Bushes, Fences, Lantern Posts (emissive glow at dusk/night).
     - Distinct 3D meshes for each Forageable (`wildRoot`, `springOnion`, `berry`, `mushroom`, seashells).
  4. **Multi-Stage 3D Crops (all 16 crops × 4 stages):**
     - Stage 0: scattered seed mounds
     - Stage 1: tiny twin-leaf sprout
     - Stage 2: leafy bush / vine
     - Stage 3: ripe fruit/vegetable model (turnip leaves & bulb, bean trellis, golden squash, glowing winter root, etc.) with gentle ready-to-harvest bob.
  5. **Buildings & Interactive Props:**
     - **Farmhouse:** stone base, timber walls, pitched roof, chimney with smoke particles, porch, glowing windows at night, interactive front door & bed.
     - **Coop, Barn, Shed:** recognizable roofs, feed troughs, fenced pens, sliding doors.
     - **Shipping Bin** (hinged lid opens on proximity), **Furnace** (flickering orange ember light while smelting), **Artisan Machines** (Mayo Press, Cheese Press, Loom, Preserves Jar).
     - **Town Landmarks:** Willowbrook Hall (dilapidated → restored golden roof as bundles complete), General Store, Smithy (anvil & forge chimney), Bakery, Archive/Museum, Bulletin Board, Mine Entrance arch.
  6. **All 13 Animals & Mine Monsters:**
     - Distinct low-poly models + idle hop/wander/graze animations: Chickens (white/brown/blue/void/golden), Cows (spotted), Goats (horned), Sheep (fluffy wool spheres), Pigs, Rabbits, Ducks, Dinosaurs, Ostriches, Turtles, Cats, Dogs, Horses (rideable!).
     - Mine Monsters: Bouncing Slimes (green/blue/purple), flapping Cave Bats, Stone Golems, each with floating 3D HP bar and white hit-flash.

**Deliverable:** Complete procedural 3D visual kit rendering every object, crop stage, character, animal, and building cleanly in `three.js`.

---

### Phase 4 — Multi-Zone Valley World, Dynamic Environment & Minigames
**Goal:** Expand the single 20×20 grid into a connected valley with distinct zones, dynamic day/night/weather atmosphere, NPC daily routines, interactive fishing, and real-time mine combat.

- **Files to Create / Update:**
  - `js/world.js` — Zone definitions, map layouts, transition portals, NPC schedules, and weather/lighting controller.
  - `js/minigames.js` — Interactive Fishing Minigame + Mine Floor Generator & Monster AI.
  - `js/game.js` — Integrate multi-zone state, continuous time-of-day loop, and weather effects.

- **Concrete Systems:**
  1. **4 Explorable Zones (Connected via Map Edges / Doors):**
     - **Oakridge Farm (32×24):** Layout shaped by chosen Farm Type (`Standard` balanced fertile soil, `Forest` extra forage & hardwood stumps, `River` winding water & fishing bridges, `Hilltop` ore quarry cliff). Contains Farmhouse (enterable interior with bed & stove), Shipping Bin, and buildable Coop/Barn/Shed lots.
     - **Willowbrook Town (32×24):** Cobblestone square, Notice Board, Tessa's General Store, Garrick's Smithy, Rowan's Workshop, Clara's Bakery, Nora's Tailor, Julian's Archive/Museum, Felix's Tavern, and **Willowbrook Hall** (enterable Crafts/Pantry/Fish/Boiler/Bulletin rooms).
     - **Clearwater River & Silverfin Coast (28×20):** Animated reflective water plane, wooden bridges & pier, Bram's tackle hut, seasonal coastal forage, and fishing zones (river/lake/ocean fish pools).
     - **Ironpeak Caverns (Floor 1–20+):** Torch-lit rocky cave map per floor with scattered rocks, ore nodes (`copperOre`, `ironOre`, `goldOre`), monsters, hidden ladder descending deeper, and an elevator unlocking every 5 floors.
  2. **NPC Daily Schedules & Living Town:**
     - NPCs walk along waypoints between home, shop/workplace, town square, and tavern based on `timeOfDay`, stopping to face the player when spoken to.
     - After marriage, Spouse lives at Oakridge Farm, stands on the porch/kitchen, waters unwatered crops or feeds animals overnight, and gives morning gifts/dialogue.
  3. **Dynamic Time, Lighting & Weather:**
     - Real-time clock ticks forward gently during active play (pauses inside modals/dialogues), shifting directional sun angle, ambient tint (cool dawn → warm noon → amber sunset → starry blue night with glowing windows & streetlamps), and forcing sleep/pass-out at `2:00 AM`.
     - Daily weather roll (`Sunny`, `Rainy`, `Stormy`, `Snowy` in Winter) with 3D rain/snow particles; **Rain automatically waters outdoor crops**.
  4. **Interactive Fishing Minigame & Combat:**
     - Casting at Clearwater River / Silverfin Coast shows a 3D bobber + ripple; biting triggers an interactive vertical catch-bar minigame modal where keeping the bobber over the moving fish icon reels it in (scaled by fish rarity & Fishing skill).
     - Mine combat features directional sword swing arcs, monster chase/knockback, player HP bar, monster loot drops, and rescue/energy-cost recovery if knocked out.

**Deliverable:** A living multi-zone 3D valley with dynamic weather, NPC schedules, real-time combat, and interactive fishing.

---

### Phase 5 — Storyline Events, Festivals, Quests & Procedural Audio
**Goal:** Bring Valley Life's story, dialogue, festivals, quests, and soundscape together into a cohesive RPG loop.

- **Files to Create / Update:**
  - `js/story.js` — Cutscene queue, event condition evaluator, quest tracker, and festival map overlays.
  - `js/audio.js` — Web Audio API synthesizer for sound effects and seasonal background music.

- **Concrete Systems:**
  1. **Cutscene & Story Event Engine:**
     - **Day 1 Opening Sequence:** Grandpa Eldon's handwritten-style letter overlay → Rowan & Mayor Cedric welcome scene on Oakridge Farm.
     - **Town & Hall Arc:** Quest prompts introducing every villager, unlocking Willowbrook Hall, Mosskin spirit appearances as bundles finish, and restoring town vitality.
     - **Heart Events & Romance:** Unique scripted mini-scenes at 2, 5, 8, and 10 hearts for marriageable NPCs, **Wedding Ceremony** cutscene in the town square, and Child birth announcement.
     - **Grandpa Eldon's Year-2 Evaluation:** Automated appraisal of farm progress, relationships, bundles, and skills.
  2. **Seasonal Festivals (4 Annual Town Events):**
     - **Spring (Day 13) — Blossom Day:** Town square flower decor, spring dance & gift stall.
     - **Summer (Day 11) — Tide Feast:** Silverfin Coast potluck cauldron & communal soup tasting.
     - **Autumn (Day 16) — Harvest Fair:** Crop/animal quality display judging & mini-contest prizes.
     - **Winter (Day 25) — Starlight Night:** Lantern-lit snow square & Secret Gift Exchange with a random villager.
  3. **Procedural Web Audio (`js/audio.js`):**
     - Zero-file synthesized SFX: hoe dirt thud, water splash, axe wood crack, pickaxe metallic clink, sword swoosh, slime squish, crop harvest pop, coin chime, dialogue typewriter blip, level-up & bundle-complete chords.
     - Gentle procedural seasonal chiptune/acoustic ambient loops with Master/SFX/Music mute toggles in HUD.
  4. **Juice & Particle FX:**
     - 3D particle bursts on tilling, watering, chopping, mining, harvesting, and level-up sparkles.

**Deliverable:** Complete narrative arc, quests, heart events, festivals, and synthesized audio.

---

### Phase 6 — Networked Multiplayer, Optimization & Full QA
**Goal:** Upgrade multiplayer from local in-memory state to real-time browser networking, optimize rendering performance, and verify all tests and playthrough paths.

- **Files to Create / Update:**
  - `server/multiplayer.js` — Lightweight Node WebSocket/HTTP relay server (optional for online play; game continues to work standalone in static browser mode with a `BroadcastChannel` multi-tab local co-op fallback).
  - `js/game.js`, `js/ui.js` — Multiplayer lobby modal (Host Room / Join Room code), live synchronization of remote players' 3D avatars, zones, animations, and shared farm tiles.
  - `tests/features.test.js`, `SPEC.md`, `CHECKLIST.md` — Final 1-to-1 feature/test audit.

- **Verification & Polish Tasks:**
  1. **Performance Pass:** Merge static environment geometries where possible, pool particle meshes, throttle off-zone updates, target steady 60 FPS in Chrome/Safari.
  2. **Strict Rule Compliance Check (`AGENTS.md`):**
     - Confirm zero original Stardew Valley character/place/creature names exist in runtime code or docs (`SPEC.md`, `features.md`, `CHECKLIST.md`, `content.md`, `js/*`).
     - Confirm every feature in `SPEC.md` has exactly one passing test in `tests/features.test.js` (`npm test` → 0 failures).
     - Verify `index.html` runs cleanly via a simple static HTTP server with no build step required.
  3. **End-to-End Browser Playthrough Checklist:**
     - Start New Game (Forest & Standard farms) → Clear land, till, plant, water, sleep, harvest → Ship crops & earn Gold → Buy seeds, build Coop/Barn, add/feed animals → Enter Ironpeak Caverns, mine ore, fight monsters, smelt bars → Fish at Clearwater River → Talk, gift, marry, have child → Donate to Willowbrook Hall bundle & unlock area → Save & Reload → Verify multi-tab/networked co-op sync.
  4. **Git Commit Discipline:** Commit each completed phase cleanly to Git.

---

## Summary Milestone Map

| Phase | Focus | Key Files | Playable Milestone |
|-------|-------|-----------|--------------------|
| **Phase 1** | Lore, Renaming & Full Catalog | `content.md`, `SPEC.md`, `features.md`, `js/data.js` | Complete Valley Life story, dialogue, quests & item definitions |
| **Phase 2** | UI, Economy, Save/Load & Controls | `index.html`, `css/style.css`, `js/ui.js`, `js/game.js` | All systems playable via menus, hotbar, shops & mouse/keyboard |
| **Phase 3** | Procedural 3D Assets & Animations | `js/assets.js` | Full 3D characters, crops, buildings, 13 animals & monsters |
| **Phase 4** | Multi-Zone World, Weather & Minigames | `js/world.js`, `js/minigames.js` | Farm, Willowbrook, River/Coast & Ironpeak Caverns with fishing & combat |
| **Phase 5** | Story Events, Festivals & Audio | `js/story.js`, `js/audio.js` | Cutscenes, heart events, 4 festivals & Web Audio SFX/music |
| **Phase 6** | Multiplayer, Performance & QA | `server/multiplayer.js`, `tests/features.test.js` | Real-time co-op, 60 FPS polish & 100% passing test suite |

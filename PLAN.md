# Valley Life — Complete Playable Game Implementation Plan

This plan bridges the gap between the current headless game-logic prototype (36 passing unit tests in `tests/features.test.js`) and a complete, rich, playable 3D browser game with original lore, dialogue, procedural 3D assets, full UI, and interactive world zones.

---

## Current State Assessment

- **Working:** Core simulation logic in `js/game.js` (`ValleyLifeAPI`) — grid state, crops, seasons, energy, buildings, animals, mining, smelting, foraging, fishing, skills, relationships, marriage, bundles, farm types, save/load, and local multiplayer state.
- **Missing / Incomplete:**
  - `content.md` does not exist yet; NPCs use generic role names (`elder`, `baker`, `smith`) and 2–3 placeholder dialogue lines.
  - Original names like "Pelican Town" still appear in `SPEC.md` and `features.md` (must be renamed per `AGENTS.md`).
  - `css/style.css` collapses `#ui` to `0` height, pushing `#toolbar` off-screen.
  - `three.js` only renders a flat 20×20 grid of colored `PlaneGeometry` squares and a single blue `BoxGeometry` player.
  - No interactive UI panels for inventory, shops/economy, seeds, animals, buildings, mining, skills, villagers, bundles, quests, or story events.

---

## Phase 1 — World Lore, Renaming & Content Bible (`content.md`)

**Goal:** Establish all original names, storyline, dialogue, quests, events, and item/creature catalogs before building visual assets and UI.

1. **Create `content.md`** as the single content reference:
   - **World & Locations (Renamed):** Rename "Pelican Town" → **Willowbrook**, the farm → **Oakridge Farm**, the mine → **Ironpeak Caverns**, the beach/lake → **Silverfin Coast** & **Clearwater River**, Community Center → **Willowbrook Hall**.
   - **Opening Storyline:** Grandpa's farewell letter bequeathing Oakridge Farm, arrival cutscene text, and Mayor's welcome tour.
   - **Original Cast (10–12 Villagers, 6+ Marriageable):** Replace generic keys (`elder`, `baker`, etc.) with named characters, personalities, occupations, daily schedules, liked/loved/disliked gifts, and multi-tier dialogue (greeting, seasonal, weather, heart-level 2/4/6/8/10, marriage & post-marriage).
   - **Quests & Events:** Starter tutorial quests ("Clear the Land", "First Harvest", "Meet the Neighbors"), notice-board bulletin quests, and heart/festival events (Spring Blossom Day, Summer Tide Festival, Autumn Harvest Fair, Winter Starlight Night).
   - **Achievements & Item Catalog:** Full list of crops, artisan/animal goods, fish, forageables, ores/gems, monsters, cooked foods, and bundle rewards.
2. **Sync Documentation:** Update `SPEC.md` and `features.md` to replace any remaining original-game place names with Valley Life's renamed locations.

**Deliverable:** Complete `content.md` + updated `SPEC.md` / `features.md`.

---

## Phase 2 — UI Overhaul, Economy & Interactive Controls

**Goal:** Make every existing and new game mechanic accessible through clean, responsive browser UI and intuitive mouse/keyboard controls.

1. **Fix Layout & Add Screens (`index.html`, `css/style.css`):**
   - Fix `#ui { height: 100vh; }` so `#toolbar` and all overlays render properly.
   - **Title & New Game Screen:** Choose Farm Type (Standard, Forest, Riverland, Hilltop), Player Name, Appearance/Color, or Load Saved Game.
   - **HUD:** Day, Season, Time-of-Day clock, Gold (`G`) counter, Energy bar, Health bar (in mines), Current Zone indicator, and active Quest tracker.
   - **Bottom Hotbar (1–9):** Selectable slots for Tools (Hoe, Watering Can, Axe, Pickaxe, Scythe, Sword, Fishing Rod), Seeds, Food, and Gifts.
2. **Interactive Modals & Panels:**
   - **Inventory & Crafting Modal (`I` / `Tab`):** View items, eat food to restore energy, craft Furnace/Scarecrow/Chests.
   - **Town Shop & Carpenter Modal:** Buy seeds, food, animals, and farm buildings (Coop, Barn) using Gold earned from the Shipping Bin.
   - **Social & Relationships Panel (`P`):** View villager portraits/colors, heart meters, gift preferences discovered, and trigger Talk / Give Gift / Propose Marriage / Have Child.
   - **Skills & Achievements Panel (`K`):** Level progress bars for Farming, Foraging, Fishing, Mining, and Combat.
   - **Willowbrook Hall (Bundles) Panel (`B`):** Donate required items to bundles and see unlocked valley areas.
   - **Dialogue Box & Choice Modal:** NPC portrait badge, typewriter dialogue text, gift/quest/marriage action buttons.
   - **Save / Load / Pause Menu (`Esc`):** Manual save, load, and controls reference.
3. **Mouse & Camera Controls:**
   - Smooth top-down follow camera tracking the player.
   - Mouse hover tile highlight + click-to-interact (till, water, chop, talk, forage, mine, harvest) in addition to `WASD`/Arrows + `Space`/`E`.

**Deliverable:** Fully wired UI and controls where every feature in `ValleyLifeAPI` is playable without touching the browser console.

---

## Phase 3 — Procedural 3D Assets & Multi-Zone World (`three.js`)

**Goal:** Replace flat colored squares with recognizable, charming 3D procedural meshes, animations, and distinct explorable areas.

1. **Procedural 3D Asset Factory (`js/assets.js`):**
   - **Player & NPCs:** Articulated low-poly characters (head, hat/hair, torso, arms, legs) with walk cycle and tool-swing animations; floating name/interaction prompts when nearby.
   - **Environment Props:**
     - Trees (brown cylinder trunk + layered green/pink/orange/white seasonal foliage cones/spheres).
     - Rocks, Ore Nodes (copper/iron/gold/iridium tinted crystals), Weeds/Wild Grass.
     - Tilled & watered soil (raised dark-brown/wet-brown soil beds).
     - **Multi-stage 3D Crops:** Stage 0 (seeds), Stage 1 (sprout), Stage 2 (leafy plant), Stage 3 (mature crop with fruit/flower + gentle bob).
   - **Buildings:** Farmhouse (with porch & bed to sleep/advance day), Coop, Barn, Shipping Bin (interactive lid), Furnace (glowing embers when smelting), Willowbrook Hall, and Town Shops.
   - **Animals & Monsters:** Distinct procedural silhouettes for Chickens, Cows, Sheep, Ostriches, Ducks, plus Mine Slimes/Bats/Golems with hit-flash and health bars.
2. **World Zones & Scene Transitions:**
   - **Oakridge Farm** (starting zone, Shipping Bin, Farmhouse, Coop/Barn plots).
   - **Willowbrook Town** (east exit: shops, villagers walking on paths, notice board, Willowbrook Hall).
   - **Clearwater River / Silverfin Coast** (south exit: animated water plane, wooden fishing pier, seasonal forage).
   - **Ironpeak Caverns** (north exit: dark rocky interior, torch lighting, ore nodes, monsters, ladder to deeper floors).
3. **Day/Night Lighting & Weather:**
   - Dynamic directional light & sky color shifting from morning → afternoon → golden evening → night, plus seasonal ground/tree palettes (Spring blossoms, Summer lush green, Autumn amber, Winter snow).

**Deliverable:** A visually rich, animated 3D valley with distinct zones, buildings, crops, animals, and townspeople.

---

## Phase 4 — Gameplay Loop Polish, Minigames, Quests & Audio

**Goal:** Tie together progression, economy, story events, and game feel.

1. **Economy & Shipping Bin:** Sell harvested crops, animal products, fish, and bars in the Shipping Bin; receive a nightly "End of Day Earnings" summary screen.
2. **Fishing Minigame UI:** Interactive timing/bar minigame when casting at a fishing spot, with difficulty scaled by fish rarity.
3. **Storyline & Quest System:**
   - Opening Grandpa's Letter modal on Day 1.
   - Quest tracker for tutorial, NPC requests, and Community Center restoration.
   - Heart events and festival days on the calendar.
4. **Procedural Audio (`js/audio.js`):** Web Audio API sound effects (hoe thud, water splash, axe chop, crop pop, coin chime, sword slash, level-up fanfare) with a mute toggle.
5. **Testing & Verification:** Add 1 test per any new feature in `SPEC.md` and `tests/features.test.js`, verify `npm test` passes, and test the full flow in the browser.

**Deliverable:** Complete single-player Valley Life experience with story, dialogue, audio, and full progression.

---

## Phase 5 — Online Multiplayer & Final Polish

**Goal:** Upgrade the multiplayer state system to real networked play and perform final balance/performance tuning.

1. **WebSocket / Peer Sync Server (Optional Lightweight Node Script):** Allow two browser tabs/clients to connect, see each other's 3D avatars move in real time, and share farm state.
2. **Performance & Balance Pass:** Optimize `three.js` draw calls (shared geometries/materials), tune energy costs, crop prices, and bundle requirements.
3. **Final QA & Git Commit:** Full playthrough check across all seasons, zones, marriage, and bundles.

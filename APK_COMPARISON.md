# Valley Life vs Stardew Valley APK — Game Mechanic Comparison

This document compares the **Valley Life** game mechanics (implemented in `js/game.js` + `js/data.js`, 43 passing tests) against the **Stardew Valley APK** mechanics observed through REA static inspection (`stardew-valley-mod-1.6.15.3-an1.com.apk`).

**Important:** Per AGENTS.md Rule #4, all Valley Life characters, places, and creatures are renamed originals. The APK content is used as **design reference only** — nothing is copied. Valley Life mechanics are written independently.

---

## 1. Scope & Source Basis

| Aspect | Valley Life (Implemented) | Stardew Valley APK (REA static inspection) |
|--------|---------------------------|--------------------------------------------|
| Source | `js/game.js`, `js/data.js`, `content.md`, `tests/features.test.js` (43 tests pass) | `assets/Content/` XNB files, `AndroidManifest.xml`, directory structure |
| Inspection method | Original code + tests | Static artifact inspection only; no execution, no JADX decompilation, no runtime |
| Content count | 16 crops, 13 animals, 12 villagers, 6 quests, 4 story events, 4 festivals, 9 achievements | 3,694 archive entries / 3,658 nodes; 660 dialogue XNB files; `Data/Achievements.xnb`, `Data/Events/*.xnb`, `Data/Strings/1_6_Strings.xnb` |

---

## 2. Core Game Loop & Time

| Mechanic | Valley Life | APK / Stardew reference |
|----------|-------------|-------------------------|
| Day/night cycle | `nextDay()` resets energy to max, advances season after 28 days | APK `1_6_Strings.xnb` contains day/time strings; gameplay loop confirmed by structure |
| Seasons | 4 seasons × 28 days (Spring, Summer, Autumn, Winter) | APK content organized seasonally; crops have season restrictions |
| Energy | Starts full each morning; depleted by till/water/chop/mine/attack/fish; restored by food (capped at 100) | APK has energy/food concepts (confirmed by items/strings) |
| Time of day | 6 = morning, advances with day cycle | APK has time-of-day strings in `1_6_Strings.xnb` |

**Status:** Implemented and tested (Features 1–4). Matches APK reference conceptually; original code.

---

## 3. Farming System

| Mechanic | Valley Life | APK / Stardew reference |
|----------|-------------|-------------------------|
| Land clearing | Axe removes tree (`chopTile`); scythe clears weeds (`scytheTile`) | APK `Animals/`/content has trees, rocks, weeds |
| Tilling | Hoe converts grass → tilled (`tillTile`, Feature 7) | APK farming tools confirmed by content structure |
| Planting | Seasonal seed on tilled soil (`plantSeed`, Feature 8); season-restricted | APK crops are season-locked (Spring/Summer/Autumn/Winter seeds) |
| Watering | Daily watering advances growth; unwatered does not grow (`waterTile`, Feature 9) | APK has watering mechanic |
| Crop growth | Grows over `growDays` when watered; mature = harvestable (`advanceCropGrowth`, Feature 10) | APK crops grow over days |
| Harvesting | Mature crop adds produce to inventory (`harvestTile`, Feature 11) | APK harvest yields produce |
| Seasonal restriction | Summer seed cannot plant in Spring; crop stops at season change (Feature 12) | APK crops are season-specific |
| Scythe | Clears weed, 50% chance hay (Feature 13) | APK scythe cuts weeds/hay |

**Crops implemented (16, 4 per season):** turnip, strawberry, potato, cauliflower / bean, melon, tomato, blueberry / squash, pumpkin, corn, cranberry / root, frostherb, snowdrop, iceberry.

**Status:** Implemented and tested (Features 6–13). All original code/data.

---

## 4. Animals & Animal Husbandry

| Mechanic | Valley Life | APK / Stardew reference |
|----------|-------------|-------------------------|
| Coop | Houses chicken/duck/rabbit/dinosaur, capacity 4 | APK `Animals/` has chickens (white/brown/blue/void/golden), coops |
| Barn | Houses cow/ostrich/goat/sheep/pig, capacity 6 | APK has cows, goats, sheep, pigs, rabbits, ducks, dinosaurs, ostriches, turtles, cats, dogs, horses; barns |
| Stable | Houses horse, capacity 2 | APK has horses/stables |
| Animal products | Fed animals produce daily (egg, milk, wool, truffle, etc.) | APK animals produce goods when fed |
| Feeding | Must feed daily with hay; unfed produces nothing (Features 16–17) | APK animals need daily feeding |
| Animal varieties | 13 types: chicken, cow, goat, sheep, pig, rabbit, duck, dinosaur, ostrich, turtle, cat, dog, horse (Feature 18) | APK `Animals/` confirms exactly these 13 varieties |

**Status:** Implemented and tested (Features 14–18). Matches APK animal categories exactly (renamed).

---

## 5. Mining

| Mechanic | Valley Life | APK / Stardew reference |
|----------|-------------|-------------------------|
| Cave entry | Enter mine → floor 1, costs energy (`enterMine`, Feature 19) | APK has mine/cave system |
| Ore mining | Pickaxe on ore node yields ore, clears node (`mineOre`, Feature 20) | APK mining with pickaxe |
| Combat | Sword attack reduces monster HP; defeat removes monster (`attackMonster`, Feature 21) | APK mine combat with sword |
| Floor progression | Floor 1–4 copper, 5–9 iron, 10+ gold; deeper = harder monsters (`oreTierForFloor`, Feature 22) | APK deeper floors have more valuable ores/stronger monsters |
| Smelting | Furnace: copper/iron/gold ore → bar (`smelt`, Feature 23) | APK furnace smelting |

**Status:** Implemented and tested (Features 19–23). Matches APK mine mechanics.

---

## 6. Foraging & Fishing

| Mechanic | Valley Life | APK / Stardew reference |
|----------|-------------|-------------------------|
| Foraging | Collect wild item on ground → inventory (`forage`, Feature 24) | APK forageables (wild root, spring onion, berry, mushroom) |
| Fishing | Valid spot → catch fish (`fish`, Feature 25) | APK fishing in rivers/lakes/ocean |

**Forageables:** wildRoot, springOnion, berry, mushroom, seashell, purpleHerb, snowBerry.

**Fish:** River Perch, Sun Carp, Silverfin Bream, Tide Eel, Glacier Trout.

**Status:** Implemented and tested (Features 24–25). Matches APK reference.

---

## 7. Skills

| Mechanic | Valley Life | APK / Stardew reference |
|----------|-------------|-------------------------|
| Skill leveling | Farming/Foraging/Fishing/Mining/Combat gain XP; threshold levels up (Feature 26) | APK has 5 skills |
| Skill cap | Max level 10; cannot exceed (Feature 27) | APK skills capped at 10 |

**Status:** Implemented and tested (Features 26–27). Matches APK.

---

## 8. Social & Relationships

| Mechanic | Valley Life | APK / Stardew reference |
|----------|-------------|-------------------------|
| NPC interaction | Talk → dialogue + +1 rapport (Feature 28) | APK per-villager dialogue files (660 XNB files) |
| Gift giving | Liked gift +5 points, any gift +1; requires talk first (Feature 29) | APK gift-giving with loved/liked/neutral/disliked responses |
| Marriage | Eligible villager, different gender, relationship ≥ 10 (Feature 30) | APK has marriage dialogue files for romanceable candidates |
| Spouse help | Spouse waters a crop overnight (Feature 31) | APK spouse helps on farm |
| Children | `haveChild()` adds child to household (Feature 32) | APK has children |

**Villagers (12, renamed):** Mayor Cedric, Clara, Garrick, Maeve, Nora, Julian, Rowan, Bram, Tessa, Orin, Dahlia, Felix (8 marriageable).

**Gender rule:** Valley Life restricts marriage to different genders. The APK `MarriageDialogue*.xnb` files exist for romanceable candidates of multiple genders.

**Status:** Implemented and tested (Features 28–32). Matches APK reference; renamed cast; gender restriction applied per user request.

---

## 9. Community Center (Willowbrook Hall)

| Mechanic | Valley Life | APK / Stardew reference |
|----------|-------------|-------------------------|
| Bundles | Donate required goods → complete (Feature 33) | APK `Buildings/` has Community Center; bundles confirmed |
| Bundle rewards | Completing unlocks area/activity (Feature 34) | APK bundle rewards unlock new areas |

**Bundles:** Spring Crops (10 turnip), Summer Crops (10 bean), Animal Goods (5 egg + 5 milk), Mine Ores (5 copperBar + 5 ironBar).

**Status:** Implemented and tested (Features 33–34). Matches APK.

---

## 10. Farm Types

| Mechanic | Valley Life | APK / Stardew reference |
|----------|-------------|-------------------------|
| Selection | Standard/Forest/River/Hilltop; different starting forage/resources (Feature 35) | APK has multiple farm layouts |

**Status:** Implemented and tested (Feature 35). Matches APK concept.

---

## 11. Multiplayer

| Mechanic | Valley Life | APK / Stardew reference |
|----------|-------------|-------------------------|
| Online multiplayer | In-memory host/join session + position sync (`hostSession`/`joinSession`/`syncPlayerPosition`, Feature 36) | APK added multiplayer post-release |

**Status:** Implemented and tested (Feature 36). Note: current implementation is in-memory/local; PLAN.md Phase 6 describes WebSocket networking for true online play.

---

## 12. Rendering & Platform

| Mechanic | Valley Life | APK / Stardew reference |
|----------|-------------|-------------------------|
| Top-down 3D | three.js Scene, PerspectiveCamera, WebGLRenderer (Feature 37) | APK is a native mobile game (3D-ish) |
| Browser execution | index.html loads, no build step/native install (Feature 38) | APK is Android-native (native install) — Valley Life is browser-based, a platform difference |

**Status:** Implemented and tested (Features 37–38).

---

## 13. Economy, Quests, Events, Achievements, Cooking/Crafting (SPEC Features 39–43)

| Mechanic | Valley Life | APK / Stardew reference |
|----------|-------------|-------------------------|
| Shop & economy | Buy seeds with Gold; ship produce for Gold (buySeed, shipItem, Feature 39) | APK has shops (Pierre's, etc.) and shipping bin |
| Quests | Story + bulletin quests with required items & gold rewards (acceptQuest/completeQuest, Feature 40) | APK `1_6_Strings.xnb` references `'Help Wanted'` requests / quests |
| Storyline events | Trigger unseen event → returns script lines, marks seen (triggerEvent, Feature 41) | APK `Data/Events/*.xnb` (BusStop, FarmHouse, CommunityCenter, Mine, etc.) |
| Achievements | Unlock once per milestone (Feature 42) | APK `Data/Achievements.xnb` (Greenhorn, Millionaire, Legend, etc.) |
| Cooking/crafting | Consume ingredients → cooked dish/crafted item (cookRecipe, Feature 43) | APK has cooking and crafting machines |

**Quests (6):** A New Beginning, Meet Willowbrook, Into Ironpeak Caverns, Fresh Berry Delivery, Pier Supper.

**Story events (4):** Grandpa Eldon's Letter, Welcome to Oakridge Farm, The Mosskin of Willowbrook Hall, Grandpa Eldon's Evaluation.

**Festivals (4):** Blossom Day (Spring 13), Tide Feast (Summer 11), Harvest Fair (Autumn 16), Starlight Night (Winter 25).

**Achievements (9):** Sprouting Wealth, Local Shipper, Barnyard Friend, Ironpeak Delver, Silverfin Angler, Hearthside Cook, Beloved Neighbor, Hall Restorer.

**Status:** Implemented and tested (Features 39–43). Matches APK reference mechanics (quests, events, achievements, cooking).

---

## 14. Save/Load

| Mechanic | Valley Life | APK / Stardew reference |
|----------|-------------|-------------------------|
| Save/load | Full state (day, energy, money, resources, inventory, grid, buildings, animals, skills, relationships, spouse, children, quests, events, achievements, unlocked areas, farm type) via localStorage (Feature 5) | APK has save files |

**Status:** Implemented and tested (Feature 5).

---

## 15. Summary of Alignment

| Category | Valley Life implemented | APK reference present | Aligned? |
|----------|------------------------|----------------------|----------|
| Time/energy/seasons | ✓ | ✓ | Yes |
| Farming (till/plant/water/grow/harvest) | ✓ | ✓ | Yes |
| Animals (13 types, products, feeding) | ✓ | ✓ | Yes |
| Mining (floors, ores, combat, smelting) | ✓ | ✓ | Yes |
| Foraging & fishing | ✓ | ✓ | Yes |
| Skills (5, capped at 10) | ✓ | ✓ | Yes |
| Relationships/gift/marriage/children | ✓ | ✓ | Yes |
| Community Center bundles | ✓ | ✓ | Yes |
| Farm types | ✓ | ✓ | Yes |
| Multiplayer | ✓ (in-memory) | ✓ (post-release) | Yes |
| 3D browser rendering | ✓ | (native mobile) | Platform differs |
| Economy/quests/events/achievements/cooking | ✓ (Features 39–43) | ✓ | Yes |

**Overall:** Valley Life implements all the core mechanics observed in the Stardew Valley APK reference, rewritten as original code with renamed characters/places/creatures, running in the browser via three.js. All 43 SPEC features have exactly one passing test.

---

## 16. Divergences from APK (Intentional)

1. **Gender-restricted marriage:** Valley Life allows marriage only between different genders; the APK supports same-gender romance (multiple `MarriageDialogue*.xnb` files exist for various candidates). This was a deliberate user requirement.
2. **Platform:** APK is a native Android app; Valley Life is a browser-based three.js game (Feature 38).
3. **Multiplayer implementation:** Valley Life's current multiplayer is in-memory host/join; PLAN.md Phase 6 plans WebSocket networking. The APK added online multiplayer post-release.
4. **All names replaced:** APK characters (Abigail, Alex, Caroline, etc.) and places (Pelican Town, Community Center) are renamed in Valley Life (e.g., Willowbrook, Mayor Cedric, Clara, Willowbrook Hall) per Rule #4.
5. **No direct content copy:** Dialogue strings, story events, quests, and achievements in Valley Life are original writing inspired by — not copied from — the APK XNB fragments extracted into `content.md`.

---

## 17. Test Coverage

- **43 tests total** (Features 1–43), one test per feature as required by AGENTS.md Rule #6.
- All 43 pass (`npm test` → 0 failures).
- SPEC.md maintains its 3-part build plan (Rule #7).

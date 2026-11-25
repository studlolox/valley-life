# Valley Life — Game Content Reference

This document extracts all game content (storyline, dialogue, NPCs, characters, items, crops, animals, buildings, mine, bundles, farm types, skills) from `js/game.js`, `SPEC.md`, and `features.md`. It is intended as a reference during game creation and expansion.

Per AGENTS.md rule #4 (Rename): all character, place, and creature names are original Valley Life names — none are taken from Stardew Valley.

---

## 1. Storyline & Setting

**Game identity:** Valley Life — an open-ended farm life simulation (top-down, three.js, browser-based).

**Premise:** The player inherits **Oakridge Farm** in **Sunhollow Valley**, just outside the town of **Willowbrook**, from **Grandpa Eldon**. They restore the dilapidated farm by clearing land, tilling soil, planting seasonal crops, watering them, raising animals, mining **Ironpeak Caverns**, foraging, fishing **Clearwater River** and **Silverfin Coast**, building relationships with 12 townspeople, and completing **Willowbrook Hall** bundles with the help of the **Mosskin** grove sprites (rivaled by **Apex Mart**). There is no fixed win condition; play is open-ended and nonlinear.

**World:**
- Top-down perspective rendered with three.js.
- Four seasons, each 28 days long (Spring, Summer, Autumn, Winter).
- **Willowbrook** is the central hub with townspeople, shops, and **Willowbrook Hall**.
- Each morning begins with a full energy bar; time advances through day-length segments.

---

## 2. NPCs / Townspeople (12 Original Characters)

All names are original. Each villager has a position, role, gender, birthday, loved/liked gifts, and a marriageable flag (8 marriageable).

| Key | Name | Role | Gender | Position (r, c) | Liked Gift | Marriageable |
|-----|------|------|--------|-----------------|------------|--------------|
| elder | **Mayor Cedric** | Town Mayor | Male | (10, 10) | copperBar | No |
| baker | **Clara** | Willowbrook Baker | Female | (4, 12) | wheat | Yes |
| smith | **Garrick** | Ironpeak Blacksmith | Male | (6, 14) | ironBar | Yes |
| farmer | **Maeve** | Oakridge Agronomist | Female | (8, 16) | turnip | Yes |
| tailor | **Nora** | Silk & Spindle Tailor | Female | (12, 14) | cloth | Yes |
| librarian | **Julian** | Willowbrook Archivist | Male | (2, 12) | goldBar | Yes |
| carpenter | **Rowan** | Timbercraft Carpenter | Female | (3, 6) | squash | No |
| angler | **Bram** | Silverfin Angler | Male | (16, 16) | fish | Yes |
| merchant | **Tessa** | General Store Owner | Female | (5, 10) | melon | Yes |
| mystic | **Orin** | Deepwoods Herbalist | Male | (14, 3) | mushroom | No |
| rancher | **Dahlia** | Meadowgate Rancher | Female | (11, 8) | milk | Yes |
| innkeeper | **Felix** | Hearthside Innkeeper | Male | (7, 11) | potato | Yes |

**Relationship points needed to marry:** 10 (between different genders)

---

## 3. Villager Dialogue & Tiers

Original dialogue written for Valley Life (`js/data.js`). Talking to a villager draws from character-specific lines, heart-tier pools (`low`, `mid`, `high`), weather lines (`rainy`), or `marriage` lines if married (+1 point, capped at 10).

| Villager | Sample Dialogue Lines |
|----------|-----------------------|
| Mayor Cedric | "Welcome to Willowbrook, farmer. Your grandfather Eldon spoke of you often." / "Willowbrook Hall has stood quiet too long—perhaps you can help restore it." |
| Clara | "Fresh loaves come out of the brick oven every morning at dawn." / "If you grow wheat or strawberries, bring some by the bakery!" |
| Garrick | "A balanced pickaxe makes all the difference in Ironpeak Caverns." / "Careful past floor five—the cavern bats and golems hit harder down there." |
| Maeve | "Oakridge soil is rich once you clear away the weeds and stones." / "Water your crops daily unless rain clouds roll over Sunhollow Valley." |
| Nora | "I weave sturdy jackets and bright scarves from valley wool and cloth." |
| Julian | "The chronicle of Sunhollow Valley fills three shelves in the Archive." |
| Rowan | "Need a coop, barn, or shed? Timbercraft Workshop builds to last." |
| Bram | "Clearwater River runs gentle, while Silverfin Coast hides the big catches." |
| Tessa | "Seeds for every season are stocked fresh at Willowbrook General Store!" |
| Orin | "The Mosskin still linger around Willowbrook Hall, waiting for kindness." |
| Dahlia | "Chickens, cows, ostriches, even rare creatures thrive with daily hay." |
| Felix | "Warm stew and a crackling hearth await at the Hearthside every evening." |

---

## 4. Crops & Seeds (16 Seasonal Crops)

4 crops per season (`js/data.js`). Each crop grows only in its matching season.

| Season | Crops (Key — Grow Days / Sell Price / Seed Price) |
|--------|----------------------------------------------------|
| Spring | `turnip` (4d / 10G / 5G), `strawberry` (6d / 24G / 12G), `potato` (5d / 16G / 8G), `cauliflower` (8d / 35G / 16G) |
| Summer | `bean` (6d / 15G / 7G), `melon` (8d / 40G / 18G), `tomato` (5d / 18G / 9G), `blueberry` (7d / 28G / 14G) |
| Autumn | `squash` (5d / 12G / 6G), `pumpkin` (8d / 42G / 20G), `corn` (6d / 22G / 10G), `cranberry` (5d / 20G / 10G) |
| Winter | `root` (7d / 18G / 8G), `frostherb` (4d / 20G / 10G), `snowdrop` (5d / 26G / 12G), `iceberry` (6d / 32G / 15G) |

**Seasonal rule:** A seed can only be planted in its matching season. Crops stop growing / do not auto-harvest when the season changes.

---

## 5. Animals & Animal Products (13 Varieties)

Supports all 13 animal types in `js/data.js`:
- **Coop (`capacity: 4`):** `chicken` (variants: white, brown, blue, void, golden → `egg`), `duck` (`duckEgg`), `rabbit` (`rabbitWool`), `dinosaur` (`dinoEgg`)
- **Barn (`capacity: 6`):** `cow` (`milk`), `ostrich` (`egg`), `goat` (`goatMilk`), `sheep` (`wool`), `pig` (`truffle`)
- **Stable (`capacity: 2`):** `horse` (mount)
- **Pets:** `cat` (`purrGift`), `dog` (`boneFind`), `turtle` (`mossShell`)

**Rules:**
- Animals must be fed daily (hay) to produce goods.
- A fed animal produces its product each morning.
- An unfed animal produces nothing that day.
- Feeding resets the `fed` flag each morning for the next cycle.

---

## 6. Buildings (Farm Structures)

| Building | Cost | Capacity | Houses | Notes |
|----------|------|----------|--------|-------|
| Coop | 40 wood, 15 stone | 4 | chicken, duck, rabbit, dinosaur | Houses poultry & small creatures |
| Barn | 80 wood, 40 stone | 6 | cow, ostrich, goat, sheep, pig | Houses livestock |
| Shed | 30 wood, 10 stone | 0 | — | General storage |
| Stable | 60 wood, 25 stone | 2 | horse | Houses riding horses |

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

## 16. Reference — Stardew Valley APK Dialogue / Story Content (extracted for comparison only)

The Stardew Valley APK (`stardew-valley-mod-1.6.15.3-an1.com.apk`, ~370 MB) stores its dialogue and story content as **XNA `.xnb` binary files** under:

- `assets/Content/Characters/Dialogue/<Name>.xnb` — per-character dialogue (660 dialogue files across locales; 52 English/default files)
- `assets/Content/Characters/Dialogue/MarriageDialogue<Name>.xnb` — marriage/romance dialogue per romanceable candidate
- `assets/Content/Strings/1_6_Strings.xnb` — general game strings (events, mail, UI text)

These are **binary XNB content files**, not plain text. REA recovered readable printable-string fragments from them (the XNB format interleaves string data with length prefixes and object references, so recovery is partial and fragmented). No full dialogue lines were reconstructed; the fragments below are shown only to illustrate the *kinds* of story/dialogue content present in the reference game.

### Observed English dialogue fragments (Abigail)
- Introductions: "Oh, that's right... I heard someone new was moving onto the old farm."
- Flower dance: "Hey, sure. Let's do it. We can be embarrassed together."
- Birthday (positive): "Thanks, @! This is so nice!"
- Disliked gift: "it's, uh... *sniff*"
- StardropTea: "Wow! ... so beautiful, like an amethyst"
- Journal: "my favorite magazine! My Dad won't let me have a subscription to get it on the black market"
- Community Center: "I snuck into the community center last night... haunted"

### Observed English dialogue fragments (Alex)
- Introduction: "Oh, hey. So you're the new guy, huh? Cool. I think we're going to get along great. I'm Alex."
- Birthday (loved): "Aw yeah, that's good stuff... Thanks for the gift, @."
- Marriage: "I never had many friends in town... I sometimes wonder how I'd end up if you moved here." / "now that I'm a married guy!"

### Observed English dialogue fragments (Caroline)
- Introduction: "Hello! You must be @, the new farmer. I'm Caroline. My husband runs the general store here. And have you met my daughter, Abigail? She's the pale one with purple hair."
- Birthday: "Thanks, sweetie. That's very kind of you to remember."

### Observed English dialogue fragments (Clint)
- Introduction: "Er... hi. I'm Clint. I'm the town blacksmith. If you ever need to upgrade your tools, I'm your guy."
- Birthday: "I don't usually get birthday gifts. This act means a lot to me, @."

### Observed English dialogue fragments (Demetrius)
- Introduction: "Greetings! I'm Demetrius, local scientist and father. Thanks for introducing yourself! I study the plants and animals from my home laboratory."

### Observed marriage-dialogue fragments (rainy-day / morning)
- Abigail: "The dark... the rain, it gets me excited."
- Alex: "With all this space, I can really achieve a full body workout."
- Elliott: "I feel inspired today... I think I'll do some writing. The sound of rain reminds me of my cabin by the beach."
- Haley: "I've changed a lot over the years, but I still prefer sunny weather."
- Harvey: "It's a myth that rainy weather causes the flu. However, take care you don't slip on the mud!"
- Leah: "I sometimes find inspiration in the most unlikely of places."

### General string fragments (1_6_Strings.xnb)
- Community Center / Wizard events, festival text, mail, and NPC-referenced dialogue tokens (e.g. "Don't touch that!", "I was thinking of joining you at the skull caves", "travel beyond Pelican Town", "cute sun...").

### Characters with dialogue files in the APK
Abigail, Alex, Caroline, Clint, Demetrius, Dwarf, Elliott, Emily, Evelyn, George, Gil, Gus, Haley, Harvey, Jas, Jodi, Kent, Krobus, Leah, Leo, Lewis, Linus, Marnie, Maru, Pam, Penny, Pierre, Robin, Sam, Sandy, Sebastian, Shane, Vincent, Willy, Wizard, plus `MarriageDialogue` files for the romanceable candidates (Abigail, Alex, Elliott, Emily, Haley, Harvey, Krobus, Leah, Maru, Penny, Sam, Sebastian, Shane) and a general `MarriageDialogue.xnb`.

### Achievements (from `Data/Achievements.xnb`)
Partial, fragmented names/descriptions recovered from the binary (illustrative only):
- Greenhorn — Earn 15,000g
- Cowpoke — 50+ (milking)
- Homesteader — (2/…)
- Millionaire — Earn 1,000,000g
- Legend — (10-…)
- A Complete Collection — donate to the museum collection
- A New Friend — Reach a 5-heart friendship level with someone
- Best Gamer — (10/…)
- The Beloved Farmer — (8 people/…)
- Cliques — (6/…)
- Popular — (2/11…)
- Cook — (… different recipes)
- Sous Chef — (…/25 recipes)
- Gourmet — (7/…)
- Moving Up — Upgrade your house (… to maximum size)
- D.I.Y. — Craft (1… items)
- Artisan — (…/30…)
- Fisherman — (… catch … fish)
- Ol' Mariner — (…/245…)
- Angler — (…/24…)
- Mother Goose — (…/64…)
- Treasure Trove — Donate (4…)
- Gofer — (… 'Help Wanted' requests)
- A Big … — (…/29…)
- Polyculture — Ship (… of p… crop/…)
- Shipper — (Mono…/2…)
- A Distant Shore — reach Ginger Island
- Two Thumbs — See a movie
- Blue Ribbon — Get 1st place in the Stardew Valley Fair competition
- An Unforgettable Soup — Delight the Governor
- Good Neighbors — (… for … grow … family …)
- Deep … — (… bottom of the … mines)

### Events (from `Data/Events/*.xnb`)
Event scripts recovered as fragmented strings (illustrative only):
- `BusStop` — Robin introduces herself as the local carpenter sent by the Mayor to show the player their new home ("Hello! You must be @. I'm Robin, the local carpenter. Mayor Lewis sent me here to fetch you and show you your new home.")
- `FarmHouse` — Grandpa's ghost appears ("My dear boy… It's been many years since we last spoke… My body has departed this world, but my heart will always remain in Stardew Valley.") followed by an evaluation and a magic hat reward.
- `CommunityCenter` — George/Morris dialogue about a sale ("This means nothing. I'll just run a 75%-off sale and all my customers will come crawling back to me, begging for forgiveness.")
- `Mine` — old mine shaft narrative text.
- `Beach` — Haley: "My bracelet is gone! I know I had it on when I got…"
- `BoatTunnel` — Willy: "Aye… a sad sight, isn't she?" (boat repair)
- `AbandonedJojaMart` — `missingBundleComplete` / Junimo event at Community Center ("All the others made it back, except me… Now I can go home, too. Thank you!")
- `DesertFestival` — `PlayerKilled` / `showItemsLost` event template.
- Plus events at: AnimalShop, ArchaeologyHouse, Backwoods, BathHouse_Pool, DesertFestival, ElliottHouse, Farm, FishShop, Forest, HaleyHouse, HarveyRoom, Hospital, Island*, JoshHouse, LeahHouse, ManorHouse, Mountain, QiNutRoom, Railroad, Saloon, SamHouse, SandyHouse, ScienceHouse, SebastianRoom, SeedShop, Sewer, Sunroom, Temp, Tent, Town, Trailer, WizardHouse, Woods.

### Quests / Help Wanted (from `Data/Achievements.xnb` + `1_6_Strings.xnb`)
- `Gofer` achievement — complete "'Help Wanted' requests" (quests posted on the bulletin board outside Pierre's shop).
- `Treasure Trove` — donate items to the museum.
- Events reference `Quest 21` (AnimalShop caviar/vegetable delivery quest) and quest-related state flags (e.g. `addWorldState`).

### Main Storyline Arcs (reference only)
- **Arrival:** Player inherits a farm; Robin (carpenter) welcomes them at the bus stop and shows them their new home.
- **Grandpa's Ghost:** On the 2nd (or 3rd) year anniversary, Grandpa's spirit appears to evaluate the player's farm and may reward a Magic Hat.
- **Community Center / Junimos:** Restoring the Community Center involves Junimo events and bundle completion; an abandoned JojaMart storyline exists in parallel.
- **Mine:** The old mine shaft is a recurring story location with associated events.

### Use for Valley Life
This APK content is a **reference/comparison only**. Per AGENTS.md rules #3 and #4, all Valley Life dialogue, characters, and place names are written from scratch and renamed — nothing from the APK is copied into `js/game.js` or `content.md`.

---

## 17. Marriage & Family (Valley Life)

- Marry any eligible (marriageable) villager **of a different gender than the player**, once relationship points reach 10.
- After marriage, the spouse is set and can help with daily farm chores (waters at least one crop during the night).
- A married couple may choose to have children; choosing to have a child adds a child to the player's household.

---

## 18. Source Notes

- `js/game.js` — all constants, data definitions, and game logic (original code, written from scratch).
- `SPEC.md` — feature specification, tests, 3-part build plan, and Stardew Valley APK study (static inspection only; animals/buildings/dialogue categories confirmed from the shipped APK content layout).
- `features.md` — human-readable feature list derived from SPEC.md.
- `AGENTS.md` — project rules: original code only, renamed characters/places, one test per feature, 3-part build plan, commit all work to Git.

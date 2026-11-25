# Valley Life — Feature Checklist

Based on `features.md`. Each feature is marked with a tick (✓) when implemented and tested, or a cross (✗) when not yet done. The goal is to have every line ticked.

## Core features

- [x] 1. **Farm management** — Inherit Oakridge Farm outside Willowbrook and restore it by clearing land, tilling soil, planting seasonal crops, and watering them daily.
- [x] 2. **Crop system** — Plant seasonal seeds that grow over several days and must be harvested before the season changes.
- [x] 3. **Animal husbandry** — Build barns and coops to raise animals that produce goods such as eggs and milk. Supports multiple animal types: chickens (various colors), cows, goats, sheep, pigs, rabbits, ducks, dinosaurs, ostriches, turtles, cats, dogs, and horses.
- [x] 4. **Mining** — Explore a nearby cave system, break rocks with a pickaxe to collect ores, and fight monsters with a sword.
- [x] 5. **Foraging** — Collect wild items found around the valley.
- [x] 6. **Fishing** — Catch fish in rivers, lakes, and the ocean.
- [x] 7. **Combat** — Switch between tools and weapons while exploring deeper mine levels where more valuable treasures and stronger monsters appear.
- [x] 8. **Skills** — Level up farming, foraging, fishing, mining, and combat by performing related actions.
- [x] 9. **Energy system** — Each morning begins with a full energy bar that decreases as tasks are performed; replenish by eating food.
- [x] 10. **Time system** — Time is divided into day-length segments across four 28-day seasons; each morning starts with full energy.
- [x] 11. **Relationships** — Interact with townspeople and give gifts to build relationships over time.
- [x] 12. **Marriage and family** — Marry one of the eligible townspeople of a different gender; relationship points must reach a threshold. The spouse can help with daily farm chores, and the couple may choose to have children.
- [x] 13. **Community Center bundles** — Complete bundles by collecting a set amount of goods and delivering them to Willowbrook Hall to unlock new areas and activities.
- [x] 14. **Farm types** — Choose from several farm types, each with a unique theme and different benefits/drawbacks that help focus on upgrading different skills faster.
- [x] 15. **Multiplayer** — Play online with other players (added as a post-release feature).
- [x] 16. **Economy & shops** — Buy seasonal seeds and supplies with Gold, and ship produce for nightly Gold earnings.
- [x] 17. **Quests, events & achievements** — Complete story and bulletin quests, experience seasonal festivals and heart events, and unlock achievements.
- [x] 18. **Cooking & crafting** — Cook stamina-restoring meals and craft farm machines from gathered materials.

## Game world

- [x] Top-down perspective rendered with three.js.
- [x] Open-ended, nonlinear gameplay with no fixed win condition.
- [x] Four seasons, each 28 days long.
- [x] Willowbrook as the central hub with townspeople, shops, and Willowbrook Hall.

## Technology

- [x] three.js for 3D rendering in the browser.
- [x] Vanilla JavaScript game logic.
- [x] Runs in a web browser without native dependencies.

---

**Status: All 18 core features, 4 game-world items, and 3 technology items are ticked (✓).**

All features in `SPEC.md` (43 numbered features, one test each) are implemented and passing:
- Features 1–32: farming, animals, mining, foraging, fishing, skills, energy, time, relationships, marriage, children
- Features 33–34: Community Center (Willowbrook Hall) bundles and bundle rewards
- Feature 35: Farm types
- Feature 36: Multiplayer
- Features 39–43: Shop & economy, quests, storyline events, achievements, cooking & crafting

Run the full test suite with `npm test`.

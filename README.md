![](https://img.shields.io/github/license/WhiteMinds/trial-tower) ![](https://img.shields.io/github/languages/top/WhiteMinds/trial-tower) ![](https://img.shields.io/npm/v/hedra-engine?label=hedra-engine) ![](https://img.shields.io/bundlephobia/minzip/hedra-engine)

<div align="center">
  <div align="center">
    <img
      src="https://user-images.githubusercontent.com/9160743/233787310-f1cf857a-4b8a-4848-94c3-2533e6ff7ff8.svg"
      alt="Logo"
      width="240"
    />
  </div>
  <div align="center">
    English
    ·
    <a href="README-zh.md">
      简体中文</a
    >
  </div>
  <br />
  <div align="center">
    <a href="#-trial-tower">View Demo</a>
    ·
    <a href="https://github.com/WhiteMinds/trial-tower/issues"
      >Report Bug</a
    >
    ·
    <a href="https://github.com/WhiteMinds/trial-tower/issues"
      >Request Feature</a
    >
  </div>
</div>

## ✨ Hedra Engine

`hedra-engine` is an RPG turn-based auto-battle engine with an easily extensible and highly customizable plugin system for idle games, games that automate the battle process, and more.

It is still under development and the API is subject to change at any time, please do not use it in production environment.

⭐ Star me on GitHub — it motivates me a lot!

### Example

```typescript
import * as Hedra from 'hedra-engine'

const store: Hedra.Store<number> = {
  async createData<T extends { id?: number }>(data: T) {
    return createGameData(omit(data, 'id')) as T & { id: number }
  },
  async setData(key, data) {
    gameDataMap[key] = omit(data, 'id')
  },
  async getData<T extends { id: number }>(key: number) {
    const data = gameDataMap[key]
    return data ? (data as T) : null
  },
  ...
}
const engine = new Hedra.Engine(store, [achievementPlugin])

const character = await engine.createCharacter(
  { name: 'test' },
  async stage => stage.createNewPlayerEntity('test'),
)
const player = await engine.mainStage.getEntity(character.entityId)
const enemy1 = engine.mainStage.createRandomEnemyByPlayerLevel(player)
const enemy2 = engine.mainStage.createRandomEnemyByPlayerLevel(player)
engine.mainStage.beginCombat(player, [enemy1, enemy2])
```

<details>
  <summary>Click to see the battle process after formatting</summary>
  <br/>

```
# Start the battle, team info:

## Team #1 members:

### WhiteMind：

[LV.1] Normal Attack (Physical): Deals 1 _ atk of damage to a single target, with the ability to add attack effects
[LV.1] Full Concentration: Next 3 attacks deal 100% more damage
[LV.1] Group Fireball: Deals 1 _ atk damage to 2 targets
[LV.2] Rapid Combo: Deals 0.8 \* atk damage to a single target 2 to 6 times, with additional attack effects
[LV.2] Physique Enhancement: Increase Physique by 20%.
[LV.1] Soul Reaper: Boosts maximum life by 1 point for each monster killed, current boost: 10
====== Wooden Sword ======
Level requirement: 1

Attack +1
====== Cloth armor ======
Level requirement: 1

Constitution +5
Maximum life +10%

Calculated Attack Value: 3
Calculated life value: 121

## Team #2 members:

### 🐻️：

[LV.1] Normal Attack (Physical): Deals 1 _ atk of damage to a single target, with the ability to add attack effects

Calculated Attack Value: 2
Calculated life value: 40

### 🐒️：

[LV.1] Normal Attack (Physical): Deals 1 _ atk of damage to a single target, with the ability to add attack effects
[LV.1] Rapid Combo: Deals 0.8 \* atk damage to a single target 2 to 5 times, with additional attack effects

Calculated Attack Value: 2
Calculated life value: 20

[WhiteMind] casting [Rapid Combo] to [🐻️], Deals 2,2,2,2,2 damage, 30 hp remaining
[🐻️] casting [Normal Attack (Physical)] to [WhiteMind], Deals 2 damage, 119 hp remaining
[🐒️] casting [Normal Attack (Physical)] to [WhiteMind], Deals 2 damage, 117 hp remaining
[WhiteMind] casting [Group Fireball] to [🐻️,🐒️], Deals 3,3 damage
[🐻️] casting [Normal Attack (Physical)] to [WhiteMind], Deals 2 damage, 115 hp remaining
[🐒️] casting [Rapid Combo] to [WhiteMind], Deals 1,1,1,1,1 damage, 110 hp remaining
[WhiteMind] casting [Rapid Combo] to [🐻️], Deals 2,2 damage, 23 hp remaining
[🐻️] casting [Normal Attack (Physical)] to [WhiteMind], Deals 2 damage, 108 hp remaining
[🐒️] casting [Rapid Combo] to [WhiteMind], Deals 1,1 damage, 106 hp remaining
[WhiteMind] casting [Normal Attack (Physical)] to [🐻️], Deals 3 damage, 20 hp remaining
[🐻️] casting [Normal Attack (Physical)] to [WhiteMind], Deals 2 damage, 104 hp remaining
[🐒️] casting [Normal Attack (Physical)] to [WhiteMind], Deals 2 damage, 102 hp remaining
[WhiteMind] casting [Full Concentration]
[🐻️] casting [Normal Attack (Physical)] to [WhiteMind], Deals 2 damage, 100 hp remaining
[🐒️] casting [Rapid Combo] to [WhiteMind], Deals 1,1,1,1 damage, 96 hp remaining
[WhiteMind] casting [Group Fireball] to [🐻️,🐒️], Deals 6,6 damage
[🐻️] casting [Normal Attack (Physical)] to [WhiteMind], Deals 2 damage, 94 hp remaining
[🐒️] casting [Rapid Combo] to [WhiteMind], Deals 1,1 damage, 92 hp remaining
[WhiteMind] casting [Normal Attack (Physical)] to [🐻️], Deals 6 damage, 8 hp remaining
[🐻️] casting [Normal Attack (Physical)] to [WhiteMind], Deals 2 damage, 90 hp remaining
[🐒️] casting [Normal Attack (Physical)] to [WhiteMind], Deals 2 damage, 88 hp remaining
[WhiteMind] killed [🐻️], loots: [{…}]
[WhiteMind] casting [Rapid Combo] to [🐻️], Deals 2,2,2,2,2 damage, 0 hp remaining
[🐒️] casting [Rapid Combo] to [WhiteMind], Deals 1,1,1,1,1 damage, 83 hp remaining
[WhiteMind] killed [🐒️], loots: [{…}]
[WhiteMind] casting [Rapid Combo] to [🐒️], Deals 2,2,2,2,2,2 damage, -1 hp remaining
Battle Victory, loots: (2) [{…}, {…}]
[WhiteMind] Level up to LV.2
```

</details>

<br />

## 🕹 Trial Tower

Trial Tower is a subproject of the repository, which is used to demonstrate the development of Hedra Engine, a turn-based combat RPG with text-based combat.

Since the main focus is currently on hedra-engine, the server and web parts of this subproject will be written in the early stages and refined later.

## 🚀 Usage

Just run the following command

```shell
yarn start
```

### Screenshot

![Snapshot](https://user-images.githubusercontent.com/9160743/222956665-579fc30e-213a-4a58-ae9c-210707ebce72.png)

<br />

## 🗓 Q2 2023 RoadMap

https://github.com/users/WhiteMinds/projects/1/views/1

See the [open issues](https://github.com/WhiteMinds/trial-tower/issues) for a full list of proposed features (and known issues).

## 🤓 Contact

Bilibili: [@WhiteMind](https://space.bilibili.com/23505769)

E-mail: whitemind@qq.com

## 📝 License

Copyright © 2023 [WhiteMinds](https://github.com/WhiteMinds).

This project is [MIT](https://github.com/WhiteMinds/trial-tower/blob/master/LICENSE) licensed.

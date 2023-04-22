![](https://img.shields.io/github/license/WhiteMinds/trial-tower) ![](https://img.shields.io/github/languages/top/WhiteMinds/trial-tower) ![](https://img.shields.io/github/repo-size/WhiteMinds/trial-tower) ![](https://img.shields.io/github/contributors/WhiteMinds/trial-tower)

<div align="center">
  <div align="center">
    <img
      src="https://user-images.githubusercontent.com/9160743/233787310-f1cf857a-4b8a-4848-94c3-2533e6ff7ff8.svg"
      alt="Logo"
      width="240"
    />
  </div>
  <div align="center">
    <a href="README.md">
      English</a
    >
    ·
    简体中文
  </div>
  <br />
  <div align="center">
    <a href="#-trial-tower">查看 Demo</a>
    ·
    <a href="https://github.com/WhiteMinds/trial-tower/issues"
      >Bug 反馈</a
    >
    ·
    <a href="https://github.com/WhiteMinds/trial-tower/issues"
      >功能建议</a
    >
  </div>
</div>

## ✨ Hedra Engine

`hedra-engine` 是一个 RPG 回合制自动战斗引擎，具有一套易扩展、高可定制的插件系统，适用于 idle game、自动执行战斗过程的游戏等。

目前仍处于开发阶段，API 随时可能发生变化，请不要用于生产环境。

⭐ Star 此项目来支持我的开发!

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
  <summary>点击查看格式化后的战斗过程</summary>
  <br/>

```
# 开始战斗，队伍信息：

## 1 号队伍成员：

### WhiteMind：

[LV.1] 普通攻击（物理）: 对单体目标造成 1 _ atk 的伤害，可附加攻击特效
[LV.1] 全神贯注: 下 3 次攻击伤害提升 100%
[LV.1] 群体火球术: 对 2 个目标造成 1 _ atk 的伤害
[LV.2] 快速连击: 对单体目标造成 2 ~ 6 次的 0.8 \* atk 的伤害，可附加攻击特效
[LV.2] 体质强化: 提升 20% 的体质
[LV.1] 灵魂收割者: 每击杀一个怪物，提升 1 点最大生命值，当前提升：10
====== 木剑 ======
等级需求：1

攻击 +1
====== 布甲 ======
等级需求：1

体质 +5
最大生命值 +10%
计算后的攻击值： 3
计算后的生命值： 121

## 2 号队伍成员：

### 🐻️：

[LV.1] 普通攻击（物理）: 对单体目标造成 1 \* atk 的伤害，可附加攻击特效

计算后的攻击值： 2
计算后的生命值： 40

### 🐒️：

[LV.1] 普通攻击（物理）: 对单体目标造成 1 _ atk 的伤害，可附加攻击特效
[LV.1] 快速连击: 对单体目标造成 2 ~ 5 次的 0.8 _ atk 的伤害，可附加攻击特效

计算后的攻击值： 2
计算后的生命值： 20
[WhiteMind] 对 [🐻️] 释放 [快速连击]，造成 2、2、2、2、2 伤害，剩余 hp 30
[🐻️] 对 [WhiteMind] 释放 [普通攻击（物理）]，造成 2 伤害，剩余 hp 119
[🐒️] 对 [WhiteMind] 释放 [普通攻击（物理）]，造成 2 伤害，剩余 hp 117
[WhiteMind] 对 [🐻️、🐒️] 释放 [群体火球术]，造成 3、3 伤害
[🐻️] 对 [WhiteMind] 释放 [普通攻击（物理）]，造成 2 伤害，剩余 hp 115
[🐒️] 对 [WhiteMind] 释放 [快速连击]，造成 1、1、1、1、1 伤害，剩余 hp 110
[WhiteMind] 对 [🐻️] 释放 [快速连击]，造成 2、2 伤害，剩余 hp 23
[🐻️] 对 [WhiteMind] 释放 [普通攻击（物理）]，造成 2 伤害，剩余 hp 108
[🐒️] 对 [WhiteMind] 释放 [快速连击]，造成 1、1 伤害，剩余 hp 106
[WhiteMind] 对 [🐻️] 释放 [普通攻击（物理）]，造成 3 伤害，剩余 hp 20
[🐻️] 对 [WhiteMind] 释放 [普通攻击（物理）]，造成 2 伤害，剩余 hp 104
[🐒️] 对 [WhiteMind] 释放 [普通攻击（物理）]，造成 2 伤害，剩余 hp 102
[WhiteMind] 释放 [全神贯注]
[🐻️] 对 [WhiteMind] 释放 [普通攻击（物理）]，造成 2 伤害，剩余 hp 100
[🐒️] 对 [WhiteMind] 释放 [快速连击]，造成 1、1、1、1 伤害，剩余 hp 96
[WhiteMind] 对 [🐻️、🐒️] 释放 [群体火球术]，造成 6、6 伤害
[🐻️] 对 [WhiteMind] 释放 [普通攻击（物理）]，造成 2 伤害，剩余 hp 94
[🐒️] 对 [WhiteMind] 释放 [快速连击]，造成 1、1 伤害，剩余 hp 92
[WhiteMind] 对 [🐻️] 释放 [普通攻击（物理）]，造成 6 伤害，剩余 hp 8
[🐻️] 对 [WhiteMind] 释放 [普通攻击（物理）]，造成 2 伤害，剩余 hp 90
[🐒️] 对 [WhiteMind] 释放 [普通攻击（物理）]，造成 2 伤害，剩余 hp 88
[WhiteMind] 击杀了 [🐻️]，战利品： [{…}]
[WhiteMind] 对 [🐻️] 释放 [快速连击]，造成 2、2、2、2、2 伤害，剩余 hp 0
[🐒️] 对 [WhiteMind] 释放 [快速连击]，造成 1、1、1、1、1 伤害，剩余 hp 83
[WhiteMind] 击杀了 [🐒️]，战利品： [{…}]
[WhiteMind] 对 [🐒️] 释放 [快速连击]，造成 2、2、2、2、2、2 伤害，剩余 hp -1
战斗胜利，战利品： (2) [{…}, {…}]
[WhiteMind] 升级至 LV.2
```

</details>

<br />

## 🕹 Trial Tower

试炼之塔是该仓库的一个子项目，该项目用于对 Hedra Engine 的开发示范，是一个通过文本展示战斗过程的放置类回合战斗 RPG 游戏。

由于目前的主要重点在 hedra-engine 上，所以该子项目的 server 和 web 部分前期会先糊着写，以后再精修。

## 🚀 使用方法

只需运行以下命令

```shell
yarn start
```

### 运行截图

![Snapshot](https://user-images.githubusercontent.com/9160743/222956665-579fc30e-213a-4a58-ae9c-210707ebce72.png)

<br />

## 🗓 Q2 2023 开发路线图

https://github.com/users/WhiteMinds/projects/1/views/1

访问 [open issues](https://github.com/WhiteMinds/trial-tower/issues) 来了解拟议功能以及已知问题的完整列表。

## 🤓 联系方式

Bilibili: [@WhiteMind](https://space.bilibili.com/23505769)

E-mail: whitemind@qq.com

## 📝 License

Copyright © 2023 [WhiteMinds](https://github.com/WhiteMinds).

This project is [MIT](https://github.com/WhiteMinds/trial-tower/blob/master/LICENSE) licensed.

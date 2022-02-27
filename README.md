# text-game-engine

文字游戏引擎的一些想法和 demo 尝试

## 当前的一些效果展示：

```javascript
const engine = new Engine(character)
const player = engine.mainStage.getPlayer()
const enemy1 = engine.mainStage.createRandomEnemyByPlayerLevel(player)
const enemy2 = engine.mainStage.createRandomEnemyByPlayerLevel(player)
engine.mainStage.beginCombat(player, [enemy1, enemy2])
```

```markdown
[vite] connecting...
[vite] connected.

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

# trial-tower

试炼之塔，通过文本展示战斗过程的放置类回合战斗 RPG 游戏。

同时包含一个 RPG 回合制自动战斗引擎，适用于 idle game、文本展示战斗过程游戏等。

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

[LV.1] 普通攻击（物理）: 对单体目标造成 1 * atk 的伤害，可附加攻击特效
[LV.1] 全神贯注: 下 3 次攻击伤害提升 100%
[LV.1] 群体火球术: 对 2 个目标造成 1 * atk 的伤害
[LV.2] 快速连击: 对单体目标造成 2 ~ 6 次的 0.8 * atk 的伤害，可附加攻击特效
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

[LV.1] 普通攻击（物理）: 对单体目标造成 1 * atk 的伤害，可附加攻击特效

计算后的攻击值： 2
计算后的生命值： 40

### 🐒️：

[LV.1] 普通攻击（物理）: 对单体目标造成 1 * atk 的伤害，可附加攻击特效
[LV.1] 快速连击: 对单体目标造成 2 ~ 5 次的 0.8 * atk 的伤害，可附加攻击特效

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

## RoadMap

- [x] MainStage.getPlayer 的方式对外界提供角色状态
- [x] currentHP 在主场景跟着 maxHP 走，在战斗场景则特殊处理
- [x] 普攻先直接作为一个特殊的技能处理

1.  去掉普攻的概念，直接为斗殴之类的基础技能，每个职业必有，并且具有不被沉默的特效（可以被缴械？）

- [x] 先选定了技能（随机或策略），再自动选择释放目标，所以目标的选择是由技能完成的
- [x] 尝试完成 Buff，Buff 对属性的修改本质上也是一种 effect？但还有其他的功能，持续性的提供 effects
- [x] 实现技能等级的影响，包括产生的 buff 属性变化
- [x] 实现一个百分比增长属性的被动技能，包括 MainStage
- [x] 实现一个简单的技能展示列表
- [x] 实现具有额外数据与序列化格式的的技能
- [x] 实现群攻技能
- [x] 完善技能释放限制，被动技能不该选中
- [x] 实现简单的装备

  1. 大部分装备都可以不实现独立的类，而是用数据 + 基础类，只有特定 templateId 的才提供特殊实现类。
     因为装备本身一般是提供属性（或技能）加成，功能比较一致。
     这减少了开发成本，但可能导致未来的灵活性降低，是否值得？
     如果是为了减少文件的创建，可以将同类型（代码相近）的装备放在一个文件处理？

- [x] 实现战利品（可以在 kill 阶段处理）

  1. 如果不想做一个新的 Monster model 来存放战利品生成器，可以考虑放在 stage 上，
     如 stage.setLootConfigs

- [x] 实现怪物表

  1. 玩家不能切换地图，但是可以切换难度，高难度更容易遇到带增益前缀的怪物

  2. 生成的怪物的等级与玩家等级一致（或者也可以切换怪物等级范围），怪物模板将决定各个属性与玩家等级的关联性，以及持有的技能，掉落表等

- [x] 实现经验值升级系统
- [x] 简单的实现战斗日志

  - [x] 各个可变类提供 snapshot 的能力
  - [x] 需要设计一套灵活的战斗消息数据格式
    1. [`%0 释放技能 %1，对 %2 造成 %3 伤害`, entity1, skill, entity2, DamageEffect]
       这种格式可以让各个系统可以自由定制系统消息，并且消息的消费者可以拿到每个可变类的完整 snapshot，满足了目前的需求。
       1. 使用 %数字 与 %entity、%skill、%effect 的区别在于：
          1. `%数字` 可以复用数据字段，并且在消息创建阶段会节省一部分心智
          2. `%类型` 可以免去数据类型的识别（对于精细类型应该还是需要识别）
          3. 可以通过 `%数字$类型` 的方式来结合使用
       2. 可以再加一些控制字符，比如 %c$red 来控制颜色？或者 %\* 来表示突出显示的。
          或者创建一个 TextSnapshot、StyledText 类型，里面附加一些关于字符串元信息。
       3. 怎么处理 `%数字` 后面粘连数字时的识别
          1. 可以有一个特殊的终止符，比如 `%0.`
          2. 可以更换成 `{0}`
       4. 尾部可以提供一个附加的 obj 来提供额外数据，比如当 skill 要提供 owner 时，防止循环引用，可以在 snapshot 内仅记录 entity.id，将 entity 数据置于额外的 obj 内。
          或者看看有没有什么更好的序列化与反序列化循环引用对象的方案。
    2. 为什么不是 `[entity1, '释放技能', skill, '，对', entity2, '造成', DamageEffect, '伤害']`

- [x] 如何让 DamageEffect 触发的 kill 日志在 skill 释放日志之后再显示
  1. 让 effect.cast 发生在技能释放日志之后，这会导致技能释放日志如果想要记录伤害就需要在 cast 之前就计算伤害值。
  2. 让 kill 的日志（包括判定？）延迟到回合尾部，这样可以让一次 effect 造成的连锁反应都输出完成后再输出 kill。并且不会像方案 1 那样对开发过程造成额外影响。
     但这样会导致击杀不能及时的提示，比如几次随机攻击，不知道死于哪一次伤害。
  3. 等待 cast 完成，然后将技能释放日志塞到它应该在的位置。这可能是一个比较好的方案？
     或者先塞进去释放日志，然后等 cast 完成后再修改这条日志的数据，本质上和上述方案差不多。
- [x] 实现装备附加技能，需要 skills 的 modifier
- [x] 实现技能的计数器，比如每使用技能击杀 10 个怪物，就会成长一点能力
- [x] 实现一个召唤类技能
- [x] 实现一个简单的 UI
- [x] 实现战利品的 Snapshot & UI
- [x] 实现 entity buff 的 snapshot，并展示到 entity 卡片
- [x] 实现玩家仓库
- [x] 实现装备栏 UI
- [x] 实现玩家仓库 UI
- [x] 实现数据保存
- [ ] 支持 C / S 模式，本地单人游玩时也采用模拟 Server
  1. 升级到 yarn v3，使用更完善的 workspace 特性
  2. 回合制自动战斗引擎命名
     1. 暂定为 Hedra（意指多面体）
  3. 拆分出多个包实现
     1. common（一些通用的类型、model）
     2. hedra-engine（默认基于 memory 存储）
     3. trial-tower-http-server
        1. 应该优先实现这个 server，这比 local-server 更适合探索方向，因为它的数据空间和浏览器是分离的，不容易在开发时漏掉一些情况。
        2. 数据库暂定用 mysql，ORM 用 sequelize，尽量实现类型完整、表的版本前进后退
     4. trial-tower-local-server（基于 indexedDB 或者一些其他的浏览器存储方案）
     5. trial-tower-web-interface
  4. hedra-engine 需要支撑基于多种存储的实现
     1. 一个引擎实例是否应该只负责一个玩家角色实例。
        1. 单角色实例的话，在角色登出或长期无请求时做卸载比较简单。
        2. 这意味着引擎不能在启动时全量加载了，除非单角色对应的数据单独存储。
        3. 排行榜、玩家对战等多角色实例的场景怎么实现？
           1. 排行榜可能应该在进一步封装的引擎（trial-tower-engine 之类的？）中实现
        4. 短期内来看应该做成单引擎装载全部角色实例，性能优化可以放到以后再做
     2. 引擎实例需要角色 id（一个特殊的 entity id？）、存储实现
        1. 多玩家实例的情况下，不需要角色 id，应该是引擎的调用方持有玩家角色对应的实体 id
           1. 引擎内部应该要能识别出角色实体？维护一个玩家实体列表？
     3. 由于序列化的性能影响，不适合每次 update 都全量更新持久化数据，应该只存储变化了的数据（dirty 的）。
        即使是不在 update 时做持久化，而是放到 engine.destory 时，也最好是仅更改变化了的数据。
        实现了脏数据的机制后，也更容易对 client 做推送了。
     4. 看看有没有更好的 item 替代单词，现在这个容易混淆。现在是 GameData 了。
     5. Server.createCharacter -> Engine.createCharacter -> ServerStore.createCharacter
        如果 Server 想要传递 userId 给 ServerStore，有几种方向
        1. Engine 涉及到 Store 的部分与 Store 的所有函数都允许传递一个 context 之类的 unkown 类型的数据，原样交付给 Store 的实现。这个影响比较大。
        2. Character 脱离 Engine 的领域，作为一个 Server 端的对象，通过 entityId 对应到实际的 Engine.Player 实例。
        3. Character 的关系设计为允许 userId 为空，创建完成后再由 Server 手动绑定给 User。
        4. 目前看起来第 3 个方案影响最小最容易实现？
     6. 现在 Store 的异步会扩散到各个相关的地方，比如 stage.createEntity、skill.use（里面调用了召唤创建实体）、Entity.deserialize（调用了 stage.getItem），有没有什么比较好的处理方案
        1. CombatStage 所需要的数据应该都已经加载在缓存了，可以单独将 CombatStage 的 API 设计成非异步的。
           但这样之后可能会出现部分数据没加载在缓存的情况，需要设计预加载相关的能力。
        2. StoreInterface 不再接受异步 API，数据的创建、更新由 StoreImpl 自己做队列慢慢完成，但是 get 如何处理？
        3. 看起来是不可规避的，只能接受异步或者使用预加载，但预加载的方案有较大的开发成本，并且会导致一些框架上的设计受限，所以还是准备接受异步扩散。
           之后做新的引擎时再考虑如何设计成大部分非同步的 API。
- [ ] 实现构建流程
  1. 非发布包（server、web）可以试试 esbuild 构建
- [ ] 实现一个简单的成就系统 + 新手上路（任意怪物击杀 \* 1）成就
  1. 这需要让 MainStage 能够知道 kill event，最好能够更通用的知道 skill event 等
     1. 可以为所有需要让 MainStage 知道的信息，创建特定的事件，比如：
        CombatStage.events = [KillEvent, SkillEvent]
        这个方案下，过多的定制化会导致 event 膨胀，如果一个技能想要记录它所消耗的魔力数值怎么处理？
        1. 或许技能需要的特殊数据，应该记录在它本身，在战斗结束后，统一的提取技能信息通过 skill.upgradeStats(skillFromCombatStage) 之类的方式来做统计。
           成就系统也可以用类似的方案，在 CombatStage 初始化一个实例，结束后由 MainStage 来做合并。
     2. 提供一个机制可以让外部直接 hook 进 CombatStage 的生命周期，比如 onKill，其实有点类似于 EventEmitter 的感觉，都是基于 callback 的形式。
        但 callback 会导致调用的时机和产生的结果没那么可控，比如调用 callback 之后进入统计，然后战斗过程因为一些原因终止了（比如报错了），应该回滚 callback 的改动，这意味着 callback 要提供 unsub 之类的。最好还是能直接将整个统计的过程放在战斗完全结束之后。

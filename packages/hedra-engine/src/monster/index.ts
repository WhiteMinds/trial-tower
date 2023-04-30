import { sample } from 'lodash'
import { Entity } from '../model/entity'
import { FastContinuousHit } from '../model/skill/active/FastContinuousHit'
import { Fireballs } from '../model/skill/active/Fireballs'
import { PhysicalAttack } from '../model/skill/active/PhysicalAttack'
import { MainStage, Stage } from '../stage'
import { LootType } from '../stage/types'

interface RandomOpts {
  level: number
  difficulty?: number
}

export async function createRandomEnemy(stage: MainStage, opts: RandomOpts): Promise<Entity> {
  const { level, difficulty = 1 } = opts

  const template = sample(templates)
  if (template == null) throw new Error('assert template')

  const entity = await stage.createEntity({
    name: template.name,
    level,
    maxHP: 10 + level * 5,
    atk: 1 + Math.round(level / 4),
    speed: 10,
  })
  entity.addSkill(new PhysicalAttack(stage))
  template.mutation?.(entity, stage, opts)

  // TODO: 根据 difficulty 不同，提升赋予增益前缀（特殊的 buff 或被动技能）的概率

  return entity
}

interface MonsterTemplate {
  name: string
  mutation?: (entity: Entity, stage: MainStage, opts: RandomOpts) => void
}

const templates: MonsterTemplate[] = [
  {
    name: '🦊',
    mutation(entity, stage) {
      entity.addSkill(new Fireballs(stage))
      // stage.setLootGenerator(entity.id, stage => {
      //   const item = new TomeOfKnowledge(stage)
      //   // TODO: 这里有坑，没使用 registerItem 返回的 item，而是用了一个临时对象
      //   stage.registerItem(item)
      //   return [
      //     { type: LootType.EXP, payload: 10 },
      //     { type: LootType.Item, payload: item },
      //   ]
      // })
    },
  },
  {
    name: '🐒️',
    mutation(entity, stage) {
      entity.addSkill(new FastContinuousHit(stage))
      stage.setLootGenerator(entity.id, () => {
        return [{ type: LootType.EXP, payload: 10 }]
      })
    },
  },
  {
    name: '🐻️',
    mutation(entity, stage) {
      entity.maxHP.base *= 2
      // stage.setLootGenerator(entity.id, () => {
      //   const item = new ClothArmor(stage)
      //   stage.registerItem(item)
      //   return [
      //     { type: LootType.EXP, payload: 100 },
      //     { type: LootType.Item, payload: item },
      //   ]
      // })
    },
  },
]

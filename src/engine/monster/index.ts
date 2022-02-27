import { sample } from 'lodash-es'
import { Entity } from '../model/entity'
import { TomeOfKnowledge } from '../model/item/Item'
import { FastContinuousHit } from '../model/skill/active/FastContinuousHit'
import { Fireballs } from '../model/skill/active/Fireballs'
import { PhysicalAttack } from '../model/skill/active/PhysicalAttack'
import { MainStage, Stage } from '../stage'
import { LootType } from '../stage/types'

interface RandomOpts {
  level: number
  difficulty?: number
}

export function createRandomEnemy(stage: MainStage, opts: RandomOpts): Entity {
  const { level, difficulty = 1 } = opts

  const template = sample(templates)
  if (template == null) throw new Error('assert template')

  const entity = stage.createEntity({
    name: template.name,
    level,
    maxHP: 10 + level * 10,
    atk: 1 + level,
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
      stage.setLootGenerator(entity.id, (stage) => {
        const item = new TomeOfKnowledge(stage)
        stage.registerItem(item)
        return [
          { type: LootType.EXP, amount: 10 },
          { type: LootType.Item, item },
        ]
      })
    },
  },
  {
    name: '🐒️',
    mutation(entity, stage) {
      entity.addSkill(new FastContinuousHit(stage))
      stage.setLootGenerator(entity.id, () => {
        return [{ type: LootType.EXP, amount: 10 }]
      })
    },
  },
  {
    name: '🐻️',
    mutation(entity, stage) {
      entity.maxHP.base *= 2
      stage.setLootGenerator(entity.id, () => {
        return [{ type: LootType.EXP, amount: 20 }]
      })
    },
  },
]

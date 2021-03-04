import { Equip } from './model/equip'

export const EquipStore: Record<Equip['id'], Equip> = {
  '0': {
    id: 0,
    name: '木剑',
    atk: { source: 'item-0', add: 1 },
  },
  '1': {
    id: 1,
    name: '布衣',
    maxHP: { source: 'item-1', add: 10 },
  },
}

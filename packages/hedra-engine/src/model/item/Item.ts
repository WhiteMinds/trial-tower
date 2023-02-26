import { ItemTemplateMap } from '.'
import { Stage } from '../../stage'
import { UniqueId } from '../../types'
import { createUniqueId } from '../../utils'
import { Entity } from '../entity'
import { ItemTemplateId } from './ItemTemplateId'

export class Item {
  // 该属性会在初始化时被自动处理，所以都默认给 Base 就行
  static templateId = ItemTemplateId.Base
  get templateId() {
    return (this.constructor as typeof Item).templateId
  }

  id: UniqueId = createUniqueId()
  protected owner?: Entity

  get name() {
    return 'BaseItem'
  }
  get description() {
    return 'BaseItem'
  }

  readonly canStacked: boolean = true
  readonly maxStackCount = 64
  stacked = 1

  constructor(public stage: Stage) {}

  createSnapshot(): Item.Snapshot {
    return {
      snapshotType: 'Item',
      id: this.id,
      templateId: this.templateId,
      name: this.name,
      description: this.description,
      stacked: this.stacked,
    }
  }

  serialize(): Item.Serialized {
    return {
      id: this.id,
      templateId: this.templateId,
      stacked: this.stacked,
    }
  }

  deserialize(data: Item.Serialized): void {
    this.id = data.id
    this.stacked = data.stacked
  }

  static deserialize(data: Item.Serialized, stage: Stage): Item {
    const hasCustomDeserialize =
      ItemTemplateMap[data.templateId].deserialize !== this.deserialize
    if (hasCustomDeserialize) {
      return ItemTemplateMap[data.templateId].deserialize(data, stage)
    }

    const item = new ItemTemplateMap[data.templateId](stage)
    item.deserialize(data)
    return item
  }

  dirty() {
    this.stage.dirty(this)
  }

  canUse(): boolean {
    return false
  }

  // 生命周期

  onCasted(entity: Entity) {
    this.owner = entity
  }

  async use(): Promise<boolean> {
    this.assertOwner()
    if (this.stacked <= 0) return false
    this.stacked--
    this.dirty()
    if (this.stacked <= 0) {
      this.owner.removeItem(this)
      // TODO: onDestroy
    }
    return true
  }

  mixing(item: this): boolean {
    if (!this.canStacked) return false
    if (this.stacked >= this.maxStackCount) return false
    // TODO: 这里可能会超出 maxStackCount，为了方便先不做处理
    this.stacked += item.stacked
    this.dirty()
    return true
  }

  // utils

  assertOwner(
    errMsg = 'Cannot pass assertOwner'
  ): asserts this is this & { owner: Entity } {
    if (this.owner == null) {
      throw new Error(errMsg)
    }
  }
}

export namespace Item {
  export interface Serialized {
    id: UniqueId
    templateId: ItemTemplateId
    stacked: number
  }

  export interface Snapshot {
    snapshotType: 'Item'
    id: UniqueId
    templateId: ItemTemplateId
    name: string
    description: string
    stacked: number
  }
}

export class TomeOfKnowledge extends Item {
  get name() {
    return '知识之书'
  }
  get description() {
    return '使用后提升 1 个等级'
  }

  canUse(): boolean {
    return true
  }

  async use(): Promise<boolean> {
    if (!super.use()) return false

    this.assertOwner()
    this.owner.addLevel(1)
    console.log('use', this, this.owner)
    return true
  }
}

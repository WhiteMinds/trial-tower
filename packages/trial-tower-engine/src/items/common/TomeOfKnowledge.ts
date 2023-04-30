import { Item } from 'hedra-engine'

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

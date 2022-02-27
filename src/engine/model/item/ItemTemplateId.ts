// 单独放一个文件而不是在 index.ts 中，是为了防止循环引用

// TODO: 使用数字而不是字符串可以少打点字，并且改名后的对应关系不需要调整，
// 但不方便调试，并且会使得 ItemTemplateId 不适合作为对象的 key（因为 key 会转成 string）。
// 这值得吗？
export enum ItemTemplateId {
  Base = 1,

  // 道具

  TomeOfKnowledge,

  // 装备

  WoodenSword = 10001,
  ClothArmor,
}

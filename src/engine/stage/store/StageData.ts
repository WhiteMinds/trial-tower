export interface StageData {
  entities: Record<string, {}>
}

export namespace StageData {
  export const initial: StageData = {
    entities: {},
  }
}

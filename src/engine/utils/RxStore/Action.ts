export interface Action<ActionType extends string, Payload> {
  type: ActionType
  payload: Payload
}

export namespace Action {
  type ActionCreatorArgs<Payload> = Payload extends void
    ? []
    : [payload: Payload]

  export type ActionMatcher<A extends Action<any, any>> = (
    action: Action<any, any>,
  ) => action is A

  export interface ActionCreator<ActionType extends string, Payload> {
    /**
     * 这是一个内部属性，不要在其他地方使用
     */
    __ACTION_TYPE_DO_NOT_USE_IT: ActionType

    match: ActionMatcher<Action<ActionType, Payload>>

    (...args: ActionCreatorArgs<Payload>): Action<ActionType, Payload>
  }

  export type FromActionCreator<AC extends ActionCreator<any, any>> = Action<
    AC extends ActionCreator<infer R, any> ? R : never,
    AC extends ActionCreator<any, infer R> ? R : never
  >

  export type FromActionCreators<
    ACs extends Record<string, ActionCreator<any, any>>
  > = {
    [K in keyof ACs]: Action.FromActionCreator<ACs[K]>
  }

  export function actionCreator<ActionType extends string>(
    type: ActionType,
  ): <Payload>(
    payloadPacker?: PayloadPacker<Payload>,
  ) => ActionCreator<typeof type, Payload> {
    return <Payload>(payloadPacker: PayloadPacker<Payload> = pp<Payload>()) => {
      const f: ActionCreator<typeof type, Payload> = (
        ...args: ActionCreatorArgs<Payload>
      ) => ({
        type,
        ...payloadPacker(...args),
      })

      f.__ACTION_TYPE_DO_NOT_USE_IT = type

      f.match = (action): action is Action<ActionType, Payload> => {
        return match(f, action)
      }

      return f
    }
  }

  export function actionCreators<
    Map extends Record<string, PayloadPacker<any>>
  >(
    actionMap: Map,
  ): {
    [K in keyof Map]: K extends string
      ? ActionCreator<K, PayloadPacker.Payload<Map[K]>>
      : never
  } {
    return Object.keys(actionMap).reduce((acc: any, type) => {
      const packer = actionMap[type]!
      acc[type] = actionCreator(type)(packer)
      return acc
    }, {})
  }

  export type PayloadPacker<Payload> = (
    ...args: ActionCreatorArgs<Payload>
  ) => { payload: Payload }
  export namespace PayloadPacker {
    export type Payload<
      Packer extends PayloadPacker<any>
    > = Packer extends PayloadPacker<infer R> ? R : never
  }
  /**
   * 用于生成默认的 [[PayloadPacker]]
   */
  export function pp<Payload = undefined>(): PayloadPacker<Payload> {
    return ((payload: any) => ({ payload })) as any
  }

  export function match<AC extends ActionCreator<any, any>>(
    actionCreator: AC,
  ): (action: Action<any, any>) => action is FromActionCreator<AC>
  export function match<AC extends ActionCreator<any, any>>(
    actionCreator: AC,
    action: Action<any, any>,
  ): action is FromActionCreator<AC>
  export function match<AC extends ActionCreator<any, any>>(
    actionCreator: AC,
    action?: Action<any, any>,
  ): any {
    if (action) {
      return getType(actionCreator) === action.type
    }
    return (action: Action<any, any>) => match(actionCreator, action)
  }

  export type ActionMatcherInput<ActionType extends string, Payload> =
    | ActionMatcher<Action<ActionType, Payload>>
    | ActionCreator<ActionType, Payload>

  // prettier-ignore
  export type FromActionMatcherInput<AMI extends ActionMatcherInput<any, any>> =
    AMI extends ActionMatcher<infer A> ? A :
    AMI extends ActionCreator<any, any> ? FromActionCreator<AMI> :
    never

  export function getActionMatcher<AMI extends ActionMatcherInput<any, any>>(
    input: AMI,
  ): ActionMatcher<FromActionMatcherInput<AMI>> {
    return 'match' in input ? Action.match(input as any) : (input as any)
  }

  export function oneOf<AMI extends ActionMatcherInput<any, any>>(
    actionMatcherInputs: AMI[],
  ): (action: Action<any, any>) => action is FromActionMatcherInput<AMI>
  export function oneOf<AMI extends ActionMatcherInput<any, any>>(
    actionMatcherInputs: AMI[],
    action: Action<any, any>,
  ): action is FromActionMatcherInput<AMI>
  export function oneOf<AMI extends ActionMatcherInput<any, any>>(
    actionMatcherInputs: AMI[],
    action?: Action<any, any>,
  ): any {
    if (action) {
      return actionMatcherInputs.some(ac => getActionMatcher(ac)(action))
    }
    return (action: Action<any, any>) => oneOf(actionMatcherInputs, action)
  }

  export function getType<ActionType extends string>(
    actionCreator: ActionCreator<ActionType, any>,
  ): ActionType {
    return actionCreator.__ACTION_TYPE_DO_NOT_USE_IT
  }
}

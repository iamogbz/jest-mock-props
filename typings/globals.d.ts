// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Spyable = any;

export interface MockProp<T = Spyable, K extends keyof T = keyof T> {
    mockClear(): void;
    mockReset(): void;
    mockRestore(): void;
    mockValue(v?: T[K]): MockProp<T, K>;
    mockValueOnce(v?: T[K]): MockProp<T, K>;
}

export type SpyMap<T> = Map<T, Map<keyof T, MockProp<T, keyof T>>>;

// copied from @types/jest
// see https://github.com/Microsoft/TypeScript/issues/25215
type Func = (...args: unknown[]) => unknown;
type NonFunctionPropertyNames<T> = keyof {
    [K in keyof T as T[K] extends Func ? never : K]: T[K];
};
type GetAccessor = "get";
type SetAccessor = "set";
export type AnyObject = Record<string, unknown>;
export type PropertyAccessors<T extends AnyObject, M extends keyof T> =
    M extends NonFunctionPropertyNames<Required<T>>
        ? GetAccessor | SetAccessor
        : never;

export type SpyOnProp = <
    T extends AnyObject,
    Key extends keyof T,
    A extends PropertyAccessors<T, Key> = PropertyAccessors<T, Key>,
>(
    object: T,
    propName: Key,
    accessType?: A,
) => MockProp<T, Key>;

export type IsMockProp = <T, K extends keyof T>(
    object: T,
    propName: K,
) => boolean;

declare global {
    namespace jest {
        const isMockProp: IsMockProp;
        function spyOn<T, P extends NonFunctionPropertyNames<Required<T>>>(
            object: T,
            propName: P,
        ): MockProp<T>;
        const spyOnProp: SpyOnProp;
    }
}

export type ExtendJest = (jestInstance: typeof jest) => void;

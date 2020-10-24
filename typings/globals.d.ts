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

export type SpyOnProp = <T>(object: T, propName: keyof T) => MockProp<T>;

export type IsMockProp = <T, K extends keyof T>(
    object: T,
    propName: K,
) => boolean;

declare global {
    namespace jest {
        const isMockProp: IsMockProp;
        const spyOnProp: SpyOnProp;
    }
}

export type ExtendJest = (jestInstance: typeof jest) => void;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Spyable = any;

interface MockProp<T = Spyable, K extends keyof T = keyof T> {
    mockClear(): void;
    mockReset(): void;
    mockRestore(): void;
    mockValue(v: T[K]): MockProp<T, K>;
    mockValueOnce(v: T[K]): MockProp<T, K>;
}

type IsMockProp = <T, K extends keyof T>(object: T, propName: K) => boolean;
type SpyOnProp<T> = (
    object: T,
    propName: keyof T,
) => MockProp<T[typeof propName]>;

type SpyMap<T> = Map<T, Map<keyof T, MockProp<T, keyof T>>>;

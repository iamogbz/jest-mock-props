declare module "jest-mock-props" {
    export type Obj<T> = Record<string, T>;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    export type Spyable = Obj<any>;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    export type ValueOf<O> = O extends Record<infer _, infer T> ? T : any;

    export interface MockProp<T> {
        mockClear(): void;
        mockReset(): void;
        mockRestore(): void;
        mockValue(v: T): MockProp<T>;
        mockValueOnce(v: T): MockProp<T>;
    }

    export type IsMockProp = <T>(object: Obj<T>, propName: string) => boolean;
    export type SpyOnProp = (
        object: Spyable,
        propName: string,
    ) => MockProp<ValueOf<typeof object>>;
}

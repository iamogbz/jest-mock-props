export interface Soap<T> {
    [key: string]: T;
}

export interface MockProp<T> {
    mockClear(): void;
    mockReset(): void;
    mockRestore(): void;
    mockValue(v: T): MockProp<T>;
    mockValueOnce(v: T): MockProp<T>;
}

declare global {
    namespace jest {
        function isMockProp<T = unknown>(object: T, propName?: string): boolean;
        function spyOnProp<T = unknown>(
            object: Soap<T>,
            propName: string,
        ): MockProp<T>;
    }
}

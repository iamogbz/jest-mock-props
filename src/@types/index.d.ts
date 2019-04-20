interface AnyObject {
    [key: string]: any;
}

declare interface MockProp {
    mockClear(): void;
    mockReset(): void;
    mockRestore(): void;
    mockValue(v: any): MockProp;
    mockValueOnce(v: any): MockProp;
}

// tslint:disable-next-line no-namespace
declare namespace jest {
    const isMockProp: (object: any) => boolean;
    const spyOnProp: (object: AnyObject, propName: string) => MockProp;
}

declare const extend: (jestInstance: typeof jest) => void;

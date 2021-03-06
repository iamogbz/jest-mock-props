import messages from "src/utils/messages";
import * as mockProps from "src/index";
import { Spyable } from "typings/globals";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockObject = {
    fn1: (): string => "fnReturnValue",
    prop1: "1",
    prop2: 2,
    get propZ() {
        return "z";
    },
};

const spyConsoleWarn = jest.spyOn(console, "warn");

beforeEach(jest.clearAllMocks);
beforeAll(() => mockProps.extend(jest));
afterAll(jest.restoreAllMocks);

it("mock object undefined property", () => {
    // @ts-expect-error setting number to process env string value
    const spy = jest.spyOnProp(process.env, "undefinedProp").mockValue(1);
    expect(spyConsoleWarn).toHaveBeenCalledWith(
        messages.warn.noUndefinedSpy("undefinedProp"),
    );
    expect(process.env.undefinedProp).toEqual(1);
    spy.mockValue(undefined);
    expect(process.env.undefinedProp).toBeUndefined();
    process.env.undefinedProp = "5";
    expect(process.env.undefinedProp).toEqual("5");
    expect(jest.isMockProp(process.env, "undefinedProp")).toBe(true);
    spy.mockRestore();
    expect(process.env.undefinedProp).toBeUndefined();
    expect(jest.isMockProp(process.env, "undefinedProp")).toBe(false);
});

it("mocks object property value undefined", () => {
    const testObject: Record<string, number> = { propUndefined: undefined };
    const spy = jest.spyOn(testObject, "propUndefined").mockValue(1);
    expect(testObject.propUndefined).toEqual(1);
    testObject.propUndefined = 5;
    expect(testObject.propUndefined).toEqual(5);
    expect(jest.isMockProp(testObject, "propUndefined")).toBe(true);
    spy.mockRestore();
    expect(testObject.propUndefined).toBeUndefined();
    expect(jest.isMockProp(testObject, "propUndefined")).toBe(false);
});

it("mocks object property value null", () => {
    const testObject: Record<string, number> = { propNull: null };
    const spy = jest.spyOnProp(testObject, "propNull").mockValue(2);
    expect(testObject.propNull).toEqual(2);
    testObject.propNull = 10;
    expect(testObject.propNull).toEqual(10);
    expect(jest.isMockProp(testObject, "propNull")).toBe(true);
    spy.mockRestore();
    expect(testObject.propNull).toBeNull();
    expect(jest.isMockProp(testObject, "propNull")).toBe(false);
});

it("mocks object property value", () => {
    const testObject = { ...mockObject };
    const mockValue = 99;
    const spy = jest.spyOn(testObject, "prop1");
    expect(testObject.prop1).toEqual("1");
    // @ts-expect-error allow string assignment
    testObject.prop1 = mockValue;
    expect(testObject.prop1).toEqual(mockValue);
    expect(testObject.prop1).toEqual(mockValue);
    expect(jest.isMockProp(testObject, "prop1")).toBe(true);
    spy.mockRestore();
    expect(testObject.prop1).toEqual("1");
    expect(jest.isMockProp(testObject, "prop1")).toBe(false);
});

it("mocks object property value once", () => {
    const testObject = { ...mockObject };
    const mockValue1 = 99;
    const mockValue2 = 100;
    const spy = jest.spyOnProp(testObject, "prop2").mockValueOnce(mockValue1);
    spy.mockValueOnce(mockValue2);
    expect(testObject.prop2).toEqual(mockValue1);
    expect(testObject.prop2).toEqual(mockValue2);
    expect(testObject.prop2).toEqual(2);
    expect(jest.isMockProp(testObject, "prop2")).toBe(true);
});

it("mocks object property replaces once", () => {
    const testObject = { ...mockObject };
    const mockValue1 = 99;
    const mockValue2 = 100;
    const spy = jest.spyOn(testObject, "prop2").mockValueOnce(mockValue1);
    spy.mockValueOnce(mockValue2).mockValueOnce(101);
    expect(testObject.prop2).toEqual(mockValue1);
    expect(testObject.prop2).toEqual(mockValue2);
    spy.mockValue(4);
    expect(testObject.prop2).toEqual(4);
    expect(testObject.prop2).toEqual(4);
    expect(jest.isMockProp(testObject, "prop2")).toBe(true);
});

it("mocks object multiple properties", () => {
    const testObject = { ...mockObject };
    const mockValue = 99;
    const spy = jest.spyOn(testObject, "prop1").mockValue(mockValue);
    jest.spyOnProp(testObject, "prop2").mockValue(mockValue);
    spy.mockRestore();
    expect(testObject.prop1).toEqual("1");
    expect(testObject.prop2).toEqual(mockValue);
    expect(jest.isMockProp(testObject, "prop1")).toBe(false);
    expect(jest.isMockProp(testObject, "prop2")).toBe(true);
});

it("resets mocked object property", () => {
    const testObject = { ...mockObject };
    const mockValue = 99;
    const spy = jest.spyOn(testObject, "prop1").mockValue(mockValue);
    expect(testObject.prop1).toEqual(mockValue);
    expect(jest.isMockProp(testObject, "prop1")).toBe(true);
    spy.mockReset();
    expect(testObject.prop1).toEqual("1");
    expect(jest.isMockProp(testObject, "prop1")).toBe(true);
});

it("restores mocked object property", () => {
    const testObject = { ...mockObject };
    const mockValue = 99;
    const spy = jest.spyOnProp(testObject, "prop1").mockValue(mockValue);
    expect(testObject.prop1).toEqual(mockValue);
    expect(jest.isMockProp(testObject, "prop1")).toBe(true);
    spy.mockRestore();
    expect(testObject.prop1).toEqual("1");
    expect(jest.isMockProp(testObject, "prop1")).toBe(false);
});

it.each`
    jestOperation
    ${"clearAllMocks"}
    ${"resetAllMocks"}
`(
    "resets mocked object property in jest.$jestOperation",
    ({ jestOperation }: { jestOperation: keyof typeof jest }) => {
        const testObject = { ...mockObject };
        const mockValue1 = 99;
        const mockValue2 = 100;
        jest.spyOn(testObject, "prop1").mockValue(mockValue1);
        jest.spyOnProp(testObject, "prop2").mockValue(mockValue2);
        expect(testObject.prop1).toEqual(mockValue1);
        expect(testObject.prop2).toEqual(mockValue2);
        expect(jest.isMockProp(testObject, "prop1")).toBe(true);
        expect(jest.isMockProp(testObject, "prop2")).toBe(true);
        // @ts-expect-error not all jest props have the same callable signature
        jest[jestOperation]();
        expect(testObject.prop1).toEqual("1");
        expect(testObject.prop2).toEqual(2);
        expect(jest.isMockProp(testObject, "prop1")).toBe(true);
        expect(jest.isMockProp(testObject, "prop2")).toBe(true);
    },
);

it("restores mocked object property in jest.restoreAllMocks", () => {
    const testObject = { ...mockObject };
    const mockValue1 = 99;
    const mockValue2 = 100;
    jest.spyOn(testObject, "prop1").mockValue(mockValue1);
    jest.spyOnProp(testObject, "prop2").mockValue(mockValue2);
    expect(testObject.prop1).toEqual(mockValue1);
    expect(testObject.prop2).toEqual(mockValue2);
    expect(jest.isMockProp(testObject, "prop1")).toBe(true);
    expect(jest.isMockProp(testObject, "prop2")).toBe(true);
    jest.restoreAllMocks();
    expect(testObject.prop1).toEqual("1");
    expect(testObject.prop2).toEqual(2);
    expect(jest.isMockProp(testObject, "prop1")).toBe(false);
    expect(jest.isMockProp(testObject, "prop2")).toBe(false);
});

it("does not remock object property", () => {
    const testObject1 = { ...mockObject };
    const mockValue = 99;
    const spy1 = jest.spyOn(testObject1, "prop1").mockValue(mockValue);
    expect(testObject1.prop1).toEqual(mockValue);
    const testObject2 = testObject1;
    const spy2 = jest.spyOnProp(testObject2, "prop1").mockValue(mockValue);
    expect(spy2).toBe(spy1);
    expect(jest.isMockProp(testObject2, "prop1")).toBe(true);
    spy2.mockRestore();
    expect(testObject2.prop1).toEqual("1");
    expect(jest.isMockProp(testObject2, "prop1")).toBe(false);
});

it.each([undefined, null, 99, "value", true].map((v) => [v && typeof v, v]))(
    "does not mock '%s' primitive",
    (_, v) => {
        expect(() =>
            // @ts-expect-error primitives not indexable by string
            jest.spyOn(v, "propName"),
        ).toThrowErrorMatchingSnapshot();
    },
);

it("does not mock object non-configurable property", () => {
    const testObject: Spyable = {};
    Object.defineProperty(testObject, "propUnconfigurable", { value: 2 });
    expect(() =>
        jest.spyOnProp(testObject, "propUnconfigurable"),
    ).toThrowErrorMatchingSnapshot();
});

it("does not mock object method property", () => {
    expect(() =>
        jest.spyOnProp(mockObject, "fn1"),
    ).toThrowErrorMatchingSnapshot();
    expect(jest.isMockProp(mockObject, "fn1")).toBe(false);
    expect(mockObject.fn1()).toEqual("fnReturnValue");
    jest.spyOn(mockObject, "fn1").mockReturnValue("fnMockReturnValue");
    expect(mockObject.fn1()).toEqual("fnMockReturnValue");
});

it("does not mock object getter property", () => {
    expect(() =>
        jest.spyOnProp(mockObject, "propZ"),
    ).toThrowErrorMatchingSnapshot();
    expect(jest.isMockProp(mockObject, "propZ")).toBe(false);
    expect(mockObject.propZ).toEqual("z");
    jest.spyOn(mockObject, "propZ", "get").mockReturnValue("Z");
    expect(mockObject.propZ).toEqual("Z");
});

it("does not mock object setter property", () => {
    const testObject = {
        _value: 2,
        set propY(v: number) {
            this._value = v; // tslint:disable-line
        },
    };
    expect(() =>
        jest.spyOn(testObject, "propY"),
    ).toThrowErrorMatchingSnapshot();
    expect(jest.isMockProp(testObject, "propY")).toBe(false);
    const setterSpy = jest.spyOn(testObject, "propY", "set");
    testObject.propY = 4;
    expect(testObject._value).toEqual(4);
    expect(setterSpy).toHaveBeenCalledTimes(1);
    expect(setterSpy).toHaveBeenLastCalledWith(4);
});

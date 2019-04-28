import * as mockProps from "index";

const mockObject: AnyObject = {
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
    const spy = jest.spyOnProp(process.env, "undefinedProp").mockValue(1);
    expect(spyConsoleWarn).toHaveBeenCalledWith(
        mockProps.messages.warn.noUndefinedSpy("undefinedProp"),
    );
    expect(process.env.undefinedProp).toEqual(1);
    process.env.undefinedProp = "5";
    expect(process.env.undefinedProp).toEqual("5");
    expect(jest.isMockProp(process.env, "undefinedProp")).toBe(true);
    spy.mockRestore();
    expect(process.env.undefinedProp).toEqual(undefined);
});

it("mocks object property value undefined", () => {
    const testObject: AnyObject = { propUndefined: undefined };
    const spy = jest.spyOnProp(testObject, "propUndefined").mockValue(1);
    expect(testObject.propUndefined).toEqual(1);
    testObject.propUndefined = 5;
    expect(testObject.propUndefined).toEqual(5);
    expect(jest.isMockProp(testObject, "propUndefined")).toBe(true);
    spy.mockRestore();
    expect(testObject.propUndefined).toEqual(undefined);
});

it("mocks object property value null", () => {
    const testObject: AnyObject = { propNull: null };
    const spy = jest.spyOnProp(testObject, "propNull").mockValue(2);
    expect(testObject.propNull).toEqual(2);
    testObject.propNull = 10;
    expect(testObject.propNull).toEqual(10);
    expect(jest.isMockProp(testObject, "propNull")).toBe(true);
    spy.mockRestore();
    expect(testObject.propNull).toEqual(null);
});

it("mocks object property value", () => {
    const testObject = { ...mockObject };
    const mockValue = 99;
    const spy = jest.spyOnProp(testObject, "prop1");
    expect(testObject.prop1).toEqual("1");
    testObject.prop1 = mockValue;
    expect(testObject.prop1).toEqual(mockValue);
    expect(testObject.prop1).toEqual(mockValue);
    expect(jest.isMockProp(testObject, "prop1")).toBe(true);
    spy.mockRestore();
    expect(testObject.prop1).toEqual("1");
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
});

it("mocks object property replaces once", () => {
    const testObject = { ...mockObject };
    const mockValue1 = 99;
    const mockValue2 = 100;
    const spy = jest.spyOnProp(testObject, "prop2").mockValueOnce(mockValue1);
    spy.mockValueOnce(mockValue2).mockValueOnce(101);
    expect(testObject.prop2).toEqual(mockValue1);
    expect(testObject.prop2).toEqual(mockValue2);
    spy.mockValue(4);
    expect(testObject.prop2).toEqual(4);
    expect(testObject.prop2).toEqual(4);
});

it("mocks object multiple properties", () => {
    const testObject = { ...mockObject };
    const mockValue = 99;
    const spy = jest.spyOnProp(testObject, "prop1").mockValue(mockValue);
    expect(testObject.prop1).toEqual(mockValue);
    jest.spyOnProp(testObject, "prop2").mockValue(mockValue);
    expect(testObject.prop2).toEqual(mockValue);
    spy.mockRestore();
    expect(jest.isMockProp(testObject, "prop2")).toBe(true);
    expect(testObject.prop1).toEqual("1");
    expect(testObject.prop2).toEqual(mockValue);
});

it("resets mocked object property", () => {
    const testObject = { ...mockObject };
    const mockValue = 99;
    const spy = jest.spyOnProp(testObject, "prop1").mockValue(mockValue);
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

it("resets mocked object property in jest.resetAllMocks", () => {
    const testObject = { ...mockObject };
    const mockValue1 = 99;
    const mockValue2 = 100;
    jest.spyOnProp(testObject, "prop1").mockValue(mockValue1);
    jest.spyOnProp(testObject, "prop2").mockValue(mockValue2);
    expect(testObject.prop1).toEqual(mockValue1);
    expect(testObject.prop2).toEqual(mockValue2);
    expect(jest.isMockProp(testObject, "prop2")).toBe(true);
    jest.resetAllMocks();
    expect(testObject.prop1).toEqual("1");
    expect(testObject.prop2).toEqual(2);
    expect(jest.isMockProp(testObject, "prop2")).toBe(true);
});

it("restores mocked object property in jest.restoreAllMocks", () => {
    const testObject = { ...mockObject };
    const mockValue1 = 99;
    const mockValue2 = 100;
    jest.spyOnProp(testObject, "prop1").mockValue(mockValue1);
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
    const spy1 = jest.spyOnProp(testObject1, "prop1").mockValue(mockValue);
    expect(testObject1.prop1).toEqual(mockValue);
    const testObject2 = testObject1;
    const spy2 = jest.spyOnProp(testObject2, "prop1").mockValue(mockValue);
    expect(spy2).toBe(spy1);
    expect(jest.isMockProp(testObject2, "prop1")).toBe(true);
    spy2.mockRestore();
    expect(testObject2.prop1).toEqual("1");
    expect(jest.isMockProp(testObject2, "prop1")).toBe(false);
});

it.each([undefined, null, 99, "value", true].map(v => [v && typeof v, v]))(
    "does not mock '%s' primitive",
    (_, v: any) => {
        expect(() =>
            jest.spyOnProp(v, "propName"),
        ).toThrowErrorMatchingSnapshot();
    },
);

it("does not mock object non-configurable property", () => {
    const testObject = {};
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
});

it("does not mock object getter property", () => {
    expect(() =>
        jest.spyOnProp(mockObject, "propZ"),
    ).toThrowErrorMatchingSnapshot();
    expect(jest.isMockProp(mockObject, "propZ")).toBe(false);
    expect(mockObject.propZ).toEqual("z");
});

it("does not mock object setter property", () => {
    const testObject = {
        _value: 2,
        set propY(v: number) {
            this._value = v; // tslint:disable-line
        },
    };
    expect(() =>
        jest.spyOnProp(testObject, "propY"),
    ).toThrowErrorMatchingSnapshot();
    testObject.propY = 4;
    expect(testObject._value).toEqual(4);
});

it("throws error on mockClear", () => {
    const testObject = { ...mockObject };
    const spy = jest.spyOnProp(testObject, "prop1");
    expect(jest.isMockProp(testObject, "prop1")).toBe(true);
    expect(spy.mockClear).toThrowErrorMatchingSnapshot();
});

import * as mockProps from "index";

const mockObject: AnyObject = {
    fn1: (): string => "fnReturnValue",
    prop1: "1",
    prop2: 2,
    get propZ() {
        return "z";
    },
};

const spyConsoleWarn = jest.fn();
const spyOnConsoleWarn = () =>
    jest.spyOn(console, "warn").mockImplementation(spyConsoleWarn);

beforeEach(jest.clearAllMocks);
beforeAll(() => {
    mockProps.extend(jest);
    spyOnConsoleWarn();
});
afterAll(jest.restoreAllMocks);

const expectIsMockProp = (
    object: AnyObject,
    propName: string,
    value = true,
) => {
    expect(jest.isMockProp(object, propName)).toBe(value);
    expect(jest.isMockProp(object[propName])).toBe(value);
};
const expectIsNotMockProp = (object: AnyObject, propName: string) =>
    expectIsMockProp(object, propName, false);

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
    expectIsMockProp(testObject, "prop1");
    expect(spyConsoleWarn).toHaveBeenCalledWith(
        mockProps.messages.warn.noIsMockPropValue,
    );
    spy.mockRestore();
    expect(testObject.prop1).toEqual("1");
});

it("mocks object property value once", () => {
    const testObject = { ...mockObject };
    const mockValue1 = 99;
    const mockValue2 = 100;
    const spy = jest.spyOnProp(testObject, "prop2").mockValueOnce(mockValue1);
    spy.mockValueOnce(mockValue2);
    expect(testObject.prop2).toEqual(mockValue2);
    expect(testObject.prop2).toEqual(mockValue1);
    expect(testObject.prop2).toEqual(2);
});

it("mocks object property replaces once", () => {
    const testObject = { ...mockObject };
    const mockValue1 = 99;
    const mockValue2 = 100;
    const spy = jest.spyOnProp(testObject, "prop2").mockValueOnce(mockValue1);
    spy.mockValueOnce(mockValue2);
    expect(testObject.prop2).toEqual(mockValue2);
    spy.mockValue(4);
    expect(testObject.prop2).toEqual(4);
    expect(testObject.prop2).toEqual(4);
});

it("resets mocked object property", () => {
    const testObject = { ...mockObject };
    const mockValue = 99;
    const spy = jest.spyOnProp(testObject, "prop1").mockValue(mockValue);
    expect(testObject.prop1).toEqual(mockValue);
    expectIsMockProp(testObject, "prop1");
    spy.mockReset();
    expect(testObject.prop1).toEqual("1");
    expectIsMockProp(testObject, "prop1");
});

it("restores mocked object property", () => {
    const testObject = { ...mockObject };
    const mockValue = 99;
    const spy = jest.spyOnProp(testObject, "prop1").mockValue(mockValue);
    expect(testObject.prop1).toEqual(mockValue);
    expectIsMockProp(testObject, "prop1");
    spy.mockRestore();
    expect(testObject.prop1).toEqual("1");
    expectIsNotMockProp(testObject, "prop1");
});

it("resets mocked object property in jest.resetAllMocks", () => {
    const testObject = { ...mockObject };
    const mockValue1 = 99;
    const mockValue2 = 100;
    jest.spyOnProp(testObject, "prop1").mockValue(mockValue1);
    jest.spyOnProp(testObject, "prop2").mockValue(mockValue2);
    expect(testObject.prop1).toEqual(mockValue1);
    expect(testObject.prop2).toEqual(mockValue2);
    expectIsMockProp(testObject, "prop2");
    jest.resetAllMocks();
    expect(testObject.prop1).toEqual("1");
    expect(testObject.prop2).toEqual(2);
    expectIsMockProp(testObject, "prop2");
    spyOnConsoleWarn();
});

it("restores mocked object property in jest.restoreAllMocks", () => {
    const testObject = { ...mockObject };
    const mockValue1 = 99;
    const mockValue2 = 100;
    jest.spyOnProp(testObject, "prop1").mockValue(mockValue1);
    jest.spyOnProp(testObject, "prop2").mockValue(mockValue2);
    expect(testObject.prop1).toEqual(mockValue1);
    expect(testObject.prop2).toEqual(mockValue2);
    expectIsMockProp(testObject, "prop1");
    expectIsMockProp(testObject, "prop2");
    jest.restoreAllMocks();
    expect(testObject.prop1).toEqual("1");
    expect(testObject.prop2).toEqual(2);
    expectIsNotMockProp(testObject, "prop1");
    expectIsNotMockProp(testObject, "prop2");
    spyOnConsoleWarn();
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
    const testObject: AnyObject = {};
    Object.defineProperty(testObject, "propUnconfigurable", { value: 2 });
    expect(() =>
        jest.spyOnProp(mockObject, "propUnconfigurable"),
    ).toThrowErrorMatchingSnapshot();
});

it("does not mock object undefined property", () => {
    expect(() =>
        jest.spyOnProp(mockObject, "propUndefined"),
    ).toThrowErrorMatchingSnapshot();
    expectIsNotMockProp(mockObject, "propUndefined");
    expect(mockObject.propUndefined).toBeUndefined();
});

it("does not mock object method property", () => {
    expect(() =>
        jest.spyOnProp(mockObject, "fn1"),
    ).toThrowErrorMatchingSnapshot();
    expectIsNotMockProp(mockObject, "fn1");
    expect(mockObject.fn1()).toEqual("fnReturnValue");
});

it("does not mock object getter property", () => {
    expect(() =>
        jest.spyOnProp(mockObject, "propZ"),
    ).toThrowErrorMatchingSnapshot();
    expectIsNotMockProp(mockObject, "propZ");
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
    expectIsMockProp(testObject, "prop1");
    expect(spy.mockClear).toThrowErrorMatchingSnapshot();
});

import extend from "index";

const mockObject: AnyObject = {
    fn1: (): string => "fnReturnValue",
    prop1: "1",
    prop2: "2",
    get propZ() {
        return "z";
    },
};
// const mockProps = ["fn1", "prop1", "prop2", "propZ"];

beforeAll(() => extend(jest));

it("mocks object property value", () => {
    const testObject = { ...mockObject };
    const mockValue = 99;
    const spy = jest.spyOnProp(testObject, "prop1");
    expect(testObject.prop1).toEqual("1");
    spy.mockValue(mockValue);
    expect(testObject.prop1).toEqual(mockValue);
    expect(testObject.prop1).toEqual(mockValue);
    expect(jest.isMockProp(testObject.prop1)).toBe(true);
});

it("mocks object property value once", () => {
    const testObject = { ...mockObject };
    const mockValue1 = 99;
    const mockValue2 = 100;
    const spy = jest.spyOnProp(testObject, "prop2").mockValueOnce(mockValue1);
    spy.mockValueOnce(mockValue2);
    expect(testObject.prop2).toEqual(mockValue2);
    expect(testObject.prop2).toEqual(mockValue1);
    expect(testObject.prop2).toEqual("2");
});

it("restores mocked object property", () => {
    const testObject = { ...mockObject };
    const mockValue = 99;
    const spy = jest.spyOnProp(testObject, "prop1").mockValue(mockValue);
    expect(testObject.prop1).toEqual(mockValue);
    expect(jest.isMockProp(testObject.prop1)).toBe(true);
    spy.mockRestore();
    expect(testObject.prop1).toEqual("1");
    expect(jest.isMockProp(testObject.prop1)).toBe(false);
});

it("does not mock object method", () => {
    expect(() =>
        jest.spyOnProp(mockObject, "fn1"),
    ).toThrowErrorMatchingSnapshot();
    expect(jest.isMockProp(mockObject.fn1)).toBe(false);
    expect(mockObject.fn1()).toEqual("fnReturnValue");
});

it("does not mock object getter", () => {
    expect(() =>
        jest.spyOnProp(mockObject, "propZ"),
    ).toThrowErrorMatchingSnapshot();
    expect(jest.isMockProp(mockObject.propZ)).toBe(false);
    expect(mockObject.propZ).toEqual("z");
});

it("does not mock object setter", () => {
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

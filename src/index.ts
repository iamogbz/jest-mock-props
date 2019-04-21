const messages = {
    error: {
        noMethodSpy: "Can not spy on method. Please use `jest.spyOn`",
    },
};

const spies: Set<MockProp> = new Set();
const spiedOn: Map<object, Set<string>> = new Map();

class MockProp implements MockProp {
    private initialPropValue: any;
    private object: AnyObject;
    private propName: string;
    private propValue: any;
    private propValues: any[] = [];

    constructor({ object, propName }: { object: AnyObject; propName: string }) {
        this.validate({ object, propName });
        this.object = object;
        this.propName = propName;
        this.initialPropValue = object[propName];
        this.propValue = this.initialPropValue;
        if (object) {
            Object.defineProperty(object, propName, {
                configurable: true,
                get: this.nextValue,
                set: this.mockValue,
            });
        }
        spies.add(this);
        if (!spiedOn.has(object)) {
            spiedOn.set(object, new Set());
        }
        spiedOn.get(object).add(propName);
    }

    public mockClear = (): void => {
        throw new Error("Nothing to clear");
    }

    public mockReset = (): void => {
        this.mockValue(this.initialPropValue);
    }

    public mockRestore = (): void => {
        if (this.object[this.propName]) {
            delete this.object[this.propName];
        }
        if (this.initialPropValue !== undefined) {
            this.object[this.propName] = this.initialPropValue;
        }
        spies.delete(this);
        spiedOn.delete(this.object);
    }

    /**
     * Set the value of the mocked property
     */
    public mockValue = (value: any): MockProp => {
        this.propValues = [];
        this.propValue = value;
        return this;
    }

    /**
     * Next value returned when the property is accessed
     */
    public mockValueOnce = (value: any): MockProp => {
        this.propValues.push(value);
        return this;
    }

    /**
     * Determine if the object property can and should be mocked
     */
    private validate = ({
        object,
        propName,
    }: {
        object: AnyObject;
        propName: string;
    }): void => {
        const descriptor = Object.getOwnPropertyDescriptor(object, propName);
        if (!descriptor) return;
        if (
            descriptor.set ||
            descriptor.get ||
            descriptor.value instanceof Function
        ) {
            throw new Error(messages.error.noMethodSpy);
        }
    }

    /**
     * Pop the value stack and return the next, defaulting to the mocked value
     */
    private nextValue = (): any => {
        const propValue = this.propValues.pop() || this.propValue;
        return propValue && Object.assign(propValue, { mock: this });
    }
}

const isMockProp = (object: any, propName?: string): boolean =>
    Boolean(
        propName
            ? spiedOn.get(object) && spiedOn.get(object).has(propName)
            : object && object.mock instanceof MockProp,
    );

const resetAll = (): void => spies.forEach(spy => spy.mockReset());
const restoreAll = (): void => spies.forEach(spy => spy.mockRestore());

const spyOnProp = (object: AnyObject, propName: string): MockProp =>
    new MockProp({ object, propName });

export const extend = (jestInstance: typeof jest) => {
    const resetAllMocks = jestInstance.resetAllMocks;
    const restoreAllMocks = jestInstance.restoreAllMocks;
    Object.assign(jestInstance, {
        isMockProp,
        resetAllMocks: (): void => resetAllMocks() && resetAll(),
        restoreAllMocks: (): void => restoreAllMocks() && restoreAll(),
        spyOnProp,
    });
};

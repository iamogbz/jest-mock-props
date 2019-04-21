export const messages = {
    error: {
        noMethodSpy: (p: string) =>
            `Cannot spy on the property '${p}' because it is a function. Please use \`jest.spyOn\`.`,
        noMockClear: "Cannot `mockClear` on property spy.",
        noUndefinedSpy: (prop: string) =>
            `Cannot spy on the property '${prop}' because it is not defined.`,
    },
    warn: {
        noIsMockPropValue: `Checking \`isMockProp\` using value is deprecated.
Please use \`jest.isMockProp(object, propName)\``,
    },
};

export const log = (...args: any[]) => log.default(...args);
log.default = log.warn = (...args: any[]) => console.warn(...args); // tslint:disable-line

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
                get: this.nextValue,
                set: this.mockValue,
            });
        }
        this.register();
    }

    public mockClear = (): void => {
        throw new Error(messages.error.noMockClear);
    }

    public mockReset = (): void => {
        this.mockValue(this.initialPropValue);
    }

    public mockRestore = (): void => {
        if (this.object[this.propName]) {
            try {
                delete this.object[this.propName];
            } catch (error) {
                this.object[this.propName] = undefined;
            }
        }
        if (this.initialPropValue !== undefined) {
            this.object[this.propName] = this.initialPropValue;
        }
        this.deregister();
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
        if (!descriptor) {
            throw new Error(messages.error.noUndefinedSpy(propName));
        }
        if (
            descriptor.set ||
            descriptor.get ||
            descriptor.value instanceof Function
        ) {
            throw new Error(messages.error.noMethodSpy(propName));
        }
    }

    /**
     * Track spy
     */
    private register = (): void => {
        spies.add(this);
        if (!spiedOn.has(this.object)) {
            spiedOn.set(this.object, new Set());
        }
        spiedOn.get(this.object).add(this.propName);
    }

    /**
     * Stop tracking spy
     */
    private deregister = (): void => {
        spies.delete(this);
        spiedOn.delete(this.object);
    }

    /**
     * Pop the value stack and return the next, defaulting to the mocked value
     */
    private nextValue = (): any => {
        const propValue = this.propValues.pop() || this.propValue;
        return propValue && Object.assign(propValue, { mock: this });
    }
}

const isMockProp = (object: any, propName?: string): boolean => {
    if (propName) {
        const spiedOnProps = spiedOn.get(object);
        return Boolean(spiedOnProps && spiedOnProps.has(propName));
    }
    log.warn(messages.warn.noIsMockPropValue);
    return Boolean(object && object.mock instanceof MockProp);
};

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

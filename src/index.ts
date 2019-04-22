export const messages = {
    error: {
        invalidSpy: (o: any) => {
            const helpfulValue = `${o ? typeof o : ""}'${o}'`;
            return `Cannot spyOn on a primitive value; ${helpfulValue} given.`;
        },
        noMethodSpy: (p: string) =>
            `Cannot spy on the property '${p}' because it is a function. Please use \`jest.spyOn\`.`,
        noMockClear: "Cannot `mockClear` on property spy.",
        noUnconfigurableSpy: (p: string) =>
            `Cannot spy on the property '${p}' because it is not configurable`,
    },
    warn: {
        noUndefinedSpy: (p: string) =>
            `Spying on an undefined property '${p}'.`,
    },
};

export const log = (...args: any[]) => log.default(...args);
log.default = log.warn = (...args: any[]) => console.warn(...args); // tslint:disable-line

const spies: Set<MockProp> = new Set();
const spiedOn: Map<object, Set<string>> = new Map();

class MockProp implements MockProp {
    private initialPropDescriptor: PropertyDescriptor;
    private initialPropValue: any;
    private object: AnyObject;
    private propName: string;
    private propValue: any;
    private propValues: any[] = [];

    constructor({ object, propName }: { object: AnyObject; propName: string }) {
        this.initialPropDescriptor = this.validate({ object, propName });
        this.object = object;
        this.propName = propName;
        this.initialPropValue = object[propName];
        this.propValue = this.initialPropValue;
        this.attach();
        this.register();
    }

    public mockClear = (): void => {
        throw new Error(messages.error.noMockClear);
    }

    public mockReset = (): void => {
        this.mockValue(this.initialPropValue);
    }

    public mockRestore = (): void => {
        if (this.initialPropDescriptor) {
            Object.defineProperty(
                this.object,
                this.propName,
                this.initialPropDescriptor,
            );
        } else {
            Object.defineProperty(this.object, this.propName, {
                configurable: true,
                value: undefined,
            });
            delete this.object[this.propName];
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
    }): PropertyDescriptor => {
        const acceptedTypes: Set<string> = new Set(["function", "object"]);
        if (object === null || !acceptedTypes.has(typeof object)) {
            throw new Error(messages.error.invalidSpy(object));
        }
        const descriptor = Object.getOwnPropertyDescriptor(object, propName);
        if (!descriptor) {
            log.warn(messages.warn.noUndefinedSpy(propName));
            return descriptor;
        }
        if (!descriptor.configurable) {
            throw new Error(messages.error.noUnconfigurableSpy(propName));
        }
        if (
            descriptor.set ||
            descriptor.get ||
            descriptor.value instanceof Function
        ) {
            throw new Error(messages.error.noMethodSpy(propName));
        }
        return descriptor;
    }

    /**
     * Attach spy to object property
     */
    private attach = () => {
        Object.defineProperty(this.object, this.propName, {
            configurable: true,
            get: this.nextValue,
            set: this.mockValue,
        });
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
     * Shift and return the first next, defaulting to the mocked value
     */
    private nextValue = (): any => this.propValues.shift() || this.propValue;
}

const isMockProp = (object: any, propName: string): boolean => {
    const spiedOnProps = spiedOn.get(object);
    return Boolean(spiedOnProps && spiedOnProps.has(propName));
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

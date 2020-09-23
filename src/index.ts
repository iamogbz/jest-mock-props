import { Soap } from "./types";

export const messages = {
    error: {
        invalidSpy: (o: object): string => {
            const helpfulValue = `${o ? typeof o : ""}'${o}'`;
            return `Cannot spyOn on a primitive value; ${helpfulValue} given.`;
        },
        noMethodSpy: (p: string): string =>
            `Cannot spy on the property '${p}' because it is a function. Please use \`jest.spyOn\`.`,
        noMockClear: "Cannot `mockClear` on property spy.",
        noUnconfigurableSpy: (p: string): string =>
            `Cannot spy on the property '${p}' because it is not configurable`,
    },
    warn: {
        noUndefinedSpy: (p: string): string =>
            `Spying on an undefined property '${p}'.`,
    },
};

export const log = (...args: unknown[]): void => log.default(...args);
// eslint-disable-next-line no-console
log.default = log.warn = (...args: unknown[]): void => console.warn(...args);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const spiedOn: Map<Soap<any>, Map<string, MockProp<any>>> = new Map();
const getAllSpies = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const spies: Set<MockProp<any>> = new Set();
    for (const spiedProps of spiedOn.values()) {
        for (const spy of spiedProps.values()) {
            spies.add(spy);
        }
    }
    return spies;
};

class MockProp<T> implements MockProp<T> {
    private initialPropDescriptor: PropertyDescriptor;
    private initialPropValue: T;
    private object: Soap<T>;
    private propName: string;
    private propValue: T;
    private propValues: T[] = [];

    constructor({ object, propName }: { object: Soap<T>; propName: string }) {
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
    };

    public mockReset = (): void => {
        this.mockValue(this.initialPropValue);
    };

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
    };

    /**
     * Set the value of the mocked property
     */
    public mockValue = (value: T): MockProp<T> => {
        this.propValues = [];
        this.propValue = value;
        return this;
    };

    /**
     * Next value returned when the property is accessed
     */
    public mockValueOnce = (value: T): MockProp<T> => {
        this.propValues.push(value);
        return this;
    };

    /**
     * Determine if the object property can and should be mocked
     */
    private validate = ({
        object,
        propName,
    }: {
        object: Soap<T>;
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
    };

    /**
     * Attach spy to object property
     */
    private attach = (): void => {
        Object.defineProperty(this.object, this.propName, {
            configurable: true,
            get: this.nextValue,
            set: this.mockValue,
        });
    };

    /**
     * Track spy
     */
    private register = (): void => {
        if (!spiedOn.has(this.object)) {
            spiedOn.set(this.object, new Map());
        }
        spiedOn.get(this.object).set(this.propName, this);
    };

    /**
     * Stop tracking spy
     */
    private deregister = (): void => {
        spiedOn.get(this.object).delete(this.propName);
    };

    /**
     * Shift and return the first next, defaulting to the mocked value
     */
    private nextValue = (): T => this.propValues.shift() || this.propValue;
}

export function isMockProp<T>(object: Soap<T>, propName: string): boolean {
    const spiedOnProps = spiedOn.get(object);
    return Boolean(spiedOnProps && spiedOnProps.has(propName));
}

export function resetAllMocks(): void {
    getAllSpies().forEach((spy) => spy.mockReset());
}

export function restoreAllMocks(): void {
    getAllSpies().forEach((spy) => spy.mockRestore());
}

export function spyOnProp<T>(object: Soap<T>, propName: string): MockProp<T> {
    if (isMockProp(object, propName)) {
        return spiedOn.get(object).get(propName);
    }
    return new MockProp({ object, propName });
}

export const extend = (jestInstance: typeof jest): void => {
    const jestResetAll = jestInstance.resetAllMocks;
    const jestRestoreAll = jestInstance.restoreAllMocks;
    Object.assign(jestInstance, {
        isMockProp,
        resetAllMocks: () => jestResetAll() && resetAllMocks(),
        restoreAllMocks: () => jestRestoreAll() && restoreAllMocks(),
        spyOnProp,
    });
};

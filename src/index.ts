import {
    ExtendJest,
    IsMockProp,
    MockProp,
    Spyable,
    SpyMap,
    SpyOnProp,
} from "../typings/globals";
import log from "./utils/logging";
import messages from "./utils/messages";

const spiedOn: SpyMap<Spyable> = new Map();
const getAllSpies = () => {
    const spies: Set<MockProp> = new Set();
    for (const spiedProps of spiedOn.values()) {
        for (const spy of spiedProps.values()) {
            spies.add(spy);
        }
    }
    return spies;
};

class MockPropInstance<T, K extends keyof T> implements MockProp<T, K> {
    private initialPropDescriptor: PropertyDescriptor;
    private initialPropValue: T[K];
    private object: T;
    private propName: K;
    private propValue: T[K];
    private propValues: T[K][] = [];

    constructor({ object, propName }: { object: T; propName: K }) {
        this.initialPropDescriptor = this.validate({ object, propName });
        this.object = object;
        this.propName = propName;
        this.initialPropValue = object[propName];
        this.propValue = this.initialPropValue;
        this.attach();
        this.register();
    }

    public mockClear = (): void => {
        this.mockReset();
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
    public mockValue = (value: T[K]): MockProp<T, K> => {
        this.propValues = [];
        this.propValue = value;
        return this;
    };

    /**
     * Next value returned when the property is accessed
     */
    public mockValueOnce = (value: T[K]): MockProp<T, K> => {
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
        object: T;
        propName: K;
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
    private nextValue = (): T[K] => this.propValues.shift() || this.propValue;
}

export const isMockProp: IsMockProp = (object, propName) => {
    const spiedOnProps = spiedOn.get(object);
    return Boolean(spiedOnProps && spiedOnProps.has(propName));
};

export const clearAllMocks = () =>
    getAllSpies().forEach((spy) => spy.mockClear());

export const resetAllMocks = () =>
    getAllSpies().forEach((spy) => spy.mockReset());

export const restoreAllMocks = () =>
    getAllSpies().forEach((spy) => spy.mockRestore());

export const spyOnProp: SpyOnProp = (object, propName) => {
    if (isMockProp(object, propName)) {
        return spiedOn.get(object).get(propName);
    }
    return new MockPropInstance({ object, propName });
};

export const extend: ExtendJest = (jestInstance: typeof jest): void => {
    const jestClearAll = jestInstance.clearAllMocks;
    const jestResetAll = jestInstance.resetAllMocks;
    const jestRestoreAll = jestInstance.restoreAllMocks;
    Object.assign(jestInstance, {
        isMockProp,
        clearAllMocks: () => jestClearAll() && clearAllMocks(),
        resetAllMocks: () => jestResetAll() && resetAllMocks(),
        restoreAllMocks: () => jestRestoreAll() && restoreAllMocks(),
        spyOnProp,
    });
};

export * from "../typings/globals";

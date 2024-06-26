import {
    AnyObject,
    ExtendJest,
    IsMockProp,
    MockProp,
    PropertyAccessors,
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

class MockPropInstance<
    T extends AnyObject,
    K extends keyof T,
    A extends PropertyAccessors<T, K>,
> implements MockProp<T, K>
{
    private initialPropDescriptor: PropertyDescriptor;
    private initialPropValue: T[K];
    private object: T;
    private propName: K;
    private propValue: T[K];
    private propValues: T[K][] = [];

    constructor(params: { object: T; propName: K; accessType: A }) {
        this.initialPropDescriptor = this.validate(params);
        this.object = params.object;
        this.propName = params.propName;
        this.initialPropValue = params.object[params.propName];
        this.propValue = this.initialPropValue;
        this.attach(params.accessType);
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
        accessType,
    }: {
        object: T;
        propName: K;
        accessType: A;
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
        if (!descriptor.configurable && accessType !== "set") {
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
    private attach = (accessType?: A): void => {
        // if using set access type then redefine configurable property
        if (accessType === "set") {
            // TODO: Cannot delete property unconfigurable `propName` of `object`
            delete this.object[this.propName];
        }
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

export const clearAllMocks = (): void =>
    getAllSpies().forEach((spy) => spy.mockClear());

export const resetAllMocks = (): void =>
    getAllSpies().forEach((spy) => spy.mockReset());

export const restoreAllMocks = (): void =>
    getAllSpies().forEach((spy) => spy.mockRestore());

export const spyOnProp: SpyOnProp = (object, propName, accessType) => {
    if (isMockProp(object, propName)) {
        return spiedOn.get(object).get(propName);
    }
    return new MockPropInstance({ object, propName, accessType });
};

export const extend: ExtendJest = (jestInstance: typeof jest): void => {
    const jestClearAll = jestInstance.clearAllMocks;
    const jestResetAll = jestInstance.resetAllMocks;
    const jestRestoreAll = jestInstance.restoreAllMocks;
    const jestSpyOn = jestInstance.spyOn;
    Object.assign(jestInstance, {
        isMockProp,
        clearAllMocks: () => jestClearAll() && clearAllMocks(),
        resetAllMocks: () => jestResetAll() && resetAllMocks(),
        restoreAllMocks: () => jestRestoreAll() && restoreAllMocks(),
        spyOn: <
            T extends AnyObject,
            Key extends keyof T,
            A extends PropertyAccessors<T, Key> = PropertyAccessors<T, Key>,
        >(
            object: T,
            propName: Key,
            accessType: A,
        ) => {
            try {
                // @ts-expect-error incompatiblity with access types
                return jestSpyOn(object, propName, accessType);
            } catch (e) {
                return spyOnProp(object, propName, accessType);
            }
        },
        spyOnProp,
    });
};

export * from "../typings/globals";

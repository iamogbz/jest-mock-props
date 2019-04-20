const messages = {
    error: {
        noMethodSpy: "Can not spy on method. Please use `jest.spyOn`",
    },
};

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
            const get = () => this.value;
            const set = (v: any) => this.mockValue(v);
            Object.defineProperty(object, propName, { get, set });
        }
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
    }

    public mockValue = (v: any): MockProp => {
        this.propValues = [];
        this.propValue = v;
        return this;
    }

    public mockValueOnce = (v: any): MockProp => {
        this.propValues.push(v);
        return this;
    }

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

    get value(): any {
        const propValue = this.propValues.pop() || this.propValue;
        return propValue && Object.assign(propValue, { mock: this });
    }
}

const spies: Set<MockProp> = new Set();
const extend = (jestInstance: typeof jest) => {
    const resetAllMocks = jestInstance.resetAllMocks;
    const restoreAllMocks = jestInstance.restoreAllMocks;
    Object.assign(jestInstance, {
        isMockProp: (object: any): boolean =>
            object && object.mock instanceof MockProp,
        resetAllMocks: (): void => {
            resetAllMocks();
            spies.forEach(spy => spy.mockReset());
        },
        restoreAllMocks: (): void => {
            restoreAllMocks();
            spies.forEach(spy => spy.mockRestore());
        },
        spyOnProp: (object: AnyObject, propName: string): MockProp => {
            const spy = new MockProp({ object, propName });
            spies.add(spy);
            return spy;
        },
    });
};

export default extend; // tslint:disable-line: no-default-export

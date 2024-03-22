export default {
    error: {
        invalidSpy: <T>(o: T): string => {
            const helpfulValue = `${o ? typeof o : ""}'${o}'`;
            return `Cannot spyOn on a primitive value; ${helpfulValue} given.`;
        },
        noMethodSpy: <K>(p: K): string =>
            `Cannot spy on the property '${p}' because it is a function. Please use \`jest.spyOn\`.`,
        noUnconfigurableSpy: <K>(p: K): string =>
            `Cannot spy on the property '${p}' because it is not configurable. Use 'set' as the \`accessType\` to overwrite.`,
    },
    warn: {
        noUndefinedSpy: <K>(p: K): string =>
            `Spying on an undefined property '${p}'.`,
    },
};

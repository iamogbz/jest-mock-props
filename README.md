# Jest Mock Props

[![Dependabot badge](https://badgen.net/github/dependabot/iamogbz/jest-mock-props/?icon=dependabot)](https://app.dependabot.com)
[![Dependencies](https://img.shields.io/librariesio/github/iamogbz/jest-mock-props)](https://libraries.io/github/iamogbz/jest-mock-props)
[![Build Status](https://github.com/iamogbz/jest-mock-props/workflows/Build/badge.svg)](https://github.com/iamogbz/jest-mock-props/actions?query=workflow%3ABuild)
[![Coverage Status](https://coveralls.io/repos/github/iamogbz/jest-mock-props/badge.svg)](https://coveralls.io/github/iamogbz/jest-mock-props)
[![NPM Version](https://img.shields.io/npm/v/jest-mock-props.svg)](https://www.npmjs.com/package/jest-mock-props)

Extends jest to allow easy mocking of object and module properties.

> Also see [jest-mock-module](https://github.com/iamogbz/jest-mock-module) for non destructive spying on imported modules by automatically shimming module properties

## Introduction

### Getting Started

Install the extension using [npm](https://docs.npmjs.com/cli/install.html) or [yarn](https://yarnpkg.com/en/docs/usage)

```sh
npm install -D 'jest-mock-props'
```

## API Reference

### Mock Properties

Mock properties are "spies" that let you control the behavior of a property that is accessed indirectly by some other code.

These are the methods available on every mocked property spy object.

#### `spy.mockClear()`

Equivalent to [mockReset](#spymockreset).

#### `spy.mockReset()`

Removes any mocked values.

This is useful when you want to completely reset a property back to its initial value.

#### `spy.mockRestore()`

Restores the original (non-mocked) value.

This is useful when you want to mock properties in certain test cases and restore the original value in others.

#### `spy.mockValue(value)`

Accepts a value that should be result of accessing the mocked property.

**Note**: This is the same function used when setting the mocked property directly; e.g. `obj.mockedProp = 'newValue'`

#### `spy.mockValueOnce(value)`

Accepts a value that will be result of a single access to the mocked property. Can be chained so that multiple accesses produce different results. See [example](#videotestjs).

**Note**: When the mocked property runs out of values defined with `mockValueOnce`, it will have the default value set with `obj.mockedProp = 'defaultValue'` or `spy.mockValue(defaultValue)`.

### The Jest Object

The jest object needs to be extended in every test file. This allows mocked properties to be reset and restored with [`jest.resetAllMocks`](https://jestjs.io/docs/en/jest-object#jestresetallmocks) and [`jest.restoreAllMocks`](https://jestjs.io/docs/en/jest-object#jestrestoreallmocks) respectively.

#### `jest.isMockProp(object, propertyName)`

Determines if the given object property has been mocked.

#### `jest.spyOnProp(object, propertyName)`

**Note**: This is aliased as `jest.spyOn` as of `v1.9.0`, overriding the existing `jest.spyOn` to use `spyOnProp` when spying on a regular object property.

Creates a mock property attached to `object[propertyName]` and returns a mock property spy object, which controls all access to the object property. Repeating spying on the same object property will return the same mocked property spy.

**Note**: By default, `spyOnProp` preserves the object property value. If you want to overwrite the original value, you can use `jest.spyOnProp(object, propertyName).mockValue(customValue)` or [`jest.spyOn(object, methodName, accessType?)`](https://jestjs.io/docs/en/jest-object#jestspyonobject-methodname-accesstype) to spy on a getter or a setter.

## Example

### video.js

```js
const video = {
    length: 1000,
};

module.exports = video;
```

### video.test.js

```js
import * as mockProps from "jest-mock-props";
mockProps.extend(jest);

const video = require("./video");

it("mocks video length", () => {
    const spy = jest.spyOn(video, "length");
    spy.mockValueOnce(200)
        .mockValueOnce(400)
        .mockValueOnce(600);
    expect(video.length).toEqual(200);
    expect(video.length).toEqual(400);

    video.length = 800;
    expect(video.length).toEqual(800);

    spy.mockReset();
    expect(video.length).toEqual(1000);
    expect(jest.isMockProp(video, "length")).toBe(true);

    spy.mockRestore();
    expect(jest.isMockProp(video, "length")).toBe(false);
});
```

### Related
* [Spy on JS modules using jest mock](https://www.npmjs.com/package/jest-mock-module)

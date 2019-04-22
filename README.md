# Jest Mock Props

[![Greenkeeper badge](https://badges.greenkeeper.io/iamogbz/jest-mock-props.svg)](https://greenkeeper.io/)
[![Dependencies](https://david-dm.org/iamogbz/jest-mock-props.svg)](https://github.com/iamogbz/jest-mock-props)
[![Build Status](https://travis-ci.org/iamogbz/jest-mock-props.svg?branch=master)](https://travis-ci.org/iamogbz/jest-mock-props)
[![Coverage Status](https://coveralls.io/repos/github/iamogbz/jest-mock-props/badge.svg?branch=master&cache=1)](https://coveralls.io/github/iamogbz/jest-mock-props?branch=master)
[![NPM Version](https://img.shields.io/npm/v/jest-mock-props.svg)](https://www.npmjs.com/package/jest-mock-props)

Extends jest to allow easy mocking of object and module properties.

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

#### `mockProp.mockClear()`

**This throws an error**. Only implemented to differentiate behaviour from [`mockProp.mockReset()`](#mockpropmockreset). This does not change the mocked value, therefore is unaffected by `jest.clearAllMocks`.

#### `mockProp.mockReset()`

Removes any mocked values.

This is useful when you want to completely reset a property back to its initial value.

#### `mockProp.mockRestore()`

Restores the original (non-mocked) value.

This is useful when you want to mock properties in certain test cases and restore the original value in others.

### The Jest Object

The jest object needs to be extended in every test file. This allows mocked properties to be reset and restored with [`jest.resetAllMocks`](https://jestjs.io/docs/en/jest-object#jestresetallmocks) and [`jest.restoreAllMocks`](https://jestjs.io/docs/en/jest-object#jestrestoreallmocks) respectively.

#### `jest.isMockProp(object, propertyName)`

Determines if the given object property has been mocked.

#### `jest.spyOnProp(object, propertyName)`

Creates a mock property attached to `object[propertyName]` and returns a mock property spy object, which controls all access to the object property.

**Note**: By default, `spyOnProp` preserves the object property value. If you want to overwrite the original value, you can use `jest.spyOnProp(object, methodName).mockValue(customValue);` or [`jest.spyOn(object, methodName, accessType?)`](https://jestjs.io/docs/en/jest-object#jestspyonobject-methodname-accesstype) to spy on a getter or a setter.

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
    const spy = jest.spyOnProp(video, "length");
    spy.mockValueOnce(200)
        .mockValueOnce(400)
        .mockValueOnce(600);
    expect(video.length).toEqual(600);
    expect(video.length).toEqual(400);

    video.length = 512;
    expect(video.length).toEqual(1000);
    expect(video.length.mock).toEqual(spy);

    spy.mockReset();
    expect(video.length).toEqual(1000);
    expect(jest.isMockProp(video.length)).toBe(true);

    spy.mockRestore();
    expect(jest.isMockProp(video.length)).toBe(false);
});
```

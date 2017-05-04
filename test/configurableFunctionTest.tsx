import { createConfigurableFunction } from '../src';
import * as assert from 'assert';
import 'mocha';

describe('createConfigurableFunction', () => {
  const subtract = (args: { a: number, b: number }) => {
    return args.a - args.b;
  };

  describe('lock', () => {
    it('should allow you to lock certain parameters so they cant be overridden', () => {
      const configurableSubtract = createConfigurableFunction(subtract);
      const subtractFrom3 = configurableSubtract.lock({ a: 3 });
      assert.equal(subtractFrom3({ a: 5, b: 2 }), 1);
    });

    it('should allow you to default certain parameters so they arent required', () => {
      const configurableSubtract = createConfigurableFunction(subtract);
      const subtractFrom3 = configurableSubtract.lock({ a: 3 });
      assert.equal(subtractFrom3({ b: 1 }), 2);
    });

    it('should allow you to specify many arguments at once', () => {
      const configurableSubtract = createConfigurableFunction(subtract);
      const subtractWithAllArgsLocked = configurableSubtract.lock({ a: 10, b: 4 });
      assert.equal(subtractWithAllArgsLocked({ a: 5, b: 2 }), 6);
    });

    it('should not allow you to override previous locked values with new calls to lock out of strict mode', () => {
      const configurableSubtract = createConfigurableFunction(subtract);
      const subtractFrom3 = configurableSubtract.lock({ a: 3 });
      const brokenSubtractFrom4 = subtractFrom3.lock({ a: 4 });
      assert.equal(brokenSubtractFrom4({ b: 1 }), 2);
    });

    it('should error if you try to override previous locked values with new calls to lock in strict mode', () => {
      const configurableSubtract = createConfigurableFunction(subtract, true);
      const subtractFrom3 = configurableSubtract.lock({ a: 3 });
      assert.throws(
        () => subtractFrom3.lock({ a: 4 }),
        (err: Error) => err.message === 'These keys have already been locked: a'
      );
    });

    it('should not alter the original function', () => {
      const configurableSubtract = createConfigurableFunction(subtract);
      const subtractFrom3 = configurableSubtract.lock({ a: 3 });
      assert.equal(subtractFrom3({ a: 5, b: 2 }), 1);
      assert.equal(configurableSubtract({ a: 5, b: 2 }), 3);
    });
  });

  describe('default', () => {
    it('should allow you to default certain parameters so they can be overriden', () => {
      const configurableSubtract = createConfigurableFunction(subtract);
      const subtractFrom3Optionally = configurableSubtract.default({ a: 3 });
      assert.equal(subtractFrom3Optionally({ a: 5, b: 1 }), 4);
    });

    it('should allow you to default certain parameters so they arent required', () => {
      const configurableSubtract = createConfigurableFunction(subtract);
      const subtractFrom3Optionally = configurableSubtract.default({ a: 3 });
      assert.equal(subtractFrom3Optionally({ b: 1 }), 2);
    });

    it('should allow you to specify many arguments at once', () => {
      const configurableSubtract = createConfigurableFunction(subtract);
      const subtractWithAllArgsDefaulted = configurableSubtract.default({ a: 10, b: 3 });
      assert.equal(subtractWithAllArgsDefaulted(), 7);
    });

    it('should allow you to override previous defaults with new calls to default', () => {
      const configurableSubtract = createConfigurableFunction(subtract);
      const subtractFrom3Optionally = configurableSubtract.default({ a: 3 });
      const subtractFrom4Optionally = subtractFrom3Optionally.default({ a: 4 });
      assert.equal(subtractFrom4Optionally({ b: 1 }), 3);
    });

    it('should not alter the original function', () => {
      const configurableSubtract = createConfigurableFunction(subtract);
      const subtractFrom3Optionally = configurableSubtract.default({ a: 3 });
      assert.equal(subtractFrom3Optionally({ a: 5, b: 1 }), 4);
      assert.equal(configurableSubtract({ a: 5, b: 2 }), 3);
    });

    it('should override the property entirely by default', () => {
      function funcWithOptions({ options }: { options: { x: number, y: number } }) {
        return options;
      }

      const configurableFunc = createConfigurableFunction(funcWithOptions);
      const configurableFuncWithDefault = configurableFunc.default({ options: { x: 1 } });
      const result = configurableFuncWithDefault({ options: { y: 2 } });
      assert.equal(result.x, undefined);
      assert.equal(result.y, 2);
    });

    it.skip('should merge the properties when the merge option is true', () => {
      function funcWithOptions({ options }: { options: { x: number, y: number } }) {
        return options;
      }

      const configurableFunc = createConfigurableFunction(funcWithOptions);
      const configurableFuncWithDefault = configurableFunc.default({ options: { x: 1 } }); // pass merge option here
      const result = configurableFuncWithDefault({ options: { y: 2 } });
      assert.equal(result.x, 1);
      assert.equal(result.y, 2);
    });
  });

  describe('splat', () => {
    it('should create a new function which can be called with regular params', () => {
      const configurableSubtract = createConfigurableFunction(subtract);
      const reversedSubtract = configurableSubtract.splat('a', 'b');
      assert.equal(reversedSubtract(3, 2), 1);
    });

    it('should be able to reorder the params according to the args', () => {
      const configurableSubtract = createConfigurableFunction(subtract);
      const reversedSubtract = configurableSubtract.splat('b', 'a');
      assert.equal(reversedSubtract(2, 3), 1);
    });

    it('should not allow you to override previous locked values out of strict mode', () => {
      const configurableSubtract = createConfigurableFunction(subtract);
      const subtractFrom3 = configurableSubtract.lock({ a: 3 });
      const splattedSubtractFrom3 = subtractFrom3.splat('a', 'b');
      assert.equal(splattedSubtractFrom3(4, 1), 2);
    });

    it('should error if you try to override previous locked values in strict mode', () => {
      const configurableSubtract = createConfigurableFunction(subtract, true);
      const subtractFrom3 = configurableSubtract.lock({ a: 3 });
      assert.throws(
        () => subtractFrom3.splat('a', 'b'),
        (err: Error) => err.message === 'These keys have already been locked: a'
      );
    });

    it('should allow you to override previous defaulted values', () => {
      const configurableSubtract = createConfigurableFunction(subtract);
      const subtractFrom3 = configurableSubtract.default({ a: 3 });
      const splattedSubtractFrom3 = subtractFrom3.splat('a', 'b');
      assert.equal(splattedSubtractFrom3(4, 1), 3);
    });

    it('should not override defaulted values with undefined if you dont provide all args', () => {
      const configurableSubtract = createConfigurableFunction(subtract);
      const subtractFrom3 = configurableSubtract.default({ b: 3 });
      const splattedSubtractFrom3 = subtractFrom3.splat('a', 'b');
      assert.equal(splattedSubtractFrom3(4), 1);
    });
  });

  describe('splatLast', () => {
    type MapParams = {
      array: string[];
      iteratee: (el: string) => any;
    }
    const map = ({ array, iteratee }: MapParams) => array.map(iteratee);

    it('should create a new function which can be called with regular params', () => {
      const configurableMap = createConfigurableFunction(map);
      const configurableMapToUpperCase = configurableMap.lock({
        iteratee: (x: string) => x.toUpperCase()
      });
      const mapToUpperCase = configurableMapToUpperCase.splatLast('array');
      assert.deepEqual(mapToUpperCase('hello', 'world'), ['HELLO', 'WORLD']);
    });

    it('should not allow you to override previous locked values out of strict mode', () => {
      const configurableMap = createConfigurableFunction(map);
      const configurableMapToUpperCase = configurableMap.lock({
        array: [],
        iteratee: (x: string) => x.toUpperCase()
      });
      const mapToUpperCase = configurableMapToUpperCase.splatLast('array');
      assert.deepEqual(mapToUpperCase('hello', 'world'), []);
    });

    it('should error if you try to override previous locked values in strict mode', () => {
      const configurableMap = createConfigurableFunction(map, true);
      const configurableMapToUpperCase = configurableMap.lock({
        array: [],
        iteratee: (x: string) => x.toUpperCase()
      });

      assert.throws(
        () => configurableMapToUpperCase.splatLast('array'),
        (err: Error) => err.message === 'These keys have already been locked: array'
      );
    });

    it('should allow you to override previous defaulted values', () => {
      const configurableMap = createConfigurableFunction(map);
      const configurableMapToUpperCase = configurableMap.default({
        array: [],
        iteratee: (x: string) => x.toUpperCase()
      });
      const mapToUpperCase = configurableMapToUpperCase.splatLast('array');
      assert.deepEqual(mapToUpperCase('hello', 'world'), ['HELLO', 'WORLD']);
    });

    it('should allow you to splat multiple parameters', () => {
      const configurableMap = createConfigurableFunction(map);
      const mapToUpperCase = configurableMap.splatLast('iteratee', 'array');
      assert.deepEqual(mapToUpperCase((x: string) => x.toUpperCase(), 'hello', 'world'), ['HELLO', 'WORLD']);
    });
  });
});

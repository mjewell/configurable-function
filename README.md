# Configurable Function

## API

### `createConfigurableFunction`

Configurable functions take a single argument, an object, and inspect that object's values instead of taking multiple parameters. Using the destructuring syntax in modern javascript, they look pretty similar, you simply wrap the param names in curly braces, so a `map` function would look something like this:

```
// regular
const map = (arr, iteratee) => arr.map(iteratee);
map([1, 2], x => x * 2);

// configurable
const map = ({ arr, iteratee }) => arr.map(iteratee);
map({ arr: [1, 2], iteratee: x => x * 2 });
```

The benefit comes when we want to provide some arguments in advance. For regular functions we can use partial application, which looks like this:

```
const map = arr => iteratee => arr.map(iteratee);
const mapWithFixedArray = map([1, 2]);
mapWithFixedArray(x => x * 2);
// can't build mapWithFixedIteratee without creating a custom function
```

With this implementation the order of the arguments is extremely important. We cannot provide the iteratee without having the array provided earlier.

With configurable functions you can lock arguments down, or set overrideable defaults, and you can provide them in any order. A configurable version of map would look like this:

```
const map = ({ arr, iteratee }) => arr.map(iteratee);
const configurableMap = createConfigurableFunction(map);
const mapWithFixedArray = configurableMap.lock({ arr: [1, 2] });
const mapWithFixedIteratee = configurableMap.lock({ iteratee: x => x * 2 });
```

Configurable functions provide the following API

### `lock`

`lock` takes an object with params to lock down and returns a new configurable function where the locked values cannot be overridden.

```
const sum = ({ a, b, c }) => a + b + c;
const configurableSum = createConfigurableFunction(sum);
const sumWith1 = configurableSum.lock({ a: 1 })
// 1 + 4 + 5 because 'a' cannot be overridden
sumWith1({ a: 3, b: 4, c: 5}); // 10
```

### `default`

`default` takes an object with params to set defaults for and returns a new configurable function where the defaulted values can be overridden, but are no longer required.

```
const sum = ({ a, b, c }) => a + b + c;
const configurableSum = createConfigurableFunction(sum);
const sumWith1 = configurableSum.lock({ a: 1, b: 2 })
// 1 + 4 + 5 because 'a' has a default and 'b' is overridden
sumWith1({ b: 4, c: 5}); // 10
```

### `splat`

`splat` takes a series of strings as arguments, where each string refers to the name of an argument. It returns a regular function which takes each of those params, in order.

```
const sum = ({ a, b, c }) => a + b + c;
const configurableSum = createConfigurableFunction(sum);
const sumWith1 = configurableSum.lock({ a: 1 })
const sum2Args = sumWith1.splat('b', 'c');
sum2Args(4, 5); // 10;
```

### `splatLast`

`splatLast` is similar to splat, but if there are more arguments than strings that were provided, all additional ones will be collected together into an array for the last param name.

```
const map = ({ arr, iteratee }) => arr.map(iteratee);
const configurableMap = createConfigurableFunction(map);
const splattedMapToUpperCase = configurableMap.splatLast('iteratee', 'arr');
splattedMapToUpperCase(x => x.toUpperCase(), 'a', 'b', 'c'); // ['A', 'B', 'C']
```

import { IConfigurableFunction, IMap } from './types';

function mergeParams(
  params: IMap<any>,
  lockedParams: IMap<any>,
  defaultParams: IMap<any>
) {
  return {
    ...defaultParams,
    ...params,
    ...lockedParams
  };
}

function getRepeatedKeys(newParams: IMap<any> | string[], params: IMap<any>) {
  const newKeys =
    newParams instanceof Array ? newParams : Object.keys(newParams);
  return newKeys.filter(key => params.hasOwnProperty(key));
}

function throwIfParamsAreLocked(
  newParams: IMap<any> | string[],
  lockedParams: IMap<any>,
  strict: boolean
) {
  if (strict) {
    const repeats = getRepeatedKeys(newParams, lockedParams);
    if (repeats.length > 0) {
      throw new Error(
        `These keys have already been locked: ${repeats.join(', ')}`
      );
    }
  }
}

function createNamedArgs(propNames: string[], args: any[]) {
  return args.reduce(
    (props, arg, i) => ({
      ...props,
      [propNames[i]]: arg
    }),
    {}
  );
}

function callFuncWithAllParams(params: IMap<any>) {
  const mergedParams = mergeParams(
    params,
    this.lockedParams,
    this.defaultParams
  );
  return this.func(mergedParams);
}

const configurableFunctionPrototype = {
  lock<T>(newLockedParams: IMap<any>) {
    throwIfParamsAreLocked(newLockedParams, this.lockedParams, this.strict);
    const mergedLockedParams = {
      ...newLockedParams,
      ...this.lockedParams
    };
    return createConfigurableFunctionBase<T>(
      this.func,
      mergedLockedParams,
      this.defaultParams,
      this.strict
    );
  },

  default<T>(newDefaultParams: IMap<any>) {
    throwIfParamsAreLocked(newDefaultParams, this.lockedParams, this.strict);
    const mergedDefaultParams = {
      ...this.defaultParams,
      ...newDefaultParams
    };
    return createConfigurableFunctionBase<T>(
      this.func,
      this.lockedParams,
      mergedDefaultParams,
      this.strict
    );
  },

  splat(...paramNames: string[]) {
    throwIfParamsAreLocked(paramNames, this.lockedParams, this.strict);

    return (...args: any[]) => {
      const newParams = createNamedArgs(paramNames, args);
      return callFuncWithAllParams.call(this, newParams);
    };
  },

  splatLast(...paramNames: string[]) {
    throwIfParamsAreLocked(paramNames, this.lockedParams, this.strict);

    return (...args: any[]) => {
      const [lastParamName, ...firstParamNames] = paramNames.reverse();
      const newParams = {
        ...createNamedArgs(firstParamNames, args),
        [lastParamName]: args.slice(firstParamNames.length)
      };
      return callFuncWithAllParams.call(this, newParams);
    };
  }
};

Object.setPrototypeOf(configurableFunctionPrototype, Function.prototype);

function createConfigurableFunctionBase<T>(
  func: (params?: IMap<any>) => T,
  lockedParams: IMap<any>,
  defaultParams: IMap<any>,
  strict?: boolean
) {
  const configurableFunction: IConfigurableFunction<T> = <IConfigurableFunction<
    T
  >>function(params?: IMap<any>) {
    const mergedParams = mergeParams(params || {}, lockedParams, defaultParams);
    // TODO: allow lock/default functions so you can initialize something at run time instead of config time
    // TODO: add after group?
    return func(mergedParams);
  };

  configurableFunction.func = func;
  configurableFunction.lockedParams = lockedParams;
  configurableFunction.defaultParams = defaultParams;
  configurableFunction.strict = !!strict;

  Object.setPrototypeOf(configurableFunction, configurableFunctionPrototype);

  return configurableFunction;
}

export function createConfigurableFunction<T>(
  func: (params?: IMap<any>) => T,
  strict?: boolean
) {
  return createConfigurableFunctionBase<T>(func, {}, {}, strict);
}

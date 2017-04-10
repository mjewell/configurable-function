export interface IMap<T> {
  [key: string]: T;
}

export interface IConfigurableFunction<T> {
  (params?: IMap<any>): T;
  func: (params?: IMap<any>) => T;
  lockedParams: IMap<any>;
  defaultParams: IMap<any>;
  strict: boolean;
  lock: (params: IMap<any>) => IConfigurableFunction<T>;
  default: (params: IMap<any>) => IConfigurableFunction<T>;
  splat: (...paramNames: string[]) => (...args: any[]) => T;
  splatLast: (...paramNames: string[]) => (...args: any[]) => T;
}

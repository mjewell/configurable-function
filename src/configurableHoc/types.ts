import * as React from 'react';

import { Hash, IPropTransform } from '../types';

// TODO: remove this additional case when types/react handles it
export type IHoc<Props> = (
  WrappedComponent: typeof React.Component
) => React.ComponentType<Props> | ((props: Props) => JSX.Element | null);

export type IConfiguredHoc<Props, HocProps> = (
  generateHocProps: IPropTransform<Props, HocProps>
) => IHoc<Props>;

export type IHocProps<Props, HocProps> =
  | Partial<HocProps>
  | IPropTransform<Props, Partial<HocProps>>;

export type IPropsDescriptor<Props, HocProps> = {
  type: 'default' | 'locked';
  props: IHocProps<Props, HocProps>;
};

export type IAfterTransform<Props, HocProps> = (
  hocProps: Partial<HocProps>,
  props: Props
) => Partial<HocProps>;

export interface IConfigurableHoc<Props, HocProps> {
  (props?: IHocProps<Props, HocProps>): IHoc<Props>;
  hoc: IConfiguredHoc<Props, HocProps>;
  propsArray: IPropsDescriptor<Props, HocProps>[];
  afterArray: IAfterTransform<Props, HocProps>[];
  lock: (
    props: IHocProps<Props, HocProps>
  ) => IConfigurableHoc<Props, HocProps>;
  default: (
    props: IHocProps<Props, HocProps>
  ) => IConfigurableHoc<Props, HocProps>;
  after: (
    afterCallback: IAfterTransform<Props, HocProps>
  ) => IConfigurableHoc<Props, HocProps>;
}

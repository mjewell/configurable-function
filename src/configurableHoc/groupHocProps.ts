import { IHocProps, IPropsDescriptor } from './types';

export type IGroupedHocProps<HocProps> = {
  defaults: Partial<HocProps>;
  params: Partial<HocProps>;
  locks: Partial<HocProps>;
};

function evaluateHocProps<Props, HocProps>(
  hocProps: IHocProps<Props, HocProps>,
  componentProps: Props
) {
  if (typeof hocProps === 'function') {
    return hocProps(componentProps);
  }

  return hocProps;
}

export function groupHocProps<Props, HocProps>(
  hocProps: IHocProps<Props, HocProps>,
  propsArray: IPropsDescriptor<Props, HocProps>[],
  componentProps: Props
): IGroupedHocProps<HocProps> {
  let defaults = {};
  let locks = {};

  propsArray.map(({ type, props }) => {
    if (type === 'default') {
      defaults = {
        ...defaults,
        ...evaluateHocProps(props, componentProps) as any
      };
    } else {
      locks = {
        ...evaluateHocProps(props, componentProps) as any,
        ...locks
      };
    }
  });

  return {
    defaults,
    params: evaluateHocProps(hocProps, componentProps) as any,
    locks
  };
}

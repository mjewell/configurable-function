import { Hash } from '../types';
import { groupHocProps } from './groupHocProps';
import { runAfters } from './runAfters';
import { setPrototypeOf } from './setPrototypeOf';
import {
  IAfterTransform,
  IConfigurableHoc,
  IConfiguredHoc,
  IHocProps,
  IPropsDescriptor
} from './types';

const configurableHocPrototype = {
  lock<Props, HocProps>(newLockedParams: IHocProps<Props, HocProps>) {
    return createHocBase(
      this.hoc,
      [...this.propsArray, { props: newLockedParams, type: 'locked' }],
      this.afterArray
    );
  },

  default<Props, HocProps>(newDefaultParams: IHocProps<Props, HocProps>) {
    return createHocBase(
      this.hoc,
      [...this.propsArray, { props: newDefaultParams, type: 'default' }],
      this.afterArray
    );
  },

  after<Props, HocProps>(afterCallback: IAfterTransform<Props, HocProps>) {
    return createHocBase(this.hoc, this.propsArray, [
      ...this.afterArray,
      afterCallback
    ]);
  }
};

setPrototypeOf(configurableHocPrototype, Function.prototype);

function createHocBase<Props, HocProps>(
  hoc: IConfiguredHoc<Props, HocProps>,
  propsArray: IPropsDescriptor<Props, HocProps>[] = [],
  afterArray: IAfterTransform<Props, HocProps>[] = []
) {
  const configurableHoc = <IConfigurableHoc<Props, HocProps>>function(
    hocProps?: IHocProps<Props, HocProps>
  ) {
    return hoc(componentProps => {
      const groupedHocProps = groupHocProps(
        hocProps || {},
        propsArray,
        componentProps
      );

      return runAfters(afterArray, groupedHocProps, componentProps);
    });
  };

  configurableHoc.hoc = hoc;
  configurableHoc.propsArray = propsArray;
  configurableHoc.afterArray = afterArray;

  setPrototypeOf(configurableHoc, configurableHocPrototype);

  return configurableHoc;
}

export function createHoc<HocProps, Props = Hash>(
  hoc: IConfiguredHoc<Props, HocProps>
) {
  return createHocBase<Props, HocProps>(hoc);
}

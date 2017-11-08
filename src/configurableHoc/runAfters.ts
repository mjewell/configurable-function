import { IAfterTransform } from './types';
import { IGroupedHocProps } from './groupHocProps';

export function runAfters<Props, HocProps>(
  afters: IAfterTransform<Props, HocProps>[],
  groupedHocProps: IGroupedHocProps<HocProps>,
  componentProps: Props
) {
  const { defaults, params, locks } = groupedHocProps;
  let defaultsAndParams = { ...defaults as any, ...params as any };
  let currentHocProps = { ...defaultsAndParams, ...locks as any };
  afters.forEach(after => {
    defaultsAndParams = {
      ...defaultsAndParams,
      ...after(currentHocProps, componentProps) as any
    };
    currentHocProps = { ...defaultsAndParams, ...locks as any };
  });

  return currentHocProps;
}

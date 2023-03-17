import { useContext, useMemo } from 'react';
import { BeanstalkSDKContext } from 'src/utils/sdk/SdkProvider';

export default function useSdk() {
  const sdk = useContext(BeanstalkSDKContext);
  if (!sdk) {
    throw new Error('Expected sdk to be used within BeanstalkSDK context');
  }
  return useMemo(() => sdk, [sdk]);
}

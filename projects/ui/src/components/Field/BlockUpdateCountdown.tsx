import React from 'react';
import { useSelector } from 'react-redux';
import { selectMorningBlockTime } from '~/state/beanstalk/sun';

const BlockUpdateCountdown: React.FC<{}> = () => {
  const { remaining } = useSelector(selectMorningBlockTime);

  return <>{remaining.toFormat('ss')} seconds</>;
};

export default BlockUpdateCountdown;

import { FC } from 'react';
import Skeleton from 'react-loading-skeleton';

interface LoadingProps { }

const Loading: FC<LoadingProps> = () => {
  const skeletonStyle = {
    backgroundColor: 'black',
    color: 'black',
  };

  return (
    <div className='w-full flex flex-col gap-3 text-black bg-black'>
      <Skeleton className='mb-4' height={60} width={500} style={skeletonStyle} />
      <Skeleton height={20} width={150} style={skeletonStyle} />
      <Skeleton height={50} width={400} style={skeletonStyle} />
    </div>
  );
};

export default Loading;

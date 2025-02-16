import React from 'react';
import { cn } from '@/lib/utils';

interface LoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
}

const Loader: React.FC<LoaderProps> = ({
  className,
  size = 'md',
  ...props
}) => {
  return (
    <div
      className={cn(
        'flex items-center justify-center',
        {
          'w-8 h-8': size === 'sm',
          'w-12 h-12': size === 'md',
          'w-16 h-16': size === 'lg',
        },
        className,
      )}
      {...props}
    >
      <div className="relative">
        {/* Outer circle (stadium) */}
        <div
          className={cn(
            'border-t-4 border-orange-400 rounded-full animate-spin',
            {
              'w-8 h-8': size === 'sm',
              'w-12 h-12': size === 'md',
              'w-16 h-16': size === 'lg',
            },
          )}
        ></div>

        {/* Inner circle (ball) */}
        <div
          className={cn(
            'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-full animate-bounce',
            {
              'w-2 h-2': size === 'sm',
              'w-3 h-3': size === 'md',
              'w-4 h-4': size === 'lg',
            },
          )}
        ></div>

        {/* Field lines */}
        <div
          className={cn(
            'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border-2 border-slate-400 rounded-full',
            {
              'w-6 h-6': size === 'sm',
              'w-9 h-9': size === 'md',
              'w-12 h-12': size === 'lg',
            },
          )}
        ></div>
      </div>
    </div>
  );
};

export { Loader };

import { cn } from '@/lib/utils';

export const PageContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        'w-full h-full p-3 bg-card flex flex-1 flex-col',
        className,
      )}
    >
      {children}
    </div>
  );
};

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

import { PageContainer } from './page-container';

type PageLoadingVariant = 'default' | 'list' | 'form' | 'detail';

export interface PageLoadingProps {
  variant?: PageLoadingVariant;
  className?: string;
  showToolbar?: boolean;
  title?: string;
}

const ToolbarSkeleton = () => (
  <div className="flex items-center justify-between gap-4 mb-4 shrink-0">
    <Skeleton className="h-8 w-48" />
    <div className="flex gap-2">
      <Skeleton className="h-9 w-9 rounded-md" />
      <Skeleton className="h-9 w-24 rounded-md" />
    </div>
  </div>
);

const ListSkeleton = () => (
  <div className="flex-1 rounded-lg border dark:bg-sidebar/50 overflow-hidden">
    <div className="bg-background dark:bg-sidebar px-3 py-2.5 border-b">
      <div className="flex gap-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-28 ml-auto" />
      </div>
    </div>
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="px-3 py-3 border-b last:border-0 animate-pulse">
        <div className="flex gap-4 items-center">
          <Skeleton className="h-3.5 w-20" />
          <Skeleton className="h-3.5 w-36" />
          <Skeleton className="h-3.5 w-16" />
          <Skeleton className="h-6 w-20 rounded-full ml-auto" />
        </div>
      </div>
    ))}
  </div>
);

const FormSkeleton = () => (
  <Card className="dark:bg-sidebar/50">
    <CardHeader className="space-y-2">
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-4 w-72" />
    </CardHeader>
    <CardContent className="space-y-5">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
      ))}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Skeleton className="h-10 w-24 rounded-md" />
        <Skeleton className="h-10 w-28 rounded-md" />
      </div>
    </CardContent>
  </Card>
);

const DetailSkeleton = () => (
  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
    <div className="lg:col-span-4">
      <Card className="dark:bg-sidebar/50">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex justify-between items-center">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
    <div className="lg:col-span-8">
      <Card className="dark:bg-sidebar/50">
        <CardHeader className="flex flex-row items-center justify-between">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-8 w-8 rounded-md" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-80 w-full rounded-md" />
        </CardContent>
      </Card>
    </div>
  </div>
);

const DefaultSkeleton = () => (
  <div className="flex flex-col gap-6 flex-1">
    <Skeleton className="h-10 w-64 rounded-md" />
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <Card className="dark:bg-sidebar/50">
        <CardHeader>
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-45 w-full rounded-md" />
        </CardContent>
      </Card>
      <Card className="dark:bg-sidebar/50">
        <CardHeader>
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-45 w-full rounded-md" />
        </CardContent>
      </Card>
    </div>
    <Card className="dark:bg-sidebar/50 flex-1">
      <CardHeader>
        <Skeleton className="h-5 w-48" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-70 w-full rounded-md" />
      </CardContent>
    </Card>
  </div>
);

const variantMap: Record<PageLoadingVariant, React.FC> = {
  default: DefaultSkeleton,
  list: ListSkeleton,
  form: FormSkeleton,
  detail: DetailSkeleton,
};

export function PageLoading({
  variant = 'default',
  className,
  showToolbar = true,
}: PageLoadingProps) {
  const SkeletonComponent = variantMap[variant];

  return (
    <PageContainer className={cn('flex flex-col', className)}>
      {showToolbar && <ToolbarSkeleton />}
      <SkeletonComponent />
    </PageContainer>
  );
}

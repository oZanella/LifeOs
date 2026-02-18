'use client';

import { FileX, FolderOpen, Plus, Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

import { PageContainer } from './page-container';

export type PageEmptyVariant = 'default' | 'search' | 'filter';

export interface PageEmptyProps {
  message?: string;
  description?: string;
  variant?: PageEmptyVariant;
  onAction?: () => void;
  actionLabel?: string;
  title?: string;
  className?: string;
}

const variantConfig: Record<
  PageEmptyVariant,
  {
    Icon: React.ElementType;
    defaultMessage: string;
    defaultDescription: string;
  }
> = {
  default: {
    Icon: FolderOpen,
    defaultMessage: 'Nenhum registro encontrado',
    defaultDescription: 'Adicione um novo registro para começar.',
  },
  search: {
    Icon: FileX,
    defaultMessage: 'Nenhum resultado encontrado',
    defaultDescription: 'Tente ajustar os termos da sua busca.',
  },
  filter: {
    Icon: Search,
    defaultMessage: 'Nenhum registro corresponde aos filtros',
    defaultDescription: 'Tente ajustar ou limpar os filtros aplicados.',
  },
};

export function PageEmpty({
  message,
  description,
  variant = 'default',
  onAction,
  actionLabel = 'Adicionar Novo',
  title,
  className,
}: PageEmptyProps) {
  const config = variantConfig[variant];
  const { Icon } = config;
  const displayMessage = message ?? config.defaultMessage;
  const displayDescription = description ?? config.defaultDescription;

  const content = (
    <Card
      className={cn('border-dashed bg-muted/30 dark:bg-sidebar/30', className)}
    >
      <CardContent className="py-16 px-8">
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <div className="rounded-full bg-muted/80 dark:bg-sidebar/60 p-5 ring-4 ring-muted/40 dark:ring-sidebar/40">
            <Icon
              className="h-10 w-10 text-muted-foreground/70"
              strokeWidth={1.5}
            />
          </div>

          <div className="space-y-1.5 max-w-sm">
            <p className="text-base font-medium text-foreground/80">
              {displayMessage}
            </p>
            <p className="text-sm text-muted-foreground">
              {displayDescription}
            </p>
          </div>

          {onAction && (
            <Button
              variant="outline"
              size="sm"
              onClick={onAction}
              className="mt-2 gap-2"
            >
              <Plus className="h-4 w-4" />
              {actionLabel}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (title) {
    return <PageContainer>{content}</PageContainer>;
  }

  return content;
}

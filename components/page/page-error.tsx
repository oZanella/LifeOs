'use client';

import { AlertCircle, RefreshCw, X } from 'lucide-react';

import { ListToolbar } from '@/components/list/list-toolbar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

import { PageContainer } from './page-container';

export interface PageErrorProps {
  message?: string;
  errorTitle?: string;
  onRetry?: () => void;
  onClose?: () => void;
  title?: string;
  className?: string;
}

export function PageError({
  message = 'Falha ao carregar os dados. Verifique sua conexão e tente novamente.',
  errorTitle = 'Erro ao Carregar',
  onRetry,
  onClose,
  title,
  className,
}: PageErrorProps) {
  const content = (
    <Card className={cn('border-destructive/40 shadow-md dark:bg-sidebar/50 max-w-md mx-auto', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <AlertCircle className="h-5 w-5" />
          {errorTitle}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert variant="destructive">
          <AlertDescription>{message}</AlertDescription>
        </Alert>

        <div className="flex gap-2">
          {onRetry && (
            <Button variant="outline" onClick={onRetry} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Tentar Novamente
            </Button>
          )}
          {onClose && (
            <Button variant="ghost" onClick={onClose} className="gap-2">
              <X className="h-4 w-4" />
              Fechar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  // Se tem title, renderiza com PageContainer + ListToolbar
  if (title) {
    return (
      <PageContainer>
        <ListToolbar title={title} />
        <div className="flex-1 flex items-center justify-center">{content}</div>
      </PageContainer>
    );
  }

  return content;
}

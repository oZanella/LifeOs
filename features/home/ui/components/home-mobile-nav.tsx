'use client';

import { cn } from '@/lib/utils';
import { badgeVariants } from '@/components/ui/badge';
import { lab_itens, type PageType } from '../tabs/home-config';

interface HomeMobileNavProps {
  activePage: PageType;
  onPageChange: (page: PageType) => void;
}

export function HomeMobileNav({
  activePage,
  onPageChange,
}: HomeMobileNavProps) {
  const mainItems = lab_itens.filter(
    (item) =>
      !item.disabled &&
      ['dashboard', 'financeiro', 'meta', 'configuracoes'].includes(item.id),
  );

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border/60 bg-background pb-safe md:hidden">
      <div className="mx-auto flex h-16 max-w-md items-center justify-around px-2">
        {mainItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onPageChange(item.id)}
              className="flex h-full w-16 flex-col items-center justify-center gap-1 cursor-pointer"
            >
              <div
                className={cn(
                  isActive &&
                    badgeVariants({ tone: item.tone, variant: 'subtle' }),
                  'flex h-8 w-8 items-center justify-center rounded-full border-none p-0 transition-colors',
                  !isActive && 'bg-transparent text-muted-foreground',
                )}
              >
                <Icon size={18} strokeWidth={isActive ? 2.25 : 2} />
              </div>
              <span
                className={cn(
                  'text-[10px] font-medium',
                  isActive ? 'text-foreground' : 'text-muted-foreground',
                )}
              >
                {item.label.split(' ')[0]}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

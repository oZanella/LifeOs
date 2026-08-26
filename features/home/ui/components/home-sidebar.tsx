'use client';

import { cn } from '@/lib/utils';
import { badgeVariants } from '@/components/ui/badge';
import { lab_itens, type PageType } from '../tabs/home-config';

interface HomeSidebarProps {
  activePage: PageType;
  onPageChange: (page: PageType) => void;
}

export function HomeSidebar({ activePage, onPageChange }: HomeSidebarProps) {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-border/60 bg-background p-4 md:flex lg:w-72">
      <p className="px-2 pb-3 text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
        Navegação
      </p>

      <nav className="flex flex-col gap-1">
        {lab_itens.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                if (!item.disabled) {
                  onPageChange(item.id);
                }
              }}
              disabled={item.disabled}
              className={cn(
                isActive && badgeVariants({ tone: item.tone, variant: 'subtle' }),
                'flex w-full items-center gap-3 rounded-xl border-none px-3 py-2.5 text-sm justify-start whitespace-normal',
                item.disabled
                  ? 'pointer-events-none opacity-40'
                  : isActive
                    ? 'font-medium'
                    : 'cursor-pointer bg-transparent text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground',
              )}
            >
              <Icon size={17} strokeWidth={isActive ? 2.25 : 2} />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

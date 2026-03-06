'use client';

import { cn } from '@/lib/utils';
import { lab_itens, type PageType } from '../tabs/home-config';

interface HomeMobileNavProps {
  activePage: PageType;
  onPageChange: (page: PageType) => void;
}

export function HomeMobileNav({
  activePage,
  onPageChange,
}: HomeMobileNavProps) {
  // Filtramos apenas os itens não desabilitados para a navegação móvel rápida
  // Limitamos aos principais: Dashboard, Financeiro e Configuracoes
  const mainItems = lab_itens.filter(
    (item) =>
      !item.disabled &&
      ['dashboard', 'financeiro', 'configuracoes'].includes(item.id),
  );

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden pb-safe">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-xl border-t border-border/50 shadow-[0_-8px_30px_rgb(0,0,0,0.12)]" />

      <div className="relative flex items-center justify-around h-16 px-4 max-w-md mx-auto">
        {mainItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onPageChange(item.id)}
              className={cn(
                'relative flex flex-col items-center justify-center gap-1 w-16 h-full transition-all duration-300',
                isActive
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <div
                className={cn(
                  'p-1.5 rounded-xl transition-all duration-300',
                  isActive
                    ? 'bg-primary/10 scale-110 shadow-sm'
                    : 'bg-transparent',
                )}
                style={isActive ? { color: `var(--tone-color)` } : {}}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              </div>

              <span
                className={cn(
                  'text-[10px] font-bold uppercase tracking-wider transition-opacity duration-300',
                  isActive ? 'opacity-100' : 'opacity-60',
                )}
              >
                {item.label.split(' ')[0]}
              </span>

              {isActive && (
                <div
                  className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full blur-[2px]"
                  style={{ backgroundColor: `var(--tone-color)` }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

'use client';

import { useEffect } from 'react';
import { PanelLeftCloseIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { HomeClock } from './home-clock';
import { HomeProfileCard } from './home-profile-card';
import { HomeProgressSummary } from './home-progress-summary';
import { HomeThemeToggle } from './home-theme-toggle';
import { lab_itens, type PageType } from '../tabs/home-config';
import { Button } from '@/components/ui/button';

interface HomeSidebarProps {
  activePage: PageType;
  onPageChange: (page: PageType) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function HomeSidebar({
  activePage,
  onPageChange,
  mobileOpen,
  onCloseMobile,
}: HomeSidebarProps) {
  const currentPage =
    lab_itens.find((item) => item.id === activePage) || lab_itens[0];
  const activeTone = currentPage.tone;

  useEffect(() => {
    if (!mobileOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileOpen]);

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px] transition-opacity md:hidden',
          mobileOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none',
        )}
        onClick={onCloseMobile}
      />

      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-dvh w-[86vw] max-w-85 bg-sidebar text-sidebar-foreground p-4 overflow-y-auto no-scrollbar transition-transform duration-300 md:static md:z-auto md:h-full md:w-72 lg:w-80 md:translate-x-0 md:bg-background md:text-foreground',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="mb-3 flex items-center justify-between md:hidden">
          <h2 className="text-sm font-black tracking-widest uppercase text-muted-foreground">
            Menu
          </h2>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-8 w-8 cursor-pointer"
            onClick={onCloseMobile}
          >
            <PanelLeftCloseIcon size={16} />
          </Button>
        </div>

        <div
          className="hidden md:block"
          style={{ color: 'var(--tone-color)' }}
        />
        <div className="flex flex-col items-stretch gap-4">
          <HomeProfileCard tone={activeTone} />
          <HomeClock tone={activeTone} />
          <HomeThemeToggle />

          <div className="rounded-2xl border border-border/50 bg-card/40 p-2">
            <p className="px-2 pb-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
              Navegação
            </p>
            <div className="space-y-1">
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
                        onCloseMobile();
                      }
                    }}
                    disabled={item.disabled}
                    className={cn(
                      'w-full flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors',
                      item.disabled
                        ? 'opacity-40 cursor-not-allowed grayscale pointer-events-none'
                        : isActive
                          ? 'bg-background border border-border/60 text-foreground'
                          : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground cursor-pointer',
                    )}
                  >
                    <Icon
                      size={16}
                      className={isActive ? 'text-(--tone-color)' : undefined}
                    />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <HomeProgressSummary tone={activeTone} />
        </div>
      </aside>
    </>
  );
}

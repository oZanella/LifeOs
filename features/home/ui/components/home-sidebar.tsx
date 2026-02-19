'use client';

import { HomeClock } from './home-clock';
import { HomeProfileCard } from './home-profile-card';
import { HomeProgressSummary } from './home-progress-summary';
import { HomeThemeToggle } from './home-theme-toggle';
import { lab_itens, type PageType } from '../tabs/home-config';

interface HomeSidebarProps {
  activePage: PageType;
}

export function HomeSidebar({ activePage }: HomeSidebarProps) {
  const currentPage =
    lab_itens.find((item) => item.id === activePage) || lab_itens[0];
  const activeTone = currentPage.tone;

  return (
    <aside
      className="hidden md:flex w-72 lg:w-80 h-full flex-col items-stretch gap-4 p-4 border-r transition-all duration-300 bg-background overflow-y-auto no-scrollbar shrink-0"
      style={{ borderColor: 'rgba(var(--tone-color-rgb, 255, 255, 255), 0.1)' }}
    >
      <div className="hidden" style={{ color: 'var(--tone-color)' }} />
      <HomeProfileCard tone={activeTone} />
      <HomeClock tone={activeTone} />
      <HomeThemeToggle />
      <HomeProgressSummary tone={activeTone} />

      <div className="mt-auto flex flex-col items-center justify-center p-4 bg-black/5 dark:bg-white/5 rounded-2xl border border-white/5 shadow-inner">
        <span className="text-[10px] text-gray-500 uppercase tracking-widest text-center">
          Life OS v1.0
        </span>
      </div>
    </aside>
  );
}

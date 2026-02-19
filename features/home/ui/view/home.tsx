'use client';

import { useState } from 'react';
import { HomeSidebar } from '../components/home-sidebar';
import { HomeNavigation } from '../components/home-navigation';
import { PageHeader } from '@/components/ui/page-header';
import { NAV_ITEMS, type PageType } from '../tabs/home-config';

export function Home() {
  const [activePage, setActivePage] = useState<PageType>('dashboard');

  const currentPage =
    NAV_ITEMS.find((item) => item.id === activePage) || NAV_ITEMS[0];
  const Content = currentPage.component;

  return (
    <div className="flex flex-col h-screen w-full bg-background text-foreground overflow-hidden font-sans selection:bg-primary/30">
      {/* Header - Full Width Top */}
      <PageHeader
        title="LIFE"
        highlightText="OS"
        subtitle="Sistema de Gestão Pessoal"
        tone={currentPage.tone}
      />

      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar - Below Header */}
        <HomeSidebar activePage={activePage} />

        <div className="flex-1 flex flex-col overflow-hidden relative">
          {/* Navigation - Inside content area */}
          <div className="px-6 py-4 z-10 sticky top-0 bg-background/80 backdrop-blur-md">
            <HomeNavigation
              activePage={activePage}
              onPageChange={(page) => setActivePage(page)}
            />
          </div>

          {/* Content Slot */}
          <main className="flex-1 overflow-y-auto px-6 pb-6 custom-scrollbar">
            <div className="max-w-7xl mx-auto">
              <Content />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

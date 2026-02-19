'use client';

import { useState } from 'react';
import { HomeSidebar } from '../components/home-sidebar';
import { HomeNavigation } from '../components/home-navigation';
import { PageHeader } from '@/components/ui/page-header';
import { lab_itens, type PageType } from '../tabs/home-config';

export function Home() {
  const [activePage, setActivePage] = useState<PageType>('dashboard');

  const currentPage =
    lab_itens.find((item) => item.id === activePage) || lab_itens[0];
  const Content = currentPage.component;

  return (
    <div className="flex flex-col h-screen w-full bg-background text-foreground overflow-hidden font-sans selection:bg-primary/30">
      <PageHeader
        title="LIFE"
        highlightText="OS"
        subtitle="Sistema de Gestão Pessoal"
        tone={currentPage.tone}
      />

      <div className="flex flex-1 overflow-hidden relative">
        <HomeSidebar activePage={'dashboard'} />

        <div className="flex-1 flex flex-col overflow-hidden relative">
          <div className="px-6 py-4 z-10 sticky top-0 bg-background/80 backdrop-blur-md">
            <HomeNavigation
              activePage={activePage}
              onPageChange={(page) => setActivePage(page)}
            />
          </div>

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

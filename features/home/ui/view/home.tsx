'use client';

import { useState } from 'react';
import { LogOut } from 'lucide-react';
import { HomeSidebar } from '../components/home-sidebar';
import { HomeNavigation } from '../components/home-navigation';
import { PageHeader } from '@/components/ui/page-header';
import { lab_itens, type PageType } from '../tabs/home-config';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/providers/auth-provider/auth.provider';
import { useHomeUserConfig } from '../../home-user-config';

export function Home() {
  const [activePage, setActivePage] = useState<PageType>('dashboard');
  const { logout } = useAuth();
  const userConfig = useHomeUserConfig();

  const currentPage =
    lab_itens.find((item) => item.id === activePage) || lab_itens[0];
  const Content = currentPage.component;

  return (
    <div className="flex flex-col min-h-dvh w-full bg-background text-foreground overflow-x-hidden font-sans selection:bg-primary/30">
      <Button
        className="fixed top-3 right-3 sm:top-4 sm:right-6 z-50 cursor-pointer"
        variant="outline"
        size="icon"
        onClick={() => logout()}
        aria-label="Sair do sistema"
        title="Sair"
      >
        <LogOut size={18} />
      </Button>

      <PageHeader
        title="LIFE"
        highlightText="OS"
        subtitle="Sistema de Gestão Pessoal"
        tone={currentPage.tone}
      >
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="text-[10px] sm:text-xs tracking-wide text-muted-foreground">
            <span className="font-bold">Usuário logado:</span> {userConfig.name}
          </span>
        </div>
      </PageHeader>

      <div className="flex flex-1 overflow-hidden relative">
        <HomeSidebar activePage={activePage} />

        <div className="flex-1 flex flex-col overflow-hidden relative">
          <div className="px-3 sm:px-6 py-3 sm:py-4 z-10 sticky top-0 bg-background/80 backdrop-blur-md">
            <HomeNavigation
              activePage={activePage}
              onPageChange={(page) => setActivePage(page)}
            />
          </div>

          <main className="flex-1 overflow-y-auto px-3 sm:px-6 pb-4 sm:pb-6 custom-scrollbar">
            <div className="max-w-7xl mx-auto">
              <Content tone={currentPage.tone} />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { LogOut, PanelLeft } from 'lucide-react';
import { HomeSidebar } from '../components/home-sidebar';
import { PageHeader } from '@/components/ui/page-header';
import { lab_itens, type PageType } from '../tabs/home-config';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/providers/auth-provider/auth.provider';
import { useHomeUserConfig } from '../../home-user-config';

export function Home() {
  const [activePage, setActivePage] = useState<PageType>('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { logout } = useAuth();
  const userConfig = useHomeUserConfig();

  const currentPage =
    lab_itens.find((item) => item.id === activePage) || lab_itens[0];
  const Content = currentPage.component;

  return (
    <div className="flex flex-col min-h-dvh w-full bg-background text-foreground overflow-x-hidden font-sans selection:bg-primary/30">
      <Button
        className="fixed top-3 left-3 z-50 md:hidden cursor-pointer"
        variant="outline"
        size="icon"
        onClick={() => setMobileSidebarOpen(true)}
        aria-label="Abrir menu lateral"
        title="Menu"
      >
        <PanelLeft size={18} />
      </Button>

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
        className="pl-16 sm:pl-6"
      >
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="text-[10px] sm:text-xs tracking-wide text-muted-foreground">
            <span className="font-bold">Usuário logado:</span> {userConfig.name}
          </span>
        </div>
      </PageHeader>

      <div className="flex flex-1 overflow-hidden relative">
        <HomeSidebar
          activePage={activePage}
          onPageChange={(page) => setActivePage(page)}
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />

        <div className="flex-1 flex flex-col overflow-hidden relative">
          <main className="flex-1 overflow-y-auto px-3 sm:px-6 pt-3 sm:pt-5 pb-4 sm:pb-6 custom-scrollbar">
            <div className="max-w-7xl mx-auto w-full">
              <Content tone={currentPage.tone} />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

'use client';

import { LogOut } from 'lucide-react';
import { HomeSidebar } from '../components/home-sidebar';
import { HomeMobileNav } from '../components/home-mobile-nav';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/page-header';
import { useState } from 'react';
import { lab_itens, PageType } from '../tabs/home-config';
import { useAuth } from '@/providers/auth-provider/auth.provider';
import { useHomeUserConfig } from '../../home-user-config';
import { ThemeToggle } from '@/components/ui/theme-toggle';

export function Home() {
  const [activePage, setActivePage] = useState<PageType>('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { logout } = useAuth();
  const userConfig = useHomeUserConfig();

  const currentPage =
    lab_itens.find((item) => item.id === activePage) || lab_itens[0];
  const Content = currentPage.component;

  return (
    <div className="flex flex-col min-h-dvh w-full bg-background text-foreground overflow-x-hidden font-sans">
      <PageHeader
        title="LIFE"
        highlightText="OS"
        subtitle="Sistema de Gestão Pessoal"
        tone={currentPage.tone}
        className="px-4 sm:px-6"
      >
        <div className="hidden xs:flex items-center gap-2">
          <span className="text-[10px] sm:text-xs tracking-wide text-muted-foreground uppercase">
            {userConfig.name}
          </span>
        </div>

        <div className="flex items-center gap-1 absolute top-2 right-2 sm:static">
          <ThemeToggle />

          <Button
            className="cursor-pointer"
            variant="link"
            size="icon"
            onClick={() => logout()}
          >
            <LogOut size={18} />
          </Button>
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
          <main className="flex-1 overflow-y-auto px-3 sm:px-6 pt-3 sm:pt-5 pb-20 sm:pb-6 custom-scrollbar">
            <div className="max-w-7xl mx-auto w-full">
              <Content tone={currentPage.tone} />
            </div>
          </main>
        </div>
      </div>

      <HomeMobileNav
        activePage={activePage}
        onPageChange={(page) => setActivePage(page)}
      />
    </div>
  );
}

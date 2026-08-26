'use client';

import { LogOut, User } from 'lucide-react';
import { HomeSidebar } from '../components/home-sidebar';
import { HomeMobileNav } from '../components/home-mobile-nav';
import { PageHeader } from '@/components/ui/page-header';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { HomeThemeToggle } from '../components/home-theme-toggle';
import { useState } from 'react';
import { lab_itens, PageType } from '../tabs/home-config';
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
    <div className="flex min-h-dvh w-full flex-col bg-background font-sans text-foreground sm:h-dvh sm:overflow-hidden">
      <PageHeader
        title="Life"
        highlightText="OS"
        subtitle="Sistema de Gestão Pessoal"
        tone={currentPage.tone}
      >
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 rounded-full p-0.5 outline-none ring-offset-background transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring cursor-pointer">
            <Avatar size="sm">
              {userConfig.avatarUrl && (
                <AvatarImage
                  src={userConfig.avatarUrl}
                  alt={`Avatar de ${userConfig.name}`}
                />
              )}
              <AvatarFallback>
                {userConfig.avatarUrl ? (
                  userConfig.initials
                ) : (
                  <User size={14} />
                )}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel className="flex flex-col gap-0.5 font-normal">
              <span className="truncate text-sm font-semibold text-foreground">
                {userConfig.name}
              </span>
              {userConfig.email && (
                <span className="truncate text-xs text-muted-foreground">
                  {userConfig.email}
                </span>
              )}
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <div className="px-2 py-1.5">
              <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Tema
              </p>
              <HomeThemeToggle />
            </div>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              variant="destructive"
              onClick={() => logout()}
              className="cursor-pointer"
            >
              <LogOut size={14} />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </PageHeader>

      <div className="relative flex flex-1 overflow-visible sm:overflow-hidden">
        <HomeSidebar activePage={activePage} onPageChange={setActivePage} />

        <div className="relative flex flex-1 flex-col overflow-visible sm:overflow-hidden">
          <main className="min-h-0 flex-1 overflow-visible px-3 pt-3 pb-20 sm:overflow-hidden sm:px-6 sm:pt-5 sm:pb-6">
            <div className="h-full min-h-0 w-full">
              <Content tone={currentPage.tone} />
            </div>
          </main>
        </div>
      </div>

      <HomeMobileNav activePage={activePage} onPageChange={setActivePage} />
    </div>
  );
}

import { BadgeTone } from '@/components/ui/badge';
import { Dashboard } from '@/features/dashboard/dashboard';
import { Financeiro } from '@/features/financeiro/ui/view/financeiro-view';
import { Meta } from '@/features/meta/ui/view/meta-view';
import { LayoutDashboard, Wallet, Target, Settings } from 'lucide-react';
import { HomeConfiguracoesView } from '../view/home-configuracoes-view';

export type PageType = 'dashboard' | 'financeiro' | 'meta' | 'configuracoes';

export interface labelItem {
  id: PageType;
  label: string;
  icon: React.ElementType;
  tone: BadgeTone;
  component: React.ComponentType<{ tone?: BadgeTone }>;
  className?: string;
  disabled?: boolean;
}

export const lab_itens: labelItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    tone: 'info',
    component: Dashboard,
  },
  {
    id: 'financeiro',
    label: 'Financeiro',
    icon: Wallet,
    tone: 'success',
    component: Financeiro,
  },
  {
    id: 'meta',
    label: 'Metas',
    icon: Target,
    tone: 'indigo',
    component: Meta,
  },
  {
    id: 'configuracoes',
    label: 'Configurações',
    icon: Settings,
    tone: 'lime',
    component: HomeConfiguracoesView,
  },
];

import dynamic from 'next/dynamic';
import { BadgeTone } from '@/components/ui/badge';
import {
  LayoutDashboard,
  Wallet,
  Target,
  Dumbbell,
  Settings,
} from 'lucide-react';

export type PageType =
  'dashboard' | 'financeiro' | 'meta' | 'treino' | 'configuracoes';

interface HomeTab {
  id: PageType;
  label: string;
  icon: React.ElementType;
  tone: BadgeTone;
  component: React.ComponentType<{ tone?: BadgeTone }>;
}

// Each tab is loaded on demand so the first paint only ships the active one.
export const HOME_TABS: HomeTab[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    tone: 'info',
    component: dynamic(() =>
      import('@/features/dashboard/dashboard').then((m) => m.Dashboard),
    ),
  },
  {
    id: 'financeiro',
    label: 'Financeiro',
    icon: Wallet,
    tone: 'success',
    component: dynamic(() =>
      import('@/features/financeiro/ui/view/financeiro-view').then(
        (m) => m.Financeiro,
      ),
    ),
  },
  {
    id: 'meta',
    label: 'Metas',
    icon: Target,
    tone: 'indigo',
    component: dynamic(() =>
      import('@/features/meta/ui/view/meta-view').then((m) => m.Meta),
    ),
  },
  {
    id: 'treino',
    label: 'Treinos',
    icon: Dumbbell,
    tone: 'laranja',
    component: dynamic(() =>
      import('@/features/treino/ui/view/treino-view').then((m) => m.Treino),
    ),
  },
  {
    id: 'configuracoes',
    label: 'Configurações',
    icon: Settings,
    tone: 'lime',
    component: dynamic(() =>
      import('../view/home-configuracoes-view').then(
        (m) => m.HomeConfiguracoesView,
      ),
    ),
  },
];

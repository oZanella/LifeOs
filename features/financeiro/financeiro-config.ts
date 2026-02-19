import { Wallet } from 'lucide-react';
import { BadgeTone } from '@/components/ui/badge';

export const financeiro_config = {
  id: 'financeiro' as const,
  label: 'Financeiro',
  icon: Wallet,
  tone: 'success' as BadgeTone,
};

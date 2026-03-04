import { BadgeTone } from '@/components/ui/badge';

export type AppBadgeTone = Exclude<BadgeTone, null | undefined>;

export interface ToneOption {
  value: AppBadgeTone;
  label: string;
  dotClassName: string;
}

export const TONE_OPTIONS: ToneOption[] = [
  { value: 'default', label: 'Padrão', dotClassName: 'bg-zinc-500' },
  { value: 'neutral', label: 'Neutro', dotClassName: 'bg-gray-500' },
  {
    value: 'primary',
    label: 'Primário',
    dotClassName: 'bg-sky-600 dark:bg-sky-400',
  },
  {
    value: 'secondary',
    label: 'Secundário',
    dotClassName: 'bg-violet-600 dark:bg-violet-400',
  },
  {
    value: 'success',
    label: 'Sucesso',
    dotClassName: 'bg-emerald-600 dark:bg-emerald-400',
  },
  {
    value: 'info',
    label: 'Informação',
    dotClassName: 'bg-blue-600 dark:bg-blue-400',
  },
  {
    value: 'warning',
    label: 'Alerta',
    dotClassName: 'bg-orange-500 dark:bg-orange-300',
  },
  { value: 'error', label: 'Erro', dotClassName: 'bg-red-600 dark:bg-red-400' },
  {
    value: 'accent',
    label: 'Destaque',
    dotClassName: 'bg-fuchsia-600 dark:bg-fuchsia-400',
  },
  {
    value: 'indigo',
    label: 'Índigo',
    dotClassName: 'bg-indigo-600 dark:bg-indigo-400',
  },
  { value: 'cyan', label: 'Ciano', dotClassName: 'bg-cyan-600 dark:bg-cyan-400' },
  {
    value: 'teal',
    label: 'Turquesa',
    dotClassName: 'bg-teal-600 dark:bg-teal-400',
  },
  { value: 'lime', label: 'Lima', dotClassName: 'bg-lime-600 dark:bg-lime-400' },
  {
    value: 'amber',
    label: 'Âmbar',
    dotClassName: 'bg-amber-600 dark:bg-amber-400',
  },
  { value: 'rose', label: 'Rosa', dotClassName: 'bg-rose-600 dark:bg-rose-400' },
];

export const CATEGORY_TONE_OPTIONS = TONE_OPTIONS.filter(
  (option) => option.value !== 'online',
);

export const VALID_CATEGORY_TONES = CATEGORY_TONE_OPTIONS.map(
  (option) => option.value,
);

export const TONE_DOT_CLASSNAME = Object.fromEntries(
  CATEGORY_TONE_OPTIONS.map((option) => [option.value, option.dotClassName]),
) as Record<AppBadgeTone, string>;

export const getToneLabel = (tone: AppBadgeTone) => {
  return (
    CATEGORY_TONE_OPTIONS.find((option) => option.value === tone)?.label ??
    'Padrão'
  );
};

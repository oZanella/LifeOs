import { BadgeTone } from '@/components/ui/badge';

export type AppBadgeTone = Exclude<BadgeTone, null | undefined>;

export type ToneGroup = 'vivas' | 'escuras' | 'pastel';

export interface ToneOption {
  value: AppBadgeTone;
  label: string;
  dotClassName: string;
  group?: ToneGroup;
}

export const TONE_GROUPS: Array<{ value: ToneGroup; label: string }> = [
  { value: 'vivas', label: 'Vivas' },
  { value: 'escuras', label: 'Escuras' },
  { value: 'pastel', label: 'Pastel' },
];

// Ordered by hue within each group so the color picker reads as a spectrum.
// Options without a group are the vivid ones.
export const TONE_OPTIONS: ToneOption[] = [
  { value: 'default', label: 'Cinza', dotClassName: 'bg-zinc-500' },
  { value: 'ardosia', label: 'Ardósia', dotClassName: 'bg-slate-500' },
  { value: 'marrom', label: 'Marrom', dotClassName: 'bg-amber-800' },
  {
    value: 'vermelho',
    label: 'Vermelho',
    dotClassName: 'bg-red-600 dark:bg-red-400',
  },
  { value: 'rose', label: 'Framboesa', dotClassName: 'bg-rose-500' },
  {
    value: 'laranja',
    label: 'Laranja',
    dotClassName: 'bg-orange-500 dark:bg-orange-300',
  },
  {
    value: 'amber',
    label: 'Âmbar',
    dotClassName: 'bg-amber-600 dark:bg-amber-400',
  },
  { value: 'amarelo', label: 'Amarelo', dotClassName: 'bg-yellow-400' },
  {
    value: 'lime',
    label: 'Lima',
    dotClassName: 'bg-lime-600 dark:bg-lime-400',
  },
  {
    value: 'verde',
    label: 'Verde',
    dotClassName: 'bg-green-600 dark:bg-green-500',
  },
  {
    value: 'esmeralda',
    label: 'Esmeralda',
    dotClassName: 'bg-emerald-600 dark:bg-emerald-400',
  },
  {
    value: 'teal',
    label: 'Turquesa',
    dotClassName: 'bg-teal-600 dark:bg-teal-400',
  },
  { value: 'ciano', label: 'Ciano', dotClassName: 'bg-cyan-500' },
  {
    value: 'azul',
    label: 'Azul',
    dotClassName: 'bg-sky-600 dark:bg-sky-600',
  },
  {
    value: 'azul-claro',
    label: 'Azul Royal',
    dotClassName: 'bg-blue-500 dark:bg-blue-500',
  },
  {
    value: 'indigo',
    label: 'Índigo',
    dotClassName: 'bg-indigo-800 dark:bg-indigo-500',
  },
  {
    value: 'violeta',
    label: 'Violeta',
    dotClassName: 'bg-violet-600 dark:bg-violet-400',
  },
  {
    value: 'roxo',
    label: 'Roxo',
    dotClassName: 'bg-purple-600 dark:bg-purple-400',
  },
  {
    value: 'rosa',
    label: 'Fúcsia',
    dotClassName: 'bg-fuchsia-600 dark:bg-fuchsia-400',
  },
  {
    value: 'pink',
    label: 'Rosa',
    dotClassName: 'bg-pink-500 dark:bg-pink-400',
  },

  // Tons escuros
  {
    value: 'grafite',
    label: 'Grafite',
    dotClassName: 'bg-stone-700 dark:bg-stone-600',
    group: 'escuras',
  },
  {
    value: 'vinho',
    label: 'Vinho',
    dotClassName: 'bg-red-800',
    group: 'escuras',
  },
  {
    value: 'terracota',
    label: 'Terracota',
    dotClassName: 'bg-orange-700',
    group: 'escuras',
  },
  {
    value: 'mostarda',
    label: 'Mostarda',
    dotClassName: 'bg-yellow-700',
    group: 'escuras',
  },
  {
    value: 'oliva',
    label: 'Oliva',
    dotClassName: 'bg-lime-800',
    group: 'escuras',
  },
  {
    value: 'musgo',
    label: 'Musgo',
    dotClassName: 'bg-green-800',
    group: 'escuras',
  },
  {
    value: 'petroleo',
    label: 'Petróleo',
    dotClassName: 'bg-teal-800',
    group: 'escuras',
  },
  {
    value: 'marinho',
    label: 'Marinho',
    dotClassName: 'bg-blue-900 dark:bg-blue-800',
    group: 'escuras',
  },
  {
    value: 'berinjela',
    label: 'Berinjela',
    dotClassName: 'bg-purple-900 dark:bg-purple-800',
    group: 'escuras',
  },
  {
    value: 'ameixa',
    label: 'Ameixa',
    dotClassName: 'bg-fuchsia-800',
    group: 'escuras',
  },

  // Tons pastel
  {
    value: 'areia',
    label: 'Areia',
    dotClassName: 'bg-stone-300',
    group: 'pastel',
  },
  {
    value: 'salmao',
    label: 'Salmão',
    dotClassName: 'bg-red-300',
    group: 'pastel',
  },
  {
    value: 'pessego',
    label: 'Pêssego',
    dotClassName: 'bg-orange-200',
    group: 'pastel',
  },
  {
    value: 'baunilha',
    label: 'Baunilha',
    dotClassName: 'bg-yellow-200',
    group: 'pastel',
  },
  {
    value: 'pistache',
    label: 'Pistache',
    dotClassName: 'bg-lime-300',
    group: 'pastel',
  },
  {
    value: 'menta',
    label: 'Menta',
    dotClassName: 'bg-emerald-300',
    group: 'pastel',
  },
  {
    value: 'agua',
    label: 'Água',
    dotClassName: 'bg-cyan-200',
    group: 'pastel',
  },
  {
    value: 'celeste',
    label: 'Celeste',
    dotClassName: 'bg-sky-300',
    group: 'pastel',
  },
  {
    value: 'lavanda',
    label: 'Lavanda',
    dotClassName: 'bg-violet-300',
    group: 'pastel',
  },
  {
    value: 'lilas',
    label: 'Lilás',
    dotClassName: 'bg-purple-300',
    group: 'pastel',
  },
  {
    value: 'rosa-bebe',
    label: 'Rosa bebê',
    dotClassName: 'bg-pink-300',
    group: 'pastel',
  },
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

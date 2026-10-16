// Intl formatters are expensive to build, so they are created once and reused.
const brl = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

const brlRounded = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0,
});

export const formatBRL = (value: number) => brl.format(value);

export const formatBRLRounded = (value: number) => brlRounded.format(value);

const decimal1 = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 });
const decimal2 = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 });

// Plain numbers such as "12,5" with at most `digits` decimal places.
export const formatDecimal = (value: number, digits: 1 | 2 = 2) =>
  (digits === 1 ? decimal1 : decimal2).format(value);

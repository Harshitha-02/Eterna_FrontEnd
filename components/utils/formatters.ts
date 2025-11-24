// utils/formatters.ts
export const formatCurrency = (val: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 4 }).format(val);

export const formatCompact = (val: number) =>
  new Intl.NumberFormat('en-US', { notation: 'compact', compactDisplay: 'short' }).format(val);

export const cn = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(' ');

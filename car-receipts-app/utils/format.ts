import { Receipt } from '@/types/receipt';

export const formatCurrency = (amount: number, currency: string, locale = 'en-US') =>
  new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);

export const computeTotals = (r: Receipt) => {
  const sub = r.carCost + r.serviceCharge;
  const tax = r.taxRate ? sub * r.taxRate : 0;
  const total = sub + tax;
  return { sub, tax, total };
};
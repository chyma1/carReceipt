import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { receiptSchema, ReceiptFormValues } from './schema';

export function useReceiptForm(defaults?: Partial<ReceiptFormValues>) {
  return useForm<ReceiptFormValues>({
    resolver: zodResolver(receiptSchema),
    defaultValues: {
      currency: 'USD',
      taxRate: 0,
      ...defaults,
    },
    mode: 'onChange',
  });
}
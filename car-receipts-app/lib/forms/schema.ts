import { z } from 'zod';

export const receiptSchema = z.object({
  companyName: z.string().min(2),
  companyAddress: z.string().optional(),
  companyPhone: z.string().optional(),
  companyEmail: z.string().email().optional(),
  customerName: z.string().optional(),
  customerEmail: z.string().email().optional(),
  customerPhone: z.string().optional(),
  customerAddress: z.string().optional(),
  carCost: z.number().nonnegative(),
  serviceCharge: z.number().nonnegative(),
  taxRate: z.number().min(0).max(1).optional(),
  currency: z.string().min(3),
  vehicle: z.object({
    make: z.string().min(1),
    model: z.string().min(1),
    year: z.number().int().min(1900).max(new Date().getFullYear()+1),
    mileage: z.number().int().nonnegative().optional(),
    vin: z.string().min(5),
  }),
  notes: z.string().optional(),
  templateId: z.enum(['minimal', 'card']),
});

export type ReceiptFormValues = z.infer<typeof receiptSchema>;
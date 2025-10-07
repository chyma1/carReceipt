export type Vehicle = {
  make: string;
  model: string;
  year: number;
  mileage?: number;
  vin: string;
};

export type Company = {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  logoBase64?: string; // "data:image/png;base64,..." for embedding
};

export type Customer = {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
};

export type Receipt = {
  id: string;               // UUID
  dateISO: string;          // new Date().toISOString()
  company: Company;
  customer?: Customer;
  vehicle: Vehicle;
  carCost: number;
  serviceCharge: number;
  taxRate?: number;         // 0.07 => 7%
  currency: string;         // "USD", "EUR", etc.
  notes?: string;
  templateId: 'minimal' | 'card'; // extendable
  pdfUri?: string;          // saved path after generation
};
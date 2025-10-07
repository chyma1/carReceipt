export type Vehicle = {
  id: string;               // UUID for identifying vehicles in the list
  make: string;
  model: string;
  year: number;
  mileage?: number;
  vin: string;
  cost?: number;            // Individual cost for this vehicle
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
  vehicles: Vehicle[];      // Changed from single vehicle to array of vehicles
  carCost?: number;         // Total cost of all vehicles (calculated from individual costs)
  serviceCharge: number;
  taxRate?: number;         // 0.07 => 7%
  currency: string;         // "USD", "EUR", etc.
  notes?: string;
  templateId: 'minimal' | 'card' | 'modern' | 'professional' | 'compact'; // extendable
  pdfUri?: string;          // saved path after generation
};
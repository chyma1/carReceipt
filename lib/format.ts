import { Receipt } from '../types/receipt';

export const formatCurrency = (amount: number, currency: string, locale = 'en-US') =>
  new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount || 0);

// Calculate the total cost of all vehicles
const calculateTotalVehicleCost = (r: Receipt): number => {
  // If we have individual vehicle costs, use those
  if (r.vehicles.some(v => v.cost !== undefined && v.cost !== null)) {
    return r.vehicles.reduce((total, vehicle) => {
      return total + (vehicle.cost || 0);
    }, 0);
  }
  // Otherwise, use the carCost field if it exists
  if (r.carCost !== undefined && r.carCost !== null) {
    return r.carCost;
  }
  // If neither exists, return 0
  return 0;
};

export const computeTotals = (r: Receipt) => {
  const vehicleCost = calculateTotalVehicleCost(r);
  const serviceCharge = r.serviceCharge || 0;
  const sub = vehicleCost + serviceCharge;
  const tax = r.taxRate ? sub * r.taxRate : 0;
  const total = sub + tax;
  return { sub, tax, total, vehicleCost };
};
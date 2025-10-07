import { Receipt } from '@/types/receipt';
import { formatCurrency, computeTotals } from '@/utils/format';

export const renderTemplateMinimal = (r: Receipt) => {
  const { sub, tax, total } = computeTotals(r);
  const cur = (n: number) => formatCurrency(n, r.currency);

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    @page { size: A4; margin: 18mm; }
    :root {
      --brand: #0f172a; /* slate-900 */
      --muted: #64748b; /* slate-500 */
      --border: #e2e8f0; /* slate-200 */
      --accent: #2563eb; /* blue-600 */
    }
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, Segoe UI, Roboto, Inter, Arial, sans-serif;
      color: #0f172a;
      line-height: 1.35;
    }
    .header {
      display: flex; align-items: center; justify-content: space-between; gap: 16px;
      border-bottom: 1px solid var(--border); padding-bottom: 12px; margin-bottom: 16px;
    }
    .brand {
      display: flex; align-items: center; gap: 12px;
    }
    .logo { width: 56px; height: 56px; object-fit: contain; border-radius: 8px; border: 1px solid var(--border); padding: 6px; }
    .company h1 { font-size: 20px; margin: 0; color: var(--brand); }
    .company p { margin: 2px 0; color: var(--muted); font-size: 12px; }
    .meta {
      display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px;
      border: 1px solid var(--border); border-radius: 10px; padding: 12px; margin: 14px 0 18px 0;
      background: #fcfdff;
    }
    .meta div { font-size: 12px; }
    .label { color: var(--muted); text-transform: uppercase; letter-spacing: .04em; font-size: 10px; }
    .value { margin-top: 2px; font-weight: 600; }
    .section-title { margin: 16px 0 8px; font-size: 12px; color: var(--muted); text-transform: uppercase; letter-spacing: .06em; }
    .card {
      border: 1px solid var(--border); border-radius: 12px; overflow: hidden;
    }
    table { border-collapse: collapse; width: 100%; }
    th, td { text-align: left; padding: 10px 12px; font-size: 12px; }
    thead th { background: #f8fafc; color: #334155; text-transform: uppercase; letter-spacing: .06em; font-size: 10px; }
    tbody tr:not(:last-child) td { border-bottom: 1px dashed var(--border); }
    .totals { margin-top: 12px; display: grid; gap: 6px; max-width: 260px; margin-left: auto; }
    .row { display: flex; justify-content: space-between; font-size: 12px; }
    .row.total { font-weight: 700; font-size: 14px; }
    .footer {
      margin-top: 28px; padding-top: 12px; border-top: 1px solid var(--border); color: var(--muted); font-size: 11px;
    }
    .badge {
      display:inline-block; padding: 2px 8px; border-radius: 999px; background: #eef2ff; color: #4338ca; font-size: 10px; font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="brand">
      ${r.company.logoBase64 ? `<img class="logo" src="${r.company.logoBase64}" />` : ''}
      <div class="company">
        <h1>${r.company.name || 'Receipt'}</h1>
        ${(r.company.address || r.company.email || r.company.phone) ? `<p>${[r.company.address, r.company.email, r.company.phone].filter(Boolean).join(' • ')}</p>` : ''}
      </div>
    </div>
    <div class="badge">Car Shipping Receipt</div>
  </div>

  <div class="meta">
    <div><div class="label">Date</div><div class="value">${new Date(r.dateISO).toLocaleDateString()}</div></div>
    <div><div class="label">Receipt #</div><div class="value">${r.id}</div></div>
    <div><div class="label">Customer</div><div class="value">${r.customer?.name || '-'}</div></div>
  </div>

  <div class="section-title">Vehicle</div>
  <div class="card">
    <table>
      <thead><tr><th>Make</th><th>Model</th><th>Year</th><th>Mileage</th><th>VIN</th></tr></thead>
      <tbody>
        <tr>
          <td>${r.vehicle.make}</td>
          <td>${r.vehicle.model}</td>
          <td>${r.vehicle.year}</td>
          <td>${r.vehicle.mileage ?? '-'}</td>
          <td>${r.vehicle.vin}</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="section-title">Charges</div>
  <div class="card" style="padding: 10px 12px;">
    <div class="row"><span>Car Cost</span><span>${cur(r.carCost)}</span></div>
    <div class="row"><span>Service Charge</span><span>${cur(r.serviceCharge)}</span></div>
    ${r.taxRate ? `<div class="row"><span>Tax (${(r.taxRate*100).toFixed(2)}%)</span><span>${cur(tax)}</span></div>` : ''}
    <div class="row total" style="margin-top:6px; border-top: 1px dashed var(--border); padding-top: 8px;"><span>Total</span><span>${cur(total)}</span></div>
  </div>

  ${r.notes ? `<div class="section-title">Notes</div><div class="card" style="padding: 12px; font-size:12px;">${r.notes}</div>` : ''}

  <div class="footer">
    Thank you for your business. For questions, contact ${r.company.email || r.company.phone || r.company.name}.
  </div>
</body>
</html>
  `;
};

export const renderTemplateCard = (r: Receipt) => {
  const { sub, tax, total } = computeTotals(r);
  const cur = (n: number) => formatCurrency(n, r.currency);

  return `
<!DOCTYPE html>
<html><head><meta charset="utf-8"/>
<style>
  @page { size: A4; margin: 16mm; }
  body { font-family: Inter, Roboto, Arial, sans-serif; color:#0b1220; }
  .wrap { border:1px solid #e6e8ee; border-radius:16px; padding:18px; }
  .top { display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; }
  .brand { display:flex; gap:10px; align-items:center; }
  .logo { width:64px; height:64px; object-fit:contain; border-radius:12px; border:1px solid #e6e8ee; padding:6px;}
  .h1 { font-weight:800; font-size:22px; margin:0; }
  .muted { color:#667085; font-size:12px; }
  .grid { display:grid; grid-template-columns: 1fr 1fr; gap:12px; margin:12px 0; }
  .card { border:1px solid #e6e8ee; border-radius:12px; padding:12px; }
  .title { font-size:12px; text-transform:uppercase; color:#667085; letter-spacing:.06em; margin-bottom:8px; }
  .row { display:flex; justify-content:space-between; font-size:12px; padding:6px 0; }
  .row + .row { border-top:1px dashed #e6e8ee; }
  .total { font-weight:800; font-size:14px; }
  table { width:100%; border-collapse: collapse; }
  th, td { text-align:left; padding:8px; font-size:12px; }
  thead th { background:#f6f7fb; color:#3b4758; text-transform:uppercase; letter-spacing:.05em; font-size:10px;}
  tbody tr:not(:last-child) td { border-bottom:1px dashed #e6e8ee; }
</style></head>
<body>
  <div class="wrap">
    <div class="top">
      <div class="brand">
        ${r.company.logoBase64 ? `<img class="logo" src="${r.company.logoBase64}" />` : ''}
        <div>
          <div class="h1">${r.company.name || 'Receipt'}</div>
          ${(r.company.address || r.company.email || r.company.phone) ? `<div class="muted">${[r.company.address, r.company.email, r.company.phone].filter(Boolean).join(' • ')}</div>` : ''}
        </div>
      </div>
      <div class="muted">#${r.id}<br/>${new Date(r.dateISO).toLocaleDateString()}</div>
    </div>

    <div class="grid">
      <div class="card">
        <div class="title">Customer</div>
        <div>${r.customer?.name || '-'}</div>
        ${r.customer?.email ? `<div class="muted">${r.customer.email}</div>` : ''}
        ${r.customer?.phone ? `<div class="muted">${r.customer.phone}</div>` : ''}
      </div>
      <div class="card">
        <div class="title">Vehicle</div>
        <table>
          <tbody>
            <tr><td>Make</td><td>${r.vehicle.make}</td></tr>
            <tr><td>Model</td><td>${r.vehicle.model}</td></tr>
            <tr><td>Year</td><td>${r.vehicle.year}</td></tr>
            <tr><td>Mileage</td><td>${r.vehicle.mileage ?? '-'}</td></tr>
            <tr><td>VIN</td><td>${r.vehicle.vin}</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="card">
      <div class="title">Charges</div>
      <div class="row"><span>Car Cost</span><span>${cur(r.carCost)}</span></div>
      <div class="row"><span>Service Charge</span><span>${cur(r.serviceCharge)}</span></div>
      ${r.taxRate ? `<div class="row"><span>Tax (${(r.taxRate*100).toFixed(2)}%)</span><span>${cur(tax)}</span></div>` : ''}
      <div class="row total"><span>Total</span><span>${cur(total)}</span></div>
    </div>

    ${r.notes ? `<div class="card" style="margin-top:12px;"><div class="title">Notes</div><div>${r.notes}</div></div>` : ''}
  </div>
</body></html>
  `;
};

type TemplateOption = { id: Receipt['templateId']; name: string; };
export const TEMPLATES: TemplateOption[] = [
  { id: 'minimal', name: 'Minimal' },
  { id: 'card', name: 'Card' },
];
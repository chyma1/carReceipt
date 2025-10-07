import { Receipt } from '../../types/receipt';
import { formatCurrency, computeTotals } from '../format';

// Add a function to calculate individual vehicle costs
const calculateVehicleCost = (r: Receipt, vehicleIndex: number): number => {
  const vehicle = r.vehicles[vehicleIndex];
  // If the vehicle has its own cost, use that
  if (vehicle.cost !== undefined && vehicle.cost !== null) {
    return vehicle.cost;
  }
  // If no individual cost but carCost exists, distribute it evenly
  if (r.carCost !== undefined && r.carCost !== null) {
    return r.carCost / r.vehicles.length;
  }
  // If neither individual cost nor carCost exists, return 0
  return 0;
};

export const renderTemplateCard = (r: Receipt) => {
  const { tax, total, vehicleCost } = computeTotals(r);
  const cur = (n: number) => formatCurrency(n, r.currency);
  
  // Generate short receipt number for display
  const receiptDate = new Date(r.dateISO);
  const year = receiptDate.getFullYear().toString().substr(2);
  const month = (receiptDate.getMonth() + 1).toString().padStart(2, '0');
  const day = receiptDate.getDate().toString().padStart(2, '0');
  const shortId = r.id.substring(0, 8);

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
  .vehicle-section { margin: 15px 0; }
  .vehicle-title { font-size: 14px; font-weight: 600; margin: 10px 0 5px 0; color: #334155; }
  .vehicle-cost { color: #059669; font-weight: 600; }
  .charges-summary { margin-top: 15px; }
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
      <div class="muted">#${shortId}<br/>${new Date(r.dateISO).toLocaleDateString()}</div>
    </div>

    <div class="grid">
      <div class="card">
        <div class="title">Customer</div>
        <div>${r.customer?.name || '-'}</div>
        ${r.customer?.email ? `<div class="muted">${r.customer.email}</div>` : ''}
        ${r.customer?.phone ? `<div class="muted">${r.customer.phone}</div>` : ''}
      </div>
      <div class="card">
        <div class="title">Vehicles</div>
        ${r.vehicles.map((vehicle, index) => {
          const vehicleCost = calculateVehicleCost(r, index);
          return `
        <div class="vehicle-section">
          <div class="vehicle-title">Vehicle #${index + 1} <span class="vehicle-cost">(${cur(vehicleCost)})</span></div>
          <table>
            <tbody>
              <tr><td>Make</td><td>${vehicle.make}</td></tr>
              <tr><td>Model</td><td>${vehicle.model}</td></tr>
              <tr><td>Year</td><td>${vehicle.year}</td></tr>
              <tr><td>Mileage</td><td>${vehicle.mileage ?? '-'}</td></tr>
              <tr><td>VIN</td><td>${vehicle.vin}</td></tr>
            </tbody>
          </table>
        </div>
        `;
        }).join('')}
      </div>
    </div>

    <div class="card charges-summary">
      <div class="title">Charges Summary</div>
      <div class="row"><span>Vehicle Costs</span><span>${cur(vehicleCost)}</span></div>
      <div class="row"><span>Service Charge</span><span>${cur(r.serviceCharge)}</span></div>
      ${r.taxRate ? `<div class="row"><span>Tax (${(r.taxRate*100).toFixed(2)}%)</span><span>${cur(tax)}</span></div>` : ''}
      <div class="row total"><span>Total</span><span>${cur(total)}</span></div>
    </div>

    ${r.notes ? `<div class="card" style="margin-top:12px;"><div class="title">Notes</div><div>${r.notes}</div></div>` : ''}
  </div>
</body></html>`;
};

export const renderTemplateMinimal = (r: Receipt) => {
  const { tax, total, vehicleCost } = computeTotals(r);
  const cur = (n: number) => formatCurrency(n, r.currency);
  
  // Generate short receipt number for display
  const receiptDate = new Date(r.dateISO);
  const year = receiptDate.getFullYear().toString().substr(2);
  const month = (receiptDate.getMonth() + 1).toString().padStart(2, '0');
  const day = receiptDate.getDate().toString().padStart(2, '0');
  const shortId = r.id.substring(0, 8);

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    @page { size: A4; margin: 18mm; }
    :root { --brand:#0f172a; --muted:#64748b; --border:#e2e8f0; }
    *{ box-sizing:border-box; }
    body{ font-family: -apple-system, Segoe UI, Roboto, Inter, Arial, sans-serif; color:#0f172a; line-height:1.35; }
    .header{ display:flex; align-items:center; justify-content:space-between; gap:16px; border-bottom:1px solid var(--border); padding-bottom:12px; margin-bottom:16px; }
    .brand{ display:flex; align-items:center; gap:12px; }
    .logo{ width:56px; height:56px; object-fit:contain; border-radius:8px; border:1px solid var(--border); padding:6px; }
    .company h1{ font-size:20px; margin:0; color:var(--brand); }
    .company p{ margin:2px 0; color:var(--muted); font-size:12px; }
    .badge{ display:inline-block; padding:2px 8px; border-radius:999px; background:#eef2ff; color:#4338ca; font-size:10px; font-weight:600; }
    .meta{ display:grid; grid-template-columns: repeat(3,1fr); gap:12px; border:1px solid var(--border); border-radius:10px; padding:12px; margin:14px 0 18px 0; background:#fcfdff; }
    .meta div{ font-size:12px; }
    .label{ color:var(--muted); text-transform:uppercase; letter-spacing:.04em; font-size:10px; }
    .value{ margin-top:2px; font-weight:600; }
    .section-title{ margin:16px 0 8px; font-size:12px; color:var(--muted); text-transform:uppercase; letter-spacing:.06em; }
    .card{ border:1px solid var(--border); border-radius:12px; overflow:hidden; }
    table{ border-collapse:collapse; width:100%; }
    th,td{ text-align:left; padding:10px 12px; font-size:12px; }
    thead th{ background:#f8fafc; color:#334155; text-transform:uppercase; letter-spacing:.06em; font-size:10px; }
    tbody tr:not(:last-child) td{ border-bottom:1px dashed var(--border); }
    .row{ display:flex; justify-content:space-between; font-size:12px; }
    .row.total{ font-weight:700; font-size:14px; }
    .vehicle-table { margin-bottom: 20px; }
    .vehicle-cost { color: #059669; font-weight: 600; }
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
    <div><div class="label">Receipt #</div><div class="value">${shortId}</div></div>
    <div><div class="label">Customer</div><div class="value">${r.customer?.name || '-'}</div></div>
  </div>

  <div class="section-title">Vehicles</div>
  ${r.vehicles.map((vehicle, index) => {
    const vehicleCost = calculateVehicleCost(r, index);
    return `
  <div class="vehicle-table">
    <h3 style="margin: 0 0 10px 0; font-size: 14px; color: #334155;">Vehicle #${index + 1} <span class="vehicle-cost">(${cur(vehicleCost)})</span></h3>
    <div class="card">
      <table>
        <thead><tr><th>Make</th><th>Model</th><th>Year</th><th>Mileage</th><th>VIN</th></tr></thead>
        <tbody>
          <tr>
            <td>${vehicle.make}</td>
            <td>${vehicle.model}</td>
            <td>${vehicle.year}</td>
            <td>${vehicle.mileage ?? '-'}</td>
            <td>${vehicle.vin}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
  `;
  }).join('')}

  <div class="section-title">Charges Summary</div>
  <div class="card" style="padding: 10px 12px;">
    <div class="row"><span>Vehicle Costs</span><span>${cur(vehicleCost)}</span></div>
    <div class="row"><span>Service Charge</span><span>${cur(r.serviceCharge)}</span></div>
    ${r.taxRate ? `<div class="row"><span>Tax (${(r.taxRate*100).toFixed(2)}%)</span><span>${cur(tax)}</span></div>` : ''}
    <div class="row total" style="margin-top:6px; border-top: 1px dashed #e2e8f0; padding-top: 8px;"><span>Total</span><span>${cur(total)}</span></div>
  </div>

  ${r.notes ? `<div class="section-title">Notes</div><div class="card" style="padding: 12px; font-size:12px;">${r.notes}</div>` : ''}

  <div style="margin-top: 28px; padding-top: 12px; border-top: 1px solid #e2e8f0; color:#64748b; font-size:11px;">
    Thank you for your business. For questions, contact ${r.company.email || r.company.phone || r.company.name}.
  </div>
</body>
</html>`;
};

export const renderTemplateModern = (r: Receipt) => {
  const { tax, total, vehicleCost } = computeTotals(r);
  const cur = (n: number) => formatCurrency(n, r.currency);
  
  // Generate short receipt number for display
  const receiptDate = new Date(r.dateISO);
  const year = receiptDate.getFullYear().toString().substr(2);
  const month = (receiptDate.getMonth() + 1).toString().padStart(2, '0');
  const day = receiptDate.getDate().toString().padStart(2, '0');
  const shortId = r.id.substring(0, 8);

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    @page { size: A4; margin: 20mm; }
    :root { 
      --primary: #3b82f6;
      --secondary: #10b981;
      --dark: #1e293b;
      --light: #f8fafc;
      --gray: #94a3b8;
      --border: #e2e8f0;
    }
    * { box-sizing: border-box; }
    body { 
      font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; 
      color: var(--dark); 
      line-height: 1.6;
      background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
      padding: 0;
      margin: 0;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      box-shadow: 0 10px 25px rgba(0,0,0,0.05);
      border-radius: 16px;
      overflow: hidden;
    }
    .header {
      background: linear-gradient(120deg, var(--primary) 0%, #60a5fa 100%);
      color: white;
      padding: 30px;
      position: relative;
    }
    .header::after {
      content: "";
      position: absolute;
      bottom: -20px;
      left: 0;
      width: 100%;
      height: 40px;
      background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="%23ffffff" fill-opacity="1" d="M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path></svg>');
      background-size: cover;
    }
    .brand-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    .logo {
      width: 80px;
      height: 80px;
      object-fit: contain;
      border-radius: 16px;
      border: 3px solid rgba(255,255,255,0.3);
      padding: 8px;
      background: white;
    }
    .company-info h1 {
      font-size: 28px;
      margin: 0 0 5px 0;
      font-weight: 800;
    }
    .company-info p {
      margin: 0;
      opacity: 0.9;
      font-size: 14px;
    }
    .receipt-info {
      text-align: right;
    }
    .receipt-info h2 {
      font-size: 24px;
      margin: 0 0 5px 0;
      font-weight: 700;
    }
    .receipt-info p {
      margin: 0;
      opacity: 0.9;
      font-size: 14px;
    }
    .content {
      padding: 40px 30px 30px 30px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 30px;
    }
    .info-card {
      background: var(--light);
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.02);
    }
    .info-card h3 {
      margin-top: 0;
      color: var(--primary);
      font-size: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .info-card h3::before {
      content: "";
      display: inline-block;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--primary);
    }
    .info-card p {
      margin: 8px 0;
      font-size: 14px;
    }
    .section-title {
      font-size: 20px;
      font-weight: 700;
      margin: 25px 0 15px 0;
      color: var(--dark);
      padding-bottom: 8px;
      border-bottom: 2px solid var(--border);
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .section-title::before {
      content: "";
      display: inline-block;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: var(--secondary);
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
      box-shadow: 0 2px 8px rgba(0,0,0,0.03);
      border-radius: 10px;
      overflow: hidden;
    }
    th {
      background: var(--primary);
      color: white;
      text-align: left;
      padding: 14px 16px;
      font-weight: 600;
      font-size: 14px;
    }
    td {
      padding: 12px 16px;
      border-bottom: 1px solid var(--border);
      font-size: 14px;
    }
    tr:last-child td {
      border-bottom: none;
    }
    tr:nth-child(even) {
      background: var(--light);
    }
    .charges-summary {
      background: white;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
      margin: 20px 0;
    }
    .charge-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      font-size: 15px;
    }
    .charge-row.total {
      border-top: 2px solid var(--border);
      font-weight: 700;
      font-size: 18px;
      margin-top: 10px;
      padding-top: 15px;
      color: var(--primary);
    }
    .notes {
      background: #fffbeb;
      border-left: 4px solid #f59e0b;
      padding: 15px;
      border-radius: 0 8px 8px 0;
      margin: 20px 0;
      font-size: 14px;
    }
    .footer {
      text-align: center;
      padding: 20px;
      color: var(--gray);
      font-size: 13px;
      border-top: 1px solid var(--border);
      margin-top: 30px;
    }
    .vehicle-card {
      background: white;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
      margin-bottom: 20px;
      border: 1px solid var(--border);
    }
    .vehicle-header {
      font-size: 18px;
      font-weight: 700;
      margin: 0 0 15px 0;
      color: var(--primary);
      display: flex;
      align-items: center;
      gap: 10px;
      justify-content: space-between;
    }
    .vehicle-header::before {
      content: "🚗";
    }
    .vehicle-cost {
      color: #059669;
      font-weight: 600;
      font-size: 16px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="brand-section">
        <div class="brand">
          ${r.company.logoBase64 ? `<img class="logo" src="${r.company.logoBase64}" />` : ''}
          <div class="company-info">
            <h1>${r.company.name || 'Car Shipping Receipt'}</h1>
            ${(r.company.address || r.company.email || r.company.phone) ? `<p>${[r.company.address, r.company.email, r.company.phone].filter(Boolean).join(' • ')}</p>` : ''}
          </div>
        </div>
        <div class="receipt-info">
          <h2>RECEIPT</h2>
          <p>Receipt #: ${shortId}</p>
          <p>Date: ${new Date(r.dateISO).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
    
    <div class="content">
      <div class="info-grid">
        <div class="info-card">
          <h3>Customer Information</h3>
          <p><strong>Name:</strong> ${r.customer?.name || '-'}</p>
          ${r.customer?.email ? `<p><strong>Email:</strong> ${r.customer.email}</p>` : ''}
          ${r.customer?.phone ? `<p><strong>Phone:</strong> ${r.customer.phone}</p>` : ''}
        </div>
        
        <div class="info-card">
          <h3>Vehicles</h3>
          <p><strong>Total Vehicles:</strong> ${r.vehicles.length}</p>
        </div>
      </div>
      
      <h2 class="section-title">Vehicle Details</h2>
      ${r.vehicles.map((vehicle, index) => {
        const vehicleCost = calculateVehicleCost(r, index);
        return `
      <div class="vehicle-card">
        <h3 class="vehicle-header">
          <span>Vehicle #${index + 1}</span>
          <span class="vehicle-cost">${cur(vehicleCost)}</span>
        </h3>
        <table>
          <tbody>
            <tr>
              <td><strong>Make:</strong> ${vehicle.make}</td>
              <td><strong>Model:</strong> ${vehicle.model}</td>
            </tr>
            <tr>
              <td><strong>Year:</strong> ${vehicle.year}</td>
              <td><strong>Mileage:</strong> ${vehicle.mileage ?? 'N/A'}</td>
            </tr>
            <tr>
              <td colspan="2"><strong>VIN:</strong> ${vehicle.vin}</td>
            </tr>
          </tbody>
        </table>
      </div>
      `;
      }).join('')}
      
      <h2 class="section-title">Charges Summary</h2>
      <div class="charges-summary">
        <div class="charge-row">
          <span>Vehicle Costs</span>
          <span>${cur(vehicleCost)}</span>
        </div>
        <div class="charge-row">
          <span>Service Charge</span>
          <span>${cur(r.serviceCharge)}</span>
        </div>
        ${r.taxRate ? `
        <div class="charge-row">
          <span>Tax (${(r.taxRate*100).toFixed(2)}%)</span>
          <span>${cur(tax)}</span>
        </div>
        ` : ''}
        <div class="charge-row total">
          <span>Total Amount</span>
          <span>${cur(total)}</span>
        </div>
      </div>
      
      ${r.notes ? `
      <h2 class="section-title">Additional Notes</h2>
      <div class="notes">
        ${r.notes}
      </div>
      ` : ''}
      
      <div class="footer">
        <p>Thank you for your business! For any questions, please contact ${r.company.email || r.company.phone || r.company.name}.</p>
        <p>This is an electronically generated receipt. No signature required.</p>
      </div>
    </div>
  </div>
</body>
</html>`;
};

export const renderTemplateProfessional = (r: Receipt) => {
  const { tax, total, vehicleCost } = computeTotals(r);
  const cur = (n: number) => formatCurrency(n, r.currency);
  
  // Generate short receipt number for display
  const receiptDate = new Date(r.dateISO);
  const year = receiptDate.getFullYear().toString().substr(2);
  const month = (receiptDate.getMonth() + 1).toString().padStart(2, '0');
  const day = receiptDate.getDate().toString().padStart(2, '0');
  const shortId = r.id.substring(0, 8);

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    @page { size: A4; margin: 20mm; }
    :root { 
      --dark: #0f172a;
      --light: #f1f5f9;
      --accent: #4f46e5;
      --border: #cbd5e1;
      --text: #334155;
    }
    * { box-sizing: border-box; }
    body { 
      font-family: 'Times New Roman', Georgia, serif;
      color: var(--text);
      line-height: 1.5;
      background: #f8fafc;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 900px;
      margin: 0 auto;
      background: white;
      box-shadow: 0 5px 15px rgba(0,0,0,0.08);
      border: 1px solid #e2e8f0;
    }
    .header {
      border-bottom: 3px solid var(--accent);
      padding: 30px;
      display: flex;
      justify-content: space-between;
    }
    .company-section {
      flex: 2;
    }
    .receipt-section {
      flex: 1;
      text-align: right;
    }
    .logo {
      width: 100px;
      height: 100px;
      object-fit: contain;
      border: 1px solid var(--border);
      padding: 10px;
      margin-bottom: 15px;
    }
    .company-name {
      font-size: 28px;
      font-weight: bold;
      margin: 0 0 10px 0;
      color: var(--dark);
    }
    .company-details {
      font-size: 14px;
      color: #64748b;
      margin: 0;
    }
    .receipt-title {
      font-size: 32px;
      font-weight: bold;
      color: var(--accent);
      margin: 0 0 10px 0;
    }
    .receipt-details {
      font-size: 14px;
      margin: 0;
    }
    .content {
      padding: 30px;
    }
    .info-sections {
      display: flex;
      justify-content: space-between;
      margin-bottom: 30px;
    }
    .info-block {
      flex: 1;
      padding: 20px;
      border: 1px solid var(--border);
      margin-right: 20px;
      border-radius: 4px;
    }
    .info-block:last-child {
      margin-right: 0;
    }
    .info-title {
      font-size: 18px;
      font-weight: bold;
      margin-top: 0;
      color: var(--accent);
      border-bottom: 1px solid var(--border);
      padding-bottom: 8px;
      margin-bottom: 15px;
    }
    .info-item {
      margin: 10px 0;
      font-size: 14px;
    }
    .info-label {
      font-weight: bold;
      display: inline-block;
      width: 100px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    th {
      background: var(--light);
      text-align: left;
      padding: 12px 15px;
      font-weight: bold;
      border: 1px solid var(--border);
      color: var(--dark);
    }
    td {
      padding: 12px 15px;
      border: 1px solid var(--border);
      font-size: 14px;
    }
    tr:nth-child(even) {
      background: #f8fafc;
    }
    .charges-table {
      width: 50%;
      margin-left: auto;
    }
    .total-row {
      font-weight: bold;
      background: var(--light) !important;
    }
    .section-title {
      font-size: 20px;
      font-weight: bold;
      margin: 30px 0 15px 0;
      color: var(--dark);
      padding-bottom: 5px;
      border-bottom: 2px solid var(--accent);
    }
    .notes {
      background: #fffbeb;
      border: 1px solid #fef3c7;
      padding: 15px;
      border-radius: 4px;
      font-size: 14px;
      margin: 20px 0;
    }
    .footer {
      text-align: center;
      padding: 20px;
      border-top: 1px solid var(--border);
      font-size: 12px;
      color: #64748b;
      background: var(--light);
    }
    .signature-section {
      display: flex;
      justify-content: space-between;
      margin: 40px 0 20px 0;
    }
    .signature-box {
      width: 45%;
      border-top: 1px solid var(--text);
      padding-top: 10px;
      text-align: center;
      font-size: 14px;
    }
    .vehicle-table {
      margin: 15px 0 25px 0;
    }
    .vehicle-header {
      font-size: 16px;
      font-weight: bold;
      margin: 15px 0 10px 0;
      color: var(--accent);
      display: flex;
      justify-content: space-between;
    }
    .vehicle-cost {
      color: #059669;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="company-section">
        ${r.company.logoBase64 ? `<img class="logo" src="${r.company.logoBase64}" />` : ''}
        <h1 class="company-name">${r.company.name || 'Car Shipping Receipt'}</h1>
        <p class="company-details">${[r.company.address, r.company.email, r.company.phone].filter(Boolean).join(' | ')}</p>
      </div>
      <div class="receipt-section">
        <h2 class="receipt-title">RECEIPT</h2>
        <p class="receipt-details">Receipt #: ${shortId}</p>
        <p class="receipt-details">Date: ${new Date(r.dateISO).toLocaleDateString()}</p>
        <p class="receipt-details">Customer: ${r.customer?.name || '-'}</p>
      </div>
    </div>
    
    <div class="content">
      <div class="info-sections">
        <div class="info-block">
          <h3 class="info-title">Customer Information</h3>
          <div class="info-item"><span class="info-label">Name:</span> ${r.customer?.name || '-'}</div>
          ${r.customer?.email ? `<div class="info-item"><span class="info-label">Email:</span> ${r.customer.email}</div>` : ''}
          ${r.customer?.phone ? `<div class="info-item"><span class="info-label">Phone:</span> ${r.customer.phone}</div>` : ''}
          ${r.customer?.address ? `<div class="info-item"><span class="info-label">Address:</span> ${r.customer.address}</div>` : ''}
        </div>
        
        <div class="info-block">
          <h3 class="info-title">Vehicles Summary</h3>
          <div class="info-item"><span class="info-label">Total:</span> ${r.vehicles.length} vehicle(s)</div>
        </div>
      </div>
      
      <h2 class="section-title">Vehicle Details</h2>
      ${r.vehicles.map((vehicle, index) => {
        const vehicleCost = calculateVehicleCost(r, index);
        return `
      <div class="vehicle-table">
        <h3 class="vehicle-header">
          <span>Vehicle #${index + 1}</span>
          <span class="vehicle-cost">${cur(vehicleCost)}</span>
        </h3>
        <table>
          <tbody>
            <tr>
              <td><strong>Make:</strong> ${vehicle.make}</td>
              <td><strong>Model:</strong> ${vehicle.model}</td>
            </tr>
            <tr>
              <td><strong>Year:</strong> ${vehicle.year}</td>
              <td><strong>Mileage:</strong> ${vehicle.mileage ?? 'N/A'}</td>
            </tr>
            <tr>
              <td colspan="2"><strong>VIN:</strong> ${vehicle.vin}</td>
            </tr>
          </tbody>
        </table>
      </div>
      `;
      }).join('')}
      
      <h2 class="section-title">Charges Summary</h2>
      <table class="charges-table">
        <tr>
          <td>Vehicle Costs</td>
          <td style="text-align: right;">${cur(vehicleCost)}</td>
        </tr>
        <tr>
          <td>Service Charge</td>
          <td style="text-align: right;">${cur(r.serviceCharge)}</td>
        </tr>
        ${r.taxRate ? `
        <tr>
          <td>Tax (${(r.taxRate*100).toFixed(2)}%)</td>
          <td style="text-align: right;">${cur(tax)}</td>
        </tr>
        ` : ''}
        <tr class="total-row">
          <td><strong>Total Amount</strong></td>
          <td style="text-align: right;"><strong>${cur(total)}</strong></td>
        </tr>
      </table>
      
      ${r.notes ? `
      <h2 class="section-title">Additional Notes</h2>
      <div class="notes">
        ${r.notes}
      </div>
      ` : ''}
      
      <div class="signature-section">
        <div class="signature-box">Customer Signature</div>
        <div class="signature-box">Authorized Signature</div>
      </div>
      
      <div class="footer">
        <p>Thank you for your business. For any questions, please contact ${r.company.email || r.company.phone || r.company.name}.</p>
        <p>This receipt is electronically generated and does not require a physical signature.</p>
      </div>
    </div>
  </div>
</body>
</html>`;
};

export const renderTemplateCompact = (r: Receipt) => {
  const { tax, total, vehicleCost } = computeTotals(r);
  const cur = (n: number) => formatCurrency(n, r.currency);
  
  // Generate short receipt number for display
  const receiptDate = new Date(r.dateISO);
  const year = receiptDate.getFullYear().toString().substr(2);
  const month = (receiptDate.getMonth() + 1).toString().padStart(2, '0');
  const day = receiptDate.getDate().toString().padStart(2, '0');
  const shortId = r.id.substring(0, 8);

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    @page { size: A4; margin: 15mm; }
    :root { 
      --primary: #2563eb;
      --secondary: #4b5563;
      --light: #f9fafb;
      --border: #e5e7eb;
      --text: #1f2937;
    }
    * { box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      color: var(--text);
      line-height: 1.4;
      margin: 0;
      padding: 0;
      background: #f3f4f6;
    }
    .container {
      max-width: 700px;
      margin: 0 auto;
      background: white;
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 20px;
      border-bottom: 2px solid var(--primary);
      background: var(--light);
    }
    .logo {
      width: 60px;
      height: 60px;
      object-fit: contain;
      border: 1px solid var(--border);
      padding: 5px;
    }
    .company-info h1 {
      font-size: 20px;
      margin: 0 0 5px 0;
      color: var(--primary);
    }
    .company-info p {
      margin: 0;
      font-size: 12px;
      color: var(--secondary);
    }
    .receipt-meta {
      text-align: right;
    }
    .receipt-meta h2 {
      font-size: 22px;
      margin: 0 0 5px 0;
      color: var(--primary);
    }
    .receipt-meta p {
      margin: 2px 0;
      font-size: 12px;
    }
    .content {
      padding: 20px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      margin-bottom: 20px;
    }
    .info-card {
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 15px;
      background: var(--light);
    }
    .info-card h3 {
      margin: 0 0 10px 0;
      font-size: 14px;
      color: var(--primary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .info-item {
      margin: 6px 0;
      font-size: 13px;
    }
    .info-label {
      font-weight: 600;
      display: inline-block;
      width: 70px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
      font-size: 13px;
    }
    th {
      background: var(--primary);
      color: white;
      text-align: left;
      padding: 8px 10px;
      font-weight: 600;
      font-size: 12px;
      text-transform: uppercase;
    }
    td {
      padding: 8px 10px;
      border: 1px solid var(--border);
    }
    tr:nth-child(even) {
      background: var(--light);
    }
    .charges-summary {
      width: 50%;
      margin-left: auto;
    }
    .charge-row {
      display: flex;
      justify-content: space-between;
      padding: 6px 0;
      font-size: 13px;
    }
    .charge-row.total {
      font-weight: 700;
      border-top: 1px solid var(--border);
      margin-top: 6px;
      padding-top: 6px;
      color: var(--primary);
    }
    .section-title {
      font-size: 16px;
      font-weight: 700;
      margin: 20px 0 10px 0;
      color: var(--primary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .notes {
      background: #fffbeb;
      border: 1px solid #fef3c7;
      padding: 12px;
      font-size: 12px;
      margin: 15px 0;
      border-radius: 4px;
    }
    .footer {
      text-align: center;
      padding: 15px;
      border-top: 1px solid var(--border);
      font-size: 11px;
      color: var(--secondary);
      background: var(--light);
    }
    .vehicle-section {
      margin: 15px 0;
      padding: 10px;
      border: 1px solid var(--border);
      border-radius: 4px;
      background: #fafafa;
    }
    .vehicle-header {
      font-size: 14px;
      font-weight: 600;
      margin: 0 0 8px 0;
      color: var(--primary);
      display: flex;
      justify-content: space-between;
    }
    .vehicle-cost {
      color: #059669;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="brand">
        ${r.company.logoBase64 ? `<img class="logo" src="${r.company.logoBase64}" />` : ''}
        <div class="company-info">
          <h1>${r.company.name || 'Car Shipping Receipt'}</h1>
          <p>${[r.company.address, r.company.email, r.company.phone].filter(Boolean).join(' • ')}</p>
        </div>
      </div>
      <div class="receipt-meta">
        <h2>RECEIPT</h2>
        <p>Receipt #: ${shortId}</p>
        <p>Date: ${new Date(r.dateISO).toLocaleDateString()}</p>
        <p>Customer: ${r.customer?.name || '-'}</p>
      </div>
    </div>
    
    <div class="content">
      <div class="info-grid">
        <div class="info-card">
          <h3>Vehicles (${r.vehicles.length})</h3>
          ${r.vehicles.map((vehicle, index) => {
            const vehicleCost = calculateVehicleCost(r, index);
            return `
          <div class="vehicle-section">
            <h4 class="vehicle-header">
              <span>Vehicle #${index + 1}</span>
              <span class="vehicle-cost">${cur(vehicleCost)}</span>
            </h4>
            <div class="info-item"><span class="info-label">Make:</span> ${vehicle.make}</div>
            <div class="info-item"><span class="info-label">Model:</span> ${vehicle.model}</div>
            <div class="info-item"><span class="info-label">Year:</span> ${vehicle.year}</div>
            <div class="info-item"><span class="info-label">Mileage:</span> ${vehicle.mileage ?? 'N/A'}</div>
            <div class="info-item"><span class="info-label">VIN:</span> ${vehicle.vin}</div>
          </div>
          `;
          }).join('')}
        </div>
        
        <div class="info-card">
          <h3>Customer Details</h3>
          <div class="info-item"><span class="info-label">Name:</span> ${r.customer?.name || '-'}</div>
          ${r.customer?.email ? `<div class="info-item"><span class="info-label">Email:</span> ${r.customer.email}</div>` : ''}
          ${r.customer?.phone ? `<div class="info-item"><span class="info-label">Phone:</span> ${r.customer.phone}</div>` : ''}
        </div>
      </div>
      
      <h3 class="section-title">Charges Summary</h3>
      <div class="charges-summary">
        <div class="charge-row">
          <span>Vehicle Costs</span>
          <span>${cur(vehicleCost)}</span>
        </div>
        <div class="charge-row">
          <span>Service Charge</span>
          <span>${cur(r.serviceCharge)}</span>
        </div>
        ${r.taxRate ? `
        <div class="charge-row">
          <span>Tax (${(r.taxRate*100).toFixed(2)}%)</span>
          <span>${cur(tax)}</span>
        </div>
        ` : ''}
        <div class="charge-row total">
          <span>Total</span>
          <span>${cur(total)}</span>
        </div>
      </div>
      
      ${r.notes ? `
      <h3 class="section-title">Notes</h3>
      <div class="notes">
        ${r.notes}
      </div>
      ` : ''}
      
      <div class="footer">
        <p>Thank you for your business. Contact: ${r.company.email || r.company.phone || r.company.name}</p>
      </div>
    </div>
  </div>
</body>
</html>`;
};
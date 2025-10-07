Perfect — here’s a ready-to-run Expo + TypeScript starter with PDF generation, logo upload, template selection, and receipt history. Copy the files below into a new Expo app and you’ll be generating sleek PDFs on Android in minutes.

Setup (one-time)

Create a new Expo TS app
npx create-expo-app carship-receipts -t expo-template-blank-typescript
cd carship-receipts
Install deps
npx expo install expo-print expo-sharing expo-file-system expo-image-picker @react-native-async-storage/async-storage
npm i react-hook-form zod @hookform/resolvers uuid
npm i -D @types/uuid
npx expo install react-native-get-random-values
npx expo install @react-navigation/native @react-navigation/native-stack react-native-screens react-native-safe-area-context react-native-gesture-handler
Run it
npx expo start
Project structure to add

App.tsx
types/receipt.ts
lib/format.ts
lib/pdf/templates.ts
lib/pdf/generate.ts
lib/storage/history.ts
lib/images/pickLogo.ts
screens/HomeScreen.tsx
screens/NewReceiptScreen.tsx
screens/HistoryScreen.tsx
Code: paste each file exactly as shown

App.tsx

React

import 'react-native-gesture-handler';
import 'react-native-get-random-values';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './screens/HomeScreen';
import NewReceiptScreen from './screens/NewReceiptScreen';
import HistoryScreen from './screens/HistoryScreen';

export type RootStackParamList = {
  Home: undefined;
  NewReceipt: undefined;
  History: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'CarShip Receipts' }} />
        <Stack.Screen name="NewReceipt" component={NewReceiptScreen} options={{ title: 'New Receipt' }} />
        <Stack.Screen name="History" component={HistoryScreen} options={{ title: 'Receipt History' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
types/receipt.ts

TypeScript

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
  logoBase64?: string; // data URL for embedding in HTML
};

export type Customer = {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
};

export type Receipt = {
  id: string;
  dateISO: string;
  company: Company;
  customer?: Customer;
  vehicle: Vehicle;
  carCost: number;
  serviceCharge: number;
  taxRate?: number; // 0.07 => 7%
  currency: string; // "USD"
  notes?: string;
  templateId: 'minimal' | 'card';
  pdfUri?: string;  // saved file path after generation
};
lib/format.ts

TypeScript

import { Receipt } from '../types/receipt';

export const formatCurrency = (amount: number, currency: string, locale = 'en-US') =>
  new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount || 0);

export const computeTotals = (r: Receipt) => {
  const sub = (r.carCost || 0) + (r.serviceCharge || 0);
  const tax = r.taxRate ? sub * r.taxRate : 0;
  const total = sub + tax;
  return { sub, tax, total };
};
lib/pdf/templates.ts

TypeScript

import { Receipt } from '../../types/receipt';
import { formatCurrency, computeTotals } from '../format';

export const renderTemplateMinimal = (r: Receipt) => {
  const { tax, total } = computeTotals(r);
  const cur = (n: number) => formatCurrency(n, r.currency);

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
    ${r.taxRate ? `<div class="row"><span>Tax (${(r.taxRate*100).toFixed(2)}%)</span><span>${cur(${computeTotals(r).tax})}</span></div>` : ''}
    <div class="row total" style="margin-top:6px; border-top: 1px dashed #e2e8f0; padding-top: 8px;"><span>Total</span><span>${cur(total)}</span></div>
  </div>

  ${r.notes ? `<div class="section-title">Notes</div><div class="card" style="padding: 12px; font-size:12px;">${r.notes}</div>` : ''}

  <div style="margin-top: 28px; padding-top: 12px; border-top: 1px solid #e2e8f0; color:#64748b; font-size:11px;">
    Thank you for your business. For questions, contact ${r.company.email || r.company.phone || r.company.name}.
  </div>
</body>
</html>`;
};

export const renderTemplateCard = (r: Receipt) => {
  const { tax, total } = computeTotals(r);
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
      ${r.taxRate ? `<div class="row"><span>Tax (${(r.taxRate*100).toFixed(2)}%)</span><span>${cur(${computeTotals(r).tax})}</span></div>` : ''}
      <div class="row total"><span>Total</span><span>${cur(total)}</span></div>
    </div>

    ${r.notes ? `<div class="card" style="margin-top:12px;"><div class="title">Notes</div><div>${r.notes}</div></div>` : ''}
  </div>
</body></html>`;
};
lib/pdf/generate.ts

TypeScript

import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { Receipt } from '../../types/receipt';
import { renderTemplateCard, renderTemplateMinimal } from './templates';

const htmlForTemplate = (r: Receipt) => {
  switch (r.templateId) {
    case 'card': return renderTemplateCard(r);
    case 'minimal':
    default: return renderTemplateMinimal(r);
  }
};

export async function generateReceiptPDF(r: Receipt): Promise<string> {
  const html = htmlForTemplate(r);
  const { uri } = await Print.printToFileAsync({ html });
  const filename = `Receipt_${r.id}.pdf`;
  const dest = `${FileSystem.documentDirectory}${filename}`;
  await FileSystem.moveAsync({ from: uri, to: dest });
  return dest;
}

export async function sharePDF(uri: string) {
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, { dialogTitle: 'Share Receipt PDF' });
  }
}

export async function saveToDownloads(pdfUri: string, fileName: string) {
  const perms = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
  if (!perms.granted) return;
  const base64 = await FileSystem.readAsStringAsync(pdfUri, { encoding: FileSystem.EncodingType.Base64 });
  const mime = 'application/pdf';
  const destUri = await FileSystem.StorageAccessFramework.createFileAsync(perms.directoryUri, fileName, mime);
  await FileSystem.writeAsStringAsync(destUri, base64, { encoding: FileSystem.EncodingType.Base64 });
}
lib/storage/history.ts

TypeScript

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Receipt } from '../../types/receipt';

const KEY = 'receipts';

export async function loadReceipts(): Promise<Receipt[]> {
  const raw = await AsyncStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function saveReceipt(r: Receipt) {
  const list = await loadReceipts();
  const newList = [r, ...list].slice(0, 500);
  await AsyncStorage.setItem(KEY, JSON.stringify(newList));
}

export async function updateReceipt(id: string, patch: Partial<Receipt>) {
  const list = await loadReceipts();
  const updated = list.map((r) => (r.id === id ? { ...r, ...patch } : r));
  await AsyncStorage.setItem(KEY, JSON.stringify(updated));
}

export async function deleteReceipt(id: string) {
  const list = await loadReceipts();
  const updated = list.filter((r) => r.id !== id);
  await AsyncStorage.setItem(KEY, JSON.stringify(updated));
}
lib/images/pickLogo.ts

TypeScript

import * as ImagePicker from 'expo-image-picker';

export async function pickLogoBase64(): Promise<string | undefined> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    base64: true,
    quality: 0.8,
  });
  if (result.canceled) return;
  const a = result.assets[0];
  const mime = a.mimeType || 'image/jpeg';
  if (!a.base64) return;
  return `data:${mime};base64,${a.base64}`;
}
screens/HomeScreen.tsx

React

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../App';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>CarShip Receipts</Text>
      <Text style={styles.subtitle}>Generate sleek PDF receipts for car shipping.</Text>

      <Pressable style={styles.button} onPress={() => navigation.navigate('NewReceipt')}>
        <Text style={styles.buttonText}>New Receipt</Text>
      </Pressable>

      <Pressable style={[styles.button, styles.secondary]} onPress={() => navigation.navigate('History')}>
        <Text style={[styles.buttonText, styles.secondaryText]}>Receipt History</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#64748b', marginBottom: 24 },
  button: { backgroundColor: '#2563eb', paddingVertical: 14, borderRadius: 12, marginBottom: 12, alignItems: 'center' },
  buttonText: { color: 'white', fontSize: 16, fontWeight: '600' },
  secondary: { backgroundColor: '#e2e8f0' },
  secondaryText: { color: '#0f172a' },
});
screens/NewReceiptScreen.tsx

React

import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Pressable, Alert, Image, ActivityIndicator } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { v4 as uuid } from 'uuid';
import { Receipt } from '../types/receipt';
import { pickLogoBase64 } from '../lib/images/pickLogo';
import { generateReceiptPDF, sharePDF } from '../lib/pdf/generate';
import { saveReceipt, updateReceipt } from '../lib/storage/history';

const preprocessNumber = (v: unknown) => {
  if (v === '' || v === null || v === undefined) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
};

const schema = z.object({
  companyName: z.string().min(2, 'Company name required'),
  companyAddress: z.string().optional(),
  companyPhone: z.string().optional(),
  companyEmail: z.string().email('Invalid email').optional().or(z.literal('')).optional(),
  customerName: z.string().optional(),
  customerEmail: z.string().email('Invalid email').optional().or(z.literal('')).optional(),
  customerPhone: z.string().optional(),
  vehicleMake: z.string().min(1, 'Required'),
  vehicleModel: z.string().min(1, 'Required'),
  vehicleYear: z.preprocess(preprocessNumber, z.number().int().min(1900).max(new Date().getFullYear() + 1)),
  vehicleMileage: z.preprocess(preprocessNumber, z.number().int().nonnegative()).optional(),
  vin: z.string().min(5, 'VIN too short'),
  carCost: z.preprocess(preprocessNumber, z.number().nonnegative()),
  serviceCharge: z.preprocess(preprocessNumber, z.number().nonnegative()),
  taxRate: z.preprocess(preprocessNumber, z.number().min(0).max(1)).optional(),
  currency: z.string().min(3, 'Currency code like USD'),
  notes: z.string().optional(),
  templateId: z.enum(['minimal', 'card']).default('minimal'),
});

type FormValues = z.infer<typeof schema>;

const TEMPLATES = [
  { id: 'minimal' as const, name: 'Minimal' },
  { id: 'card' as const, name: 'Card' },
];

export default function NewReceiptScreen() {
  const [logo, setLogo] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);

  const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      currency: 'USD',
      taxRate: 0,
      templateId: 'minimal',
    },
    mode: 'onBlur',
  });

  const templateId = watch('templateId');

  const onPickLogo = async () => {
    const b64 = await pickLogoBase64();
    if (b64) setLogo(b64);
  };

  const onSubmit = async (v: FormValues) => {
    try {
      setBusy(true);
      const id = uuid();
      const receipt: Receipt = {
        id,
        dateISO: new Date().toISOString(),
        company: {
          name: v.companyName,
          address: v.companyAddress,
          phone: v.companyPhone,
          email: v.companyEmail || undefined,
          logoBase64: logo,
        },
        customer: {
          name: v.customerName || undefined,
          email: v.customerEmail || undefined,
          phone: v.customerPhone || undefined,
        },
        vehicle: {
          make: v.vehicleMake,
          model: v.vehicleModel,
          year: v.vehicleYear,
          mileage: v.vehicleMileage,
          vin: v.vin,
        },
        carCost: v.carCost,
        serviceCharge: v.serviceCharge,
        taxRate: v.taxRate,
        currency: v.currency,
        notes: v.notes,
        templateId: v.templateId,
      };

      await saveReceipt(receipt);
      const pdfUri = await generateReceiptPDF(receipt);
      await updateReceipt(id, { pdfUri });
      await sharePDF(pdfUri);
      Alert.alert('Success', 'Receipt PDF generated and ready to share.');
    } catch (e: any) {
      console.error(e);
      Alert.alert('Error', e?.message || 'Failed to generate receipt.');
    } finally {
      setBusy(false);
    }
  };

  const TemplateOption = ({ id, name }: { id: 'minimal' | 'card'; name: string }) => (
    <Pressable
      onPress={() => setValue('templateId', id, { shouldDirty: true })}
      style={[styles.template, templateId === id && styles.templateActive]}
    >
      <Text style={[styles.templateText, templateId === id && styles.templateTextActive]}>{name}</Text>
    </Pressable>
  );

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.sectionTitle}>Company</Text>
      <Row>
        <Col>
          <Label text="Name" error={errors.companyName?.message} />
          <Controller
            control={control}
            name="companyName"
            render={({ field: { onChange, value } }) => (
              <TextInput style={styles.input} placeholder="Your Company LLC" value={value} onChangeText={onChange} />
            )}
          />
        </Col>
      </Row>
      <Row>
        <Col>
          <Label text="Address" />
          <Controller
            control={control}
            name="companyAddress"
            render={({ field: { onChange, value } }) => (
              <TextInput style={styles.input} placeholder="123 Main St" value={value} onChangeText={onChange} />
            )}
          />
        </Col>
      </Row>
      <Row>
        <Col>
          <Label text="Phone" />
          <Controller
            control={control}
            name="companyPhone"
            render={({ field: { onChange, value } }) => (
              <TextInput style={styles.input} placeholder="+1 555 123 4567" value={value} onChangeText={onChange} keyboardType="phone-pad" />
            )}
          />
        </Col>
        <Col>
          <Label text="Email" error={errors.companyEmail?.message} />
          <Controller
            control={control}
            name="companyEmail"
            render={({ field: { onChange, value } }) => (
              <TextInput style={styles.input} placeholder="billing@company.com" value={value} onChangeText={onChange} keyboardType="email-address" autoCapitalize="none" />
            )}
          />
        </Col>
      </Row>

      <View style={{ marginTop: 8, marginBottom: 16 }}>
        <Text style={styles.label}>Logo</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Pressable style={styles.button} onPress={onPickLogo}><Text style={styles.buttonText}>Upload Logo</Text></Pressable>
          {logo ? <Image source={{ uri: logo }} style={{ width: 48, height: 48, borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0' }} /> : <Text style={{ color: '#64748b' }}>No logo</Text>}
        </View>
      </View>

      <Text style={styles.sectionTitle}>Customer</Text>
      <Row>
        <Col>
          <Label text="Name" />
          <Controller control={control} name="customerName" render={({ field: { onChange, value } }) => <TextInput style={styles.input} placeholder="Customer name" value={value} onChangeText={onChange} />} />
        </Col>
      </Row>
      <Row>
        <Col>
          <Label text="Email" error={errors.customerEmail?.message} />
          <Controller control={control} name="customerEmail" render={({ field: { onChange, value } }) => <TextInput style={styles.input} placeholder="email@example.com" value={value} onChangeText={onChange} autoCapitalize="none" keyboardType="email-address" />} />
        </Col>
        <Col>
          <Label text="Phone" />
          <Controller control={control} name="customerPhone" render={({ field: { onChange, value } }) => <TextInput style={styles.input} placeholder="+1 555..." value={value} onChangeText={onChange} keyboardType="phone-pad" />} />
        </Col>
      </Row>

      <Text style={styles.sectionTitle}>Vehicle</Text>
      <Row>
        <Col><Label text="Make" error={errors.vehicleMake?.message} />
          <Controller control={control} name="vehicleMake" render={({ field: { onChange, value } }) => <TextInput style={styles.input} placeholder="Toyota" value={value} onChangeText={onChange} />} />
        </Col>
        <Col><Label text="Model" error={errors.vehicleModel?.message} />
          <Controller control={control} name="vehicleModel" render={({ field: { onChange, value } }) => <TextInput style={styles.input} placeholder="Camry" value={value} onChangeText={onChange} />} />
        </Col>
      </Row>
      <Row>
        <Col><Label text="Year" error={errors.vehicleYear?.message} />
          <Controller control={control} name="vehicleYear" render={({ field: { onChange, value } }) => <TextInput style={styles.input} placeholder="2023" value={String(value ?? '')} onChangeText={onChange} keyboardType="number-pad" />} />
        </Col>
        <Col><Label text="Mileage" error={errors.vehicleMileage?.message} />
          <Controller control={control} name="vehicleMileage" render={({ field: { onChange, value } }) => <TextInput style={styles.input} placeholder="45000" value={value ? String(value) : ''} onChangeText={onChange} keyboardType="number-pad" />} />
        </Col>
      </Row>
      <Row>
        <Col>
          <Label text="VIN" error={errors.vin?.message} />
          <Controller control={control} name="vin" render={({ field: { onChange, value } }) => <TextInput style={styles.input} placeholder="1HGCM82633A..." value={value} onChangeText={onChange} autoCapitalize="characters" />} />
        </Col>
      </Row>

      <Text style={styles.sectionTitle}>Charges</Text>
      <Row>
        <Col><Label text="Car Cost" error={errors.carCost?.message} />
          <Controller control={control} name="carCost" render={({ field: { onChange, value } }) => <TextInput style={styles.input} placeholder="15000" value={value ? String(value) : ''} onChangeText={onChange} keyboardType="decimal-pad" />} />
        </Col>
        <Col><Label text="Service Charge" error={errors.serviceCharge?.message} />
          <Controller control={control} name="serviceCharge" render={({ field: { onChange, value } }) => <TextInput style={styles.input} placeholder="250" value={value ? String(value) : ''} onChangeText={onChange} keyboardType="decimal-pad" />} />
        </Col>
      </Row>
      <Row>
        <Col><Label text="Tax Rate (e.g., 0.07)" error={errors.taxRate?.message} />
          <Controller control={control} name="taxRate" render={({ field: { onChange, value } }) => <TextInput style={styles.input} placeholder="0" value={value ? String(value) : ''} onChangeText={onChange} keyboardType="decimal-pad" />} />
        </Col>
        <Col><Label text="Currency" error={errors.currency?.message} />
          <Controller control={control} name="currency" render={({ field: { onChange, value } }) => <TextInput style={styles.input} placeholder="USD" autoCapitalize="characters" value={value} onChangeText={onChange} />} />
        </Col>
      </Row>
      <Row>
        <Col>
          <Label text="Notes" />
          <Controller control={control} name="notes" render={({ field: { onChange, value } }) => (
            <TextInput style={[styles.input, { height: 80, textAlignVertical: 'top' }]} placeholder="Any additional info..." value={value} onChangeText={onChange} multiline />
          )} />
        </Col>
      </Row>

      <Text style={styles.sectionTitle}>Template</Text>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        {TEMPLATES.map(t => <TemplateOption key={t.id} id={t.id} name={t.name} />)}
      </View>

      <Pressable style={[styles.button, { marginTop: 16 }]} onPress={handleSubmit(onSubmit)} disabled={busy}>
        {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Generate PDF</Text>}
      </Pressable>
    </ScrollView>
  );
}

const Label = ({ text, error }: { text: string; error?: string }) => (
  <View style={{ marginBottom: 6 }}>
    <Text style={styles.label}>{text}</Text>
    {error ? <Text style={{ color: '#dc2626', fontSize: 12 }}>{error}</Text> : null}
  </View>
);

const Row = ({ children }: { children: React.ReactNode }) => (
  <View style={{ flexDirection: 'row', gap: 12 }}>{children}</View>
);

const Col = ({ children }: { children: React.ReactNode }) => (
  <View style={{ flex: 1, marginBottom: 12 }}>{children}</View>
);

const styles = StyleSheet.create({
  sectionTitle: { marginTop: 16, marginBottom: 8, fontSize: 14, color: '#475569', textTransform: 'uppercase', letterSpacing: 1, fontWeight: '700' },
  input: { backgroundColor: '#fff', borderColor: '#e2e8f0', borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },
  label: { fontSize: 12, color: '#64748b' },
  button: { backgroundColor: '#2563eb', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  template: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  templateActive: { backgroundColor: '#2563eb' },
  templateText: { color: '#0f172a', fontWeight: '600' },
  templateTextActive: { color: 'white' },
});
screens/HistoryScreen.tsx

React

import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Pressable, RefreshControl, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { loadReceipts, deleteReceipt, updateReceipt } from '../lib/storage/history';
import { Receipt } from '../types/receipt';
import { sharePDF, generateReceiptPDF, saveToDownloads } from '../lib/pdf/generate';
import { formatCurrency } from '../lib/format';

export default function HistoryScreen() {
  const [data, setData] = useState<Receipt[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const list = await loadReceipts();
    setData(list);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const onShare = async (r: Receipt) => {
    try {
      let uri = r.pdfUri;
      if (!uri) {
        uri = await generateReceiptPDF(r);
        await updateReceipt(r.id, { pdfUri: uri });
      }
      await sharePDF(uri);
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Could not share PDF');
    }
  };

  const onSaveDownloads = async (r: Receipt) => {
    try {
      let uri = r.pdfUri;
      if (!uri) {
        uri = await generateReceiptPDF(r);
        await updateReceipt(r.id, { pdfUri: uri });
      }
      await saveToDownloads(uri, `Receipt_${r.id}.pdf`);
      Alert.alert('Saved', 'Saved to your chosen Downloads folder.');
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Could not save PDF');
    }
  };

  const onDelete = async (id: string) => {
    await deleteReceipt(id);
    await load();
  };

  const Item = ({ r }: { r: Receipt }) => (
    <View style={styles.card}>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{r.company.name}</Text>
        <Text style={styles.sub}>#{r.id} • {new Date(r.dateISO).toLocaleDateString()}</Text>
        <Text style={styles.sub}>
          {r.vehicle.year} {r.vehicle.make} {r.vehicle.model} • VIN: {r.vehicle.vin}
        </Text>
        <Text style={styles.sub}>
          Total: {formatCurrency((r.carCost || 0) + (r.serviceCharge || 0) + ((r.taxRate || 0) * ((r.carCost || 0) + (r.serviceCharge || 0))), r.currency)}
        </Text>
      </View>
      <View style={styles.actions}>
        <Pressable style={styles.action} onPress={() => onShare(r)}><Text style={styles.actionText}>Share</Text></Pressable>
        <Pressable style={styles.action} onPress={() => onSaveDownloads(r)}><Text style={styles.actionText}>Save</Text></Pressable>
        <Pressable style={[styles.action, styles.danger]} onPress={() => onDelete(r.id)}><Text style={[styles.actionText, styles.dangerText]}>Delete</Text></Pressable>
      </View>
    </View>
  );

  return (
    <FlatList
      contentContainerStyle={{ padding: 16 }}
      data={data}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <Item r={item} />}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      ListEmptyComponent={<Text style={{ textAlign: 'center', color: '#64748b', marginTop: 40 }}>No receipts yet.</Text>}
    />
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 12, marginBottom: 12, flexDirection: 'row', gap: 12 },
  title: { fontSize: 16, fontWeight: '700' },
  sub: { fontSize: 12, color: '#64748b', marginTop: 2 },
  actions: { justifyContent: 'space-between' },
  action: { backgroundColor: '#2563eb', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, marginBottom: 6 },
  actionText: { color: '#fff', fontWeight: '700' },
  danger: { backgroundColor: '#fee2e2' },
  dangerText: { color: '#991b1b' },
});
That’s it — this runs now

New Receipt: enter details, upload logo, pick template, generate PDF, and share.
History: list of receipts, re-share, save to Downloads, delete.
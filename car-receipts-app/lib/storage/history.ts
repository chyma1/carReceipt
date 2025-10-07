import AsyncStorage from '@react-native-async-storage/async-storage';
import { Receipt } from '@/types/receipt';

const KEY = 'receipts';

export async function loadReceipts(): Promise<Receipt[]> {
  const raw = await AsyncStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function saveReceipt(r: Receipt): Promise<void> {
  const list = await loadReceipts();
  const newList = [r, ...list].slice(0, 500); // keep last 500
  await AsyncStorage.setItem(KEY, JSON.stringify(newList));
}

export async function updateReceiptPdfUri(id: string, pdfUri: string) {
  const list = await loadReceipts();
  const updated = list.map(r => r.id === id ? { ...r, pdfUri } : r);
  await AsyncStorage.setItem(KEY, JSON.stringify(updated));
}
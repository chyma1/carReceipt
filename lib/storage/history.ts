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
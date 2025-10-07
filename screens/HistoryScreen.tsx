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
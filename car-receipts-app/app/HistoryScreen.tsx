import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { Receipt } from '@/types/receipt';
import { loadReceipts } from '@/lib/storage/history';
import { sharePDF } from '@/lib/pdf/generate';

export default function HistoryScreen() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);

  useEffect(() => {
    loadReceiptsData();
  }, []);

  const loadReceiptsData = async () => {
    try {
      const data = await loadReceipts();
      setReceipts(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load receipts');
    }
  };

  const handleShareReceipt = async (receipt: Receipt) => {
    if (receipt.pdfUri) {
      try {
        await sharePDF(receipt.pdfUri);
      } catch (error) {
        Alert.alert('Error', 'Failed to share receipt');
      }
    } else {
      Alert.alert('Error', 'Receipt PDF not available');
    }
  };

  const renderReceiptItem = ({ item }: { item: Receipt }) => (
    <View style={styles.receiptItem}>
      <View style={styles.receiptHeader}>
        <Text style={styles.receiptTitle}>{item.company.name || 'Receipt'}</Text>
        <Text style={styles.receiptDate}>
          {new Date(item.dateISO).toLocaleDateString()}
        </Text>
      </View>
      <Text style={styles.receiptVehicle}>
        {item.vehicle.make} {item.vehicle.model} ({item.vehicle.year})
      </Text>
      <Text style={styles.receiptVin}>VIN: {item.vehicle.vin}</Text>
      <View style={styles.receiptActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleShareReceipt(item)}
        >
          <Text style={styles.actionButtonText}>Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Receipt History</Text>
      {receipts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No receipts found</Text>
        </View>
      ) : (
        <FlatList
          data={receipts}
          renderItem={renderReceiptItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 20,
    color: '#333',
  },
  listContainer: {
    paddingHorizontal: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
  },
  receiptItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  receiptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  receiptTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  receiptDate: {
    fontSize: 14,
    color: '#666',
  },
  receiptVehicle: {
    fontSize: 16,
    marginBottom: 4,
    color: '#333',
  },
  receiptVin: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  receiptActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
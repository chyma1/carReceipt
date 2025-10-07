import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { v4 as uuid } from 'uuid';

import ReceiptForm from '../../components/ReceiptForm';
import { useReceiptForm } from '../../lib/forms/useReceiptForm';
import { saveReceipt, updateReceiptPdfUri } from '../../lib/storage/history';
import { generateReceiptPDF, sharePDF } from '../../lib/pdf/generate';
import { Receipt } from '../../types/receipt';
import { pickLogoBase64 } from '../../lib/images/pickLogo';

export default function NewReceiptScreen() {
  const router = useRouter();
  const [logoBase64, setLogoBase64] = useState<string | undefined>(undefined);
  const form = useReceiptForm();

  const handlePickLogo = async () => {
    try {
      const logo = await pickLogoBase64();
      setLogoBase64(logo);
    } catch (error) {
      Alert.alert('Error', 'Failed to pick logo');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      const id = uuid();
      const receipt: Receipt = {
        id,
        dateISO: new Date().toISOString(),
        company: { 
          name: values.companyName, 
          address: values.companyAddress, 
          phone: values.companyPhone, 
          email: values.companyEmail, 
          logoBase64 
        },
        customer: { 
          name: values.customerName, 
          email: values.customerEmail, 
          phone: values.customerPhone, 
          address: values.customerAddress 
        },
        vehicle: values.vehicle,
        carCost: values.carCost,
        serviceCharge: values.serviceCharge,
        taxRate: values.taxRate,
        currency: values.currency,
        notes: values.notes,
        templateId: values.templateId || 'minimal',
      };

      await saveReceipt(receipt);
      const pdfUri = await generateReceiptPDF(receipt);
      await updateReceiptPdfUri(id, pdfUri);

      // Share the PDF
      await sharePDF(pdfUri);

      Alert.alert('Success', 'Receipt generated and shared successfully!');
      router.push('/(tabs)');
    } catch (error) {
      Alert.alert('Error', 'Failed to generate receipt');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>New Receipt</Text>
      <ReceiptForm 
        form={form} 
        onPickLogo={handlePickLogo} 
        logoBase64={logoBase64}
        onSubmit={handleSubmit}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
});
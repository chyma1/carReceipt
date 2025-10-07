import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Controller } from 'react-hook-form';
import { TEMPLATES } from '@/lib/pdf/templates';

interface ReceiptFormProps {
  form: any;
  onPickLogo: () => void;
  logoBase64?: string;
  onSubmit: (data: any) => void;
}

export default function ReceiptForm({ form, onPickLogo, logoBase64, onSubmit }: ReceiptFormProps) {
  const { control, handleSubmit, formState: { errors } } = form;

  return (
    <ScrollView>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Company Information</Text>
        <Controller
          control={control}
          name="companyName"
          render={({ field: { onChange, onBlur, value } }) => (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Company Name *</Text>
              <TextInput
                style={styles.input}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                placeholder="Enter company name"
              />
              {errors.companyName && <Text style={styles.error}>{errors.companyName.message}</Text>}
            </View>
          )}
        />

        <Controller
          control={control}
          name="companyAddress"
          render={({ field: { onChange, onBlur, value } }) => (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Address</Text>
              <TextInput
                style={styles.input}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                placeholder="Enter company address"
              />
            </View>
          )}
        />

        <View style={styles.row}>
          <View style={styles.halfInputContainer}>
            <Controller
              control={control}
              name="companyPhone"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Phone</Text>
                  <TextInput
                    style={styles.input}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    placeholder="Enter phone number"
                    keyboardType="phone-pad"
                  />
                </View>
              )}
            />
          </View>

          <View style={styles.halfInputContainer}>
            <Controller
              control={control}
              name="companyEmail"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Email</Text>
                  <TextInput
                    style={styles.input}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    placeholder="Enter email address"
                    keyboardType="email-address"
                  />
                  {errors.companyEmail && <Text style={styles.error}>{errors.companyEmail.message}</Text>}
                </View>
              )}
            />
          </View>
        </View>

        <TouchableOpacity style={styles.button} onPress={onPickLogo}>
          <Text style={styles.buttonText}>Pick Company Logo</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Customer Information</Text>
        <Controller
          control={control}
          name="customerName"
          render={({ field: { onChange, onBlur, value } }) => (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Customer Name</Text>
              <TextInput
                style={styles.input}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                placeholder="Enter customer name"
              />
            </View>
          )}
        />

        <Controller
          control={control}
          name="customerAddress"
          render={({ field: { onChange, onBlur, value } }) => (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Address</Text>
              <TextInput
                style={styles.input}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                placeholder="Enter customer address"
              />
            </View>
          )}
        />

        <View style={styles.row}>
          <View style={styles.halfInputContainer}>
            <Controller
              control={control}
              name="customerPhone"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Phone</Text>
                  <TextInput
                    style={styles.input}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    placeholder="Enter phone number"
                    keyboardType="phone-pad"
                  />
                </View>
              )}
            />
          </View>

          <View style={styles.halfInputContainer}>
            <Controller
              control={control}
              name="customerEmail"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Email</Text>
                  <TextInput
                    style={styles.input}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    placeholder="Enter email address"
                    keyboardType="email-address"
                  />
                  {errors.customerEmail && <Text style={styles.error}>{errors.customerEmail.message}</Text>}
                </View>
              )}
            />
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Vehicle Information</Text>
        <Controller
          control={control}
          name="vehicle.make"
          render={({ field: { onChange, onBlur, value } }) => (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Make *</Text>
              <TextInput
                style={styles.input}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                placeholder="Enter vehicle make"
              />
              {errors.vehicle?.make && <Text style={styles.error}>{errors.vehicle.make.message}</Text>}
            </View>
          )}
        />

        <Controller
          control={control}
          name="vehicle.model"
          render={({ field: { onChange, onBlur, value } }) => (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Model *</Text>
              <TextInput
                style={styles.input}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                placeholder="Enter vehicle model"
              />
              {errors.vehicle?.model && <Text style={styles.error}>{errors.vehicle.model.message}</Text>}
            </View>
          )}
        />

        <View style={styles.row}>
          <View style={styles.halfInputContainer}>
            <Controller
              control={control}
              name="vehicle.year"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Year *</Text>
                  <TextInput
                    style={styles.input}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value ? value.toString() : ''}
                    placeholder="Enter vehicle year"
                    keyboardType="numeric"
                  />
                  {errors.vehicle?.year && <Text style={styles.error}>{errors.vehicle.year.message}</Text>}
                </View>
              )}
            />
          </View>

          <View style={styles.halfInputContainer}>
            <Controller
              control={control}
              name="vehicle.mileage"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Mileage</Text>
                  <TextInput
                    style={styles.input}
                    onBlur={onBlur}
                    onChangeText={val => onChange(val ? parseInt(val) : '')}
                    value={value ? value.toString() : ''}
                    placeholder="Enter vehicle mileage"
                    keyboardType="numeric"
                  />
                </View>
              )}
            />
          </View>
        </View>

        <Controller
          control={control}
          name="vehicle.vin"
          render={({ field: { onChange, onBlur, value } }) => (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>VIN *</Text>
              <TextInput
                style={styles.input}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                placeholder="Enter vehicle identification number"
              />
              {errors.vehicle?.vin && <Text style={styles.error}>{errors.vehicle.vin.message}</Text>}
            </View>
          )}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Charges</Text>
        <View style={styles.row}>
          <View style={styles.halfInputContainer}>
            <Controller
              control={control}
              name="carCost"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Car Cost *</Text>
                  <TextInput
                    style={styles.input}
                    onBlur={onBlur}
                    onChangeText={val => onChange(val ? parseFloat(val) : 0)}
                    value={value ? value.toString() : ''}
                    placeholder="Enter car cost"
                    keyboardType="numeric"
                  />
                  {errors.carCost && <Text style={styles.error}>{errors.carCost.message}</Text>}
                </View>
              )}
            />
          </View>

          <View style={styles.halfInputContainer}>
            <Controller
              control={control}
              name="serviceCharge"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Service Charge *</Text>
                  <TextInput
                    style={styles.input}
                    onBlur={onBlur}
                    onChangeText={val => onChange(val ? parseFloat(val) : 0)}
                    value={value ? value.toString() : ''}
                    placeholder="Enter service charge"
                    keyboardType="numeric"
                  />
                  {errors.serviceCharge && <Text style={styles.error}>{errors.serviceCharge.message}</Text>}
                </View>
              )}
            />
          </View>
        </View>

        <Controller
          control={control}
          name="taxRate"
          render={({ field: { onChange, onBlur, value } }) => (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Tax Rate</Text>
              <TextInput
                style={styles.input}
                onBlur={onBlur}
                onChangeText={val => onChange(val ? parseFloat(val) : 0)}
                value={value ? value.toString() : ''}
                placeholder="Enter tax rate (e.g., 0.07 for 7%)"
                keyboardType="numeric"
              />
              {errors.taxRate && <Text style={styles.error}>{errors.taxRate.message}</Text>}
            </View>
          )}
        />

        <Controller
          control={control}
          name="currency"
          render={({ field: { onChange, onBlur, value } }) => (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Currency *</Text>
              <TextInput
                style={styles.input}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                placeholder="Enter currency code (e.g., USD)"
              />
              {errors.currency && <Text style={styles.error}>{errors.currency.message}</Text>}
            </View>
          )}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Template</Text>
        <Controller
          control={control}
          name="templateId"
          render={({ field: { onChange, value } }) => (
            <View style={styles.templateContainer}>
              {TEMPLATES.map((template) => (
                <TouchableOpacity
                  key={template.id}
                  style={[
                    styles.templateButton,
                    value === template.id && styles.selectedTemplateButton
                  ]}
                  onPress={() => onChange(template.id)}
                >
                  <Text style={[
                    styles.templateButtonText,
                    value === template.id && styles.selectedTemplateButtonText
                  ]}>
                    {template.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notes</Text>
        <Controller
          control={control}
          name="notes"
          render={({ field: { onChange, onBlur, value } }) => (
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, styles.textArea]}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                placeholder="Enter any additional notes"
                multiline
                numberOfLines={4}
              />
            </View>
          )}
        />
      </View>

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit(onSubmit)}>
        <Text style={styles.submitButtonText}>Generate Receipt</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  inputContainer: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInputContainer: {
    flex: 0.48,
  },
  error: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  templateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 8,
  },
  templateButton: {
    padding: 12,
    borderRadius: 4,
    backgroundColor: '#e0e0e0',
    flex: 0.45,
    alignItems: 'center',
  },
  selectedTemplateButton: {
    backgroundColor: '#2196F3',
  },
  templateButtonText: {
    color: '#333',
    fontWeight: 'bold',
  },
  selectedTemplateButtonText: {
    color: 'white',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 4,
    alignItems: 'center',
    marginVertical: 20,
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
});
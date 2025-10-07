import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Pressable, Alert, Image, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { v4 as uuid } from 'uuid';
import { Receipt, Vehicle } from '../types/receipt';
import { pickLogoBase64 } from '../lib/images/pickLogo';
import { generateReceiptPDF, sharePDF } from '../lib/pdf/generate';
import { saveReceipt, updateReceipt } from '../lib/storage/history';
import { generateShortReceiptNumber } from '../lib/pdf/generate';

const preprocessNumber = (v: unknown) => {
  if (v === '' || v === null || v === undefined) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
};

const vehicleSchema = z.object({
  id: z.string(),
  make: z.string().min(1, 'Required'),
  model: z.string().min(1, 'Required'),
  year: z.preprocess(preprocessNumber, z.number().int().min(1900).max(new Date().getFullYear() + 1)),
  mileage: z.preprocess(preprocessNumber, z.number().int().nonnegative()).optional(),
  vin: z.string().min(5, 'VIN too short'),
  cost: z.preprocess(preprocessNumber, z.number().nonnegative()).optional(),
});

const schema = z.object({
  companyName: z.string().min(2, 'Company name required'),
  companyAddress: z.string().optional(),
  companyPhone: z.string().optional(),
  companyEmail: z.string().email('Invalid email').optional().or(z.literal('')).optional(),
  customerName: z.string().optional(),
  customerEmail: z.string().email('Invalid email').optional().or(z.literal('')).optional(),
  customerPhone: z.string().optional(),
  vehicles: z.array(vehicleSchema).min(1, 'At least one vehicle is required'),
  serviceCharge: z.preprocess(preprocessNumber, z.number().nonnegative()),
  taxRate: z.preprocess(preprocessNumber, z.number().min(0).max(1)).optional(),
  currency: z.string().min(3, 'Currency code like USD'),
  notes: z.string().optional(),
  templateId: z.enum(['minimal', 'card', 'modern', 'professional', 'compact']).default('minimal'),
});

type FormValues = z.infer<typeof schema>;

const TEMPLATES = [
  { id: 'minimal' as const, name: 'Minimal' },
  { id: 'card' as const, name: 'Card' },
  { id: 'modern' as const, name: 'Modern' },
  { id: 'professional' as const, name: 'Professional' },
  { id: 'compact' as const, name: 'Compact' },
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
      vehicles: [
        {
          id: uuid(),
          make: '',
          model: '',
          year: new Date().getFullYear(),
          mileage: undefined,
          vin: '',
          cost: undefined,
        }
      ],
    },
    mode: 'onBlur',
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "vehicles"
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
      const shortReceiptNumber = generateShortReceiptNumber();
      
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
        vehicles: v.vehicles,
        carCost: v.vehicles.reduce((total, vehicle) => total + (vehicle.cost || 0), 0), // Calculate total from individual costs
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

  const TemplateOption = ({ id, name }: { id: 'minimal' | 'card' | 'modern' | 'professional' | 'compact'; name: string }) => (
    <Pressable
      onPress={() => setValue('templateId', id, { shouldDirty: true })}
      style={[styles.templateOption, templateId === id && styles.templateOptionActive]}
    >
      <Text style={[styles.templateOptionText, templateId === id && styles.templateOptionTextActive]}>{name}</Text>
    </Pressable>
  );

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Create New Receipt</Text>
          <Text style={styles.headerSubtitle}>Fill in the details below to generate a professional car shipping receipt</Text>
        </View>

        {/* Company Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
              <Text style={styles.sectionIconText}>🏢</Text>
            </View>
            <Text style={styles.sectionTitle}>Company Information</Text>
          </View>
          
          <View style={styles.inputGroup}>
            <Controller
              control={control}
              name="companyName"
              render={({ field: { onChange, value } }) => (
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Company Name *</Text>
                  <TextInput 
                    style={[styles.input, errors.companyName && styles.inputError]} 
                    placeholder="Your Company LLC" 
                    value={value} 
                    onChangeText={onChange}
                  />
                  {errors.companyName && <Text style={styles.errorText}>{errors.companyName.message}</Text>}
                </View>
              )}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Controller
              control={control}
              name="companyAddress"
              render={({ field: { onChange, value } }) => (
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Address</Text>
                  <TextInput 
                    style={styles.input} 
                    placeholder="123 Main St" 
                    value={value} 
                    onChangeText={onChange}
                  />
                </View>
              )}
            />
          </View>
          
          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Controller
                control={control}
                name="companyPhone"
                render={({ field: { onChange, value } }) => (
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Phone</Text>
                    <TextInput 
                      style={styles.input} 
                      placeholder="+1 555 123 4567" 
                      value={value} 
                      onChangeText={onChange} 
                      keyboardType="phone-pad" 
                    />
                  </View>
                )}
              />
            </View>
            
            <View style={styles.halfWidth}>
              <Controller
                control={control}
                name="companyEmail"
                render={({ field: { onChange, value } }) => (
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Email</Text>
                    <TextInput 
                      style={[styles.input, errors.companyEmail && styles.inputError]} 
                      placeholder="billing@company.com" 
                      value={value} 
                      onChangeText={onChange} 
                      keyboardType="email-address" 
                      autoCapitalize="none" 
                    />
                    {errors.companyEmail && <Text style={styles.errorText}>{errors.companyEmail.message}</Text>}
                  </View>
                )}
              />
            </View>
          </View>
          
          <View style={styles.logoSection}>
            <Text style={styles.inputLabel}>Company Logo</Text>
            <View style={styles.logoContainer}>
              <Pressable style={styles.logoButton} onPress={onPickLogo}>
                <Text style={styles.logoButtonText}>Upload Logo</Text>
              </Pressable>
              {logo && (
                <Image 
                  source={{ uri: logo }} 
                  style={styles.logoPreview} 
                />
              )}
            </View>
          </View>
        </View>

        {/* Customer Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
              <Text style={styles.sectionIconText}>👤</Text>
            </View>
            <Text style={styles.sectionTitle}>Customer Information</Text>
          </View>
          
          <View style={styles.inputGroup}>
            <Controller
              control={control}
              name="customerName"
              render={({ field: { onChange, value } }) => (
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Customer Name</Text>
                  <TextInput 
                    style={styles.input} 
                    placeholder="John Smith" 
                    value={value} 
                    onChangeText={onChange}
                  />
                </View>
              )}
            />
          </View>
          
          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Controller
                control={control}
                name="customerEmail"
                render={({ field: { onChange, value } }) => (
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Email</Text>
                    <TextInput 
                      style={[styles.input, errors.customerEmail && styles.inputError]} 
                      placeholder="john@example.com" 
                      value={value} 
                      onChangeText={onChange} 
                      autoCapitalize="none" 
                      keyboardType="email-address" 
                    />
                    {errors.customerEmail && <Text style={styles.errorText}>{errors.customerEmail.message}</Text>}
                  </View>
                )}
              />
            </View>
            
            <View style={styles.halfWidth}>
              <Controller
                control={control}
                name="customerPhone"
                render={({ field: { onChange, value } }) => (
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Phone</Text>
                    <TextInput 
                      style={styles.input} 
                      placeholder="+1 555..." 
                      value={value} 
                      onChangeText={onChange} 
                      keyboardType="phone-pad" 
                    />
                  </View>
                )}
              />
            </View>
          </View>
        </View>

        {/* Vehicles Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
              <Text style={styles.sectionIconText}>🚗</Text>
            </View>
            <Text style={styles.sectionTitle}>Vehicles</Text>
          </View>
          
          {fields.map((field, index) => (
            <View key={field.id} style={styles.vehicleContainer}>
              <View style={styles.vehicleHeader}>
                <Text style={styles.vehicleTitle}>Vehicle #{index + 1}</Text>
                {fields.length > 1 && (
                  <Pressable 
                    style={styles.removeVehicleButton}
                    onPress={() => remove(index)}
                  >
                    <Text style={styles.removeVehicleButtonText}>Remove</Text>
                  </Pressable>
                )}
              </View>
              
              <View style={styles.row}>
                <View style={styles.halfWidth}>
                  <Controller
                    control={control}
                    name={`vehicles.${index}.make`}
                    render={({ field: { onChange, value } }) => (
                      <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Make *</Text>
                        <TextInput 
                          style={[styles.input, errors.vehicles?.[index]?.make && styles.inputError]} 
                          placeholder="Toyota" 
                          value={value} 
                          onChangeText={onChange}
                        />
                        {errors.vehicles?.[index]?.make && <Text style={styles.errorText}>{errors.vehicles[index].make.message}</Text>}
                      </View>
                    )}
                  />
                </View>
                
                <View style={styles.halfWidth}>
                  <Controller
                    control={control}
                    name={`vehicles.${index}.model`}
                    render={({ field: { onChange, value } }) => (
                      <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Model *</Text>
                        <TextInput 
                          style={[styles.input, errors.vehicles?.[index]?.model && styles.inputError]} 
                          placeholder="Camry" 
                          value={value} 
                          onChangeText={onChange}
                        />
                        {errors.vehicles?.[index]?.model && <Text style={styles.errorText}>{errors.vehicles[index].model.message}</Text>}
                      </View>
                    )}
                  />
                </View>
              </View>
              
              <View style={styles.row}>
                <View style={styles.halfWidth}>
                  <Controller
                    control={control}
                    name={`vehicles.${index}.year`}
                    render={({ field: { onChange, value } }) => (
                      <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Year *</Text>
                        <TextInput 
                          style={[styles.input, errors.vehicles?.[index]?.year && styles.inputError]} 
                          placeholder="2023" 
                          value={String(value ?? '')} 
                          onChangeText={onChange} 
                          keyboardType="number-pad" 
                        />
                        {errors.vehicles?.[index]?.year && <Text style={styles.errorText}>{errors.vehicles[index].year.message}</Text>}
                      </View>
                    )}
                  />
                </View>
                
                <View style={styles.halfWidth}>
                  <Controller
                    control={control}
                    name={`vehicles.${index}.mileage`}
                    render={({ field: { onChange, value } }) => (
                      <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Mileage</Text>
                        <TextInput 
                          style={[styles.input, errors.vehicles?.[index]?.mileage && styles.inputError]} 
                          placeholder="45000" 
                          value={value ? String(value) : ''} 
                          onChangeText={onChange} 
                          keyboardType="number-pad" 
                        />
                        {errors.vehicles?.[index]?.mileage && <Text style={styles.errorText}>{errors.vehicles[index].mileage.message}</Text>}
                      </View>
                    )}
                  />
                </View>
              </View>
              
              <View style={styles.inputGroup}>
                <Controller
                  control={control}
                  name={`vehicles.${index}.vin`}
                  render={({ field: { onChange, value } }) => (
                    <View style={styles.inputContainer}>
                      <Text style={styles.inputLabel}>VIN *</Text>
                      <TextInput 
                        style={[styles.input, errors.vehicles?.[index]?.vin && styles.inputError]} 
                        placeholder="1HGCM82633A..." 
                        value={value} 
                        onChangeText={onChange} 
                        autoCapitalize="characters" 
                      />
                      {errors.vehicles?.[index]?.vin && <Text style={styles.errorText}>{errors.vehicles[index].vin.message}</Text>}
                    </View>
                  )}
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Controller
                  control={control}
                  name={`vehicles.${index}.cost`}
                  render={({ field: { onChange, value } }) => (
                    <View style={styles.inputContainer}>
                      <Text style={styles.inputLabel}>Vehicle Cost</Text>
                      <TextInput 
                        style={[styles.input, errors.vehicles?.[index]?.cost && styles.inputError]} 
                        placeholder="25000" 
                        value={value ? String(value) : ''} 
                        onChangeText={onChange} 
                        keyboardType="decimal-pad" 
                      />
                      {errors.vehicles?.[index]?.cost && <Text style={styles.errorText}>{errors.vehicles[index].cost.message}</Text>}
                    </View>
                  )}
                />
              </View>
            </View>
          ))}
          
          <Pressable 
            style={styles.addVehicleButton}
            onPress={() => append({
              id: uuid(),
              make: '',
              model: '',
              year: new Date().getFullYear(),
              mileage: undefined,
              vin: '',
              cost: undefined,
            })}
          >
            <Text style={styles.addVehicleButtonText}>+ Add Another Vehicle</Text>
          </Pressable>
        </View>

        {/* Charges Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
              <Text style={styles.sectionIconText}>💰</Text>
            </View>
            <Text style={styles.sectionTitle}>Charges</Text>
          </View>
          
          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Controller
                control={control}
                name="serviceCharge"
                render={({ field: { onChange, value } }) => (
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Service Charge *</Text>
                    <TextInput 
                      style={[styles.input, errors.serviceCharge && styles.inputError]} 
                      placeholder="250" 
                      value={value ? String(value) : ''} 
                      onChangeText={onChange} 
                      keyboardType="decimal-pad" 
                    />
                    {errors.serviceCharge && <Text style={styles.errorText}>{errors.serviceCharge.message}</Text>}
                  </View>
                )}
              />
            </View>
          </View>
          
          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Controller
                control={control}
                name="taxRate"
                render={({ field: { onChange, value } }) => (
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Tax Rate</Text>
                    <TextInput 
                      style={[styles.input, errors.taxRate && styles.inputError]} 
                      placeholder="0.07" 
                      value={value ? String(value) : ''} 
                      onChangeText={onChange} 
                      keyboardType="decimal-pad" 
                    />
                    {errors.taxRate && <Text style={styles.errorText}>{errors.taxRate.message}</Text>}
                  </View>
                )}
              />
            </View>
            
            <View style={styles.halfWidth}>
              <Controller
                control={control}
                name="currency"
                render={({ field: { onChange, value } }) => (
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Currency *</Text>
                    <TextInput 
                      style={[styles.input, errors.currency && styles.inputError]} 
                      placeholder="USD" 
                      autoCapitalize="characters" 
                      value={value} 
                      onChangeText={onChange} 
                    />
                    {errors.currency && <Text style={styles.errorText}>{errors.currency.message}</Text>}
                  </View>
                )}
              />
            </View>
          </View>
          
          <View style={styles.inputGroup}>
            <Controller
              control={control}
              name="notes"
              render={({ field: { onChange, value } }) => (
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Notes</Text>
                  <TextInput 
                    style={[styles.input, styles.textArea]} 
                    placeholder="Any additional information..." 
                    value={value} 
                    onChangeText={onChange} 
                    multiline 
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </View>
              )}
            />
          </View>
        </View>

        {/* Template Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
              <Text style={styles.sectionIconText}>📄</Text>
            </View>
            <Text style={styles.sectionTitle}>Receipt Template</Text>
          </View>
          
          <View style={styles.templateContainer}>
            {TEMPLATES.map(t => (
              <TemplateOption key={t.id} id={t.id} name={t.name} />
            ))}
          </View>
        </View>

        {/* Submit Button */}
        <Pressable 
          style={[styles.submitButton, busy && styles.submitButtonDisabled]} 
          onPress={handleSubmit(onSubmit)} 
          disabled={busy}
        >
          {busy ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Generate Receipt PDF</Text>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#64748b',
    lineHeight: 22,
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0f2fe',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sectionIconText: {
    fontSize: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 4,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#0f172a',
  },
  inputError: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 6,
    fontWeight: '500',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  halfWidth: {
    flex: 1,
  },
  logoSection: {
    marginTop: 16,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  logoButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  logoButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
  logoPreview: {
    width: 60,
    height: 60,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  templateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  templateOption: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  templateOptionActive: {
    borderColor: '#3b82f6',
    backgroundColor: '#dbeafe',
  },
  templateOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
  },
  templateOptionTextActive: {
    color: '#1d4ed8',
  },
  submitButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#3b82f6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  vehicleContainer: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  vehicleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  vehicleTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  removeVehicleButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  removeVehicleButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
  addVehicleButton: {
    backgroundColor: '#10b981',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  addVehicleButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
});
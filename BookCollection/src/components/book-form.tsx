import React from 'react';
import { StyleSheet, Button, View, TextInput, ScrollView, Image, Pressable } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ThemedText } from '@/src/components/themed-text';

export const bookSchema = z.object({
  title: z.string().min(1, 'Le titre est requis'),
  author: z.string().min(1, "L'auteur est requis"),
  format: z.enum(['physique', 'numerique']),
  summary: z.string().optional(),
});

export type BookFormData = z.infer<typeof bookSchema>;

interface BookFormProps {
  initialData?: Partial<BookFormData> & { cover_url?: string };
  onSubmit: (data: BookFormData) => void;
  onCancel: () => void;
  onPickDocument?: () => void;
  fileUri?: string | null;
}

export function BookForm({ initialData, onSubmit, onCancel, onPickDocument, fileUri }: BookFormProps) {
  const { control, handleSubmit, watch, formState: { errors } } = useForm<BookFormData>({
    resolver: zodResolver(bookSchema),
    defaultValues: {
      title: initialData?.title || '',
      author: initialData?.author || '',
      format: initialData?.format || 'physique',
      summary: initialData?.summary || '',
    }
  });

  const selectedFormat = watch('format');

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {initialData?.cover_url && (
        <Image source={{ uri: initialData.cover_url }} style={styles.coverImage} resizeMode="contain" />
      )}
      
      <ThemedText type="subtitle" style={styles.label}>Titre :</ThemedText>
      <Controller control={control} name="title" render={({ field: { onChange, value } }) => (
          <TextInput style={styles.input} value={value} onChangeText={onChange} placeholder="Titre du livre" placeholderTextColor="#888"/>
      )} />
      {errors.title && <ThemedText style={styles.error}>{errors.title.message}</ThemedText>}

      <ThemedText type="subtitle" style={styles.label}>Auteur :</ThemedText>
      <Controller control={control} name="author" render={({ field: { onChange, value } }) => (
          <TextInput style={styles.input} value={value} onChangeText={onChange} placeholder="Nom de l'auteur" placeholderTextColor="#888"/>
      )} />

      <ThemedText type="subtitle" style={styles.label}>Résumé :</ThemedText>
      <Controller control={control} name="summary" render={({ field: { onChange, value } }) => (
          <TextInput 
            style={[styles.input, styles.textArea]} 
            value={value} 
            onChangeText={onChange} 
            multiline 
            numberOfLines={5} 
            textAlignVertical="top"
            placeholder="Synopsis..."
            placeholderTextColor="#888"
          />
      )} />

      <ThemedText type="subtitle" style={styles.label}>Format :</ThemedText>
      <Controller control={control} name="format" render={({ field: { onChange, value } }) => (
        <View style={styles.formatButtons}>
          <Pressable 
            style={[styles.pressableBtn, value === 'physique' && styles.pressableActive]} 
            onPress={() => onChange('physique')}
          >
            <ThemedText style={{ color: value === 'physique' ? '#fff' : '#333', fontWeight: 'bold' }}>📖 Physique</ThemedText>
          </Pressable>
          <Pressable 
            style={[styles.pressableBtn, value === 'numerique' && styles.pressableActive]} 
            onPress={() => onChange('numerique')}
          >
            <ThemedText style={{ color: value === 'numerique' ? '#fff' : '#333', fontWeight: 'bold' }}>📱 Numérique</ThemedText>
          </Pressable>
        </View>
      )} />

      {selectedFormat === 'numerique' && onPickDocument && (
        <View style={styles.fileSection}>
           <Button title="Lier le fichier (PDF/EPUB)" onPress={onPickDocument} />
           {fileUri && <ThemedText style={styles.success}>✅ Fichier lié !</ThemedText>}
        </View>
      )}

      <View style={styles.submitSection}>
          <Button title="Enregistrer le livre" color="#10b981" onPress={handleSubmit(onSubmit)} />
          <View style={{ height: 12 }} />
          <Button title="Annuler" color="#d9534f" onPress={onCancel} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 50 },
  coverImage: { width: 150, height: 220, alignSelf: 'center', marginBottom: 15, borderRadius: 8 },
  label: { marginTop: 15, marginBottom: 5 },
  input: { backgroundColor: '#fff', color: '#000', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#ccc', fontSize: 16 },
  textArea: { height: 100 },
  error: { color: '#d9534f', fontSize: 14, marginTop: 5 },
  formatButtons: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 10, gap: 10 },
  pressableBtn: { flex: 1, padding: 15, borderRadius: 8, backgroundColor: '#e2e8f0', alignItems: 'center', borderWidth: 2, borderColor: 'transparent' },
  pressableActive: { backgroundColor: '#10b981', borderColor: '#059669' },
  fileSection: { backgroundColor: '#e2e8f0', padding: 15, borderRadius: 8, marginVertical: 10, alignItems: 'center' },
  success: { color: '#10b981', fontWeight: 'bold', marginTop: 10 },
  submitSection: { marginTop: 30 }
});
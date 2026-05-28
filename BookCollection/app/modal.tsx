// app/modal.tsx
import React, { useState } from 'react';
import { StyleSheet, TextInput, FlatList, Pressable, ActivityIndicator, View, Button } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { Alert } from 'react-native';
import { ThemedText } from '@/src/components/themed-text';
import { ThemedView } from '@/src/components/themed-view';
import { useManualSearch } from '@/src/hooks/useManualSearch';
import { BookForm, BookFormData } from '@/src/components/book-form';
import { bookService } from '@/src/services/bookService';
import { GoogleBookData } from '@/src/services/googleBookService';

export default function ModalScreen() {
  const router = useRouter();
  const db = useSQLiteContext();
  const { query, setQuery, results, loading, handleSearch } = useManualSearch();
  
  const [selectedBook, setSelectedBook] = useState<GoogleBookData | null>(null);
  const [isManualEmpty, setIsManualEmpty] = useState(false);

  const onSave = async (data: BookFormData) => {
    try {
      const isDuplicate = await bookService.checkDuplicate(db, data.title, data.format);
      
      if (isDuplicate) {
      Alert.alert("Doublon", `Tu possèdes déjà "${data.title}" en format ${data.format} !`);        return; // On annule l'ajout
      }

      await bookService.addBook(db, {
        ...data,
        isbn: selectedBook?.isbn || '',
        cover_url: selectedBook?.cover_url,
        summary: data.summary || '',
        status: 'a_lire',
        current_page: 0,
        total_pages: selectedBook?.total_pages || 0,
      });
      
      Alert.alert("Succès", "Livre ajouté !");
      router.back();
    } catch (e) {
      Alert.alert("Erreur", "Erreur de sauvegarde");
    }
  };

  if (selectedBook || isManualEmpty) {
    return (
      <ThemedView style={{ flex: 1 }}>
        <BookForm 
          initialData={selectedBook || {}} 
          onSubmit={onSave} 
          onCancel={() => { setSelectedBook(null); setIsManualEmpty(false); }} 
        />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Recherche manuelle</ThemedText>
      
      <View style={styles.searchSection}>
        <TextInput 
          style={styles.input} 
          placeholder="Titre ou auteur..." 
          placeholderTextColor="#888"
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
        />
        <Button title="Chercher" onPress={handleSearch} color="#10b981" />
      </View>

      {loading && <ActivityIndicator size="large" color="#10b981" style={{ margin: 20 }} />}

      <FlatList 
        data={results}
        keyExtractor={(item, index) => item.isbn + index}
        renderItem={({ item }) => (
          <Pressable style={styles.resultItem} onPress={() => setSelectedBook(item)}>
            <Image source={{ uri: item.cover_url }} style={styles.miniCover} />
            <View style={{ flex: 1 }}>
              <ThemedText style={{ fontWeight: 'bold' }}>{item.title}</ThemedText>
              <ThemedText style={{ opacity: 0.7 }}>{item.author}</ThemedText>
            </View>
          </Pressable>
        )}
        ListFooterComponent={
          <Button title="Ajouter manuellement le livre" onPress={() => setIsManualEmpty(true)} color="#10b981" />
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  searchSection: { flexDirection: 'row', gap: 10, marginVertical: 20 },
  input: { flex: 1, backgroundColor: '#fff', padding: 10, borderRadius: 8, color: '#000' },
  resultItem: { flexDirection: 'row', gap: 15, padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc', alignItems: 'center' },
  miniCover: { width: 40, height: 60, borderRadius: 4 }
});
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Image, ActivityIndicator, TextInput, Button, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import * as Sharing from 'expo-sharing';
import { WebView } from 'react-native-webview';
import * as DocumentPicker from 'expo-document-picker';

import { ThemedText } from '@/src/components/themed-text';
import { ThemedView } from '@/src/components/themed-view';
import { bookService, Book } from '@/src/services/bookService';
import { BookForm, BookFormData } from '@/src/components/book-form'; 

export default function BookDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const db = useSQLiteContext();

  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [pageInput, setPageInput] = useState('');

  useEffect(() => {
    fetchBook();
  }, [id, db]);

  const fetchBook = async () => {
    if (!id) return;
    try {
      const data = await bookService.getBookById(db, Number(id));
      if (data) {
        setBook(data);
        setPageInput(data.current_page.toString());
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // --- ACTIONS : SUPPRIMER ET MODIFIER ---
  const confirmDelete = () => {
    Alert.alert(
      "Supprimer le livre",
      "Es-tu sûr de vouloir retirer ce livre de ta bibliothèque ?",
      [
        { text: "Annuler", style: "cancel" },
        { text: "Supprimer", style: "destructive", onPress: handleDelete }
      ]
    );
  };

  const handleDelete = async () => {
    if (!book?.id) return;
    await bookService.deleteBook(db, book.id);
    router.back(); 
  };

  const handleUpdate = async (formData: BookFormData) => {
    if (!book?.id) return;
    try {
      await bookService.updateBook(db, book.id, formData);
      setIsEditing(false);
      fetchBook(); 
      alert("Livre mis à jour !");
    } catch (e) {
      alert("Erreur lors de la modification");
    }
  };

  // --- ACTION : PROGRESSION ---
  const handleSaveProgress = async () => {
    if (!book || !book.id) return;
    
    const newPage = parseInt(pageInput, 10);
    if (isNaN(newPage) || newPage < 0) {
      alert("Veuillez entrer un numéro de page valide.");
      return;
    }

    let calculatedStatus = 'en_cours';
    if (newPage >= book.total_pages && book.total_pages > 0) {
      calculatedStatus = 'termine';
    } else if (newPage === 0) {
      calculatedStatus = 'a_lire';
    }

    try {
      await bookService.updateProgress(db, book.id, newPage, calculatedStatus);
      alert("Progression mise à jour !");
      setBook({ ...book, current_page: newPage, status: calculatedStatus as any });
    } catch (error) {
      alert("Erreur lors de la sauvegarde.");
    }
  };

  const handleOpenEbook = async () => {
    if (!book || !book.id) return;

    if (book.file_uri) {
      const isPdf = book.file_uri.toLowerCase().includes('.pdf');

      if (isPdf) {
        setIsReading(true);
      } else {
        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          await Sharing.shareAsync(book.file_uri);
        } else {
          alert("Impossible d'ouvrir ce fichier sur cet appareil.");
        }
      }
    } 
    else {
      try {
        const result = await DocumentPicker.getDocumentAsync({
          type: ['application/pdf', 'application/epub+zip'],
          copyToCacheDirectory: true
        });

        if (!result.canceled) {
          const selectedUri = result.assets[0].uri;
          await bookService.updateFileUri(db, book.id, selectedUri);
          setBook({ ...book, file_uri: selectedUri });
          alert("Fichier lié avec succès ! Vous pouvez maintenant le lire.");
        }
      } catch (error) {
        alert("Erreur lors de l'ajout du fichier.");
      }
    }
  };

  if (loading) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#10b981" />
      </ThemedView>
    );
  }

  if (!book) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ThemedText>Livre introuvable.</ThemedText>
        <Button title="Retour" onPress={() => router.back()} />
      </ThemedView>
    );
  }

  if (isEditing) {
    return (
      <ThemedView style={{ flex: 1 }}>
        <BookForm 
          initialData={book} 
          onSubmit={handleUpdate} 
          onCancel={() => setIsEditing(false)} 
        />
      </ThemedView>
    );
  }

  if (isReading && book?.file_uri) {
    return (
      <ThemedView style={{ flex: 1, paddingTop: 50 }}>
        <View style={{ padding: 10, backgroundColor: '#222' }}>
          <Button title="Fermer le livre" color="#d9534f" onPress={() => setIsReading(false)} />
        </View>
        <WebView 
          source={{ uri: book.file_uri }} 
          style={{ flex: 1 }} 
          originWhitelist={['*']}
          allowFileAccess={true}
        />
      </ThemedView>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen 
        options={{ 
          title: book.title, // Le vrai titre du livre !
          headerBackTitle: "Retour", // Remplace le "(tabs)" sur iOS
          headerTintColor: "#10b981" // Optionnel : met la flèche de retour en vert
        }} 
      />
      <View style={styles.header}>
        {book.cover_url ? (
          <Image source={{ uri: book.cover_url }} style={styles.cover} resizeMode="contain" />
        ) : (
          <View style={styles.noCover}><ThemedText>Pas d'image</ThemedText></View>
        )}
        <View style={styles.headerInfo}>
          <ThemedText type="title" style={styles.title}>{book.title}</ThemedText>
          <ThemedText type="subtitle" style={styles.author}>{book.author}</ThemedText>
          
          <View style={styles.badge}>
            <ThemedText style={styles.badgeText}>
              {book.format === 'numerique' ? '📱 Ebook' : '📖 Livre Physique'}
            </ThemedText>
          </View>

          <View style={styles.actionRow}>
            <Button title="Modifier" onPress={() => setIsEditing(true)} />
            <Button title="Supprimer" color="#ff4444" onPress={confirmDelete} />
          </View>
        </View>
      </View>
      <ThemedView style={styles.progressSection}>
        <ThemedText type="defaultSemiBold">Progression de lecture</ThemedText>
        <View style={styles.progressRow}>
          <ThemedText>Page : </ThemedText>
          <TextInput 
            style={styles.pageInput}
            value={pageInput}
            onChangeText={setPageInput}
            keyboardType="numeric"
          />
          <ThemedText> sur {book.total_pages > 0 ? book.total_pages : '?'}</ThemedText>
        </View>
        <Button title="Enregistrer ma page" onPress={handleSaveProgress} color="#10b981" />
      </ThemedView>

      {book.format === 'numerique' && (
        <View style={styles.readerSection}>
          <Button 
            title={book.file_uri ? "📖 LIRE MON EBOOK" : "➕ LIER UN FICHIER (PDF/EPUB)"} 
            color={book.file_uri ? "#3b82f6" : "#f59e0b"} 
            onPress={handleOpenEbook} 
          />
        </View>
      )}

      {book.summary ? (
        <View style={styles.summarySection}>
          <ThemedText type="subtitle">Résumé</ThemedText>
          <ThemedText style={styles.summaryText}>{book.summary}</ThemedText>
        </View>
      ) : null}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, backgroundColor: '#151718' },
  content: { padding: 20, paddingBottom: 50 },
  header: { flexDirection: 'row', gap: 15, marginBottom: 25 },
  cover: { width: 120, height: 180, borderRadius: 8 },
  noCover: { width: 120, height: 180, borderRadius: 8, backgroundColor: '#333', justifyContent: 'center', alignItems: 'center' },
  headerInfo: { flex: 1, justifyContent: 'center' },
  title: { fontSize: 24, lineHeight: 28, marginBottom: 5 },
  author: { color: '#ccc', marginBottom: 10 },
  badge: { backgroundColor: '#333', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 15, marginBottom: 10 },
  badgeText: { color: '#10b981', fontWeight: 'bold', fontSize: 12 },
  actionRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  progressSection: { backgroundColor: '#222', padding: 15, borderRadius: 12, marginBottom: 25 },
  progressRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 15 },
  pageInput: { backgroundColor: '#fff', color: '#000', width: 60, textAlign: 'center', padding: 8, borderRadius: 5, fontSize: 16 },
  readerSection: { marginBottom: 25 },
  summarySection: { marginTop: 10 },
  summaryText: { marginTop: 10, lineHeight: 24, color: '#ddd' }
});
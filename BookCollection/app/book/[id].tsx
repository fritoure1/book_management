import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Image, ActivityIndicator, TextInput, Button } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import * as Sharing from 'expo-sharing'
import { WebView } from 'react-native-webview';
import * as DocumentPicker from 'expo-document-picker';
import { ThemedText } from '@/src/components/themed-text';
import { ThemedView } from '@/src/components/themed-view';
import { bookService, Book } from '@/src/services/bookService';

export default function BookDetailsScreen() {
  const [isReading, setIsReading] = useState(false)
  const { id } = useLocalSearchParams(); // MODULE 3 : Récupère l'ID passé dans l'URL
  const router = useRouter();
  const db = useSQLiteContext();

  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  
  // État local pour le champ texte de progression
  const [pageInput, setPageInput] = useState('');

  useEffect(() => {
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
    fetchBook();
  }, [id, db]);

  // Fonction pour sauvegarder la progression (dans app/book/[id].tsx)
  const handleSaveProgress = async () => {
    if (!book || !book.id) return;
    
    const newPage = parseInt(pageInput, 10);
    if (isNaN(newPage) || newPage < 0) {
      alert("Veuillez entrer un numéro de page valide.");
      return;
    }

    // C'EST ICI QU'ON CALCULE LE STATUT AVANT D'APPELER TON SERVICE
    let calculatedStatus = 'en_cours';
    if (newPage >= book.total_pages && book.total_pages > 0) {
      calculatedStatus = 'termine';
    } else if (newPage === 0) {
      calculatedStatus = 'a_lire';
    }

    try {
      // On utilise ta version de updateProgress !
      await bookService.updateProgress(db, book.id, newPage, calculatedStatus);
      alert("Progression mise à jour !");
      
      // On met à jour l'écran immédiatement
      setBook({ ...book, current_page: newPage, status: calculatedStatus as any });
    } catch (error) {
      alert("Erreur lors de la sauvegarde.");
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
  const handleOpenEbook = async () => {
    if (!book || !book.id) return;

    // CAS 1 : On a déjà un fichier lié
    if (book.file_uri) {
      // Le fichier existe, on passe en mode lecture interne !
      setIsReading(true);
    
    } 
    // CAS 2 : Pas de fichier, on propose d'en ajouter un
    else {
      try {
        const result = await DocumentPicker.getDocumentAsync({
          type: ['application/pdf', 'application/epub+zip'],
          copyToCacheDirectory: true
        });

        if (!result.canceled) {
          const selectedUri = result.assets[0].uri;
          
          // 1. Sauvegarde en base de données
          await bookService.updateFileUri(db, book.id, selectedUri);
          
          // 2. Mise à jour de l'affichage local
          setBook({ ...book, file_uri: selectedUri });
          
          alert("Fichier lié avec succès ! Vous pouvez maintenant le lire.");
        }
      } catch (error) {
        alert("Erreur lors de l'ajout du fichier.");
      }
    }
  };

  if (isReading && book?.file_uri) {
    return (
      <ThemedView style={{ flex: 1, paddingTop: 50 }}>
        {/* Bouton pour quitter la lecture */}
        <View style={{ padding: 10, backgroundColor: '#222' }}>
          <Button title="Fermer le livre" color="#d9534f" onPress={() => setIsReading(false)} />
        </View>
        
        {/* Le lecteur PDF */}
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
      {/* 1. En-tête : Couverture et Infos de base */}
      <View style={styles.header}>
        {book.cover_url ? (
          <Image source={{ uri: book.cover_url }} style={styles.cover} resizeMode="contain" />
        ) : (
          <View style={styles.noCover}><ThemedText>Pas de couverture</ThemedText></View>
        )}
        <View style={styles.headerInfo}>
          <ThemedText type="title" style={styles.title}>{book.title}</ThemedText>
          <ThemedText type="subtitle" style={styles.author}>{book.author}</ThemedText>
          
          <View style={styles.badge}>
            <ThemedText style={styles.badgeText}>
              {book.format === 'numerique' ? '📱 Ebook' : '📖 Livre Physique'}
            </ThemedText>
          </View>
        </View>
      </View>

      {/* 2. Suivi de Progression */}
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

      {/* 3. Le bouton Magique pour lire le PDF (si Ebook) */}
      {book.format === 'numerique' && (
        <View style={styles.readerSection}>
          <Button 
            title={book.file_uri ? "📖 LIRE MON EBOOK" : "➕ LIER UN FICHIER (PDF/EPUB)"} 
            color={book.file_uri ? "#3b82f6" : "#f59e0b"} // Bleu si prêt, Orange si vide
            onPress={handleOpenEbook} 
          />
        </View>
      )}

      {/* 4. Le Résumé */}
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
  badge: { backgroundColor: '#333', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 15 },
  badgeText: { color: '#10b981', fontWeight: 'bold', fontSize: 12 },
  progressSection: { backgroundColor: '#222', padding: 15, borderRadius: 12, marginBottom: 25 },
  progressRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 15 },
  pageInput: { backgroundColor: '#fff', color: '#000', width: 60, textAlign: 'center', padding: 8, borderRadius: 5, fontSize: 16 },
  readerSection: { marginBottom: 25 },
  summarySection: { marginTop: 10 },
  summaryText: { marginTop: 10, lineHeight: 24, color: '#ddd' }
});
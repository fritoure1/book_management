import React, { useState, useCallback, useMemo } from 'react';
import { StyleSheet, View, FlatList, ActivityIndicator, TextInput, Pressable } from 'react-native';
import { useFocusEffect, Link } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';

import { ThemedText } from '@/src/components/themed-text';
import { ThemedView } from '@/src/components/themed-view';
import { BookCard } from '@/src/components/book-card';
import { bookService, Book } from '@/src/services/bookService';

export default function HomeScreen() {
  const db = useSQLiteContext(); // MODULE 8 : Connexion SQLite
  
  // États locaux
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterFormat, setFilterFormat] = useState<'tous' | 'physique' | 'numerique'>('tous');

  // MODULE 3 & 8 : Recharger les données à chaque apparition de l'écran
  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const fetchBooks = async () => {
        setLoading(true);
        try {
          const data = await bookService.getAllBooks(db);
          if (isActive) setBooks(data);
        } catch (error) {
          console.error("Erreur de chargement:", error);
        } finally {
          if (isActive) setLoading(false);
        }
      };

      fetchBooks();

      return () => { isActive = false; }; // Cleanup
    }, [db])
  );

  // MODULE 7 : Filtrage optimisé en mémoire (useMemo)
  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      // 1. Filtre par format
      if (filterFormat !== 'tous' && book.format !== filterFormat) {
        return false;
      }
      // 2. Filtre par recherche textuelle (titre ou auteur)
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const titleMatch = book.title.toLowerCase().includes(query);
        const authorMatch = book.author.toLowerCase().includes(query);
        if (!titleMatch && !authorMatch) return false;
      }
      return true;
    });
  }, [books, filterFormat, searchQuery]);

  // Rendu de l'écran de chargement
  if (loading && books.length === 0) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#10b981" />
      </ThemedView>
    );
  }
  

  return (
    <ThemedView style={styles.container}>
      
      {/* En-tête */}
      <View style={styles.header}>
        <ThemedText type="title">Ma Biblio</ThemedText>
        <Link href="/modal" asChild>
          <Pressable style={styles.addButton}>
            <ThemedText style={styles.addButtonText}>+</ThemedText>
          </Pressable>
        </Link>
      </View>

      {/* Barre de recherche locale */}
      <TextInput 
        style={styles.searchInput}
        placeholder="Rechercher dans ma bibliothèque..."
        placeholderTextColor="#888"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {/* Boutons de Filtre */}
      <View style={styles.filterContainer}>
        {(['tous', 'physique', 'numerique'] as const).map((format) => (
          <Pressable
            key={format}
            style={[styles.filterBtn, filterFormat === format && styles.filterBtnActive]}
            onPress={() => setFilterFormat(format)}
          >
            <ThemedText style={{ color: filterFormat === format ? '#fff' : '#888', textTransform: 'capitalize' }}>
              {format}
            </ThemedText>
          </Pressable>
        ))}
      </View>

      {/* MODULE 2 : La Liste Optimisée */}
      <FlatList
        data={filteredBooks}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        renderItem={({ item }) => <BookCard book={item} />}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <ThemedText style={styles.emptyText}>
              {books.length === 0 ? "Votre bibliothèque est vide.\nScannez ou ajoutez un livre !" : "Aucun livre ne correspond à votre recherche."}
            </ThemedText>
          </View>
        }
      />

    </ThemedView>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 50 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 15 },
  addButton: { backgroundColor: '#10b981', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  addButtonText: { color: 'white', fontSize: 24, fontWeight: 'bold', lineHeight: 28 },
  searchInput: { marginHorizontal: 20, backgroundColor: '#333', color: '#fff', padding: 12, borderRadius: 10, fontSize: 16, marginBottom: 15 },
  filterContainer: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 15, gap: 10 },
  filterBtn: { paddingVertical: 8, paddingHorizontal: 15, borderRadius: 20, backgroundColor: '#333' },
  filterBtnActive: { backgroundColor: '#10b981' },
  listContent: { paddingHorizontal: 20, paddingBottom: 20 },
  emptyContainer: { padding: 40, alignItems: 'center' },
  emptyText: { textAlign: 'center', color: '#888', fontSize: 16, lineHeight: 24 }
});
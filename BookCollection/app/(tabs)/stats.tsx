import React from 'react';
import { StyleSheet, View, ScrollView, ActivityIndicator } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';

import { ThemedText } from '@/src/components/themed-text';
import { ThemedView } from '@/src/components/themed-view';
import { useStatsController } from '@/src/hooks/useStatsController'; // Ton fameux contrôleur MVC !

export default function StatsScreen() {
  const db = useSQLiteContext();
  
  // La Vue demande les infos au Contrôleur
  const { loading, stats, fetchBooks } = useStatsController(db);

  // Déclencheur à l'ouverture de la page
  useFocusEffect(
    React.useCallback(() => {
      fetchBooks();
    }, [fetchBooks])
  );

  if (loading) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#10b981" />
      </ThemedView>
    );
  }

  // --- RENDU VISUEL ---
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <ThemedText type="title" style={styles.pageTitle}>Mes Statistiques</ThemedText>

      {/* Carte Principale : Pages lues */}
      <View style={[styles.card, styles.mainCard]}>
        <ThemedText style={styles.cardTitle}>Total des pages lues</ThemedText>
        <ThemedText style={styles.bigNumber}>{stats.totalPagesRead}</ThemedText>
        <ThemedText style={styles.cardSubtitle}>Continue comme ça ! 🚀</ThemedText>
      </View>

      {/* Grille de statistiques secondaires */}
      <View style={styles.grid}>
        
        {/* Total des livres */}
        <View style={[styles.card, styles.halfCard]}>
          <ThemedText style={styles.cardTitle}>Livres possédés</ThemedText>
          <ThemedText style={styles.mediumNumber}>{stats.totalBooks}</ThemedText>
          <ThemedText style={styles.cardEmoji}>📚</ThemedText>
        </View>

        {/* Livres terminés */}
        <View style={[styles.card, styles.halfCard]}>
          <ThemedText style={styles.cardTitle}>Livres terminés</ThemedText>
          <ThemedText style={styles.mediumNumber}>{stats.finished}</ThemedText>
          <ThemedText style={styles.cardEmoji}>✅</ThemedText>
        </View>

        {/* En cours */}
        <View style={[styles.card, styles.halfCard]}>
          <ThemedText style={styles.cardTitle}>En cours</ThemedText>
          <ThemedText style={styles.mediumNumber}>{stats.inProgress}</ThemedText>
          <ThemedText style={styles.cardEmoji}>⏳</ThemedText>
        </View>

        {/* À lire */}
        <View style={[styles.card, styles.halfCard]}>
          <ThemedText style={styles.cardTitle}>Pile à lire</ThemedText>
          <ThemedText style={styles.mediumNumber}>{stats.toRead}</ThemedText>
          <ThemedText style={styles.cardEmoji}>📖</ThemedText>
        </View>
      </View>

      {/* Répartition des formats */}
      <View style={styles.card}>
        <ThemedText style={styles.cardTitle}>Formats</ThemedText>
        <View style={styles.formatRow}>
          <View style={styles.formatItem}>
            <ThemedText style={styles.formatNumber}>{stats.physical}</ThemedText>
            <ThemedText style={styles.formatLabel}>Physiques</ThemedText>
          </View>
          <View style={styles.formatDivider} />
          <View style={styles.formatItem}>
            <ThemedText style={styles.formatNumber}>{stats.digital}</ThemedText>
            <ThemedText style={styles.formatLabel}>Numériques</ThemedText>
          </View>
        </View>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, backgroundColor: '#151718' },
  content: { padding: 20, paddingTop: 60, paddingBottom: 40 },
  pageTitle: { marginBottom: 20 },
  
  card: {
    backgroundColor: '#222',
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  mainCard: {
    alignItems: 'center',
    backgroundColor: '#10b981', // Vert émeraude pour la stat principale
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  halfCard: {
    width: '48%', // Prend presque la moitié de l'écran
    alignItems: 'center',
  },
  
  cardTitle: { fontSize: 14, color: '#ccc', fontWeight: '600', marginBottom: 5, textAlign: 'center' },
  cardSubtitle: { fontSize: 14, color: '#e0f2fe', marginTop: 5 },
  
  // FIX : Ajout de lineHeight et paddingVertical pour ne pas couper le texte
  bigNumber: { fontSize: 48, fontWeight: 'bold', color: '#fff', lineHeight: 55, paddingVertical: 5 },
  mediumNumber: { fontSize: 32, fontWeight: 'bold', color: '#fff', lineHeight: 40 },
  cardEmoji: { fontSize: 24, marginTop: 5 },

  formatRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', marginTop: 10 },
  formatItem: { alignItems: 'center' },
  formatNumber: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  formatLabel: { fontSize: 14, color: '#aaa' },
  formatDivider: { width: 1, height: 40, backgroundColor: '#444' }
});
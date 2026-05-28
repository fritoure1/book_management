import React from 'react';
import { StyleSheet, View, Image, Pressable } from 'react-native';
import { Link } from 'expo-router'; 
import { ThemedText } from '@/src/components/themed-text';
import { Book } from '@/src/services/bookService';

interface BookCardProps {
  book: Book;
}

export const BookCard = React.memo(({ book }: BookCardProps) => {
  return (
    <Link href={`/book/${book.id}`} asChild>
      <Pressable style={styles.card}>
        
        {book.cover_url ? (
          <Image source={{ uri: book.cover_url }} style={styles.cover} />
        ) : (
          <View style={styles.placeholder}>
            <ThemedText style={styles.placeholderText}>Pas d'image</ThemedText>
          </View>
        )}

        <View style={styles.infoContainer}>
          <ThemedText type="defaultSemiBold" numberOfLines={2} style={styles.title}>
            {book.title}
          </ThemedText>
          
          <ThemedText style={styles.author} numberOfLines={1}>
            {book.author}
          </ThemedText>

          <View style={styles.badgesContainer}>
            <View style={[styles.badge, book.format === 'numerique' ? styles.badgeNum : styles.badgePhys]}>
              <ThemedText style={styles.badgeText}>
                {book.format === 'numerique' ? '📱 Ebook' : '📖 Livre'}
              </ThemedText>
            </View>
            
            <View style={[styles.badge, styles.badgeStatus]}>
              <ThemedText style={styles.badgeText}>
                {book.status === 'a_lire' ? '⏳ À lire' : book.status === 'en_cours' ? '📖 En cours' : '✅ Terminé'}
              </ThemedText>
            </View>
          </View>
        </View>
        
      </Pressable>
    </Link>
  );
});

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    padding: 12,
    marginVertical: 8,
    backgroundColor: '#333',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3, 
  },
  cover: { width: 65, height: 100, borderRadius: 6 },
  placeholder: { width: 65, height: 100, borderRadius: 6, backgroundColor: '#555', justifyContent: 'center', alignItems: 'center' },
  placeholderText: { fontSize: 10, color: '#bbb', textAlign: 'center' },
  infoContainer: { flex: 1, marginLeft: 15, justifyContent: 'space-between' },
  title: { fontSize: 16, color: '#fff' },
  author: { fontSize: 14, color: '#ccc', marginTop: 2 },
  badgesContainer: { flexDirection: 'row', gap: 8, marginTop: 10 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  badgeNum: { backgroundColor: '#3b82f6' }, 
  badgePhys: { backgroundColor: '#10b981' }, 
  badgeStatus: { backgroundColor: '#6366f1' }, 
  badgeText: { color: '#fff', fontSize: 11, fontWeight: 'bold' }
});
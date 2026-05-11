import { useState, useCallback, useMemo } from 'react';
import { SQLiteDatabase } from 'expo-sqlite';
import { bookService, Book } from '../services/bookService';

export function useStatsController(db: SQLiteDatabase) {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Logique de récupération
  const fetchBooks = useCallback(async () => {
    setLoading(true);
    try {
      const data = await bookService.getAllBooks(db);
      setBooks(data);
    } catch (error) {
      console.error("Erreur stats:", error);
    } finally {
      setLoading(false);
    }
  }, [db]);

  // 2. Logique de calcul (Le "Cœur Métier")
  const stats = useMemo(() => {
    let totalPagesRead = 0, finished = 0, inProgress = 0, toRead = 0, physical = 0, digital = 0;

    books.forEach(book => {
      totalPagesRead += book.current_page;
      
      if (book.status === 'termine') finished++;
      else if (book.status === 'en_cours') inProgress++;
      else toRead++;

      if (book.format === 'physique') physical++;
      else digital++;
    });

    return {
      totalBooks: books.length,
      totalPagesRead,
      finished,
      inProgress,
      toRead,
      physical,
      digital
    };
  }, [books]);

  return { loading, stats, fetchBooks };
}
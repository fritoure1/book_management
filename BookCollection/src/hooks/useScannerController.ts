import { useState } from 'react';
import * as DocumentPicker from 'expo-document-picker';
import { useSQLiteContext } from 'expo-sqlite';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Alert } from 'react-native';
import { GoogleBookData,GoogleBooksService } from '../services/googleBookService';
import { bookService } from '@/src/services/bookService';


export const bookSchema = z.object({
  title: z.string().min(1, 'Le titre est requis'),
  author: z.string().min(1, "L'auteur est requis"),
  format: z.enum(['physique', 'numerique']),
  summary: z.string().optional(),
});

export type BookFormData = z.infer<typeof bookSchema>;

export function useScannerController() {
  const db = useSQLiteContext();
  
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scannedBook, setScannedBook] = useState<GoogleBookData | null>(null);
  const [fileUri, setFileUri] = useState<string | null>(null);

  const form = useForm<BookFormData>({
    resolver: zodResolver(bookSchema),
    defaultValues: { format: 'physique', summary: '' }
  });

  const handleScan = async (isbn: string) => {
    if (!isbn.startsWith('978') && !isbn.startsWith('979')) {
        return; 
    }

    if (scanned) return;
    setScanned(true);
    setLoading(true);

    try {
      const bookData = await GoogleBooksService.getBookByISBN(isbn);
      if (bookData) {
        setScannedBook(bookData);
        form.setValue('title', bookData.title);
        form.setValue('author', bookData.author);
        form.setValue('summary', bookData.summary || '');
      } else {
        setScanned(false);
      }
    } catch (error) {
      console.error(error);
      setScanned(false);
    } finally {
      setLoading(false);
    }
  };

  const handlePickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'application/epub+zip'],
      copyToCacheDirectory: true
    });
    if (!result.canceled) {
      setFileUri(result.assets[0].uri);
    }
  };

  const handleSave = async (data: BookFormData) => {
    if (!scannedBook) return;

    try {
      const isDuplicate = await bookService.checkDuplicate(db, data.title, data.format);
      
      if (isDuplicate) {
      Alert.alert("Doublon", `Tu possèdes déjà "${data.title}" en format ${data.format} !`);        return; // On arrête la fonction ici, on n'enregistre pas.
      }

      await bookService.addBook(db, {
        title: data.title,
        author: data.author,
        isbn: scannedBook.isbn,
        cover_url: scannedBook.cover_url,
        summary: data.summary,
        format: data.format,
        status: 'a_lire',
        file_uri: fileUri || undefined,
        current_page: 0,
        total_pages: scannedBook.total_pages,
      });

      Alert.alert("Succès", "Livre ajouté ! 🎉");
      handleReset();
    } catch (error) {
      Alert.alert("Erreur", "Un problème est survenu lors de l'enregistrement.");
    }
  };

  const handleReset = () => {
    setScannedBook(null);
    setFileUri(null);
    setScanned(false);
    form.reset();
  };

  return {
    state: { scanned, loading, scannedBook, fileUri },
    form,
    actions: { handleScan, handlePickDocument, handleSave, handleReset }
  };
}
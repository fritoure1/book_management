import { useState } from 'react';
import { Alert } from 'react-native'; // <-- NOUVEAU : Import de l'Alerte native
import { GoogleBooksService, GoogleBookData } from '../services/googleBookService';

export function useManualSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GoogleBookData[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    // 1. On prévient si le mot est trop court
    if (query.trim().length < 3) {
      Alert.alert("Attention", "Veuillez taper au moins 3 caractères pour chercher.");
      return;
    }

    setLoading(true);
    setResults([]); // On vide les anciens résultats pour faire propre

    try {
      const data = await GoogleBooksService.searchBooks(query);
      
      // 2. On prévient si Google n'a rien trouvé
      if (data.length === 0) {
        Alert.alert("Aucun résultat", "Aucun livre trouvé pour cette recherche sur Google Books.");
      }
      
      setResults(data);
    } catch (error) {
      // 3. On prévient s'il y a un vrai bug (ex: erreur 400 ou pas d'internet)
      Alert.alert("Erreur", "Un problème est survenu lors de la recherche. Vérifiez votre connexion.");
    } finally {
      setLoading(false);
    }
  };

  return { query, setQuery, results, loading, handleSearch, setResults };
}
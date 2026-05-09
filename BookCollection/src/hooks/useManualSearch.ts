// src/hooks/useManualSearch.ts
import { useState } from 'react';
import { GoogleBooksService, GoogleBookData } from '../services/googleBookService';

export function useManualSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GoogleBookData[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (query.trim().length < 3) return;
    setLoading(true);
    const data = await GoogleBooksService.searchBooks(query);
    setResults(data);
    setLoading(false);
  };

  return { query, setQuery, results, loading, handleSearch, setResults };
}
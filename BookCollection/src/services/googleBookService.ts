// src/services/GoogleBooksService.ts

export interface GoogleBookData {
  title: string;
  author: string;
  isbn: string;
  cover_url?: string;
  summary?: string;
  total_pages: number;
}

export const GoogleBooksService = {
  // Recherche par ISBN (pour le scanner)
  getBookByISBN: async (isbn: string): Promise<GoogleBookData | null> => {
    const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`);
    const data = await response.json();
    if (!data.items || data.items.length === 0) return null;
    return mapGoogleToInternal(data.items[0], isbn);
  },

  // NOUVEAU : Recherche par texte (pour l'ajout manuel)
  searchBooks: async (query: string): Promise<GoogleBookData[]> => {
    try {
      const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=10`);
      const data = await response.json();
      if (!data.items) return [];

      return data.items.map((item: any) => {
        const identifiers = item.volumeInfo.industryIdentifiers;
        const isbn = identifiers?.find((id: any) => id.type === 'ISBN_13')?.identifier 
                   || identifiers?.[0]?.identifier 
                   || '0000000000000';
        return mapGoogleToInternal(item, isbn);
      });
    } catch (error) {
      return [];
    }
  }
};

// Fonction utilitaire pour transformer le format Google vers notre format local
function mapGoogleToInternal(item: any, isbn: string): GoogleBookData {
  const info = item.volumeInfo;
  return {
    title: info.title || 'Titre inconnu',
    author: info.authors ? info.authors.join(', ') : 'Auteur inconnu',
    isbn: isbn,
    cover_url: info.imageLinks?.thumbnail?.replace('http:', 'https:'),
    summary: info.description || '',
    total_pages: info.pageCount || 0,
  };
}
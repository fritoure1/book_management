export interface GoogleBookData {
  title: string;
  author: string;
  isbn: string;
  cover_url?: string;
  summary?: string;
  total_pages: number;
}

const API_KEY = process.env.EXPO_PUBLIC_GOOGLE_BOOK_API_KEY;

export const GoogleBooksService = {
  getBookByISBN: async (isbn: string): Promise<GoogleBookData | null> => {
    const url = `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}&key=${API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();
    if (!data.items || data.items.length === 0) return null;
    return mapGoogleToInternal(data.items[0], isbn);
  },

  searchBooks: async (query: string): Promise<GoogleBookData[]> => {
    console.log("Ma clé API est :", process.env.EXPO_PUBLIC_GOOGLE_BOOKS_API_KEY);
    try {
      const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=10&key=${API_KEY}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

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
      console.error("Erreur API Google Books :", error);
      throw error; 
    }
  }
};

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
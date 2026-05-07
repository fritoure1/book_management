import * as SQLite from 'expo-sqlite';

export interface Book {
    id?: number;
    title: string;
    author: string;
    isbn?: string;
    cover_url?: string;
    summary?: string;
    format: 'physique' | 'numerique';
    status: 'a_lire' | 'en_cours' | 'termine';
    file_uri?: string;
    current_page: number;
    total_pages: number;
}

export const bookService = {
    getAllBooks : async (db:SQLite.SQLiteDatabase): Promise<Book[]> =>{
        return await db.getAllAsync<Book>('SELECT * from books ORDER BY added_at DESC')
    },
    addBook: async (db: SQLite.SQLiteDatabase, book: Omit<Book, 'id'>) => {
    const query = `
      INSERT INTO books (title, author, isbn, cover_url, summary, format, status, file_uri, current_page, total_pages, added_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `;
    return await db.runAsync(query, [
      book.title, book.author, book.isbn || null, book.cover_url || null, 
      book.summary || null, book.format, book.status, book.file_uri || null, 
      book.current_page, book.total_pages
    ])
    }
};
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
    },
    checkDuplicate: async (db: SQLite.SQLiteDatabase, title: string, format: string): Promise<boolean> => {
      const existingBook = await db.getFirstAsync<{ id: number }>(
        'SELECT id FROM books WHERE LOWER(title) = LOWER(?) AND format = ?',
        [title, format]
      );
      return existingBook !== null;
    },
    getBookById: async (db: SQLite.SQLiteDatabase, id: number): Promise<Book | null> => {
      return await db.getFirstAsync<Book>('SELECT * FROM books WHERE id = ?', [id]);
    },

  updateProgress: async (db: SQLite.SQLiteDatabase, id: number, currentPage: number, status: string) => {
    return await db.runAsync(
      'UPDATE books SET current_page = ?, status = ? WHERE id = ?',
      [currentPage, status, id]
    );
  },
  updateFileUri: async (db: SQLite.SQLiteDatabase, id: number, fileUri: string) => {
    return await db.runAsync(
      'UPDATE books SET file_uri = ? WHERE id = ?',
      [fileUri, id]
    );
  },
  deleteBook: async (db: SQLite.SQLiteDatabase, id: number) => {
    return await db.runAsync('DELETE FROM books WHERE id = ?', [id]);
  },

  updateBook: async (db: SQLite.SQLiteDatabase, id: number, book: Partial<Book>) => {
  const query = `
    UPDATE books 
    SET title = ?, author = ?, summary = ?, format = ?
    WHERE id = ?
  `;

  return await db.runAsync(query, [
    book.title ?? null, 
    book.author ?? null, 
    book.summary ?? null, 
    book.format ?? null, 
    id
  ]);
}
};
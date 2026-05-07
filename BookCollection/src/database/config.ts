import * as SQLite from 'expo-sqlite';

export async function migrateDbIfNeeded(db: SQLite.SQLiteDatabase) {
  const DATABASE_VERSION = 1;
  let { user_version: currentVersion } = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version') ?? { user_version: 0 };

  if (currentVersion >= DATABASE_VERSION) return;

  if (currentVersion === 0) {
    await db.execAsync(`PRAGMA journal_mode = 'wal';`);
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS books (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        author TEXT,
        isbn TEXT,
        cover_url TEXT,
        summary TEXT,
        format TEXT,
        status TEXT DEFAULT 'a_lire',
        file_uri TEXT,
        current_page INTEGER DEFAULT 0,
        total_pages INTEGER DEFAULT 0,
        added_at TEXT
      );
    `);
    await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
  }
}
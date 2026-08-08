/**
 * Vercel Postgres database client
 * Serverless, no setup, automatic scaling
 */

import { sql } from '@vercel/postgres';

export async function initDatabase() {
  // Create tables if they don't exist
  await sql`
    CREATE TABLE IF NOT EXISTS games (
      id VARCHAR(36) PRIMARY KEY,
      opponent VARCHAR(20) NOT NULL,
      level VARCHAR(20),
      human_color VARCHAR(10) NOT NULL,
      moves_csv TEXT,
      status VARCHAR(20) DEFAULT 'InProgress',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `.catch(() => {}); // Ignore error if table exists

  await sql`
    CREATE INDEX IF NOT EXISTS idx_games_created ON games(created_at DESC);
  `.catch(() => {});

  return {
    prepare: (sqlStr) => ({
      run: async (...args) => executeInsertOrUpdate(sqlStr, args),
      get: async (...args) => executeSelectOne(sqlStr, args),
      all: async (...args) => executeSelectAll(sqlStr, args)
    })
  };
}

async function executeInsertOrUpdate(sqlStr, args) {
  if (sqlStr.includes('INSERT INTO games')) {
    const [id, opponent, level, humanColor, movesCsv] = args;
    await sql`
      INSERT INTO games (id, opponent, level, human_color, moves_csv)
      VALUES (${id}, ${opponent}, ${level}, ${humanColor}, ${movesCsv || ''})
      ON CONFLICT (id) DO NOTHING;
    `;
    return { lastID: id };
  }
  if (sqlStr.includes('UPDATE games')) {
    const [movesCsv, status, id] = args;
    await sql`
      UPDATE games SET moves_csv = ${movesCsv}, status = ${status}, updated_at = NOW()
      WHERE id = ${id};
    `;
    return { changes: 1 };
  }
}

async function executeSelectOne(sqlStr, args) {
  const [id] = args;
  if (sqlStr.includes('SELECT * FROM games WHERE id')) {
    const { rows } = await sql`SELECT * FROM games WHERE id = ${id};`;
    return rows[0] || null;
  }
  if (sqlStr.includes('COUNT(*)')) {
    const { rows } = await sql`SELECT COUNT(*) as count FROM games;`;
    return rows[0];
  }
}

async function executeSelectAll(sqlStr, limit, offset) {
  if (sqlStr.includes('SELECT * FROM games ORDER BY')) {
    const { rows } = await sql`
      SELECT * FROM games ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset};
    `;
    return rows;
  }
}

export default initDatabase;

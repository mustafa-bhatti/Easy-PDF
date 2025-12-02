import { pool } from '../config/db.js';

const createVectorTable = async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS document_vectors (
        id SERIAL PRIMARY KEY,
        content TEXT,
        metadata JSONB,
        embedding vector(768),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Vector table is ready.');

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_document_vectors_embedding
      ON document_vectors
      USING hnsw (embedding vector_cosine_ops);
    `);
    console.log('Vector HNSW index is ready.');
    client.release();
  } catch (error) {
    console.error('Error creating vector table:', error);
  } finally {
    await pool.end();
    process.exit();
  }
};
createVectorTable();

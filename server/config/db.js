import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  host: process.env.db_host,
  user: process.env.db_user,
  password: process.env.db_password,
  database: process.env.db_name,
  port: process.env.db_port,
});

const connectDB = async () => {
  try {
    const client = await pool.connect();
    await client.query('CREATE EXTENSION IF NOT EXISTS vector;');
    const res = await client.query(
      "SELECT * FROM pg_extension WHERE extname = 'vector';"
    );
    if (res.rows.length > 0) {
      console.log('✅ Database Connected & Vector Extension Active!');
    } else {
      console.error('❌ Connected, but Vector Extension failed to load.');
    }
    client.release();
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};
export { pool, connectDB };

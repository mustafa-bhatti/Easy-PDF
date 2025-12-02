import { tryCatch, Worker } from 'bullmq';
import { REDIS_CONFIG } from './config/redis.js';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { OllamaEmbeddings } from '@langchain/ollama';
import { PGVectorStore } from 'langchain/community/vectorstores/pgvector';
import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();
const embeddings = new OllamaEmbeddings({
  model: 'nomic-embed-text',
  baseUrl: 'http://localhost:11434',
});
const pgConfig = {
  postgresConnectionOptions: {
    type: 'postgress',
    host: process.env.PG_HOST,
    port: process.env.PG_PORT,
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    database: process.env.PG_DATABASE,
  },
    tableName: 'document_vectors',
    columns:{
        idColumnName: 'id',
        vectorColumnName: 'embedding',
        contentColumnName: 'content',
        metadataColumnName: 'metadata',
    }
};

const pdfWorker = async (job) => {
  const {filePath,filename} = job.data;
  console.log(`[Job ${job.id}] || Processing PDF: ${filename}`);
  try {
    const loader = new PDFLoader(filePath);
    const rawDocs = await loader.load();
    
    const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000, chunkOverlap: 200 });
    const docs = await splitter.splitDocuments(rawDocs);
    console.log(`[Job ${job.id}] || Split into ${docs.length} chunks.`);
    
  } catch (error) {
    console.error(`[Job ${job.id}] || Error processing PDF: ${error.message}`);
  }
};

const worker = new Worker('pdfQueue', pdfWorker, {
  connection: REDIS_CONFIG,
  concurrency: 2,
});

worker.on('completed', (job) => {
  console.log(`Job ${job.id} has completed`);
});

worker.on('failed', (job, err) => {
  console.error(`Job ${job.id} has failed with error: ${err.message}`);
});
worker.on('error', (err) => {
  console.error('Worker error:', err);
});

const gracefulShutdown = async () => {
  await worker.close();
  console.log('PDF Worker connection closed.');
  process.exit(0);
};
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

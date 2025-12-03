import { Worker } from 'bullmq';
import { REDIS_CONFIG } from './config/redis.js';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { OllamaEmbeddings } from '@langchain/ollama';
import { PGVectorStore } from '@langchain/community/vectorstores/pgvector';
import dotenv from 'dotenv';
dotenv.config();
const embeddings = new OllamaEmbeddings({
  model: 'nomic-embed-text',
  baseUrl: 'http://localhost:11434',
});
const pgConfig = {
  postgresConnectionOptions: {
    type: 'postgres',
    host: process.env.db_host,
    port: process.env.db_port,
    user: process.env.db_user,
    password: process.env.db_password,
    database: process.env.db_name,
  },
  tableName: 'document_vectors',
  columns: {
    idColumnName: 'id',
    vectorColumnName: 'embedding',
    contentColumnName: 'content',
    metadataColumnName: 'metadata',
  },
};

const pdfWorker = async (job) => {
  const { fileName, filePath } = job.data;
  console.log(
    `[Job ${job.id}] || Processing PDF: ${fileName}`
  );
  try {
    const loader = new PDFLoader(filePath);
    const rawDocs = await loader.load();

    // splitting text here
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    const docs = await splitter.splitDocuments(rawDocs);
    console.log(`[Job ${job.id}] || Split into ${docs.length} chunks.`);

    // Postgress vector store setup using langchain PGVectorStore
    await PGVectorStore.fromDocuments(docs, embeddings, pgConfig);
    console.log(
      `[Job ${job.id}] || Stored ${docs.length} vectors in the database.`
    );
    return { status: 'completed', chunks: docs.length };
  } catch (error) {
    console.error(`[Job ${job.id}] || Error processing PDF: ${error.message}`);
    return { status: 'failed', error: error.message };
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

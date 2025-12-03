import { Ollama } from '@langchain/ollama';
import { OllamaEmbeddings } from '@langchain/ollama';
import { PGVectorStore } from '@langchain/community/vectorstores/pgvector';
import dotenv from 'dotenv';
dotenv.config();

const embeddings = new OllamaEmbeddings({
  model: 'nomic-embed-text',
  baseUrl: 'http://localhost:11434',
});

const llm = new Ollama({
  model: 'llama3.2:3b',
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

export const getChatResponse = async (req, res) => {
  const { question } = req.body;
  if (!question) {
    return res.status(400).json({ error: 'Question is required' });
  }
  try {
    console.log('Thinking...');
    const vectorStore = await PGVectorStore.initialize({
      embeddings,
      pgConfig,
    });
    if (!vectorStore) {
      throw new Error('Failed to initialize vector store');
    }
    const retrievedDocs = await vectorStore.similaritySearch(question, 4);
    console.log('Retrieved Docs: ', retrievedDocs);
    const context = retrievedDocs
      .map((doc) => doc.pageContent)
      .join('\n\n---\n\n');
    const prompt = `You are an AI assistant. Use the following context to answer the question. If the answer is not in the context, say "I don't know based on the provided documents."
    \nContext:\n${context}

    \nQuestion: ${question}

    \n\nAnswer:
    `;
    const response = await llm.invoke(prompt);
    console.log('Response: ', response);
    await vectorStore.end();

    res.status(200).json({
      answer: response,
      sources: retrievedDocs.map((doc) => doc.metadata),
    });
  } catch (error) {
    console.error('Error getting chat response:', error);
    res.status(500).json({ error: 'Failed to get chat response' });
  }
};

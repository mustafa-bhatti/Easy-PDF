# Easy-PDF

**Easy-PDF** is a local-first, privacy-focused RAG (Retrieval-Augmented Generation) platform. It ingests PDF documents, converts them into vector embeddings, and allows users to chat with their data using a local LLM.

> **Philosophy**: "Local-First." No data leaves your machine. No reliance on external APIs like OpenAI or Pinecone.

## 🚀 Features

- **Privacy-Focused**: All processing happens locally.
- **Event-Driven Architecture**: Decoupled API and Worker services for robust processing.
- **Vector Search**: Uses PostgreSQL with `pgvector` for efficient similarity search.
- **Background Processing**: Handles heavy PDF parsing and embedding tasks asynchronously using Redis queues.
- **Local AI**: Powered by Ollama (Llama3 & nomic-embed-text).

## 🛠️ Tech Stack

- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js (MVC Pattern)
- **Database**: PostgreSQL 16 (Docker) with `pgvector` extension
- **Queue/Async**: Redis (Docker) + `bullmq`
- **AI/LLM**: Ollama (Local)
  - **Chat Model**: `llama3`
  - **Embedding Model**: `nomic-embed-text`
- **Orchestration**: LangChain.js
- **Infrastructure**: Docker Compose

## 🏗️ Architecture

The system follows an **Event-Driven Microservices** pattern:

1.  **Express API (Producer)**:

    - Accepts file uploads.
    - Pushes processing jobs to the `pdf-processing-queue` in Redis.
    - Does **not** process PDFs directly to ensure responsiveness.

2.  **Worker (Consumer)**:
    - Listens for jobs from Redis.
    - Parses PDFs.
    - Chunks text (Recursive Character Splitter).
    - Generates embeddings using Ollama.
    - Stores vectors in PostgreSQL.

## 📋 Prerequisites

- **Node.js** (v18+)
- **Docker** & **Docker Compose**
- **Ollama** installed and running locally
  - Pull required models:
    ```bash
    ollama pull llama3
    ollama pull nomic-embed-text
    ```

## 🏃‍♂️ Getting Started

1.  **Start Infrastructure**:
    Spin up PostgreSQL and Redis containers.

    ```bash
    cd server
    docker-compose up -d
    ```

2.  **Install Dependencies**:

    ```bash
    # Server
    cd server
    npm install

    # Client
    cd ../client
    npm install
    ```

3.  **Start the Server**:

    ```bash
    cd server
    node server.js
    ```

4.  **Start the Worker**:
    (In a separate terminal)

    ```bash
    cd server
    node worker.js
    ```

5.  **Start the Client**:
    ```bash
    cd client
    npm run dev
    ```

## 📂 Project Structure

- `server/`: Backend API and Worker logic.
  - `config/`: Database and Redis configuration.
  - `controllers/`: Request handlers.
  - `models/`: Database interactions (Vector Store).
  - `routes/`: API endpoints.
  - `worker.js`: Background worker entry point.
- `client/`: React frontend (Vite).

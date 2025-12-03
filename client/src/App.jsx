import { useState } from 'react';
import FileUpload from './components/FileUpload';
import ChatInterface from './components/ChatInterface';

function App() {
  const [currentDocId, setCurrentDocId] = useState(null);

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold  text-green-900">SmartDoc AI</h1>
          <p className="text-slate-500">
            Local-First RAG System powered by Ollama
          </p>
          {currentDocId && (
            <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
              Active Document: {currentDocId}
            </span>
          )}
        </div>

        <FileUpload onUploadSuccess={(docId) => setCurrentDocId(docId)} />
        <ChatInterface currentDocId={currentDocId} />
      </div>
    </div>
  );
}

export default App;

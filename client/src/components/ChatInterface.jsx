import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, FileText } from 'lucide-react';
import axios from 'axios';

const ChatInterface = ({ currentDocId }) => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! Upload a PDF and ask me anything about it.',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  // Reset chat when document changes
  useEffect(() => {
    if (currentDocId) {
      setMessages([
        {
          role: 'assistant',
          content: `I am now focused on "${currentDocId}". Ask me anything!`,
        },
      ]);
    }
  }, [currentDocId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await axios.post('/api/chat', {
        question: userMessage,
        docId: currentDocId, // Pass the active document ID
      });
      if (response.status !== 200) {
        throw new Error('Chat request failed');
      }
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: response.data.answer || response.data.response,
          sources: response.data.sources,
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error processing your request.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to clean up filenames
  const formatSource = (path) => {
    if (!path) return 'Unknown';
    return path.split(/[/\\]/).pop(); // Get just the filename
  };

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b bg-gray-50">
        <h2 className="font-semibold flex items-center gap-2">
          <Bot className="w-5 h-5 text-blue-600" />
          AI Assistant
        </h2>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex gap-3 ${
              msg.role === 'user' ? 'flex-row-reverse' : ''
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-green-600 text-white'
              }`}
            >
              {msg.role === 'user' ? (
                <User className="w-5 h-5" />
              ) : (
                <Bot className="w-5 h-5" />
              )}
            </div>
            <div className={`max-w-[80%] space-y-2`}>
              <div
                className={`p-3 rounded-lg text-sm ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-gray-100 text-gray-800 rounded-tl-none'
                }`}
              >
                {msg.content}
              </div>

              {/* Sources Section (Only for Assistant) */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="text-xs bg-gray-50 border border-gray-200 rounded-lg p-2 space-y-1">
                  <p className="font-semibold text-gray-500 flex items-center gap-1">
                    <FileText className="w-3 h-3" /> Sources:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {msg.sources.map((source, i) => (
                      <span
                        key={i}
                        className="bg-white border border-gray-200 px-2 py-1 rounded text-gray-600 truncate max-w-[200px]"
                      >
                        {formatSource(source.source)}
                        {source.loc?.pageNumber
                          ? ` (Pg ${source.loc.pageNumber})`
                          : ''}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center">
              <Bot className="w-5 h-5" />
            </div>
            <div className="bg-gray-100 p-3 rounded-lg rounded-tl-none">
              <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t bg-gray-50">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={!currentDocId}
            placeholder={
              currentDocId
                ? 'Ask a question...'
                : 'Upload a PDF to start chatting'
            }
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim() || !currentDocId}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface;

import { useState } from 'react';
import { Upload, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import axios from 'axios';

const FileUpload = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('idle'); // idle, uploading, success, error
  const [message, setMessage] = useState('');

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
      setStatus('idle');
      setMessage('');
    }
  };

  const pollJobStatus = async (jobId, filename) => {
    const interval = setInterval(async () => {
      try {
        const res = await axios.get(`/api/upload/status/${jobId}`);
        const { state } = res.data;

        if (state === 'completed') {
          clearInterval(interval);
          setStatus('success');
          setMessage('Processing complete! You can now chat.');
          // Pass the filename (docId) up to the parent
          if (onUploadSuccess) onUploadSuccess(filename);

          setTimeout(() => {
            setFile(null);
            setStatus('idle');
            setMessage('');
          }, 3000);
        } else if (state === 'failed') {
          clearInterval(interval);
          setStatus('error');
          setMessage('Processing failed on the server.');
        } else {
          // Still working...
          setMessage(`Processing PDF... (${state})`);
        }
      } catch (err) {
        clearInterval(interval);
        setStatus('error');
        setMessage('Lost connection to server.');
      }
    }, 1000);
  };

  const handleUpload = async () => {
    if (!file) return;

    setStatus('uploading');
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Instead of saying success immediately, we start polling
      setMessage('Upload success. Waiting for worker...');
      // Pass filename so we can use it as docId later
      pollJobStatus(res.data.jobId, res.data.filename);
    } catch (error) {
      console.error(error);
      setStatus('error');
      setMessage('Upload failed.');
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Upload className="w-5 h-5 text-blue-600" />
        Upload Document
      </h2>

      <div className="flex gap-4 items-center">
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          className="block w-full text-sm text-slate-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
        />

        <button
          onClick={handleUpload}
          disabled={!file || status === 'uploading'}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {status === 'uploading' ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            'Upload'
          )}
        </button>
      </div>

      {message && (
        <div
          className={`mt-4 p-3 rounded-lg flex items-center gap-2 text-sm ${
            status === 'success'
              ? 'bg-green-50 text-green-700'
              : status === 'error'
              ? 'bg-red-50 text-red-700'
              : 'bg-blue-50 text-blue-700'
          }`}
        >
          {status === 'success' && <CheckCircle className="w-4 h-4" />}
          {status === 'error' && <AlertCircle className="w-4 h-4" />}
          {message}
        </div>
      )}
    </div>
  );
};

export default FileUpload;

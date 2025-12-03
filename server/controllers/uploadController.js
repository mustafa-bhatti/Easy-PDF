import { pdfQueue } from '../config/queue.js';
import path from 'path';

export const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const { filename, path: filePath } = req.file;
    console.log(`API Upload Controller:  Received file ${filename}`);

    const job = await pdfQueue.add('pdf-processing', {
      fileName: filename,
      filePath: path.resolve(filePath),
    });

    return res.status(202).json({
      message: 'File accepted for processing',
      filename: filename,
      jobId: job.id,
    });
  } catch (error) {
    console.error(
      `API Upload Controller: Error processing file ${req.file?.filename}: ${error.message}`
    );
    return res.status(500).json({ error: 'Failed to process file' });
  }
};

export const getJobStatus = async (req, res) => {
  const { id } = req.params;
  console.log('Running Job Status');
  try {
    const job = await pdfQueue.getJob(id);
    console.log('Getting job status for:', id);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const state = await job.getState();
    const result = job.returnvalue;

    res.json({
      id: job.id,
      state,
      result,
    });
  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({ error: 'Failed to check status' });
  }
};

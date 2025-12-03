import { pdfQueue } from '../config/queue.js';
import path from 'path';

export const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const { filename, path: filePath } = req.file;
    console.log(`API Upload Controller:  Received file ${filename}`);
    await pdfQueue.add('pdf-processing', {
      fileName: filename,
      filePath: path.resolve(filePath),
    });

    return res
      .status(200)
      .json({ message: 'File uploaded and job added to queue' });
  } catch (error) {
    console.error(
      `API Upload Controller: Error processing file ${fileName}: ${error.message}`
    );
    return res.status(500).json({ error: 'Failed to process file' });
  }
};

import { getChatResponse } from '../controllers/chatController.js';
import { Router } from 'express';
import upload from './uploadRoutes.js';
import { uploadFile } from '../controllers/uploadController.js';
const router = Router();

router.post('/chat', getChatResponse);
router.post('/upload', upload.single('file'), uploadFile);

export default router;

import express from 'express';
import {
  getUserConversation,
  getAllConversations,
  getConversationMessages,
  markMessagesAsRead,
  deleteMessage,
  deleteConversation,
} from '../controllers/chatController.js';
import { verifyToken } from '../middlewares/middlewareControllers.js';

const router = express.Router();

// Routes cho user
router.get('/my-conversation', verifyToken, getUserConversation);
router.put('/mark-read/:conversationId', verifyToken, markMessagesAsRead);

// Routes cho admin
router.get('/conversations', verifyToken, getAllConversations);
router.get('/messages/:conversationId', verifyToken, getConversationMessages);
router.delete('/messages/:messageId', verifyToken, deleteMessage);
router.delete(
  '/conversations/:conversationId',
  verifyToken,
  deleteConversation
);

export default router;

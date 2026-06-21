const express = require('express');
const router = express.Router();
const { getChats, getMessages, sendMessage, markSeen, editMessage, deleteMessage } = require('../controllers/chatController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', protect, getChats);
router.get('/:chatId/messages', protect, getMessages);
router.post('/:chatId/messages', protect, upload.single('file'), sendMessage);
router.put('/:chatId/seen', protect, markSeen);
router.put('/:chatId/messages/:messageId', protect, editMessage);
router.delete('/:chatId/messages/:messageId', protect, deleteMessage);

module.exports = router;

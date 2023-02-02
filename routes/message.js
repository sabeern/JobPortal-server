const express = require('express');
const messageController = require('../controllers/messageController');
const router = express.Router();
const tokenValidation = require('../config/tokenValidation');

router.post('/', tokenValidation.validateToken, messageController.addMessage);
router.put('/updateStatus', messageController.updateReadMessage);
router.get('/unreadCount/:chatId/:senderId', tokenValidation.validateToken, messageController.unreadMessageCount);
router.get('/:chatId', tokenValidation.validateToken, messageController.getMessages);

module.exports = router;
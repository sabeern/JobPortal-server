const express = require('express');
const messageController = require('../controllers/messageController');
const router = express.Router();
const tokenValidation = require('../config/tokenValidation');

router.post('/', tokenValidation.validateToken, messageController.addMessage);
router.get('/:chatId', tokenValidation.validateToken, messageController.getMessages);

module.exports = router;
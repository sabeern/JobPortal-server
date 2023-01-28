const chatModel = require("../models/chatModel");
const MessageModel = require("../models/messageModel");
//Inserting new messages sended by users
const addMessage = async (req, res) => {
  const { chatId, senderId, text } = req.body;
  const message = new MessageModel({
    chatId,
    senderId,
    text,
  });
  try {
    const result = await message.save();
    try {
      await chatModel.findByIdAndUpdate(chatId,{updatedAt:Date.now()});
    }catch(err) {
      res.status(500).json(err);
    }
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json(error);
  }
};
//Fetching all messages of selectd chat
const getMessages = async (req, res) => {
  const { chatId } = req.params;
  try {
    const result = await MessageModel.find({ chatId });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json(error);
  }
}

module.exports = { addMessage, getMessages };
const mongoose = require('mongoose');

const promptSchema = new mongoose.Schema({
  category: { type: String, required: true },
  prompts: [{
    text: { type: String, required: true },
    icon: { type: String, required: true }
  }]
});

module.exports = mongoose.model('Prompt', promptSchema);
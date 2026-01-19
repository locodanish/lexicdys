const mongoose = require('mongoose');

const SentenceSchema = new mongoose.Schema({
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// ✅ CORRECT: The string here must be 'Sentence', NOT 'Word'
module.exports = mongoose.model('Sentence', SentenceSchema);
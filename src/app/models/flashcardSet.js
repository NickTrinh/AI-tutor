// src/app/models/FlashcardSet.js
import mongoose from 'mongoose';

const flashcardSchema = new mongoose.Schema({
  term: {
    type: String,
    required: true,
  },
  definition: {
    type: String,
    required: true,
  },
});

const flashcardSetSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  cards: [flashcardSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const FlashcardSet =
  mongoose.models.FlashcardSet ||
  mongoose.model('FlashcardSet', flashcardSetSchema);

export default FlashcardSet;

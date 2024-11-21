export class FlashcardSet {
  constructor(data) {
    this.id = data.id;
    this.title = data.title;
    this.cards = data.cards || [];
    this.createdAt = data.createdAt || new Date();
  }
}

export class Flashcard {
  constructor(data) {
    this.term = data.term;
    this.definition = data.definition;
  }
}
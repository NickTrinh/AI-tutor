import connectDB from '../../lib/mongoose';
import FlashcardSet from '../../models/FlashcardSet';

export async function GET() {
  try {
    await connectDB();

    const flashcardSets = await FlashcardSet.find()
      .select('title cards')
      .sort('-createdAt');

    return Response.json(
      flashcardSets.map(set => ({
        id: set._id.toString(),
        title: set.title,
        cardCount: set.cards.length,
      }))
    );
  } catch (error) {
    console.error('Error fetching flashcard sets:', error);
    return Response.json(
      { error: 'Failed to fetch flashcard sets' },
      { status: 500 }
    );
  }
}

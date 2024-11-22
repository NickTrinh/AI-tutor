import connectDB from '../../../lib/mongoose';
import FlashcardSet from '../../../models/FlashcardSet';

export async function GET(request, { params }) {
  try {
    await connectDB();

    const set = await FlashcardSet.findById(params.id);

    if (!set) {
      return Response.json(
        { error: 'Flashcard set not found' },
        { status: 404 }
      );
    }

    return Response.json(set);
  } catch (error) {
    console.error('Error fetching flashcard set:', error);
    return Response.json(
      { error: 'Failed to fetch flashcard set' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const result = await FlashcardSet.findByIdAndDelete(params.id);

    if (!result) {
      return Response.json(
        { error: 'Flashcard set not found' },
        { status: 404 }
      );
    }

    return Response.json({ message: 'Flashcard set deleted' });
  } catch (error) {
    console.error('Error deleting flashcard set:', error);
    return Response.json(
      { error: 'Failed to delete flashcard set' },
      { status: 500 }
    );
  }
}

import { Anthropic } from '@anthropic-ai/sdk';
import connectDB from '../../lib/mongoose';
import FlashcardSet from '../../models/FlashcardSet';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are an AI tutor helping students learn. When asked to create flashcards, respond with a JSON object only, no additional text, in this format:
{
  "type": "flashcard_set",
  "title": "Topic Title",
  "cards": [
    {"term": "term1", "definition": "definition1"}
  ]
}.

If not asked to create, don't create flashcards set and response as normal. Do not hallucinate or make things up.`;

async function saveFlashcardSet(data) {
  try {
    await connectDB();
    const flashcardSet = new FlashcardSet({
      title: data.title,
      cards: data.cards,
    });
    await flashcardSet.save();

    return {
      id: flashcardSet._id.toString(),
      title: flashcardSet.title,
      cardCount: flashcardSet.cards.length,
    };
  } catch (error) {
    console.error('MongoDB save error:', error);
    throw error;
  }
}

export async function POST(request) {
  try {
    const { messages } = await request.json();

    const response = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 8192,
      temperature: 0.7,
      system: SYSTEM_PROMPT,
      messages: messages.filter(msg => msg.role !== 'system'),
    });

    const message = response.content[0].text;

    try {
      // Try to parse the entire message as JSON
      const data = JSON.parse(message);
      if (data.type === 'flashcard_set') {
        const savedSet = await saveFlashcardSet(data);
        return Response.json({
          message: `Created flashcard set: ${data.title} with ${data.cards.length} cards`,
          flashcardSet: savedSet,
        });
      }
    } catch (e) {
      console.error('Failed to parse or save flashcard data:', e);
    }

    return Response.json({ message });
  } catch (error) {
    console.error('Chat API error:', error);
    return Response.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    );
  }
}

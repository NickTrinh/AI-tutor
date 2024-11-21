import { Anthropic } from '@anthropic-ai/sdk';
import clientPromise from '@/app/lib/mongodb';

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
}`;

async function saveFlashcardSet(data) {
  try {
    const client = await clientPromise;
    const db = client.db("ai-tutor");
    
    const result = await db.collection("flashcard-sets").insertOne({
      title: data.title,
      cards: data.cards,
      createdAt: new Date()
    });
    
    return {
      id: result.insertedId.toString(),
      title: data.title,
      cardCount: data.cards.length
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
      model: "claude-3-sonnet-20240229",
      max_tokens: 4096,
      temperature: 0.7,
      system: SYSTEM_PROMPT,
      messages: messages.filter(msg => msg.role !== 'system')
    });

    const message = response.content[0].text;

    try {
      // Try to parse the entire message as JSON
      const data = JSON.parse(message);
      if (data.type === "flashcard_set") {
        const savedSet = await saveFlashcardSet(data);
        return Response.json({
          message: `Created flashcard set: ${data.title} with ${data.cards.length} cards`,
          flashcardSet: savedSet
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
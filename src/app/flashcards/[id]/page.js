'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function FlashcardSet() {
  const { id } = useParams();
  const [flashcardSet, setFlashcardSet] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFlashcardSet() {
      try {
        const res = await fetch(`/api/flashcards/${id}`);
        const data = await res.json();
        if (res.ok) {
          setFlashcardSet(data);
        } else {
          console.error('Failed to fetch flashcard set:', data.error);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchFlashcardSet();
  }, [id]);

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!flashcardSet) {
    return <div className="flex justify-center items-center min-h-screen">Flashcard set not found</div>;
  }

  const currentCard = flashcardSet.cards[currentIndex];

  return (
    <div className="min-h-screen p-8 flex flex-col items-center">
      <div className="w-full max-w-[800px] mb-4">
        <Link 
          href="/"
          className="inline-block px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
        >
          ← Back to Chat
        </Link>
      </div>

      <h1 className="text-2xl font-bold mb-8">{flashcardSet.title}</h1>
      
      <div 
        className="w-[600px] h-[400px] relative perspective-1000 cursor-pointer"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div className={`absolute w-full h-full transition-transform duration-500 transform-style-preserve-3d ${
          isFlipped ? 'rotate-y-180' : ''
        }`}>
          <div className="absolute w-full h-full bg-white dark:bg-gray-800 rounded-xl p-8 flex items-center justify-center text-center shadow-lg backface-hidden">
            <p className="text-xl">{currentCard.term}</p>
          </div>
          <div className="absolute w-full h-full bg-white dark:bg-gray-800 rounded-xl p-8 flex items-center justify-center text-center shadow-lg backface-hidden rotate-y-180">
            <p className="text-xl">{currentCard.definition}</p>
          </div>
        </div>
      </div>

      <div className="flex gap-4 mt-8">
        <button
          onClick={() => {
            setCurrentIndex(i => Math.max(0, i - 1));
            setIsFlipped(false);
          }}
          disabled={currentIndex === 0}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          Previous
        </button>
        <button
          onClick={() => {
            setCurrentIndex(i => Math.min(flashcardSet.cards.length - 1, i + 1));
            setIsFlipped(false);
          }}
          disabled={currentIndex === flashcardSet.cards.length - 1}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
      
      <p className="mt-4 text-gray-500">
        Card {currentIndex + 1} of {flashcardSet.cards.length}
      </p>
    </div>
  );
}
'use client';
import { useState, useEffect } from 'react';

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [flashcardSets, setFlashcardSets] = useState([]);

  useEffect(() => {
    fetchFlashcardSets();
  }, []);

  async function fetchFlashcardSets() {
    try {
      const res = await fetch('/api/flashcards');
      if (res.ok) {
        const data = await res.json();
        setFlashcardSets(data);
      }
    } catch (error) {
      console.error('Failed to fetch flashcard sets:', error);
    }
  }

  const handleSubmit = async e => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    const userMessage = { role: 'user', content: message };
    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: data.message },
      ]);

      if (data.flashcardSet) {
        // Refresh flashcard sets list when new set is created
        fetchFlashcardSets();
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-[280px_1fr] min-h-screen bg-gray-50 dark:bg-gray-900">
      <aside className="border-r border-gray-200 dark:border-gray-800 p-4 bg-white dark:bg-gray-950">
        <h2 className="font-bold mb-4">Flashcard Sets</h2>
        <nav className="space-y-2">
          {flashcardSets.map(set => (
            <div key={set.id} className="flex items-center justify-between">
              <a
                href={`/flashcards/${set.id}`}
                className="flex-grow p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                {set.title} ({set.cardCount} cards)
              </a>
              <button
                onClick={async e => {
                  e.preventDefault();
                  const res = await fetch(`/api/flashcards/${set.id}`, {
                    method: 'DELETE',
                  });
                  if (res.ok) {
                    fetchFlashcardSets(); // Refresh the list
                  }
                }}
                className="p-2 text-red-500 hover:text-red-700"
                title="Delete flashcard set"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          ))}
        </nav>
      </aside>

      <main className="flex flex-col">
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                  msg.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-2 animate-pulse">
                AI is thinking...
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 dark:border-gray-800 p-4 bg-white dark:bg-gray-950">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Ask me anything about your studies..."
              className="flex-1 rounded-lg border border-gray-200 dark:border-gray-700 p-3 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 font-medium"
            >
              Send
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

"use client";
import { useState, useEffect } from "react";

const SYSTEM_PROMPT = `You are an AI tutor helping students learn. Create flashcard sets when requested using the create_flashcard_set tool.`;

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;
  
    const userMessage = { role: "user", content: message };
    setMessages(prev => [...prev, userMessage]);
    setMessage("");
    setIsLoading(true);
  
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage]
        }),
      });
  
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      
      setMessages(prev => [...prev, { role: "assistant", content: data.message }]);
      
      if (data.flashcardSet) {
        // Refresh flashcard sets list when new set is created
        fetchFlashcardSets();
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-[280px_1fr] min-h-screen bg-gray-50 dark:bg-gray-900">
      <aside className="border-r border-gray-200 dark:border-gray-800 p-4 bg-white dark:bg-gray-950">
        <h2 className="font-bold mb-4">Flashcard Sets</h2>
        <nav className="space-y-2">
        {flashcardSets.map((set) => (
            <a
              key={set.id}
              href={`/flashcards/${set.id}`}
              className="block p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {set.title} ({set.cardCount} cards)
            </a>
          ))}
          {flashcardSets.length === 0 && (
            <p className="text-sm text-gray-500">No flashcard sets yet</p>
          )}
        </nav>
      </aside>

      <main className="flex flex-col">
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                msg.role === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
              }`}>
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
              onChange={(e) => setMessage(e.target.value)}
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
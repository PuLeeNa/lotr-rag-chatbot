"use client";

import { useState } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: number;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setIsLoading(true);

    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });

      if (!response.ok) throw new Error("Failed to send message");

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.message,
          sources: data.sources,
        },
      ]);
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 min-h-screen flex flex-col bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <h1 className="text-4xl font-extrabold text-center mb-10 text-gradient bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-700 to-pink-600 drop-shadow-lg">
        🧙‍♂️ Lord of the Rings RAG Chatbot
      </h1>

      <div className="flex flex-col flex-grow bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="flex-grow p-6 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-300 scrollbar-track-gray-100 bg-gradient-to-b from-white to-purple-50">
          {messages.length === 0 ? (
            <div className="flex flex-col justify-center items-center h-full text-gray-400 select-none">
              <p className="text-xl font-semibold mb-2">Welcome to Middle-earth! 🏔️</p>
              <p className="text-sm">Ask me anything about Tolkin's Universe!</p>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
                className={`mb-6 flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-xs lg:max-w-lg px-5 py-3 rounded-2xl shadow-md whitespace-pre-wrap ${
                    message.role === "user"
                      ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-br-none"
                      : "bg-white border border-purple-300 text-purple-900 rounded-bl-none"
                  }`}
                >
                  <p className="leading-relaxed">{message.content}</p>
                  {message.sources && (
                    <p className="text-xs opacity-60 mt-1 font-mono">
                      📚 Based on {message.sources} source{message.sources > 1 ? "s" : ""}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start mb-6">
              <div className="px-5 py-3 rounded-2xl bg-gray-200 text-gray-700 shadow-md flex items-center space-x-3 rounded-bl-none animate-pulse">
                <svg
                  className="w-5 h-5 animate-spin text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"
                  ></path>
                </svg>
                <span>Thinking...</span>
              </div>
            </div>
          )}
        </div>

        <form
          onSubmit={sendMessage}
          className="flex gap-4 p-6 border-t border-purple-200 bg-gradient-to-r from-purple-50 to-white rounded-b-3xl"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about LOTR characters, plot, locations..."
            className="flex-grow px-5 py-3 text-purple-900 rounded-3xl border border-purple-300 focus:outline-none focus:ring-4 focus:ring-purple-400 focus:ring-opacity-50 placeholder-purple-400 shadow-sm"
            disabled={isLoading}
            autoComplete="off"
            spellCheck={false}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-7 py-3 bg-gradient-to-r from-indigo-600 to-purple-700 text-white font-semibold rounded-3xl shadow-lg hover:from-indigo-700 hover:to-purple-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </form>
      </div>

      <div className="mt-8 text-center text-sm text-purple-700 select-none">
        <p>
          ✨ Powered by Ollama | 🤖 Llama 3.1 + Nomic Embeddings
        </p>
        <p className="mt-1">Knowledge Base: Wikipedia articles</p>
      </div>
    </div>
  );
}

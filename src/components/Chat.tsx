import { useRef, useState, useEffect } from "react";

type Role = "user" | "assistant";

interface Message {
  id: string;
  role: Role;
  content: string;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const abortRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    if (!input.trim() || loading) return;

    const userMsg = input;
    setInput("");
    setLoading(true);

    const userId = crypto.randomUUID();
    const assistantId = crypto.randomUUID();

    setMessages(prev => [
      ...prev,
      { id: userId, role: "user", content: userMsg },
      { id: assistantId, role: "assistant", content: "" }
    ]);

    abortRef.current = new AbortController();

    try {
      const res = await fetch(import.meta.env.VITE_API_URL as string, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": import.meta.env.VITE_API_KEY as string
        },
        body: JSON.stringify({ message: userMsg }),
        signal: abortRef.current.signal
      });

      if (!res.ok || !res.body) {
        throw new Error("Invalid response");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        if (value) {
          const chunk = decoder.decode(value, { stream: true });

          setMessages(prev => {
            const updated = [...prev];
            const assistantIndex = updated.findIndex(m => m.id === assistantId);
            if (assistantIndex !== -1) {
              updated[assistantIndex] = {
                ...updated[assistantIndex],
                content: updated[assistantIndex].content + chunk
              };
            }
            return updated;
          });
        }
      }
    } catch (err) {
      console.error('Chat error:', err);
      
      // Better error messaging based on error type
      const errorMessage = abortRef.current?.signal.aborted
        ? "⚠️ Request cancelled."
        : err instanceof TypeError
        ? "⚠️ Network error. Please check your connection."
        : "⚠️ Error getting response.";

      setMessages(prev => {
        const updated = [...prev];
        const assistantIndex = updated.findIndex(m => m.id === assistantId);
        if (assistantIndex !== -1) {
          updated[assistantIndex] = {
            role: "assistant",
            id: assistantId,
            content: errorMessage
          };
        }
        return updated;
      });
    } finally {
      setLoading(false);
    }
  }

  function stopStreaming() {
    abortRef.current?.abort();
    setLoading(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="flex flex-col h-screen bg-black text-white">
      <div 
        role="log" 
        aria-live="polite" 
        aria-label="Chat conversation"
        className="flex-1 overflow-y-auto p-4 space-y-3"
      >
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-zinc-500">
            <p>Start a conversation by typing a message below</p>
          </div>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={`max-w-xl px-4 py-2 rounded-lg ${
                m.role === "user"
                  ? "bg-blue-600 self-end"
                  : "bg-zinc-800 self-start"
              }`}
            >
              {m.content}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 flex gap-2 border-t border-zinc-700">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          aria-label="Chat message input"
          className="flex-1 bg-zinc-900 px-3 py-2 rounded outline-none"
          placeholder="Ask something..."
        />

        {!loading ? (
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            aria-label="Send message"
            className="bg-blue-600 px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        ) : (
          <button
            onClick={stopStreaming}
            aria-label="Stop streaming"
            className="bg-red-600 px-4 py-2 rounded"
          >
            Stop
          </button>
        )}
      </div>
    </div>
  );
}

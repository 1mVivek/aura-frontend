import { useRef, useState } from "react";

type Role = "user" | "assistant";

interface Message {
  role: Role;
  content: string;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const abortRef = useRef<AbortController | null>(null);

  async function sendMessage() {
    if (!input.trim() || loading) return;

    const userMsg = input;
    setInput("");
    setLoading(true);

    const assistantIndex = messages.length + 1;

    setMessages(prev => [
      ...prev,
      { role: "user", content: userMsg },
      { role: "assistant", content: "" }
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
            updated[assistantIndex] = {
              ...updated[assistantIndex],
              content: updated[assistantIndex].content + chunk
            };
            return updated;
          });
        }
      }
    } catch (err) {
      setMessages(prev => {
        const updated = [...prev];
        updated[assistantIndex] = {
          role: "assistant",
          content: "⚠️ Error getting response."
        };
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

  return (
    <div className="flex flex-col h-screen bg-black text-white">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-xl px-4 py-2 rounded-lg ${
              m.role === "user"
                ? "bg-blue-600 self-end"
                : "bg-zinc-800 self-start"
            }`}
          >
            {m.content}
          </div>
        ))}
      </div>

      <div className="p-4 flex gap-2 border-t border-zinc-700">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          className="flex-1 bg-zinc-900 px-3 py-2 rounded outline-none"
          placeholder="Ask something..."
        />

        {!loading ? (
          <button
            onClick={sendMessage}
            className="bg-blue-600 px-4 py-2 rounded"
          >
            Send
          </button>
        ) : (
          <button
            onClick={stopStreaming}
            className="bg-red-600 px-4 py-2 rounded"
          >
            Stop
          </button>
        )}
      </div>
    </div>
  );
}

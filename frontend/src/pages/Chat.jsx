import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Send } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import api from "../api/axios";

export default function Chat() {
  const { swapId } = useParams();
  const { user } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [swap, setSwap] = useState(null);
  const bottomRef = useRef(null);

  // Load swap & messages
  useEffect(() => {
    api.get("/swaps").then((r) => {
      const found = r.data.find((s) => s._id === swapId);
      setSwap(found);
    }).catch(() => {});

    api.get(`/chat/${swapId}/messages`).then((r) => setMessages(r.data)).catch(() => {});
  }, [swapId]);

  // Socket room
  useEffect(() => {
    if (!socket) return;
    socket.emit("join_swap", swapId);

    const handler = (msg) => {
      setMessages((prev) => {
        if (prev.find((m) => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
    };
    socket.on("new_message", handler);

    return () => {
      socket.emit("leave_swap", swapId);
      socket.off("new_message", handler);
    };
  }, [socket, swapId]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    if (socket?.connected) {
      socket.emit("send_message", { swapId, text: trimmed });
    } else {
      // REST fallback
      api.post(`/chat/${swapId}/messages`, { text: trimmed })
        .then((r) => setMessages((prev) => [...prev, r.data]))
        .catch(() => {});
    }
    setText("");
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const otherUser = swap
    ? (swap.fromUser._id === user?._id ? swap.toUser : swap.fromUser)
    : null;

  return (
    <div className="min-h-screen flex flex-col w-full max-w-3xl mx-auto bg-white">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b bg-white sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="p-1 rounded-full hover:bg-gray-100">
          <ArrowLeft size={20} />
        </button>
        {otherUser && (
          <>
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white font-bold">
              {otherUser.name[0].toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-sm">{otherUser.name}</p>
              <p className="text-xs text-gray-400">
                {swap?.skillOffered} ↔ {swap?.skillRequested}
              </p>
            </div>
          </>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2 pb-24">
        {messages.length === 0 && (
          <div className="text-center py-10">
            <p className="text-3xl mb-2">💬</p>
            <p className="text-sm text-gray-400">Start the conversation!</p>
          </div>
        )}
        {messages.map((msg) => {
          const isMe = String(msg.sender._id || msg.sender) === String(user?._id);
          return (
            <div key={msg._id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                  isMe
                    ? "bg-primary text-white rounded-br-sm"
                    : "bg-gray-100 text-gray-900 rounded-bl-sm"
                }`}
              >
                <p>{msg.text}</p>
                <p className={`text-[10px] mt-0.5 ${isMe ? "text-white/60" : "text-gray-400"}`}>
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-3xl bg-white border-t px-4 py-3 flex gap-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Type a message…"
          rows={1}
          className="flex-1 bg-gray-100 rounded-2xl px-4 py-2.5 text-sm outline-none resize-none focus:ring-2 focus:ring-primary"
        />
        <button
          onClick={send}
          disabled={!text.trim()}
          className="bg-primary text-white rounded-2xl px-4 py-2.5 disabled:opacity-40"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}

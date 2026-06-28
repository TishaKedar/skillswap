import { useEffect, useState } from "react";
import { Check, X, MessageCircle, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Shell } from "../components/Shell";
import { useAuth } from "../context/AuthContext";
import ReviewModal from "../components/ReviewModal";
import api from "../api/axios";

export default function Swaps() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [swaps, setSwaps] = useState([]);
  const [reviewTarget, setReviewTarget] = useState(null); // { swapId, revieweeId, revieweeName }

  const load = () => api.get("/swaps").then((r) => setSwaps(r.data)).catch(() => {});

  useEffect(() => { load(); }, []);

  const respond = async (id, status) => {
    await api.patch(`/swaps/${id}`, { status });
    load();
  };

  const received = swaps.filter((s) => s.toUser._id === user?._id);
  const sent = swaps.filter((s) => s.fromUser._id === user?._id);

  return (
    <Shell>
      <div className="px-5 pt-8 pb-4 w-full">

        <h1 className="text-2xl font-bold mb-5">Swap Requests</h1>

        <Section title="Received">
          {received.length === 0 && <Empty text="Nothing here yet." />}
          {received.map((s) => (
            <SwapCard
              key={s._id}
              swap={s}
              isReceiver
              onAccept={() => respond(s._id, "accepted")}
              onReject={() => respond(s._id, "rejected")}
              onChat={() => navigate(`/chat/${s._id}`)}
              onReview={() =>
                setReviewTarget({ swapId: s._id, revieweeId: s.fromUser._id, revieweeName: s.fromUser.name })
              }
              currentUserId={user?._id}
            />
          ))}
        </Section>

        <Section title="Sent">
          {sent.length === 0 && <Empty text="You haven't sent any requests yet." />}
          {sent.map((s) => (
            <SwapCard
              key={s._id}
              swap={s}
              onChat={() => navigate(`/chat/${s._id}`)}
              onReview={() =>
                setReviewTarget({ swapId: s._id, revieweeId: s.toUser._id, revieweeName: s.toUser.name })
              }
              currentUserId={user?._id}
            />
          ))}
        </Section>
      </div>

      {reviewTarget && (
        <ReviewModal
          swapId={reviewTarget.swapId}
          revieweeName={reviewTarget.revieweeName}
          onClose={() => setReviewTarget(null)}
          onDone={() => { setReviewTarget(null); load(); }}
        />
      )}
    </Shell>
  );
}

function Section({ title, children }) {
  return (
    <div className="mb-6">
      <h2 className="font-semibold text-sm text-gray-400 mb-3 uppercase tracking-wide">{title}</h2>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Empty({ text }) {
  return <p className="text-sm text-gray-400">{text}</p>;
}

function SwapCard({ swap: s, isReceiver, onAccept, onReject, onChat, onReview, currentUserId }) {
  const other = isReceiver ? s.fromUser : s.toUser;

  return (
    <div className="bg-gray-50 rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">
          {other?.name?.[0]?.toUpperCase()}
        </div>
        <div>
          <p className="text-sm font-semibold">{other?.name}</p>
          <p className="text-xs text-gray-400">
            {s.skillOffered} ↔ {s.skillRequested}
          </p>
        </div>
        <div className="ml-auto"><StatusBadge status={s.status} /></div>
      </div>

      {s.message && (
        <p className="text-xs text-gray-400 italic bg-white rounded-xl px-3 py-2 mb-3">"{s.message}"</p>
      )}

      <div className="flex gap-2">
        {isReceiver && s.status === "pending" && (
          <>
            <button
              onClick={onAccept}
              className="flex-1 bg-primary text-white rounded-xl py-2.5 text-sm font-medium flex items-center justify-center gap-1"
            >
              <Check size={14} /> Accept
            </button>
            <button
              onClick={onReject}
              className="flex-1 bg-gray-200 text-gray-700 rounded-xl py-2.5 text-sm font-medium flex items-center justify-center gap-1"
            >
              <X size={14} /> Reject
            </button>
          </>
        )}

        {s.status === "accepted" && (
          <>
            <button
              onClick={onChat}
              className="flex-1 bg-blue-500 text-white rounded-xl py-2.5 text-sm font-medium flex items-center justify-center gap-1"
            >
              <MessageCircle size={14} /> Chat
            </button>
            <button
              onClick={onReview}
              className="flex-1 bg-yellow-400 text-white rounded-xl py-2.5 text-sm font-medium flex items-center justify-center gap-1"
            >
              <Star size={14} /> Review
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const colors = {
    pending: "bg-yellow-100 text-yellow-700",
    accepted: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
  };
  return (
    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${colors[status]}`}>
      {status}
    </span>
  );
}

import { useState, useEffect } from "react";
import { X, Star } from "lucide-react";
import api from "../api/axios";

export default function ReviewModal({ swapId, revieweeName, onClose, onDone }) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/reviews/swap/${swapId}`)
      .then((r) => { if (r.data) setAlreadyReviewed(true); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [swapId]);

  const submit = async () => {
    if (!rating) return setError("Please select a rating");
    try {
      await api.post("/reviews", { swapId, rating, comment });
      onDone();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit review");
    }
  };

  if (loading) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
      <div className="bg-white rounded-t-3xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-lg">Review {revieweeName}</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100"><X size={20} /></button>
        </div>

        {alreadyReviewed ? (
          <div className="py-6 text-center">
            <p className="text-2xl mb-2">✅</p>
            <p className="font-medium text-gray-700">You already reviewed this swap.</p>
            <button onClick={onClose} className="mt-4 w-full bg-primary text-white rounded-xl py-3 font-medium">
              Close
            </button>
          </div>
        ) : (
          <>
            <div className="flex justify-center gap-2 mb-5">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  onClick={() => setRating(s)}
                  onMouseEnter={() => setHovered(s)}
                  onMouseLeave={() => setHovered(0)}
                >
                  <Star
                    size={36}
                    className={
                      s <= (hovered || rating)
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-200 fill-gray-200"
                    }
                  />
                </button>
              ))}
            </div>

            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Leave a comment (optional)…"
              rows={3}
              className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary mb-3"
            />

            {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

            <button
              onClick={submit}
              className="w-full bg-yellow-400 text-white rounded-xl py-3 font-semibold"
            >
              Submit Review
            </button>
          </>
        )}
      </div>
    </div>
  );
}

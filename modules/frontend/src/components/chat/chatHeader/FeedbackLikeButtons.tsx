import { useState } from "react";
import {
  FaThumbsUp,
  FaThumbsDown,
  FaRegThumbsUp,
  FaRegThumbsDown,
} from "react-icons/fa";

interface Props {
  setFeedback: (value: 'like' | 'dislike') => void;
  feedback: string;
}
export const FeedbackButtons = ({ setFeedback, feedback }: Props) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleFeedback = (value: 'like' | 'dislike') => {
    setFeedback(value);
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 500);
  };

  return (
    <div className="w-full max-w-3xl mx-auto mt-4 mb-6">
      <div className="bg-blue-50 rounded-lg p-4 shadow-sm border border-blue-100">
        <p className="text-center text-gray-700 mb-3">
          ¿Te ayudó esta respuesta del asistente?
        </p>
        <div className="flex justify-center gap-6">
          <button
            onClick={() => handleFeedback("like")}
            className={`flex flex-col items-center gap-1 transition-all duration-300 ${
              feedback === "like"
                ? "text-blue-600 scale-110"
                : "text-gray-500 hover:text-blue-500"
            } ${isAnimating && feedback === "like" ? "animate-pulse" : ""}`}
            aria-label="Me gusta"
          >
            {feedback === "like" ? (
              <FaThumbsUp className="text-2xl" />
            ) : (
              <FaRegThumbsUp className="text-2xl" />
            )}
          </button>

          <button
            onClick={() => handleFeedback("dislike")}
            className={`flex flex-col items-center gap-1 transition-all duration-300 ${
              feedback === "dislike"
                ? "text-red-600 scale-110"
                : "text-gray-500 hover:text-red-500"
            } ${isAnimating && feedback === "dislike" ? "animate-pulse" : ""}`}
            aria-label="No me gusta"
          >
            {feedback === "dislike" ? (
              <FaThumbsDown className="text-2xl" />
            ) : (
              <FaRegThumbsDown className="text-2xl" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

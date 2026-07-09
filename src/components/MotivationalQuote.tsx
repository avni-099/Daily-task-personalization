import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function MotivationalQuote() {
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const randomQuote = useQuery(api.quotes.getRandomQuote);
  
  // Rotate quotes every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuoteIndex(prev => prev + 1);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Trigger a new quote fetch when index changes
  const displayQuote = randomQuote;

  if (!displayQuote) {
    return (
      <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 max-w-md">
        <div className="animate-pulse">
          <div className="h-4 bg-white/30 rounded mb-2"></div>
          <div className="h-3 bg-white/20 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 max-w-md transition-all duration-500 hover:bg-white/30">
      <div className="flex items-start space-x-3">
        <div className="text-3xl">💡</div>
        <div className="flex-1">
          <blockquote className="text-white/90 text-sm leading-relaxed mb-2 italic">
            "{displayQuote.quote}"
          </blockquote>
          <cite className="text-white/70 text-xs font-medium">
            — {displayQuote.author}
          </cite>
          <div className="mt-2 flex items-center space-x-2">
            <span className="px-2 py-1 bg-white/20 rounded-full text-xs text-white/80 capitalize">
              {displayQuote.category}
            </span>
            <div className="flex space-x-1">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                    i === (currentQuoteIndex % 3) ? "bg-white" : "bg-white/40"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

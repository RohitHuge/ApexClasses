import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, CheckCircle, Volume2, Maximize, SkipBack, SkipForward } from 'lucide-react';

const VideoPlayer = ({ video, onComplete }) => {
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    setIsCompleted(false);
    // Simulate loading for better UX feel
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, [video]);

  const handleMarkComplete = () => {
    setIsCompleted(true);
    if (onComplete) onComplete(video.id);
  };

  if (!video) return null;

  return (
    <div className="flex flex-col space-y-6">
      <div className="relative aspect-video rounded-3xl overflow-hidden bg-black border border-slate-200 group shadow-2xl">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <video
            key={video.url}
            className="w-full h-full object-contain"
            controls
            autoPlay
            src={video.url}
          />
        )}
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 bg-white rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">{video.title}</h1>
          <p className="text-slate-600 text-sm md:text-base leading-relaxed">
            {video.description}
          </p>
          <div className="mt-4 flex items-center space-x-4">
            <span className="px-3 py-1 bg-slate-100 rounded-full text-xs text-slate-500 font-medium">
              Duration: {video.duration}
            </span>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleMarkComplete}
          disabled={isCompleted}
          className={`px-8 py-4 rounded-2xl font-bold flex items-center space-x-3 transition-all shadow-lg ${
            isCompleted 
              ? "bg-green-100 text-green-700 cursor-default border border-green-200" 
              : "bg-blue-600 hover:bg-blue-700 text-white border border-blue-500 shadow-blue-200"
          }`}
        >
          {isCompleted ? (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                <CheckCircle size={24} />
              </motion.div>
              <span>Completed</span>
            </>
          ) : (
            <span>Mark as Completed</span>
          )}
        </motion.button>
      </div>
    </div>
  );
};

export default VideoPlayer;

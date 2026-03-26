import React, { useState } from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, PlayCircle, CheckCircle2 } from 'lucide-react';

const Sidebar = ({ chapters, activeTopicId, completedTopics = [] }) => {
  const { class: className, subject } = useParams();
  const [expandedChapters, setExpandedChapters] = useState({});

  const toggleChapter = (chapterId) => {
    setExpandedChapters(prev => ({
      ...prev,
      [chapterId]: !prev[chapterId]
    }));
  };

  return (
    <div className="w-full h-full bg-white border-r border-slate-200 flex flex-col overflow-y-auto custom-scrollbar">
      <div className="p-6 border-b border-slate-200">
        <h2 className="text-lg font-bold text-slate-800 uppercase tracking-wider">Chapters</h2>
      </div>
      
      <div className="flex-1 py-4">
        {chapters?.map((chapter) => (
          <div key={chapter.id} className="mb-2">
            <button
              onClick={() => toggleChapter(chapter.id)}
              className="w-full flex items-center justify-between px-6 py-3 text-slate-600 hover:bg-slate-50 transition-colors group"
            >
              <span className="font-semibold text-sm group-hover:text-slate-900 transition-colors">
                {chapter.name}
              </span>
              {expandedChapters[chapter.id] ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
            </button>
            
            <AnimatePresence>
              {expandedChapters[chapter.id] && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden bg-slate-50/50"
                >
                  {chapter.topics.map((topic) => (
                    <NavLink
                      key={topic.id}
                      to={`/courses/${className}/${subject}/${chapter.id}/${topic.id}`}
                      className={({ isActive }) => 
                        `flex items-center space-x-3 px-8 py-3 text-sm transition-all border-l-2 ${
                          isActive 
                            ? "bg-blue-50 border-apexBlue text-apexBlue font-bold" 
                            : "border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-100/50"
                        }`
                      }
                    >
                      {completedTopics.includes(topic.id) ? (
                        <CheckCircle2 size={16} className="text-green-500" />
                      ) : (
                        <PlayCircle size={16} />
                      )}
                      <span className="truncate">{topic.name}</span>
                    </NavLink>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;

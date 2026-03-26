import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ArrowLeft, ArrowRight, BookOpen, AlertCircle } from 'lucide-react';
import data from '../../data/courses.json';
import Sidebar from '../components/Sidebar';
import VideoPlayer from '../components/VideoPlayer';
import Toast from '../components/Toast';

const SubjectPage = () => {
  const { class: classId, subject: subjectId, chapter: chapterId, topic: topicId } = useParams();
  const navigate = useNavigate();
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success', visible: false });
  const [completedTopics, setCompletedTopics] = useState(() => {
    const saved = localStorage.getItem('apex_completed_topics');
    return saved ? JSON.parse(saved) : [];
  });

  // Find data
  const classData = data.classes.find(c => c.id === classId);
  const subjectData = classData?.subjects.find(s => s.id === subjectId);
  const chapters = subjectData?.chapters || [];

  // Determine current content
  const currentChapter = chapters.find(c => c.id === chapterId) || chapters[0];
  const currentTopic = currentChapter?.topics.find(t => t.id === topicId) || currentChapter?.topics[0];
  const currentVideo = currentTopic?.videos[0]; // Assuming first video for simplicity, or handle multiples if needed

  // Handle completion
  const handleComplete = (videoId) => {
    if (currentTopic && !completedTopics.includes(currentTopic.id)) {
      const newCompleted = [...completedTopics, currentTopic.id];
      setCompletedTopics(newCompleted);
      localStorage.setItem('apex_completed_topics', JSON.stringify(newCompleted));
      setToast({ message: 'Topic marked as completed!', type: 'success', visible: true });
    }
  };

  // Breadcrumb correction logic: if we are at /courses/:class/:subject, auto-navigate to the first topic for better UX
  useEffect(() => {
    if (subjectData && !chapterId && chapters.length > 0 && chapters[0].topics.length > 0) {
      navigate(`/courses/${classId}/${subjectId}/${chapters[0].id}/${chapters[0].topics[0].id}`, { replace: true });
    }
  }, [subjectData, chapterId, chapters, classId, subjectId, navigate]);

  if (!subjectData) {
    return (
      <div className="bg-white p-12 rounded-3xl text-center border border-slate-200">
        <AlertCircle size={48} className="text-red-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-900">Subject Not Found</h2>
        <p className="text-slate-500 mt-2">Could not find the content you requested.</p>
      </div>
    );
  }

  // Navigation helpers
  const getAllTopics = () => {
    const all = [];
    chapters.forEach(c => {
      c.topics.forEach(t => {
        all.push({ ...t, chapterId: c.id });
      });
    });
    return all;
  };

  const allTopics = getAllTopics();
  const currentIndex = allTopics.findIndex(t => t.id === currentTopic?.id);
  const nextTopic = allTopics[currentIndex + 1];
  const prevTopic = allTopics[currentIndex - 1];

  return (
    <div className="flex flex-col lg:flex-row gap-8 relative">
      {/* Mobile Sidebar Toggle */}
      <button 
        onClick={() => setIsSidebarOpen(true)}
        className="lg:hidden fixed bottom-6 right-6 z-50 p-4 bg-orange-gradient rounded-full shadow-2xl text-white flex items-center justify-center transition-transform active:scale-95"
      >
        <Menu size={24} />
      </button>

      {/* Sidebar Overlay for Mobile */}
      <AnimatePresence>
        {isSidebarOpen && (
          <div className="fixed inset-0 z-[60] lg:hidden">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute inset-y-0 left-0 w-80 bg-white border-r border-slate-200"
            >
              <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                <span className="font-bold text-slate-900">Course Menu</span>
                <button onClick={() => setIsSidebarOpen(false)} className="text-slate-500 hover:text-slate-900">
                  <X size={24} />
                </button>
              </div>
              <Sidebar 
                chapters={chapters} 
                activeTopicId={topicId} 
                completedTopics={completedTopics}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-80 flex-shrink-0 bg-white rounded-3xl border border-slate-200 overflow-hidden sticky top-24 h-[calc(100vh-8rem)] shadow-sm">
        <Sidebar 
          chapters={chapters} 
          activeTopicId={topicId} 
          completedTopics={completedTopics}
        />
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 space-y-8">
        {!currentTopic ? (
          <div className="flex flex-col items-center justify-center p-20 bg-slate-50 rounded-3xl border border-dashed border-slate-300">
            <BookOpen size={48} className="text-slate-400 mb-4" />
            <h3 className="text-xl font-medium text-slate-500">Select a topic from the sidebar to start learning</h3>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <VideoPlayer video={currentVideo} onComplete={handleComplete} />
            
            {/* Topic Navigation */}
            <div className="flex justify-between items-center py-6 border-t border-slate-200">
              {prevTopic ? (
                <button
                  onClick={() => navigate(`/courses/${classId}/${subjectId}/${prevTopic.chapterId}/${prevTopic.id}`)}
                  className="group flex items-center space-x-3 text-slate-500 hover:text-apexBlue transition-colors"
                >
                  <div className="p-3 rounded-xl bg-white border border-slate-200 group-hover:bg-blue-50 group-hover:border-apexBlue/50 transition-all shadow-sm">
                    <ArrowLeft size={18} />
                  </div>
                  <div className="text-left hidden sm:block font-medium">
                    <span className="text-[10px] text-slate-400 block uppercase tracking-wider">Previous Topic</span>
                    <span className="line-clamp-1">{prevTopic.name}</span>
                  </div>
                </button>
              ) : <div />}

              {nextTopic ? (
                <button
                  onClick={() => navigate(`/courses/${classId}/${subjectId}/${nextTopic.chapterId}/${nextTopic.id}`)}
                  className="group flex items-center space-x-3 text-slate-500 hover:text-apexBlue transition-colors text-right"
                >
                  <div className="text-right hidden sm:block font-medium">
                    <span className="text-[10px] text-slate-400 block uppercase tracking-wider">Next Topic</span>
                    <span className="line-clamp-1">{nextTopic.name}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-slate-200 group-hover:bg-blue-50 group-hover:border-apexBlue/50 transition-all shadow-sm">
                    <ArrowRight size={18} />
                  </div>
                </button>
              ) : <div />}
            </div>
          </div>
        )}
      </main>

      <Toast 
        message={toast.message} 
        type={toast.type} 
        isVisible={toast.visible} 
        onClose={() => setToast({ ...toast, visible: false })} 
      />
    </div>
  );
};

export default SubjectPage;

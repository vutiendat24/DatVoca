import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2 } from 'lucide-react';
import { useVocabulary, useUpdateSRS } from '../hooks/useVocabulary';
import { useTopics } from '../hooks/useTopics';
import { Difficulty, type Vocabulary } from '../types';
import { Button } from '../components/Button/Button';
import { Select } from '../components/Input/Input';
import { EmptyState } from '../components/EmptyState/EmptyState';
import { LoadingPage } from '../components/Loading/Loading';

const FlipCard: React.FC<{
  card: Vocabulary;
  isFlipped: boolean;
  onFlip: () => void;
}> = ({ card, isFlipped, onFlip }) => {
  const speak = () => {
    if ('speechSynthesis' in window) {
      const utter = new SpeechSynthesisUtterance(card.word);
      utter.lang = 'en-US';
      window.speechSynthesis.speak(utter);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onFlip}
      onKeyDown={e => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); onFlip(); } }}
      className="w-full h-[300px] perspective-1000 cursor-pointer focus-visible:outline-none"
    >
      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.5, type: 'spring', damping: 20 }}
        className="relative w-full h-full preserve-3d"
      >
        {/* Front: Word & IPA */}
        <div className={`absolute inset-0 backface-hidden rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm p-6 flex flex-col items-center justify-center transition-all duration-300 ${isFlipped ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white capitalize select-none">
            {card.word}
          </h1>
          <p className="text-md text-gray-400 font-mono mt-2 select-none">{card.ipa}</p>
          <button
            onClick={e => { e.stopPropagation(); speak(); }}
            className="mt-4 p-2 rounded-lg bg-pink-50 dark:bg-pink-900/20 text-pink-500 hover:bg-pink-100 transition-colors"
          >
            <Volume2 size={18} />
          </button>
        </div>

        {/* Back: English Example */}
        <div className={`absolute inset-0 backface-hidden rotate-y-180 rounded-2xl bg-pink-50/50 dark:bg-pink-950/20 border border-pink-100 dark:border-pink-900/50 shadow-sm p-6 flex flex-col items-center justify-center transition-all duration-300 ${isFlipped ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <p className="text-lg italic text-gray-800 dark:text-gray-200 text-center leading-relaxed font-medium select-none">
            "{card.exampleEn}"
          </p>
          {card.exampleVi && (
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-2 select-none">
              ({card.exampleVi})
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default function FlashcardsPage() {
  const [topicFilter, setTopicFilter] = useState('');
  const [studyMode, setStudyMode] = useState<'all' | 'srs'>('srs');
  const { data, isLoading } = useVocabulary({ topicId: topicFilter || undefined, limit: 100 });
  const { data: topics } = useTopics();
  const updateSRS = useUpdateSRS();

  const [cards, setCards] = useState<Vocabulary[]>([]);
  const [index, setIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    if (data?.data) {
      let list = [...data.data];
      if (studyMode === 'srs') {
        const now = new Date();
        list = list.filter(c => !c.nextReviewAt || new Date(c.nextReviewAt) <= now);
      }
      setCards(list);
      setIndex(0);
      setIsFlipped(false);
    }
  }, [data, studyMode]);

  const current = cards[index];
  const progress = cards.length > 0 ? ((index + 1) / cards.length) * 100 : 0;

  const next = useCallback(() => {
    if (index < cards.length - 1) {
      setIndex(i => i + 1);
      setIsFlipped(false);
    }
  }, [index, cards.length]);

  const prev = useCallback(() => {
    if (index > 0) {
      setIndex(i => i - 1);
      setIsFlipped(false);
    }
  }, [index]);

  const shuffle = useCallback(() => {
    setCards(c => [...c].sort(() => Math.random() - 0.5));
    setIndex(0);
    setIsFlipped(false);
  }, []);

  const handleDifficultySelect = async (d: Difficulty) => {
    if (!current) return;
    await updateSRS.mutateAsync({ id: current.id, difficulty: d });
    if (index < cards.length - 1) {
      next();
    } else {
      setIndex(prevIndex => Math.min(prevIndex + 1, cards.length));
    }
  };

  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) return;
      if (e.key === 'ArrowLeft') prev();
      else if (e.key === 'ArrowRight') next();
      else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        setIsFlipped(f => !f);
      } else if (e.key === '1') handleDifficultySelect(Difficulty.Easy);
      else if (e.key === '2') handleDifficultySelect(Difficulty.Medium);
      else if (e.key === '3') handleDifficultySelect(Difficulty.Hard);
      else if (e.key === '4') handleDifficultySelect(Difficulty.SuperHard);
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [prev, next, current, cards, index]);

  const topicOpts = [{ value: '', label: 'Tất cả chủ đề' }, ...(topics?.map(t => ({ value: t.id, label: t.name })) ?? [])];

  if (isLoading) return <LoadingPage />;

  return (
    <div className="p-4 max-w-xl mx-auto flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <Select options={topicOpts} className="max-w-[150px]" value={topicFilter} onChange={e => setTopicFilter(e.target.value)} />
        
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
          <button
            onClick={() => setStudyMode('srs')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              studyMode === 'srs' ? 'bg-white dark:bg-gray-700 text-pink-600 shadow-sm' : 'text-gray-500'
            }`}
          >
            Lặp lại ngắt quãng (SRS)
          </button>
          <button
            onClick={() => setStudyMode('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              studyMode === 'all' ? 'bg-white dark:bg-gray-700 text-pink-600 shadow-sm' : 'text-gray-500'
            }`}
          >
            Học tất cả
          </button>
        </div>
      </div>

      {!current ? (
        <EmptyState
          icon="🎉"
          title="Hoàn thành buổi học!"
          description={studyMode === 'srs' ? "Không còn từ nào cần ôn tập hôm nay. Hãy chuyển sang chế độ 'Học tất cả' hoặc thêm từ mới!" : "Không tìm thấy từ vựng nào."}
          action={studyMode === 'srs' ? <Button variant="secondary" onClick={() => setStudyMode('all')}>Học tất cả từ vựng</Button> : undefined}
        />
      ) : (
        <>
          <div>
            <div className="flex justify-between items-center text-xs text-gray-500 mb-1">
              <span>Đang học</span>
              <span className="font-bold">
                {index + 1} / {cards.length}
              </span>
            </div>
            <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                animate={{ width: `${progress}%` }}
                className="h-full bg-pink-500"
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.15 }}
            >
              <FlipCard card={current} isFlipped={isFlipped} onFlip={() => setIsFlipped(f => !f)} />
            </motion.div>
          </AnimatePresence>

          <div className="flex flex-col gap-2">
            <div className="grid grid-cols-4 gap-2">
              <button
                onClick={() => handleDifficultySelect(Difficulty.Easy)}
                className="py-2.5 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
              >
                Dễ (Easy)
              </button>
              <button
                onClick={() => handleDifficultySelect(Difficulty.Medium)}
                className="py-2.5 rounded-xl text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors"
              >
                Trung bình (Medium)
              </button>
              <button
                onClick={() => handleDifficultySelect(Difficulty.Hard)}
                className="py-2.5 rounded-xl text-xs font-bold text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-200 transition-colors"
              >
                Khó (Hard)
              </button>
              <button
                onClick={() => handleDifficultySelect(Difficulty.SuperHard)}
                className="py-2.5 rounded-xl text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors"
              >
                Rất khó (Super Hard)
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center mt-2">
            <Button variant="outline" size="sm" onClick={prev} disabled={index === 0}>
              Trước
            </Button>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={shuffle}>Trộn thẻ</Button>
              <Button variant="ghost" size="sm" onClick={() => { setIndex(0); setIsFlipped(false); }}>Xem lại</Button>
            </div>
            <Button variant="outline" size="sm" onClick={next} disabled={index === cards.length - 1}>
              Sau
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

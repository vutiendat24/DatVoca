import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTodayVocabulary, useUpdateSRS } from '../hooks/useVocabulary';
import { useTodaySentences, useUpdateSentenceSRS } from '../hooks/useSentence';
import { useTopics } from '../hooks/useTopics';
import { Difficulty, type Vocabulary, type Sentence } from '../types';
import { Select } from '../components/Input/Input';
import { EmptyState } from '../components/EmptyState/EmptyState';
import { LoadingPage } from '../components/Loading/Loading';
import { Flashcard } from '../components/Flashcard/Flashcard';

type StudyMode = 'word' | 'sentence';
type StudyCard = (Vocabulary & { type: 'word' }) | (Sentence & { type: 'sentence' });

export default function FlashcardsPage() {
  const location = useLocation();
  const [topicFilter, setTopicFilter] = useState('');
  const [studyMode, setStudyMode] = useState<StudyMode>(() => (location.state as any)?.mode || 'word');

  const { data: vocabData, isLoading: isLoadingVocab } = useTodayVocabulary();
  const { data: sentenceData, isLoading: isLoadingSentences } = useTodaySentences();
  const { data: topics } = useTopics();
  const updateVocabSRS = useUpdateSRS();
  const updateSentenceSRS = useUpdateSentenceSRS();

  const [cards, setCards] = useState<StudyCard[]>([]);
  const [index, setIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    let list: StudyCard[] = [];
    
    if (studyMode === 'word' && vocabData) {
      list = vocabData
        .filter((c) => !topicFilter || c.topicId === topicFilter)
        .sort((a, b) => {
          if (!a.nextReviewAt && b.nextReviewAt) return -1;
          if (a.nextReviewAt && !b.nextReviewAt) return 1;
          return 0;
        })
        .map(c => ({ ...c, type: 'word' }));
    } else if (studyMode === 'sentence' && sentenceData) {
      list = sentenceData
        .filter((c) => !topicFilter || c.topicId === topicFilter)
        .sort((a, b) => {
          if (!a.nextReviewAt && b.nextReviewAt) return -1;
          if (a.nextReviewAt && !b.nextReviewAt) return 1;
          return 0;
        })
        .map(c => ({ ...c, type: 'sentence' }));
    }
    
    setCards(list);
    setIndex(0);
    setIsFlipped(false);
  }, [vocabData, sentenceData, studyMode, topicFilter]);

  const current = cards[index];
  const progress = cards.length > 0 ? ((index + 1) / cards.length) * 100 : 0;

  const next = useCallback(() => {
    if (index < cards.length - 1) {
      setIndex((i) => i + 1);
      setIsFlipped(false);
    }
  }, [index, cards.length]);

  const prev = useCallback(() => {
    if (index > 0) {
      setIndex((i) => i - 1);
      setIsFlipped(false);
    }
  }, [index]);

  const handleDifficultySelect = async (d: Difficulty) => {
    if (!current) return;
    
    if (current.type === 'word') {
      await updateVocabSRS.mutateAsync({ id: current.id, difficulty: d });
    } else {
      await updateSentenceSRS.mutateAsync({ id: current.id, difficulty: d });
    }

    if (index < cards.length - 1) {
      next();
    } else {
      setIndex((prevIndex) => Math.min(prevIndex + 1, cards.length));
    }
  };

  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) return;
      if (e.key === 'ArrowLeft') prev();
      else if (e.key === 'ArrowRight') next();
      else if (e.key === '1') handleDifficultySelect(Difficulty.Easy);
      else if (e.key === '2') handleDifficultySelect(Difficulty.Medium);
      else if (e.key === '3') handleDifficultySelect(Difficulty.Hard);
      else if (e.key === '4') handleDifficultySelect(Difficulty.SuperHard);
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [prev, next, current, cards, index]);

  const topicOpts = [
    { value: '', label: 'Tất cả chủ đề' },
    ...(topics?.map((t) => ({ value: t.id, label: t.name })) ?? []),
  ];

  const handleAudio = useCallback(() => {
    if (current && 'speechSynthesis' in window) {
      const text = current.type === 'word' ? current.word : current.english;
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = 'en-US';
      window.speechSynthesis.speak(utter);
    }
  }, [current]);

  if (isLoadingVocab || isLoadingSentences) return <LoadingPage />;

  return (
    <div className="p-4 max-w-xl mx-auto flex flex-col gap-6">
      {/* Header Controls */}
      <div className="flex items-center justify-between gap-4">
        <Select
          options={topicOpts}
          className="max-w-[180px] text-sm"
          value={topicFilter}
          onChange={(e) => setTopicFilter(e.target.value)}
        />
        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          <button
            onClick={() => setStudyMode('word')}
            className={`px-4 py-1.5 text-sm rounded-md transition-colors ${
              studyMode === 'word'
                ? 'bg-white dark:bg-gray-700 shadow-sm font-medium'
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            Học từ
          </button>
          <button
            onClick={() => setStudyMode('sentence')}
            className={`px-4 py-1.5 text-sm rounded-md transition-colors ${
              studyMode === 'sentence'
                ? 'bg-white dark:bg-gray-700 shadow-sm font-medium'
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            Học câu
          </button>
        </div>
      </div>

      {!current ? (
        <EmptyState
          icon="🎉"
          title="Hoàn thành!"
          description="Không còn từ/câu nào cần ôn tập hôm nay."
        />
      ) : (
        <div className="flex flex-col gap-8">
          {/* Progress */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center text-xs text-gray-400">
              <span>{index + 1} / {cards.length}</span>
            </div>
            <div className="h-1 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                animate={{ width: `${progress}%` }}
                className="h-full bg-gray-900 dark:bg-gray-100"
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Flashcard Component */}
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <Flashcard
                isFlipped={isFlipped}
                onFlip={() => setIsFlipped((f) => !f)}
                onAudio={handleAudio}
                frontMain={current.type === 'word' ? current.word : current.english}
                frontSub={current.type === 'word' ? current.ipa : undefined}
                backMain={current.type === 'word' ? current.meaning : current.vietnamese}
                backSub={current.type === 'word' ? `${current.exampleEn} - ${current.exampleVi}` : undefined}
              />
            </motion.div>
          </AnimatePresence>

          {/* Controls */}
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-4 gap-3">
              <button
                onClick={() => handleDifficultySelect(Difficulty.Easy)}
                className="py-3 rounded-lg text-sm font-medium text-gray-500 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800/50 dark:hover:bg-gray-800 transition-colors"
              >
                1. Dễ
              </button>
              <button
                onClick={() => handleDifficultySelect(Difficulty.Medium)}
                className="py-3 rounded-lg text-sm font-medium text-gray-500 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800/50 dark:hover:bg-gray-800 transition-colors"
              >
                2. Vừa
              </button>
              <button
                onClick={() => handleDifficultySelect(Difficulty.Hard)}
                className="py-3 rounded-lg text-sm font-medium text-gray-500 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800/50 dark:hover:bg-gray-800 transition-colors"
              >
                3. Khó
              </button>
              <button
                onClick={() => handleDifficultySelect(Difficulty.SuperHard)}
                className="py-3 rounded-lg text-sm font-medium text-gray-500 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800/50 dark:hover:bg-gray-800 transition-colors"
              >
                4. Rất khó
              </button>
            </div>
            
            <div className="flex justify-center mt-2 text-xs text-gray-400 gap-6">
              <span>← Trước</span>
              <span>Space: Lật</span>
              <span>Sau →</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

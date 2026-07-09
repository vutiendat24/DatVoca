import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Grid, List, Search, Zap } from 'lucide-react';
import { useQuickReviewVocabulary } from '../hooks/useVocabulary';
import { Difficulty, type Vocabulary } from '../types';
import { DIFFICULTY_CONFIG } from '../constants';
import { Badge } from '../components/Badge/Badge';
import { Input } from '../components/Input/Input';
import { Button } from '../components/Button/Button';
import { EmptyState } from '../components/EmptyState/EmptyState';
import { LoadingPage } from '../components/Loading/Loading';
import { Modal } from '../components/Modal/Modal';
import { useNavigate } from 'react-router-dom';
import { useQuickReviewSentences } from '../hooks/useSentence';
import type { Sentence } from '../types';

const VocabGridCard: React.FC<{ vocab: Vocabulary; index: number }> = ({ vocab, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.05 }}
    className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
  >
    <div className="flex items-start justify-between mb-3">
      <Badge difficulty={vocab.difficulty} />
      {vocab.isLearned && <span className="text-xs font-semibold text-emerald-500">✓ Learned</span>}
    </div>
    <h3 className="text-xl font-extrabold text-gray-900 dark:text-white capitalize">{vocab.word}</h3>
    <p className="text-xs text-gray-400 font-mono mt-0.5">{vocab.ipa}</p>
    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">{vocab.meaning}</p>
    <div className="mt-3 pt-3 border-t border-gray-50 dark:border-gray-800">
      <p className="text-xs italic text-gray-500 dark:text-gray-400 line-clamp-2">"{vocab.exampleEn}"</p>
    </div>
    {vocab.topicName && (
      <div className="mt-3">
        <Badge variant="pink">{vocab.topicName}</Badge>
      </div>
    )}
  </motion.div>
);

const VocabListRow: React.FC<{ vocab: Vocabulary; index: number }> = ({ vocab, index }) => (
  <motion.div
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.04 }}
    className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow"
  >
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 ${DIFFICULTY_CONFIG[vocab.difficulty || Difficulty.Medium].bgClass} ${DIFFICULTY_CONFIG[vocab.difficulty || Difficulty.Medium].textClass}`}>
      {vocab.word.slice(0, 2).toUpperCase()}
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2">
        <h3 className="font-bold text-gray-900 dark:text-white capitalize">{vocab.word}</h3>
        <span className="text-xs text-gray-400 font-mono">{vocab.ipa}</span>
        {vocab.isLearned && <span className="text-xs text-emerald-500 font-semibold">✓</span>}
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{vocab.meaning}</p>
    </div>
    <Badge difficulty={vocab.difficulty} />
  </motion.div>
);

const SentenceGridCard: React.FC<{ sentence: Sentence; index: number }> = ({ sentence, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.05 }}
    className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
  >
    <div className="flex items-start justify-between mb-3">
      <Badge difficulty={sentence.difficulty} />
      {sentence.isLearned && <span className="text-xs font-semibold text-emerald-500">✓ Learned</span>}
    </div>
    <h3 className="text-lg font-extrabold text-gray-900 dark:text-white line-clamp-2">{sentence.english}</h3>
    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-3">{sentence.vietnamese}</p>
  </motion.div>
);

const SentenceListRow: React.FC<{ sentence: Sentence; index: number }> = ({ sentence, index }) => (
  <motion.div
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.04 }}
    className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow"
  >
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 ${DIFFICULTY_CONFIG[sentence.difficulty || Difficulty.Medium].bgClass} ${DIFFICULTY_CONFIG[sentence.difficulty || Difficulty.Medium].textClass}`}>
      {sentence.english.slice(0, 2).toUpperCase()}
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2">
        <h3 className="font-bold text-gray-900 dark:text-white line-clamp-1">{sentence.english}</h3>
        {sentence.isLearned && <span className="text-xs text-emerald-500 font-semibold">✓</span>}
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{sentence.vietnamese}</p>
    </div>
    <Badge difficulty={sentence.difficulty} />
  </motion.div>
);

export default function TodayPage() {
  const { data: words, isLoading: isLoadingWords } = useQuickReviewVocabulary();
  const { data: sentences, isLoading: isLoadingSentences } = useQuickReviewSentences();
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState<'words' | 'sentences'>('words');
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const navigate = useNavigate();

  const filteredWords = words?.filter(v =>
    !search || v.word.toLowerCase().includes(search.toLowerCase()) || v.meaning.toLowerCase().includes(search.toLowerCase()),
  ) ?? [];

  const filteredSentences = sentences?.filter(s =>
    !search || s.english.toLowerCase().includes(search.toLowerCase()) || s.vietnamese.toLowerCase().includes(search.toLowerCase()),
  ) ?? [];

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  if (isLoadingWords || isLoadingSentences) return <LoadingPage />;

  const currentDiffCounts = Object.values(Difficulty).reduce((acc, d) => ({
    ...acc,
    [d]: activeTab === 'words' 
      ? (words?.filter(v => v.difficulty === d).length ?? 0)
      : (sentences?.filter(s => s.difficulty === d).length ?? 0),
  }), {} as Record<Difficulty, number>);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">Today's Review</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{dateStr}</p>
          </div>
          <Button leftIcon={<Zap size={16} />} onClick={() => setReviewModalOpen(true)}>
            Quick Review
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          {Object.values(Difficulty).map(d => {
            const cfg = DIFFICULTY_CONFIG[d];
            return (
              <div key={d} className={`p-3 rounded-xl ${cfg.bgClass} border ${cfg.borderClass}`}>
                <p className={`text-2xl font-extrabold ${cfg.textClass}`}>{currentDiffCounts[d]}</p>
                <p className={`text-xs font-semibold ${cfg.textClass}`}>{cfg.label}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-center gap-3 mb-5">
        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('words')}
            className={`flex-1 sm:flex-none px-6 py-2 text-sm rounded-md transition-colors ${
              activeTab === 'words'
                ? 'bg-white dark:bg-gray-700 shadow-sm font-medium text-pink-500'
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            Từ vựng ({words?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('sentences')}
            className={`flex-1 sm:flex-none px-6 py-2 text-sm rounded-md transition-colors ${
              activeTab === 'sentences'
                ? 'bg-white dark:bg-gray-700 shadow-sm font-medium text-pink-500'
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            Mẫu câu ({sentences?.length || 0})
          </button>
        </div>

        <div className="flex-1 w-full">
          <Input placeholder="Tìm kiếm..." value={search} onChange={e => setSearch(e.target.value)} leftIcon={<Search size={16} />} />
        </div>
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl shrink-0">
          <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white dark:bg-gray-700 shadow-sm text-pink-500' : 'text-gray-500'}`}>
            <Grid size={16} />
          </button>
          <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-gray-700 shadow-sm text-pink-500' : 'text-gray-500'}`}>
            <List size={16} />
          </button>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'words' ? (
        !filteredWords.length ? (
          <EmptyState icon="📅" title="Không có từ vựng" description={search ? 'Không có từ nào khớp với tìm kiếm.' : 'Bạn đã ôn tập xong các từ vựng cho hôm nay.'} />
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredWords.map((v, i) => <VocabGridCard key={v.id} vocab={v} index={i} />)}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {filteredWords.map((v, i) => <VocabListRow key={v.id} vocab={v} index={i} />)}
          </div>
        )
      ) : (
        !filteredSentences.length ? (
          <EmptyState icon="📅" title="Không có câu" description={search ? 'Không có câu nào khớp với tìm kiếm.' : 'Bạn đã ôn tập xong các câu cho hôm nay.'} />
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSentences.map((s, i) => <SentenceGridCard key={s.id} sentence={s} index={i} />)}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {filteredSentences.map((s, i) => <SentenceListRow key={s.id} sentence={s} index={i} />)}
          </div>
        )
      )}

      {/* Modal Quick Review */}
      <Modal isOpen={reviewModalOpen} onClose={() => setReviewModalOpen(false)} title="Chọn chế độ ôn tập" size="sm">
        <div className="flex flex-col gap-3 mt-2">
          <Button onClick={() => navigate('/flashcards', { state: { mode: 'word', filter: 'today' } })} variant="outline" className="justify-center h-12 text-base">
            📚 Ôn tập Từ vựng
          </Button>
          <Button onClick={() => navigate('/flashcards', { state: { mode: 'sentence', filter: 'today' } })} variant="outline" className="justify-center h-12 text-base">
            💬 Ôn tập Mẫu câu
          </Button>
        </div>
      </Modal>
    </div>
  );
}

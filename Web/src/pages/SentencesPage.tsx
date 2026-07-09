import React, { useState, useEffect, useCallback, useMemo } from 'react';
// removed import
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Plus, Search, Edit2, Trash2, ArrowUpDown, CheckCircle2, Circle, Sparkles, Loader2 } from 'lucide-react';
import { aiApi } from '../api/ai.api';
import { useSentences, useCreateSentence, useUpdateSentence, useDeleteSentence, useMarkSentenceLearned } from '../hooks/useSentence';
import { useTopics } from '../hooks/useTopics';
import { Difficulty, type Sentence, type SentenceFilters } from '../types';
import { DIFFICULTY_CONFIG, DEFAULT_PAGE_SIZE } from '../constants';
import { Card } from '../components/Card/Card';
import { Button } from '../components/Button/Button';
import { Modal } from '../components/Modal/Modal';
import { Input, Textarea } from '../components/Input/Input';
import { Pagination } from '../components/Pagination/Pagination';
import { EmptyState } from '../components/EmptyState/EmptyState';
import { ConfirmDialog } from '../components/ConfirmDialog/ConfirmDialog';
import { SkeletonCard } from '../components/Loading/Loading';
import { Flashcard } from '../components/Flashcard/Flashcard';

// ─── Zod Schema ──────────────────────────────────────────────────────────────
const schema = z.object({
  english: z.string().min(1, 'English sentence is required'),
  vietnamese: z.string().min(1, 'Vietnamese translation is required'),
  topicId: z.string().optional(),
  difficulty: z.nativeEnum(Difficulty).optional(),
});
type FormData = z.infer<typeof schema>;

// ─── Sentence Form Modal ─────────────────────────────────────────────────────────
const SentenceFormModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  initialData?: Sentence;
}> = ({ isOpen, onClose, initialData }) => {
  const createMutation = useCreateSentence();
  const updateMutation = useUpdateSentence();
  const isEdit = !!initialData;

  const { register, handleSubmit, formState: { errors }, reset, getValues, setValue } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: initialData
      ? { english: initialData.english, vietnamese: initialData.vietnamese, topicId: initialData.topicId, difficulty: initialData.difficulty }
      : {},
  });

  React.useEffect(() => {
    if (isOpen && initialData) {
      reset({ english: initialData.english, vietnamese: initialData.vietnamese, topicId: initialData.topicId, difficulty: initialData.difficulty });
    } else if (!isOpen) {
      reset({ english: '', vietnamese: '', topicId: undefined, difficulty: undefined });
    }
  }, [isOpen, initialData, reset]);

  const onSubmit = handleSubmit(async (data) => {
    const payload = { ...data };
    if (payload.topicId === '') payload.topicId = undefined;

    if (isEdit) {
      await updateMutation.mutateAsync({ id: initialData.id, dto: payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
    onClose();
  });

  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    const en = getValues('english');
    const vi = getValues('vietnamese');
    
    if (!en && !vi) {
      alert('Vui lòng nhập Câu tiếng Anh hoặc tiếng Việt trước khi dịch tự động.');
      return;
    }
    
    try {
      setIsGenerating(true);
      if (en && !vi) {
        const trans = await aiApi.generateSentenceTranslation(en, 'vi');
        setValue('vietnamese', trans);
      } else if (vi && !en) {
        const trans = await aiApi.generateSentenceTranslation(vi, 'en');
        setValue('english', trans);
      } else {
         const trans = await aiApi.generateSentenceTranslation(en, 'vi');
         setValue('vietnamese', trans);
      }
    } catch (error: any) {
      alert(error.message || 'Lỗi khi dịch tự động.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Sửa Câu' : 'Thêm Câu Mới'}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Hủy</Button>
          <Button onClick={onSubmit} isLoading={createMutation.isPending || updateMutation.isPending}>
            {isEdit ? 'Lưu Thay Đổi' : 'Thêm Câu'}
          </Button>
        </>
      }
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-500">Nhập 1 trong 2 ô và bấm Dịch tự động</p>
          <Button 
            type="button" 
            variant="secondary" 
            onClick={handleGenerate} 
            disabled={isGenerating}
            leftIcon={isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} className="text-amber-500" />}
          >
            Dịch tự động
          </Button>
        </div>
        <Textarea label="Câu tiếng Anh *" placeholder="Câu tiếng Anh..." error={errors.english?.message} rows={3} {...register('english')} />
        <Textarea label="Dịch câu tiếng Việt *" placeholder="Bản dịch tiếng Việt..." error={errors.vietnamese?.message} rows={3} {...register('vietnamese')} />
      </form>
    </Modal>
  );
};

// ─── Sentence Row ────────────────────────────────────────────────────────────────
const SentenceRow: React.FC<{
  sentence: Sentence;
  onEdit: (s: Sentence) => void;
  onDelete: (s: Sentence) => void;
  onShowFlashcard: (s: Sentence) => void;
}> = ({ sentence, onEdit, onDelete, onShowFlashcard }) => {
  const markLearned = useMarkSentenceLearned();
  return (
    <motion.tr
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="group border-b border-gray-50 dark:border-gray-800/50 hover:bg-pink-50/40 dark:hover:bg-pink-900/10 transition-colors"
    >
      <td className="px-4 py-4">
        <button
          onClick={() => markLearned.mutate({ id: sentence.id, isLearned: !sentence.isLearned })}
          className="text-gray-300 hover:text-emerald-500 transition-colors"
        >
          {sentence.isLearned ? <CheckCircle2 size={20} className="text-emerald-500" /> : <Circle size={20} />}
        </button>
      </td>
      <td className="px-4 py-4 cursor-pointer" onClick={() => onShowFlashcard(sentence)}>
        <div className="flex flex-col gap-1">
          <p className="font-bold text-gray-900 dark:text-white group-hover:text-pink-500 transition-colors line-clamp-2">{sentence.english}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{sentence.vietnamese}</p>
        </div>
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(sentence)} className="p-2 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
            <Edit2 size={15} />
          </button>
          <button onClick={() => onDelete(sentence)} className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
            <Trash2 size={15} />
          </button>
        </div>
      </td>
    </motion.tr>
  );
};

export default function SentencesPage() {
  const [filters, setFilters] = useState<SentenceFilters>(() => ({
    page: 1,
    limit: DEFAULT_PAGE_SIZE,
  }));
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSentence, setEditingSentence] = useState<Sentence | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<Sentence | undefined>();
  const [flashcardSentence, setFlashcardSentence] = useState<Sentence | undefined>();
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    setFilters(f => ({ ...f, page: 1 }));
  }, []);

  const { data, isLoading } = useSentences(filters);
  const deleteMutation = useDeleteSentence();

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearch(val);
    setFilters(f => ({ ...f, search: val || undefined, page: 1 }));
  }, []);

  const handleEdit = (s: Sentence) => { setEditingSentence(s); setModalOpen(true); };
  const handleDelete = (s: Sentence) => setDeleteTarget(s);
  const handleCloseModal = () => { setModalOpen(false); setEditingSentence(undefined); };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">Sentences</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {data?.total ?? 0} sentences total
          </p>
        </div>
        <Button leftIcon={<Plus size={16} />} onClick={() => setModalOpen(true)}>
          Thêm Câu
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6" padding="md">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              placeholder="Tìm kiếm câu..."
              value={search}
              onChange={handleSearch}
              leftIcon={<Search size={16} />}
            />
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card padding="none" className="overflow-hidden">
        {isLoading ? (
          <div className="p-6 flex flex-col gap-3">
            {[...Array(5)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : !data?.data.length ? (
          <EmptyState
            icon="📚"
            title="Không tìm thấy câu nào"
            description="Hãy thêm câu mới hoặc thử điều chỉnh bộ lọc."
            action={<Button leftIcon={<Plus size={16} />} onClick={() => setModalOpen(true)}>Thêm Câu</Button>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
                  <th className="px-4 py-3 w-10" />
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-500">
                    <button className="flex items-center gap-1" onClick={() => setFilters(f => ({ ...f, sort: 'english', order: f.order === 'asc' ? 'desc' : 'asc' }))}>
                      Câu <ArrowUpDown size={12} />
                    </button>
                  </th>
                  <th className="px-4 py-3 w-20" />
                </tr>
              </thead>
              <tbody>
                {data.data.map(s => (
                  <SentenceRow key={s.id} sentence={s} onEdit={handleEdit} onDelete={handleDelete} onShowFlashcard={(s) => { setFlashcardSentence(s); setIsFlipped(false); }} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {data && <Pagination page={data.page} totalPages={data.totalPages} onPageChange={p => setFilters(f => ({ ...f, page: p }))} />}

      {/* Modals */}
      <SentenceFormModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        initialData={editingSentence}
      />
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(undefined)}
        onConfirm={async () => {
          if (deleteTarget) {
            await deleteMutation.mutateAsync(deleteTarget.id);
            setDeleteTarget(undefined);
          }
        }}
        title="Xóa câu"
        message={`Bạn có chắc muốn xóa câu này không?`}
        isLoading={deleteMutation.isPending}
      />
      <Modal
        isOpen={!!flashcardSentence}
        onClose={() => setFlashcardSentence(undefined)}
        title="Học câu"
        size="md"
      >
        {flashcardSentence && (
          <Flashcard
            isFlipped={isFlipped}
            onFlip={() => setIsFlipped(f => !f)}
            onAudio={() => {
              if ('speechSynthesis' in window) {
                const utter = new SpeechSynthesisUtterance(flashcardSentence.english);
                utter.lang = 'en-US';
                window.speechSynthesis.speak(utter);
              }
            }}
            frontMain={flashcardSentence.english}
            backMain={flashcardSentence.vietnamese}
          />
        )}
      </Modal>
    </div>
  );
}

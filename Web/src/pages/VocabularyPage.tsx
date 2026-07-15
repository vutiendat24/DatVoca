import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Plus, Search, Edit2, Trash2, ArrowUpDown, CheckCircle2, Circle, Sparkles, Loader2, FolderPlus } from 'lucide-react';
import { useVocabulary, useCreateVocabulary, useUpdateVocabulary, useDeleteVocabulary, useMarkLearned } from '../hooks/useVocabulary';
import { aiApi } from '../api/ai.api';
import { useTopics } from '../hooks/useTopics';
import { Difficulty, type Vocabulary, type VocabularyFilters } from '../types';
import { DIFFICULTY_CONFIG, DEFAULT_PAGE_SIZE } from '../constants';
import { Card } from '../components/Card/Card';
import { Button } from '../components/Button/Button';
import { Modal } from '../components/Modal/Modal';
import { Flashcard } from '../components/Flashcard/Flashcard';
import { Input, Select, Textarea } from '../components/Input/Input';
import { Badge } from '../components/Badge/Badge';
import { Pagination } from '../components/Pagination/Pagination';
import { EmptyState } from '../components/EmptyState/EmptyState';
import { ConfirmDialog } from '../components/ConfirmDialog/ConfirmDialog';
import { SkeletonCard } from '../components/Loading/Loading';

// ─── Zod Schema ──────────────────────────────────────────────────────────────
const schema = z.object({
  word: z.string().min(1, 'Word is required'),
  ipa: z.string().min(1, 'IPA is required'),
  meaning: z.string().min(1, 'Meaning is required'),
  exampleEn: z.string().min(1, 'English example is required'),
  exampleVi: z.string().min(1, 'Vietnamese translation is required'),
  topicId: z.string().optional(),
  difficulty: z.nativeEnum(Difficulty).optional(),
});
type FormData = z.infer<typeof schema>;

// ─── Vocab Form Modal ─────────────────────────────────────────────────────────
const VocabFormModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  initialData?: Vocabulary;
  defaultTopicId?: string;
  topicOptions: { value: string; label: string }[];
}> = ({ isOpen, onClose, initialData, defaultTopicId, topicOptions }) => {
  const createMutation = useCreateVocabulary();
  const updateMutation = useUpdateVocabulary();
  const isEdit = !!initialData;

  const { register, handleSubmit, formState: { errors }, reset, getValues, setValue } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: initialData
      ? { word: initialData.word, ipa: initialData.ipa, meaning: initialData.meaning, exampleEn: initialData.exampleEn, exampleVi: initialData.exampleVi, topicId: initialData.topicId, difficulty: initialData.difficulty }
      : { difficulty: Difficulty.Medium },
  });

  React.useEffect(() => {
    if (isOpen && initialData) {
      reset({ word: initialData.word, ipa: initialData.ipa, meaning: initialData.meaning, exampleEn: initialData.exampleEn, exampleVi: initialData.exampleVi, topicId: initialData.topicId, difficulty: initialData.difficulty });
    } else if (isOpen && !initialData) {
      reset({ difficulty: Difficulty.Medium, topicId: defaultTopicId });
    } else if (!isOpen) {
      reset({ difficulty: Difficulty.Medium });
    }
  }, [isOpen, initialData, defaultTopicId, reset]);

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
    const word = getValues('word');
    if (!word) {
      alert('Vui lòng nhập Từ tiếng Anh trước khi tạo tự động.');
      return;
    }
    
    try {
      setIsGenerating(true);
      const data = await aiApi.generateVocabulary(word);
      setValue('ipa', data.ipa);
      setValue('meaning', data.meaning);
      setValue('exampleEn', data.exampleEn);
      setValue('exampleVi', data.exampleVi);
    } catch (error: any) {
      alert(error.message || 'Lỗi khi tạo tự động.');
    } finally {
      setIsGenerating(false);
    }
  };


  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Vocabulary' : 'Add New Vocabulary'}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={onSubmit} isLoading={createMutation.isPending || updateMutation.isPending}>
            {isEdit ? 'Save Changes' : 'Add Word'}
          </Button>
        </>
      }
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <Input label="Từ tiếng Anh *" placeholder="Ví dụ: ephemeral" error={errors.word?.message} {...register('word')} />
          </div>
          <Button 
            type="button" 
            variant="secondary" 
            onClick={handleGenerate} 
            disabled={isGenerating}
            leftIcon={isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} className="text-amber-500" />}
          >
            Generate
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Phát âm (IPA) *" placeholder="Ví dụ: /ɪˈfem.ər.əl/" error={errors.ipa?.message} {...register('ipa')} />
          <Select label="Chủ đề (Topic)" options={[{ value: '', label: 'Không có chủ đề' }, ...topicOptions]} error={errors.topicId?.message} {...register('topicId')} />
        </div>
        <Textarea label="Nghĩa tiếng Việt *" placeholder="Nghĩa của từ tiếng Anh..." error={errors.meaning?.message} rows={2} {...register('meaning')} />
        <Textarea label="Câu ví dụ (Tiếng Anh) *" placeholder="Câu ví dụ..." error={errors.exampleEn?.message} rows={2} {...register('exampleEn')} />
        <Textarea label="Dịch câu ví dụ *" placeholder="Bản dịch của câu ví dụ..." error={errors.exampleVi?.message} rows={2} {...register('exampleVi')} />
       
      </form>
    </Modal>
  );
};

// ─── Vocab Row ────────────────────────────────────────────────────────────────
const VocabRow: React.FC<{
  vocab: Vocabulary;
  onEdit: (v: Vocabulary) => void;
  onDelete: (v: Vocabulary) => void;
  onShowFlashcard: (v: Vocabulary) => void;
  onAssignTopic: (v: Vocabulary) => void;
}> = ({ vocab, onEdit, onDelete, onShowFlashcard, onAssignTopic }) => {
  const markLearned = useMarkLearned();
  return (
    <motion.tr
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="group border-b border-gray-50 dark:border-gray-800/50 hover:bg-pink-50/40 dark:hover:bg-pink-900/10 transition-colors"
    >
      <td className="px-4 py-4">
        <button
          onClick={() => markLearned.mutate({ id: vocab.id, isLearned: !vocab.isLearned })}
          className="text-gray-300 hover:text-emerald-500 transition-colors"
        >
          {vocab.isLearned ? <CheckCircle2 size={20} className="text-emerald-500" /> : <Circle size={20} />}
        </button>
      </td>
      <td className="px-4 py-4 cursor-pointer" onClick={() => onShowFlashcard(vocab)}>
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-900 dark:text-white group-hover:text-pink-500 transition-colors truncate">{vocab.word}</p>
            <p className="text-xs text-gray-400 font-mono truncate">{vocab.ipa}</p>
          </div>
          <div className="flex-1 min-w-0 text-right sm:hidden">
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{vocab.meaning}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-4 max-w-xs hidden sm:table-cell">
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{vocab.meaning}</p>
      </td>
      <td className="px-4 py-4 hidden md:table-cell">
        {vocab.topicName && <Badge variant="pink">{vocab.topicName}</Badge>}
      </td>
      <td className="px-4 py-4 hidden sm:table-cell">
        <Badge difficulty={vocab.difficulty} />
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          <button onClick={(e) => { e.stopPropagation(); onAssignTopic(vocab); }} className="p-2 rounded-lg text-gray-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors" title="Add to Topic">
            <FolderPlus size={15} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onEdit(vocab); }} className="p-2 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors" title="Edit">
            <Edit2 size={15} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(vocab); }} className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title="Delete">
            <Trash2 size={15} />
          </button>
        </div>
      </td>
    </motion.tr>
  );
};

const SelectTopicModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  vocab?: Vocabulary;
  topicOptions: { value: string; label: string }[];
}> = ({ isOpen, onClose, vocab, topicOptions }) => {
  const [selectedTopicId, setSelectedTopicId] = useState<string>('');
  const updateMutation = useUpdateVocabulary();

  React.useEffect(() => {
    if (isOpen) setSelectedTopicId(vocab?.topicId || '');
  }, [isOpen, vocab]);

  const handleAssign = async () => {
    if (!vocab) return;
    const topicId = selectedTopicId === '' ? undefined : selectedTopicId;
    await updateMutation.mutateAsync({ id: vocab.id, dto: { topicId } as any });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Assign to Topic" size="sm" footer={<>
      <Button variant="ghost" onClick={onClose}>Cancel</Button>
      <Button onClick={handleAssign} isLoading={updateMutation.isPending}>Save</Button>
    </>}>
      <p className="text-sm text-gray-500 mb-4">Select a topic for <strong className="text-gray-900 dark:text-white">{vocab?.word}</strong>:</p>
      <Select 
        options={[{ value: '', label: 'None' }, ...topicOptions]} 
        value={selectedTopicId} 
        onChange={(e) => setSelectedTopicId(e.target.value)} 
      />
    </Modal>
  );
};

const AssignWordsModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  topicId: string;
}> = ({ isOpen, onClose, topicId }) => {
  const { data, isLoading } = useVocabulary({ limit: 1000 });
  const updateMutation = useUpdateVocabulary();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');

  React.useEffect(() => {
    if (isOpen) {
      setSelectedIds(new Set());
      setSearch('');
    }
  }, [isOpen]);

  const wordsNotInTopic = React.useMemo(() => {
    return (data?.data || [])
      .filter(v => v.topicId !== topicId)
      .filter(v => search ? v.word.toLowerCase().includes(search.toLowerCase()) || v.meaning.toLowerCase().includes(search.toLowerCase()) : true);
  }, [data, topicId, search]);

  const handleToggle = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const handleAssign = async () => {
    const promises = Array.from(selectedIds).map(id => updateMutation.mutateAsync({ id, dto: { topicId } as any }));
    await Promise.all(promises);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Existing Words to Topic" size="md" footer={<>
      <Button variant="ghost" onClick={onClose}>Cancel</Button>
      <Button onClick={handleAssign} isLoading={updateMutation.isPending} disabled={selectedIds.size === 0}>
        Add {selectedIds.size} words
      </Button>
    </>}>
      {isLoading ? <div className="p-4 text-center">Loading...</div> : (
        <div className="flex flex-col gap-4">
          <Input 
            placeholder="Search words..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            leftIcon={<Search size={16} />} 
          />
          <div className="max-h-[40vh] overflow-y-auto flex flex-col gap-2 border border-gray-100 dark:border-gray-800 rounded-xl p-2 bg-gray-50/50 dark:bg-gray-900/50">
            {wordsNotInTopic.length === 0 ? <p className="text-gray-500 text-center p-4">No words found.</p> : null}
            {wordsNotInTopic.map(v => (
              <label key={v.id} className="flex items-center gap-3 p-3 border border-transparent hover:border-pink-200 dark:hover:border-pink-900/50 rounded-lg cursor-pointer hover:bg-white dark:hover:bg-gray-800 transition-colors">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-pink-500 focus:ring-pink-500" checked={selectedIds.has(v.id)} onChange={() => handleToggle(v.id)} />
                <div className="flex-1">
                  <p className="font-bold text-gray-900 dark:text-white">{v.word}</p>
                  <p className="text-xs text-gray-500">{v.meaning}</p>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}
    </Modal>
  );
};

export default function VocabularyPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const topicIdParam = searchParams.get('topicId') || '';

  const [filters, setFilters] = useState<VocabularyFilters>(() => ({
    page: 1,
    limit: DEFAULT_PAGE_SIZE,
    topicId: topicIdParam || undefined,
  }));
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVocab, setEditingVocab] = useState<Vocabulary | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<Vocabulary | undefined>();
  const [flashcardVocab, setFlashcardVocab] = useState<Vocabulary | undefined>();
  const [assignTopicVocab, setAssignTopicVocab] = useState<Vocabulary | undefined>();
  const [assignWordsModalOpen, setAssignWordsModalOpen] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    setFilters(f => ({ ...f, topicId: topicIdParam || undefined, page: 1 }));
  }, [topicIdParam]);

  const { data, isLoading } = useVocabulary(filters);
  const { data: topics } = useTopics();
  const deleteMutation = useDeleteVocabulary();

  const topicOptions = useMemo(() =>
    topics?.map(t => ({ value: t.id, label: t.name })) ?? [], [topics]);

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearch(val);
    setFilters(f => ({ ...f, search: val || undefined, page: 1 }));
  }, []);

  const handleEdit = (v: Vocabulary) => { setEditingVocab(v); setModalOpen(true); };
  const handleDelete = (v: Vocabulary) => setDeleteTarget(v);
  const handleCloseModal = () => { setModalOpen(false); setEditingVocab(undefined); };

  const topicFilterOpts = [{ value: '', label: 'All Topics' }, ...(topicOptions)];
  const diffFilterOpts = [
    { value: '', label: 'All Difficulties' },
    ...Object.values(Difficulty).map(d => ({ value: d, label: DIFFICULTY_CONFIG[d].label })),
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">Vocabulary</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {data?.total ?? 0} words total
          </p>
        </div>
        <div className="flex items-center gap-3">
          {topicIdParam && (
            <Button variant="secondary" leftIcon={<FolderPlus size={16} />} onClick={() => setAssignWordsModalOpen(true)}>
              Add Existing Words
            </Button>
          )}
          <Button leftIcon={<Plus size={16} />} onClick={() => setModalOpen(true)}>
            Add Word
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6" padding="md">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              placeholder="Search word, meaning…"
              value={search}
              onChange={handleSearch}
              leftIcon={<Search size={16} />}
            />
          </div>
          <div className="flex gap-3">
            <Select
              options={topicFilterOpts}
              className="min-w-[140px]"
              value={filters.topicId || ''}
              onChange={e => {
                const val = e.target.value;
                setFilters(f => ({ ...f, topicId: val || undefined, page: 1 }));
                if (val) setSearchParams({ topicId: val });
                else setSearchParams({});
              }}
            />
            <Select
              options={diffFilterOpts}
              className="min-w-[150px]"
              onChange={e => setFilters(f => ({ ...f, difficulty: e.target.value as Difficulty || undefined, page: 1 }))}
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
            title="No vocabulary found"
            description="Add your first word or try adjusting filters."
            action={<Button leftIcon={<Plus size={16} />} onClick={() => setModalOpen(true)}>Add Word</Button>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
                  <th className="px-4 py-3 w-10" />
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-500">
                    <button className="flex items-center gap-1" onClick={() => setFilters(f => ({ ...f, sort: 'word', order: f.order === 'asc' ? 'desc' : 'asc' }))}>
                      Word <ArrowUpDown size={12} />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-500 hidden sm:table-cell">Meaning</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-500 hidden md:table-cell">Topic</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-500 hidden sm:table-cell">Level</th>
                  <th className="px-4 py-3 w-20" />
                </tr>
              </thead>
              <tbody>
                {data.data.map(v => (
                  <VocabRow key={v.id} vocab={v} onEdit={handleEdit} onDelete={handleDelete} onShowFlashcard={(v) => { setFlashcardVocab(v); setIsFlipped(false); }} onAssignTopic={setAssignTopicVocab} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {data && <Pagination page={data.page} totalPages={data.totalPages} onPageChange={p => setFilters(f => ({ ...f, page: p }))} />}

      {/* Modals */}
      <VocabFormModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        initialData={editingVocab}
        defaultTopicId={topicIdParam || undefined}
        topicOptions={topicOptions}
      />
      <SelectTopicModal 
        isOpen={!!assignTopicVocab}
        onClose={() => setAssignTopicVocab(undefined)}
        vocab={assignTopicVocab}
        topicOptions={topicOptions}
      />
      {topicIdParam && (
        <AssignWordsModal 
          isOpen={assignWordsModalOpen}
          onClose={() => setAssignWordsModalOpen(false)}
          topicId={topicIdParam}
        />
      )}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(undefined)}
        onConfirm={async () => {
          if (deleteTarget) {
            await deleteMutation.mutateAsync(deleteTarget.id);
            setDeleteTarget(undefined);
          }
        }}
        title="Delete Vocabulary"
        message={`Remove "${deleteTarget?.word}" from your collection?`}
        isLoading={deleteMutation.isPending}
      />
      <Modal
        isOpen={!!flashcardVocab}
        onClose={() => setFlashcardVocab(undefined)}
        title="Học từ"
        size="md"
      >
        {flashcardVocab && (
          <Flashcard
            isFlipped={isFlipped}
            onFlip={() => setIsFlipped(f => !f)}
            onAudio={() => {
              if ('speechSynthesis' in window) {
                const utter = new SpeechSynthesisUtterance(flashcardVocab.word);
                utter.lang = 'en-US';
                window.speechSynthesis.speak(utter);
              }
            }}
            frontMain={flashcardVocab.word}
            frontSub={flashcardVocab.ipa}
            backMain={flashcardVocab.meaning}
            backSub={flashcardVocab.exampleEn}
          />
        )}
      </Modal>
    </div>
  );
}

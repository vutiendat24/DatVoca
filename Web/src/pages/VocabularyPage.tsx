import React, { useState, useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Plus, Search, Edit2, Trash2, ArrowUpDown, CheckCircle2, Circle } from 'lucide-react';
import { useVocabulary, useCreateVocabulary, useUpdateVocabulary, useDeleteVocabulary, useMarkLearned } from '../hooks/useVocabulary';
import { useTopics } from '../hooks/useTopics';
import { Difficulty, type Vocabulary, type VocabularyFilters } from '../types';
import { DIFFICULTY_CONFIG, DEFAULT_PAGE_SIZE } from '../constants';
import { Card } from '../components/Card/Card';
import { Button } from '../components/Button/Button';
import { Modal } from '../components/Modal/Modal';
import { Input, Select, Textarea } from '../components/Input/Input';
import { Badge } from '../components/Badge/Badge';
import { Pagination } from '../components/Pagination/Pagination';
import { EmptyState } from '../components/EmptyState/EmptyState';
import { ConfirmDialog } from '../components/ConfirmDialog/ConfirmDialog';
import { LoadingPage, SkeletonCard } from '../components/Loading/Loading';

// ─── Zod Schema ──────────────────────────────────────────────────────────────
const schema = z.object({
  word: z.string().min(1, 'Word is required'),
  ipa: z.string().min(1, 'IPA is required'),
  meaning: z.string().min(1, 'Meaning is required'),
  exampleEn: z.string().min(1, 'English example is required'),
  exampleVi: z.string().min(1, 'Vietnamese translation is required'),
  topicId: z.string().min(1, 'Topic is required'),
  difficulty: z.nativeEnum(Difficulty),
});
type FormData = z.infer<typeof schema>;

// ─── Vocab Form Modal ─────────────────────────────────────────────────────────
const VocabFormModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  initialData?: Vocabulary;
  topicOptions: { value: string; label: string }[];
}> = ({ isOpen, onClose, initialData, topicOptions }) => {
  const createMutation = useCreateVocabulary();
  const updateMutation = useUpdateVocabulary();
  const isEdit = !!initialData;

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: initialData
      ? { word: initialData.word, ipa: initialData.ipa, meaning: initialData.meaning, exampleEn: initialData.exampleEn, exampleVi: initialData.exampleVi, topicId: initialData.topicId, difficulty: initialData.difficulty }
      : { difficulty: Difficulty.Medium },
  });

  React.useEffect(() => {
    if (isOpen && initialData) {
      reset({ word: initialData.word, ipa: initialData.ipa, meaning: initialData.meaning, exampleEn: initialData.exampleEn, exampleVi: initialData.exampleVi, topicId: initialData.topicId, difficulty: initialData.difficulty });
    } else if (!isOpen) {
      reset({ difficulty: Difficulty.Medium });
    }
  }, [isOpen, initialData, reset]);

  const onSubmit = handleSubmit(async (data) => {
    if (isEdit) {
      await updateMutation.mutateAsync({ id: initialData.id, dto: data });
    } else {
      await createMutation.mutateAsync(data);
    }
    onClose();
  });

  const diffOpts = Object.values(Difficulty).map(d => ({ value: d, label: DIFFICULTY_CONFIG[d].label }));

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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="English Word *" placeholder="e.g. ephemeral" error={errors.word?.message} {...register('word')} />
          <Input label="IPA Pronunciation *" placeholder="e.g. /ɪˈfem.ər.əl/" error={errors.ipa?.message} {...register('ipa')} />
        </div>
        <Textarea label="Meaning *" placeholder="Definition in English..." error={errors.meaning?.message} rows={2} {...register('meaning')} />
        <Textarea label="English Example *" placeholder="Example sentence..." error={errors.exampleEn?.message} rows={2} {...register('exampleEn')} />
        <Textarea label="Vietnamese Translation *" placeholder="Bản dịch tiếng Việt..." error={errors.exampleVi?.message} rows={2} {...register('exampleVi')} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select label="Topic *" options={topicOptions} placeholder="Select topic" error={errors.topicId?.message} {...register('topicId')} />
          <Select label="Difficulty *" options={diffOpts} error={errors.difficulty?.message} {...register('difficulty')} />
        </div>
      </form>
    </Modal>
  );
};

// ─── Vocab Row ────────────────────────────────────────────────────────────────
const VocabRow: React.FC<{
  vocab: Vocabulary;
  onEdit: (v: Vocabulary) => void;
  onDelete: (v: Vocabulary) => void;
}> = ({ vocab, onEdit, onDelete }) => {
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
      <td className="px-4 py-4">
        <div>
          <p className="font-bold text-gray-900 dark:text-white">{vocab.word}</p>
          <p className="text-xs text-gray-400 font-mono">{vocab.ipa}</p>
        </div>
      </td>
      <td className="px-4 py-4 max-w-xs hidden sm:table-cell">
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{vocab.meaning}</p>
      </td>
      <td className="px-4 py-4 hidden md:table-cell">
        {vocab.topicName && <Badge variant="pink">{vocab.topicName}</Badge>}
      </td>
      <td className="px-4 py-4">
        <Badge difficulty={vocab.difficulty} />
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(vocab)} className="p-2 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
            <Edit2 size={15} />
          </button>
          <button onClick={() => onDelete(vocab)} className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
            <Trash2 size={15} />
          </button>
        </div>
      </td>
    </motion.tr>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function VocabularyPage() {
  const [filters, setFilters] = useState<VocabularyFilters>({ page: 1, limit: DEFAULT_PAGE_SIZE });
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVocab, setEditingVocab] = useState<Vocabulary | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<Vocabulary | undefined>();

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
        <Button leftIcon={<Plus size={16} />} onClick={() => setModalOpen(true)}>
          Add Word
        </Button>
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
              onChange={e => setFilters(f => ({ ...f, topicId: e.target.value || undefined, page: 1 }))}
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
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-500">Level</th>
                  <th className="px-4 py-3 w-20" />
                </tr>
              </thead>
              <tbody>
                {data.data.map(v => (
                  <VocabRow key={v.id} vocab={v} onEdit={handleEdit} onDelete={handleDelete} />
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
        topicOptions={topicOptions}
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
        title="Delete Vocabulary"
        message={`Remove "${deleteTarget?.word}" from your collection?`}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}

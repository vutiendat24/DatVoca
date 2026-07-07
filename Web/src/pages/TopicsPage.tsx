import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, BookOpen, ChevronRight } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTopics, useCreateTopic, useUpdateTopic, useDeleteTopic } from '../hooks/useTopics';
import { useVocabularyByTopic } from '../hooks/useVocabulary';
import type { Topic } from '../types';
import { TOPIC_COLORS, TOPIC_ICONS } from '../constants';
import { Button } from '../components/Button/Button';
import { Modal } from '../components/Modal/Modal';
import { Input, Textarea } from '../components/Input/Input';
import { ConfirmDialog } from '../components/ConfirmDialog/ConfirmDialog';
import { EmptyState } from '../components/EmptyState/EmptyState';
import { LoadingPage } from '../components/Loading/Loading';
import { Badge } from '../components/Badge/Badge';

const schema = z.object({ name: z.string().min(1), description: z.string().min(1) });
type FormData = z.infer<typeof schema>;

const TopicVocabPanel: React.FC<{ topic: Topic; onClose: () => void }> = ({ topic, onClose }) => {
  const { data: vocabs } = useVocabularyByTopic(topic.id);
  return (
    <div className="py-2">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span style={{ color: topic.color }}>{topic.icon}</span> {topic.name}
          <Badge variant="pink">{vocabs?.length ?? 0} words</Badge>
        </h3>
        <button onClick={onClose} className="text-sm text-gray-400 hover:text-gray-600 transition-colors">Close</button>
      </div>
      {!vocabs?.length ? (
        <p className="text-sm text-gray-400 text-center py-8">No vocabulary in this topic yet.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {vocabs.map(v => (
            <div key={v.id} className="flex items-start justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
              <div>
                <p className="font-semibold text-gray-900 dark:text-white text-sm">{v.word}</p>
                <p className="text-xs text-gray-400 font-mono">{v.ipa}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">{v.meaning}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const TopicFormModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  initialData?: Topic;
}> = ({ isOpen, onClose, initialData }) => {
  const createMutation = useCreateTopic();
  const updateMutation = useUpdateTopic();
  const [color, setColor] = useState(initialData?.color ?? TOPIC_COLORS[0]);
  const [icon, setIcon] = useState(initialData?.icon ?? TOPIC_ICONS[0]);
  const isEdit = !!initialData;

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: initialData ? { name: initialData.name, description: initialData.description } : {},
  });

  React.useEffect(() => {
    if (isOpen && initialData) { reset({ name: initialData.name, description: initialData.description }); setColor(initialData.color); setIcon(initialData.icon); }
    else if (!isOpen) { reset(); setColor(TOPIC_COLORS[0]); setIcon(TOPIC_ICONS[0]); }
  }, [isOpen, initialData, reset]);

  const onSubmit = handleSubmit(async (data) => {
    const dto = { ...data, color, icon };
    if (isEdit) await updateMutation.mutateAsync({ id: initialData.id, dto });
    else await createMutation.mutateAsync(dto);
    onClose();
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit Topic' : 'Create Topic'} size="md"
      footer={<>
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button onClick={onSubmit} isLoading={createMutation.isPending || updateMutation.isPending}>
          {isEdit ? 'Save' : 'Create'}
        </Button>
      </>}
    >
      <form className="flex flex-col gap-4">
        <Input label="Topic Name *" placeholder="e.g. Travel" error={errors.name?.message} {...register('name')} />
        <Textarea label="Description *" placeholder="Brief description..." error={errors.description?.message} rows={2} {...register('description')} />

        <div>
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">Color</label>
          <div className="flex gap-2 flex-wrap">
            {TOPIC_COLORS.map(c => (
              <button key={c} type="button" onClick={() => setColor(c)}
                className={`w-8 h-8 rounded-full transition-transform ${color === c ? 'ring-2 ring-offset-2 ring-gray-900 scale-110' : 'hover:scale-105'}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">Icon</label>
          <div className="flex gap-2 flex-wrap">
            {TOPIC_ICONS.map(ic => (
              <button key={ic} type="button" onClick={() => setIcon(ic)}
                className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${icon === ic ? 'bg-pink-100 ring-2 ring-pink-400' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
              >
                {ic}
              </button>
            ))}
          </div>
        </div>

        {/* Preview */}
        <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ backgroundColor: `${color}20` }}>{icon}</div>
          <div>
            <p className="font-bold text-sm text-gray-900 dark:text-white">Preview</p>
            <p className="text-xs text-gray-500" style={{ color }}>Topic color</p>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default function TopicsPage() {
  const { data: topics, isLoading } = useTopics();
  const deleteMutation = useDeleteTopic();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<Topic | undefined>();
  const [expandedTopic, setExpandedTopic] = useState<Topic | undefined>();

  if (isLoading) return <LoadingPage />;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">Topics</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{topics?.length ?? 0} categories</p>
        </div>
        <Button leftIcon={<Plus size={16} />} onClick={() => setModalOpen(true)}>New Topic</Button>
      </div>

      {!topics?.length ? (
        <EmptyState icon="🏷️" title="No topics yet" description="Create a topic to organize your vocabulary."
          action={<Button leftIcon={<Plus size={16} />} onClick={() => setModalOpen(true)}>Create Topic</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {topics.map((topic, i) => (
            <motion.div
              key={topic.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="group bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden"
            >
              {/* Color bar */}
              <div className="h-2 w-full" style={{ backgroundColor: topic.color }} />

              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl" style={{ backgroundColor: `${topic.color}20` }}>
                    {topic.icon}
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setEditingTopic(topic); setModalOpen(true); }} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => setDeleteTarget(topic)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <h3 className="font-bold text-gray-900 dark:text-white text-base mb-1">{topic.name}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">{topic.description}</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                    <BookOpen size={14} />
                    <span className="text-xs font-semibold">{topic.vocabularyCount} words</span>
                  </div>
                  <button
                    onClick={() => setExpandedTopic(expandedTopic?.id === topic.id ? undefined : topic)}
                    className="flex items-center gap-1 text-xs font-semibold transition-colors"
                    style={{ color: topic.color }}
                  >
                    View words
                    <ChevronRight size={14} className={`transition-transform ${expandedTopic?.id === topic.id ? 'rotate-90' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Expanded vocab list */}
              {expandedTopic?.id === topic.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-gray-100 dark:border-gray-800 px-5 pb-4 max-h-64 overflow-y-auto"
                >
                  <TopicVocabPanel topic={topic} onClose={() => setExpandedTopic(undefined)} />
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      <TopicFormModal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditingTopic(undefined); }} initialData={editingTopic} />
      <ConfirmDialog
        isOpen={!!deleteTarget} onClose={() => setDeleteTarget(undefined)}
        onConfirm={async () => { if (deleteTarget) { await deleteMutation.mutateAsync(deleteTarget.id); setDeleteTarget(undefined); } }}
        title="Delete Topic" message={`Remove topic "${deleteTarget?.name}"?`}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}

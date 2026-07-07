import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Plus, Edit2, Trash2, Eye, EyeOff, Clock, BookOpen, ChevronDown, ChevronUp,
  Sparkles, CheckCircle2, XCircle,
} from 'lucide-react';
import { useReadings, useCreateReading, useUpdateReading, useDeleteReading, useGenerateReading } from '../hooks/useReadings';
import { useTopics } from '../hooks/useTopics';
import { ReadingDifficulty, type Reading, type CreateReadingDTO } from '../types';
import { READING_DIFFICULTY_CONFIG } from '../constants';
import { Button } from '../components/Button/Button';
import { Modal } from '../components/Modal/Modal';
import { Input, Select, Textarea } from '../components/Input/Input';
import { Badge } from '../components/Badge/Badge';
import { ConfirmDialog } from '../components/ConfirmDialog/ConfirmDialog';
import { EmptyState } from '../components/EmptyState/EmptyState';
import { LoadingPage } from '../components/Loading/Loading';
import { toast } from '../components/Toast/Toast';

// ─── Schemas ──────────────────────────────────────────────────────────────────
const questionSchema = z.object({
  question: z.string().min(1, 'Question required'),
  choices: z.array(z.string().min(1, 'Choice required')).length(4),
  correctAnswer: z.number().min(0).max(3),
  explanation: z.string().min(1, 'Explanation required'),
});

const readingSchema = z.object({
  title: z.string().min(1, 'Title required'),
  topicId: z.string().min(1, 'Topic required'),
  paragraph: z.string().min(50, 'Paragraph must be at least 50 characters'),
  translation: z.string().min(1, 'Translation required'),
  difficulty: z.nativeEnum(ReadingDifficulty),
  estimatedMinutes: z.number().min(1).max(60),
  vocabularyHighlights: z.string(),
  questions: z.array(questionSchema).min(1, 'At least 1 question required'),
});

type ReadingFormData = z.infer<typeof readingSchema>;

// ─── AI Generator ─────────────────────────────────────────────────────────────
const AIGeneratorModal: React.FC<{ onFill: (data: Partial<ReadingFormData>) => void }> = ({ onFill }) => {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const generateMutation = useGenerateReading();

  const handleGenerate = async () => {
    if (!prompt.trim()) { toast.error('Please enter a prompt.'); return; }
    const result = await generateMutation.mutateAsync({ prompt });
    onFill({
      title: result.title, paragraph: result.paragraph, translation: result.translation,
      difficulty: result.difficulty, estimatedMinutes: result.estimatedMinutes,
      vocabularyHighlights: result.vocabularyHighlights.join(', '),
      questions: result.questions,
    });
    setOpen(false);
    toast.success('AI content generated!');
  };

  return (
    <>
      <Button variant="secondary" leftIcon={<Sparkles size={15} />} onClick={() => setOpen(true)} size="sm"
        className="bg-linear-to-r! from-violet-100! to-purple-100! text-violet-700! dark:from-violet-900/30! dark:to-purple-900/30! dark:text-violet-300!"
      >
        Generate with AI
      </Button>
      <Modal isOpen={open} onClose={() => setOpen(false)} title="✨ Generate with AI" size="md"
        footer={<>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button isLoading={generateMutation.isPending} onClick={handleGenerate}
            className="bg-linear-to-r! from-violet-500! to-purple-500!"
          >
            Generate
          </Button>
        </>}
      >
        <div className="flex flex-col gap-4">
          <Textarea
            label="Prompt"
            placeholder="e.g. Generate a B1 reading about Travel in Europe"
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            rows={4}
          />
          <div className="text-xs text-gray-500 p-3 rounded-xl bg-violet-50 dark:bg-violet-900/20 border border-violet-100 dark:border-violet-900">
            💡 <strong>Tips:</strong> Include difficulty (A1–C2), topic, and any specific requirements. The AI will fill in the reading form for you.
          </div>
        </div>
      </Modal>
    </>
  );
};

// ─── Reading Form ─────────────────────────────────────────────────────────────
const ReadingFormModal: React.FC<{
  isOpen: boolean; onClose: () => void; initialData?: Reading;
  topicOptions: { value: string; label: string }[];
}> = ({ isOpen, onClose, initialData, topicOptions }) => {
  const createMutation = useCreateReading();
  const updateMutation = useUpdateReading();
  const isEdit = !!initialData;

  const defaultQ = { question: '', choices: ['', '', '', ''], correctAnswer: 0, explanation: '' };

  const { register, handleSubmit, control, formState: { errors }, reset, setValue } = useForm<ReadingFormData>({
    resolver: zodResolver(readingSchema),
    defaultValues: initialData
      ? { ...initialData, vocabularyHighlights: initialData.vocabularyHighlights.join(', ') }
      : { difficulty: ReadingDifficulty.B1, estimatedMinutes: 3, questions: [defaultQ], vocabularyHighlights: '' },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'questions' });

  React.useEffect(() => {
    if (!isOpen) reset();
    else if (initialData) reset({ ...initialData, vocabularyHighlights: initialData.vocabularyHighlights.join(', ') });
  }, [isOpen, initialData, reset]);

  const fillFromAI = (data: Partial<ReadingFormData>) => {
    Object.entries(data).forEach(([key, val]) => setValue(key as keyof ReadingFormData, val as any));
  };

  const onSubmit = handleSubmit(async (data) => {
    const dto: CreateReadingDTO = {
      title: data.title,
      topicId: data.topicId,
      paragraph: data.paragraph,
      translation: data.translation,
      difficulty: data.difficulty,
      estimatedMinutes: data.estimatedMinutes,
      vocabularyHighlights: data.vocabularyHighlights.split(',').map((s: string) => s.trim()).filter(Boolean),
      questions: data.questions,
    };
    if (isEdit) await updateMutation.mutateAsync({ id: initialData.id, dto });
    else await createMutation.mutateAsync(dto);
    onClose();
  });

  const diffOpts = Object.values(ReadingDifficulty).map(d => ({ value: d, label: READING_DIFFICULTY_CONFIG[d].label }));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit Reading' : 'Create Reading'} size="xl"
      footer={<>
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button onClick={onSubmit} isLoading={createMutation.isPending || updateMutation.isPending}>
          {isEdit ? 'Save Changes' : 'Create Reading'}
        </Button>
      </>}
    >
      <form className="flex flex-col gap-5">
        <div className="flex justify-end">
          <AIGeneratorModal onFill={fillFromAI} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Title *" placeholder="Reading title" error={errors.title?.message} {...register('title')} />
          <Select label="Topic *" options={topicOptions} placeholder="Select topic" error={errors.topicId?.message} {...register('topicId')} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select label="Difficulty *" options={diffOpts} error={errors.difficulty?.message} {...register('difficulty')} />
          <Input label="Est. Minutes *" type="number" min={1} max={60} error={errors.estimatedMinutes?.message} {...register('estimatedMinutes', { valueAsNumber: true })} />
        </div>

        <Textarea label="English Paragraph *" placeholder="Reading content..." rows={6} error={errors.paragraph?.message} {...register('paragraph')} />
        <Textarea label="Vietnamese Translation *" placeholder="Bản dịch..." rows={4} error={errors.translation?.message} {...register('translation')} />
        <Input label="Vocabulary Highlights (comma-separated)" placeholder="word1, word2, word3" {...register('vocabularyHighlights')} />

        {/* Questions */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Questions *</label>
            <Button size="sm" variant="ghost" leftIcon={<Plus size={14} />} onClick={() => append(defaultQ)} type="button">
              Add Question
            </Button>
          </div>
          {typeof errors.questions?.message === 'string' && (
            <p className="text-xs text-red-500 mb-2">{errors.questions.message}</p>
          )}
          <div className="flex flex-col gap-4">
            {fields.map((field, qi) => (
              <div key={field.id} className="p-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Question {qi + 1}</span>
                  {fields.length > 1 && (
                    <button type="button" onClick={() => remove(qi)} className="text-red-400 hover:text-red-600 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
                <div className="flex flex-col gap-3">
                  <Input label="Question" placeholder="Question text" error={(errors.questions?.[qi]?.question as any)?.message} {...register(`questions.${qi}.question`)} />
                  {[0, 1, 2, 3].map(ci => (
                    <Input key={ci} label={`Choice ${ci + 1}`} placeholder={`Option ${ci + 1}`} error={(errors.questions?.[qi]?.choices?.[ci] as any)?.message} {...register(`questions.${qi}.choices.${ci}`)} />
                  ))}
                  <div className="grid grid-cols-2 gap-3">
                    <Select label="Correct Answer" options={[0,1,2,3].map(i=>({ value: String(i), label: `Choice ${i+1}` }))} {...register(`questions.${qi}.correctAnswer`, { valueAsNumber: true })} />
                  </div>
                  <Textarea label="Explanation" placeholder="Why is this correct?" rows={2} {...register(`questions.${qi}.explanation`)} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </form>
    </Modal>
  );
};

// ─── Reading Card ─────────────────────────────────────────────────────────────
const ReadingCard: React.FC<{ reading: Reading; onEdit: () => void; onDelete: () => void }> = ({ reading, onEdit, onDelete }) => {
  const [expanded, setExpanded] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const diffCfg = READING_DIFFICULTY_CONFIG[reading.difficulty];

  const highlightText = (text: string) => {
    if (!reading.vocabularyHighlights.length) return text;
    const pattern = new RegExp(`\\b(${reading.vocabularyHighlights.join('|')})\\b`, 'gi');
    return text.replace(pattern, '<mark class="bg-pink-100 dark:bg-pink-900/40 text-pink-700 dark:text-pink-300 rounded px-0.5">$1</mark>');
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden"
    >
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className={`text-xs font-bold ${diffCfg.color}`}>{diffCfg.label}</span>
              {reading.topicName && <Badge variant="pink">{reading.topicName}</Badge>}
              <div className="flex items-center gap-1 text-gray-400 text-xs">
                <Clock size={12} /> {reading.estimatedMinutes} min
              </div>
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white text-lg">{reading.title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {reading.questions.length} questions • {reading.vocabularyHighlights.length} highlights
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={onEdit} className="p-2 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"><Edit2 size={15} /></button>
            <button onClick={onDelete} className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"><Trash2 size={15} /></button>
          </div>
        </div>

        <button
          onClick={() => setExpanded(e => !e)}
          className="mt-4 flex items-center gap-2 text-sm font-semibold text-pink-500 hover:text-pink-600 transition-colors"
        >
          <BookOpen size={15} />
          {expanded ? 'Collapse' : 'Read & Practice'}
          {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </button>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="border-t border-gray-100 dark:border-gray-800"
          >
            <div className="p-6 flex flex-col gap-6">
              {/* Paragraph */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-gray-900 dark:text-white">Reading Passage</h4>
                  <Button size="sm" variant="ghost" leftIcon={showTranslation ? <EyeOff size={13} /> : <Eye size={13} />}
                    onClick={() => setShowTranslation(s => !s)}
                  >
                    {showTranslation ? 'Hide' : 'Show'} Translation
                  </Button>
                </div>
                <div
                  className="text-sm leading-8 text-gray-700 dark:text-gray-300 p-4 rounded-xl bg-gray-50 dark:bg-gray-800"
                  dangerouslySetInnerHTML={{ __html: highlightText(reading.paragraph) }}
                />
                <AnimatePresence>
                  {showTranslation && (
                    <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                      className="mt-3 p-4 rounded-xl bg-pink-50 dark:bg-pink-900/20 border border-pink-100 dark:border-pink-900 text-sm text-gray-600 dark:text-gray-400 leading-7 italic"
                    >
                      {reading.translation}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Questions */}
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white mb-4">Comprehension Questions</h4>
                <div className="flex flex-col gap-5">
                  {reading.questions.map((q, qi) => {
                    const selected = answers[q.id];
                    const isCorrect = selected === q.correctAnswer;
                    return (
                      <div key={q.id} className="p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                        <p className="font-semibold text-gray-900 dark:text-white text-sm mb-3">
                          {qi + 1}. {q.question}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {q.choices.map((choice, ci) => {
                            const chosen = selected === ci;
                            const showResult = submitted && chosen;
                            return (
                              <button
                                key={ci}
                                onClick={() => !submitted && setAnswers(a => ({ ...a, [q.id]: ci }))}
                                className={`text-left text-sm px-4 py-2.5 rounded-xl border-2 transition-all ${
                                  showResult
                                    ? isCorrect ? 'border-emerald-400 bg-emerald-50 text-emerald-700' : 'border-red-400 bg-red-50 text-red-700'
                                    : submitted && ci === q.correctAnswer ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
                                    : chosen ? 'border-pink-400 bg-pink-50 text-pink-700' : 'border-gray-200 dark:border-gray-700 hover:border-pink-300 hover:bg-pink-50/50 text-gray-700 dark:text-gray-300'
                                }`}
                              >
                                <span className="font-bold mr-2">{String.fromCharCode(65 + ci)}.</span>
                                {choice}
                              </button>
                            );
                          })}
                        </div>
                        {submitted && selected !== undefined && (
                          <div className={`mt-3 flex items-start gap-2 text-xs p-3 rounded-xl ${isCorrect ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                            {isCorrect ? <CheckCircle2 size={14} className="shrink-0 mt-0.5" /> : <XCircle size={14} className="flex-shrink-0 mt-0.5" />}
                            {q.explanation}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-end mt-4">
                  {!submitted ? (
                    <Button onClick={() => {
                      if (Object.keys(answers).length < reading.questions.length) { toast.error('Please answer all questions.'); return; }
                      setSubmitted(true);
                    }}>
                      Submit Answers
                    </Button>
                  ) : (
                    <Button variant="secondary" onClick={() => { setAnswers({}); setSubmitted(false); }}>
                      Try Again
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ReadingPage() {
  const { data: readings, isLoading } = useReadings();
  const { data: topics } = useTopics();
  const deleteMutation = useDeleteReading();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingReading, setEditingReading] = useState<Reading | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<Reading | undefined>();

  const topicOptions = topics?.map(t => ({ value: t.id, label: t.name })) ?? [];
  if (isLoading) return <LoadingPage />;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">Reading Practice</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{readings?.length ?? 0} articles</p>
        </div>
        <Button leftIcon={<Plus size={16} />} onClick={() => setModalOpen(true)}>Create Reading</Button>
      </div>

      {!readings?.length ? (
        <EmptyState icon="📖" title="No readings yet" description="Create your first reading practice article."
          action={<Button leftIcon={<Plus size={16} />} onClick={() => setModalOpen(true)}>Create Reading</Button>}
        />
      ) : (
        <div className="flex flex-col gap-4">
          {readings.map(r => (
            <ReadingCard key={r.id} reading={r}
              onEdit={() => { setEditingReading(r); setModalOpen(true); }}
              onDelete={() => setDeleteTarget(r)}
            />
          ))}
        </div>
      )}

      <ReadingFormModal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditingReading(undefined); }} initialData={editingReading} topicOptions={topicOptions} />
      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(undefined)}
        onConfirm={async () => { if (deleteTarget) { await deleteMutation.mutateAsync(deleteTarget.id); setDeleteTarget(undefined); } }}
        title="Delete Reading" message={`Delete "${deleteTarget?.title}"?`} isLoading={deleteMutation.isPending}
      />
    </div>
  );
}

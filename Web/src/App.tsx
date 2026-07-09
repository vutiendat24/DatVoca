import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MainLayout from './layouts/MainLayout';
import { LoadingPage } from './components/Loading/Loading';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const VocabularyPage = lazy(() => import('./pages/VocabularyPage'));
const SentencesPage = lazy(() => import('./pages/SentencesPage'));
const FlashcardsPage = lazy(() => import('./pages/FlashcardsPage'));
const TopicsPage = lazy(() => import('./pages/TopicsPage'));
const ReadingPage = lazy(() => import('./pages/ReadingPage'));
const TodayPage = lazy(() => import('./pages/TodayPage'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={
            <Suspense fallback={<LoadingPage />}><Dashboard /></Suspense>
          } />
          <Route path="vocabulary" element={
            <Suspense fallback={<LoadingPage />}><VocabularyPage /></Suspense>
          } />
          <Route path="sentences" element={
            <Suspense fallback={<LoadingPage />}><SentencesPage /></Suspense>
          } />
          <Route path="flashcards" element={
            <Suspense fallback={<LoadingPage />}><FlashcardsPage /></Suspense>
          } />
          <Route path="topics" element={
            <Suspense fallback={<LoadingPage />}><TopicsPage /></Suspense>
          } />
          <Route path="reading" element={
            <Suspense fallback={<LoadingPage />}><ReadingPage /></Suspense>
          } />
          <Route path="today" element={
            <Suspense fallback={<LoadingPage />}><TodayPage /></Suspense>
          } />
        </Route>
      </Routes>
    </QueryClientProvider>
  );
}

export default App;

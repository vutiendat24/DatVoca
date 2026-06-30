import './App.css'

import { Routes, Route } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import FlashcardPage from './pages/Flashcard'


function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={
          <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
            <h1 className="text-5xl font-extrabold text-blue-600 dark:text-blue-400 tracking-tight">Home Page</h1>
            <p className="text-lg text-gray-500 dark:text-gray-400">Welcome to DatVoca!</p>
          </div>
        } />

      <Route path="/voca" element={<FlashcardPage />} />








        <Route path="about" element={
          <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
            <h1 className="text-5xl font-extrabold text-blue-600 dark:text-blue-400 tracking-tight">About Page</h1>
          </div>
        } />
      </Route>
    </Routes>
  )
}

export default App


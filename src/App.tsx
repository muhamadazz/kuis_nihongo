import { useState } from 'react';
import CategorySelection from './components/CategorySelection';
import ChapterSelection from './components/ChapterSelection';
import QuizGame from './components/QuizGame';
import AdminForm from './components/AdminForm';
import Footer from './components/Footer';
import { Category, Chapter } from './lib/firebase';
import { Settings } from 'lucide-react';

type View = 'category' | 'chapter' | 'quiz' | 'admin';

function App() {
  const [view, setView] = useState<View>('category');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);

  const handleSelectCategory = (category: Category) => {
    setSelectedCategory(category);
    setView('chapter');
  };

  const handleSelectChapter = (chapter: Chapter | null) => {
    setSelectedChapter(chapter);
    setView('quiz');
  };

  const handleBackToCategory = () => {
    setView('category');
    setSelectedCategory(null);
    setSelectedChapter(null);
  };

  const handleBackToChapter = () => {
    setView('chapter');
    setSelectedChapter(null);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-grow">
        {view === 'category' && (
          <div className="relative">
            <button
              onClick={() => setView('admin')}
              className="fixed top-6 right-6 bg-white text-blue-600 p-4 rounded-full shadow-lg hover:shadow-xl transition-all z-10"
              title="Admin - Tambah Soal"
            >
              <Settings className="w-6 h-6" />
            </button>
            <CategorySelection onSelectCategory={handleSelectCategory} />
          </div>
        )}

        {view === 'chapter' && selectedCategory && (
          <ChapterSelection
            category={selectedCategory}
            onSelectChapter={handleSelectChapter}
            onBack={handleBackToCategory}
          />
        )}

        {view === 'quiz' && selectedCategory && (
          <QuizGame
            category={selectedCategory}
            chapter={selectedChapter}
            onBack={handleBackToChapter}
          />
        )}

        {view === 'admin' && (
          <AdminForm onBack={handleBackToCategory} />
        )}
      </div>
      <Footer />
    </div>
  );
}

export default App;

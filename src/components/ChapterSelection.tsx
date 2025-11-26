import { useEffect, useState } from 'react';
import { db, Chapter, Category } from '../lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { ArrowLeft, Book } from 'lucide-react';

type ChapterSelectionProps = {
  category: Category;
  onSelectChapter: (chapter: Chapter | null) => void;
  onBack: () => void;
};

export default function ChapterSelection({ category, onSelectChapter, onBack }: ChapterSelectionProps) {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChapters();
  }, [category.id]);

  async function loadChapters() {
    try {
      const q = query(
        collection(db, 'chapters'),
        where('categoryId', '==', category.id),
        orderBy('chapterNumber')
      );
      const querySnapshot = await getDocs(q);
      const data: Chapter[] = [];
      querySnapshot.forEach((doc) => {
        data.push({
          id: doc.id,
          categoryId: doc.data().categoryId,
          title: doc.data().title,
          chapterNumber: doc.data().chapterNumber,
          createdAt: doc.data().createdAt?.toDate() || new Date(),
        });
      });
      setChapters(data);
    } catch (error) {
      console.error('Error loading chapters:', error);
    }
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={onBack}
          className="mb-8 flex items-center text-blue-600 hover:text-blue-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Kembali ke Kategori
        </button>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">{category.name}</h1>
          <p className="text-xl text-gray-600">Pilih bab yang ingin kamu pelajari</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {chapters.map((chapter) => (
            <button
              key={chapter.id}
              onClick={() => onSelectChapter(chapter)}
              className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 transform hover:-translate-y-1 text-left"
            >
              <div className="flex items-start space-x-4">
                <div className="bg-blue-100 rounded-lg p-3 text-blue-600">
                  <Book className="w-8 h-8" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-blue-600 mb-1">
                    Bab {chapter.chapterNumber}
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">{chapter.title}</h3>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

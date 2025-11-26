import { useEffect, useState } from 'react';
import { db, Category } from '../lib/firebase';
import { collection, query, where, getDocs, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import { BookOpen, Plus, Check } from 'lucide-react';

type ChapterManagementProps = {
  categories: Category[];
};

export default function ChapterManagement({ categories }: ChapterManagementProps) {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [chapterTitle, setChapterTitle] = useState('');
  const [chapterNumber, setChapterNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [existingChapters, setExistingChapters] = useState<any[]>([]);

  useEffect(() => {
    if (selectedCategory) {
      loadExistingChapters(selectedCategory);
    } else {
      setExistingChapters([]);
    }
  }, [selectedCategory]);

  async function loadExistingChapters(categoryId: string) {
    try {
      const q = query(
        collection(db, 'chapters'),
        where('categoryId', '==', categoryId),
        orderBy('chapterNumber')
      );
      const querySnapshot = await getDocs(q);
      const data: any[] = [];
      querySnapshot.forEach((doc) => {
        data.push({
          id: doc.id,
          title: doc.data().title,
          chapterNumber: doc.data().chapterNumber,
        });
      });
      setExistingChapters(data);
    } catch (error) {
      console.error('Error loading chapters:', error);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      const chapterNum = parseInt(chapterNumber);
      if (isNaN(chapterNum) || chapterNum < 1) {
        alert('Nomor bab harus berupa angka positif');
        setLoading(false);
        return;
      }

      await addDoc(collection(db, 'chapters'), {
        categoryId: selectedCategory,
        title: chapterTitle,
        chapterNumber: chapterNum,
        createdAt: serverTimestamp(),
      });

      setSuccess(true);
      setChapterTitle('');
      setChapterNumber('');
      loadExistingChapters(selectedCategory);

      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error adding chapter:', error);
      alert('Gagal menambahkan bab. Silakan coba lagi.');
    }

    setLoading(false);
  };

  const selectedCategoryObj = categories.find(cat => cat.id === selectedCategory);

  return (
    <div className="space-y-6">
      <div className="flex items-center mb-6">
        <div className="bg-blue-100 rounded-lg p-3 text-blue-600 mr-4">
          <BookOpen className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Kelola Chapter</h2>
          <p className="text-gray-600">Tambah chapter baru untuk setiap kategori</p>
        </div>
      </div>

      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
          <Check className="w-5 h-5 text-green-600 mr-3" />
          <span className="text-green-800">Chapter berhasil ditambahkan!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Kategori *
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Pilih Kategori</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {selectedCategoryObj && existingChapters.length > 0 && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-sm font-semibold text-gray-700 mb-2">
              Chapter yang sudah ada di {selectedCategoryObj.name}:
            </p>
            <ul className="space-y-1">
              {existingChapters.map((chapter) => (
                <li key={chapter.id} className="text-sm text-gray-600">
                  Bab {chapter.chapterNumber}: {chapter.title}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Nomor Bab *
          </label>
          <input
            type="number"
            min="1"
            value={chapterNumber}
            onChange={(e) => setChapterNumber(e.target.value)}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Contoh: 1, 2, 3..."
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Judul Bab *
          </label>
          <input
            type="text"
            value={chapterTitle}
            onChange={(e) => setChapterTitle(e.target.value)}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Contoh: Perkenalan Diri"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          {loading ? 'Menyimpan...' : 'Tambah Chapter'}
        </button>
      </form>
    </div>
  );
}

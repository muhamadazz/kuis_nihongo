import { useEffect, useState } from 'react';
import { db, Category } from '../lib/firebase';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import { BookOpen, FileText, Languages } from 'lucide-react';

type CategorySelectionProps = {
  onSelectCategory: (category: Category) => void;
};

export default function CategorySelection({ onSelectCategory }: CategorySelectionProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      const q = query(collection(db, 'categories'), orderBy('name'));
      const querySnapshot = await getDocs(q);
      const data: Category[] = [];
      querySnapshot.forEach((doc) => {
        data.push({
          id: doc.id,
          name: doc.data().name,
          slug: doc.data().slug,
          createdAt: doc.data().createdAt?.toDate() || new Date(),
        });
      });
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
    setLoading(false);
  }

  const getCategoryIcon = (slug: string) => {
    switch (slug) {
      case 'kotoba':
        return <BookOpen className="w-16 h-16" />;
      case 'bunpo':
        return <FileText className="w-16 h-16" />;
      case 'kanji':
        return <Languages className="w-16 h-16" />;
      default:
        return <BookOpen className="w-16 h-16" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">Quiz Bahasa Jepang</h1>
          <p className="text-xl text-gray-600">Pilih kategori quiz yang ingin kamu ikuti</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onSelectCategory(category)}
              className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 transform hover:-translate-y-2"
            >
              <div className="flex flex-col items-center space-y-4">
                <div className="text-blue-600">
                  {getCategoryIcon(category.slug)}
                </div>
                <h2 className="text-2xl font-bold text-gray-800">{category.name}</h2>
                <p className="text-gray-600">
                  {category.slug === 'kotoba' && 'Kosakata Bahasa Jepang'}
                  {category.slug === 'bunpo' && 'Tata Bahasa Jepang'}
                  {category.slug === 'kanji' && 'Huruf Kanji Jepang'}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

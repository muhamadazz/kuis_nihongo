import { useEffect, useState } from 'react';
import { db, Category, Chapter } from '../lib/firebase';
import { collection, query, where, getDocs, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import { ArrowLeft, Plus, Check, Upload, X } from 'lucide-react';

type AdminFormProps = {
  onBack: () => void;
};

export default function AdminForm({ onBack }: AdminFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedChapter, setSelectedChapter] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');
  const [optionC, setOptionC] = useState('');
  const [optionD, setOptionD] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState('a');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      loadChapters(selectedCategory);
    } else {
      setChapters([]);
      setSelectedChapter('');
    }
  }, [selectedCategory]);

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
  }

  async function loadChapters(categoryId: string) {
    try {
      const q = query(
        collection(db, 'chapters'),
        where('categoryId', '==', categoryId),
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
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Ukuran file maksimal 5MB');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const uploadImageToCloudinary = async (file: File): Promise<string> => {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error('Gagal upload foto ke Cloudinary');
    }

    const data = await response.json();
    return data.secure_url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      let imageUrl: string | null = null;

      if (imageFile) {
        setUploadingImage(true);
        imageUrl = await uploadImageToCloudinary(imageFile);
        setUploadingImage(false);
      }

      await addDoc(collection(db, 'questions'), {
        categoryId: selectedCategory,
        chapterId: selectedChapter || null,
        questionText,
        imageUrl,
        optionA,
        optionB,
        optionC,
        optionD,
        correctAnswer,
        createdAt: serverTimestamp(),
      });

      setSuccess(true);
      setQuestionText('');
      setImageFile(null);
      setImagePreview(null);
      setOptionA('');
      setOptionB('');
      setOptionC('');
      setOptionD('');
      setCorrectAnswer('a');
      setSelectedChapter('');

      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error adding question:', error);
      alert('Gagal menambahkan soal. Silakan coba lagi.');
    }

    setLoading(false);
  };

  const selectedCategoryObj = categories.find(cat => cat.id === selectedCategory);
  const isBunpo = selectedCategoryObj?.slug === 'bunpo';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={onBack}
          className="mb-8 flex items-center text-blue-600 hover:text-blue-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Kembali ke Menu
        </button>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center mb-8">
            <div className="bg-blue-100 rounded-lg p-3 text-blue-600 mr-4">
              <Plus className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Tambah Soal Baru</h1>
              <p className="text-gray-600">Isi form di bawah untuk menambah soal quiz</p>
            </div>
          </div>

          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
              <Check className="w-5 h-5 text-green-600 mr-3" />
              <span className="text-green-800">Soal berhasil ditambahkan!</span>
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

            {isBunpo && chapters.length > 0 && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Bab (untuk Bunpo)
                </label>
                <select
                  value={selectedChapter}
                  onChange={(e) => setSelectedChapter(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Pilih Bab</option>
                  {chapters.map((chapter) => (
                    <option key={chapter.id} value={chapter.id}>
                      Bab {chapter.chapterNumber}: {chapter.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Soal *
              </label>
              <textarea
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                required
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Tulis pertanyaan di sini..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Foto Soal (Opsional)
              </label>
              {!imagePreview ? (
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
                  >
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">
                      Klik untuk upload foto
                    </span>
                    <span className="text-xs text-gray-500 mt-1">
                      Maksimal 5MB
                    </span>
                  </label>
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Pilihan A *
                </label>
                <input
                  type="text"
                  value={optionA}
                  onChange={(e) => setOptionA(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Pilihan A"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Pilihan B *
                </label>
                <input
                  type="text"
                  value={optionB}
                  onChange={(e) => setOptionB(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Pilihan B"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Pilihan C *
                </label>
                <input
                  type="text"
                  value={optionC}
                  onChange={(e) => setOptionC(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Pilihan C"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Pilihan D *
                </label>
                <input
                  type="text"
                  value={optionD}
                  onChange={(e) => setOptionD(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Pilihan D"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Jawaban Benar *
              </label>
              <select
                value={correctAnswer}
                onChange={(e) => setCorrectAnswer(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="a">A</option>
                <option value="b">B</option>
                <option value="c">C</option>
                <option value="d">D</option>
              </select>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading || uploadingImage}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:bg-blue-400 disabled:cursor-not-allowed"
              >
                {uploadingImage ? 'Mengupload foto...' : loading ? 'Menyimpan...' : 'Tambah Soal'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

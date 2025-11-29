import { useEffect, useState } from 'react';
import { db, Question, Category, Chapter } from '../lib/firebase';
import { collection, query, where, getDocs, orderBy, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { Trash2, Edit2, X, Check, Upload } from 'lucide-react';

type QuestionManagementProps = {
  categories: Category[];
};

export default function QuestionManagement({ categories }: QuestionManagementProps) {
  const [questions, setQuestions] = useState<(Question & { categoryName: string; chapterTitle: string })[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedChapter, setSelectedChapter] = useState('');
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Question | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [newImageFile, setNewImageFile] = useState<File | null>(null);

  useEffect(() => {
    if (selectedCategory) {
      loadChapters(selectedCategory);
    } else {
      setChapters([]);
      setSelectedChapter('');
    }
  }, [selectedCategory]);

  useEffect(() => {
    if (selectedCategory) {
      loadQuestions();
    } else {
      setQuestions([]);
    }
  }, [selectedCategory, selectedChapter]);

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

  async function loadQuestions() {
    try {
      setLoading(true);
      let q;
      if (selectedChapter) {
        q = query(
          collection(db, 'questions'),
          where('categoryId', '==', selectedCategory),
          where('chapterId', '==', selectedChapter),
          orderBy('createdAt', 'desc')
        );
      } else {
        q = query(
          collection(db, 'questions'),
          where('categoryId', '==', selectedCategory),
          orderBy('createdAt', 'desc')
        );
      }

      const querySnapshot = await getDocs(q);
      const data: (Question & { categoryName: string; chapterTitle: string })[] = [];
      const categoryMap = new Map(categories.map(c => [c.id, c.name]));
      const chapterMap = new Map(chapters.map(c => [c.id, c.title]));

      querySnapshot.forEach((doc) => {
        const qData = doc.data();
        data.push({
          id: doc.id,
          categoryId: qData.categoryId,
          chapterId: qData.chapterId,
          questionText: qData.questionText,
          imageUrl: qData.imageUrl,
          optionA: qData.optionA,
          optionB: qData.optionB,
          optionC: qData.optionC,
          optionD: qData.optionD,
          correctAnswer: qData.correctAnswer,
          createdAt: qData.createdAt?.toDate() || new Date(),
          categoryName: categoryMap.get(qData.categoryId) || 'Tidak diketahui',
          chapterTitle: chapterMap.get(qData.chapterId) || 'Tidak ada bab',
        });
      });
      setQuestions(data);
    } catch (error) {
      console.error('Error loading questions:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(questionId: string) {
    if (window.confirm('Apakah Anda yakin ingin menghapus soal ini?')) {
      try {
        await deleteDoc(doc(db, 'questions', questionId));
        setQuestions(questions.filter(q => q.id !== questionId));
      } catch (error) {
        console.error('Error deleting question:', error);
        alert('Gagal menghapus soal');
      }
    }
  }

  function handleEdit(question: Question & { categoryName: string; chapterTitle: string }) {
    setEditingId(question.id);
    setEditForm(question);
    setImagePreview(question.imageUrl || null);
    setNewImageFile(null);
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Ukuran file maksimal 5MB');
        return;
      }
      setNewImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
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

  async function handleSaveEdit() {
    if (!editForm) return;

    try {
      let imageUrl = editForm.imageUrl;
      if (newImageFile) {
        imageUrl = await uploadImageToCloudinary(newImageFile);
      }

      await updateDoc(doc(db, 'questions', editingId!), {
        questionText: editForm.questionText,
        imageUrl: imageUrl,
        optionA: editForm.optionA,
        optionB: editForm.optionB,
        optionC: editForm.optionC,
        optionD: editForm.optionD,
        correctAnswer: editForm.correctAnswer,
      });

      setEditingId(null);
      setEditForm(null);
      setImagePreview(null);
      setNewImageFile(null);
      loadQuestions();
    } catch (error) {
      console.error('Error updating question:', error);
      alert('Gagal memperbarui soal');
    }
  }

  function handleCancelEdit() {
    setEditingId(null);
    setEditForm(null);
    setImagePreview(null);
    setNewImageFile(null);
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Kategori
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
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

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Bab (Opsional)
          </label>
          <select
            value={selectedChapter}
            onChange={(e) => setSelectedChapter(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={!selectedCategory}
          >
            <option value="">Semua Bab</option>
            {chapters.map((chapter) => (
              <option key={chapter.id} value={chapter.id}>
                Bab {chapter.chapterNumber}: {chapter.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {!selectedCategory ? (
        <div className="bg-gray-50 border border-gray-300 rounded-lg p-6 text-center text-gray-500">
          Pilih kategori untuk melihat daftar soal
        </div>
      ) : loading ? (
        <div className="text-center py-8 text-gray-500">Memuat soal...</div>
      ) : questions.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800 text-sm">
          Tidak ada soal untuk kategori ini.
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((question) => (
            <div key={question.id}>
              {editingId === question.id && editForm ? (
                <div className="bg-white border border-blue-200 rounded-lg p-6 space-y-4">
                  <h3 className="font-semibold text-lg text-gray-800">Edit Soal</h3>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Soal *
                    </label>
                    <textarea
                      value={editForm.questionText}
                      onChange={(e) => setEditForm({ ...editForm, questionText: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Foto Soal
                    </label>
                    {!imagePreview ? (
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                          id={`image-upload-${question.id}`}
                        />
                        <label
                          htmlFor={`image-upload-${question.id}`}
                          className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
                        >
                          <Upload className="w-8 h-8 text-gray-400 mb-2" />
                          <span className="text-sm text-gray-600">Klik untuk upload foto</span>
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
                          onClick={() => {
                            setImagePreview(null);
                            setNewImageFile(null);
                          }}
                          className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">A *</label>
                      <input
                        type="text"
                        value={editForm.optionA}
                        onChange={(e) => setEditForm({ ...editForm, optionA: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">B *</label>
                      <input
                        type="text"
                        value={editForm.optionB}
                        onChange={(e) => setEditForm({ ...editForm, optionB: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">C *</label>
                      <input
                        type="text"
                        value={editForm.optionC}
                        onChange={(e) => setEditForm({ ...editForm, optionC: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">D *</label>
                      <input
                        type="text"
                        value={editForm.optionD}
                        onChange={(e) => setEditForm({ ...editForm, optionD: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Jawaban Benar *
                    </label>
                    <select
                      value={editForm.correctAnswer}
                      onChange={(e) => setEditForm({ ...editForm, correctAnswer: e.target.value as 'a' | 'b' | 'c' | 'd' })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="a">A</option>
                      <option value="b">B</option>
                      <option value="c">C</option>
                      <option value="d">D</option>
                    </select>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <button
                      onClick={handleSaveEdit}
                      className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-semibold flex items-center justify-center"
                    >
                      <Check className="w-5 h-5 mr-2" />
                      Simpan
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="flex-1 bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition-colors font-semibold flex items-center justify-center"
                    >
                      <X className="w-5 h-5 mr-2" />
                      Batal
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-semibold bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {question.categoryName}
                        </span>
                        <span className="text-xs font-semibold bg-gray-100 text-gray-800 px-2 py-1 rounded">
                          {question.chapterTitle}
                        </span>
                      </div>
                      <p className="text-gray-800 font-medium mb-2">{question.questionText}</p>
                      {question.imageUrl && (
                        <img
                          src={question.imageUrl}
                          alt="Question"
                          className="w-40 h-40 object-cover rounded-lg mb-3"
                        />
                      )}
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className={`p-2 rounded ${question.correctAnswer === 'a' ? 'bg-green-100' : 'bg-gray-50'}`}>
                          <span className="font-semibold">A:</span> {question.optionA}
                        </div>
                        <div className={`p-2 rounded ${question.correctAnswer === 'b' ? 'bg-green-100' : 'bg-gray-50'}`}>
                          <span className="font-semibold">B:</span> {question.optionB}
                        </div>
                        <div className={`p-2 rounded ${question.correctAnswer === 'c' ? 'bg-green-100' : 'bg-gray-50'}`}>
                          <span className="font-semibold">C:</span> {question.optionC}
                        </div>
                        <div className={`p-2 rounded ${question.correctAnswer === 'd' ? 'bg-green-100' : 'bg-gray-50'}`}>
                          <span className="font-semibold">D:</span> {question.optionD}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleEdit(question)}
                        className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(question.id)}
                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                        title="Hapus"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

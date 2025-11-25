import { useEffect, useState } from 'react';
import { db, Question, Category, Chapter } from '../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';

type QuizGameProps = {
  category: Category;
  chapter: Chapter | null;
  onBack: () => void;
};

export default function QuizGame({ category, chapter, onBack }: QuizGameProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);

  useEffect(() => {
    loadQuestions();
  }, [category.id, chapter?.id]);

  async function loadQuestions() {
    try {
      let conditions = [where('categoryId', '==', category.id)];
      if (chapter) {
        conditions.push(where('chapterId', '==', chapter.id));
      } else {
        conditions.push(where('chapterId', '==', null));
      }
      const q = query(collection(db, 'questions'), ...conditions);
      const querySnapshot = await getDocs(q);
      const data: Question[] = [];
      querySnapshot.forEach((doc) => {
        data.push({
          id: doc.id,
          categoryId: doc.data().categoryId,
          chapterId: doc.data().chapterId || null,
          questionText: doc.data().questionText,
          optionA: doc.data().optionA,
          optionB: doc.data().optionB,
          optionC: doc.data().optionC,
          optionD: doc.data().optionD,
          correctAnswer: doc.data().correctAnswer,
          createdAt: doc.data().createdAt?.toDate() || new Date(),
        });
      });
      const shuffled = data.sort(() => Math.random() - 0.5);
      setQuestions(shuffled.slice(0, 10));
    } catch (error) {
      console.error('Error loading questions:', error);
    }
    setLoading(false);
  }

  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswerSelect = (answer: string) => {
    if (showResult) return;
    setSelectedAnswer(answer);
    setShowResult(true);

    if (answer === currentQuestion.correctAnswer) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setQuizCompleted(true);
    }
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setQuizCompleted(false);
    loadQuestions();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-xl text-gray-600">Loading quiz...</div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={onBack}
            className="mb-8 flex items-center text-blue-600 hover:text-blue-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Kembali
          </button>
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <p className="text-xl text-gray-600">Belum ada soal untuk kategori ini.</p>
          </div>
        </div>
      </div>
    );
  }

  if (quizCompleted) {
    const percentage = (score / questions.length) * 100;
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="mb-6">
              {percentage >= 70 ? (
                <CheckCircle className="w-24 h-24 text-green-500 mx-auto" />
              ) : (
                <XCircle className="w-24 h-24 text-red-500 mx-auto" />
              )}
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Quiz Selesai!</h2>
            <p className="text-5xl font-bold text-blue-600 mb-2">{score}/{questions.length}</p>
            <p className="text-xl text-gray-600 mb-8">Skor: {percentage.toFixed(0)}%</p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleRestart}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                Ulangi Quiz
              </button>
              <button
                onClick={onBack}
                className="bg-gray-200 text-gray-800 px-8 py-3 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
              >
                Kembali ke Menu
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const options = [
    { key: 'a', text: currentQuestion.optionA },
    { key: 'b', text: currentQuestion.optionB },
    { key: 'c', text: currentQuestion.optionC },
    { key: 'd', text: currentQuestion.optionD },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={onBack}
          className="mb-8 flex items-center text-blue-600 hover:text-blue-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Kembali
        </button>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-semibold text-blue-600">
                {category.name} {chapter && `- ${chapter.title}`}
              </span>
              <span className="text-sm font-semibold text-gray-600">
                Soal {currentQuestionIndex + 1} dari {questions.length}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
              ></div>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-8">
            {currentQuestion.questionText}
          </h2>

          <div className="space-y-4 mb-8">
            {options.map((option) => {
              const isSelected = selectedAnswer === option.key;
              const isCorrect = option.key === currentQuestion.correctAnswer;
              const showCorrectAnswer = showResult && isCorrect;
              const showWrongAnswer = showResult && isSelected && !isCorrect;

              return (
                <button
                  key={option.key}
                  onClick={() => handleAnswerSelect(option.key)}
                  disabled={showResult}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    showCorrectAnswer
                      ? 'border-green-500 bg-green-50'
                      : showWrongAnswer
                      ? 'border-red-500 bg-red-50'
                      : isSelected
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                  } ${showResult ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">
                      <span className="text-gray-500 mr-3">{option.key.toUpperCase()}.</span>
                      {option.text}
                    </span>
                    {showCorrectAnswer && <CheckCircle className="w-6 h-6 text-green-500" />}
                    {showWrongAnswer && <XCircle className="w-6 h-6 text-red-500" />}
                  </div>
                </button>
              );
            })}
          </div>

          {showResult && (
            <div className="flex justify-end">
              <button
                onClick={handleNext}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                {currentQuestionIndex < questions.length - 1 ? 'Soal Berikutnya' : 'Lihat Hasil'}
              </button>
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <p className="text-gray-600">Skor Saat Ini: {score}/{currentQuestionIndex + (showResult ? 1 : 0)}</p>
        </div>
      </div>
    </div>
  );
}

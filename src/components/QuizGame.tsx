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
  const [userInput, setUserInput] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);

  useEffect(() => {
    loadQuestions();
  }, [category.id, chapter?.id]);

  async function loadQuestions() {
    try {
      if (!chapter) {
        setLoading(false);
        return;
      }
      const q = query(
        collection(db, 'questions'),
        where('categoryId', '==', category.id),
        where('chapterId', '==', chapter.id)
      );
      const querySnapshot = await getDocs(q);
      const data: Question[] = [];
      querySnapshot.forEach((doc) => {
        const qData = doc.data();
        data.push({
          id: doc.id,
          categoryId: qData.categoryId,
          chapterId: qData.chapterId || null,
          questionText: qData.questionText,
          imageUrl: qData.imageUrl || null,
          questionType: qData.questionType || 'multiple-choice',
          optionA: qData.optionA,
          optionB: qData.optionB,
          optionC: qData.optionC,
          optionD: qData.optionD,
          correctAnswer: qData.correctAnswer,
          createdAt: qData.createdAt?.toDate() || new Date(),
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

  const handleInputSubmit = () => {
    if (showResult || !userInput.trim()) return;
    setShowResult(true);

    const isCorrect = userInput.trim().toLowerCase() === currentQuestion.correctAnswer.toLowerCase();
    if (isCorrect) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setUserInput('');
      setShowResult(false);
    } else {
      setQuizCompleted(true);
    }
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setUserInput('');
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
            <p className="text-xl text-gray-600">Belum ada soal untuk bab ini.</p>
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

  const isMultipleChoice = currentQuestion.questionType === 'multiple-choice';
  const options = isMultipleChoice ? [
    { key: 'a', text: currentQuestion.optionA || '' },
    { key: 'b', text: currentQuestion.optionB || '' },
    { key: 'c', text: currentQuestion.optionC || '' },
    { key: 'd', text: currentQuestion.optionD || '' },
  ] : [];

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

          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            {currentQuestion.questionText}
          </h2>

          {currentQuestion.imageUrl && (
            <div className="mb-6">
              <img
                src={currentQuestion.imageUrl}
                alt="Soal"
                className="w-full max-h-96 object-contain rounded-lg border border-gray-200"
              />
            </div>
          )}

          {isMultipleChoice ? (
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
          ) : (
            <div className="space-y-4 mb-8">
              <div>
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !showResult) {
                      handleInputSubmit();
                    }
                  }}
                  disabled={showResult}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="Ketik jawaban Anda di sini..."
                />
              </div>
              {!showResult && (
                <button
                  onClick={handleInputSubmit}
                  disabled={!userInput.trim()}
                  className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:bg-blue-400 disabled:cursor-not-allowed"
                >
                  Submit Jawaban
                </button>
              )}
              {showResult && (
                <div className={`p-4 rounded-lg border-2 ${
                  userInput.trim().toLowerCase() === currentQuestion.correctAnswer.toLowerCase()
                    ? 'border-green-500 bg-green-50'
                    : 'border-red-500 bg-red-50'
                }`}>
                  <div className="flex items-start space-x-3">
                    {userInput.trim().toLowerCase() === currentQuestion.correctAnswer.toLowerCase() ? (
                      <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="font-semibold mb-1">
                        {userInput.trim().toLowerCase() === currentQuestion.correctAnswer.toLowerCase()
                          ? 'Jawaban Benar!'
                          : 'Jawaban Salah!'}
                      </p>
                      {userInput.trim().toLowerCase() !== currentQuestion.correctAnswer.toLowerCase() && (
                        <p className="text-sm">
                          <span className="font-semibold">Jawaban yang benar:</span> {currentQuestion.correctAnswer}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

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


import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Difficulty, Question, QuestionType, QuizState, QuizResult } from './types';
import { generateQuizQuestions } from './services/geminiService';
import QuestionCard from './components/QuestionCard';
import QuizSummary from './components/QuizSummary';
import { CheckCircle2, AlertCircle, Clock, ChevronLeft, ChevronRight, LayoutGrid, X, ArrowLeft, ArrowRight } from 'lucide-react';

const EXAM_DURATION = 20 * 60; // 20 minutes in seconds

const App: React.FC = () => {
  const [state, setState] = useState<QuizState>({
    questions: [],
    userAnswers: {},
    startTime: 0,
    endTime: null,
    status: 'idle',
    difficulty: Difficulty.BASIC
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(EXAM_DURATION);
  const [showNavGrid, setShowNavGrid] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);

  // Timer logic
  useEffect(() => {
    let timer: number;
    if (state.status === 'ongoing' && timeLeft > 0) {
      timer = window.setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [state.status, timeLeft]);

  const handleStart = async (diff: Difficulty) => {
    setState(prev => ({ ...prev, status: 'loading', difficulty: diff }));
    try {
      const questions = await generateQuizQuestions(diff);
      setState(prev => ({
        ...prev,
        questions,
        status: 'ongoing',
        startTime: Date.now(),
        userAnswers: {}
      }));
      setCurrentIndex(0);
      setTimeLeft(EXAM_DURATION);
    } catch (error) {
      alert("试题加载失败，请检查网络后重试。");
      setState(prev => ({ ...prev, status: 'idle' }));
    }
  };

  const handleAnswerChange = (answers: string[]) => {
    setState(prev => ({
      ...prev,
      userAnswers: {
        ...prev.userAnswers,
        [prev.questions[currentIndex].id]: answers
      }
    }));
  };

  const calculateResult = useCallback(() => {
    let score = 0;
    let correctCount = 0;
    let partialCount = 0;
    let wrongCount = 0;

    state.questions.forEach(q => {
      const userAns = state.userAnswers[q.id] || [];
      const correctAns = q.correctAnswers;

      if (q.type === QuestionType.MULTIPLE) {
        const isWrongSelection = userAns.some(a => !correctAns.includes(a));
        const isCorrectAll = userAns.length === correctAns.length && !isWrongSelection;
        const isPartial = userAns.length > 0 && userAns.length < correctAns.length && !isWrongSelection;

        if (isCorrectAll) {
          score += 4;
          correctCount++;
        } else if (isPartial) {
          score += 2;
          partialCount++;
        } else {
          wrongCount++;
        }
      } else {
        const isCorrect = userAns.length === 1 && userAns[0] === correctAns[0];
        if (isCorrect) {
          score += 4;
          correctCount++;
        } else {
          wrongCount++;
        }
      }
    });

    return {
      score,
      correctCount,
      partialCount,
      wrongCount,
      totalQuestions: state.questions.length,
      timeSpent: EXAM_DURATION - timeLeft
    };
  }, [state.questions, state.userAnswers, timeLeft]);

  const confirmSubmit = () => {
    const res = calculateResult();
    setResult(res);
    setState(prev => ({ ...prev, status: 'completed', endTime: Date.now() }));
    setShowSubmitModal(false);
  };

  const handleAutoSubmit = () => {
    const res = calculateResult();
    setResult(res);
    setState(prev => ({ ...prev, status: 'completed', endTime: Date.now() }));
    alert("考试时间到，已为您自动提交。");
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const unansweredCount = useMemo(() => {
    return state.questions.length - Object.keys(state.userAnswers).filter(id => state.userAnswers[Number(id)].length > 0).length;
  }, [state.questions, state.userAnswers]);

  const goToNext = () => {
    if (currentIndex < state.questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (state.status === 'idle') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">网约车安全培训考核</h1>
          <p className="text-gray-500 mb-8">请选择您的从业等级开始针对性考核</p>
          
          <div className="space-y-4">
            {[Difficulty.BASIC, Difficulty.INTERMEDIATE, Difficulty.ADVANCED].map((d) => (
              <button
                key={d}
                onClick={() => handleStart(d)}
                className="w-full py-4 px-6 rounded-2xl border-2 border-gray-100 hover:border-blue-500 hover:bg-blue-50 transition-all flex items-center justify-between group"
              >
                <div className="text-left">
                  <div className="font-bold text-gray-800">{d}考核</div>
                  <div className="text-xs text-gray-400">25题 · 20分钟 · 100分</div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-blue-500" />
              </button>
            ))}
          </div>

          <div className="mt-8 flex items-start gap-3 p-4 bg-orange-50 rounded-xl text-left">
            <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-orange-800 leading-relaxed">
              试题内容来源于《网络预约出租汽车经营服务管理暂行办法》、《道路交通安全法》及安全驾驶规范。支持随时<b>提前交卷</b>。
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (state.status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-blue-600 font-medium animate-pulse">正在利用AI生成您的专属考卷...</p>
        <p className="text-gray-400 text-sm mt-2">基于《道路交通安全法》及服务规范动态生成</p>
      </div>
    );
  }

  if (state.status === 'completed' && result) {
    return (
      <div className="min-h-screen bg-gray-50">
        <QuizSummary 
          result={result} 
          difficulty={state.difficulty} 
          onRestart={() => setState({ ...state, status: 'idle' })} 
        />
      </div>
    );
  }

  const currentQuestion = state.questions[currentIndex];
  const answeredIds = Object.keys(state.userAnswers).filter(id => state.userAnswers[Number(id)].length > 0).map(Number);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-24">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="bg-blue-600 text-white px-2 py-0.5 rounded text-xs font-bold">{state.difficulty}</span>
            <span className="text-gray-800 font-medium">考卷作答</span>
          </div>
          <div className={`flex items-center gap-2 font-mono text-lg font-bold ${timeLeft < 120 ? 'text-red-500 animate-pulse' : 'text-gray-700'}`}>
            <Clock className="w-5 h-5" />
            {formatTime(timeLeft)}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 py-8">
        <div className="space-y-6">
          {currentQuestion && (
            <QuestionCard
              question={currentQuestion}
              selectedAnswers={state.userAnswers[currentQuestion.id] || []}
              onAnswerChange={handleAnswerChange}
            />
          )}

          {/* New Navigation Buttons under options */}
          <div className="flex gap-4 items-center">
            <button
              onClick={goToPrev}
              disabled={currentIndex === 0}
              className={`flex-1 py-4 px-6 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-sm ${
                currentIndex === 0 
                ? 'bg-gray-100 text-gray-300 cursor-not-allowed' 
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              <ArrowLeft className="w-5 h-5" />
              上一题
            </button>
            <button
              onClick={goToNext}
              disabled={currentIndex === state.questions.length - 1}
              className={`flex-1 py-4 px-6 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-md ${
                currentIndex === state.questions.length - 1
                ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              下一题
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </main>

      {/* Navigation Overlay (答题卡) */}
      {showNavGrid && (
        <div className="fixed inset-0 bg-black/60 z-30 flex items-end md:items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-2xl rounded-t-3xl md:rounded-3xl p-6 shadow-2xl animate-slideUp">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-800">答题卡</h2>
              <button onClick={() => setShowNavGrid(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-3">
              {state.questions.map((q, idx) => {
                const isAnswered = answeredIds.includes(q.id);
                const isCurrent = currentIndex === idx;
                return (
                  <button
                    key={q.id}
                    onClick={() => {
                      setCurrentIndex(idx);
                      setShowNavGrid(false);
                    }}
                    className={`h-10 rounded-lg flex items-center justify-center text-sm font-bold transition-all ${
                      isCurrent ? 'ring-2 ring-blue-500 ring-offset-2' : ''
                    } ${
                      isAnswered ? 'bg-green-500 text-white shadow-sm' : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
            <div className="mt-8 pt-6 border-t border-gray-100 flex gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="w-3 h-3 rounded bg-green-500" /> 已作答
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="w-3 h-3 rounded bg-gray-100" /> 未作答
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Submission Confirmation Modal (提前交卷确认) */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black/60 z-30 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-sm rounded-3xl p-8 shadow-2xl animate-slideUp">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">确认提前交卷？</h2>
              <p className="text-gray-500 text-sm">
                当前考试时间还剩 <b>{formatTime(timeLeft)}</b>。<br />
                {unansweredCount > 0 ? (
                  <span className="text-red-500 mt-2 block">
                    目前还有 <b>{unansweredCount}</b> 道题目未作答！
                  </span>
                ) : (
                  <span className="text-green-600 mt-2 block">所有题目均已完成作答。</span>
                )}
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <button
                onClick={confirmSubmit}
                className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100"
              >
                确定交卷
              </button>
              <button
                onClick={() => setShowSubmitModal(false)}
                className="w-full py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-colors"
              >
                继续答题
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="bg-white border-t border-gray-200 fixed bottom-0 left-0 right-0 z-20">
        <div className="max-w-4xl mx-auto px-4 h-20 flex items-center justify-between gap-4">
          <div className="flex gap-2 flex-1 md:flex-none">
            <button
              disabled={currentIndex === 0}
              onClick={goToPrev}
              className="p-3 rounded-xl border border-gray-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-gray-700" />
            </button>
            <button
              disabled={currentIndex === state.questions.length - 1}
              onClick={goToNext}
              className="p-3 rounded-xl border border-gray-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              <ChevronRight className="w-6 h-6 text-gray-700" />
            </button>
          </div>

          <button
            onClick={() => setShowNavGrid(true)}
            className="flex flex-col items-center justify-center p-2 rounded-xl text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-all"
          >
            <LayoutGrid className="w-6 h-6 mb-0.5" />
            <span className="text-[10px] font-bold">答题卡</span>
          </button>

          <button
            onClick={() => setShowSubmitModal(true)}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-200 flex items-center gap-2"
          >
            提前交卷
          </button>
        </div>
      </footer>
    </div>
  );
};

export default App;

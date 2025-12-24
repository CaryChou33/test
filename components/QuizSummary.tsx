
import React from 'react';
import { QuizResult, Difficulty } from '../types';

interface QuizSummaryProps {
  result: QuizResult;
  difficulty: Difficulty;
  onRestart: () => void;
}

const QuizSummary: React.FC<QuizSummaryProps> = ({ result, difficulty, onRestart }) => {
  const isPassed = result.score >= 80;

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden text-center">
        <div className={`py-12 ${isPassed ? 'bg-green-500' : 'bg-red-500'} text-white`}>
          <div className="text-sm opacity-80 mb-2">{difficulty}等级考试结果</div>
          <div className="text-7xl font-bold mb-4">{result.score}<span className="text-2xl font-normal opacity-70">分</span></div>
          <div className="text-xl font-medium">
            {isPassed ? '恭喜您，通过考试！' : '很遗憾，未达到合格线 (80分)'}
          </div>
        </div>

        <div className="p-8 grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50">
          <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="text-gray-400 text-xs mb-1">正确题数</div>
            <div className="text-2xl font-bold text-green-600">{result.correctCount}</div>
          </div>
          <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="text-gray-400 text-xs mb-1">部分正确</div>
            <div className="text-2xl font-bold text-orange-600">{result.partialCount}</div>
          </div>
          <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="text-gray-400 text-xs mb-1">错误题数</div>
            <div className="text-2xl font-bold text-red-600">{result.wrongCount}</div>
          </div>
          <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="text-gray-400 text-xs mb-1">用时</div>
            <div className="text-2xl font-bold text-blue-600">{Math.floor(result.timeSpent / 60)}'<span className="text-lg">{result.timeSpent % 60}"</span></div>
          </div>
        </div>

        <div className="p-8 space-y-4">
          <p className="text-gray-500 text-sm leading-relaxed">
            基于《道路交通安全法》等法规的大模型考核完成。请根据错误题目加强相关法律法规的学习，提升安全驾驶意识和服务质量。
          </p>
          <button
            onClick={onRestart}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-blue-200"
          >
            重新开始考核
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizSummary;

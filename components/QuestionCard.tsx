
import React from 'react';
import { Question, QuestionType } from '../types';

interface QuestionCardProps {
  question: Question;
  selectedAnswers: string[];
  onAnswerChange: (answers: string[]) => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question, selectedAnswers, onAnswerChange }) => {
  const toggleAnswer = (option: string) => {
    if (question.type === QuestionType.SINGLE || question.type === QuestionType.BOOLEAN) {
      onAnswerChange([option]);
    } else {
      if (selectedAnswers.includes(option)) {
        onAnswerChange(selectedAnswers.filter(a => a !== option));
      } else {
        onAnswerChange([...selectedAnswers, option]);
      }
    }
  };

  const getBadgeColor = () => {
    switch (question.type) {
      case QuestionType.SINGLE: return 'bg-blue-100 text-blue-700';
      case QuestionType.MULTIPLE: return 'bg-purple-100 text-purple-700';
      case QuestionType.BOOLEAN: return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getTypeName = () => {
    switch (question.type) {
      case QuestionType.SINGLE: return '单选题';
      case QuestionType.MULTIPLE: return '多选题';
      case QuestionType.BOOLEAN: return '判断题';
      default: return '';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 animate-fadeIn">
      <div className="flex items-center gap-2 mb-4">
        <span className={`px-2 py-1 rounded text-xs font-bold ${getBadgeColor()}`}>
          {getTypeName()}
        </span>
        <span className="text-gray-400 text-sm">第 {question.id} 题</span>
      </div>
      
      <h3 className="text-lg font-semibold text-gray-800 mb-6 leading-relaxed">
        {question.content}
      </h3>

      <div className="space-y-3">
        {question.options.map((option, idx) => {
          const isSelected = selectedAnswers.includes(option);
          return (
            <button
              key={idx}
              onClick={() => toggleAnswer(option)}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 flex items-center gap-3 ${
                isSelected 
                  ? 'border-blue-500 bg-blue-50 text-blue-800 shadow-sm' 
                  : 'border-gray-100 hover:border-blue-200 hover:bg-gray-50 text-gray-700'
              }`}
            >
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
              }`}>
                {isSelected && (
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span className="text-sm md:text-base">{option}</span>
            </button>
          );
        })}
      </div>

      {question.type === QuestionType.MULTIPLE && (
        <p className="mt-4 text-xs text-gray-400 italic">
          * 多选题少选得2分，错选或漏选不得分。
        </p>
      )}
    </div>
  );
};

export default QuestionCard;

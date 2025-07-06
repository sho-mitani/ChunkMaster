import React, { useState } from 'react';
import { Chunk, StudyLevel } from '../../types';

interface UnderstandingPhaseProps {
  chunk: Chunk;
  level: StudyLevel;
  onComplete: () => void;
}

const UnderstandingPhase: React.FC<UnderstandingPhaseProps> = ({ chunk, level, onComplete }) => {
  const [isCompleted, setIsCompleted] = useState(false);

  const handleComplete = () => {
    setIsCompleted(true);
    setTimeout(() => {
      onComplete();
    }, 500);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <div className="glass rounded-2xl shadow-2xl p-6 sm:p-8 animate-fadeIn">
        <div className="mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 gradient-text">理解段階</h2>
          <p className="text-gray-600 mb-4 text-base sm:text-lg">
            以下のテキストをよく読んで理解してください。
          </p>
        </div>

        <div className="mb-6 sm:mb-8">
          <h3 className="text-lg sm:text-xl font-semibold mb-4 text-gray-800">テキスト</h3>
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-lg">
            <div className="whitespace-pre-line text-gray-800 leading-relaxed text-base sm:text-lg">
              {chunk.content}
            </div>
          </div>
        </div>

        <div className="mb-6 sm:mb-8">
          <h3 className="text-lg sm:text-xl font-semibold mb-4 text-gray-800">学習レベル</h3>
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 sm:p-6 border border-blue-200 shadow-lg">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
              <span className="text-xl sm:text-2xl font-bold text-blue-800">Level {level}</span>
              <span className="text-blue-600 text-base sm:text-lg font-medium">
                {level === 1 ? '(ヒント付き)' : '(ヒント無し)'}
              </span>
            </div>
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={handleComplete}
            disabled={isCompleted}
            className={`px-8 sm:px-12 py-3 sm:py-4 rounded-2xl font-semibold text-base sm:text-lg transition-all duration-200 transform hover:scale-105 shadow-lg w-full sm:w-auto ${
              isCompleted
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white cursor-not-allowed shadow-green-500/25'
                : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 shadow-blue-500/25'
            }`}
          >
            {isCompleted ? '理解完了' : '理解完了'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnderstandingPhase;
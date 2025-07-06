import React, { useState, useRef, useEffect } from 'react';
import { Chunk, StudyLevel } from '../../types';
import { getLineHints } from '../../utils/textComparison';

interface ShadowingPhaseProps {
  chunk: Chunk;
  level: StudyLevel;
  onComplete: (inputText: string) => void;
}

const ShadowingPhase: React.FC<ShadowingPhaseProps> = ({ chunk, level, onComplete }) => {
  const [inputText, setInputText] = useState('');
  const [showHints, setShowHints] = useState(level === 1);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
  };

  const handleComplete = () => {
    if (inputText.trim()) {
      onComplete(inputText);
    }
  };

  const handleToggleHints = () => {
    setShowHints(!showHints);
  };

  const hints = showHints ? getLineHints(chunk.content) : '';

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="glass rounded-2xl shadow-2xl p-8 animate-fadeIn">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-4 gradient-text">シャドーイング段階</h2>
          <p className="text-gray-600 mb-4 text-lg">
            理解した内容を記憶に基づいて入力してください。
          </p>
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">学習レベル</h3>
          <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-6 border border-orange-200 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-orange-800">Level {level}</span>
                <span className="text-orange-600 text-lg font-medium">
                  {level === 1 ? '(ヒント付き)' : '(ヒント無し)'}
                </span>
              </div>
              {level === 1 && (
                <button
                  onClick={handleToggleHints}
                  className="text-orange-600 hover:text-orange-800 text-sm font-medium px-4 py-2 rounded-xl hover:bg-orange-100 transition-colors"
                >
                  {showHints ? 'ヒントを隠す' : 'ヒントを表示'}
                </button>
              )}
            </div>
          </div>
        </div>

        {showHints && (
          <div className="mb-8 animate-slideIn">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">ヒント</h3>
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200 shadow-lg">
              <div className="whitespace-pre-line text-blue-800 font-mono text-base leading-relaxed">
                {hints}
              </div>
            </div>
          </div>
        )}

        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">入力欄</h3>
          <textarea
            ref={textareaRef}
            value={inputText}
            onChange={handleInputChange}
            className="w-full h-72 px-6 py-4 border-2 border-gray-300 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 resize-y shadow-lg text-base leading-relaxed"
            placeholder="ここにテキストを入力してください..."
          />
        </div>

        <div className="flex justify-between items-center">
          <div className="text-lg text-gray-600 font-medium">
            文字数: <span className="text-blue-600 font-bold">{inputText.length}</span>
          </div>
          <button
            onClick={handleComplete}
            disabled={!inputText.trim()}
            className={`px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg ${
              inputText.trim()
                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 shadow-orange-500/25'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            完了
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShadowingPhase;
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
  const [showAnswer, setShowAnswer] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  useEffect(() => {
    const textarea = textareaRef.current;
    const hint = hintRef.current;
    if (!textarea || !hint) return;

    const syncHeight = () => {
      hint.style.height = textarea.style.height || `${textarea.offsetHeight}px`;
    };

    // 初期同期
    syncHeight();

    // MutationObserverでstyle変更を監視
    const observer = new MutationObserver(syncHeight);
    observer.observe(textarea, {
      attributes: true,
      attributeFilter: ['style']
    });

    // マウスイベントでリサイズを検知
    const handleMouseUp = () => {
      setTimeout(syncHeight, 0);
    };

    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      observer.disconnect();
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [showHints]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
  };

  const getLineCount = (text: string) => {
    const charactersPerLine = 25;
    const lines = text.split('\n');
    let totalLines = 0;
    
    for (const line of lines) {
      totalLines += Math.max(1, Math.ceil(line.length / charactersPerLine));
    }
    
    return totalLines;
  };

  const getManuscriptRatio = (text: string) => {
    const lines = getLineCount(text);
    const maxLines = 24;
    return Math.min((lines / maxLines) * 100, 1000);
  };

  const characterCount = inputText.length;
  const lineCount = getLineCount(inputText);
  const manuscriptRatio = getManuscriptRatio(inputText);

  const handleComplete = () => {
    if (inputText.trim()) {
      onComplete(inputText);
    }
  };

  const handleToggleHints = () => {
    setShowHints(!showHints);
  };

  const handleToggleAnswer = () => {
    setShowAnswer(!showAnswer);
  };

  const hints = showHints ? getLineHints(chunk.content) : '';

  // ヒント欄の文字数に基づいて初期高さを計算
  const calculateHintHeight = () => {
    if (!showHints || !hints) return 288; // デフォルト高さ (h-72 = 288px)
    const lines = hints.split('\n').length;
    const lineHeight = 24; // font-mono text-base の行高
    const padding = 48; // p-6 (24px * 2)
    return Math.max(288, lines * lineHeight + padding);
  };

  const initialHeight = calculateHintHeight();

  return (
    <div className="max-w-none mx-auto p-6" style={{ maxWidth: '68rem' }}>
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
                <span className="text-2xl font-bold text-orange-800">{level === 1 ? 'ヒントあり' : 'ヒントなし'}</span>
              </div>
              <div className="flex gap-2">
                {level === 1 && (
                  <button
                    onClick={handleToggleHints}
                    className="text-orange-600 hover:text-orange-800 text-sm font-medium px-4 py-2 rounded-xl hover:bg-orange-100 transition-colors"
                  >
                    {showHints ? 'ヒントを隠す' : 'ヒントを表示'}
                  </button>
                )}
                <button
                  onClick={handleToggleAnswer}
                  className="text-orange-600 hover:text-orange-800 text-sm font-medium px-4 py-2 rounded-xl hover:bg-orange-100 transition-colors"
                >
                  {showAnswer ? '答えを隠す' : '答えを表示'}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[29rem_29rem] gap-6 mb-6 sm:mb-8 justify-center">
          <div className="animate-slideIn">
            <h3 className="text-lg sm:text-xl font-semibold mb-4 text-gray-800">
              {level === 1 ? 'ヒント・答え' : '答え'}
            </h3>
            <div ref={hintRef} className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 sm:p-6 border border-blue-200 shadow-lg" style={{ height: `${initialHeight}px` }}>
              <div className="whitespace-pre-line text-blue-800 font-mono text-sm sm:text-base leading-relaxed overflow-y-auto h-full">
                {showAnswer ? chunk.content : (level === 1 && showHints ? hints : '')}
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg sm:text-xl font-semibold mb-4 text-gray-800">入力欄</h3>
            <textarea
              ref={textareaRef}
              value={inputText}
              onChange={handleInputChange}
              maxLength={10000}
              className="w-full px-4 sm:px-6 py-3 sm:py-4 border-2 border-gray-300 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 resize-y shadow-lg text-base leading-relaxed"
              style={{ height: `${initialHeight}px` }}
              placeholder="ここにテキストを入力してください..."
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-sm sm:text-base text-gray-600 font-medium order-2 sm:order-1 space-y-1">
            <div>文字数: <span className="text-blue-600 font-bold">{characterCount}</span></div>
            <div>行数: <span className="text-blue-600 font-bold">{lineCount}</span></div>
            <div>原稿用紙占有率: <span className="text-blue-600 font-bold">{manuscriptRatio.toFixed(1)}%</span></div>
          </div>
          <button
            onClick={handleComplete}
            disabled={!inputText.trim()}
            className={`px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-semibold text-base sm:text-lg transition-all duration-200 transform hover:scale-105 shadow-lg w-full sm:w-auto order-1 sm:order-2 ${
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
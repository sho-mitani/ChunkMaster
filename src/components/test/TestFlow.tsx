import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Material, StudyLevel, StudyResult } from '../../types';
import { createTestSession } from '../../utils/storage';
import { compareTexts, getLineHints } from '../../utils/textComparison';

interface TestFlowProps {
  material: Material;
  level: StudyLevel;
  onComplete: () => void;
  onBack: () => void;
}

const TestFlow: React.FC<TestFlowProps> = ({ material, level, onComplete, onBack }) => {
  const { dispatch } = useApp();
  const [inputText, setInputText] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [accuracy, setAccuracy] = useState(0);
  const [diff, setDiff] = useState<any>(null);
  const [showHints, setShowHints] = useState(level === 1);
  const [showAnswer, setShowAnswer] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);

  const fullContent = material.chunks.map(chunk => chunk.content).join('\n\n');
  const hints = level === 1 ? getLineHints(material.content) : '';

  // ヒント欄の文字数に基づいて初期高さを計算
  const calculateHintHeight = () => {
    if (level !== 1 || !hints) return 320; // デフォルト高さ (h-80 = 320px)
    const lines = hints.split('\n').length;
    const lineHeight = 24; // font-mono text-base の行高
    const padding = 48; // p-6 (24px * 2)
    return Math.max(320, lines * lineHeight + padding);
  };

  const initialHeight = calculateHintHeight();

  useEffect(() => {
    const session = createTestSession(material.id, level);
    dispatch({ type: 'ADD_TEST_SESSION', payload: session });
  }, [dispatch, level, material.id]);

  useEffect(() => {
    const textarea = textareaRef.current;
    const hint = hintRef.current;
    if (!textarea || !hint || level !== 1) return;

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
  }, [level]);

  const handleComplete = () => {
    const comparisonResult = compareTexts(fullContent, inputText);
    setAccuracy(comparisonResult.accuracy);
    setDiff(comparisonResult.diff);
    setIsCompleted(true);
  };

  const handleToggleHints = () => {
    setShowHints(!showHints);
  };

  const handleToggleAnswer = () => {
    setShowAnswer(!showAnswer);
  };

  const handleResult = (result: StudyResult) => {
    const updatedMaterial = {
      ...material,
      lastStudiedAt: new Date(),
    };
    dispatch({ type: 'UPDATE_MATERIAL', payload: updatedMaterial });
    onComplete();
  };

  const characterCount = inputText.length;

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

  const lineCount = getLineCount(inputText);
  const manuscriptRatio = getManuscriptRatio(inputText);

  if (isCompleted) {
    return (
      <div className="max-w-none mx-auto p-6" style={{ maxWidth: '68rem' }}>
        <div className="glass rounded-2xl shadow-2xl p-6 animate-fadeIn">
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">テスト結果</h2>
              <button
                onClick={onBack}
                className="text-gray-600 hover:text-gray-800"
              >
                ← 戻る
              </button>
            </div>
          </div>

          <div className="mb-6">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center gap-4 mb-2">
                <span className="text-lg font-semibold text-purple-900">一致率:</span>
                <span className={`text-2xl font-bold ${
                  accuracy >= 95 ? 'text-green-600' : 
                  accuracy >= 80 ? 'text-orange-600' : 'text-red-600'
                }`}>
                  {accuracy.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${
                    accuracy >= 95 ? 'bg-green-500' : 
                    accuracy >= 80 ? 'bg-orange-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${accuracy}%` }}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[29rem_29rem] gap-6 mb-6 justify-center">
            <div>
              <h3 className="text-lg sm:text-xl font-semibold mb-4 text-gray-800">ヒント・答え欄</h3>
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4 sm:p-6 border border-green-200 shadow-lg">
                <div className="whitespace-pre-line text-green-800 font-mono text-sm sm:text-base leading-relaxed overflow-y-auto" style={{ minHeight: '20rem' }}>
                  {fullContent}
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg sm:text-xl font-semibold mb-4 text-gray-800">入力欄</h3>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 sm:p-6 border border-blue-200 shadow-lg">
                <div className="whitespace-pre-line text-blue-800 font-mono text-sm sm:text-base leading-relaxed overflow-y-auto" style={{ minHeight: '20rem' }}>
                  {inputText || '(入力なし)'}
                </div>
              </div>
            </div>
          </div>

          {diff && (diff.incorrect || diff.missing || diff.extra) && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 text-gray-800">差分詳細</h3>
              <div className="grid md:grid-cols-3 gap-4">
                {diff.incorrect && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="text-sm font-medium text-red-800 mb-1">間違い</div>
                    <div className="text-sm text-red-700">{diff.incorrect}</div>
                  </div>
                )}
                {diff.missing && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="text-sm font-medium text-yellow-800 mb-1">不足</div>
                    <div className="text-sm text-yellow-700">{diff.missing}</div>
                  </div>
                )}
                {diff.extra && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                    <div className="text-sm font-medium text-orange-800 mb-1">余分</div>
                    <div className="text-sm text-orange-700">{diff.extra}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-800">テスト結果を選択してください</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <button
                onClick={() => handleResult('perfect')}
                className="bg-green-500 text-white p-4 rounded-lg hover:bg-green-600 transition-colors"
              >
                <div className="font-medium mb-1">完璧</div>
                <div className="text-sm opacity-90">テスト完了</div>
              </button>
              
              <button
                onClick={() => handleResult('retry')}
                className="bg-red-500 text-white p-4 rounded-lg hover:bg-red-600 transition-colors"
              >
                <div className="font-medium mb-1">要再テスト</div>
                <div className="text-sm opacity-90">後日再テスト</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-none mx-auto p-4 sm:p-6" style={{ maxWidth: '68rem' }}>
      <div className="glass rounded-2xl shadow-2xl p-6 sm:p-8 animate-fadeIn">
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl sm:text-3xl font-bold gradient-text">テスト段階</h2>
            <button
              onClick={onBack}
              className="text-gray-600 hover:text-gray-800"
            >
              ← 戻る
            </button>
          </div>
          <p className="text-gray-600 mb-4 text-base sm:text-lg">
            教材全体の内容を記憶に基づいて入力してください。
          </p>
        </div>

        <div className="mb-6 sm:mb-8">
          <h3 className="text-lg sm:text-xl font-semibold mb-4 text-gray-800">教材名</h3>
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-lg">
            <div className="text-gray-800 leading-relaxed text-base sm:text-lg font-medium">
              {material.name}
            </div>
          </div>
        </div>

        <div className="mb-6 sm:mb-8">
          <h3 className="text-lg sm:text-xl font-semibold mb-4 text-gray-800">学習レベル</h3>
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 sm:p-6 border border-blue-200 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xl sm:text-2xl font-bold text-blue-800">{level === 1 ? 'ヒントあり' : 'ヒントなし'}</span>
              </div>
              <div className="flex gap-2">
                {level === 1 && (
                  <button
                    onClick={handleToggleHints}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium px-4 py-2 rounded-xl hover:bg-blue-100 transition-colors"
                  >
                    {showHints ? 'ヒントを隐す' : 'ヒントを表示'}
                  </button>
                )}
                <button
                  onClick={handleToggleAnswer}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium px-4 py-2 rounded-xl hover:bg-blue-100 transition-colors"
                >
                  {showAnswer ? '答えを隐す' : '答えを表示'}
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
                {showAnswer ? fullContent : (level === 1 && showHints ? hints : '')}
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg sm:text-xl font-semibold mb-4 text-gray-800">入力欄</h3>
            <textarea
              ref={textareaRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              maxLength={10000}
              className="w-full px-4 sm:px-6 py-3 sm:py-4 border-2 border-gray-300 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 resize-y shadow-lg text-base leading-relaxed"
              style={{ height: `${initialHeight}px` }}
              placeholder="教材全体の内容を記憶に基づいて入力してください..."
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
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 shadow-blue-500/25'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            テスト完了
          </button>
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          完璧でなくても大丈夫です。できるだけ思い出して入力してください。
        </div>
      </div>
    </div>
  );
};

export default TestFlow;
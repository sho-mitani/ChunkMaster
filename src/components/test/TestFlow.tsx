import React, { useState, useEffect } from 'react';
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
  const [startTime] = useState(Date.now());

  const fullContent = material.chunks.map(chunk => chunk.content).join('\n\n');
  const hints = level === 1 ? getLineHints(material.content) : '';

  useEffect(() => {
    const session = createTestSession(material.id, level);
    dispatch({ type: 'ADD_TEST_SESSION', payload: session });
  }, []);

  const handleComplete = () => {
    const comparisonResult = compareTexts(fullContent, inputText);
    setAccuracy(comparisonResult.accuracy);
    setDiff(comparisonResult.diff);
    setIsCompleted(true);
  };

  const handleResult = (result: StudyResult) => {
    const endTime = Date.now();
    const updatedMaterial = {
      ...material,
      lastStudiedAt: new Date(),
    };
    dispatch({ type: 'UPDATE_MATERIAL', payload: updatedMaterial });
    onComplete();
  };

  const characterCount = inputText.length;
  const targetCharacterCount = fullContent.length;
  const progressPercentage = Math.min((characterCount / targetCharacterCount) * 100, 100);

  if (isCompleted) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-6">
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
            <div className="text-sm text-gray-600 mt-2">
              {material.name} - Level {level}
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

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-800">正解文</h3>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 h-64 overflow-y-auto">
                <div className="whitespace-pre-wrap text-sm text-green-800">
                  {fullContent}
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-800">入力文</h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 h-64 overflow-y-auto">
                <div className="whitespace-pre-wrap text-sm text-blue-800">
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
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">テスト</h2>
            <button
              onClick={onBack}
              className="text-gray-600 hover:text-gray-800"
            >
              ← 戻る
            </button>
          </div>
          <div className="text-sm text-gray-600 mt-2">
            {material.name} - Level {level}
          </div>
        </div>

        <div className="mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="font-medium text-blue-900 mb-2">テスト内容</div>
            <div className="text-sm text-blue-800">
              教材全体の内容を記憶に基づいて入力してください。
            </div>
          </div>
        </div>

        {level === 1 && hints && (
          <div className="mb-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="text-sm text-yellow-800 font-medium mb-1">ヒント:</div>
              <div className="text-sm text-yellow-700 whitespace-pre-line">{hints}</div>
            </div>
          </div>
        )}

        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-gray-700">
              入力エリア
            </label>
            <div className="text-sm text-gray-600">
              {characterCount} / {targetCharacterCount} 文字
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1 mb-2">
            <div
              className="bg-blue-500 h-1 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-96 resize-y"
            placeholder="教材全体の内容を記憶に基づいて入力してください..."
          />
        </div>

        <div className="flex justify-center">
          <button
            onClick={handleComplete}
            className="bg-blue-500 text-white px-8 py-3 rounded-lg hover:bg-blue-600 font-medium text-lg"
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
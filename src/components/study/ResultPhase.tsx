import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Chunk, StudyLevel, StudyResult } from '../../types';
import { compareTexts } from '../../utils/textComparison';
import { updateChunkStatistics } from '../../utils/storage';

interface ResultPhaseProps {
  chunk: Chunk;
  level: StudyLevel;
  inputText: string;
  onComplete: () => void;
}

const ResultPhase: React.FC<ResultPhaseProps> = ({ chunk, level, inputText, onComplete }) => {
  const { state, dispatch } = useApp();
  const [result, setResult] = useState<StudyResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const comparison = compareTexts(chunk.content, inputText);
  const accuracy = comparison.accuracy;

  const handleResult = (selectedResult: StudyResult) => {
    setResult(selectedResult);
    setIsProcessing(true);
    
    // 統計データを更新
    const currentMaterial = state.currentMaterial;
    if (currentMaterial) {
      const isSuccess = selectedResult === 'perfect';
      const timeSpent = 0; // TODO: 実際の学習時間を計算
      
      const updatedStatistics = updateChunkStatistics(
        chunk.statistics,
        isSuccess,
        timeSpent
      );
      
      // チャンク統計を更新
      dispatch({
        type: 'UPDATE_CHUNK_STATISTICS',
        payload: {
          materialId: currentMaterial.id,
          chunkId: chunk.id,
          statistics: updatedStatistics,
        },
      });
      
      // 学習セッションを完了として記録
      if (state.currentStudySession) {
        dispatch({
          type: 'COMPLETE_STUDY_SESSION',
          payload: {
            id: state.currentStudySession.id,
            result: selectedResult,
            accuracy: accuracy,
            inputText: inputText,
          },
        });
      }
    }
    
    // 結果を処理して次のチャンクに進む
    setTimeout(() => {
      onComplete();
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="glass rounded-2xl shadow-2xl p-8 animate-fadeIn">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-4 gradient-text">結果確認</h2>
          <p className="text-gray-600 mb-4 text-lg">
            入力内容と正解を比較し、結果を選択してください。
          </p>
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">学習レベル</h3>
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200 shadow-lg">
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-purple-800">Level {level}</span>
              <span className="text-purple-600 text-lg font-medium">
                {level === 1 ? '(ヒント付き)' : '(ヒント無し)'}
              </span>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-800">正解</h3>
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200 shadow-lg">
              <div className="whitespace-pre-line text-green-800 text-base leading-relaxed">
                {chunk.content}
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-800">あなたの入力</h3>
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200 shadow-lg">
              <div className="whitespace-pre-line text-blue-800 text-base leading-relaxed">
                {inputText}
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">精度分析</h3>
          <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl p-6 border border-gray-200 shadow-lg">
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center">
                <div className="text-lg text-gray-600 mb-2">文字精度</div>
                <div className="text-4xl font-bold gradient-text">
                  {accuracy.toFixed(1)}%
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg text-gray-600 mb-2">文字数</div>
                <div className="text-4xl font-bold gradient-text">
                  {inputText.length} / {chunk.content.length}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">次のステップを選択してください</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <button
              onClick={() => handleResult('perfect')}
              disabled={isProcessing}
              className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-6 rounded-2xl hover:from-green-600 hover:to-emerald-600 transition-all duration-200 transform hover:scale-105 shadow-lg shadow-green-500/25 disabled:opacity-50"
            >
              <div className="font-bold text-lg mb-2">完璧</div>
              <div className="text-sm opacity-90">次のチャンクへ進む</div>
            </button>
            
            <button
              onClick={() => handleResult('retry')}
              disabled={isProcessing}
              className="bg-gradient-to-r from-red-500 to-pink-500 text-white p-6 rounded-2xl hover:from-red-600 hover:to-pink-600 transition-all duration-200 transform hover:scale-105 shadow-lg shadow-red-500/25 disabled:opacity-50"
            >
              <div className="font-bold text-lg mb-2">要再学習</div>
              <div className="text-sm opacity-90">理解段階からやり直し</div>
            </button>
          </div>
        </div>

        {isProcessing && (
          <div className="text-center">
            <div className="text-xl text-gray-600 font-medium animate-pulse">
              処理中...
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultPhase;
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Material, StudyLevel } from '../../types';
import { calculateProgress } from '../../utils/storage';

interface StudyDashboardProps {
  material: Material;
  onStartStudy: (chunkIndex: number, level: StudyLevel) => void;
  onBack: () => void;
}

const StudyDashboard: React.FC<StudyDashboardProps> = ({ material, onStartStudy, onBack }) => {
  const { state } = useApp();
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
  const [selectedLevel, setSelectedLevel] = useState<StudyLevel>(1);

  // 実際の完了チャンクを取得
  const completedChunks = new Set(
    material.chunks
      .filter(chunk => chunk.statistics.successes > 0)
      .map(chunk => chunk.id)
  );

  const handleChunkSelect = (index: number) => {
    setCurrentChunkIndex(index);
  };

  const handleStartStudy = () => {
    onStartStudy(currentChunkIndex, selectedLevel);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="text-gray-600 hover:text-gray-800"
              >
                ← 戻る
              </button>
              <h1 className="text-lg font-semibold text-gray-800">
                {material.name}
              </h1>
            </div>
            <div className="text-sm text-gray-600">
              進捗: {calculateProgress(material.chunks).toFixed(1)}%
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-4">
              <span className="text-sm font-medium text-gray-700">学習レベル:</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedLevel(1)}
                  className={`px-3 py-1 rounded text-sm font-medium ${
                    selectedLevel === 1
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Level 1 (ヒント付き)
                </button>
                <button
                  onClick={() => setSelectedLevel(2)}
                  className={`px-3 py-1 rounded text-sm font-medium ${
                    selectedLevel === 2
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Level 2 (ヒント無し)
                </button>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-800">チャンク一覧</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {material.chunks.map((chunk, index) => {
                  const isCompleted = completedChunks.has(chunk.id);
                  const isSelected = index === currentChunkIndex;
                  
                  return (
                    <div
                      key={chunk.id}
                      onClick={() => handleChunkSelect(index)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                            isCompleted
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-200 text-gray-600'
                          }`}>
                            {index + 1}
                          </span>
                          <span className={`text-sm ${isSelected ? 'font-medium' : ''}`}>
                            {chunk.name}
                          </span>
                        </div>
                        {isCompleted && (
                          <span className="text-green-500 text-sm">✓</span>
                        )}
                      </div>
                      <div className="mt-2 text-xs text-gray-500">
                        {chunk.statistics.attempts > 0 ? (
                          <span>
                            {chunk.statistics.attempts}回試行 / 成功率{chunk.statistics.successRate}%
                          </span>
                        ) : (
                          <span>未学習</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-800">現在のチャンク</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium mb-2">
                  {material.chunks[currentChunkIndex]?.name}
                </h4>
                <div className="text-sm text-gray-600 mb-4">
                  {material.chunks[currentChunkIndex]?.content.substring(0, 200)}
                  {material.chunks[currentChunkIndex]?.content.length > 200 && '...'}
                </div>
                <div className="mb-4">
                  <div className="text-sm text-gray-600">
                    学習統計:
                  </div>
                  <div className="text-sm">
                    試行回数: {material.chunks[currentChunkIndex]?.statistics.attempts || 0}回
                  </div>
                  <div className="text-sm">
                    成功回数: {material.chunks[currentChunkIndex]?.statistics.successes || 0}回
                  </div>
                  <div className="text-sm">
                    成功率: {material.chunks[currentChunkIndex]?.statistics.successRate || 0}%
                  </div>
                </div>
                <button
                  onClick={handleStartStudy}
                  className="w-full bg-blue-500 text-white py-3 rounded hover:bg-blue-600 font-medium"
                >
                  学習開始 (Level {selectedLevel})
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyDashboard;
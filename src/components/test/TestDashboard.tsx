import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Material, StudyLevel } from '../../types';
import { formatDate } from '../../utils/storage';
import TestFlow from './TestFlow';

interface TestDashboardProps {
  onBack: () => void;
}

const TestDashboard: React.FC<TestDashboardProps> = ({ onBack }) => {
  const { state } = useApp();
  const { materials, testSessions } = state;
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<StudyLevel>(1);
  const [currentView, setCurrentView] = useState<'dashboard' | 'test'>('dashboard');

  const availableMaterials = materials.filter(material => 
    material.chunks.length > 0
  );

  const recentTestSessions = testSessions
    .filter(session => session.completedAt)
    .sort((a, b) => b.completedAt!.getTime() - a.completedAt!.getTime())
    .slice(0, 5);

  const handleStartTest = (material: Material, level: StudyLevel) => {
    setSelectedMaterial(material);
    setSelectedLevel(level);
    setCurrentView('test');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setSelectedMaterial(null);
  };

  if (currentView === 'test' && selectedMaterial) {
    return (
      <TestFlow
        material={selectedMaterial}
        level={selectedLevel}
        onComplete={handleBackToDashboard}
        onBack={handleBackToDashboard}
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">テスト</h2>
          <button
            onClick={onBack}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            戻る
          </button>
        </div>
        
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-sm font-medium text-gray-700">テストレベル選択:</span>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedLevel(1)}
                className={`px-4 py-2 rounded text-sm font-medium ${
                  selectedLevel === 1
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
ヒントあり
              </button>
              <button
                onClick={() => setSelectedLevel(2)}
                className={`px-4 py-2 rounded text-sm font-medium ${
                  selectedLevel === 2
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
ヒントなし
              </button>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-800">教材選択</h3>
          {availableMaterials.length > 0 ? (
            <div className="space-y-3">
              {availableMaterials.map(material => {
                const completedChunks = material.chunks.filter(chunk => chunk.statistics.successes > 0).length;
                const totalChunks = material.chunks.length;
                const progress = Math.round((completedChunks / totalChunks) * 100);
                
                return (
                  <div key={material.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-800">{material.name}</h4>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      完了チャンク: {completedChunks} / {totalChunks}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    {material.lastStudiedAt && (
                      <div className="text-xs text-gray-500 mb-3">
                        最終学習: {formatDate(material.lastStudiedAt)}
                      </div>
                    )}
                    <button
                      onClick={() => handleStartTest(material, selectedLevel)}
                      className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 text-sm font-medium"
                    >
                      テスト開始
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <p>テスト可能な教材がありません</p>
              <p className="text-sm">まずは教材を作成してください</p>
            </div>
          )}
        </div>

        {recentTestSessions.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">最近のテスト履歴</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="space-y-2">
                {recentTestSessions.map(session => {
                  const material = materials.find(m => m.id === session.materialId);
                  
                  return (
                    <div key={session.id} className="flex justify-between items-center py-2">
                      <div>
                        <span className="font-medium text-gray-800">
                          {material?.name || '削除された教材'}
                        </span>
                        <span className="text-sm text-gray-600 ml-2">
                          {session.level === 1 ? 'ヒントあり' : 'ヒントなし'}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-medium ${
                          session.result === 'perfect' ? 'text-green-600' :
                          session.result === 'minor_errors' ? 'text-orange-600' :
                          'text-red-600'
                        }`}>
                          {session.result === 'perfect' ? '完璧' :
                           session.result === 'minor_errors' ? '軽微な間違い' :
                           '要再学習'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {session.completedAt && formatDate(session.completedAt)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestDashboard;
import React from 'react';
import { useApp } from '../../context/AppContext';
import { calculateProgress, findWeakestChunks, formatTime } from '../../utils/storage';

interface ProgressDashboardProps {
  onBack: () => void;
}

const ProgressDashboard: React.FC<ProgressDashboardProps> = ({ onBack }) => {
  const { state } = useApp();
  const { materials, studySessions } = state;

  const totalMaterials = materials.length;
  const completedMaterials = materials.filter(material => 
    calculateProgress(material.chunks) === 100
  ).length;

  const totalChunks = materials.reduce((sum, material) => sum + material.chunks.length, 0);
  const completedChunks = materials.reduce((sum, material) => 
    sum + material.chunks.filter(chunk => chunk.statistics.successes > 0).length, 0
  );

  const totalStudyTime = studySessions.reduce((sum, session) => {
    if (session.completedAt) {
      return sum + (session.completedAt.getTime() - session.startedAt.getTime());
    }
    return sum;
  }, 0);

  const totalAttempts = materials.reduce((sum, material) => 
    sum + material.chunks.reduce((chunkSum, chunk) => chunkSum + chunk.statistics.attempts, 0), 0
  );

  const totalSuccesses = materials.reduce((sum, material) => 
    sum + material.chunks.reduce((chunkSum, chunk) => chunkSum + chunk.statistics.successes, 0), 0
  );

  const overallSuccessRate = totalAttempts > 0 ? (totalSuccesses / totalAttempts) * 100 : 0;

  const allChunks = materials.flatMap(material => 
    material.chunks.map(chunk => ({
      ...chunk,
      materialName: material.name,
      materialId: material.id,
    }))
  );

  const weakestChunks = findWeakestChunks(allChunks, 5);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">進捗管理</h2>
          <button
            onClick={onBack}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            戻る
          </button>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-600">
              {completedMaterials} / {totalMaterials}
            </div>
            <div className="text-sm text-blue-800">完了教材</div>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-600">
              {completedChunks} / {totalChunks}
            </div>
            <div className="text-sm text-green-800">完了チャンク</div>
          </div>
          
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-600">
              {overallSuccessRate.toFixed(1)}%
            </div>
            <div className="text-sm text-purple-800">全体成功率</div>
          </div>
          
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-orange-600">
              {formatTime(totalStudyTime)}
            </div>
            <div className="text-sm text-orange-800">総学習時間</div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-800">教材別進捗</h3>
            <div className="space-y-4">
              {materials.map(material => {
                const progress = calculateProgress(material.chunks);
                const completedChunks = material.chunks.filter(chunk => chunk.statistics.successes > 0).length;
                
                return (
                  <div key={material.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium text-gray-800">{material.name}</h4>
                      <span className="text-sm text-gray-600">
                        {completedChunks} / {material.chunks.length}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="text-right text-xs text-gray-500 mt-1">
                      {progress}% 完了
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-800">弱点チャンク</h3>
            <div className="space-y-3">
              {weakestChunks.length > 0 ? (
                weakestChunks.map((chunk, index) => (
                  <div key={chunk.id} className="border border-red-200 rounded-lg p-3 bg-red-50">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium text-red-800 text-sm">{chunk.name}</h4>
                        <p className="text-xs text-red-600">{chunk.materialName}</p>
                      </div>
                      <div className="text-right text-xs text-red-600">
                        #{index + 1}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <span className="text-red-600">試行: </span>
                        <span className="font-medium">{chunk.statistics.attempts}</span>
                      </div>
                      <div>
                        <span className="text-red-600">成功: </span>
                        <span className="font-medium">{chunk.statistics.successes}</span>
                      </div>
                      <div>
                        <span className="text-red-600">率: </span>
                        <span className="font-medium">{chunk.statistics.successRate.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <p>まだ学習データがありません</p>
                  <p className="text-sm">学習を開始すると弱点チャンクが表示されます</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {materials.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">詳細統計</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">総試行回数:</span>
                  <span className="font-medium ml-2">{totalAttempts}</span>
                </div>
                <div>
                  <span className="text-gray-600">総成功回数:</span>
                  <span className="font-medium ml-2">{totalSuccesses}</span>
                </div>
                <div>
                  <span className="text-gray-600">学習セッション:</span>
                  <span className="font-medium ml-2">{studySessions.length}</span>
                </div>
                <div>
                  <span className="text-gray-600">平均学習時間:</span>
                  <span className="font-medium ml-2">
                    {studySessions.length > 0 ? formatTime(totalStudyTime / studySessions.length) : '0秒'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressDashboard;
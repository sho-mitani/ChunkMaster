import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatDate, calculateProgress } from '../../utils/storage';
import { Material } from '../../types';

interface MaterialListProps {
  onSelectMaterial: (material: Material) => void;
  onEditMaterial: (material: Material) => void;
}

type SortOption = 'name' | 'createdAt' | 'updatedAt' | 'lastStudiedAt';

const MaterialList: React.FC<MaterialListProps> = ({ onSelectMaterial, onEditMaterial }) => {
  const { state, dispatch } = useApp();
  const { materials } = state;
  const [sortBy, setSortBy] = useState<SortOption>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const handleDeleteMaterial = (material: Material) => {
    if (window.confirm(`「${material.name}」を削除しますか？`)) {
      dispatch({ type: 'DELETE_MATERIAL', payload: material.id });
    }
  };

  const handleDuplicateMaterial = (material: Material) => {
    const duplicatedMaterial = {
      ...material,
      id: Date.now().toString(36) + Math.random().toString(36).substr(2, 9),
      name: `${material.name} (コピー)`,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastStudiedAt: undefined,
      chunks: material.chunks.map(chunk => ({
        ...chunk,
        id: Date.now().toString(36) + Math.random().toString(36).substr(2, 9),
        statistics: {
          attempts: 0,
          successes: 0,
          successRate: 0,
          averageTime: 0,
        },
      })),
    };
    dispatch({ type: 'ADD_MATERIAL', payload: duplicatedMaterial });
  };

  const sortedMaterials = [...materials].sort((a, b) => {
    let aValue: any, bValue: any;
    
    switch (sortBy) {
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'createdAt':
        aValue = new Date(a.createdAt).getTime();
        bValue = new Date(b.createdAt).getTime();
        break;
      case 'updatedAt':
        aValue = new Date(a.updatedAt).getTime();
        bValue = new Date(b.updatedAt).getTime();
        break;
      case 'lastStudiedAt':
        aValue = a.lastStudiedAt ? new Date(a.lastStudiedAt).getTime() : 0;
        bValue = b.lastStudiedAt ? new Date(b.lastStudiedAt).getTime() : 0;
        break;
      default:
        return 0;
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });



  if (materials.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <div className="glass rounded-2xl shadow-2xl p-6 sm:p-8 text-center animate-fadeIn">
          <div className="text-4xl sm:text-6xl mb-4 sm:mb-6">📚</div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 gradient-text">教材がありません</h2>
          <p className="text-gray-600 mb-6 text-base sm:text-lg">
            まずは教材を作成してください。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      <div className="glass rounded-2xl shadow-2xl p-4 sm:p-6 animate-fadeIn">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h2 className="text-2xl sm:text-3xl font-bold gradient-text">教材一覧</h2>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-sm text-gray-600 hidden sm:inline">並び替え:</span>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [option, order] = e.target.value.split('-') as [SortOption, 'asc' | 'desc'];
                setSortBy(option);
                setSortOrder(order);
              }}
              className="px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm flex-1 sm:flex-initial"
            >
              <option value="createdAt-desc">作成日（新しい順）</option>
              <option value="createdAt-asc">作成日（古い順）</option>
              <option value="updatedAt-desc">更新日（新しい順）</option>
              <option value="updatedAt-asc">更新日（古い順）</option>
              <option value="lastStudiedAt-desc">最終学習（新しい順）</option>
              <option value="lastStudiedAt-asc">最終学習（古い順）</option>
              <option value="name-asc">教材名（A-Z）</option>
              <option value="name-desc">教材名（Z-A）</option>
            </select>
          </div>
        </div>
        
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {sortedMaterials.map((material, index) => {
            const progress = calculateProgress(material.chunks);
            const totalChunks = material.chunks.length;
            const completedChunks = material.chunks.filter(chunk => chunk.statistics.successes > 0).length;
            
            return (
              <div 
                key={material.id} 
                className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 animate-scaleIn"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex justify-between items-start mb-3 sm:mb-4">
                  <h3 className="font-bold text-lg sm:text-xl text-gray-800 truncate pr-2">
                    {material.name}
                  </h3>
                  <div className="flex gap-1 sm:gap-2 flex-shrink-0">
                    <button
                      onClick={() => onEditMaterial(material)}
                      className="text-blue-500 hover:text-blue-700 text-lg sm:text-xl px-1 sm:px-2 py-1 rounded-lg hover:bg-blue-50 transition-colors"
                      title="編集"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDuplicateMaterial(material)}
                      className="text-green-500 hover:text-green-700 text-lg sm:text-xl px-1 sm:px-2 py-1 rounded-lg hover:bg-green-50 transition-colors"
                      title="複製"
                    >
                      📋
                    </button>
                    <button
                      onClick={() => handleDeleteMaterial(material)}
                      className="text-red-500 hover:text-red-700 text-lg sm:text-xl px-1 sm:px-2 py-1 rounded-lg hover:bg-red-50 transition-colors"
                      title="削除"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                
                <div className="mb-3 sm:mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs sm:text-sm text-gray-600 font-medium">進捗</span>
                    <span className="text-xs sm:text-sm font-bold text-gray-800">
                      {completedChunks} / {totalChunks} チャンク
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3 shadow-inner">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 sm:h-3 rounded-full transition-all duration-500 shadow-sm"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="text-right text-xs text-gray-500 mt-1 font-medium">
                    {progress}% 完了
                  </div>
                </div>
                
                <div className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">📅</span>
                    <span className="truncate">作成日: {formatDate(material.createdAt)}</span>
                  </div>
                  {material.lastStudiedAt && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400">📖</span>
                      <span className="truncate">最終学習: {formatDate(material.lastStudiedAt)}</span>
                    </div>
                  )}
                </div>
                
                <div className="text-xs text-gray-500 mb-3 sm:mb-4 p-2 sm:p-3 bg-gray-50 rounded-lg">
                  {material.content.substring(0, 60)}
                  {material.content.length > 60 && '...'}
                </div>
                
                <button
                  onClick={() => onSelectMaterial(material)}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2 sm:py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-600 transition-all duration-200 transform hover:scale-105 shadow-lg shadow-blue-500/25 text-sm sm:text-base"
                >
                  学習開始
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MaterialList;
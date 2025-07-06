import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Material } from '../../types';
import { getLineHints } from '../../utils/textComparison';

interface MaterialEditProps {
  material: Material;
  onBack: () => void;
}

const MaterialEdit: React.FC<MaterialEditProps> = ({ material, onBack }) => {
  const { dispatch } = useApp();
  const [materialName, setMaterialName] = useState(material.name);
  const [chunks, setChunks] = useState(material.chunks);

  useEffect(() => {
    setMaterialName(material.name);
    setChunks(material.chunks);
  }, [material]);

  const handleChunkNameChange = (index: number, name: string) => {
    const newChunks = [...chunks];
    newChunks[index].name = name;
    setChunks(newChunks);
  };

  const handleChunkContentChange = (index: number, content: string) => {
    const newChunks = [...chunks];
    newChunks[index].content = content;
    setChunks(newChunks);
  };

  const handleSubmit = () => {
    if (!materialName.trim()) {
      alert('教材名を入力してください');
      return;
    }

    const updatedMaterial: Material = {
      ...material,
      name: materialName.trim(),
      chunks: chunks,
      content: chunks.map(chunk => chunk.content).join('\n\n'),
      updatedAt: new Date(),
    };

    dispatch({ type: 'UPDATE_MATERIAL', payload: updatedMaterial });
    onBack();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">教材編集</h2>
            <button
              onClick={onBack}
              className="text-gray-500 hover:text-gray-700 text-xl"
            >
              ×
            </button>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              教材名
            </label>
            <input
              type="text"
              value={materialName}
              onChange={(e) => setMaterialName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="教材名を入力してください"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-4">
              チャンク編集
            </label>
            <div className="space-y-4">
              {chunks.map((chunk, index) => (
                <div key={chunk.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      チャンク名
                    </label>
                    <input
                      type="text"
                      value={chunk.name}
                      onChange={(e) => handleChunkNameChange(index, e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      チャンク内容
                    </label>
                    <textarea
                      value={chunk.content}
                      onChange={(e) => handleChunkContentChange(index, e.target.value)}
                      maxLength={10000}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 h-24 resize-y"
                    />
                  </div>
                  <div className="text-xs text-gray-500">
                    <div className="whitespace-pre-line text-xs text-gray-500">
                      {getLineHints(chunk.content)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onBack}
              className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
            >
              キャンセル
            </button>
            <button
              onClick={handleSubmit}
              className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
            >
              更新
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaterialEdit;
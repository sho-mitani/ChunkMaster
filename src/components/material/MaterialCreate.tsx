import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { createMaterial } from '../../utils/storage';
import { getLineHints } from '../../utils/textComparison';
import { Material, Chunk } from '../../types';

interface MaterialCreateProps {
  onBack: () => void;
}

const MaterialCreate: React.FC<MaterialCreateProps> = ({ onBack }) => {
  const { dispatch } = useApp();
  const [materialName, setMaterialName] = useState('');
  const [content, setContent] = useState('');
  const [chunks, setChunks] = useState<{ name: string; content: string }[]>([]);
  const [isPreview, setIsPreview] = useState(false);
  const [textareaRef, setTextareaRef] = useState<HTMLTextAreaElement | null>(null);

  const handleContentChange = (value: string) => {
    setContent(value);
  };

  const handleChunkNameChange = (index: number, name: string) => {
    const newChunks = [...chunks];
    newChunks[index].name = name;
    setChunks(newChunks);
  };

  const handleTextSelection = () => {
    if (!textareaRef) return;
    
    const start = textareaRef.selectionStart;
    const end = textareaRef.selectionEnd;
    
    if (start === end) {
      alert('テキストを範囲選択してからボタンを押してください');
      return;
    }
    
    const selectedText = content.substring(start, end);
    if (selectedText.trim().length === 0) {
      alert('有効なテキストを選択してください');
      return;
    }
    
    const newChunk = {
      name: `チャンク${chunks.length + 1}`,
      content: selectedText
    };
    
    setChunks([...chunks, newChunk]);
    
    // 選択範囲をクリア
    textareaRef.setSelectionRange(start, start);
  };

  const removeChunk = (index: number) => {
    setChunks(chunks.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!materialName.trim() || chunks.length === 0) {
      alert('教材名とチャンクを入力してください');
      return;
    }

    const material = createMaterial(materialName.trim(), content, chunks);
    dispatch({ type: 'ADD_MATERIAL', payload: material });
    
    setMaterialName('');
    setContent('');
    setChunks([]);
    setIsPreview(false);
    
    alert('教材が作成されました！');
  };

  const characterCount = content.length;
  const maxCharacters = 10000;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">教材作成</h2>
          <button
            onClick={onBack}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            戻る
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
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">
              教材内容
            </label>
            <span className={`text-sm ${characterCount > maxCharacters ? 'text-red-500' : 'text-gray-500'}`}>
              {characterCount.toLocaleString()} / {maxCharacters.toLocaleString()} 文字
            </span>
          </div>
          <textarea
            ref={(ref) => setTextareaRef(ref)}
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-64 resize-y"
            placeholder="長文を入力してください（最大10,000文字）"
          />
        </div>

        <div className="mb-6">
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800 mb-3">
              範囲選択でチャンクを作成：上記のテキストエリアで分割したい部分を選択してから「選択部分をチャンクに追加」ボタンを押してください。
            </p>
            <button
              onClick={handleTextSelection}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-sm"
            >
              選択部分をチャンクに追加
            </button>
          </div>

          <div className="space-y-4">
            {chunks.map((chunk, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <input
                    type="text"
                    value={chunk.name}
                    onChange={(e) => handleChunkNameChange(index, e.target.value)}
                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => removeChunk(index)}
                    className="ml-2 text-red-500 hover:text-red-700 text-sm"
                  >
                    削除
                  </button>
                </div>
                <textarea
                  value={chunk.content}
                  onChange={(e) => {
                    const newChunks = [...chunks];
                    newChunks[index].content = e.target.value;
                    setChunks(newChunks);
                  }}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 h-20 resize-y"
                  placeholder="チャンクの内容を入力してください"
                />
                <div className="text-xs text-gray-500">
                  <div className="whitespace-pre-line text-xs text-gray-500">
                    {getLineHints(chunk.content)}
                  </div>
                  <pre style={{fontSize: '10px', color: 'red'}}>
                    Debug: {chunk.content.split('\n').map(line => line.substring(0, 8)).join('\n')}
                  </pre>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setIsPreview(!isPreview)}
            className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
          >
            {isPreview ? 'プレビューを閉じる' : 'プレビュー'}
          </button>
          <button
            onClick={handleSubmit}
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
            disabled={!materialName.trim() || chunks.length === 0}
          >
            教材を作成
          </button>
        </div>

        {isPreview && (
          <div className="mt-6 border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">プレビュー</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">教材名: {materialName}</h4>
              <p className="text-sm text-gray-600 mb-4">
                チャンク数: {chunks.length}個
              </p>
              <div className="space-y-3">
                {chunks.map((chunk, index) => (
                  <div key={index} className="bg-white p-3 rounded border">
                    <h5 className="font-medium text-sm mb-1">{chunk.name}</h5>
                    <div className="text-xs text-gray-500">
                      <div className="whitespace-pre-line text-xs text-gray-500">
                        {getLineHints(chunk.content)}
                      </div>
                      <pre style={{fontSize: '10px', color: 'red'}}>
                        Debug: {chunk.content.split('\n').map(line => line.substring(0, 8)).join('\n')}
                      </pre>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MaterialCreate;
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { createMaterial } from '../../utils/storage';
import { getLineHints } from '../../utils/textComparison';

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
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <div className="bg-white rounded-lg sm:rounded-xl shadow-md p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-0">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">教材作成</h2>
          <button
            onClick={onBack}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 text-sm sm:text-base min-h-[44px] w-full sm:w-auto"
          >
            戻る
          </button>
        </div>
        
        <div className="mb-4 sm:mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            教材名
          </label>
          <input
            type="text"
            value={materialName}
            onChange={(e) => setMaterialName(e.target.value)}
            className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base min-h-[44px]"
            placeholder="教材名を入力してください"
          />
        </div>

        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-1 sm:gap-0">
            <label className="block text-sm font-medium text-gray-700">
              教材内容
            </label>
            <span className={`text-xs sm:text-sm ${characterCount > maxCharacters ? 'text-red-500' : 'text-gray-500'}`}>
              {characterCount.toLocaleString()} / {maxCharacters.toLocaleString()} 文字
            </span>
          </div>
          <textarea
            ref={(ref) => setTextareaRef(ref)}
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            maxLength={maxCharacters}
            className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-48 sm:min-h-64 resize-y text-base"
            placeholder="長文を入力してください（最大10,000文字）"
          />
        </div>

        <div className="mb-4 sm:mb-6">
          <div className="mb-4 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs sm:text-sm text-blue-800 mb-3">
              範囲選択でチャンクを作成：上記のテキストエリアで分割したい部分を選択してから「選択部分をチャンクに追加」ボタンを押してください。
            </p>
            <button
              onClick={handleTextSelection}
              className="bg-blue-500 text-white px-4 py-2 sm:py-3 rounded hover:bg-blue-600 text-sm min-h-[44px] w-full sm:w-auto"
            >
              選択部分をチャンクに追加
            </button>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {chunks.map((chunk, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-2 sm:gap-0">
                  <input
                    type="text"
                    value={chunk.name}
                    onChange={(e) => handleChunkNameChange(index, e.target.value)}
                    className="w-full sm:flex-1 px-2 sm:px-3 py-1 sm:py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[40px]"
                  />
                  <button
                    onClick={() => removeChunk(index)}
                    className="sm:ml-2 text-red-500 hover:text-red-700 text-sm px-3 py-1 rounded hover:bg-red-50 min-h-[40px] w-full sm:w-auto"
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
                  maxLength={10000}
                  className="w-full px-2 sm:px-3 py-1 sm:py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 h-16 sm:h-20 resize-y"
                  placeholder="チャンクの内容を入力してください"
                />
                <div className="text-xs text-gray-500 mt-2">
                  <div className="whitespace-pre-line text-xs text-gray-500">
                    {getLineHints(chunk.content)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => setIsPreview(!isPreview)}
            className="bg-gray-500 text-white px-6 py-2 sm:py-3 rounded hover:bg-gray-600 text-sm sm:text-base min-h-[44px] order-2 sm:order-1"
          >
            {isPreview ? 'プレビューを閉じる' : 'プレビュー'}
          </button>
          <button
            onClick={handleSubmit}
            className="bg-blue-500 text-white px-6 py-2 sm:py-3 rounded hover:bg-blue-600 text-sm sm:text-base min-h-[44px] order-1 sm:order-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
            disabled={!materialName.trim() || chunks.length === 0}
          >
            教材を作成
          </button>
        </div>

        {isPreview && (
          <div className="mt-4 sm:mt-6 border-t pt-4 sm:pt-6">
            <h3 className="text-lg font-semibold mb-4">プレビュー</h3>
            <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
              <h4 className="font-medium mb-2 text-sm sm:text-base">教材名: {materialName}</h4>
              <p className="text-xs sm:text-sm text-gray-600 mb-4">
                チャンク数: {chunks.length}個
              </p>
              <div className="space-y-2 sm:space-y-3">
                {chunks.map((chunk, index) => (
                  <div key={index} className="bg-white p-2 sm:p-3 rounded border">
                    <h5 className="font-medium text-xs sm:text-sm mb-1">{chunk.name}</h5>
                    <div className="text-xs text-gray-500">
                      <div className="whitespace-pre-line text-xs text-gray-500">
                        {getLineHints(chunk.content)}
                      </div>
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
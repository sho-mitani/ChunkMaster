import React from 'react';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          ChunkMaster
        </h1>
        <p className="text-gray-600 mb-6">
          チャンク学習アプリ
        </p>
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          アプリケーションが正常に起動しました！
        </div>
      </div>
    </div>
  );
}

export default App;
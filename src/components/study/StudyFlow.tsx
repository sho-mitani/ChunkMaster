import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Material, StudyLevel } from '../../types';
import { createStudySession } from '../../utils/storage';
import StudyDashboard from './StudyDashboard';
import UnderstandingPhase from './UnderstandingPhase';
import ShadowingPhase from './ShadowingPhase';
import ResultPhase from './ResultPhase';

interface StudyFlowProps {
  material: Material;
  onBack: () => void;
}

type StudyPhase = 'dashboard' | 'understanding' | 'shadowing' | 'result';

const StudyFlow: React.FC<StudyFlowProps> = ({ material, onBack }) => {
  const { state, dispatch } = useApp();
  const [currentPhase, setCurrentPhase] = useState<StudyPhase>('dashboard');
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
  const [selectedLevel, setSelectedLevel] = useState<StudyLevel>(1);
  const [inputText, setInputText] = useState('');
  const [studySession, setStudySession] = useState<{
    startTime: Date;
    currentChunkIndex: number;
    level: StudyLevel;
    completedChunks: number[];
  } | null>(null);

  const handleStartStudy = (chunkIndex: number, level: StudyLevel) => {
    setCurrentChunkIndex(chunkIndex);
    setSelectedLevel(level);
    setInputText('');
    setStudySession({
      startTime: new Date(),
      currentChunkIndex: chunkIndex,
      level,
      completedChunks: [],
    });
    
    // 学習セッションを作成
    const session = createStudySession(material.id, material.chunks[chunkIndex].id, level);
    dispatch({ type: 'START_STUDY_SESSION', payload: session });
    
    dispatch({ type: 'SET_CURRENT_MATERIAL', payload: material });
    dispatch({ type: 'SET_CURRENT_CHUNK', payload: material.chunks[chunkIndex] });
    setCurrentPhase('understanding');
  };

  const handlePhaseComplete = (phase: StudyPhase) => {
    if (phase === 'understanding') {
      setCurrentPhase('shadowing');
    } else if (phase === 'shadowing') {
      setCurrentPhase('result');
    } else if (phase === 'result') {
      // 次のチャンクに進むか、セッション終了
      const nextChunkIndex = currentChunkIndex + 1;
      if (nextChunkIndex < material.chunks.length) {
        setCurrentChunkIndex(nextChunkIndex);
        setInputText('');
        dispatch({ type: 'SET_CURRENT_CHUNK', payload: material.chunks[nextChunkIndex] });
        setCurrentPhase('understanding');
      } else {
        // 全チャンク完了
        setCurrentPhase('dashboard');
        setStudySession(null);
      }
    }
  };

  const handleShadowingComplete = (text: string) => {
    setInputText(text);
    setCurrentPhase('result');
  };

  const handleBackToDashboard = () => {
    setCurrentPhase('dashboard');
    setStudySession(null);
  };

  const currentChunk = material.chunks[currentChunkIndex];

  if (currentPhase === 'dashboard') {
    return (
      <StudyDashboard
        material={material}
        onStartStudy={handleStartStudy}
        onBack={onBack}
      />
    );
  }

  if (!currentChunk) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">エラー</h2>
          <p className="text-gray-600 mb-4">チャンクが見つかりません</p>
          <button
            onClick={handleBackToDashboard}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            ダッシュボードに戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* ヘッダー */}
      <div className="glass shadow-2xl border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBackToDashboard}
                className="text-gray-600 hover:text-gray-800 px-4 py-2 rounded-xl hover:bg-gray-100 transition-colors"
              >
                ← ダッシュボード
              </button>
              <div>
                <h1 className="text-2xl font-bold gradient-text">
                  {material.name}
                </h1>
                <div className="text-base text-gray-600 font-medium">
                  チャンク {currentChunkIndex + 1} / {material.chunks.length} 
                  (Level {selectedLevel})
                </div>
              </div>
            </div>
            <div className="text-lg text-gray-600 font-semibold px-4 py-2 bg-gray-100 rounded-xl">
              {currentPhase === 'understanding' && '理解段階'}
              {currentPhase === 'shadowing' && 'シャドーイング段階'}
              {currentPhase === 'result' && '結果確認'}
            </div>
          </div>
        </div>
      </div>

      {/* 学習フェーズ */}
      {currentPhase === 'understanding' && (
        <UnderstandingPhase
          chunk={currentChunk}
          level={selectedLevel}
          onComplete={() => handlePhaseComplete('understanding')}
        />
      )}

      {currentPhase === 'shadowing' && (
        <ShadowingPhase
          chunk={currentChunk}
          level={selectedLevel}
          onComplete={handleShadowingComplete}
        />
      )}

      {currentPhase === 'result' && (
        <ResultPhase
          chunk={currentChunk}
          level={selectedLevel}
          inputText={inputText}
          onComplete={() => handlePhaseComplete('result')}
        />
      )}
    </div>
  );
};

export default StudyFlow;
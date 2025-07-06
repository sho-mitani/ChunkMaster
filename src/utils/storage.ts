import { Material, StudySession, TestSession, ChunkStatistics } from '../types';

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
};

export const createMaterial = (name: string, content: string, chunks: any[]): Material => {
  return {
    id: generateId(),
    name,
    content,
    chunks: chunks.map((chunk, index) => ({
      id: generateId(),
      name: chunk.name,
      content: chunk.content,
      order: index,
      statistics: createInitialStatistics(),
    })),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
};

export const createInitialStatistics = (): ChunkStatistics => {
  return {
    attempts: 0,
    successes: 0,
    successRate: 0,
    averageTime: 0,
  };
};

export const createStudySession = (
  materialId: string,
  chunkId: string,
  level: 1 | 2
): StudySession => {
  return {
    id: generateId(),
    materialId,
    chunkId,
    level,
    startedAt: new Date(),
    result: 'retry',
    inputText: '',
    accuracy: 0,
  };
};

export const createTestSession = (
  materialId: string,
  level: 1 | 2,
  scheduledAt: Date = new Date()
): TestSession => {
  return {
    id: generateId(),
    materialId,
    level,
    scheduledAt,
    result: 'retry',
    accuracy: 0,
  };
};

export const updateChunkStatistics = (
  currentStats: ChunkStatistics,
  success: boolean,
  timeSpent: number
): ChunkStatistics => {
  const newAttempts = currentStats.attempts + 1;
  const newSuccesses = currentStats.successes + (success ? 1 : 0);
  const newSuccessRate = (newSuccesses / newAttempts) * 100;
  
  const totalTime = currentStats.averageTime * currentStats.attempts + timeSpent;
  const newAverageTime = totalTime / newAttempts;
  
  return {
    attempts: newAttempts,
    successes: newSuccesses,
    successRate: Math.round(newSuccessRate * 100) / 100,
    lastSuccessAt: success ? new Date() : currentStats.lastSuccessAt,
    averageTime: Math.round(newAverageTime * 100) / 100,
  };
};

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatTime = (milliseconds: number): string => {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}時間${minutes % 60}分`;
  } else if (minutes > 0) {
    return `${minutes}分${seconds % 60}秒`;
  } else {
    return `${seconds}秒`;
  }
};

export const calculateProgress = (chunks: any[]): number => {
  if (chunks.length === 0) return 0;
  
  const completedChunks = chunks.filter(chunk => chunk.statistics.successes > 0);
  return Math.round((completedChunks.length / chunks.length) * 100);
};

export const findWeakestChunks = (chunks: any[], limit: number = 3): any[] => {
  return chunks
    .filter(chunk => chunk.statistics.attempts > 0)
    .sort((a, b) => {
      if (a.statistics.successRate === b.statistics.successRate) {
        return b.statistics.attempts - a.statistics.attempts;
      }
      return a.statistics.successRate - b.statistics.successRate;
    })
    .slice(0, limit);
};

export const getRecommendedReviewChunks = (chunks: any[]): any[] => {
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
  
  return chunks.filter(chunk => {
    const lastSuccess = chunk.statistics.lastSuccessAt;
    if (!lastSuccess) return false;
    
    const successDate = new Date(lastSuccess);
    return successDate >= threeDaysAgo && successDate <= oneDayAgo;
  });
};
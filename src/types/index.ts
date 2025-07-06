export interface Material {
  id: string;
  name: string;
  content: string;
  chunks: Chunk[];
  createdAt: Date;
  updatedAt: Date;
  lastStudiedAt?: Date;
}

export interface Chunk {
  id: string;
  name: string;
  content: string;
  order: number;
  statistics: ChunkStatistics;
}

export interface ChunkStatistics {
  attempts: number;
  successes: number;
  successRate: number;
  lastSuccessAt?: Date;
  averageTime: number;
}

export interface StudySession {
  id: string;
  materialId: string;
  chunkId: string;
  level: 1 | 2;
  startedAt: Date;
  completedAt?: Date;
  result: 'perfect' | 'minor_errors' | 'retry';
  inputText: string;
  accuracy: number;
}

export interface TestSession {
  id: string;
  materialId: string;
  level: 1 | 2;
  scheduledAt: Date;
  completedAt?: Date;
  result: 'perfect' | 'minor_errors' | 'retry';
  accuracy: number;
}

export interface AppState {
  materials: Material[];
  currentMaterial?: Material;
  currentChunk?: Chunk;
  currentStudySession?: StudySession;
  studySessions: StudySession[];
  testSessions: TestSession[];
}

export type AppAction =
  | { type: 'SET_MATERIALS'; payload: Material[] }
  | { type: 'ADD_MATERIAL'; payload: Material }
  | { type: 'UPDATE_MATERIAL'; payload: Material }
  | { type: 'DELETE_MATERIAL'; payload: string }
  | { type: 'SET_CURRENT_MATERIAL'; payload: Material }
  | { type: 'SET_CURRENT_CHUNK'; payload: Chunk }
  | { type: 'START_STUDY_SESSION'; payload: StudySession }
  | { type: 'COMPLETE_STUDY_SESSION'; payload: { id: string; result: 'perfect' | 'minor_errors' | 'retry'; accuracy: number; inputText: string } }
  | { type: 'ADD_TEST_SESSION'; payload: TestSession }
  | { type: 'UPDATE_CHUNK_STATISTICS'; payload: { materialId: string; chunkId: string; statistics: ChunkStatistics } };

export type StudyLevel = 1 | 2;

export type StudyResult = 'perfect' | 'minor_errors' | 'retry';

export interface TextDiff {
  correct: string;
  incorrect: string;
  missing: string;
  extra: string;
}

export interface ComparisonResult {
  accuracy: number;
  diff: TextDiff;
  isMatch: boolean;
}
import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { AppState, AppAction, Material, Chunk, StudySession, TestSession, ChunkStatistics } from '../types';

const initialState: AppState = {
  materials: [],
  studySessions: [],
  testSessions: [],
};

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_MATERIALS':
      return { ...state, materials: action.payload };
    
    case 'ADD_MATERIAL':
      return { ...state, materials: [...state.materials, action.payload] };
    
    case 'UPDATE_MATERIAL':
      return {
        ...state,
        materials: state.materials.map(material =>
          material.id === action.payload.id ? action.payload : material
        ),
      };
    
    case 'DELETE_MATERIAL':
      return {
        ...state,
        materials: state.materials.filter(material => material.id !== action.payload),
      };
    
    case 'SET_CURRENT_MATERIAL':
      return { ...state, currentMaterial: action.payload };
    
    case 'SET_CURRENT_CHUNK':
      return { ...state, currentChunk: action.payload };
    
    case 'START_STUDY_SESSION':
      return {
        ...state,
        currentStudySession: action.payload,
        studySessions: [...state.studySessions, action.payload],
      };
    
    case 'COMPLETE_STUDY_SESSION':
      const updatedSessions = state.studySessions.map(session =>
        session.id === action.payload.id
          ? {
              ...session,
              completedAt: new Date(),
              result: action.payload.result,
              accuracy: action.payload.accuracy,
              inputText: action.payload.inputText,
            }
          : session
      );
      return {
        ...state,
        studySessions: updatedSessions,
        currentStudySession: undefined,
      };
    
    case 'ADD_TEST_SESSION':
      return {
        ...state,
        testSessions: [...state.testSessions, action.payload],
      };
    
    case 'UPDATE_CHUNK_STATISTICS':
      return {
        ...state,
        materials: state.materials.map(material =>
          material.id === action.payload.materialId
            ? {
                ...material,
                chunks: material.chunks.map(chunk =>
                  chunk.id === action.payload.chunkId
                    ? { ...chunk, statistics: action.payload.statistics }
                    : chunk
                ),
              }
            : material
        ),
      };
    
    default:
      return state;
  }
};

const STORAGE_KEY = 'chunkmaster-app-state';

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        parsedState.materials = parsedState.materials.map((material: any) => ({
          ...material,
          createdAt: new Date(material.createdAt),
          updatedAt: new Date(material.updatedAt),
          lastStudiedAt: material.lastStudiedAt ? new Date(material.lastStudiedAt) : undefined,
          chunks: material.chunks.map((chunk: any) => ({
            ...chunk,
            statistics: {
              ...chunk.statistics,
              lastSuccessAt: chunk.statistics.lastSuccessAt 
                ? new Date(chunk.statistics.lastSuccessAt) 
                : undefined,
            },
          })),
        }));
        parsedState.studySessions = parsedState.studySessions.map((session: any) => ({
          ...session,
          startedAt: new Date(session.startedAt),
          completedAt: session.completedAt ? new Date(session.completedAt) : undefined,
        }));
        parsedState.testSessions = (parsedState.testSessions || []).map((session: any) => ({
          ...session,
          scheduledAt: new Date(session.scheduledAt),
          completedAt: session.completedAt ? new Date(session.completedAt) : undefined,
        }));
        // Handle legacy reviewSessions
        if (parsedState.reviewSessions) {
          parsedState.testSessions = parsedState.reviewSessions.map((session: any) => ({
            ...session,
            scheduledAt: new Date(session.scheduledAt),
            completedAt: session.completedAt ? new Date(session.completedAt) : undefined,
          }));
          delete parsedState.reviewSessions;
        }
        dispatch({ type: 'SET_MATERIALS', payload: parsedState.materials });
      } catch (error) {
        console.error('Failed to load saved state:', error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
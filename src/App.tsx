import React, { useState } from 'react';
import { AppProvider } from './context/AppContext';
import Navigation from './components/common/Navigation';
import MaterialList from './components/material/MaterialList';
import MaterialCreate from './components/material/MaterialCreate';
import MaterialEdit from './components/material/MaterialEdit';
import StudyFlow from './components/study/StudyFlow';
import TestDashboard from './components/test/TestDashboard';
import TestFlow from './components/test/TestFlow';
import ProgressDashboard from './components/progress/ProgressDashboard';
import { Material } from './types';

type View = 'materials' | 'create' | 'edit' | 'study' | 'test' | 'progress';

function App() {
  const [currentView, setCurrentView] = useState<View>('materials');
  const [currentMaterial, setCurrentMaterial] = useState<Material | null>(null);

  const handleMaterialSelect = (material: Material) => {
    setCurrentMaterial(material);
    setCurrentView('study');
  };

  const handleMaterialEdit = (material: Material) => {
    setCurrentMaterial(material);
    setCurrentView('edit');
  };

  const handleBackToMaterials = () => {
    setCurrentView('materials');
    setCurrentMaterial(null);
  };

  const handleViewChange = (view: string) => {
    setCurrentView(view as View);
  };

  const renderContent = () => {
    switch (currentView) {
      case 'materials':
        return (
          <MaterialList
            onSelectMaterial={handleMaterialSelect}
            onEditMaterial={handleMaterialEdit}
          />
        );
      case 'create':
        return (
          <MaterialCreate
            onBack={handleBackToMaterials}
          />
        );
      case 'edit':
        return currentMaterial ? (
          <MaterialEdit
            material={currentMaterial}
            onBack={handleBackToMaterials}
          />
        ) : null;
      case 'study':
        return currentMaterial ? (
          <StudyFlow
            material={currentMaterial}
            onBack={handleBackToMaterials}
          />
        ) : null;
      case 'test':
        return (
          <TestDashboard
            onBack={handleBackToMaterials}
          />
        );
      case 'progress':
        return (
          <ProgressDashboard
            onBack={handleBackToMaterials}
          />
        );

      default:
        return null;
    }
  };

  return (
    <AppProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <Navigation
          currentView={currentView}
          onViewChange={handleViewChange}
        />
        <main className="animate-fadeIn">
          {renderContent()}
        </main>
      </div>
    </AppProvider>
  );
}

export default App;

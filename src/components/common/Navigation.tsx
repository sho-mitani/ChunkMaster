import React, { useState } from 'react';

interface NavigationProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentView, onViewChange }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const navItems = [
    { id: 'materials', label: '教材一覧', icon: '📚' },
    { id: 'create', label: '教材作成', icon: '➕' },
    { id: 'study', label: '学習', icon: '📖' },
    { id: 'test', label: 'テスト', icon: '📝' },
    { id: 'progress', label: '進捗', icon: '📊' },
  ];

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleMobileItemClick = (itemId: string) => {
    onViewChange(itemId);
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mr-4 sm:mr-8">
              ChunkMaster
            </h1>
            {/* Desktop Navigation */}
            <div className="hidden md:flex space-x-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  className={`px-3 lg:px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                    currentView === item.id
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/25'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:shadow-md'
                  }`}
                >
                  <span className="mr-2">{item.icon}</span>
                  <span className="hidden lg:inline">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={handleMobileMenuToggle}
              className="p-2 rounded-lg text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden pb-4 animate-slideIn">
            <div className="grid grid-cols-2 gap-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleMobileItemClick(item.id)}
                  className={`p-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    currentView === item.id
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/25'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:shadow-md'
                  }`}
                >
                  <div className="flex flex-col items-center">
                    <span className="text-xl mb-1">{item.icon}</span>
                    <span className="text-xs">{item.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
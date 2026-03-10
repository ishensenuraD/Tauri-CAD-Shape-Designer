import React from 'react';
import { useSelector } from 'react-redux';
import ShapeLibrary from './components/ShapeLibrary/ShapeLibrary';
import ShapeEditor from './components/ShapeEditor/ShapeEditor';
import Canvas from './components/Canvas/Canvas';
import './App.css';

function App() {
  const { currentShape, selectedShapeType } = useSelector((state) => state.shape);

  return (
    <main className="min-h-screen bg-gray-50 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6 lg:mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-cad-dark">Tauri CAD Shape Designer</h1>
          <p className="text-gray-600 mt-2">Design parametric shapes with real-time preview</p>
        </header>
        
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 lg:gap-6">
          {/* Left Sidebar - Shape Library */}
          <div className="xl:col-span-1">
            <div className="space-y-4">
              <ShapeLibrary />
              <ShapeEditor />
            </div>
          </div>
          
          {/* Main Content Area - Canvas */}
          <div className="xl:col-span-3">
            <div className="bg-white rounded-lg shadow-md p-4 lg:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg lg:text-xl font-semibold text-cad-dark">Shape Preview</h2>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">Shape:</span>
                  <span className="px-2 py-1 bg-cad-blue text-white text-xs font-medium rounded">
                    {selectedShapeType}
                  </span>
                </div>
              </div>
              
              <Canvas />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default App;

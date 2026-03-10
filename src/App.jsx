import React from 'react';
import { useSelector } from 'react-redux';
import ShapeLibrary from './components/ShapeLibrary/ShapeLibrary';
import './App.css';

function App() {
  const { currentShape, selectedShapeType } = useSelector((state) => state.shape);

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-cad-dark mb-8">Tauri CAD Shape Designer</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Shape Library Panel */}
          <div className="lg:col-span-1">
            <ShapeLibrary />
          </div>
          
          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-cad-dark mb-4">Shape Preview</h2>
              
              {/* Current Shape Info */}
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>Selected Shape:</strong> {selectedShapeType}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  <strong>Parameters:</strong> {JSON.stringify(currentShape.parameters)}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  <strong>Rotation:</strong> {currentShape.rotation}°
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  <strong>Flip:</strong> X: {currentShape.flipX ? 'Yes' : 'No'}, Y: {currentShape.flipY ? 'Yes' : 'No'}
                </p>
              </div>
              
              {/* Canvas Placeholder */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg h-96 flex items-center justify-center">
                <p className="text-gray-500">Canvas will be implemented in Phase 5</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default App;

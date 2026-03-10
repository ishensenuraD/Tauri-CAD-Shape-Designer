import React from 'react';
import { useSelector } from 'react-redux';

const Canvas = () => {
  const { currentShape, selectedShapeType } = useSelector((state) => state.shape);

  return (
    <div className="relative">
      {/* Canvas Area */}
      <div className="border-2 border-gray-200 rounded-lg bg-gray-50 h-96 lg:h-[500px] flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 text-gray-400">
            {selectedShapeType === 'rectangle' && '▭'}
            {selectedShapeType === 'circle' && '○'}
            {selectedShapeType === 'triangle' && '△'}
            {selectedShapeType === 'lshape' && '└'}
            {selectedShapeType === 'trapezoid' && '▱'}
          </div>
          <p className="text-gray-500 font-medium">{selectedShapeType}</p>
          <p className="text-sm text-gray-400 mt-2">
            {Object.entries(currentShape.parameters)
              .map(([key, value]) => `${key}: ${value}mm`)
              .join(', ')}
          </p>
          <div className="mt-4 text-xs text-gray-400">
            <p>Rotation: {currentShape.rotation}°</p>
            <p>Flip: X={currentShape.flipX ? 'Yes' : 'No'}, Y={currentShape.flipY ? 'Yes' : 'No'}</p>
          </div>
        </div>
      </div>
      
      {/* Canvas Info Bar */}
      <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center space-x-4">
          <span className="flex items-center">
            <span className="w-3 h-3 bg-green-400 rounded-full mr-2"></span>
            Live Preview
          </span>
          <span>Scale: 1:1</span>
        </div>
        <div className="flex items-center space-x-2">
          <button className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs font-medium">
            Zoom In
          </button>
          <button className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs font-medium">
            Zoom Out
          </button>
          <button className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs font-medium">
            Reset
          </button>
        </div>
      </div>
      
      {/* Status Bar */}
      <div className="mt-2 p-2 bg-gray-100 rounded text-xs text-gray-600">
        <div className="flex items-center justify-between">
          <span>Canvas ready for rendering in Phase 5</span>
          <span className="text-cad-blue font-medium">
            {selectedShapeType.charAt(0).toUpperCase() + selectedShapeType.slice(1)} Shape
          </span>
        </div>
      </div>
    </div>
  );
};

export default Canvas;

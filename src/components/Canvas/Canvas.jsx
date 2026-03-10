import React from 'react';
import { useSelector } from 'react-redux';
import SVGCanvas from './SVGCanvas.jsx';
import { shapeUtils } from '../../shapes/index.js';

const Canvas = () => {
  const { currentShape, selectedShapeType } = useSelector((state) => state.shape);

  // Check if shape is valid for rendering
  const isShapeValid = () => {
    if (!selectedShapeType || !currentShape.parameters) return false;
    
    const validation = shapeUtils.validateShape(selectedShapeType, currentShape.parameters);
    return validation.isValid;
  };

  return (
    <div className="relative">
      {/* Main SVG Canvas */}
      {isShapeValid() ? (
        <SVGCanvas />
      ) : (
        // Fallback placeholder for invalid shapes
        <div className="border-2 border-gray-200 rounded-lg bg-gray-50 h-96 lg:h-[500px] flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4 text-gray-400">
              {selectedShapeType === 'rectangle' && '▭'}
              {selectedShapeType === 'circle' && '○'}
              {selectedShapeType === 'triangle' && '△'}
              {selectedShapeType === 'lshape' && '└'}
              {selectedShapeType === 'trapezoid' && '▱'}
            </div>
            <p className="text-gray-500 font-medium">{selectedShapeType || 'No Shape'}</p>
            <p className="text-sm text-gray-400 mt-2">
              {currentShape.parameters ? 
                Object.entries(currentShape.parameters)
                  .map(([key, value]) => `${key}: ${value}mm`)
                  .join(', ') : 
                'Select a shape to begin'
              }
            </p>
            <div className="mt-4 text-xs text-gray-400">
              <p>Rotation: {currentShape.rotation}°</p>
              <p>Flip: X={currentShape.flipX ? 'Yes' : 'No'}, Y={currentShape.flipY ? 'Yes' : 'No'}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Canvas Info Bar */}
      <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center space-x-4">
          <span className="flex items-center">
            <span className="w-3 h-3 bg-green-400 rounded-full mr-2"></span>
            {isShapeValid() ? 'Live Rendering' : 'Preview Mode'}
          </span>
          <span>Scale: 1:1</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs bg-cad-blue text-white px-2 py-1 rounded">
            {selectedShapeType ? shapeUtils.getDisplayName(selectedShapeType) : 'No Shape'}
          </span>
        </div>
      </div>
      
      {/* Status Bar */}
      <div className="mt-2 p-2 bg-gray-100 rounded text-xs text-gray-600">
        <div className="flex items-center justify-between">
          <span>
            {isShapeValid() ? 
              'Interactive SVG canvas with real-time shape rendering' : 
              'Canvas ready for rendering in Phase 5'
            }
          </span>
          <span className="text-cad-blue font-medium">
            {isShapeValid() ? 'Interactive Mode' : 'Preview Mode'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Canvas;

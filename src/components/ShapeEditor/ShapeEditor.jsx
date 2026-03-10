import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateParameter, setRotation, setFlipX, setFlipY } from '../../store/shapeSlice';

const ShapeEditor = () => {
  const dispatch = useDispatch();
  const { currentShape, selectedShapeType } = useSelector((state) => state.shape);

  const handleParameterChange = (parameter, value) => {
    dispatch(updateParameter({ parameter, value: Number(value) }));
  };

  const handleRotationChange = (rotation) => {
    dispatch(setRotation(rotation));
  };

  const handleFlipX = (flipX) => {
    dispatch(setFlipX(flipX));
  };

  const handleFlipY = (flipY) => {
    dispatch(setFlipY(flipY));
  };

  const renderParameterInputs = () => {
    const parameters = currentShape.parameters;
    
    switch (selectedShapeType) {
      case 'rectangle':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Width (mm)</label>
              <input
                type="number"
                value={parameters.width}
                onChange={(e) => handleParameterChange('width', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cad-blue"
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Height (mm)</label>
              <input
                type="number"
                value={parameters.height}
                onChange={(e) => handleParameterChange('height', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cad-blue"
                min="1"
              />
            </div>
          </>
        );
      
      case 'circle':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Radius (mm)</label>
            <input
              type="number"
              value={parameters.radius}
              onChange={(e) => handleParameterChange('radius', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cad-blue"
              min="1"
            />
          </div>
        );
      
      case 'triangle':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Base (mm)</label>
              <input
                type="number"
                value={parameters.base}
                onChange={(e) => handleParameterChange('base', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cad-blue"
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Height (mm)</label>
              <input
                type="number"
                value={parameters.height}
                onChange={(e) => handleParameterChange('height', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cad-blue"
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Angle (degrees)</label>
              <input
                type="number"
                value={parameters.angle}
                onChange={(e) => handleParameterChange('angle', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cad-blue"
                min="1"
                max="179"
              />
            </div>
          </>
        );
      
      case 'lshape':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Outer Width (mm)</label>
              <input
                type="number"
                value={parameters.outerWidth}
                onChange={(e) => handleParameterChange('outerWidth', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cad-blue"
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Outer Height (mm)</label>
              <input
                type="number"
                value={parameters.outerHeight}
                onChange={(e) => handleParameterChange('outerHeight', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cad-blue"
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Inner Width (mm)</label>
              <input
                type="number"
                value={parameters.innerWidth}
                onChange={(e) => handleParameterChange('innerWidth', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cad-blue"
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Inner Height (mm)</label>
              <input
                type="number"
                value={parameters.innerHeight}
                onChange={(e) => handleParameterChange('innerHeight', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cad-blue"
                min="1"
              />
            </div>
          </>
        );
      
      case 'trapezoid':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Top Width (mm)</label>
              <input
                type="number"
                value={parameters.topWidth}
                onChange={(e) => handleParameterChange('topWidth', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cad-blue"
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bottom Width (mm)</label>
              <input
                type="number"
                value={parameters.bottomWidth}
                onChange={(e) => handleParameterChange('bottomWidth', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cad-blue"
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Height (mm)</label>
              <input
                type="number"
                value={parameters.height}
                onChange={(e) => handleParameterChange('height', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cad-blue"
                min="1"
              />
            </div>
          </>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="text-lg font-semibold text-cad-dark mb-4">Dimension Editor</h3>
      
      {/* Parameter Inputs */}
      <div className="space-y-3 mb-6">
        {renderParameterInputs()}
      </div>
      
      {/* Transform Controls */}
      <div className="border-t pt-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Transformations</h4>
        
        {/* Rotation */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Rotation</label>
          <div className="grid grid-cols-2 gap-2">
            {[0, 90, 180, 270].map((rotation) => (
              <button
                key={rotation}
                onClick={() => handleRotationChange(rotation)}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  currentShape.rotation === rotation
                    ? 'bg-cad-blue text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {rotation}°
              </button>
            ))}
          </div>
        </div>
        
        {/* Flip Controls */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Flip</label>
          <div className="flex space-x-2">
            <button
              onClick={() => handleFlipX(!currentShape.flipX)}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                currentShape.flipX
                  ? 'bg-cad-blue text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              Flip X
            </button>
            <button
              onClick={() => handleFlipY(!currentShape.flipY)}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                currentShape.flipY
                  ? 'bg-cad-blue text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              Flip Y
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShapeEditor;

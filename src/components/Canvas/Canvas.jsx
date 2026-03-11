import React from 'react';
import { useSelector } from 'react-redux';
import CanvasRenderer from './CanvasRenderer.jsx';

// Simple frontend validation utilities
const validateShapeParameters = (shapeType, parameters) => {
  const errors = [];
  
  if (!shapeType || !parameters) {
    errors.push('Shape type and parameters are required');
    return { isValid: false, errors };
  }

  // Basic validation for all shapes
  Object.entries(parameters).forEach(([key, value]) => {
    if (typeof value !== 'number' || value <= 0) {
      errors.push(`${key} must be a positive number`);
    }
    if (value > 10000) {
      errors.push(`${key} must be less than 10000mm`);
    }
  });

  // Shape-specific validation
  switch (shapeType) {
    case 'triangle':
      if (parameters.angle !== undefined) {
        if (parameters.angle <= 0 || parameters.angle >= 180) {
          errors.push('Angle must be between 0 and 180 degrees');
        }
      }
      break;
    case 'lshape':
      if (parameters.innerWidth >= parameters.outerWidth) {
        errors.push('Inner width must be less than outer width');
      }
      if (parameters.innerHeight >= parameters.outerHeight) {
        errors.push('Inner height must be less than outer height');
      }
      break;
    case 'trapezoid':
      if (parameters.topWidth > parameters.bottomWidth * 2 || parameters.bottomWidth > parameters.topWidth * 2) {
        errors.push('Top and bottom widths should be reasonably proportional');
      }
      break;
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Display name mapping
const getShapeDisplayName = (shapeType) => {
  const names = {
    rectangle: 'Rectangle',
    circle: 'Circle',
    triangle: 'Triangle',
    lshape: 'L-Shape',
    trapezoid: 'Trapezoid'
  };
  return names[shapeType] || shapeType;
};

const Canvas = () => {
  const { currentShape, selectedShapeType } = useSelector((state) => state.shape);

  // Check if shape is valid for rendering
  const isShapeValid = () => {
    if (!selectedShapeType || !currentShape.parameters) return false;
    
    const validation = validateShapeParameters(selectedShapeType, currentShape.parameters);
    return validation.isValid;
  };

  return (
    <div className="relative">
      {/* Main Canvas Renderer */}
      {isShapeValid() ? (
        <CanvasRenderer />
      ) : (
        // Fallback placeholder for invalid shapes
        <div className={`canvas-wrapper ${isShapeValid() ? 'shape-preview-valid' : 'shape-preview-invalid'}`}>
          <div className="canvas-placeholder">
            <div className="canvas-placeholder-icon">
              {selectedShapeType === 'rectangle' && '▭'}
              {selectedShapeType === 'circle' && '○'}
              {selectedShapeType === 'triangle' && '△'}
              {selectedShapeType === 'lshape' && '└'}
              {selectedShapeType === 'trapezoid' && '▱'}
            </div>
            <p className="canvas-placeholder-title">{selectedShapeType || 'No Shape'}</p>
            <p className="canvas-placeholder-text">
              {currentShape.parameters ? 
                Object.entries(currentShape.parameters)
                  .map(([key, value]) => `${key}: ${value}mm`)
                  .join(', ') : 
                'Select a shape to begin'
              }
            </p>
            <div className="canvas-placeholder-details">
              <p>Rotation: {currentShape.rotation}°</p>
              <p>Flip: X={currentShape.flipX ? 'Yes' : 'No'}, Y={currentShape.flipY ? 'Yes' : 'No'}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Canvas Info Bar */}
      <div className="canvas-info-bar">
        <div className="canvas-info-left">
          {selectedShapeType && currentShape.parameters && (
            <span className="dimensions-display">
              {selectedShapeType === 'rectangle' && `W: ${currentShape.parameters.width}mm × H: ${currentShape.parameters.height}mm`}
              {selectedShapeType === 'circle' && `R: ${currentShape.parameters.radius}mm`}
              {selectedShapeType === 'triangle' && `B: ${currentShape.parameters.base}mm × H: ${currentShape.parameters.height}mm`}
              {selectedShapeType === 'lshape' && `W: ${currentShape.parameters.outerWidth}mm × H: ${currentShape.parameters.outerHeight}mm`}
              {selectedShapeType === 'trapezoid' && `W: ${currentShape.parameters.topWidth}mm - ${currentShape.parameters.bottomWidth}mm × H: ${currentShape.parameters.height}mm`}
            </span>
          )}
        </div>
        <div className="canvas-info-right">
          <span className="badge badge-primary">
            {selectedShapeType ? getShapeDisplayName(selectedShapeType) : 'No Shape'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Canvas;

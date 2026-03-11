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
            <div className="form-group">
              <label className="form-label">Width (mm)</label>
              <input
                type="number"
                value={parameters.width}
                onChange={(e) => handleParameterChange('width', e.target.value)}
                className="form-input"
                min="1"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Height (mm)</label>
              <input
                type="number"
                value={parameters.height}
                onChange={(e) => handleParameterChange('height', e.target.value)}
                className="form-input"
                min="1"
              />
            </div>
          </>
        );
      
      case 'circle':
        return (
          <div className="form-group">
            <label className="form-label">Radius (mm)</label>
            <input
              type="number"
              value={parameters.radius}
              onChange={(e) => handleParameterChange('radius', e.target.value)}
              className="form-input"
              min="1"
            />
          </div>
        );
      
      case 'triangle':
        return (
          <>
            <div className="form-group">
              <label className="form-label">Base (mm)</label>
              <input
                type="number"
                value={parameters.base}
                onChange={(e) => handleParameterChange('base', e.target.value)}
                className="form-input"
                min="1"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Height (mm)</label>
              <input
                type="number"
                value={parameters.height}
                onChange={(e) => handleParameterChange('height', e.target.value)}
                className="form-input"
                min="1"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Angle (degrees)</label>
              <input
                type="number"
                value={parameters.angle}
                onChange={(e) => handleParameterChange('angle', e.target.value)}
                className="form-input"
                min="1"
                max="179"
              />
            </div>
          </>
        );
      
      case 'lshape':
        return (
          <>
            <div className="form-group">
              <label className="form-label">Outer Width (mm)</label>
              <input
                type="number"
                value={parameters.outerWidth}
                onChange={(e) => handleParameterChange('outerWidth', e.target.value)}
                className="form-input"
                min="1"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Outer Height (mm)</label>
              <input
                type="number"
                value={parameters.outerHeight}
                onChange={(e) => handleParameterChange('outerHeight', e.target.value)}
                className="form-input"
                min="1"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Inner Width (mm)</label>
              <input
                type="number"
                value={parameters.innerWidth}
                onChange={(e) => handleParameterChange('innerWidth', e.target.value)}
                className="form-input"
                min="1"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Inner Height (mm)</label>
              <input
                type="number"
                value={parameters.innerHeight}
                onChange={(e) => handleParameterChange('innerHeight', e.target.value)}
                className="form-input"
                min="1"
              />
            </div>
          </>
        );
      
      case 'trapezoid':
        return (
          <>
            <div className="form-group">
              <label className="form-label">Top Width (mm)</label>
              <input
                type="number"
                value={parameters.topWidth}
                onChange={(e) => handleParameterChange('topWidth', e.target.value)}
                className="form-input"
                min="1"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Bottom Width (mm)</label>
              <input
                type="number"
                value={parameters.bottomWidth}
                onChange={(e) => handleParameterChange('bottomWidth', e.target.value)}
                className="form-input"
                min="1"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Height (mm)</label>
              <input
                type="number"
                value={parameters.height}
                onChange={(e) => handleParameterChange('height', e.target.value)}
                className="form-input"
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
    <div className="card">
      <h3 className="card-title">Dimension Editor</h3>
      
      {/* Parameter Inputs */}
      <div className="space-y-3 mb-6">
        {renderParameterInputs()}
      </div>
      
      {/* Transform Controls */}
      <div className="section-divider">
        <h4 className="card-subtitle">Transformations</h4>
        
        {/* Rotation */}
        <div className="mb-4">
          <label className="form-label">Rotation</label>
          <div className="grid-2">
            {[0, 90, 180, 270].map((rotation) => (
              <button
                key={rotation}
                onClick={() => handleRotationChange(rotation)}
                className={`btn ${
                  currentShape.rotation === rotation
                    ? 'btn-primary'
                    : 'btn-secondary'
                }`}
              >
                {rotation}°
              </button>
            ))}
          </div>
        </div>
        
        {/* Flip Controls */}
        <div>
          <label className="form-label">Flip</label>
          <div className="space-x-2">
            <button
              onClick={() => handleFlipX(!currentShape.flipX)}
              className={`btn ${
                currentShape.flipX
                  ? 'btn-primary'
                  : 'btn-secondary'
              }`}
            >
              Flip X
            </button>
            <button
              onClick={() => handleFlipY(!currentShape.flipY)}
              className={`btn ${
                currentShape.flipY
                  ? 'btn-primary'
                  : 'btn-secondary'
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

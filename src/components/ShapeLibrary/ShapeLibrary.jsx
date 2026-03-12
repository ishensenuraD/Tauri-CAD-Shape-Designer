import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setShapeType } from '../../store/shapeSlice';

const ShapeLibrary = () => {
  const dispatch = useDispatch();
  const { selectedShapeType, availableShapes } = useSelector((state) => state.shape);

  const shapeButtons = [
    { 
      type: 'rectangle', 
      label: 'Rectangle', 
      icon: (
        <svg className="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect x="4" y="6" width="16" height="12" strokeWidth={2} />
        </svg>
      )
    },
    { 
      type: 'circle', 
      label: 'Circle', 
      icon: (
        <svg className="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="8" strokeWidth={2} />
        </svg>
      )
    },
    { 
      type: 'triangle', 
      label: 'Triangle', 
      icon: (
        <svg className="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4l8 14H4z" />
        </svg>
      )
    },
    { 
      type: 'lshape', 
      label: 'L-Shape', 
      icon: (
        <svg className="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4h10v16H4V4zm10 10h6v6h-6v-6z" />
        </svg>
      )
    },
    { 
      type: 'trapezoid', 
      label: 'Trapezoid', 
      icon: (
        <svg className="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 8h12l-3 8H9z" />
        </svg>
      )
    }
  ];

  const handleShapeSelect = (shapeType) => {
    dispatch(setShapeType(shapeType));
  };

  return (
    <div className="space-y-3">
      {shapeButtons.map((shape) => (
        <button
          key={shape.type}
          onClick={() => handleShapeSelect(shape.type)}
          className={`shape-btn ${
            selectedShapeType === shape.type ? 'active' : ''
          }`}
        >
          <div className={`shape-btn-icon ${
            selectedShapeType === shape.type ? '' : ''
          }`}>
            {shape.icon}
          </div>
          <span className="shape-btn-text">{shape.label}</span>
          {selectedShapeType === shape.type && (
            <div className="shape-btn-check">
              <svg className="icon-md" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </button>
      ))}
    </div>
  );
};

export default ShapeLibrary;

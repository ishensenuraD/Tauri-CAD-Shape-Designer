import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setShapeType } from '../../store/shapeSlice';

const ShapeLibrary = () => {
  const dispatch = useDispatch();
  const { selectedShapeType, availableShapes } = useSelector((state) => state.shape);

  const shapeButtons = [
    { type: 'rectangle', label: 'Rectangle', icon: '▭' },
    { type: 'circle', label: 'Circle', icon: '○' },
    { type: 'triangle', label: 'Triangle', icon: '△' },
    { type: 'lshape', label: 'L-Shape', icon: '└' },
    { type: 'trapezoid', label: 'Trapezoid', icon: '▱' }
  ];

  const handleShapeSelect = (shapeType) => {
    dispatch(setShapeType(shapeType));
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="text-lg font-semibold text-cad-dark mb-4">Shape Library</h3>
      <div className="space-y-2">
        {shapeButtons.map((shape) => (
          <button
            key={shape.type}
            onClick={() => handleShapeSelect(shape.type)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              selectedShapeType === shape.type
                ? 'bg-cad-blue text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            <span className="text-2xl">{shape.icon}</span>
            <span className="font-medium">{shape.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ShapeLibrary;

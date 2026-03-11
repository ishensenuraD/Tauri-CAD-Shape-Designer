import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentShape: {
    type: 'rectangle',
    parameters: {
      width: 1200,
      height: 800
    },
    rotation: 0,
    flipX: false,
    flipY: false
  },
  selectedShapeType: 'rectangle',
  availableShapes: ['rectangle', 'circle', 'triangle', 'lshape', 'trapezoid'],
  showDimensions: false,
};

const shapeSlice = createSlice({
  name: 'shape',
  initialState,
  reducers: {
    setShapeType: (state, action) => {
      const shapeType = action.payload;
      state.selectedShapeType = shapeType;
      state.currentShape.type = shapeType;
      
      // Reset parameters based on shape type
      switch (shapeType) {
        case 'rectangle':
          state.currentShape.parameters = { width: 1200, height: 800 };
          break;
        case 'circle':
          state.currentShape.parameters = { radius: 600 };
          break;
        case 'triangle':
          state.currentShape.parameters = { base: 1000, height: 800, angle: 60 };
          break;
        case 'lshape':
          state.currentShape.parameters = { outerWidth: 1200, outerHeight: 800, innerWidth: 400, innerHeight: 400 };
          break;
        case 'trapezoid':
          state.currentShape.parameters = { topWidth: 800, bottomWidth: 1200, height: 600 };
          break;
        default:
          break;
      }
    },
    updateParameter: (state, action) => {
      const { parameter, value } = action.payload;
      state.currentShape.parameters[parameter] = value;
    },
    setRotation: (state, action) => {
      state.currentShape.rotation = action.payload;
    },
    setFlipX: (state, action) => {
      state.currentShape.flipX = action.payload;
    },
    setFlipY: (state, action) => {
      state.currentShape.flipY = action.payload;
    },
    toggleDimensions: (state) => {
      state.showDimensions = !state.showDimensions;
    },
    resetShape: (state) => {
      return initialState;
    }
  }
});

export const {
  setShapeType,
  updateParameter,
  setRotation,
  setFlipX,
  setFlipY,
  toggleDimensions,
  resetShape
} = shapeSlice.actions;

export default shapeSlice.reducer;

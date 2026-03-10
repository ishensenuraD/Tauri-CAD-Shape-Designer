// Shape factory and validation utilities
import rectangleGeometry from './rectangle.js';
import circleGeometry from './circle.js';
import triangleGeometry from './triangle.js';
import lshapeGeometry from './lshape.js';
import trapezoidGeometry from './trapezoid.js';

export const shapeFactories = {
  rectangle: rectangleGeometry,
  circle: circleGeometry,
  triangle: triangleGeometry,
  lshape: lshapeGeometry,
  trapezoid: trapezoidGeometry
};

// Shape validation and calculation utilities
export const shapeUtils = {
  // Get geometry for a specific shape type
  getGeometry: (shapeType) => {
    return shapeFactories[shapeType];
  },

  // Validate shape parameters
  validateShape: (shapeType, parameters) => {
    const geometry = shapeUtils.getGeometry(shapeType);
    if (!geometry) {
      return {
        isValid: false,
        errors: [`Unknown shape type: ${shapeType}`]
      };
    }

    return geometry.validateParameters(...Object.values(parameters));
  },

  // Generate SVG path for shape
  generatePath: (shapeType, parameters) => {
    const geometry = shapeUtils.getGeometry(shapeType);
    if (!geometry) return null;

    return geometry.generatePath(...Object.values(parameters));
  },

  // Get bounding box for shape
  getBoundingBox: (shapeType, parameters) => {
    const geometry = shapeUtils.getGeometry(shapeType);
    if (!geometry) return null;

    return geometry.getBoundingBox(...Object.values(parameters));
  },

  // Calculate area for shape
  getArea: (shapeType, parameters) => {
    const geometry = shapeUtils.getGeometry(shapeType);
    if (!geometry) return 0;

    return geometry.getArea(...Object.values(parameters));
  },

  // Calculate perimeter for shape
  getPerimeter: (shapeType, parameters) => {
    const geometry = shapeUtils.getGeometry(shapeType);
    if (!geometry) return 0;

    return geometry.getPerimeter(...Object.values(parameters));
  },

  // Get center point for shape
  getCenter: (shapeType, parameters) => {
    const geometry = shapeUtils.getGeometry(shapeType);
    if (!geometry) return { x: 0, y: 0 };

    return geometry.getCenter(...Object.values(parameters));
  },

  // Get vertices for shape
  getVertices: (shapeType, parameters) => {
    const geometry = shapeUtils.getGeometry(shapeType);
    if (!geometry) return [];

    return geometry.getVertices(...Object.values(parameters));
  },

  // Get dimension points for shape
  getDimensionPoints: (shapeType, parameters) => {
    const geometry = shapeUtils.getGeometry(shapeType);
    if (!geometry) return {};

    return geometry.getDimensionPoints(...Object.values(parameters));
  },

  // Get all shape information
  getShapeInfo: (shapeType, parameters) => {
    const geometry = shapeUtils.getGeometry(shapeType);
    if (!geometry) return null;

    return {
      type: shapeType,
      parameters,
      path: geometry.generatePath(...Object.values(parameters)),
      boundingBox: geometry.getBoundingBox(...Object.values(parameters)),
      area: geometry.getArea(...Object.values(parameters)),
      perimeter: geometry.getPerimeter(...Object.values(parameters)),
      center: geometry.getCenter(...Object.values(parameters)),
      vertices: geometry.getVertices(...Object.values(parameters)),
      dimensionPoints: geometry.getDimensionPoints(...Object.values(parameters)),
      validation: geometry.validateParameters(...Object.values(parameters))
    };
  },

  // Scale shape to fit in target dimensions
  scaleShapeToFit: (shapeType, parameters, targetWidth, targetHeight) => {
    const boundingBox = shapeUtils.getBoundingBox(shapeType, parameters);
    if (!boundingBox) return parameters;

    const scaleX = targetWidth / boundingBox.width;
    const scaleY = targetHeight / boundingBox.height;
    const scale = Math.min(scaleX, scaleY);

    // Scale all parameters
    const scaledParameters = {};
    Object.keys(parameters).forEach(key => {
      scaledParameters[key] = parameters[key] * scale;
    });

    return scaledParameters;
  },

  // Check if shape is valid for rendering
  isRenderable: (shapeType, parameters) => {
    const validation = shapeUtils.validateShape(shapeType, parameters);
    return validation.isValid;
  },

  // Get shape display name
  getDisplayName: (shapeType) => {
    const names = {
      rectangle: 'Rectangle',
      circle: 'Circle',
      triangle: 'Triangle',
      lshape: 'L-Shape',
      trapezoid: 'Trapezoid'
    };
    return names[shapeType] || shapeType;
  },

  // Get shape icon
  getShapeIcon: (shapeType) => {
    const icons = {
      rectangle: '▭',
      circle: '○',
      triangle: '△',
      lshape: '└',
      trapezoid: '▱'
    };
    return icons[shapeType] || '?';
  },

  // Get default parameters for shape type
  getDefaultParameters: (shapeType) => {
    const defaults = {
      rectangle: { width: 1200, height: 800 },
      circle: { radius: 600 },
      triangle: { base: 1000, height: 800, angle: 60 },
      lshape: { outerWidth: 1200, outerHeight: 800, innerWidth: 400, innerHeight: 400 },
      trapezoid: { topWidth: 800, bottomWidth: 1200, height: 600 }
    };
    return defaults[shapeType] || {};
  },

  // Get parameter definitions for UI
  getParameterDefinitions: (shapeType) => {
    const definitions = {
      rectangle: [
        { name: 'width', label: 'Width', type: 'number', min: 1, max: 10000, unit: 'mm' },
        { name: 'height', label: 'Height', type: 'number', min: 1, max: 10000, unit: 'mm' }
      ],
      circle: [
        { name: 'radius', label: 'Radius', type: 'number', min: 1, max: 5000, unit: 'mm' }
      ],
      triangle: [
        { name: 'base', label: 'Base', type: 'number', min: 1, max: 10000, unit: 'mm' },
        { name: 'height', label: 'Height', type: 'number', min: 1, max: 10000, unit: 'mm' },
        { name: 'angle', label: 'Angle', type: 'number', min: 1, max: 179, unit: '°' }
      ],
      lshape: [
        { name: 'outerWidth', label: 'Outer Width', type: 'number', min: 1, max: 10000, unit: 'mm' },
        { name: 'outerHeight', label: 'Outer Height', type: 'number', min: 1, max: 10000, unit: 'mm' },
        { name: 'innerWidth', label: 'Inner Width', type: 'number', min: 1, max: 10000, unit: 'mm' },
        { name: 'innerHeight', label: 'Inner Height', type: 'number', min: 1, max: 10000, unit: 'mm' }
      ],
      trapezoid: [
        { name: 'topWidth', label: 'Top Width', type: 'number', min: 1, max: 10000, unit: 'mm' },
        { name: 'bottomWidth', label: 'Bottom Width', type: 'number', min: 1, max: 10000, unit: 'mm' },
        { name: 'height', label: 'Height', type: 'number', min: 1, max: 10000, unit: 'mm' }
      ]
    };
    return definitions[shapeType] || [];
  }
};

export default shapeUtils;

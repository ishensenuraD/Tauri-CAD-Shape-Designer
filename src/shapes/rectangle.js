// Rectangle shape geometry calculations
export const rectangleGeometry = {
  // Generate SVG path points for rectangle
  generatePath: (width, height) => {
    return `M 0 0 L ${width} 0 L ${width} ${height} L 0 ${height} Z`;
  },

  // Calculate bounding box
  getBoundingBox: (width, height) => {
    return {
      minX: 0,
      minY: 0,
      maxX: width,
      maxY: height,
      width: width,
      height: height
    };
  },

  // Calculate area
  getArea: (width, height) => {
    return width * height;
  },

  // Calculate perimeter
  getPerimeter: (width, height) => {
    return 2 * (width + height);
  },

  // Get center point
  getCenter: (width, height) => {
    return {
      x: width / 2,
      y: height / 2
    };
  },

  // Get vertices for dimension labels
  getVertices: (width, height) => {
    return [
      { x: 0, y: 0 },           // Top-left
      { x: width, y: 0 },        // Top-right
      { x: width, y: height },   // Bottom-right
      { x: 0, y: height }        // Bottom-left
    ];
  },

  // Validate parameters
  validateParameters: (width, height) => {
    const errors = [];
    
    if (width <= 0) errors.push('Width must be greater than 0');
    if (height <= 0) errors.push('Height must be greater than 0');
    if (width > 10000) errors.push('Width must be less than 10000mm');
    if (height > 10000) errors.push('Height must be less than 10000mm');
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Get dimension points for labels
  getDimensionPoints: (width, height) => {
    return {
      width: {
        start: { x: 0, y: height + 20 },
        end: { x: width, y: height + 20 },
        label: { x: width / 2, y: height + 35 }
      },
      height: {
        start: { x: width + 20, y: 0 },
        end: { x: width + 20, y: height },
        label: { x: width + 35, y: height / 2 }
      }
    };
  }
};

export default rectangleGeometry;

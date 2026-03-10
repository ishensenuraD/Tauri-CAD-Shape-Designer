// Triangle shape geometry calculations
export const triangleGeometry = {
  // Generate SVG path for triangle
  generatePath: (base, height, angle = 60) => {
    // Calculate vertices based on base, height, and top angle
    const angleRad = (angle * Math.PI) / 180;
    
    // Calculate the top vertex position
    const topX = base / 2;
    const topY = 0;
    
    // Calculate bottom vertices
    const bottomLeftX = 0;
    const bottomLeftY = height;
    const bottomRightX = base;
    const bottomRightY = height;
    
    return `M ${topX} ${topY} L ${bottomRightX} ${bottomRightY} L ${bottomLeftX} ${bottomLeftY} Z`;
  },

  // Calculate bounding box
  getBoundingBox: (base, height, angle = 60) => {
    return {
      minX: 0,
      minY: 0,
      maxX: base,
      maxY: height,
      width: base,
      height: height
    };
  },

  // Calculate area
  getArea: (base, height) => {
    return (base * height) / 2;
  },

  // Calculate perimeter
  getPerimeter: (base, height, angle = 60) => {
    const angleRad = (angle * Math.PI) / 180;
    
    // Calculate the length of the two equal sides (for isosceles triangle)
    const sideLength = Math.sqrt(Math.pow(base / 2, 2) + Math.pow(height, 2));
    
    return base + (2 * sideLength);
  },

  // Get center point (centroid)
  getCenter: (base, height) => {
    return {
      x: base / 3,
      y: height / 3
    };
  },

  // Get vertices
  getVertices: (base, height, angle = 60) => {
    return [
      { x: base / 2, y: 0 },        // Top vertex
      { x: base, y: height },        // Bottom-right
      { x: 0, y: height }            // Bottom-left
    ];
  },

  // Get dimension points for labels
  getDimensionPoints: (base, height, angle = 60) => {
    return {
      base: {
        start: { x: 0, y: height + 20 },
        end: { x: base, y: height + 20 },
        label: { x: base / 2, y: height + 35 }
      },
      height: {
        start: { x: base + 20, y: 0 },
        end: { x: base + 20, y: height },
        label: { x: base + 35, y: height / 2 }
      },
      angle: {
        vertex: { x: base / 2, y: 0 },
        label: { x: base / 2, y: -20 }
      }
    };
  },

  // Calculate side lengths
  getSideLengths: (base, height, angle = 60) => {
    const angleRad = (angle * Math.PI) / 180;
    const sideLength = Math.sqrt(Math.pow(base / 2, 2) + Math.pow(height, 2));
    
    return {
      base: base,
      leftSide: sideLength,
      rightSide: sideLength
    };
  },

  // Validate parameters
  validateParameters: (base, height, angle = 60) => {
    const errors = [];
    
    if (base <= 0) errors.push('Base must be greater than 0');
    if (height <= 0) errors.push('Height must be greater than 0');
    if (angle <= 0 || angle >= 180) errors.push('Angle must be between 0 and 180 degrees');
    if (base > 10000) errors.push('Base must be less than 10000mm');
    if (height > 10000) errors.push('Height must be less than 10000mm');
    
    // Check if triangle is geometrically possible (relaxed validation)
    // For isosceles triangle, any positive height should work
    if (height > base * 2) {
      errors.push('Height is too large for the given base');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Generate different triangle types
  generateRightTriangle: (base, height) => {
    return {
      path: `M 0 0 L ${base} 0 L 0 ${height} Z`,
      vertices: [
        { x: 0, y: 0 },
        { x: base, y: 0 },
        { x: 0, y: height }
      ]
    };
  },

  generateEquilateralTriangle: (sideLength) => {
    const height = (sideLength * Math.sqrt(3)) / 2;
    return {
      path: `M ${sideLength / 2} 0 L ${sideLength} ${height} L 0 ${height} Z`,
      vertices: [
        { x: sideLength / 2, y: 0 },
        { x: sideLength, y: height },
        { x: 0, y: height }
      ]
    };
  }
};

export default triangleGeometry;

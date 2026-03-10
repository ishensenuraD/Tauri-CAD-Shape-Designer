// Trapezoid shape geometry calculations
export const trapezoidGeometry = {
  // Generate SVG path for trapezoid
  generatePath: (topWidth, bottomWidth, height) => {
    // Calculate the horizontal offset for centering top width
    const offset = (bottomWidth - topWidth) / 2;
    
    // Trapezoid vertices (clockwise from top-left)
    const vertices = [
      { x: offset, y: 0 },                    // Top-left
      { x: offset + topWidth, y: 0 },        // Top-right
      { x: bottomWidth, y: height },          // Bottom-right
      { x: 0, y: height }                     // Bottom-left
    ];
    
    // Create path string
    const pathString = vertices
      .map((vertex, index) => {
        const command = index === 0 ? 'M' : 'L';
        return `${command} ${vertex.x} ${vertex.y}`;
      })
      .join(' ') + ' Z';
    
    return pathString;
  },

  // Calculate bounding box
  getBoundingBox: (topWidth, bottomWidth, height) => {
    const maxWidth = Math.max(topWidth, bottomWidth);
    const minX = bottomWidth > topWidth ? 0 : (topWidth - bottomWidth) / 2;
    
    return {
      minX: minX,
      minY: 0,
      maxX: minX + maxWidth,
      maxY: height,
      width: maxWidth,
      height: height
    };
  },

  // Calculate area
  getArea: (topWidth, bottomWidth, height) => {
    return ((topWidth + bottomWidth) / 2) * height;
  },

  // Calculate perimeter
  getPerimeter: (topWidth, bottomWidth, height) => {
    const offset = (bottomWidth - topWidth) / 2;
    const sideLength = Math.sqrt(Math.pow(offset, 2) + Math.pow(height, 2));
    
    return topWidth + bottomWidth + (2 * sideLength);
  },

  // Get center point
  getCenter: (topWidth, bottomWidth, height) => {
    const offset = (bottomWidth - topWidth) / 2;
    const centerX = bottomWidth / 2;
    const centerY = height / 2;
    
    return {
      x: centerX,
      y: centerY
    };
  },

  // Get vertices
  getVertices: (topWidth, bottomWidth, height) => {
    const offset = (bottomWidth - topWidth) / 2;
    
    return [
      { x: offset, y: 0 },                    // Top-left
      { x: offset + topWidth, y: 0 },        // Top-right
      { x: bottomWidth, y: height },          // Bottom-right
      { x: 0, y: height }                     // Bottom-left
    ];
  },

  // Get dimension points for labels
  getDimensionPoints: (topWidth, bottomWidth, height) => {
    const offset = (bottomWidth - topWidth) / 2;
    
    return {
      topWidth: {
        start: { x: offset, y: -20 },
        end: { x: offset + topWidth, y: -20 },
        label: { x: offset + topWidth / 2, y: -35 }
      },
      bottomWidth: {
        start: { x: 0, y: height + 20 },
        end: { x: bottomWidth, y: height + 20 },
        label: { x: bottomWidth / 2, y: height + 35 }
      },
      height: {
        start: { x: bottomWidth + 20, y: 0 },
        end: { x: bottomWidth + 20, y: height },
        label: { x: bottomWidth + 35, y: height / 2 }
      },
      leftSide: {
        start: { x: -20, y: 0 },
        end: { x: -20, y: height },
        label: { x: -35, y: height / 2 }
      },
      rightSide: {
        start: { x: bottomWidth + 20, y: 0 },
        end: { x: bottomWidth + 20, y: height },
        label: { x: bottomWidth + 35, y: height / 2 }
      }
    };
  },

  // Calculate side lengths
  getSideLengths: (topWidth, bottomWidth, height) => {
    const offset = Math.abs(bottomWidth - topWidth) / 2;
    const sideLength = Math.sqrt(Math.pow(offset, 2) + Math.pow(height, 2));
    
    return {
      top: topWidth,
      bottom: bottomWidth,
      left: sideLength,
      right: sideLength
    };
  },

  // Calculate angles
  getAngles: (topWidth, bottomWidth, height) => {
    const offset = Math.abs(bottomWidth - topWidth) / 2;
    
    // Calculate base angles
    const leftAngleRad = Math.atan2(height, offset);
    const rightAngleRad = Math.atan2(height, offset);
    
    return {
      topLeft: (leftAngleRad * 180) / Math.PI,
      topRight: (rightAngleRad * 180) / Math.PI,
      bottomLeft: 180 - ((leftAngleRad * 180) / Math.PI),
      bottomRight: 180 - ((rightAngleRad * 180) / Math.PI)
    };
  },

  // Validate parameters
  validateParameters: (topWidth, bottomWidth, height) => {
    const errors = [];
    
    if (topWidth <= 0) errors.push('Top width must be greater than 0');
    if (bottomWidth <= 0) errors.push('Bottom width must be greater than 0');
    if (height <= 0) errors.push('Height must be greater than 0');
    
    if (topWidth > 10000) errors.push('Top width must be less than 10000mm');
    if (bottomWidth > 10000) errors.push('Bottom width must be less than 10000mm');
    if (height > 10000) errors.push('Height must be less than 10000mm');
    
    // Check if trapezoid is geometrically valid
    const maxWidth = Math.max(topWidth, bottomWidth);
    const minWidth = Math.min(topWidth, bottomWidth);
    
    if (minWidth <= 0) errors.push('Both widths must be positive');
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Generate different trapezoid types
  generateIsoscelesTrapezoid: (topWidth, bottomWidth, height) => {
    // This is the standard trapezoid (already implemented)
    return {
      path: this.generatePath(topWidth, bottomWidth, height),
      type: 'isosceles'
    };
  },

  generateRightTrapezoid: (topWidth, bottomWidth, height, isLeftRight = false) => {
    // Right trapezoid with one vertical side
    if (isLeftRight) {
      // Left side is vertical
      return {
        path: `M 0 0 L ${topWidth} 0 L ${bottomWidth} ${height} L 0 ${height} Z`,
        type: 'right-left'
      };
    } else {
      // Right side is vertical
      return {
        path: `M ${bottomWidth - topWidth} 0 L ${bottomWidth} 0 L ${bottomWidth} ${height} L ${bottomWidth - topWidth} ${height} Z`,
        type: 'right-right'
      };
    }
  },

  // Calculate centroid (geometric center)
  getCentroid: (topWidth, bottomWidth, height) => {
    // For an isosceles trapezoid
    const offset = (bottomWidth - topWidth) / 2;
    const centroidX = bottomWidth / 2;
    const centroidY = height * (2 * topWidth + bottomWidth) / (3 * (topWidth + bottomWidth));
    
    return {
      x: centroidX,
      y: centroidY
    };
  }
};

export default trapezoidGeometry;

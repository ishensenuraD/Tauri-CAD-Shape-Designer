// L-Shape geometry calculations
export const lshapeGeometry = {
  // Generate SVG path for L-Shape
  generatePath: (outerWidth, outerHeight, innerWidth, innerHeight) => {
    // L-Shape vertices (clockwise from top-left)
    const vertices = [
      { x: 0, y: 0 },                    // Top-left outer corner
      { x: outerWidth, y: 0 },           // Top-right outer corner
      { x: outerWidth, y: innerHeight },  // Start of inner cut
      { x: innerWidth, y: innerHeight },  // Inner corner
      { x: innerWidth, y: outerHeight },  // Inner vertical line
      { x: 0, y: outerHeight }            // Bottom-left outer corner
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
  getBoundingBox: (outerWidth, outerHeight, innerWidth, innerHeight) => {
    return {
      minX: 0,
      minY: 0,
      maxX: outerWidth,
      maxY: outerHeight,
      width: outerWidth,
      height: outerHeight
    };
  },

  // Calculate area (outer rectangle minus inner cutout)
  getArea: (outerWidth, outerHeight, innerWidth, innerHeight) => {
    const outerArea = outerWidth * outerHeight;
    const innerArea = innerWidth * innerHeight;
    return outerArea - innerArea;
  },

  // Calculate perimeter
  getPerimeter: (outerWidth, outerHeight, innerWidth, innerHeight) => {
    // L-Shape perimeter calculation
    const outerPerimeter = 2 * (outerWidth + outerHeight);
    const innerPerimeter = 2 * (innerWidth + innerHeight);
    return outerPerimeter + innerPerimeter;
  },

  // Get center point of mass
  getCenter: (outerWidth, outerHeight, innerWidth, innerHeight) => {
    // Simplified center calculation (geometric center)
    return {
      x: outerWidth / 2,
      y: outerHeight / 2
    };
  },

  // Get all vertices
  getVertices: (outerWidth, outerHeight, innerWidth, innerHeight) => {
    return [
      { x: 0, y: 0 },                    // Top-left outer
      { x: outerWidth, y: 0 },           // Top-right outer
      { x: outerWidth, y: innerHeight },  // Inner corner top
      { x: innerWidth, y: innerHeight },  // Inner corner
      { x: innerWidth, y: outerHeight },  // Inner corner bottom
      { x: 0, y: outerHeight }            // Bottom-left outer
    ];
  },

  // Get dimension points for labels
  getDimensionPoints: (outerWidth, outerHeight, innerWidth, innerHeight) => {
    return {
      outerWidth: {
        start: { x: 0, y: -20 },
        end: { x: outerWidth, y: -20 },
        label: { x: outerWidth / 2, y: -35 }
      },
      outerHeight: {
        start: { x: outerWidth + 20, y: 0 },
        end: { x: outerWidth + 20, y: outerHeight },
        label: { x: outerWidth + 35, y: outerHeight / 2 }
      },
      innerWidth: {
        start: { x: innerWidth, y: innerHeight + 10 },
        end: { x: outerWidth, y: innerHeight + 10 },
        label: { x: (innerWidth + outerWidth) / 2, y: innerHeight + 25 }
      },
      innerHeight: {
        start: { x: innerWidth - 10, y: innerHeight },
        end: { x: innerWidth - 10, y: outerHeight },
        label: { x: innerWidth - 25, y: (innerHeight + outerHeight) / 2 }
      }
    };
  },

  // Get L-Shape specific points (corners)
  getCornerPoints: (outerWidth, outerHeight, innerWidth, innerHeight) => {
    return {
      outerTopLeft: { x: 0, y: 0 },
      outerTopRight: { x: outerWidth, y: 0 },
      outerBottomLeft: { x: 0, y: outerHeight },
      innerTopRight: { x: outerWidth, y: innerHeight },
      innerBottomLeft: { x: innerWidth, y: outerHeight },
      innerCorner: { x: innerWidth, y: innerHeight }
    };
  },

  // Validate parameters
  validateParameters: (outerWidth, outerHeight, innerWidth, innerHeight) => {
    const errors = [];
    
    if (outerWidth <= 0) errors.push('Outer width must be greater than 0');
    if (outerHeight <= 0) errors.push('Outer height must be greater than 0');
    if (innerWidth <= 0) errors.push('Inner width must be greater than 0');
    if (innerHeight <= 0) errors.push('Inner height must be greater than 0');
    
    if (innerWidth >= outerWidth) errors.push('Inner width must be less than outer width');
    if (innerHeight >= outerHeight) errors.push('Inner height must be less than outer height');
    
    if (outerWidth > 10000) errors.push('Outer width must be less than 10000mm');
    if (outerHeight > 10000) errors.push('Outer height must be less than 10000mm');
    if (innerWidth > 10000) errors.push('Inner width must be less than 10000mm');
    if (innerHeight > 10000) errors.push('Inner height must be less than 10000mm');
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Calculate thickness of L-Shape legs
  getLegThickness: (outerWidth, outerHeight, innerWidth, innerHeight) => {
    return {
      horizontalLeg: outerHeight - innerHeight,
      verticalLeg: outerWidth - innerWidth
    };
  },

  // Check if point is inside L-Shape
  isPointInside: (x, y, outerWidth, outerHeight, innerWidth, innerHeight) => {
    // Check if point is in outer rectangle
    if (x < 0 || x > outerWidth || y < 0 || y > outerHeight) {
      return false;
    }
    
    // Check if point is in inner cutout
    if (x >= innerWidth && y >= innerHeight) {
      return false;
    }
    
    return true;
  }
};

export default lshapeGeometry;

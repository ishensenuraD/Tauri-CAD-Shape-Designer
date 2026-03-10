// Circle shape geometry calculations
export const circleGeometry = {
  // Generate SVG path for circle
  generatePath: (radius) => {
    const diameter = radius * 2;
    return `M ${radius} 0 A ${radius} ${radius} 0 0 1 ${radius} ${diameter} A ${radius} ${radius} 0 0 1 ${radius} 0`;
  },

  // Alternative: Use circle element for better performance
  generateCircleElement: (radius) => {
    return {
      type: 'circle',
      cx: radius,
      cy: radius,
      r: radius
    };
  },

  // Calculate bounding box
  getBoundingBox: (radius) => {
    return {
      minX: 0,
      minY: 0,
      maxX: radius * 2,
      maxY: radius * 2,
      width: radius * 2,
      height: radius * 2
    };
  },

  // Calculate area
  getArea: (radius) => {
    return Math.PI * radius * radius;
  },

  // Calculate circumference
  getPerimeter: (radius) => {
    return 2 * Math.PI * radius;
  },

  // Get center point
  getCenter: (radius) => {
    return {
      x: radius,
      y: radius
    };
  },

  // Get key points for dimension labels
  getDimensionPoints: (radius) => {
    const diameter = radius * 2;
    return {
      diameter: {
        start: { x: 0, y: diameter + 20 },
        end: { x: diameter, y: diameter + 20 },
        label: { x: radius, y: diameter + 35 }
      },
      radius: {
        start: { x: radius, y: radius },
        end: { x: diameter, y: radius },
        label: { x: radius + radius/2, y: radius - 10 }
      },
      radiusVertical: {
        start: { x: radius, y: radius },
        end: { x: radius, y: 0 },
        label: { x: radius + 10, y: radius/2 }
      }
    };
  },

  // Get points at specific angles for reference
  getPointsAtAngles: (radius, angles = [0, 90, 180, 270]) => {
    return angles.map(angle => {
      const radians = (angle * Math.PI) / 180;
      return {
        x: radius + radius * Math.cos(radians),
        y: radius + radius * Math.sin(radians),
        angle
      };
    });
  },

  // Validate parameters
  validateParameters: (radius) => {
    const errors = [];
    
    if (radius <= 0) errors.push('Radius must be greater than 0');
    if (radius > 5000) errors.push('Radius must be less than 5000mm');
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Get arc path for partial circles (if needed)
  generateArcPath: (radius, startAngle, endAngle) => {
    const startRadians = (startAngle * Math.PI) / 180;
    const endRadians = (endAngle * Math.PI) / 180;
    
    const x1 = radius + radius * Math.cos(startRadians);
    const y1 = radius + radius * Math.sin(startRadians);
    const x2 = radius + radius * Math.cos(endRadians);
    const y2 = radius + radius * Math.sin(endRadians);
    
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    
    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`;
  }
};

export default circleGeometry;

// Transformation utilities for shapes
export const transformUtils = {
  // Rotate a point around a center
  rotatePoint: (point, center, angle) => {
    const radians = (angle * Math.PI) / 180;
    const cos = Math.cos(radians);
    const sin = Math.sin(radians);
    
    // Translate point to origin
    const translatedX = point.x - center.x;
    const translatedY = point.y - center.y;
    
    // Rotate
    const rotatedX = translatedX * cos - translatedY * sin;
    const rotatedY = translatedX * sin + translatedY * cos;
    
    // Translate back
    return {
      x: rotatedX + center.x,
      y: rotatedY + center.y
    };
  },

  // Flip a point horizontally
  flipPointX: (point, center) => {
    return {
      x: center.x * 2 - point.x,
      y: point.y
    };
  },

  // Flip a point vertically
  flipPointY: (point, center) => {
    return {
      x: point.x,
      y: center.y * 2 - point.y
    };
  },

  // Apply multiple transformations to a point
  transformPoint: (point, center, rotation, flipX, flipY) => {
    let transformedPoint = { ...point };
    
    // Apply rotation
    if (rotation !== 0) {
      transformedPoint = transformUtils.rotatePoint(transformedPoint, center, rotation);
    }
    
    // Apply horizontal flip
    if (flipX) {
      transformedPoint = transformUtils.flipPointX(transformedPoint, center);
    }
    
    // Apply vertical flip
    if (flipY) {
      transformedPoint = transformUtils.flipPointY(transformedPoint, center);
    }
    
    return transformedPoint;
  },

  // Transform an array of points
  transformPoints: (points, center, rotation, flipX, flipY) => {
    return points.map(point => 
      transformUtils.transformPoint(point, center, rotation, flipX, flipY)
    );
  },

  // Transform a path string
  transformPath: (pathString, boundingBox, rotation, flipX, flipY) => {
    const center = {
      x: boundingBox.width / 2,
      y: boundingBox.height / 2
    };
    
    // Parse path string to extract points
    const pathCommands = pathUtils.parsePath(pathString);
    
    // Transform each point
    const transformedCommands = pathCommands.map(command => {
      if (command.type === 'M' || command.type === 'L') {
        const transformedPoint = transformUtils.transformPoint(
          { x: command.x, y: command.y },
          center,
          rotation,
          flipX,
          flipY
        );
        
        return {
          ...command,
          x: transformedPoint.x,
          y: transformedPoint.y
        };
      }
      
      // Handle arc commands (A)
      if (command.type === 'A') {
        const transformedPoint = transformUtils.transformPoint(
          { x: command.x, y: command.y },
          center,
          rotation,
          flipX,
          flipY
        );
        
        return {
          ...command,
          x: transformedPoint.x,
          y: transformedPoint.y
        };
      }
      
      return command;
    });
    
    // Rebuild path string
    return pathUtils.buildPath(transformedCommands);
  },

  // Get transformation matrix
  getTransformMatrix: (rotation, flipX, flipY) => {
    const radians = (rotation * Math.PI) / 180;
    const cos = Math.cos(radians);
    const sin = Math.sin(radians);
    
    // Start with identity matrix
    let matrix = [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1]
    ];
    
    // Apply rotation
    if (rotation !== 0) {
      matrix = [
        [cos, -sin, 0],
        [sin, cos, 0],
        [0, 0, 1]
      ];
    }
    
    // Apply horizontal flip
    if (flipX) {
      matrix = [
        [-matrix[0][0], -matrix[0][1], 0],
        [-matrix[1][0], -matrix[1][1], 0],
        [0, 0, 1]
      ];
    }
    
    // Apply vertical flip
    if (flipY) {
      matrix = [
        [matrix[0][0], -matrix[0][1], 0],
        [-matrix[1][0], matrix[1][1], 0],
        [0, 0, 1]
      ];
    }
    
    return matrix;
  },

  // Apply transformation matrix to a point
  applyMatrix: (point, matrix) => {
    return {
      x: matrix[0][0] * point.x + matrix[0][1] * point.y + matrix[0][2],
      y: matrix[1][0] * point.x + matrix[1][1] * point.y + matrix[1][2]
    };
  },

  // Calculate transformed bounding box
  getTransformedBoundingBox: (boundingBox, rotation, flipX, flipY) => {
    const center = {
      x: boundingBox.width / 2,
      y: boundingBox.height / 2
    };
    
    // Get all four corners of the bounding box
    const corners = [
      { x: 0, y: 0 },
      { x: boundingBox.width, y: 0 },
      { x: boundingBox.width, y: boundingBox.height },
      { x: 0, y: boundingBox.height }
    ];
    
    // Transform all corners
    const transformedCorners = transformUtils.transformPoints(corners, center, rotation, flipX, flipY);
    
    // Find new bounding box
    const xs = transformedCorners.map(p => p.x);
    const ys = transformedCorners.map(p => p.y);
    
    return {
      minX: Math.min(...xs),
      minY: Math.min(...ys),
      maxX: Math.max(...xs),
      maxY: Math.max(...ys),
      width: Math.max(...xs) - Math.min(...xs),
      height: Math.max(...ys) - Math.min(...ys)
    };
  }
};

// Path utilities for SVG path manipulation
export const pathUtils = {
  // Parse SVG path string into commands
  parsePath: (pathString) => {
    const commands = [];
    // More flexible regex that handles arc commands better
    const regex = /([MLAZ])([^MLAZ]*)/g;
    let match;
    
    while ((match = regex.exec(pathString)) !== null) {
      const type = match[1];
      const coordStr = match[2].trim();
      
      if (type === 'M' || type === 'L') {
        const coords = coordStr.split(/\s+/).map(Number);
        commands.push({
          type,
          x: coords[0],
          y: coords[1]
        });
      } else if (type === 'A') {
        const coords = coordStr.split(/\s+/).map(Number);
        commands.push({
          type,
          rx: coords[0],
          ry: coords[1],
          xAxisRotation: coords[2],
          largeArcFlag: coords[3],
          sweepFlag: coords[4],
          x: coords[5],
          y: coords[6]
        });
      } else if (type === 'Z') {
        commands.push({
          type: 'Z'
        });
      }
    }
    
    return commands;
  },

  // Build SVG path string from commands
  buildPath: (commands) => {
    return commands.map(command => {
      if (command.type === 'M' || command.type === 'L') {
        return `${command.type} ${command.x} ${command.y}`;
      } else if (command.type === 'A') {
        return `${command.type} ${command.rx} ${command.ry} ${command.xAxisRotation} ${command.largeArcFlag} ${command.sweepFlag} ${command.x} ${command.y}`;
      } else if (command.type === 'Z') {
        return 'Z';
      }
      return '';
    }).join(' ');
  },

  // Scale path to fit in given dimensions
  scaleToFit: (pathString, currentBoundingBox, targetWidth, targetHeight) => {
    const scaleX = targetWidth / currentBoundingBox.width;
    const scaleY = targetHeight / currentBoundingBox.height;
    const scale = Math.min(scaleX, scaleY);
    
    const commands = pathUtils.parsePath(pathString);
    
    const scaledCommands = commands.map(command => {
      if (command.type === 'M' || command.type === 'L') {
        return {
          ...command,
          x: command.x * scale,
          y: command.y * scale
        };
      } else if (command.type === 'A') {
        return {
          ...command,
          rx: command.rx * scale,
          ry: command.ry * scale,
          x: command.x * scale,
          y: command.y * scale
        };
      }
      return command;
    });
    
    return pathUtils.buildPath(scaledCommands);
  }
};

export default transformUtils;

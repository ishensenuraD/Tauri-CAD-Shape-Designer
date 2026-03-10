// Dimension calculation utilities
export const dimensionUtils = {
  // Calculate distance between two points
  distance: (point1, point2) => {
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    return Math.sqrt(dx * dx + dy * dy);
  },

  // Calculate angle between two points
  angle: (point1, point2) => {
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    return (Math.atan2(dy, dx) * 180) / Math.PI;
  },

  // Format dimension value with units
  formatDimension: (value, units = 'mm', decimals = 1) => {
    return `${value.toFixed(decimals)}${units}`;
  },

  // Generate dimension line SVG
  createDimensionLine: (startPoint, endPoint, label, offset = 10, position = 'outside') => {
    // Calculate line direction
    const dx = endPoint.x - startPoint.x;
    const dy = endPoint.y - startPoint.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    
    // Normalize direction
    const dirX = dx / length;
    const dirY = dy / length;
    
    // Calculate perpendicular direction for offset
    const perpX = -dirY;
    const perpY = dirX;
    
    // Calculate offset positions
    const offsetStart = {
      x: startPoint.x + perpX * offset,
      y: startPoint.y + perpY * offset
    };
    
    const offsetEnd = {
      x: endPoint.x + perpX * offset,
      y: endPoint.y + perpY * offset
    };
    
    // Calculate label position
    const labelX = (offsetStart.x + offsetEnd.x) / 2;
    const labelY = (offsetStart.y + offsetEnd.y) / 2;
    
    // Calculate extension lines
    const extensionLength = 5;
    const extensionStart1 = {
      x: startPoint.x + perpX * (offset - extensionLength),
      y: startPoint.y + perpY * (offset - extensionLength)
    };
    
    const extensionStart2 = {
      x: startPoint.x + perpX * offset,
      y: startPoint.y + perpY * offset
    };
    
    const extensionEnd1 = {
      x: endPoint.x + perpX * (offset - extensionLength),
      y: endPoint.y + perpY * (offset - extensionLength)
    };
    
    const extensionEnd2 = {
      x: endPoint.x + perpX * offset,
      y: endPoint.y + perpY * offset
    };
    
    // Calculate arrow positions
    const arrowSize = 8;
    const arrowAngle = 15 * (Math.PI / 180);
    
    const arrow1Start = {
      x: offsetEnd.x - dirX * arrowSize,
      y: offsetEnd.y - dirY * arrowSize
    };
    
    const arrow1End1 = {
      x: arrow1Start.x - arrowSize * Math.cos(Math.atan2(dirY, dirX) - arrowAngle),
      y: arrow1Start.y - arrowSize * Math.sin(Math.atan2(dirY, dirX) - arrowAngle)
    };
    
    const arrow1End2 = {
      x: arrow1Start.x - arrowSize * Math.cos(Math.atan2(dirY, dirX) + arrowAngle),
      y: arrow1Start.y - arrowSize * Math.sin(Math.atan2(dirY, dirX) + arrowAngle)
    };
    
    const arrow2Start = {
      x: offsetStart.x + dirX * arrowSize,
      y: offsetStart.y + dirY * arrowSize
    };
    
    const arrow2End1 = {
      x: arrow2Start.x + arrowSize * Math.cos(Math.atan2(dirY, dirX) - arrowAngle),
      y: arrow2Start.y + arrowSize * Math.sin(Math.atan2(dirY, dirX) - arrowAngle)
    };
    
    const arrow2End2 = {
      x: arrow2Start.x + arrowSize * Math.cos(Math.atan2(dirY, dirX) + arrowAngle),
      y: arrow2Start.y + arrowSize * Math.sin(Math.atan2(dirY, dirX) + arrowAngle)
    };
    
    return {
      dimensionLine: {
        x1: offsetStart.x,
        y1: offsetStart.y,
        x2: offsetEnd.x,
        y2: offsetEnd.y
      },
      extensionLines: [
        {
          x1: extensionStart1.x,
          y1: extensionStart1.y,
          x2: extensionStart2.x,
          y2: extensionStart2.y
        },
        {
          x1: extensionEnd1.x,
          y1: extensionEnd1.y,
          x2: extensionEnd2.x,
          y2: extensionEnd2.y
        }
      ],
      arrows: [
        {
          type: 'arrow',
          points: [
            { x: arrow1Start.x, y: arrow1Start.y },
            { x: arrow1End1.x, y: arrow1End1.y },
            { x: arrow1End2.x, y: arrow1End2.y }
          ]
        },
        {
          type: 'arrow',
          points: [
            { x: arrow2Start.x, y: arrow2Start.y },
            { x: arrow2End1.x, y: arrow2End1.y },
            { x: arrow2End2.x, y: arrow2End2.y }
          ]
        }
      ],
      label: {
        x: labelX,
        y: labelY,
        text: label,
        angle: Math.atan2(dy, dx) * (180 / Math.PI)
      }
    };
  },

  // Create radius dimension
  createRadiusDimension: (center, radiusPoint, label, offset = 20) => {
    const dx = radiusPoint.x - center.x;
    const dy = radiusPoint.y - center.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    
    // Normalize direction
    const dirX = dx / length;
    const dirY = dy / length;
    
    // Calculate label position
    const labelX = center.x + dirX * (length / 2 + offset);
    const labelY = center.y + dirY * (length / 2 + offset);
    
    return {
      radiusLine: {
        x1: center.x,
        y1: center.y,
        x2: radiusPoint.x,
        y2: radiusPoint.y
      },
      label: {
        x: labelX,
        y: labelY,
        text: label
      }
    };
  },

  // Create diameter dimension
  createDiameterDimension: (center, radius, label, offset = 20) => {
    const point1 = { x: center.x - radius, y: center.y };
    const point2 = { x: center.x + radius, y: center.y };
    
    return dimensionUtils.createDimensionLine(point1, point2, label, offset);
  },

  // Create angle dimension
  createAngleDimension: (vertex, point1, point2, label, radius = 30) => {
    const angle1 = Math.atan2(point1.y - vertex.y, point1.x - vertex.x);
    const angle2 = Math.atan2(point2.y - vertex.y, point2.x - vertex.x);
    
    // Calculate arc points
    const startAngle = Math.min(angle1, angle2);
    const endAngle = Math.max(angle1, angle2);
    const angleDiff = endAngle - startAngle;
    
    // Create arc path
    const arcPath = `M ${vertex.x + radius * Math.cos(startAngle)} ${vertex.y + radius * Math.sin(startAngle)} A ${radius} ${radius} 0 ${angleDiff > Math.PI ? 1 : 0} 1 ${vertex.x + radius * Math.cos(endAngle)} ${vertex.y + radius * Math.sin(endAngle)}`;
    
    // Calculate label position
    const labelAngle = (startAngle + endAngle) / 2;
    const labelRadius = radius + 10;
    const labelX = vertex.x + labelRadius * Math.cos(labelAngle);
    const labelY = vertex.y + labelRadius * Math.sin(labelAngle);
    
    return {
      arcPath,
      label: {
        x: labelX,
        y: labelY,
        text: label
      }
    };
  },

  // Calculate optimal dimension placement
  calculateOptimalPlacement: (points, boundingBox) => {
    // Simple algorithm to place dimensions outside the shape
    const placements = {
      top: { y: boundingBox.minY - 20 },
      right: { x: boundingBox.maxX + 20 },
      bottom: { y: boundingBox.maxY + 20 },
      left: { x: boundingBox.minX - 20 }
    };
    
    return placements;
  },

  // Generate all dimensions for a shape
  generateDimensions: (shapeType, parameters, boundingBox) => {
    const dimensions = [];
    
    switch (shapeType) {
      case 'rectangle':
        dimensions.push(
          dimensionUtils.createDimensionLine(
            { x: 0, y: parameters.height + 20 },
            { x: parameters.width, y: parameters.height + 20 },
            dimensionUtils.formatDimension(parameters.width)
          )
        );
        dimensions.push(
          dimensionUtils.createDimensionLine(
            { x: parameters.width + 20, y: 0 },
            { x: parameters.width + 20, y: parameters.height },
            dimensionUtils.formatDimension(parameters.height)
          )
        );
        break;
        
      case 'circle':
        const center = { x: parameters.radius, y: parameters.radius };
        dimensions.push(
          dimensionUtils.createDiameterDimension(
            center,
            parameters.radius,
            dimensionUtils.formatDimension(parameters.radius * 2)
          )
        );
        break;
        
      // Add other shapes as needed
    }
    
    return dimensions;
  },

  // Validate dimension values
  validateDimension: (value, min = 0.1, max = 10000) => {
    return {
      isValid: value >= min && value <= max,
      error: value < min ? `Value must be at least ${min}` : 
              value > max ? `Value must be less than ${max}` : null
    };
  }
};

export default dimensionUtils;

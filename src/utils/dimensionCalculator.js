// Frontend dimension calculation utilities
// This replaces backend dimension calculations with frontend logic

// Dimension orientation constants
export const DimensionOrientation = {
  HORIZONTAL: 'horizontal',
  VERTICAL: 'vertical',
  RADIAL: 'radial',
  ANGULAR: 'angular'
};

// Calculate dimensions for different shape types
export const calculateDimensions = (shapeType, parameters, transform, renderOffset) => {
  switch (shapeType) {
    case 'rectangle':
      return calculateRectangleDimensions(parameters, transform, renderOffset);
    case 'circle':
      return calculateCircleDimensions(parameters, transform, renderOffset);
    case 'triangle':
      return calculateTriangleDimensions(parameters, transform, renderOffset);
    case 'lshape':
      return calculateLShapeDimensions(parameters, transform, renderOffset);
    case 'trapezoid':
      return calculateTrapezoidDimensions(parameters, transform, renderOffset);
    default:
      return [];
  }
};

// Rectangle dimensions
const calculateRectangleDimensions = (params, transform, renderOffset) => {
  const originalWidth = params.width || 100;
  const originalHeight = params.height || 100;

  // Apply rotation transformation to dimension values
  const normalizedRotation = ((transform.rotation || 0) % 360 + 360) % 360;
  
  // Check if we need to swap width/height for 90° and 270° rotations
  const shouldSwapDimensions = 
    (normalizedRotation >= 45 && normalizedRotation < 135) || 
    (normalizedRotation >= 225 && normalizedRotation < 315);
  
  // Use swapped values for positioning calculations but keep original for labels
  let width = originalWidth;
  let height = originalHeight;
  
  if (shouldSwapDimensions) {
    [width, height] = [height, width];
  }

  const widthOffset = Math.max(5, Math.min(30, width * 0.08));
  const heightOffset = Math.max(5, Math.min(30, height * 0.08));

  // For 90° and 270° rotations, swap the positioning logic as well
  if (shouldSwapDimensions) {
    // For rotated orientation: treat what was originally vertical as horizontal and vice versa
    const baseDimensions = [
      {
        // This was originally the height dimension (now positioned as horizontal)
        start_point: { 
          x: heightOffset + renderOffset.x, 
          y: originalHeight * 0.05 + renderOffset.y 
        },
        end_point: { 
          x: heightOffset + renderOffset.x, 
          y: originalHeight * 0.95 + renderOffset.y 
        },
        text_position: { 
          x: heightOffset + 19 + renderOffset.x, 
          y: originalHeight / 2 + renderOffset.y 
        },
        value: originalHeight, // Use original height value
        label: `${Math.round(originalHeight)}mm`,
        orientation: DimensionOrientation.VERTICAL,
      },
      {
        // This was originally the width dimension (now positioned as vertical)
        start_point: { 
          x: 0 + renderOffset.x, 
          y: -heightOffset + renderOffset.y 
        },
        end_point: { 
          x: originalWidth + renderOffset.x, 
          y: -heightOffset + renderOffset.y 
        },
        text_position: { 
          x: originalWidth / 2 + renderOffset.x, 
          y: -heightOffset + 40 + renderOffset.y 
        },
        value: originalWidth, // Use original width value
        label: `${Math.round(originalWidth)}mm`,
        orientation: DimensionOrientation.HORIZONTAL,
      },
    ];

    return applyTransformToDimensions(baseDimensions, transform, renderOffset, 'rectangle', params);
  }

  // Standard positioning for 0° and 180° rotations
  const baseDimensions = [
    {
      start_point: { 
        x: width * 0.05 + renderOffset.x, 
        y: -widthOffset + renderOffset.y 
      },
      end_point: { 
        x: width * 0.95 + renderOffset.x, 
        y: -widthOffset + renderOffset.y 
      },
      text_position: { 
        x: width / 2 + renderOffset.x, 
        y: -widthOffset + 19 + renderOffset.y 
      },
      value: originalWidth,
      label: `${Math.round(originalWidth)}mm`,
      orientation: DimensionOrientation.HORIZONTAL,
    },
    {
      start_point: { 
        x: -heightOffset + renderOffset.x, 
        y: 0 + renderOffset.y 
      },
      end_point: { 
        x: -heightOffset + renderOffset.x, 
        y: height + renderOffset.y 
      },
      text_position: { 
        x: -heightOffset + 40 + renderOffset.x, 
        y: height / 2 + renderOffset.y 
      },
      value: originalHeight,
      label: `${Math.round(originalHeight)}mm`,
      orientation: DimensionOrientation.VERTICAL,
    },
  ];

  return applyTransformToDimensions(baseDimensions, transform, renderOffset, 'rectangle', params);
};

// Circle dimensions
const calculateCircleDimensions = (params, transform, renderOffset) => {
  const radius = params.radius || 50;
  const diameter = radius * 2;
  const diameterOffset = Math.max(5, Math.min(30, diameter * 0.08));

  const baseDimensions = [
    {
      start_point: { 
        x: radius + renderOffset.x, 
        y: diameterOffset + renderOffset.y 
      },
      end_point: { 
        x: radius + renderOffset.x, 
        y: diameter - diameterOffset + renderOffset.y 
      },
      text_position: { 
        x: radius + diameterOffset + (diameterOffset * 0.75) + renderOffset.x, 
        y: radius + renderOffset.y 
      },
      value: diameter,
      label: `Ø ${Math.round(diameter)}mm`,
      orientation: DimensionOrientation.VERTICAL,
    },
  ];

  return applyTransformToDimensions(baseDimensions, transform, renderOffset, 'circle', params);
};

// Triangle dimensions
const calculateTriangleDimensions = (params, transform, renderOffset) => {
  const base = params.base || 100;
  const height = params.height || 100;
  const offset = 20;

  const baseDimensions = [
    {
      start_point: { 
        x: base * 0.13 + renderOffset.x, 
        y: height + 10 + renderOffset.y 
      },
      end_point: { 
        x: base * 0.87 + renderOffset.x, 
        y: height + 10 + renderOffset.y 
      },
      text_position: { 
        x: base / 2 + renderOffset.x, 
        y: height + offset + 5 + renderOffset.y 
      },
      value: base,
      label: `${Math.round(base)}mm`,
      orientation: DimensionOrientation.HORIZONTAL,
    },
    {
      start_point: { 
        x: base * 0.5 + renderOffset.x, 
        y: height - offset * 0.5 + renderOffset.y 
      },
      end_point: { 
        x: base * 0.5 + renderOffset.x, 
        y: 10 + renderOffset.y 
      },
      text_position: { 
        x: base * 0.5 + 15 + renderOffset.x, 
        y: height / 2 + renderOffset.y 
      },
      value: height,
      label: `${Math.round(height)}mm`,
      orientation: DimensionOrientation.VERTICAL,
    },
  ];

  return applyTransformToDimensions(baseDimensions, transform, renderOffset, 'triangle', params);
};

// L-Shape dimensions
const calculateLShapeDimensions = (params, transform, renderOffset) => {
  const outerWidth = params.outerWidth || 120;
  const outerHeight = params.outerHeight || 80;
  const innerWidth = params.innerWidth || 40;
  const innerHeight = params.innerHeight || 40;
  const offset = 20;

  const baseDimensions = [
    {
      start_point: { 
        x: 50 + renderOffset.x, 
        y: -offset + renderOffset.y 
      },
      end_point: { 
        x: outerWidth + renderOffset.x, 
        y: -offset + renderOffset.y 
      },
      text_position: { 
        x: outerWidth / 2 + renderOffset.x, 
        y: -offset - 10 + renderOffset.y 
      },
      value: outerWidth,
      label: `${Math.round(outerWidth)}mm`,
      orientation: DimensionOrientation.HORIZONTAL,
    },
    {
      start_point: { 
        x: -offset + renderOffset.x, 
        y: 0 + renderOffset.y 
      },
      end_point: { 
        x: -offset + renderOffset.x, 
        y: outerHeight + renderOffset.y 
      },
      text_position: { 
        x: -offset - 10 + renderOffset.x, 
        y: outerHeight / 2 + renderOffset.y 
      },
      value: outerHeight,
      label: `${Math.round(outerHeight)}mm`,
      orientation: DimensionOrientation.VERTICAL,
    },
    {
      start_point: { 
        x: 50 + renderOffset.x, 
        y: outerHeight + offset + renderOffset.y 
      },
      end_point: { 
        x: innerWidth + renderOffset.x, 
        y: outerHeight + offset + renderOffset.y 
      },
      text_position: { 
        x: innerWidth / 2 + renderOffset.x, 
        y: outerHeight + offset + 10 + renderOffset.y 
      },
      value: innerWidth,
      label: `${Math.round(innerWidth)}mm`,
      orientation: DimensionOrientation.HORIZONTAL,
    },
    {
      start_point: { 
        x: outerWidth + offset + renderOffset.x, 
        y: 0 + renderOffset.y 
      },
      end_point: { 
        x: outerWidth + offset + renderOffset.x, 
        y: innerHeight + renderOffset.y 
      },
      text_position: { 
        x: outerWidth + offset + 10 + renderOffset.x, 
        y: innerHeight / 2 + renderOffset.y 
      },
      value: innerHeight,
      label: `${Math.round(innerHeight)}mm`,
      orientation: DimensionOrientation.VERTICAL,
    },
  ];

  return applyTransformToDimensions(baseDimensions, transform, renderOffset, 'lshape', params);
};

// Trapezoid dimensions
const calculateTrapezoidDimensions = (params, transform, renderOffset) => {
  const topWidth = params.topWidth || 80;
  const bottomWidth = params.bottomWidth || 120;
  const height = params.height || 60;
  const bottomOffset = (bottomWidth - topWidth) / 2;
  const offset = 20;

  const baseDimensions = [
    {
      start_point: { 
        x: bottomOffset + renderOffset.x, 
        y: -height * 0.05 + renderOffset.y 
      },
      end_point: { 
        x: bottomOffset + topWidth + renderOffset.x, 
        y: -height * 0.05 + renderOffset.y 
      },
      text_position: { 
        x: bottomOffset + topWidth / 2 + renderOffset.x, 
        y: -offset + 30 + renderOffset.y 
      },
      value: topWidth,
      label: `${Math.round(topWidth)}mm`,
      orientation: DimensionOrientation.HORIZONTAL,
    },
    {
      start_point: { 
        x: 0 + renderOffset.x, 
        y: height + height * 0.05 + renderOffset.y 
      },
      end_point: { 
        x: bottomWidth + renderOffset.x, 
        y: height + height * 0.05 + renderOffset.y 
      },
      text_position: { 
        x: bottomWidth / 2 + renderOffset.x, 
        y: height + offset - 15 + renderOffset.y 
      },
      value: bottomWidth,
      label: `${Math.round(bottomWidth)}mm`,
      orientation: DimensionOrientation.HORIZONTAL,
    },
    {
      start_point: { 
        x: bottomWidth / 2 + offset + renderOffset.x, 
        y: height * 0.10 + renderOffset.y 
      },
      end_point: { 
        x: bottomWidth / 2 + offset + renderOffset.x, 
        y: height - height * 0.10 + renderOffset.y 
      },
      text_position: { 
        x: bottomWidth / 2 + offset + 15 + renderOffset.x, 
        y: height / 2 + renderOffset.y 
      },
      value: height,
      label: `${Math.round(height)}mm`,
      orientation: DimensionOrientation.VERTICAL,
    },
  ];

  return applyTransformToDimensions(baseDimensions, transform, renderOffset, 'trapezoid', params);
};

// Apply transformation to dimension points
const applyTransformToDimensions = (dimensions, transform, renderOffset, shapeType, parameters) => {
  if ((!transform.rotation || transform.rotation === 0) && 
      !transform.flipX && !transform.flipY) {
    return dimensions;
  }

  // Get the actual shape center for rotation
  const shapeCenter = getShapeCenter(shapeType, parameters);
  
  // Adjust center to account for render offset
  const adjustedCenter = {
    x: shapeCenter.x + renderOffset.x,
    y: shapeCenter.y + renderOffset.y,
  };

  return dimensions.map(dim => {
    const newDim = { ...dim };
    
    // Apply transformations to points
    newDim.start_point = transformPoint(dim.start_point, adjustedCenter, transform);
    newDim.end_point = transformPoint(dim.end_point, adjustedCenter, transform);
    newDim.text_position = transformPoint(dim.text_position, adjustedCenter, transform);

    // Update orientation based on rotation
    const rotationDegrees = transform.rotation || 0;
    const normalizedRotation = rotationDegrees % 360;

    const shouldSwapOrientation = 
      (normalizedRotation >= 45 && normalizedRotation < 135) || 
      (normalizedRotation >= 225 && normalizedRotation < 315) ||
      transform.flipX ||
      transform.flipY;

    if (shouldSwapOrientation) {
      switch (newDim.orientation) {
        case DimensionOrientation.HORIZONTAL:
          newDim.orientation = DimensionOrientation.VERTICAL;
          break;
        case DimensionOrientation.VERTICAL:
          newDim.orientation = DimensionOrientation.HORIZONTAL;
          break;
      }
    }

    return newDim;
  });
};

// Transform a point based on rotation and flips
const transformPoint = (point, center, transform) => {
  let { x, y } = point;

  // Apply rotation
  if (transform.rotation && transform.rotation !== 0) {
    const angleRad = (transform.rotation * Math.PI) / 180;
    const cosA = Math.cos(angleRad);
    const sinA = Math.sin(angleRad);

    const relX = x - center.x;
    const relY = y - center.y;

    x = relX * cosA - relY * sinA + center.x;
    y = relX * sinA + relY * cosA + center.y;
  }

  // Apply flips
  if (transform.flipX) {
    x = 2 * center.x - x;
  }
  if (transform.flipY) {
    y = 2 * center.y - y;
  }

  return { x, y };
};

// Get shape center for dimension calculations
export const getShapeCenter = (shapeType, parameters) => {
  switch (shapeType) {
    case 'rectangle':
      return {
        x: (parameters.width || 100) / 2,
        y: (parameters.height || 100) / 2
      };
    case 'circle':
      const radius = parameters.radius || 50;
      return { x: radius, y: radius };
    case 'triangle':
      return {
        x: (parameters.base || 100) / 2,
        y: (parameters.height || 100) / 2
      };
    case 'lshape':
      return {
        x: (parameters.outerWidth || 120) / 2,
        y: (parameters.outerHeight || 80) / 2
      };
    case 'trapezoid':
      return {
        x: (parameters.bottomWidth || 120) / 2,
        y: (parameters.height || 60) / 2
      };
    default:
      return { x: 0, y: 0 };
  }
};

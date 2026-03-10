import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { shapeUtils } from '../../shapes/index.js';
import { transformUtils } from '../../geometry/transform.js';
import { dimensionUtils } from '../../geometry/dimensions.js';

const SVGCanvas = () => {
  const { currentShape, selectedShapeType } = useSelector((state) => state.shape);
  const svgRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [showGrid, setShowGrid] = useState(true);
  const [showDimensions, setShowDimensions] = useState(true);

  // Get shape information
  const shapeInfo = useMemo(() => {
    if (!selectedShapeType || !currentShape.parameters) return null;
    
    const validation = shapeUtils.validateShape(selectedShapeType, currentShape.parameters);
    if (!validation.isValid) {
      return null;
    }

    return shapeUtils.getShapeInfo(selectedShapeType, currentShape.parameters);
  }, [selectedShapeType, currentShape.parameters]);

  // Apply transformations to shape path
  const transformedShape = useMemo(() => {
    if (!shapeInfo) return null;

    const { path, boundingBox } = shapeInfo;
    const center = {
      x: boundingBox.width / 2,
      y: boundingBox.height / 2
    };

    // Apply transformations
    const transformedPath = transformUtils.transformPath(
      path,
      boundingBox,
      currentShape.rotation,
      currentShape.flipX,
      currentShape.flipY
    );

    // Get transformed bounding box
    const transformedBoundingBox = transformUtils.getTransformedBoundingBox(
      boundingBox,
      currentShape.rotation,
      currentShape.flipX,
      currentShape.flipY
    );

    return {
      path: transformedPath,
      boundingBox: transformedBoundingBox,
      center
    };
  }, [shapeInfo, currentShape.rotation, currentShape.flipX, currentShape.flipY]);

  // Calculate viewBox and canvas dimensions
  const canvasSettings = useMemo(() => {
    const width = 800;
    const height = 500;
    const padding = 50;

    if (!transformedShape) {
      return {
        viewBox: `0 0 ${width} ${height}`,
        width,
        height,
        scale: 1
      };
    }

    const { boundingBox } = transformedShape;
    const shapeWidth = boundingBox.width + padding * 2;
    const shapeHeight = boundingBox.height + padding * 2;

    // Calculate scale to fit shape in canvas
    const scaleX = width / shapeWidth;
    const scaleY = height / shapeHeight;
    const scale = Math.min(scaleX, scaleY, 2); // Max 2x zoom

    // Calculate viewBox to center the shape
    const viewBoxX = boundingBox.minX - padding;
    const viewBoxY = boundingBox.minY - padding;
    const viewBoxWidth = shapeWidth;
    const viewBoxHeight = shapeHeight;

    return {
      viewBox: `${viewBoxX} ${viewBoxY} ${viewBoxWidth} ${viewBoxHeight}`,
      width,
      height,
      scale
    };
  }, [transformedShape]);

  // Generate grid
  const generateGrid = () => {
    if (!showGrid) return null;

    const gridSize = 100; // 100mm grid
    const { viewBox } = canvasSettings;
    const [vbX, vbY, vbWidth, vbHeight] = viewBox.split(' ').map(Number);

    const gridLines = [];
    
    // Vertical lines
    for (let x = Math.floor(vbX / gridSize) * gridSize; x <= vbX + vbWidth; x += gridSize) {
      gridLines.push(
        <line
          key={`v-${x}`}
          x1={x}
          y1={vbY}
          x2={x}
          y2={vbY + vbHeight}
          stroke="#e5e7eb"
          strokeWidth="0.5"
        />
      );
    }

    // Horizontal lines
    for (let y = Math.floor(vbY / gridSize) * gridSize; y <= vbY + vbHeight; y += gridSize) {
      gridLines.push(
        <line
          key={`h-${y}`}
          x1={vbX}
          y1={y}
          x2={vbX + vbWidth}
          y2={y}
          stroke="#e5e7eb"
          strokeWidth="0.5"
        />
      );
    }

    return (
      <g className="grid">
        {gridLines}
      </g>
    );
  };

  // Generate dimension labels
  const generateDimensions = () => {
    if (!showDimensions || !shapeInfo) return null;

    const dimensions = [];
    const { dimensionPoints, parameters } = shapeInfo;

    // Generate dimension lines based on shape type
    switch (selectedShapeType) {
      case 'rectangle':
        if (dimensionPoints.width) {
          const widthDim = dimensionUtils.createDimensionLine(
            dimensionPoints.width.start,
            dimensionPoints.width.end,
            `${parameters.width}mm`,
            20
          );
          dimensions.push(
            <g key="width-dim" className="dimension">
              <line
                x1={widthDim.dimensionLine.x1}
                y1={widthDim.dimensionLine.y1}
                x2={widthDim.dimensionLine.x2}
                y2={widthDim.dimensionLine.y2}
                stroke="#6b7280"
                strokeWidth="1"
              />
              <text
                x={widthDim.label.x}
                y={widthDim.label.y}
                fill="#374151"
                fontSize="12"
                textAnchor="middle"
              >
                {widthDim.label.text}
              </text>
            </g>
          );
        }
        
        if (dimensionPoints.height) {
          const heightDim = dimensionUtils.createDimensionLine(
            dimensionPoints.height.start,
            dimensionPoints.height.end,
            `${parameters.height}mm`,
            20
          );
          dimensions.push(
            <g key="height-dim" className="dimension">
              <line
                x1={heightDim.dimensionLine.x1}
                y1={heightDim.dimensionLine.y1}
                x2={heightDim.dimensionLine.x2}
                y2={heightDim.dimensionLine.y2}
                stroke="#6b7280"
                strokeWidth="1"
              />
              <text
                x={heightDim.label.x}
                y={heightDim.label.y}
                fill="#374151"
                fontSize="12"
                textAnchor="middle"
              >
                {heightDim.label.text}
              </text>
            </g>
          );
        }
        break;

      case 'circle':
        if (dimensionPoints.diameter) {
          const diameter = parameters.radius * 2;
          const center = { x: parameters.radius, y: parameters.radius };
          
          dimensions.push(
            <g key="diameter-dim" className="dimension">
              <line
                x1={0}
                y1={center.y}
                x2={diameter}
                y2={center.y}
                stroke="#6b7280"
                strokeWidth="1"
              />
              <text
                x={center.x}
                y={center.y - 15}
                fill="#374151"
                fontSize="12"
                textAnchor="middle"
              >
                {`${diameter}mm`}
              </text>
            </g>
          );
        }
        break;
    }

    return <g className="dimensions">{dimensions}</g>;
  };

  // Mouse event handlers
  const handleMouseDown = (e) => {
    if (e.button === 0) { // Left click
      setIsPanning(true);
      setLastPanPoint({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = (e) => {
    const svg = svgRef.current;
    if (!svg) return;

    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgP = pt.matrixTransform(svg.getScreenCTM().inverse());
    
    setMousePos({ x: Math.round(svgP.x), y: Math.round(svgP.y) });

    if (isPanning) {
      const dx = e.clientX - lastPanPoint.x;
      const dy = e.clientY - lastPanPoint.y;
      
      setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }));
      setLastPanPoint({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.max(0.1, Math.min(5, prev * delta)));
  };

  // Zoom controls
  const handleZoomIn = () => setZoom(prev => Math.min(5, prev * 1.2));
  const handleZoomOut = () => setZoom(prev => Math.max(0.1, prev / 1.2));
  const handleZoomReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  if (!shapeInfo) {
    return (
      <div className="border-2 border-gray-200 rounded-lg bg-gray-50 h-96 lg:h-[500px] flex items-center justify-center">
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-2">⚠️</div>
          <p>Invalid shape parameters</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* SVG Canvas */}
      <div className="border-2 border-gray-200 rounded-lg bg-white overflow-hidden">
        <svg
          ref={svgRef}
          width={canvasSettings.width}
          height={canvasSettings.height}
          viewBox={canvasSettings.viewBox}
          className="cursor-move"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        >
          <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
            {/* Grid */}
            {generateGrid()}
            
            {/* Shape */}
            {transformedShape && (
              selectedShapeType === 'circle' ? (
                // Render circle as actual SVG circle element
                <circle
                  cx={transformedShape.center.x}
                  cy={transformedShape.center.y}
                  r={currentShape.parameters.radius}
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="2"
                  className="shape-path"
                  transform={`rotate(${currentShape.rotation} ${transformedShape.center.x} ${transformedShape.center.y})${currentShape.flipX ? ' scale(-1, 1)' : ''}${currentShape.flipY ? ' scale(1, -1)' : ''}`}
                />
              ) : (
                // Render other shapes as paths
                <path
                  d={transformedShape.path}
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="2"
                  className="shape-path"
                />
              )
            )}
            
            {/* Dimensions */}
            {generateDimensions()}
          </g>
        </svg>
      </div>

      {/* Control Panel */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Zoom Controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleZoomOut}
              className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm font-medium"
            >
              Zoom Out
            </button>
            <span className="text-sm text-gray-600 min-w-[60px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm font-medium"
            >
              Zoom In
            </button>
            <button
              onClick={handleZoomReset}
              className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm font-medium"
            >
              Reset
            </button>
          </div>

          {/* Toggle Controls */}
          <div className="flex items-center space-x-2">
            <label className="flex items-center text-sm">
              <input
                type="checkbox"
                checked={showGrid}
                onChange={(e) => setShowGrid(e.target.checked)}
                className="mr-1"
              />
              Grid
            </label>
            <label className="flex items-center text-sm">
              <input
                type="checkbox"
                checked={showDimensions}
                onChange={(e) => setShowDimensions(e.target.checked)}
                className="mr-1"
              />
              Dimensions
            </label>
          </div>
        </div>

        {/* Coordinates */}
        <div className="text-sm text-gray-600">
          <span>X: {mousePos.x}mm</span>
          <span className="mx-2">|</span>
          <span>Y: {mousePos.y}mm</span>
        </div>
      </div>

      {/* Info Bar */}
      <div className="mt-2 p-2 bg-gray-100 rounded text-xs text-gray-600">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-cad-blue font-medium">
              {shapeUtils.getDisplayName(selectedShapeType)}
            </span>
            <span className="ml-2">
              Area: {shapeInfo.area.toFixed(1)}mm² | Perimeter: {shapeInfo.perimeter.toFixed(1)}mm
            </span>
          </div>
          <div>
            Rotation: {currentShape.rotation}° | 
            Flip: {currentShape.flipX ? 'X' : ''}{currentShape.flipY ? 'Y' : ''}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SVGCanvas;

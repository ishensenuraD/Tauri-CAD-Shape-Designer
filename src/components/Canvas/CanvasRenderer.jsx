import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { invoke } from '@tauri-apps/api/core';
import { toggleDimensions } from '../../store/shapeSlice';

const CanvasRenderer = () => {
  const { currentShape, selectedShapeType, showDimensions } = useSelector((state) => state.shape);
  const dispatch = useDispatch();
  const canvasRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [showGrid, setShowGrid] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [renderedImage, setRenderedImage] = useState(null);
  const [shapeInfo, setShapeInfo] = useState(null);
  const [isTauriContext, setIsTauriContext] = useState(true);

  // Convert frontend shape parameters to backend format
  const convertParameters = useCallback(() => {
    if (!currentShape.parameters) return null;

    const params = {
      width: currentShape.parameters.width,
      height: currentShape.parameters.height,
      radius: currentShape.parameters.radius,
      base: currentShape.parameters.base,
      angle: currentShape.parameters.angle,
      outer_width: currentShape.parameters.outerWidth,
      outer_height: currentShape.parameters.outerHeight,
      inner_width: currentShape.parameters.innerWidth,
      inner_height: currentShape.parameters.innerHeight,
      top_width: currentShape.parameters.topWidth,
      bottom_width: currentShape.parameters.bottomWidth,
    };

    // Remove undefined values
    Object.keys(params).forEach(key => {
      if (params[key] === undefined) {
        delete params[key];
      }
    });

    return params;
  }, [currentShape.parameters]);

  // Render shape from backend
  const renderShape = useCallback(async () => {
    if (!selectedShapeType || !currentShape.parameters) return;

    setIsLoading(true);
    
    try {
      const params = convertParameters();
      const transform = {
        rotation: currentShape.rotation || 0,
        flip_x: currentShape.flipX || false,
        flip_y: currentShape.flipY || false,
      };

      const request = {
        shape_type: selectedShapeType,
        parameters: params,
        transform: transform,
        width: 800,
        height: 500,
      };

      // Check if invoke is available (Tauri context)
      if (typeof invoke !== 'function') {
        console.warn('Tauri invoke not available - running in browser context');
        setIsTauriContext(false);
        return;
      }

      const response = await invoke('render_shape_to_png', { request });
      
      if (response.success) {
        // Convert base64 to image
        const img = new Image();
        img.onload = () => {
          setRenderedImage(img);
          setShapeInfo(response.shape_info);
        };
        img.src = response.base64;
      } else {
        console.error('Render error:', response.error);
      }
    } catch (error) {
      console.error('Failed to render shape:', error);
      // Check if it's the specific invoke error
      if (error.message && error.message.includes('invoke')) {
        console.warn('Tauri API not available - app running in browser context');
        setIsTauriContext(false);
      }
    } finally {
      setIsLoading(false);
    }
  }, [selectedShapeType, currentShape, convertParameters]);

  // Render shape when parameters change
  useEffect(() => {
    renderShape();
  }, [renderShape]);

  // Draw dimension line with arrows
  const drawDimensionLine = (ctx, start, end, color = '#2563eb', lineWidth = 1) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
  };

  // Draw arrow head
  const drawArrow = (ctx, from, to, color = '#2563eb', size = 8) => {
    const angle = Math.atan2(to.y - from.y, to.x - from.x);
    
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(to.x, to.y);
    ctx.lineTo(
      to.x - size * Math.cos(angle - Math.PI / 6),
      to.y - size * Math.sin(angle - Math.PI / 6)
    );
    ctx.lineTo(
      to.x - size * Math.cos(angle + Math.PI / 6),
      to.y - size * Math.sin(angle + Math.PI / 6)
    );
    ctx.closePath();
    ctx.fill();
  };

  // Draw dimension text
  const drawDimensionText = (ctx, text, position, color = '#2563eb', fontSize = 12) => {
    ctx.fillStyle = color;
    ctx.font = `${fontSize}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, position.x, position.y);
  };

  // Draw dimensions for a shape
  const drawDimensions = (ctx) => {
    if (!showDimensions || !shapeInfo || !shapeInfo.dimensions) return;

    const canvas = canvasRef.current;
    const centerX = (canvas.width - renderedImage?.width || 0) / 2;
    const centerY = (canvas.height - renderedImage?.height || 0) / 2;

    shapeInfo.dimensions.forEach(dimension => {
      // Apply scale factors to transform from SVG coordinates to image coordinates
      const scaledStart = {
        x: dimension.start_point.x * (shapeInfo.svg_to_image_scale_x || 1),
        y: dimension.start_point.y * (shapeInfo.svg_to_image_scale_y || 1)
      };
      const scaledEnd = {
        x: dimension.end_point.x * (shapeInfo.svg_to_image_scale_x || 1),
        y: dimension.end_point.y * (shapeInfo.svg_to_image_scale_y || 1)
      };
      const scaledText = {
        x: dimension.text_position.x * (shapeInfo.svg_to_image_scale_x || 1),
        y: dimension.text_position.y * (shapeInfo.svg_to_image_scale_y || 1)
      };

      // Transform dimension coordinates based on zoom and pan
      const transformedStart = {
        x: centerX + scaledStart.x * zoom + pan.x,
        y: centerY + scaledStart.y * zoom + pan.y
      };
      const transformedEnd = {
        x: centerX + scaledEnd.x * zoom + pan.x,
        y: centerY + scaledEnd.y * zoom + pan.y
      };
      const transformedText = {
        x: centerX + scaledText.x * zoom + pan.x,
        y: centerY + scaledText.y * zoom + pan.y
      };

      // Draw dimension line
      drawDimensionLine(ctx, transformedStart, transformedEnd);
      
      // Draw arrows at both ends
      drawArrow(ctx, transformedStart, transformedEnd);
      drawArrow(ctx, transformedEnd, transformedStart);
      
      // Draw dimension text
      drawDimensionText(ctx, dimension.label, transformedText);
    });
  };

  // Draw on canvas
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas completely
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Fill with white background to ensure complete clearing
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Save context state
    ctx.save();

    // Draw grid (before zoom transformation for fixed screen density)
    if (showGrid) {
      drawGrid(ctx, canvas.width, canvas.height);
    }

    // Apply transformations for shape
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);

    // Draw rendered shape (base layer)
    if (renderedImage) {
      // Center the image
      const x = (canvas.width - renderedImage.width) / 2;
      const y = (canvas.height - renderedImage.height) / 2;
      ctx.drawImage(renderedImage, x, y);
    }

    // Restore context state
    ctx.restore();

    // Draw dimensions (after restoring context to avoid transformations)
    drawDimensions(ctx);
  }, [zoom, pan, showGrid, renderedImage, shapeInfo, showDimensions]);

  // Redraw when dependencies change
  useEffect(() => {
    draw();
  }, [draw]);

  // Draw grid
  const drawGrid = (ctx, width, height) => {
    const gridSize = 80; // 100mm grid
    ctx.strokeStyle = '#9ca3af';
    ctx.lineWidth = 1;

    // Calculate the effective grid size with zoom
    const effectiveGridSize = gridSize * zoom;
    
    // Calculate offset based on pan to keep grid aligned
    const offsetX = pan.x % effectiveGridSize;
    const offsetY = pan.y % effectiveGridSize;

    // Vertical lines
    for (let x = -offsetX; x <= width; x += effectiveGridSize) {
      const pixelX = Math.round(x);
      ctx.beginPath();
      ctx.moveTo(pixelX, 0);
      ctx.lineTo(pixelX, height);
      ctx.stroke();
    }

    // Horizontal lines
    for (let y = -offsetY; y <= height; y += effectiveGridSize) {
      const pixelY = Math.round(y);
      ctx.beginPath();
      ctx.moveTo(0, pixelY);
      ctx.lineTo(width, pixelY);
      ctx.stroke();
    }
  };

  // Mouse event handlers
  const handleMouseDown = (e) => {
    if (e.button === 0) { // Left click
      setIsPanning(true);
      setLastPanPoint({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setMousePos({ x: Math.round(x), y: Math.round(y) });

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

  if (!isTauriContext) {
    return (
      <div className="canvas-wrapper canvas-loading">
        <div className="canvas-loading-content">
          <div className="loading-spinner">⚠️</div>
          <h3>Browser Context Detected</h3>
          <p>This app requires the Tauri desktop environment to render shapes.</p>
          <p>Please use the desktop Tauri window instead of the browser preview.</p>
          <div style={{ marginTop: '20px', fontSize: '14px', color: '#6b7280' }}>
            <p>The desktop window should have opened automatically when you ran:</p>
            <code style={{ background: '#f3f4f6', padding: '4px 8px', borderRadius: '4px' }}>
              npm run tauri dev
            </code>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="canvas-wrapper canvas-loading">
        <div className="canvas-loading-content">
          <div className="loading-spinner">⟳</div>
          <p>Rendering shape...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Canvas */}
      <div className="canvas-canvas-wrapper">
        <canvas
          ref={canvasRef}
          width={800}
          height={500}
          className="cursor-move"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        />
      </div>

      {/* Control Panel */}
      <div className="canvas-controls-panel">
        <div className="canvas-controls-left">
          {/* Zoom Controls */}
          <div className="zoom-controls">
            <button
              onClick={handleZoomOut}
              className="btn btn-secondary"
            >
              Zoom Out
            </button>
            <span className="zoom-display">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              className="btn btn-secondary"
            >
              Zoom In
            </button>
            <button
              onClick={handleZoomReset}
              className="btn btn-secondary"
            >
              Reset
            </button>
          </div>

          {/* Toggle Controls */}
          <div className="toggle-controls">
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={showGrid}
                onChange={(e) => setShowGrid(e.target.checked)}
                className="toggle-checkbox"
              />
              Grid
            </label>
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={showDimensions}
                onChange={() => dispatch(toggleDimensions())}
                className="toggle-checkbox"
              />
              Dimensions
            </label>
          </div>
        </div>

        {/* Coordinates */}
        <div className="coordinates-display">
          <span>X: {mousePos.x}px</span>
          <span className="coord-separator">|</span>
          <span>Y: {mousePos.y}px</span>
        </div>
      </div>

      {/* Info Bar */}
      {shapeInfo && (
        <div className="canvas-info-panel">
          <div className="canvas-info-content">
            <div>
              <span className="shape-name">
                {selectedShapeType.charAt(0).toUpperCase() + selectedShapeType.slice(1)}
              </span>
              <span className="shape-metrics">
                Area: {shapeInfo.area.toFixed(1)}mm² | Perimeter: {shapeInfo.perimeter.toFixed(1)}mm
              </span>
            </div>
            <div>
              Rotation: {currentShape.rotation}° | 
              Flip: {currentShape.flipX ? 'X' : ''}{currentShape.flipY ? 'Y' : ''}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CanvasRenderer;

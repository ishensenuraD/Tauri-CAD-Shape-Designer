import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { exportDxfBasic, exportDxfDetailed, saveDxfFile } from '../../export/dxf';
import { exportPngBasic, exportPngDetailed, savePngFile, savePngFileAlternative, savePngFileFallback } from '../../export/png';

const ExportPanel = () => {
  const { currentShape, selectedShapeType } = useSelector((state) => state.shape);
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState('');

  const convertParameters = () => {
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
  };

  const getTransform = () => {
    return {
      rotation: currentShape.rotation || 0,
      flip_x: currentShape.flipX || false,
      flip_y: currentShape.flipY || false,
    };
  };

  const handleExportDxfBasic = async () => {
    if (!selectedShapeType) {
      setExportStatus('No shape selected');
      return;
    }

    setIsExporting(true);
    setExportStatus('Exporting basic DXF...');

    try {
      const params = convertParameters();
      const transform = getTransform();
      
      const dxfData = await exportDxfBasic(selectedShapeType, params, transform);
      
      const filename = `${selectedShapeType}_basic.dxf`;
      const savedPath = await saveDxfFile(dxfData, filename);
      
      setExportStatus(`Basic DXF exported to: ${savedPath}`);
    } catch (error) {
      setExportStatus(`Export failed: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportDxfDetailed = async () => {
    if (!selectedShapeType) {
      setExportStatus('No shape selected');
      return;
    }

    setIsExporting(true);
    setExportStatus('Exporting detailed DXF...');

    try {
      const params = convertParameters();
      const transform = getTransform();
      
      const dxfData = await exportDxfDetailed(selectedShapeType, params, transform);
      
      const filename = `${selectedShapeType}_detailed.dxf`;
      const savedPath = await saveDxfFile(dxfData, filename);
      
      setExportStatus(`Detailed DXF exported to: ${savedPath}`);
    } catch (error) {
      setExportStatus(`Export failed: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPngBasic = async () => {
    if (!selectedShapeType) {
      setExportStatus('No shape selected');
      return;
    }

    setIsExporting(true);
    setExportStatus('Exporting basic PNG...');

    try {
      const params = convertParameters();
      const transform = getTransform();
      
      const pngData = await exportPngBasic(selectedShapeType, params, transform);
      
      const filename = `${selectedShapeType}_basic.png`;
      
      // Try multiple save methods in order of preference
      let savedPath;
      try {
        savedPath = await savePngFile(pngData, filename);
      } catch (primaryError) {
        console.warn('Primary PNG save failed, trying alternative:', primaryError);
        try {
          savedPath = await savePngFileAlternative(pngData, filename);
        } catch (alternativeError) {
          console.warn('Alternative PNG save failed, using browser fallback:', alternativeError);
          savedPath = savePngFileFallback(pngData, filename);
        }
      }
      
      setExportStatus(`Basic PNG exported: ${savedPath}`);
    } catch (error) {
      setExportStatus(`Export failed: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPngDetailed = async () => {
    if (!selectedShapeType) {
      setExportStatus('No shape selected');
      return;
    }

    setIsExporting(true);
    setExportStatus('Exporting detailed PNG...');

    try {
      const params = convertParameters();
      const transform = getTransform();
      
      const pngData = await exportPngDetailed(selectedShapeType, params, transform);
      
      const filename = `${selectedShapeType}_detailed.png`;
      
      // Try multiple save methods in order of preference
      let savedPath;
      try {
        savedPath = await savePngFile(pngData, filename);
      } catch (primaryError) {
        console.warn('Primary PNG save failed, trying alternative:', primaryError);
        try {
          savedPath = await savePngFileAlternative(pngData, filename);
        } catch (alternativeError) {
          console.warn('Alternative PNG save failed, using browser fallback:', alternativeError);
          savedPath = savePngFileFallback(pngData, filename);
        }
      }
      
      setExportStatus(`Detailed PNG exported: ${savedPath}`);
    } catch (error) {
      setExportStatus(`Export failed: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="card">
      <h3 className="card-title">Export Options</h3>
      
      <div className="space-y-4">
        {/* PNG Export Section */}
        <div>
          <h4 className="card-subtitle">PNG Export</h4>
          <div className="space-y-2">
            <button
              onClick={handleExportPngBasic}
              disabled={isExporting || !selectedShapeType}
              className="btn btn-primary w-full"
            >
              {isExporting ? 'Exporting...' : 'Export Basic PNG'}
            </button>
            
            <button
              onClick={handleExportPngDetailed}
              disabled={isExporting || !selectedShapeType}
              className="btn btn-primary w-full"
            >
              {isExporting ? 'Exporting...' : 'Export Detailed PNG'}
            </button>
          </div>
          
          <div className="text-sm text-gray-600 mt-2">
            <p><strong>Basic:</strong> Shape outline only</p>
            <p><strong>Detailed:</strong> Shape with dimensions</p>
          </div>
        </div>

        {/* DXF Export Section */}
        <div>
          <h4 className="card-subtitle">DXF Export</h4>
          <div className="space-y-2">
            <button
              onClick={handleExportDxfBasic}
              disabled={isExporting || !selectedShapeType}
              className="btn btn-primary w-full"
            >
              {isExporting ? 'Exporting...' : 'Export Basic DXF'}
            </button>
            
            <button
              onClick={handleExportDxfDetailed}
              disabled={isExporting || !selectedShapeType}
              className="btn btn-primary w-full"
            >
              {isExporting ? 'Exporting...' : 'Export Detailed DXF'}
            </button>
          </div>
          
          <div className="text-sm text-gray-600 mt-2">
            <p><strong>Basic:</strong> Shape outline only</p>
            <p><strong>Detailed:</strong> Outline + dimensions + layers</p>
          </div>
        </div>

        {/* Export Status */}
        {exportStatus && (
          <div className={`p-3 rounded ${exportStatus.includes('failed') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {exportStatus}
          </div>
        )}

        {/* Current Shape Info */}
        {selectedShapeType && (
          <div className="text-sm text-gray-600">
            <p><strong>Current Shape:</strong> {selectedShapeType}</p>
            <p><strong>Rotation:</strong> {currentShape.rotation}°</p>
            <p><strong>Flip:</strong> {currentShape.flipX ? 'X' : ''}{currentShape.flipY ? 'Y' : ''}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExportPanel;

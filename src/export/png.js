import { invoke } from '@tauri-apps/api/core';
import { save } from '@tauri-apps/plugin-dialog';
import { writeFile } from '@tauri-apps/plugin-fs';

export const exportPngBasic = async (shapeType, parameters, transform) => {
  try {
    const request = {
      shape_type: shapeType,
      parameters: parameters,
      transform: transform,
      width: 1200,  // Higher resolution for export
      height: 800
    };

    const response = await invoke('generate_png_basic', { request });
    
    if (response.success) {
      return response.base64; // Use base64 data instead of raw binary
    } else {
      throw new Error(response.error || 'PNG generation failed');
    }
  } catch (error) {
    console.error('PNG export error:', error);
    throw error;
  }
};

export const exportPngDetailed = async (shapeType, parameters, transform) => {
  try {
    const request = {
      shape_type: shapeType,
      parameters: parameters,
      transform: transform,
      width: 400,  // Higher resolution for export
      height: 300
    };

    const response = await invoke('generate_png_detailed', { request });
    
    if (response.success) {
      return response.base64; // Use base64 data instead of raw binary
    } else {
      throw new Error(response.error || 'PNG generation failed');
    }
  } catch (error) {
    console.error('PNG export error:', error);
    throw error;
  }
};

export const savePngFile = async (pngData, filename) => {
  try {
    const filePath = await save({
      filters: [
        {
          name: 'PNG Files',
          extensions: ['png']
        }
      ],
      defaultPath: filename
    });

    if (filePath) {
      // Convert base64 to binary data
      const base64Data = pngData.replace(/^data:image\/png;base64,/, '');
      const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
      
      await writeFile(filePath, binaryData);
      return filePath;
    }
  } catch (error) {
    console.error('Save PNG error:', error);
    throw error;
  }
};

// Alternative save method using fetch API
export const savePngFileAlternative = async (pngData, filename) => {
  try {
    const filePath = await save({
      filters: [
        {
          name: 'PNG Files',
          extensions: ['png']
        }
      ],
      defaultPath: filename
    });

    if (filePath) {
      // Convert base64 to blob then to array buffer
      const base64Data = pngData.replace(/^data:image\/png;base64,/, '');
      const response = await fetch(`data:image/png;base64,${base64Data}`);
      const arrayBuffer = await response.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      await writeFile(filePath, uint8Array);
      return filePath;
    }
  } catch (error) {
    console.error('Save PNG error (alternative):', error);
    throw error;
  }
};

// Fallback method using browser download (no permissions needed)
export const savePngFileFallback = (pngData, filename) => {
  try {
    const link = document.createElement('a');
    link.href = pngData;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return `Downloaded ${filename} via browser`;
  } catch (error) {
    console.error('Save PNG error (fallback):', error);
    throw error;
  }
};

// Alternative function to download PNG in browser context (for testing)
export const downloadPngInBrowser = (base64Data, filename) => {
  const link = document.createElement('a');
  link.href = base64Data;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Debug function to test PNG export
export const testPngExport = async () => {
  try {
    console.log('Testing PNG export...');
    
    const testRequest = {
      shape_type: 'rectangle',
      parameters: { width: 100, height: 50 },
      transform: { rotation: 0, flip_x: false, flip_y: false },
      width: 400,
      height: 300
    };

    const response = await invoke('generate_png_basic', { request: testRequest });
    console.log('PNG response:', response);
    
    if (response.success) {
      console.log('PNG data length:', response.base64?.length);
      console.log('PNG data type:', typeof response.base64);
      
      // Test download in browser
      downloadPngInBrowser(response.base64, 'test_rectangle.png');
      return 'Success';
    } else {
      console.error('PNG generation failed:', response.error);
      return 'Failed';
    }
  } catch (error) {
    console.error('PNG test error:', error);
    return error.message;
  }
};

// Make test function available globally for debugging
if (typeof window !== 'undefined') {
  window.testPngExport = testPngExport;
}

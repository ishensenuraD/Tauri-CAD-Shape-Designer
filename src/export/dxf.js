import { invoke } from '@tauri-apps/api/core';
import { save } from '@tauri-apps/plugin-dialog';
import { writeTextFile } from '@tauri-apps/plugin-fs';

export const exportDxfBasic = async (shapeType, parameters, transform) => {
  try {
    const request = {
      shape_type: shapeType,
      parameters: parameters,
      transform: transform
    };

    const response = await invoke('generate_dxf_basic', { request });
    
    if (response.success) {
      return response.dxf_data;
    } else {
      throw new Error(response.error || 'DXF generation failed');
    }
  } catch (error) {
    console.error('DXF export error:', error);
    throw error;
  }
};

export const exportDxfDetailed = async (shapeType, parameters, transform) => {
  try {
    const request = {
      shape_type: shapeType,
      parameters: parameters,
      transform: transform
    };

    const response = await invoke('generate_dxf_detailed', { request });
    
    if (response.success) {
      return response.dxf_data;
    } else {
      throw new Error(response.error || 'DXF generation failed');
    }
  } catch (error) {
    console.error('DXF export error:', error);
    throw error;
  }
};

export const saveDxfFile = async (dxfData, filename) => {
  try {
    const filePath = await save({
      filters: [
        {
          name: 'DXF Files',
          extensions: ['dxf']
        }
      ],
      defaultPath: filename
    });

    if (filePath) {
      await writeTextFile(filePath, dxfData);
      return filePath;
    }
  } catch (error) {
    console.error('Save DXF error:', error);
    throw error;
  }
};

// Simple test script to verify DXF generation
// This can be run in the browser console when the app is running

async function testDxfExport() {
  try {
    console.log('Testing DXF export...');
    
    // Test basic rectangle export
    const rectangleParams = {
      width: 100,
      height: 50
    };
    
    const transform = {
      rotation: 0,
      flip_x: false,
      flip_y: false
    };
    
    // Test basic DXF
    const basicDxf = await window.__TAURI__.invoke('generate_dxf_basic', {
      request: {
        shape_type: 'rectangle',
        parameters: rectangleParams,
        transform: transform
      }
    });
    
    console.log('Basic DXF Response:', basicDxf);
    
    if (basicDxf.success) {
      console.log('✅ Basic DXF generated successfully');
      console.log('DXF data length:', basicDxf.dxf_data.length);
    } else {
      console.error('❌ Basic DXF failed:', basicDxf.error);
    }
    
    // Test detailed DXF
    const detailedDxf = await window.__TAURI__.invoke('generate_dxf_detailed', {
      request: {
        shape_type: 'rectangle',
        parameters: rectangleParams,
        transform: transform
      }
    });
    
    console.log('Detailed DXF Response:', detailedDxf);
    
    if (detailedDxf.success) {
      console.log('✅ Detailed DXF generated successfully');
      console.log('DXF data length:', detailedDxf.dxf_data.length);
    } else {
      console.error('❌ Detailed DXF failed:', detailedDxf.error);
    }
    
    // Test circle export
    const circleParams = {
      radius: 75
    };
    
    const circleDxf = await window.__TAURI__.invoke('generate_dxf_detailed', {
      request: {
        shape_type: 'circle',
        parameters: circleParams,
        transform: transform
      }
    });
    
    if (circleDxf.success) {
      console.log('✅ Circle DXF generated successfully');
    } else {
      console.error('❌ Circle DXF failed:', circleDxf.error);
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Make it available globally
window.testDxfExport = testDxfExport;

console.log('DXF test function loaded. Run `testDxfExport()` in console to test.');

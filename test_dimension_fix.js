// Test script to verify dimension rotation and PNG export fixes
const { invoke } = window.__TAURI__.core;

async function testDimensionFixes() {
    console.log('Testing dimension fixes...');
    
    // Test 1: Generate SVG with rotation for L-shape
    console.log('Test 1: L-shape with 90° rotation');
    const lshapeParams = {
        outer_width: 120,
        outer_height: 80,
        inner_width: 40,
        inner_height: 40
    };
    
    const transform = {
        rotation: 90,
        flip_x: false,
        flip_y: false
    };
    
    try {
        const svgResult = await invoke('generate_svg', {
            shapeType: 'lshape',
            parameters: lshapeParams,
            transform: transform,
            width: 800,
            height: 500
        });
        
        console.log('SVG generated successfully');
        console.log('SVG contains dimensions:', svgResult.includes('dimension'));
        console.log('SVG contains arrows:', svgResult.includes('marker'));
        console.log('SVG contains rotation:', svgResult.includes('rotate(90'));
        
        // Test 2: Generate PNG with rotation
        console.log('\nTest 2: PNG export with rotation');
        const pngResult = await invoke('render_shape_to_base64', {
            shapeType: 'lshape',
            parameters: lshapeParams,
            transform: transform,
            width: 800,
            height: 500
        });
        
        console.log('PNG generated successfully');
        console.log('PNG data length:', pngResult.length);
        
        console.log('\nAll tests completed successfully!');
        
    } catch (error) {
        console.error('Test failed:', error);
    }
}

// Run tests when the page loads
if (window.__TAURI__) {
    testDimensionFixes();
} else {
    console.log('Tauri API not available. Run this in the Tauri app.');
}

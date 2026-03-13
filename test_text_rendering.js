// Test script to verify dimension text rendering fix
const { invoke } = window.__TAURI__.core;

async function testTextRendering() {
    console.log('Testing dimension text rendering fix...');
    
    try {
        // Test with a circle to see dimension text
        const circleParams = {
            radius: 600
        };
        
        const transform = {
            rotation: 0,
            flip_x: false,
            flip_y: false
        };
        
        console.log('Generating PNG with dimensions...');
        const pngData = await invoke('render_shape_to_base64', {
            shapeType: 'circle',
            parameters: circleParams,
            transform: transform,
            width: 800,
            height: 500
        });
        
        console.log('PNG generated successfully!');
        console.log('PNG data length:', pngData.length);
        
        // Create a test image element to display the result
        const img = document.createElement('img');
        img.src = pngData;
        img.style.maxWidth = '400px';
        img.style.border = '1px solid #ccc';
        
        // Add to page for visual verification
        const container = document.createElement('div');
        container.innerHTML = '<h3>Dimension Text Rendering Test</h3>';
        container.appendChild(img);
        document.body.appendChild(container);
        
        console.log('Test image added to page for verification');
        console.log('You should now see dimension text as outlined boxes with cross patterns');
        
    } catch (error) {
        console.error('Test failed:', error);
    }
}

// Run test when page loads
if (window.__TAURI__) {
    testTextRendering();
} else {
    console.log('Tauri API not available. Run this in the Tauri app.');
}

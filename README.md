# Tauri CAD Shape Designer

A professional desktop application for designing and exporting parametric shapes using modern web technologies and Rust backend performance.

## Overview

The Tauri CAD Shape Designer is a cross-platform desktop application that allows users to create, manipulate, and export geometric shapes. Built with Tauri, React, and Rust, it combines the flexibility of web technologies with the performance of native applications.

## Features

- **5 Parametric Shapes**: Rectangle, Circle, Triangle, L-Shape, and Trapezoid
- **Real-time Editing**: Dynamic shape preview with instant parameter updates
- **Transformations**: Rotation (0°, 90°, 180°, 270°) and horizontal/vertical flipping
- **Professional UI**: Modern interface with shape library, property editor, and canvas
- **Export Options**: 
  - PNG (Basic and Detailed)
  - DXF (Basic and Detailed with layers)
- **Advanced Canvas**: Zoom, pan, grid, and dimension display
- **Cross-platform**: Windows, macOS, and Linux support

## Architecture

### Frontend (React + Redux)

The frontend is built with React 19 and uses Redux Toolkit for state management:

```
src/
├── components/
│   ├── Canvas/           # Shape rendering and canvas interaction
│   ├── Export/           # Export functionality UI
│   ├── ShapeEditor/      # Parameter editing interface
│   └── ShapeLibrary/     # Shape selection interface
├── export/
│   ├── dxf.js           # DXF export functions
│   └── png.js           # PNG export functions
└── store/
    └── shapeSlice.js    # Redux state management
```

**Key Components:**
- **CanvasRenderer**: Handles shape rendering, zoom/pan, and dimension display
- **ExportPanel**: Provides export options for PNG and DXF formats
- **ShapeEditor**: Real-time parameter editing with validation
- **ShapeLibrary**: Shape selection and switching

### Backend (Rust + Tauri)

The Rust backend provides high-performance geometry processing and file export:

```
src-tauri/src/
├── shapes/              # Shape geometry definitions
│   ├── mod.rs          # Shape trait definitions
│   ├── rectangle.rs    # Rectangle geometry
│   ├── circle.rs       # Circle geometry
│   ├── triangle.rs     # Triangle geometry
│   ├── lshape.rs       # L-Shape geometry
│   └── trapezoid.rs    # Trapezoid geometry
├── dxf_generator.rs    # DXF file generation
├── image_renderer.rs   # PNG rendering from SVG
├── svg_generator.rs    # SVG generation for shapes
└── lib.rs             # Tauri command handlers
```

**Key Modules:**
- **Shapes**: Defines geometric properties and transformations for each shape
- **SVG Generator**: Creates SVG representations with dimensions and styling
- **DXF Generator**: Generates DXF files with proper layer organization
- **Image Renderer**: Converts SVG to high-resolution PNG images

## Geometry Implementation

### Shape System

Each shape implements a common trait that provides:

- **Geometry Definition**: Points, lines, and curves that define the shape
- **Dimensions**: Automatic calculation of width, height, area, and perimeter
- **Transformations**: Rotation and flipping operations
- **Bounding Box**: ViewBox calculation for proper rendering

### Coordinate System

The application uses a millimeter-based coordinate system:
- Origin (0,0) at the center of the shape
- Positive X extends to the right
- Positive Y extends upward
- All dimensions are in millimeters

### Transformation Pipeline

1. **Base Geometry**: Define shape in standard orientation
2. **Apply Transformations**: Rotation and flipping
3. **Calculate Dimensions**: Generate dimension lines and labels
4. **ViewBox Calculation**: Determine optimal viewing area
5. **Render**: Convert to SVG/DXF/PNG format

## Export Implementation

### PNG Export

**Basic PNG**: 
- Shape outline only
- High resolution (1200x800px)
- Clean white background

**Detailed PNG**:
- Shape with dimension lines and labels
- Extra space for dimension annotations
- Professional technical drawing appearance

### DXF Export

**Basic DXF**:
- Shape outline geometry only
- Compatible with all CAD software
- Minimal file size

**Detailed DXF**:
- Multiple layers for organization:
  - `OUTLINE`: Shape geometry
  - `DIMENSIONS`: Dimension lines and text
  - `CENTERLINES`: Optional center lines
- Professional CAD file structure
- Proper entity types and attributes

## Build Instructions

### Prerequisites

1. **Node.js** (v18 or higher)
2. **Rust** (latest stable version)
3. **System dependencies**:
   - **Windows**: Microsoft Visual Studio C++ Build Tools
   - **macOS**: Xcode Command Line Tools
   - **Linux**: Essential build tools (gcc, make, etc.)

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd Tauri-CAD-Shape-Designer
   ```

2. **Install frontend dependencies**:
   ```bash
   npm install
   ```

3. **Install Rust dependencies** (handled automatically by Tauri):
   ```bash
   cd src-tauri
   cargo fetch
   cd ..
   ```

### Development

1. **Start development server**:
   ```bash
   npm run tauri dev
   ```

2. **Build for production**:
   ```bash
   npm run tauri build
   ```

### Build Outputs

- **Development**: Runs in development mode with hot reload
- **Production**: Creates optimized executables in `src-tauri/target/release/`

## Technology Stack

### Frontend
- **React 19**: Modern UI framework with hooks
- **Redux Toolkit**: State management and actions
- **TailwindCSS**: Utility-first CSS framework
- **Vite**: Fast build tool and dev server

### Backend
- **Tauri**: Lightweight desktop app framework
- **Rust**: Systems programming language
- **Serde**: Serialization/deserialization
- **SVG**: Vector graphics generation
- **DXF**: CAD file format support
- **Image**: High-performance image processing

### Key Dependencies
- `resvg`, `usvg`, `tiny-skia`: SVG rendering pipeline
- `dxf`: DXF file generation
- `base64`: Image encoding for web display

## Usage

1. **Select a Shape**: Choose from the shape library
2. **Edit Parameters**: Adjust dimensions in real-time
3. **Apply Transformations**: Rotate and flip as needed
4. **Preview**: View the shape with optional dimensions
5. **Export**: Save as PNG or DXF in basic or detailed format

## Performance

- **Real-time Rendering**: Instant preview updates
- **High-Resolution Export**: Professional quality output
- **Memory Efficient**: Optimized geometry calculations
- **Fast Startup**: Quick application launch

## Future Enhancements

- Grid snapping functionality
- Multiple shape support
- Undo/redo system
- Advanced measurement tools
- Shape constraints and relationships
- Import functionality for external files

## License

This project is part of a technical assessment and demonstrates modern desktop application development capabilities.

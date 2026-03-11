import React from 'react';
import { useSelector } from 'react-redux';
import ShapeLibrary from './components/ShapeLibrary/ShapeLibrary';
import ShapeEditor from './components/ShapeEditor/ShapeEditor';
import Canvas from './components/Canvas/Canvas';
import ExportPanel from './components/Export/ExportPanel';
import './App.css';

function App() {
  const { currentShape, selectedShapeType } = useSelector((state) => state.shape);

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="app-header-content">
          <div className="app-header-inner">
            <div className="logo-section">
              <div className="logo-container">
                <div className="logo-icon">
                  <svg className="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                  </svg>
                </div>
                <div className="logo-text">
                  <h1>CAD Shape Designer</h1>
                  <p>Professional Parametric Design</p>
                </div>
              </div>
            </div>
            
            <div className="header-status">
              <div className="status-indicator">
                <div className="status-dot"></div>
                <span>Ready</span>
              </div>
              {selectedShapeType && (
                <div className="selected-shape-badge">
                  <span>{selectedShapeType}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {/* Left Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-content">
            {/* Shape Library */}
            <section>
              <div className="section-header">
                <div className="section-icon">
                  <svg className="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h2 className="section-title">Shape Library</h2>
              </div>
              <ShapeLibrary />
            </section>

            {/* Shape Editor */}
            <section>
              <div className="section-header">
                <div className="section-icon">
                  <svg className="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                </div>
                <h2 className="section-title">Properties</h2>
              </div>
              <ShapeEditor />
            </section>

            {/* Export Panel */}
            <section>
              <div className="section-header">
                <div className="section-icon">
                  <svg className="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h2 className="section-title">Export</h2>
              </div>
              <ExportPanel />
            </section>
          </div>
        </aside>

        {/* Canvas Area */}
        <section className="canvas-area">
          <div className="canvas-container">
            <div className="canvas-wrapper">
              {/* Canvas Content */}
              <div className="canvas-content">
                <Canvas />
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;

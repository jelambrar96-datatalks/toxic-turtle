import React from 'react';

/**
 * Code Viewer Component
 * Displays the KTurtle code line by line
 * Highlights the current line being executed
 */
function CodeViewer({ code, cursor, currentIndex }) {
  // Handle different data types for code
  let lines = [];
  
  if (Array.isArray(code)) {
    // If code is already an array, use it as-is
    lines = code;
  } else if (typeof code === 'string') {
    // If code is a string, split by newlines
    lines = code.split('\n');
  } else if (code) {
    // If code is something else (object), convert to string first
    lines = String(code).split('\n');
  } else {
    // If code is null/undefined, show empty
    lines = [];
  }

  return (
    <div className="code-viewer">
      <h3>📝 Code</h3>
      <div className="code-content">
        {lines.map((line, index) => (
          <div
            key={index}
            className={`code-line ${index === currentIndex ? 'active' : ''}`}
            style={{ backgroundColor: index === currentIndex ? '#ffd93d' : 'transparent' }}
          >
            <span className="line-number">{index + 1}</span>
            <span className="line-content">{line || ' '}</span>
            {index === cursor && <span className="cursor-marker">▶</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

export default CodeViewer;

import React, { forwardRef, useEffect, useState } from 'react';

/**
 * Game Canvas Component
 * Renders the turtle graphics canvas with turtle sprite and lines
 * Displays the visual output of turtle movements
 */
const gridDistance = 50;

const GameCanvas = forwardRef(({ turtleState, lineData }, ref) => {
  const [turtleImage, setTurtleImage] = useState(null);

  // Load and parse the SVG icon once on mount
  useEffect(() => {
    const loadTurtleIcon = async () => {
      try {
        const response = await fetch('/icons/tortuga.svg');
        const svgText = await response.text();
        const img = new Image();
        img.onload = () => setTurtleImage(img);
        img.src = 'data:image/svg+xml;base64,' + btoa(svgText);
      } catch (error) {
        console.error('Error loading turtle icon:', error);
      }
    };
    loadTurtleIcon();
  }, []);

  useEffect(() => {
    if (!ref.current) return;

    const canvas = ref.current;
    const ctx = canvas.getContext('2d');

    // Clear canvas
    ctx.fillStyle = '#f0f8ff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid (optional visual aid)
    drawGrid(ctx, canvas.width, canvas.height);

    // Draw all lines
    drawLines(ctx);

    // Draw turtle
    drawTurtle(ctx, turtleState);
  }, [turtleState, lineData, turtleImage]);

  const drawGrid = (ctx, width, height) => {
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;

    // Vertical lines
    for (let i = 0; i <= width; i += gridDistance) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, height);
      ctx.stroke();
    }

    // Horizontal lines
    for (let i = 0; i <= height; i += gridDistance) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(width, i);
      ctx.stroke();
    }
  };

  const drawLines = (ctx) => {
    ctx.strokeStyle = '#3498db';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';

    lineData.forEach((line) => {
      ctx.beginPath();
      ctx.moveTo(line.startX, line.startY);
      ctx.lineTo(line.endX, line.endY);
      ctx.stroke();
    });
  };

  const drawTurtle = (ctx, state) => {
    const { x, y, direction } = state;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((direction * Math.PI) / 180);

    // Draw turtle icon if loaded
    if (turtleImage) {
      ctx.drawImage(turtleImage, -20, -20, 40, 40);
    } else {
      // Fallback: Draw simple turtle shape while loading
      ctx.fillStyle = '#2ecc71';
      ctx.beginPath();
      ctx.ellipse(0, 0, 15, 20, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#27ae60';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(0, 0, 12, 17, 0, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#16a085';
      ctx.beginPath();
      ctx.arc(0, -22, 8, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.arc(-4, -24, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(4, -24, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = 'black';
      ctx.beginPath();
      ctx.arc(-4, -24, 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(4, -24, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  };

  return (
    <div className="canvas-container">
      <canvas
        ref={ref}
        width={500}
        height={500}
        className="game-canvas"
      />
    </div>
  );
});

GameCanvas.displayName = 'GameCanvas';
GameCanvas.gridDistance = gridDistance;

export default GameCanvas;

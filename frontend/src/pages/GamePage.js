import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { gameAPI, playSound } from '../api';
import GameCanvas from '../components/GameCanvas';
import CodeViewer from '../components/CodeViewer';
import '../styles/GamePage.css';

/**
 * Game Page Component
 * Main gameplay view with code viewer and canvas
 * Handles keyboard input and game progression
 */
function GamePage() {
  const { level } = useParams();
  const levelNumber = parseInt(level, 10);
  const navigate = useNavigate();

  // Game state
  const [levelData, setLevelData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cursor, setCursor] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [turtleState, setTurtleState] = useState({
    x: 250,
    y: 250,
    direction: 0, // 0=up, 90=right, 180=down, 270=left
  });

  const canvasRef = useRef(null);
  const lineDataRef = useRef([]);

  // Load level data on component mount
  useEffect(() => {
    loadLevel();
  }, [levelNumber]);

  const loadLevel = async () => {
    try {
      setLoading(true);
      const data = await gameAPI.getLevelData(levelNumber);
      setLevelData(data);
      setCursor(0);
      setCompleted(false);
      setTurtleState({ x: 250, y: 250, direction: 0 });
      lineDataRef.current = [];
    } catch (err) {
      setError(err.message || 'Failed to load level');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (completed || !levelData) return;
      const movement = levelData.movements[cursor];
      let isCorrect = false;

      // Map keys to movements
      if (e.key === ' ') {
        e.preventDefault();
        if (movement === 'space') {
          isCorrect = true;
          handleForwardMovement();
        }
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (movement === 'left') {
          isCorrect = true;
          handleTurn(-90);
        }
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (movement === 'right') {
          isCorrect = true;
          handleTurn(90);
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (movement === 'down') {
          isCorrect = true;
          handleForwardMovement();
        }
      }

      // Provide feedback
      if (isCorrect) {
        playSound('success');
        updateCursor();
      } else if (e.key === ' ' || e.key.startsWith('Arrow')) {
        playSound('error');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [cursor, completed, levelData]);

  // Move turtle forward and draw line
  const handleForwardMovement = () => {
    setTurtleState((prev) => {
      const distance = GameCanvas.gridDistance; // pixels to move
      let newX = prev.x;
      let newY = prev.y;

      // Calculate new position based on direction
      if (prev.direction === 0) newY -= distance; // up
      else if (prev.direction === 90) newX += distance; // right
      else if (prev.direction === 180) newY += distance; // down
      else if (prev.direction === 270) newX -= distance; // left

      // Record line for drawing
      lineDataRef.current.push({
        startX: prev.x,
        startY: prev.y,
        endX: newX,
        endY: newY,
      });

      return { ...prev, x: newX, y: newY };
    });
  };

  // Rotate turtle
  const handleTurn = (degrees) => {
    setTurtleState((prev) => ({
      ...prev,
      direction: (prev.direction + degrees) % 360,
    }));
  };

  // Advance cursor to next movement
  const updateCursor = () => {
    setCursor((prev) => {
      const newCursor = prev + 1;

      // Check if level is completed
      if (newCursor >= levelData.movements.length) {
        completeLevel();
        return prev;
      }

      return newCursor;
    });
  };

  // Handle level completion
  const completeLevel = async () => {
    setCompleted(true);
    playSound('success');

    try {
      // Record level completion
      await gameAPI.passLevel(levelNumber);

      // Show success message and redirect after delay
      setTimeout(() => {
        navigate('/home');
      }, 2000);
    } catch (err) {
      console.error('Failed to save level completion:', err);
      // Still allow user to continue even if save fails
      setTimeout(() => {
        navigate('/home');
      }, 2000);
    }
  };

  const handleReturnHome = () => {
    navigate('/home');
  };

  if (loading) {
    return (
      <div className="game-page">
        <div className="loading">Loading level {levelNumber}...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="game-page">
        <div className="alert alert-error">{error}</div>
        <button className="btn-primary" onClick={handleReturnHome}>
          ← Return to Home
        </button>
      </div>
    );
  }

  return (
    <div className="game-page">
      {/* Header */}
      <div className="game-header">
        <h1>🐢 Level {levelNumber}</h1>
        <button className="btn-secondary btn-small" onClick={handleReturnHome}>
          ← Home
        </button>
      </div>

      {/* Success Message */}
      {completed && (
        <div className="success-message">
          ✨ Level Complete! Returning to home...
        </div>
      )}

      {/* Game Container */}
      <div className="game-container">
        {/* Left Panel - Code Viewer */}
        <div className="left-panel">
          <CodeViewer
            code={levelData.code}
            cursor={levelData.cursor[cursor]}
            currentIndex={cursor}
          />
        </div>

        {/* Right Panel - Canvas */}
        <div className="right-panel">
          <GameCanvas
            ref={canvasRef}
            turtleState={turtleState}
            lineData={lineDataRef.current}
          />
          <div className="controls-hint">
            <p><strong>Controls:</strong></p>
            <p>Space = Forward | ← → = Turn | ↓ = Forward</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GamePage;

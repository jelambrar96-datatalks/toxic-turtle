import React from 'react';

/**
 * Level Grid Component
 * Displays a 5x5 grid of level buttons
 * Shows locked/unlocked states and handles level selection
 */
function LevelGrid({ totalLevels, currentLevel, onLevelSelect }) {
  const renderLevelButtons = () => {
    const buttons = [];

    for (let i = 1; i <= totalLevels; i++) {
      const isUnlocked = currentLevel === null ? i === 1 : i <= currentLevel || i === currentLevel + 1;
      const isPassed = currentLevel === null ? false : i <= currentLevel;

      buttons.push(
        <button
          key={i}
          className={`level-btn ${isUnlocked ? 'unlocked' : 'locked'} ${isPassed ? 'passed' : ''}`}
          onClick={() => isUnlocked && onLevelSelect(i)}
          disabled={!isUnlocked}
          title={isUnlocked ? `Level ${i}` : 'Locked - Complete previous level first'}
        >
          <span className="level-number">{i}</span>
          {!isUnlocked && <span className="lock-icon">🔒</span>}
          {isPassed && <span className="check-icon">✓</span>}
        </button>
      );
    }

    return buttons;
  };

  return (
    <div className="level-grid">
      <h2>📚 Select a Level</h2>
      <div className="grid-container">
        {renderLevelButtons()}
      </div>
    </div>
  );
}

export default LevelGrid;

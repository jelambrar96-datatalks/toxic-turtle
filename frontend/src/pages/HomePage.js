import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { gameAPI, clearAuthToken } from '../api';
import LevelGrid from '../components/LevelGrid';
import '../styles/HomePage.css';

/**
 * Home Page Component
 * Shows the level selection grid and user progress
 * Displays trophy when all levels are completed
 */
function HomePage() {
  const [currentLevel, setCurrentLevel] = useState(null);
  const [totalLevels, setTotalLevels] = useState(0);
  const [allLevelsPassed, setAllLevelsPassed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadLevelProgress();
  }, []);

  const loadLevelProgress = async () => {
    try {
      setLoading(true);
      const levelData = await gameAPI.getCurrentLevel();
      setCurrentLevel(levelData.current_level);
      setTotalLevels(levelData.total_levels);

      const passedData = await gameAPI.checkPassAllLevel();
      setAllLevelsPassed(passedData.all_levels_passed);
      setError('');
    } catch (error) {
      console.error('Failed to load level progress:', error);
      setError('Failed to load your progress. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLevelSelect = (levelNumber) => {
    navigate(`/game/${levelNumber}`);
  };

  const handleTrophy = () => {
    navigate('/certificate');
  };

  const handleLogout = () => {
    clearAuthToken();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="home-page">
        <div className="loading">📚 Loading your progress...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="home-page">
        <div className="alert alert-error">{error}</div>
        <button className="btn-primary" onClick={loadLevelProgress}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="home-page">
      {/* Header */}
      <div className="home-header">
        <div>
          <h1>🐢 Toxic Turtle</h1>
        </div>
        <div className="progress-display">
          Current Level: {currentLevel || 1} / {totalLevels}
        </div>
        <div>
          {allLevelsPassed && (
            <button className="trophy-button" onClick={handleTrophy}>
              🏆 View Certificate
            </button>
          )}
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {/* Level Grid */}
      <LevelGrid
        totalLevels={totalLevels}
        currentLevel={currentLevel}
        onLevelSelect={handleLevelSelect}
      />
    </div>
  );
}

export default HomePage;

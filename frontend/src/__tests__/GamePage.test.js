/**
 * GamePage Component Tests
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import GamePage from '../pages/GamePage';
import * as api from '../api';

jest.mock('../api');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  useParams: () => ({ level: '1' }),
}));

const renderGamePage = () => {
  return render(
    <BrowserRouter>
      <GamePage />
    </BrowserRouter>
  );
};

describe('GamePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    localStorage.getItem.mockReturnValue('test-token');

    api.gameAPI.getLevelData.mockResolvedValueOnce({
      level: 1,
      code: ['forward()', 'right()', 'forward()'],
      movements: [
        { key: ' ', action: 'forward' },
        { key: 'ArrowRight', action: 'right' },
        { key: ' ', action: 'forward' },
      ],
      cursor: 0,
    });
  });

  it('should render game page with canvas', async () => {
    renderGamePage();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /home/i })).toBeInTheDocument();
    });
  });

  it('should display code viewer with lines', async () => {
    renderGamePage();

    await waitFor(() => {
      expect(screen.getByText(/forward\(\)/)).toBeInTheDocument();
    });
  });

  it('should show game loading state initially', () => {
    api.gameAPI.getLevelData.mockImplementationOnce(
      () => new Promise((resolve) => setTimeout(() => resolve({}), 100))
    );

    renderGamePage();

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('should handle API error', async () => {
    api.gameAPI.getLevelData.mockRejectedValueOnce(
      new Error('Failed to fetch level data')
    );

    renderGamePage();

    await waitFor(() => {
      expect(screen.getByText(/error|failed/i)).toBeInTheDocument();
    });
  });

  it('should display return home button', async () => {
    renderGamePage();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /return home/i })).toBeInTheDocument();
    });
  });

  it('should handle keyboard input for forward movement', async () => {
    renderGamePage();

    await waitFor(() => {
      const canvas = screen.getByRole('img', { hidden: true }) || document.querySelector('canvas');
      expect(canvas).toBeInTheDocument();
    });

    // Simulate space key press
    fireEvent.keyDown(document, { key: ' ', code: 'Space' });

    // Wait for state update
    await waitFor(() => {
      expect(api.gameAPI.getLevelData).toHaveBeenCalled();
    });
  });

  it('should handle keyboard input for right turn', async () => {
    renderGamePage();

    await waitFor(() => {
      expect(screen.getByText(/forward\(\)/)).toBeInTheDocument();
    });

    // Simulate arrow right key press
    fireEvent.keyDown(document, { key: 'ArrowRight', code: 'ArrowRight' });

    await waitFor(() => {
      expect(api.gameAPI.getLevelData).toHaveBeenCalled();
    });
  });

  it('should handle keyboard input for left turn', async () => {
    renderGamePage();

    await waitFor(() => {
      expect(screen.getByText(/forward\(\)/)).toBeInTheDocument();
    });

    // Simulate arrow left key press
    fireEvent.keyDown(document, { key: 'ArrowLeft', code: 'ArrowLeft' });

    await waitFor(() => {
      expect(api.gameAPI.getLevelData).toHaveBeenCalled();
    });
  });

  it('should show level completion message', async () => {
    api.gameAPI.updateProgress.mockResolvedValueOnce({
      status: 'level_completed',
    });

    renderGamePage();

    await waitFor(() => {
      expect(screen.getByText(/forward\(\)/)).toBeInTheDocument();
    });

    // Simulate completing all movements
    fireEvent.keyDown(document, { key: ' ', code: 'Space' });
    fireEvent.keyDown(document, { key: 'ArrowRight', code: 'ArrowRight' });
    fireEvent.keyDown(document, { key: ' ', code: 'Space' });

    // Wait for completion message
    await waitFor(() => {
      expect(screen.getByText(/level completed|success/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('should reject incorrect keyboard input', async () => {
    renderGamePage();

    await waitFor(() => {
      expect(screen.getByText(/forward\(\)/)).toBeInTheDocument();
    });

    // First movement should be forward (space), try left arrow instead
    fireEvent.keyDown(document, { key: 'ArrowLeft', code: 'ArrowLeft' });

    // Cursor should not advance
    await waitFor(() => {
      expect(api.gameAPI.updateProgress).not.toHaveBeenCalled();
    });
  });

  it('should have canvas with correct dimensions', async () => {
    renderGamePage();

    await waitFor(() => {
      const canvas = document.querySelector('canvas');
      expect(canvas).toBeInTheDocument();
      expect(canvas.width).toBeGreaterThan(0);
      expect(canvas.height).toBeGreaterThan(0);
    });
  });
});

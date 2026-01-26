/**
 * HomePage Component Tests
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import * as api from '../api';

jest.mock('../api');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

const renderHomePage = () => {
  return render(
    <BrowserRouter>
      <HomePage />
    </BrowserRouter>
  );
};

describe('HomePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    localStorage.getItem.mockReturnValue('test-token');
  });

  it('should render home page title', async () => {
    api.gameAPI.getCurrentLevel.mockResolvedValueOnce({
      current_level: 1,
      total_levels: 4,
    });
    api.gameAPI.checkPassAllLevel.mockResolvedValueOnce({
      all_levels_passed: false,
    });

    renderHomePage();

    await waitFor(() => {
      expect(screen.getByText(/🐢 Toxic Turtle/i)).toBeInTheDocument();
    });
  });

  it('should display current level information', async () => {
    api.gameAPI.getCurrentLevel.mockResolvedValueOnce({
      current_level: 2,
      total_levels: 4,
    });
    api.gameAPI.checkPassAllLevel.mockResolvedValueOnce({
      all_levels_passed: false,
    });

    renderHomePage();

    await waitFor(() => {
      expect(screen.getByText(/Current Level: 2 \/ 4/i)).toBeInTheDocument();
    });
  });

  it('should show logout button', async () => {
    api.gameAPI.getCurrentLevel.mockResolvedValueOnce({
      current_level: 1,
      total_levels: 4,
    });
    api.gameAPI.checkPassAllLevel.mockResolvedValueOnce({
      all_levels_passed: false,
    });

    renderHomePage();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
    })

  });

  it('should display level grid', async () => {
    api.gameAPI.getCurrentLevel.mockResolvedValueOnce({
      current_level: 1,
      total_levels: 4,
    });
    api.gameAPI.checkPassAllLevel.mockResolvedValueOnce({
      all_levels_passed: false,
    });

    renderHomePage();

    await waitFor(() => {
      // Level grid should have at least 4 level buttons
      expect(screen.getAllByRole('button').length).toBeGreaterThanOrEqual(4);
    });
  });

  it('should show trophy button when all levels passed', async () => {
    api.gameAPI.getCurrentLevel.mockResolvedValueOnce({
      current_level: 4,
      total_levels: 4,
    });
    api.gameAPI.checkPassAllLevel.mockResolvedValueOnce({
      all_levels_passed: true,
    });

    renderHomePage();

    await waitFor(() => {
      expect(screen.getByText(/🏆/)).toBeInTheDocument();
    });
  });

  it('should not show trophy button when levels not complete', async () => {
    api.gameAPI.getCurrentLevel.mockResolvedValueOnce({
      current_level: 2,
      total_levels: 4,
    });
    api.gameAPI.checkPassAllLevel.mockResolvedValueOnce({
      all_levels_passed: false,
    });

    renderHomePage();

    await waitFor(() => {
      const trophyButton = screen.queryByText(/🏆 Certificate/i);
      expect(trophyButton).not.toBeInTheDocument();
    });
  });

  it('should show loading message initially', () => {
    api.gameAPI.getCurrentLevel.mockImplementationOnce(
      () => new Promise((resolve) => setTimeout(() => resolve({}), 100))
    );

    renderHomePage();

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('should show error message on API failure', async () => {
    api.gameAPI.getCurrentLevel.mockRejectedValueOnce(
      new Error('Failed to fetch level')
    );

    renderHomePage();

    await waitFor(() => {
      expect(screen.getByText(/error|failed/i)).toBeInTheDocument();
    });
  });

  it('should show retry button on error', async () => {
    api.gameAPI.getCurrentLevel.mockRejectedValueOnce(
      new Error('Failed to fetch level')
    );

    renderHomePage();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /try again|retry/i })).toBeInTheDocument();
    });
  });

  it('should handle logout click', async () => {
    const user = userEvent.setup();

    api.gameAPI.getCurrentLevel.mockResolvedValueOnce({
      current_level: 1,
      total_levels: 4,
    });
    api.gameAPI.checkPassAllLevel.mockResolvedValueOnce({
      all_levels_passed: false,
    });

    renderHomePage();

    await waitFor(() => {
      const logoutButton = screen.getByRole('button', { name: /logout/i });
      user.click(logoutButton);
    })

    await waitFor(() => {
      expect(api.clearAuthToken).toHaveBeenCalled();
    });

  });

  it('should unlock first level by default', async () => {
    api.gameAPI.getCurrentLevel.mockResolvedValueOnce({
      current_level: 1,
      total_levels: 4,
    });
    api.gameAPI.checkPassAllLevel.mockResolvedValueOnce({
      all_levels_passed: false,
    });

    renderHomePage();

    await waitFor(() => {
      const levelButtons = screen.getAllByRole('button');
      // First level should be clickable (not disabled)
      expect(levelButtons[0]).not.toBeDisabled();
    });
  });
});

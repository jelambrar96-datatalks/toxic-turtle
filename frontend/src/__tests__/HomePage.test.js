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

const renderHomePage = () =>
  render(
    <BrowserRouter>
      <HomePage />
    </BrowserRouter>
  );

/**
 * Helper to mock the happy-path API calls
 */
const mockGameState = ({
  current_level = 1,
  total_levels = 4,
  all_levels_passed = false,
} = {}) => {
  api.gameAPI.getCurrentLevel.mockResolvedValueOnce({
    current_level,
    total_levels,
  });

  api.gameAPI.checkPassAllLevel.mockResolvedValueOnce({
    all_levels_passed,
  });
};

describe('HomePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    localStorage.getItem.mockReturnValue('test-token');
  });

  it('should render home page title', async () => {
    mockGameState();

    renderHomePage();

    expect(
      await screen.findByText(/🐢 Toxic Turtle/i)
    ).toBeInTheDocument();
  });

  it('should display current level information', async () => {
    mockGameState({ current_level: 2 });

    renderHomePage();

    expect(
      await screen.findByText(/Current Level: 2 \/ 4/i)
    ).toBeInTheDocument();
  });

  it('should show logout button', async () => {
    mockGameState();

    renderHomePage();

    expect(
      await screen.findByRole('button', { name: /logout/i })
    ).toBeInTheDocument();
  });

  it('should display level grid', async () => {
    mockGameState();

    renderHomePage();

    await waitFor(() => {
      expect(screen.getAllByRole('button').length).toBeGreaterThanOrEqual(4);
    });
  });

  it('should show trophy button when all levels passed', async () => {
    mockGameState({ current_level: 4, all_levels_passed: true });

    renderHomePage();

    expect(await screen.findByText(/🏆/)).toBeInTheDocument();
  });

  it('should not show trophy button when levels not complete', async () => {
    mockGameState({ current_level: 2 });

    renderHomePage();

    await waitFor(() => {
      expect(screen.queryByText(/🏆 Certificate/i)).not.toBeInTheDocument();
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
    jest.spyOn(console, 'error').mockImplementation(() => {});

    api.gameAPI.getCurrentLevel.mockRejectedValueOnce(
      new Error('Failed to fetch level')
    );
    api.gameAPI.checkPassAllLevel.mockResolvedValueOnce({
      all_levels_passed: false,
    });

    renderHomePage();

    expect(
      await screen.findByText(/error|failed/i)
    ).toBeInTheDocument();

    console.error.mockRestore();
  });

  it('should show retry button on error', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});

    api.gameAPI.getCurrentLevel.mockRejectedValueOnce(
      new Error('Failed to fetch level')
    );
    api.gameAPI.checkPassAllLevel.mockResolvedValueOnce({
      all_levels_passed: false,
    });

    renderHomePage();

    expect(
      await screen.findByRole('button', { name: /try again|retry/i })
    ).toBeInTheDocument();

    console.error.mockRestore();
  });

  it('should handle logout click', async () => {
    const user = userEvent.setup();
    mockGameState();

    renderHomePage();

    const logoutButton = await screen.findByRole('button', {
      name: /logout/i,
    });

    await user.click(logoutButton);

    expect(api.clearAuthToken).toHaveBeenCalled();
  });

  it('should unlock first level by default', async () => {
    mockGameState();

    renderHomePage();

    const levelButtons = await screen.findAllByRole('button');
    expect(levelButtons[0]).not.toBeDisabled();
  });
});

/**
 * GamePage Component Tests
 */

import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import GamePage from '../pages/GamePage';
import * as api from '../api';

// --------------------
// GLOBAL MOCKS
// --------------------

// Mock canvas context (JSDOM has no real canvas)
beforeAll(() => {
  HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    lineCap: '',
    beginPath: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    stroke: jest.fn(),
    fill: jest.fn(),
    fillRect: jest.fn(),
    clearRect: jest.fn(),
    save: jest.fn(),
    restore: jest.fn(),
    translate: jest.fn(),
    rotate: jest.fn(),
    drawImage: jest.fn(),
    arc: jest.fn(),
    ellipse: jest.fn(),
  }));

  // Mock fetch for SVG image loading
  global.fetch = jest.fn(() =>
    Promise.resolve({
      text: () => Promise.resolve('<svg></svg>'),
    })
  );
});

// --------------------
// MODULE MOCKS
// --------------------

jest.mock('../api');

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ levelId: '1' }),
  useNavigate: () => jest.fn(),
}));

// --------------------
// TEST UTIL
// --------------------

const renderGamePage = () => {
  return render(
    <BrowserRouter>
      <GamePage />
    </BrowserRouter>
  );
};

// --------------------
// TESTS
// --------------------

describe('GamePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render loading state initially', () => {
    api.gameAPI.getLevelData.mockImplementationOnce(
      () => new Promise(() => {})
    );

    renderGamePage();

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('should render game canvas when level loads', async () => {
    api.gameAPI.getLevelData.mockResolvedValueOnce({
      level_number: 2,
      code: ['forward 10', 'forward 20', 'forward 10'],
      movements: ['space', 'space', 'space', 'space'],
      cursor: [0, 1, 1, 2],
      can_play: true
    });

    renderGamePage();

    await waitFor(() => {
      expect(screen.getByTestId('game-canvas')).toBeInTheDocument();
    });
  });

  it('should render level title', async () => {
    api.gameAPI.getLevelData.mockResolvedValueOnce({
      level_number: 2,
      code: ['forward 10', 'forward 20', 'forward 10'],
      movements: ['space', 'space', 'space', 'space'],
      cursor: [0, 1, 1, 2],
      can_play: true
    });

    renderGamePage();

    await waitFor(() => {
      expect(screen.getByText(/Level/i)).toBeInTheDocument();
    });
  });

  it('should show error message on API failure', async () => {
    api.gameAPI.getLevelData.mockRejectedValueOnce(
      new Error('Failed to load level')
    );

    renderGamePage();

    await waitFor(() => {
      expect(
        screen.getByText(/error|failed/i)
      ).toBeInTheDocument();
    });
  });

});

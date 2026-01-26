/**
 * Test utilities and helpers for Toxic Turtle Frontend Tests
 */

import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

/**
 * Custom render function that wraps components with Router
 * @param {ReactElement} component - The component to render
 * @param {Object} options - Additional render options
 * @returns {RenderResult} - Render result from @testing-library/react
 */
export const renderWithRouter = (component, options = {}) => {
  return render(<BrowserRouter>{component}</BrowserRouter>, options);
};

/**
 * Mock API response helper
 * @param {Object} data - Response data
 * @param {number} status - HTTP status code
 * @returns {Promise} - Mock response promise
 */
export const mockFetch = (data, status = 200) => {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
    clone: () => ({ json: () => Promise.resolve(data) }),
  });
};

/**
 * Setup localStorage with test data
 * @param {string} key - localStorage key
 * @param {*} value - Value to store
 */
export const setLocalStorage = (key, value) => {
  const mockData = {};
  localStorage.getItem.mockImplementation((k) => mockData[k]);
  localStorage.setItem.mockImplementation((k, v) => {
    mockData[k] = v;
  });
  localStorage.removeItem.mockImplementation((k) => {
    delete mockData[k];
  });
  localStorage.clear.mockImplementation(() => {
    Object.keys(mockData).forEach((k) => delete mockData[k]);
  });

  mockData[key] = value;
};

/**
 * Get localStorage value
 * @param {string} key - localStorage key
 * @returns {*} - Stored value
 */
export const getLocalStorage = (key) => {
  const call = localStorage.getItem.mock.calls.find((c) => c[0] === key);
  return call ? call[1] : undefined;
};

/**
 * Create mock user object
 * @param {Object} overrides - Properties to override
 * @returns {Object} - Mock user object
 */
export const createMockUser = (overrides = {}) => {
  return {
    id: '123e4567-e89b-12d3-a456-426614174000',
    username: 'testuser',
    email: 'test@example.com',
    is_active: true,
    is_verified: true,
    created_at: '2024-01-01T00:00:00Z',
    ...overrides,
  };
};

/**
 * Create mock game level
 * @param {number} level - Level number
 * @param {Object} overrides - Properties to override
 * @returns {Object} - Mock level object
 */
export const createMockLevel = (level = 1, overrides = {}) => {
  return {
    level,
    code: ['forward()', 'right()', 'forward()'],
    movements: [
      { key: ' ', action: 'forward' },
      { key: 'ArrowRight', action: 'right' },
      { key: ' ', action: 'forward' },
    ],
    cursor: 0,
    description: `Level ${level} - Learn movement`,
    ...overrides,
  };
};

/**
 * Create mock game progress
 * @param {Object} overrides - Properties to override
 * @returns {Object} - Mock progress object
 */
export const createMockProgress = (overrides = {}) => {
  return {
    current_level: 1,
    total_levels: 4,
    all_levels_passed: false,
    passed_levels: [1],
    ...overrides,
  };
};

/**
 * Wait for async operations in tests
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise} - Promise that resolves after delay
 */
export const waitFor = (ms = 0) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Create mock canvas context
 * @returns {Object} - Mock canvas context
 */
export const createMockCanvasContext = () => {
  return {
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    fillRect: jest.fn(),
    clearRect: jest.fn(),
    getImageData: jest.fn(() => ({ data: new Array(4) })),
    putImageData: jest.fn(),
    createImageData: jest.fn(() => []),
    setTransform: jest.fn(),
    drawImage: jest.fn(),
    save: jest.fn(),
    fillText: jest.fn(),
    restore: jest.fn(),
    beginPath: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    closePath: jest.fn(),
    stroke: jest.fn(),
    translate: jest.fn(),
    scale: jest.fn(),
    rotate: jest.fn(),
    arc: jest.fn(),
    fill: jest.fn(),
    measureText: jest.fn(() => ({ width: 0 })),
    transform: jest.fn(),
    rect: jest.fn(),
    clip: jest.fn(),
  };
};

/**
 * Mock API module
 * @returns {Object} - Mock API object
 */
export const createMockAPI = () => {
  return {
    authAPI: {
      register: jest.fn(),
      login: jest.fn(),
      logout: jest.fn(),
    },
    gameAPI: {
      getCurrentLevel: jest.fn(),
      getLevelData: jest.fn(),
      updateProgress: jest.fn(),
      checkPassAllLevel: jest.fn(),
    },
    certificateAPI: {
      checkIfCertificateExist: jest.fn(),
      getCertificateData: jest.fn(),
      registerCertificate: jest.fn(),
    },
    getAuthToken: jest.fn(),
    setAuthToken: jest.fn(),
    clearAuthToken: jest.fn(),
  };
};

export default {
  renderWithRouter,
  mockFetch,
  setLocalStorage,
  getLocalStorage,
  createMockUser,
  createMockLevel,
  createMockProgress,
  waitFor,
  createMockCanvasContext,
  createMockAPI,
};

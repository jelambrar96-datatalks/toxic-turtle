/**
 * Jest Setup File for Toxic Turtle Frontend Tests
 * 
 * This file runs before all tests and configures:
 * - Test library matchers
 * - Global test utilities
 * - Mock localStorage
 * - Mock fetch API
 * - Mock HTMLCanvasElement
 */

// Import testing library matchers
import '@testing-library/jest-dom';

// Store mock data
const localStorageData = {};

// Mock localStorage with working Jest mocks
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: jest.fn((key) => localStorageData[key] || null),
    setItem: jest.fn((key, value) => {
      localStorageData[key] = value.toString();
    }),
    removeItem: jest.fn((key) => {
      delete localStorageData[key];
    }),
    clear: jest.fn(() => {
      Object.keys(localStorageData).forEach(key => delete localStorageData[key]);
    }),
  },
  writable: true,
});

// Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
  Object.keys(localStorageData).forEach(key => delete localStorageData[key]);
});

// Mock HTMLCanvasElement
HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
  fillStyle: '',
  fillRect: jest.fn(),
  clearRect: jest.fn(),
  getImageData: jest.fn(() => ({
    data: new Array(4),
  })),
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
}));

HTMLCanvasElement.prototype.toDataURL = jest.fn(() => 'data:image/png;base64,mock');

// Mock Web Audio API
global.AudioContext = jest.fn(() => ({
  createOscillator: jest.fn(() => ({
    connect: jest.fn(),
    start: jest.fn(),
    stop: jest.fn(),
    frequency: { setValueAtTime: jest.fn() },
  })),
  createGain: jest.fn(() => ({
    connect: jest.fn(),
    gain: { setValueAtTime: jest.fn() },
  })),
  destination: {},
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock window.scrollTo
window.scrollTo = jest.fn();

// Suppress console errors in tests (optional)
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning: ReactDOM.render') ||
        args[0].includes('Not implemented: HTMLFormElement.prototype.submit'))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

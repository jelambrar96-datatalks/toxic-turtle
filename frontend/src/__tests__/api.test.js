/**
 * API Module Tests
 * Tests for api.js - authentication, game, and certificate API calls
 */

import * as api from '../api';

describe('API Module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    global.fetch = jest.fn();
  });

  // ============ Auth API Tests ============

  describe('authAPI.register', () => {
    it('should successfully register a new user', async () => {
      const mockResponse = {
        id: 'user-123',
        username: 'testuser',
        email: 'test@example.com',
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await api.authAPI.register('testuser', 'test@example.com', 'password123');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/register'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw error on registration failure', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ detail: 'Email already registered' }),
      });

      await expect(
        api.authAPI.register('testuser', 'test@example.com', 'password123')
      ).rejects.toThrow('Email already registered');
    });
  });

  describe('authAPI.login', () => {
    it('should successfully login user', async () => {
      const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
      const mockResponse = { access_token: mockToken, token_type: 'bearer' };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await api.authAPI.login('test@example.com', 'password123');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/jwt/login'),
        expect.objectContaining({
          method: 'POST',
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw error on invalid credentials', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ detail: 'Invalid credentials' }),
      });

      await expect(
        api.authAPI.login('test@example.com', 'wrongpassword')
      ).rejects.toThrow('Invalid credentials');
    });
  });

  // ============ Auth Token Tests ============

  describe('Token Management', () => {
    it('should set auth token', () => {
      api.setAuthToken('test-token-123');
      expect(localStorage.setItem).toHaveBeenCalledWith('token', 'test-token-123');
    });

    it('should get auth token', () => {
      localStorage.getItem.mockReturnValueOnce('test-token-123');
      const token = api.getAuthToken();
      expect(token).toBe('test-token-123');
    });

    it('should clear auth token', () => {
      api.clearAuthToken();
      expect(localStorage.removeItem).toHaveBeenCalledWith('token');
    });
  });

  // ============ Game API Tests ============

  describe('gameAPI.getCurrentLevel', () => {
    it('should fetch current level', async () => {
      const mockResponse = {
        current_level: 1,
        total_levels: 4,
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      localStorage.getItem.mockReturnValueOnce('test-token');

      const result = await api.gameAPI.getCurrentLevel();

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/game/current_level'),
        expect.any(Object)
      );
    });

    it('should handle missing authentication token', async () => {
      localStorage.getItem.mockReturnValueOnce(null);

      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ detail: 'Not authenticated' }),
      });

      await expect(api.gameAPI.getCurrentLevel()).rejects.toThrow();
    });
  });

  describe('gameAPI.getLevelData', () => {
    it('should fetch level data', async () => {
      const mockResponse = {
        level: 1,
        code: ['forward()', 'right()', 'forward()'],
        movements: [
          { key: ' ', action: 'forward' },
          { key: 'ArrowRight', action: 'right' },
        ],
        cursor: 0,
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      localStorage.getItem.mockReturnValueOnce('test-token');

      const result = await api.gameAPI.getLevelData(1);

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/game/get_level_data'),
        expect.any(Object)
      );
    });
  });

  describe('gameAPI.updateProgress', () => {
    it('should update game progress', async () => {
      const mockResponse = { status: 'success' };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      localStorage.getItem.mockReturnValueOnce('test-token');

      const result = await api.gameAPI.updateProgress(1, true);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/game/pass_level'),
        expect.objectContaining({
          method: 'POST',
        })
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('gameAPI.checkPassAllLevel', () => {
    it('should check if all levels are passed', async () => {
      const mockResponse = { all_levels_passed: true };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      localStorage.getItem.mockReturnValueOnce('test-token');

      const result = await api.gameAPI.checkPassAllLevel();

      expect(result).toEqual(mockResponse);
    });
  });

  // ============ Certificate API Tests ============

  describe('certificateAPI', () => {
    it('should check if certificate exists', async () => {
      const mockResponse = { exists: true };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      localStorage.getItem.mockReturnValueOnce('test-token');

      const result = await api.certificateAPI.checkIfCertificateExist();

      expect(result).toEqual(mockResponse);
    });

    it('should register new certificate', async () => {
      const mockResponse = { status: 'success' };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      localStorage.getItem.mockReturnValueOnce('test-token');

      const result = await api.certificateAPI.registerCertificate('John Doe');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/game/register_certificate'),
        expect.objectContaining({
          method: 'POST',
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should get certificate data', async () => {
      const mockResponse = {
        full_name: 'John Doe',
        issued_at: '2024-01-15T10:30:00Z',
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      localStorage.getItem.mockReturnValueOnce('test-token');

      const result = await api.certificateAPI.getCertificateData();

      expect(result).toEqual(mockResponse);
    });
  });
});

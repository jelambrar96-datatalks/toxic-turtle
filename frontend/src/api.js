// API configuration and helper functions
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Helper to get auth token from localStorage
export const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Helper to set auth token in localStorage
export const setAuthToken = (token) => {
  localStorage.setItem('token', token);
};

// Helper to clear auth token
export const clearAuthToken = () => {
  localStorage.removeItem('token');
};

// API calls for authentication
export const authAPI = {
  register: async (username, email, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    });
    if (!response.ok) throw new Error('Registration failed');
    return response.json();
  },

  login: async (email, password) => {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    const response = await fetch(`${API_BASE_URL}/auth/jwt/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData,
    });
    if (!response.ok) throw new Error('Login failed');
    return response.json();
  },

  logout: async () => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/auth/jwt/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    clearAuthToken();
    return response.ok;
  },

  getCurrentUser: async () => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to get current user');
    return response.json();
  },
};

// API calls for game
export const gameAPI = {
  getCurrentLevel: async () => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/game/current_level`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to get current level');
    return response.json();
  },

  getLevelData: async (level) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/game/get_level_data?level=${level}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to get level data');
    return response.json();
  },

  passLevel: async (level) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/game/pass_level`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ level }),
    });
    if (!response.ok) throw new Error('Failed to pass level');
    return response.json();
  },

  checkPassAllLevel: async () => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/game/check_pass_all_level`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to check all levels');
    return response.json();
  },

  registerCertificate: async (certificateName) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/game/register_certificate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ certificate_name: certificateName }),
    });
    if (!response.ok) throw new Error('Failed to register certificate');
    return response.json();
  },

  checkIfCertificateExists: async (certificateName) => {
    const token = getAuthToken();
    const response = await fetch(
      `${API_BASE_URL}/game/check_if_certified_exist?certificate_name=${encodeURIComponent(certificateName)}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    if (!response.ok) throw new Error('Failed to check certificate');
    return response.json();
  },

  getCertifiedData: async () => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/game/get_certified_data`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to get certificates');
    return response.json();
  },
};

// Sound utilities
export const playSound = (type = 'success') => {
  // Create a simple beep using Web Audio API
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  if (type === 'success') {
    oscillator.frequency.value = 800;
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
  } else if (type === 'error') {
    oscillator.frequency.value = 300;
    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  }
};

/**
 * LoginPage Component Tests
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import * as api from '../api';

jest.mock('../api');

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const renderLoginPage = (props = {}) => {
  const defaultProps = {
    setIsAuthenticated: jest.fn(),
    ...props,
  };
  
  return render(
    <BrowserRouter>
      <LoginPage {...defaultProps} />
    </BrowserRouter>
  );
};

describe('LoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockClear();
    localStorage.clear();
  });

  it('should render login form', () => {
    renderLoginPage();

    // expect(screen.getByText(/login/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /^login$/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/your@email.com/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/••••••••/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('should show register link', () => {
    renderLoginPage();

    const registerLink = screen.getByText(/Register here/i);
    expect(registerLink).toBeInTheDocument();
    expect(registerLink.closest('a')).toHaveAttribute('href', '/register');
  });

  it('should disable submit button when fields are empty', () => {
    renderLoginPage();

    const submitButton = screen.getByRole('button', { name: /login/i });
    expect(submitButton).toBeDisabled();
  });

  it('should enable submit button when both fields are filled', async () => {
    const user = userEvent.setup();
    renderLoginPage();

    const emailInput = screen.getByPlaceholderText(/email/i);
    const passwordInput = screen.getByPlaceholderText(/••••••••/i);
    const submitButton = screen.getByRole('button', { name: /login/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');

    expect(submitButton).not.toBeDisabled();
  });

  it('should successfully login with valid credentials', async () => {
    const user = userEvent.setup();
    const mockToken = 'test-token-123';
    const mockSetIsAuthenticated = jest.fn();

    api.authAPI.login.mockResolvedValueOnce({
      access_token: mockToken,
      token_type: 'bearer',
    });

    renderLoginPage({ setIsAuthenticated: mockSetIsAuthenticated });

    const emailInput = screen.getByPlaceholderText(/email/i);
    const passwordInput = screen.getByPlaceholderText(/••••••••/i);
    const submitButton = screen.getByRole('button', { name: /login/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(api.authAPI.login).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(api.setAuthToken).toHaveBeenCalledWith(mockToken);
      expect(mockSetIsAuthenticated).toHaveBeenCalledWith(true);
      expect(mockNavigate).toHaveBeenCalledWith('/home');
    });
  });

  it('should show error message on login failure', async () => {
    const user = userEvent.setup();

    api.authAPI.login.mockRejectedValueOnce(new Error('Invalid credentials'));

    renderLoginPage();

    const emailInput = screen.getByPlaceholderText(/email/i);
    const passwordInput = screen.getByPlaceholderText(/••••••••/i);
    const submitButton = screen.getByRole('button', { name: /login/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'wrongpassword');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });

  it('should clear error message when user modifies email', async () => {
    const user = userEvent.setup();

    api.authAPI.login.mockRejectedValueOnce(new Error('Invalid credentials'));

    renderLoginPage();

    const emailInput = screen.getByPlaceholderText(/email/i);
    const passwordInput = screen.getByPlaceholderText(/••••••••/i);
    const submitButton = screen.getByRole('button', { name: /login/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'wrongpassword');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });

    await user.clear(emailInput);
    await user.type(emailInput, 'new@example.com');

    expect(screen.queryByText(/Login failed/i)).not.toBeInTheDocument();
  });

  it('should display loading state while submitting', async () => {
    const user = userEvent.setup();

    api.authAPI.login.mockImplementationOnce(
      () => new Promise((resolve) => setTimeout(() => resolve({ access_token: 'token' }), 100))
    );

    renderLoginPage();

    const emailInput = screen.getByPlaceholderText(/email/i);
    const passwordInput = screen.getByPlaceholderText(/••••••••/i);
    const submitButton = screen.getByRole('button', { name: /login/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    expect(submitButton).toBeDisabled();

    await waitFor(() => {
      expect(api.authAPI.login).toHaveBeenCalled();
    });
  });
});

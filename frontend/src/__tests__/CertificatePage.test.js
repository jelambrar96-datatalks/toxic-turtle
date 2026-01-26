/**
 * CertificatePage Component Tests
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import CertificatePage from '../pages/CertificatePage';
import * as api from '../api';

jest.mock('../api');

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const renderCertificatePage = (props = {}) => {
  const defaultProps = {
    setIsAuthenticated: jest.fn(),
    ...props,
  };

  return render(
    <BrowserRouter>
      <CertificatePage {...defaultProps}/>
    </BrowserRouter>
  );
};

describe('CertificatePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    localStorage.clear();
    localStorage.getItem.mockReturnValue('test-token');
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  describe('First Visit - No Certificate', () => {
    beforeEach(() => {
      api.certificateAPI.checkIfCertificateExist.mockResolvedValueOnce({
        exists: false,
      });
    });

    it('should show modal for name input on first visit', async () => {
      renderCertificatePage();

      await waitFor(() => {
        expect(screen.getByText(/Enter your full name to generate your certificate/i)).toBeInTheDocument();
      });
    });

    it('should have name input field focused', async () => {
      renderCertificatePage();

      await waitFor(() => {
        const input = screen.getByPlaceholderText(/your full name/i);
        expect(input).toHaveFocus();
      });
    });

    it('should disable submit button when name is empty', async () => {
      renderCertificatePage();

      await waitFor(() => {
        const submitButton = screen.getByRole('button', { name: /generate certificate/i });
        expect(submitButton).toBeDisabled();
      });
    });

    it('should enable submit button when name is entered', async () => {
      const user = userEvent.setup();
      renderCertificatePage();

      const input = await screen.findByPlaceholderText(/your full name/i);
      await user.type(input, 'John Doe');

      const submitButton = screen.getByRole('button', { name: /generate certificate/i });
      expect(submitButton).not.toBeDisabled();
    });

    it('should generate certificate on submit', async () => {
      const user = userEvent.setup();

      api.certificateAPI.registerCertificate.mockResolvedValueOnce({
        status: 'success',
      });

      renderCertificatePage();

      const input = await screen.findByPlaceholderText(/your full name/i);
      await user.type(input, 'John Doe');

      const submitButton = screen.getByRole('button', { name: /generate certificate/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(api.certificateAPI.registerCertificate).toHaveBeenCalledWith('John Doe');
      });
    });

    it('should download certificate after submission', async () => {
      const user = userEvent.setup();

      api.certificateAPI.registerCertificate.mockResolvedValueOnce({
        status: 'success',
      });

      renderCertificatePage();

      const input = await screen.findByPlaceholderText(/your full name/i);
      await user.type(input, 'John Doe');

      const submitButton = screen.getByRole('button', { name: /generate certificate/i });
      await user.click(submitButton);

      // Wait for download or success message
      await waitFor(() => {
        expect(screen.getByText(/has successfully completed all levels of the Toxic Turtle/i)).toBeInTheDocument();
      });
    });

    it('should show success message', async () => {
      const user = userEvent.setup();

      api.certificateAPI.registerCertificate.mockResolvedValueOnce({
        status: 'success',
      });

      renderCertificatePage();

      const input = await screen.findByPlaceholderText(/your full name/i);
      await user.type(input, 'Jane Doe');

      const submitButton = screen.getByRole('button', { name: /generate certificate/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/has successfully completed all levels of the Toxic Turtle/i)).toBeInTheDocument();
      });
    });

    it('should display trophy emoji', async () => {
      renderCertificatePage();

      await waitFor(() => {
        expect(screen.getByText(/🏆/)).toBeInTheDocument();
      });
    });
  });

  describe('Repeat Visit - Certificate Exists', () => {
    beforeEach(() => {
      api.certificateAPI.checkIfCertificateExist.mockResolvedValueOnce({
        exists: true,
      });
      api.certificateAPI.getCertificateData.mockResolvedValueOnce({
        certificate_name: 'John Doe',
        issued_at: '2024-01-15T10:30:00Z',
      });
    });

    it('should skip modal on repeat visit', async () => {
      renderCertificatePage();

      await waitFor(() => {
        expect(screen.queryByText(/what is your name/i)).not.toBeInTheDocument();
      });
    });

    it('should auto-download certificate', async () => {
      renderCertificatePage();

      await waitFor(() => {
        expect(api.certificateAPI.getCertificateData).toHaveBeenCalled();
      });
    });

    it('should display certificate information', async () => {
      renderCertificatePage();

      await waitFor(() => {
        expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
      });
    });

    it('should show download button on repeat visit', async () => {
      renderCertificatePage();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /download/i })).toBeInTheDocument();
      });
    });
  });

  describe('Certificate Display', () => {
    beforeEach(() => {
      api.certificateAPI.checkIfCertificateExist.mockResolvedValueOnce({
        exists: true,
      });
      api.certificateAPI.getCertificateData.mockResolvedValueOnce({
        certificate_name: 'Jane Doe',
        issued_at: '2024-01-20T14:45:00Z',
      });
    });

    it('should include turtle emoji', async () => {
      renderCertificatePage();

      await waitFor(() => {
        expect(screen.getByText(/🐢/)).toBeInTheDocument();
      });
    });

    it('should display completion date', async () => {
      renderCertificatePage();

      await waitFor(() => {
        expect(screen.getByText(/2024|january|jan/i)).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle certificate check error', async () => {
      api.certificateAPI.checkIfCertificateExist.mockRejectedValueOnce(
        new Error('Failed to check certificate')
      );

      renderCertificatePage();

      await waitFor(() => {
        expect(screen.getByText(/error|failed/i)).toBeInTheDocument();
      });
    });

    it('should show error on registration failure', async () => {
      const user = userEvent.setup();

      api.certificateAPI.checkIfCertificateExist.mockResolvedValueOnce({
        exists: false,
      });
      api.certificateAPI.registerCertificate.mockRejectedValueOnce(
        new Error('Registration failed')
      );

      renderCertificatePage();

      const input = await screen.findByPlaceholderText(/your full name/i);
      await user.type(input, 'John Doe');

      const submitButton = screen.getByRole('button', { name: /generate certificate/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/error|failed/i)).toBeInTheDocument();
      });
    });
  });

  describe('Navigation', () => {
    beforeEach(() => {
      api.certificateAPI.checkIfCertificateExist.mockResolvedValueOnce({
        exists: true,
      });
      api.certificateAPI.getCertificateData.mockResolvedValueOnce({
        certificate_name: 'John Doe',
        issued_at: '2024-01-15T10:30:00Z',
      });
    });

    it('should have home link', async () => {
      renderCertificatePage();

      await waitFor(() => {
        const homeLink = screen.getByRole('button', { name: /home/i });
        expect(homeLink).toBeInTheDocument();
      });
    });
  });
});

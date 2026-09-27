import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { Login } from '../Login';
import * as apiClientModule from '../../../lib/apiClient';

describe('Login Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders admin login inputs and seeded defaults', () => {
    render(<Login onSuccess={() => {}} />);
    expect(screen.getByText('PitchEngine Platform')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('admin@pitchplatform.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••••••')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Enter Agency Platform/i })).toBeInTheDocument();
  });

  it('calls onSuccess when valid credentials are submitted', async () => {
    const onSuccess = vi.fn();
    vi.spyOn(apiClientModule, 'apiLogin').mockResolvedValue({
      success: true,
      token: 'mock_jwt_token',
    });

    render(<Login onSuccess={onSuccess} />);
    const submitBtn = screen.getByRole('button', { name: /Enter Agency Platform/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledTimes(1);
    });
  });

  it('displays error alert when invalid credentials are submitted', async () => {
    const onSuccess = vi.fn();
    vi.spyOn(apiClientModule, 'apiLogin').mockResolvedValue({
      success: false,
      message: 'Invalid admin credentials',
    });

    render(<Login onSuccess={onSuccess} />);
    const submitBtn = screen.getByRole('button', { name: /Enter Agency Platform/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Invalid admin credentials')).toBeInTheDocument();
      expect(onSuccess).not.toHaveBeenCalled();
    });
  });

  it('populates fields when Auto-fill Seeded Credentials button is clicked', () => {
    render(<Login onSuccess={() => {}} />);
    const emailInput = screen.getByPlaceholderText('admin@pitchplatform.com') as HTMLInputElement;
    const passInput = screen.getByPlaceholderText('••••••••••••') as HTMLInputElement;

    // Clear inputs
    fireEvent.change(emailInput, { target: { value: 'other@user.com' } });
    fireEvent.change(passInput, { target: { value: 'password123' } });
    expect(emailInput.value).toBe('other@user.com');

    // Click auto fill
    const autoFillBtn = screen.getByRole('button', { name: /Auto-fill Seeded Credentials/i });
    fireEvent.click(autoFillBtn);

    expect(emailInput.value).toBe('admin@pitchplatform.com');
    expect(passInput.value).toBe('admin12345!');
  });
});

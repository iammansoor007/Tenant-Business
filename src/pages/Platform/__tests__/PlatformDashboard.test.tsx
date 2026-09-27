import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { PlatformDashboard } from '../index';
import * as apiClientModule from '../../../lib/apiClient';

describe('PlatformDashboard Component', () => {
  const mockTenants = [
    {
      slug: 'apex-roofing',
      name: 'Apex Roofing Austin',
      status: 'active' as const,
      colors: { primary: '#0F4C81' },
      media: {},
      customCss: '',
      completeData: {},
    },
    {
      slug: 'summit-roofs',
      name: 'Summit Roofs Denver',
      status: 'pitched' as const,
      colors: { primary: '#1B4332' },
      media: {},
      customCss: '',
      completeData: {},
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(apiClientModule, 'getAuthToken').mockReturnValue('mock_token');
    vi.spyOn(apiClientModule, 'fetchAllTenants').mockResolvedValue(mockTenants);
    // Mock window.confirm
    window.confirm = vi.fn().mockReturnValue(true);
  });

  it('renders dashboard with stats and tenant list', async () => {
    render(<PlatformDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Apex Roofing Austin')).toBeInTheDocument();
      expect(screen.getByText('Summit Roofs Denver')).toBeInTheDocument();
      expect(screen.getByText(/Total Clients:/i)).toBeInTheDocument();
    });
  });

  it('filters tenants by search query', async () => {
    render(<PlatformDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Apex Roofing Austin')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/Search by client name or \/slug\.\.\./i);
    fireEvent.change(searchInput, { target: { value: 'Denver' } });

    expect(screen.queryByText('Apex Roofing Austin')).not.toBeInTheDocument();
    expect(screen.getByText('Summit Roofs Denver')).toBeInTheDocument();
  });

  it('navigates to create view when New Client Pitch button is clicked', async () => {
    render(<PlatformDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Apex Roofing Austin')).toBeInTheDocument();
    });

    const newBtn = screen.getByRole('button', { name: /New Client Pitch/i });
    fireEvent.click(newBtn);

    expect(screen.getByPlaceholderText(/e\.g\. Apex Roofing Pros/i)).toBeInTheDocument();
  });

  it('navigates to bulk view when Bulk 100+ Clients button is clicked', async () => {
    render(<PlatformDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Apex Roofing Austin')).toBeInTheDocument();
    });

    const bulkBtn = screen.getByRole('button', { name: /Bulk 100\+ Clients/i });
    fireEvent.click(bulkBtn);

    expect(screen.getByText(/Bulk 100\+ Client Pitch Generator/i)).toBeInTheDocument();
  });

  it('deletes tenant when delete action is confirmed', async () => {
    const deleteSpy = vi.spyOn(apiClientModule, 'deleteTenant').mockResolvedValue({ success: true } as any);

    render(<PlatformDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Apex Roofing Austin')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByTitle(/Delete client/i);
    fireEvent.click(deleteButtons[0]);

    expect(window.confirm).toHaveBeenCalled();
    expect(deleteSpy).toHaveBeenCalledWith('apex-roofing');
  });

  it('opens editor pre-populated when Edit button on a client card is clicked and saves edits', async () => {
    const saveSpy = vi.spyOn(apiClientModule, 'saveTenant').mockResolvedValue(undefined as any);

    render(<PlatformDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Apex Roofing Austin')).toBeInTheDocument();
    });

    const editButtons = screen.getAllByTitle(/Edit Client/i);
    expect(editButtons.length).toBeGreaterThan(0);
    fireEvent.click(editButtons[0]);

    // Check that editor opened with initialTenant data
    await waitFor(() => {
      expect(screen.getByText(/Edit Client: Apex Roofing Austin/i)).toBeInTheDocument();
    });

    const nameInput = screen.getByPlaceholderText(/e\.g\. Apex Roofing Pros/i) as HTMLInputElement;
    expect(nameInput.value).toBe('Apex Roofing Austin');

    // Change the name and save
    fireEvent.change(nameInput, { target: { value: 'Apex Roofing Austin (Updated)' } });
    const updateBtn = screen.getByRole('button', { name: /Update Client/i });
    fireEvent.click(updateBtn);

    await waitFor(() => {
      expect(saveSpy).toHaveBeenCalled();
    });
  });

  it('handles bulk selecting clients and triggers bulk delete', async () => {
    const bulkDeleteSpy = vi.spyOn(apiClientModule, 'bulkDeleteTenants').mockResolvedValue(true);
    render(<PlatformDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Apex Roofing Austin')).toBeInTheDocument();
    });

    // Click select all checkbox in table header
    const selectAllCheckbox = screen.getByLabelText(/Select all clients/i);
    fireEvent.click(selectAllCheckbox);

    // Verify bulk toolbar appeared
    expect(screen.getByText(/2 clients selected/i)).toBeInTheDocument();
    expect(screen.getByText(/Delete \(2\)/i)).toBeInTheDocument();

    // Click Delete Selected
    const deleteSelectedBtn = screen.getByText(/Delete \(2\)/i);
    fireEvent.click(deleteSelectedBtn);

    await waitFor(() => {
      expect(bulkDeleteSpy).toHaveBeenCalledWith(['apex-roofing', 'summit-roofs']);
    });
  });

  it('handles bulk selecting clients and updates status in bulk', async () => {
    const bulkStatusSpy = vi.spyOn(apiClientModule, 'bulkUpdateTenantStatus').mockResolvedValue(true);
    render(<PlatformDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Apex Roofing Austin')).toBeInTheDocument();
    });

    // Select single client
    const selectApex = screen.getByLabelText(/Select Apex Roofing Austin/i);
    fireEvent.click(selectApex);

    expect(screen.getByText(/1 client selected/i)).toBeInTheDocument();

    // Click Set Pitched
    const setPitchedBtn = screen.getByRole('button', { name: /Set Pitched/i });
    fireEvent.click(setPitchedBtn);

    await waitFor(() => {
      expect(bulkStatusSpy).toHaveBeenCalledWith(['apex-roofing'], 'pitched');
    });
  });
});

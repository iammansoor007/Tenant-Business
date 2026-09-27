import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { BulkCreator } from '../BulkCreator';
import * as apiClientModule from '../../../lib/apiClient';

describe('BulkCreator Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders bulk creator header and action buttons', () => {
    render(<BulkCreator onSuccess={() => {}} onCancel={() => {}} />);
    expect(screen.getByText(/Bulk 100\+ Client Pitch Generator/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Load Sample JSON/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Generate 100\+ Pitches Now/i })).toBeInTheDocument();
  });

  it('loads sample JSON into textarea when Load Sample button is clicked', () => {
    render(<BulkCreator onSuccess={() => {}} onCancel={() => {}} />);
    const sampleBtn = screen.getByRole('button', { name: /Load Sample JSON/i });
    fireEvent.click(sampleBtn);

    const textarea = screen.getByPlaceholderText(/\[\s*{\s*"slug": "client-1"/i) as HTMLTextAreaElement;
    expect(textarea.value).toContain('apex-roofing-dallas');
    expect(textarea.value).toContain('summit-roof-repair');
  });

  it('shows error when generate is clicked with empty textarea', async () => {
    render(<BulkCreator onSuccess={() => {}} onCancel={() => {}} />);
    const genBtn = screen.getByRole('button', { name: /Generate 100\+ Pitches Now/i });
    fireEvent.click(genBtn);

    await waitFor(() => {
      expect(screen.getByText(/Please paste or upload a JSON array of clients/i)).toBeInTheDocument();
    });
  });

  it('shows error when generate is clicked with invalid JSON', async () => {
    render(<BulkCreator onSuccess={() => {}} onCancel={() => {}} />);
    const textarea = screen.getByPlaceholderText(/\[\s*{\s*"slug": "client-1"/i) as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: '{ invalid JSON text ...' } });

    const genBtn = screen.getByRole('button', { name: /Generate 100\+ Pitches Now/i });
    fireEvent.click(genBtn);

    await waitFor(() => {
      expect(screen.getByText(/JSON Parse Error/i)).toBeInTheDocument();
    });
  });

  it('successfully generates clients when valid JSON array is submitted', async () => {
    vi.spyOn(apiClientModule, 'bulkCreateTenants').mockResolvedValue({
      success: true,
      count: 3,
    });

    render(<BulkCreator onSuccess={() => {}} onCancel={() => {}} />);
    const sampleBtn = screen.getByRole('button', { name: /Load Sample JSON/i });
    fireEvent.click(sampleBtn);

    const genBtn = screen.getByRole('button', { name: /Generate 100\+ Pitches Now/i });
    fireEvent.click(genBtn);

    await waitFor(() => {
      expect(screen.getByText(/Successfully Generated/i)).toBeInTheDocument();
    });
  });

  it('triggers onCancel when cancel button is clicked', () => {
    const onCancel = vi.fn();
    render(<BulkCreator onSuccess={() => {}} onCancel={onCancel} />);
    const backBtn = screen.getByRole('button', { name: /Back to Dashboard/i });
    fireEvent.click(backBtn);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});

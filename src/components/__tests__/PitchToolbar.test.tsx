import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { PitchToolbar } from '../PitchToolbar';
import * as TenantContextModule from '../../context/TenantContext';

describe('PitchToolbar Component', () => {
  beforeEach(() => {
    // Mock clipboard
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockImplementation(() => Promise.resolve()),
      },
    });
  });

  it('renders nothing when not custom tenant and tenant is null', () => {
    vi.spyOn(TenantContextModule, 'useTenant').mockReturnValue({
      tenant: null,
      isCustomTenant: false,
      isLoading: false,
      completeData: null as any,
      media: {} as any,
    });

    const { container } = render(<PitchToolbar />);
    expect(container.firstChild).toBeNull();
  });

  it('renders toolbar with client name when tenant is active', () => {
    vi.spyOn(TenantContextModule, 'useTenant').mockReturnValue({
      tenant: {
        slug: 'test-pitch',
        name: 'Apex Test Roofing',
        status: 'active',
        colors: { primary: '#0047AB' },
        media: {},
        customCss: '',
        completeData: {},
      },
      isCustomTenant: true,
      isLoading: false,
      completeData: {} as any,
      media: {} as any,
    });

    render(<PitchToolbar />);
    expect(screen.getByText('Apex Test Roofing')).toBeInTheDocument();
    expect(screen.getByText('Copy Link')).toBeInTheDocument();
    expect(screen.getByText('Edit Pitch')).toBeInTheDocument();
    expect(screen.getByText('Platform')).toBeInTheDocument();
  });

  it('copies current URL to clipboard when Copy Link is clicked', () => {
    vi.spyOn(TenantContextModule, 'useTenant').mockReturnValue({
      tenant: {
        slug: 'test-pitch',
        name: 'Apex Test Roofing',
        status: 'active',
        colors: { primary: '#0047AB' },
        media: {},
        customCss: '',
        completeData: {},
      },
      isCustomTenant: true,
      isLoading: false,
      completeData: {} as any,
      media: {} as any,
    });

    render(<PitchToolbar />);
    const copyBtn = screen.getByText('Copy Link');
    fireEvent.click(copyBtn);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(window.location.href);
    expect(screen.getByText('Copied!')).toBeInTheDocument();
  });

  it('collapses and expands cleanly when toggle button is clicked', () => {
    vi.spyOn(TenantContextModule, 'useTenant').mockReturnValue({
      tenant: {
        slug: 'test-pitch',
        name: 'Apex Test Roofing',
        status: 'active',
        colors: { primary: '#0047AB' },
        media: {},
        customCss: '',
        completeData: {},
      },
      isCustomTenant: true,
      isLoading: false,
      completeData: {} as any,
      media: {} as any,
    });

    render(<PitchToolbar />);
    const closeBtn = screen.getByTitle('Minimize toolbar');
    fireEvent.click(closeBtn);

    // Now minimized
    const openBtn = screen.getByTitle('Open Pitch Tools');
    expect(openBtn).toBeInTheDocument();

    // Re-expand
    fireEvent.click(openBtn);
    expect(screen.getByText('Apex Test Roofing')).toBeInTheDocument();
  });
});

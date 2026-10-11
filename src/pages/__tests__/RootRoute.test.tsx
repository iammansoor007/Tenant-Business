import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import RootRoute from '../RootRoute';
import * as apiClientModule from '../../lib/apiClient';

describe('RootRoute Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders AgencyHome on root domain / localhost by default', async () => {
    render(<RootRoute />);

    await waitFor(() => {
      // Check Agency branding
      expect(screen.getAllByText(/HispanGo/i).length).toBeGreaterThan(0);
      // Check Agency headline
      expect(screen.getByText(/We Architect/i)).toBeInTheDocument();
      // Check link to Agency Platform
      const platformBtn = document.getElementById('nav-platform-btn');
      expect(platformBtn).toHaveAttribute('href', '/platform');
      // Check link to client pitch site
      const clientLink = document.getElementById('client-link-max-quality-roofing');
      expect(clientLink).toHaveAttribute('href', '/max-quality-roofing');
    });
  });

  it('renders client website when a custom domain matches a tenant', async () => {
    // Mock hostname to a client's custom domain
    Object.defineProperty(window, 'location', {
      writable: true,
      value: {
        ...window.location,
        hostname: 'clientroofing.com',
      },
    });

    const mockTenant = {
      slug: 'client-custom-roofing',
      name: 'Client Custom Roofing',
      status: 'active' as const,
      customDomain: 'clientroofing.com',
      media: {},
      colors: {},
      completeData: {},
    };

    vi.spyOn(apiClientModule, 'fetchTenantByDomain').mockResolvedValue(mockTenant);
    vi.spyOn(apiClientModule, 'fetchTenantBySlug').mockResolvedValue(mockTenant);

    render(<RootRoute />);

    await waitFor(() => {
      // In custom domain mode, it loads the client website Index page rather than AgencyHome
      expect(screen.queryByText(/We Architect/i)).not.toBeInTheDocument();
    });
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { TenantProvider, useTenant, useTenantData } from '../TenantContext';
import * as apiClientModule from '../../lib/apiClient';

const TestConsumer: React.FC = () => {
  const { tenant, isCustomTenant, isLoading } = useTenant();
  const data = useTenantData();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <div data-testid="is-custom">{String(isCustomTenant)}</div>
      <div data-testid="has-tenant">{String(tenant !== null)}</div>
      <div data-testid="default-phone">{data?.footer?.contact?.phone || 'none'}</div>
    </div>
  );
};

describe('TenantContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders default flagship tenant when no slug provided', async () => {
    vi.spyOn(apiClientModule, 'fetchTenantBySlug').mockResolvedValue(null);

    render(
      <TenantProvider>
        <TestConsumer />
      </TenantProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('is-custom')).toHaveTextContent('false');
      expect(screen.getByTestId('has-tenant')).toHaveTextContent('false');
      expect(screen.getByTestId('default-phone')).toHaveTextContent('(406) 217-1720');
    });
  });

  it('loads custom tenant and injects CSS variables and title', async () => {
    const mockTenant = {
      slug: 'austin-roofing-custom',
      name: 'Austin Pro Roofing',
      status: 'active' as const,
      colors: {
        primary: '#0F4C81',
        secondary: '#2C3E50',
        accent: '#D4AF37',
      },
      customCss: '.hero-test { background: blue; }',
      media: {
        logo: '/custom-logo.webp',
      },
      completeData: {
        footer: {
          contact: {
            phone: '(512) 555-9988',
          },
        },
      },
    };

    vi.spyOn(apiClientModule, 'fetchTenantBySlug').mockResolvedValue(mockTenant);

    render(
      <TenantProvider tenantSlug="austin-roofing-custom">
        <TestConsumer />
      </TenantProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('is-custom')).toHaveTextContent('true');
      expect(screen.getByTestId('has-tenant')).toHaveTextContent('true');
      expect(screen.getByTestId('default-phone')).toHaveTextContent('(512) 555-9988');
    });

    // Check CSS variables on document.documentElement
    expect(document.documentElement.style.getPropertyValue('--primary-hex')).toBe('#0F4C81');
    expect(document.documentElement.style.getPropertyValue('--secondary-hex')).toBe('#2C3E50');
    expect(document.documentElement.style.getPropertyValue('--accent-hex')).toBe('#D4AF37');

    // Check custom style element injected into head
    const styleTag = document.getElementById('pitchengine-dynamic-custom-css');
    expect(styleTag).toBeInTheDocument();
    expect(styleTag?.innerHTML).toBe('.hero-test { background: blue; }');

    // Check document title
    expect(document.title).toContain('Austin Pro Roofing');

    // Check dynamic canonical and OpenGraph meta tags
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toContain('/austin-roofing-custom');
    expect(document.querySelector('meta[property="og:site_name"]')?.getAttribute('content')).toBe('Austin Pro Roofing');
    expect(document.querySelector('meta[property="og:title"]')?.getAttribute('content')).toContain('Austin Pro Roofing');
  });

  it('shows Pitch Not Found 404 screen when custom client slug does not exist without root fallback', async () => {
    vi.spyOn(apiClientModule, 'fetchTenantBySlug').mockResolvedValue(null);

    render(
      <TenantProvider tenantSlug="non-existent-client-slug">
        <TestConsumer />
      </TenantProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Pitch Not Found')).toBeInTheDocument();
      expect(screen.queryByText('Max Quality Roofing')).not.toBeInTheDocument();
      expect(screen.queryByText('(406) 217-1720')).not.toBeInTheDocument();
    });
  });
});

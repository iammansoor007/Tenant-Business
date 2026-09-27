import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { ClientEditor } from '../ClientEditor';
import * as apiClientModule from '../../../lib/apiClient';

describe('ClientEditor Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders client name, slug, and tab navigation', () => {
    render(<ClientEditor onSave={async () => {}} onCancel={() => {}} />);
    expect(screen.getByPlaceholderText(/e\.g\. Apex Roofing Pros/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/apex-roofing/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Branding Assets/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Colors & Custom CSS/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Complete Data JSON/i })).toBeInTheDocument();
  });

  it('switches to Colors & Custom CSS tab and allows modifying CSS', () => {
    render(<ClientEditor onSave={async () => {}} onCancel={() => {}} />);
    const colorsTab = screen.getByRole('button', { name: /Colors & Custom CSS/i });
    fireEvent.click(colorsTab);

    expect(screen.getByText('Primary Brand')).toBeInTheDocument();
    expect(screen.getByText(/Custom CSS \/ Variables Pasting/i)).toBeInTheDocument();

    const cssTextarea = screen.getByPlaceholderText(/:root {/i) as HTMLTextAreaElement;
    fireEvent.change(cssTextarea, { target: { value: ':root { --test: #123; }' } });
    expect(cssTextarea.value).toBe(':root { --test: #123; }');
  });

  it('switches to Complete Data JSON tab and displays formatted JSON', () => {
    render(<ClientEditor onSave={async () => {}} onCancel={() => {}} />);
    const jsonTab = screen.getByRole('button', { name: /Complete Data JSON/i });
    fireEvent.click(jsonTab);

    expect(screen.getByText(/Client Website JSON Data/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Format JSON/i })).toBeInTheDocument();
  });

  it('formats JSON when Format JSON button is clicked', () => {
    render(<ClientEditor onSave={async () => {}} onCancel={() => {}} />);
    const jsonTab = screen.getByRole('button', { name: /Complete Data JSON/i });
    fireEvent.click(jsonTab);

    const formatBtn = screen.getByRole('button', { name: /Format JSON/i });
    fireEvent.click(formatBtn);
    expect(screen.getByText(/Client Website JSON Data/i)).toBeInTheDocument();
  });

  it('submits tenant creation when required fields are filled', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);

    render(<ClientEditor onSave={onSave} onCancel={() => {}} />);
    const nameInput = screen.getByPlaceholderText(/e\.g\. Apex Roofing Pros/i);
    fireEvent.change(nameInput, { target: { value: 'Apex Pros' } });

    const submitBtn = screen.getByRole('button', { name: /Create Client Pitch/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledTimes(1);
    });
  });

  it('calls onCancel when Cancel button is clicked', () => {
    const onCancel = vi.fn();
    render(<ClientEditor onSave={async () => {}} onCancel={onCancel} />);
    const cancelBtn = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelBtn);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('dynamically renders service card uploaders for any number of services in JSON (more than 4)', () => {
    const customTenant = {
      slug: 'multi-service-roofing',
      name: 'Multi Service Roofing',
      media: {},
      completeData: {
        services: {
          services: [
            { number: '01', title: 'Tile Roofing', tag: 'Tile' },
            { number: '02', title: 'Metal Roofing', tag: 'Metal' },
            { number: '03', title: 'Flat Roofing', tag: 'Commercial' },
            { number: '04', title: 'Asphalt Shingle', tag: 'Residential' },
            { number: '05', title: 'Solar Roofing', tag: 'Eco' },
            { number: '06', title: 'Skylight Repair', tag: 'Lighting' },
          ],
        },
      },
    };

    render(<ClientEditor initialTenant={customTenant as any} onSave={async () => {}} onCancel={() => {}} />);
    
    // Tab badge should show 6 services
    expect(screen.getByText(/6 Services detected in JSON/i)).toBeInTheDocument();
    
    // Check that service 5 and service 6 are rendered!
    expect(screen.getByText(/Service 05: Solar Roofing/i)).toBeInTheDocument();
    expect(screen.getByText(/Service 06: Skylight Repair/i)).toBeInTheDocument();

    // Check that vector graphic uploaders are present
    expect(screen.getByText(/How We Work Vector/i)).toBeInTheDocument();
    expect(screen.getByText(/FAQ CTA Vector Graphic/i)).toBeInTheDocument();
  });

  it('switches to SEO & Social Meta tab and renders Google and OpenGraph previews with auto-generation', () => {
    const customTenant = {
      slug: 'tampa-bay-roofing',
      name: 'Tampa Bay Roofing',
      media: { logo: '/tampa-logo.png' },
      completeData: {
        footer: {
          serviceAreas: { items: ['Tampa, FL'] },
          contact: { phone: '(813) 555-9000' },
        },
      },
    };

    render(<ClientEditor initialTenant={customTenant as any} onSave={async () => {}} onCancel={() => {}} />);
    const seoTab = screen.getByRole('button', { name: /SEO & Social Meta/i });
    fireEvent.click(seoTab);

    // Previews should appear
    expect(screen.getByText(/Google Search Preview/i)).toBeInTheDocument();
    expect(screen.getByText(/OpenGraph & Social Preview/i)).toBeInTheDocument();
    expect(screen.getByText(/Generated Schema\.org JSON-LD/i)).toBeInTheDocument();

    // Auto-generate button should be present
    const autoGenBtn = screen.getByRole('button', { name: /Auto-Generate from Brand/i });
    expect(autoGenBtn).toBeInTheDocument();
    fireEvent.click(autoGenBtn);

    expect(screen.getByText(/Auto-generated SEO metadata from client brand & location!/i)).toBeInTheDocument();
  });
});


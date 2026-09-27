import React, { useState } from 'react';
import { BulkTenantItem } from '../../types/tenant';
import { bulkCreateTenants } from '../../lib/apiClient';
import { generateCustomizedCompleteData } from '../../lib/templateBuilder';
import { Zap, Upload, CheckCircle2, AlertTriangle, Copy, ExternalLink, Code2, ArrowLeft } from 'lucide-react';

interface BulkCreatorProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const BulkCreator: React.FC<BulkCreatorProps> = ({ onSuccess, onCancel }) => {
  const [jsonInput, setJsonInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedSlugs, setGeneratedSlugs] = useState<string[]>([]);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  const sampleBulkJson: BulkTenantItem[] = [
    {
      slug: 'apex-roofing-dallas',
      name: 'Apex Roofing Pros',
      phone: '(214) 555-0199',
      email: 'contact@apexroofing.com',
      city: 'Dallas',
      state: 'TX',
      tagline: 'Dallas Premier Engineered Roofing Specialists',
      colors: {
        primary: '#C1121F',
        primaryHover: '#780000',
        secondary: '#003049',
        accent: '#669BBC',
      },
    },
    {
      slug: 'summit-roof-repair',
      name: 'Summit Roof & Restoration',
      phone: '(720) 555-8833',
      email: 'info@summitroofrepair.com',
      city: 'Denver',
      state: 'CO',
      tagline: 'Colorado Hail & Storm Damage Roof Specialists',
      colors: {
        primary: '#1D3557',
        primaryHover: '#457B9D',
        secondary: '#A8DADC',
        accent: '#E63946',
      },
    },
    {
      slug: 'evergreen-roofing-seattle',
      name: 'Evergreen Roofing Co',
      phone: '(206) 555-4421',
      email: 'estimates@evergreenroofing.com',
      city: 'Seattle',
      state: 'WA',
      tagline: 'Engineered Roofing Built for Pacific Northwest Rains',
      colors: {
        primary: '#2D6A4F',
        primaryHover: '#1B4332',
        secondary: '#52B788',
        accent: '#D8F3DC',
      },
    },
  ];

  const handleLoadSample = () => {
    setJsonInput(JSON.stringify(sampleBulkJson, null, 2));
    setError(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        JSON.parse(text); // validate
        setJsonInput(text);
        setError(null);
      } catch (err: any) {
        setError(`Uploaded file is not valid JSON: ${err.message}`);
      }
    };
    reader.readAsText(file);
  };

  const handleGenerate = async () => {
    if (!jsonInput.trim()) {
      setError('Please paste or upload a JSON array of clients');
      return;
    }

    let parsed: any;
    try {
      parsed = JSON.parse(jsonInput);
      if (!Array.isArray(parsed)) {
        if (parsed.tenants && Array.isArray(parsed.tenants)) {
          parsed = parsed.tenants;
        } else {
          setError('JSON must be an array of client objects: [ { slug, name, ... }, ... ]');
          return;
        }
      }
    } catch (err: any) {
      setError(`JSON Parse Error: ${err.message}`);
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Process items and auto-populate completeData if missing
      const itemsToCreate: BulkTenantItem[] = parsed.map((item: any) => {
        let completeData = item.completeData;
        const location = item.location || (item.city && item.state ? `${item.city}, ${item.state}` : (item.city || item.state || ''));
        if (!completeData) {
          completeData = generateCustomizedCompleteData({
            name: item.name,
            phone: item.phone,
            email: item.email,
            location,
            city: item.city,
            state: item.state,
            ownerName: item.ownerName,
            tagline: item.tagline,
          });
        }

        const rawSlug = item.slug || item.name || 'client';
        const cleanSlug = rawSlug.toLowerCase().trim().replace(/[^a-z0-9_-]/g, '-').replace(/-+/g, '-');

        return {
          slug: cleanSlug,
          name: item.name,
          phone: item.phone,
          email: item.email,
          location,
          city: item.city,
          state: item.state,
          tagline: item.tagline,
          colors: item.colors,
          media: item.media,
          customCss: item.customCss,
          seo: item.seo,
          completeData,
        };
      });

      const res = await bulkCreateTenants(itemsToCreate);
      if (res.success) {
        const slugs = itemsToCreate.map((i) => i.slug);
        setGeneratedSlugs(slugs);
      } else {
        setError(res.message || 'Bulk creation failed');
      }
    } catch (err: any) {
      setError(err.message || 'Error executing bulk generator');
    } finally {
      setIsProcessing(false);
    }
  };

  const copyPitchUrl = (slug: string) => {
    const url = `${window.location.origin}/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 lg:p-8 shadow-sm max-w-4xl mx-auto font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
        <div>
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </button>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            Bulk 100+ Client Pitch Generator
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Instantly generate personalized pitch websites for 10, 50, or 100+ clients using a single JSON array.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleLoadSample}
            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors"
          >
            Load Sample JSON
          </button>
          <label className="cursor-pointer px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 flex items-center gap-1.5 transition-colors">
            <Upload className="w-3.5 h-3.5" />
            Upload .json
            <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>
      </div>

      {generatedSlugs.length > 0 ? (
        <div className="mt-6 space-y-6">
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-emerald-950">
                  Successfully Generated {generatedSlugs.length} Client Pitches!
                </h4>
                <p className="text-xs text-emerald-700 mt-0.5">
                  Every pitch link below is live and personalized.
                </p>
              </div>
            </div>
            <button
              onClick={onSuccess}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white rounded-lg shadow-sm transition-colors"
            >
              Go to Client List
            </button>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white max-h-80 overflow-y-auto divide-y divide-slate-100">
            {generatedSlugs.map((slug) => (
              <div key={slug} className="flex items-center justify-between p-3 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-xs font-mono text-blue-600 font-semibold">/{slug}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyPitchUrl(slug)}
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-xs text-slate-700 font-medium rounded border border-slate-200 transition-colors"
                  >
                    <Copy className="w-3 h-3" />
                    {copiedSlug === slug ? 'Copied!' : 'Copy Link'}
                  </button>
                  <a
                    href={`/${slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-xs text-slate-700 hover:text-slate-900 font-medium rounded border border-slate-200 transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Open
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-blue-600" />
                Paste JSON Array of Clients
              </label>
              <span className="text-[11px] text-slate-500 font-mono">{"Array format: [ { slug, name, phone, city... } ]"}</span>
            </div>

            {error && (
              <div className="mb-3 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <textarea
              value={jsonInput}
              onChange={(e) => {
                setJsonInput(e.target.value);
                setError(null);
              }}
              placeholder={`[\n  {\n    "slug": "client-1",\n    "name": "Acme Roofing",\n    "phone": "(555) 000-1111",\n    "email": "info@acme.com",\n    "city": "Austin",\n    "state": "TX",\n    "colors": {\n      "primary": "#0F4C81"\n    }\n  }\n]`}
              rows={14}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3.5 text-xs font-mono text-sky-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-colors leading-relaxed"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-slate-200">
            <span className="text-xs text-slate-500">
              Each client in the JSON will immediately receive a generated pitch site at <code className="text-slate-800 font-semibold">/:slug</code>.
            </span>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 border border-slate-300 text-xs font-semibold text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleGenerate}
                disabled={isProcessing}
                className="flex items-center gap-2 px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-colors disabled:opacity-50"
              >
                <Zap className="w-3.5 h-3.5" />
                {isProcessing ? 'Generating Pitches...' : 'Generate 100+ Pitches Now'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

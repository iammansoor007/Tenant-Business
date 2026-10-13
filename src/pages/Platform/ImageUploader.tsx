import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, Image as ImageIcon, Pipette, Sparkles, Cloud, Loader2, CheckCircle2 } from 'lucide-react';
import { extractColorsFromImage, ExtractedColor } from '../../lib/colorExtractor';

interface ImageUploaderProps {
  label: string;
  sublabel?: string;
  value?: string;
  onChange: (base64OrUrl: string) => void;
  isLogo?: boolean;
  onColorExtracted?: (hex: string) => void;
}

// Client-side image compression to prevent MongoDB BSON 16MB document size limit
function compressImage(file: File, maxDim = 1400, quality = 0.85): Promise<string> {
  return new Promise((resolve) => {
    // SVGs are vector; keep exact data URL
    if (file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string) || '');
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const rawDataUrl = (e.target?.result as string) || '';
      if (!rawDataUrl) return resolve('');

      const img = new Image();
      img.onload = () => {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        if (!width || !height) {
          return resolve(rawDataUrl);
        }

        // If file is already small (< 500KB) and dimensions are within bounds, keep original
        if (file.size <= 500 * 1024 && width <= maxDim && height <= maxDim) {
          return resolve(rawDataUrl);
        }

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve(rawDataUrl);
        }

        // CLEAR and DRAW the image onto the canvas
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        const isPng = file.type === 'image/png';

        // For PNGs (especially logos), try WebP or fall back to PNG to preserve transparency
        if (isPng) {
          try {
            const webpUrl = canvas.toDataURL('image/webp', quality);
            if (webpUrl && webpUrl.startsWith('data:image/webp')) {
              return resolve(webpUrl);
            }
          } catch {}
          try {
            return resolve(canvas.toDataURL('image/png'));
          } catch {}
        }

        // For photos (JPEG, etc.), try WebP first, then JPEG
        try {
          const webpUrl = canvas.toDataURL('image/webp', quality);
          if (webpUrl && webpUrl.startsWith('data:image/webp')) {
            return resolve(webpUrl);
          }
        } catch {}

        try {
          return resolve(canvas.toDataURL('image/jpeg', quality));
        } catch {
          return resolve(rawDataUrl);
        }
      };
      img.onerror = () => resolve(rawDataUrl);
      img.src = rawDataUrl;
    };
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  label,
  sublabel,
  value,
  onChange,
  isLogo,
  onColorExtracted,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [extractedColors, setExtractedColors] = useState<ExtractedColor[]>([]);
  const [isSampling, setIsSampling] = useState(false);
  const [appliedHex, setAppliedHex] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [imageLoadError, setImageLoadError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setImageLoadError(false);
  }, [value]);

  // Automatically extract colors from existing logo on mount or when value changes
  useEffect(() => {
    if (isLogo && value && extractedColors.length === 0) {
      extractColorsFromImage(value).then((colors) => {
        if (colors.length > 0) {
          setExtractedColors(colors);
        }
      });
    }
  }, [isLogo, value, extractedColors.length]);

  const handleApplyColor = (hex: string) => {
    if (onColorExtracted) {
      onColorExtracted(hex);
      setAppliedHex(hex);
      setTimeout(() => setAppliedHex(null), 2500);
    }
  };

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, WEBP, SVG)');
      return;
    }

    try {
      setIsUploading(true);
      const maxDimension = isLogo ? 600 : 1400;
      const dataUrl = await compressImage(file, maxDimension);

      // Upload directly to Cloudinary via server API
      let finalUrl = dataUrl;
      try {
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            file: dataUrl,
            folder: isLogo ? 'mercurial_logos' : 'mercurial_media',
          }),
        });
        const uploadJson = await uploadRes.json();
        if (uploadJson.success && uploadJson.url) {
          finalUrl = uploadJson.url;
          setUploadSuccess(true);
          setTimeout(() => setUploadSuccess(false), 3500);
        }
      } catch (uploadErr) {
        console.warn('Cloudinary upload fallback to dataUrl:', uploadErr);
      }

      onChange(finalUrl);

      // If logo, automatically extract dominant colors and apply first color
      if (isLogo) {
        const colors = await extractColorsFromImage(dataUrl);
        setExtractedColors(colors);
        if (colors.length > 0) {
          handleApplyColor(colors[0].hex);
        }
      }
    } catch (err) {
      console.warn('Image processing error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  // Interactive Eyedropper on image
  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!isSampling || !imgRef.current) return;

    const img = imgRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(img, 0, 0);

    const rect = img.getBoundingClientRect();
    const x = Math.floor(((e.clientX - rect.left) / rect.width) * img.naturalWidth);
    const y = Math.floor(((e.clientY - rect.top) / rect.height) * img.naturalHeight);

    const pixel = ctx.getImageData(x, y, 1, 1).data;
    const hex = '#' + ((1 << 24) + (pixel[0] << 16) + (pixel[1] << 8) + pixel[2]).toString(16).slice(1);

    if (onColorExtracted) {
      onColorExtracted(hex);
    }
    setIsSampling(false);
  };

  const isCloudinary = Boolean(value && (value.includes('cloudinary') || value.startsWith('https://res.cloudinary.com')));

  return (
    <div className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-4 transition-colors shadow-xs">
      <div className="flex items-center justify-between mb-2.5">
        <div>
          <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
            {label}
          </label>
          {sublabel && <p className="text-[11px] text-slate-500 mt-0.5">{sublabel}</p>}
        </div>
        {value && !isUploading && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-[11px] text-blue-600 hover:text-blue-700 font-medium py-0.5 px-2 rounded hover:bg-blue-50 transition-colors"
            >
              Change
            </button>
            <button
              type="button"
              onClick={() => {
                onChange('');
                setExtractedColors([]);
              }}
              className="text-[11px] text-slate-500 hover:text-rose-600 flex items-center gap-1 py-0.5 px-2 rounded hover:bg-rose-50 transition-colors"
            >
              <X className="w-3 h-3" /> Remove
            </button>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />

      {isUploading ? (
        <div className="border border-blue-200 bg-blue-50/50 rounded-lg p-6 flex flex-col items-center justify-center">
          <Loader2 className="w-6 h-6 text-blue-600 animate-spin mb-2" />
          <p className="text-xs font-semibold text-blue-900">Uploading to Cloudinary CDN...</p>
          <p className="text-[11px] text-blue-600/80 mt-0.5">Optimizing & storing image in cloud</p>
        </div>
      ) : value ? (
        <div className="relative rounded-lg border border-slate-200 bg-slate-50/60 p-3 flex flex-col items-center justify-center">
          <div className="w-full flex items-center justify-center p-2 rounded bg-slate-100 border border-slate-200 min-h-[100px] overflow-hidden"
               style={{
                 backgroundImage: 'linear-gradient(45deg, #e2e8f0 25%, transparent 25%), linear-gradient(-45deg, #e2e8f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e2e8f0 75%), linear-gradient(-45deg, transparent 75%, #e2e8f0 75%)',
                 backgroundSize: '16px 16px',
                 backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px'
               }}>
            {imageLoadError ? (
              <div className="text-center py-4 px-2">
                <p className="text-xs font-semibold text-rose-600">Failed to load image</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Please check URL or re-upload</p>
              </div>
            ) : (
              <img
                ref={imgRef}
                src={value}
                alt={label}
                onClick={handleImageClick}
                onError={() => setImageLoadError(true)}
                className={`max-h-32 max-w-full object-contain rounded transition-all shadow-xs bg-white/40 p-1 ${
                  isSampling ? 'cursor-crosshair ring-2 ring-blue-600' : ''
                }`}
              />
            )}
          </div>

          {isCloudinary && (
            <div className="flex items-center gap-1.5 text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-full font-medium mt-2">
              <Cloud className="w-3 h-3 text-emerald-600 shrink-0" />
              <span>Cloudinary CDN Hosted</span>
              {uploadSuccess && <CheckCircle2 className="w-3 h-3 text-emerald-600 ml-1" />}
            </div>
          )}

          {isLogo && onColorExtracted && (
            <div className="w-full mt-3 pt-3 border-t border-slate-200">
              <div className="flex items-center justify-between text-xs text-slate-600 mb-2">
                <span className="text-[11px] text-slate-600 font-medium">
                  Colors from logo:
                </span>
                <button
                  type="button"
                  onClick={() => setIsSampling(!isSampling)}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                    isSampling
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Pipette className="w-3 h-3" />
                  {isSampling ? 'Click logo color' : 'Pick color'}
                </button>
              </div>

              {extractedColors.length > 0 ? (
                <div>
                  <div className="flex flex-wrap gap-1.5 mb-1.5">
                    {extractedColors.map((c, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleApplyColor(c.hex)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-mono border transition-all cursor-pointer ${
                          appliedHex === c.hex
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-800 font-bold ring-2 ring-emerald-500/20'
                            : 'border-slate-200 bg-white hover:border-slate-300 text-slate-800 shadow-xs'
                        }`}
                        title="Click to apply to Primary Brand color & Theme"
                      >
                        <span className="w-3.5 h-3.5 rounded-full border border-slate-300 shadow-xs" style={{ backgroundColor: c.hex }} />
                        {c.hex}
                        {appliedHex === c.hex && <span className="text-[10px] text-emerald-600 font-bold ml-0.5">✓</span>}
                      </button>
                    ))}
                  </div>
                  {appliedHex && (
                    <p className="text-[10px] font-semibold text-emerald-600 flex items-center gap-1">
                      ✓ Color {appliedHex} applied to Brand & Theme!
                    </p>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={async () => {
                    const colors = await extractColorsFromImage(value);
                    setExtractedColors(colors);
                    if (colors.length > 0) handleApplyColor(colors[0].hex);
                  }}
                  className="text-xs text-blue-600 hover:underline font-medium cursor-pointer"
                >
                  Extract palette from logo
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border border-dashed rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer transition-colors ${
              dragActive
                ? 'border-blue-600 bg-blue-50/40'
                : 'border-slate-300 hover:border-blue-500 bg-slate-50/60 hover:bg-blue-50/20'
            }`}
          >
            <Upload className="w-5 h-5 text-slate-400 mb-1.5" />
            <p className="text-xs text-slate-700 font-medium text-center">
              Click to upload or drag image
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">PNG, JPG, SVG, WEBP</p>
          </div>

          <div className="flex items-center gap-1.5 pt-1">
            <input
              type="text"
              placeholder="Or paste image URL / path..."
              className="flex-1 text-[11px] px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 outline-none transition-colors"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const target = e.target as HTMLInputElement;
                  if (target.value.trim()) {
                    onChange(target.value.trim());
                    target.value = '';
                  }
                }
              }}
              onBlur={(e) => {
                if (e.target.value.trim()) {
                  onChange(e.target.value.trim());
                  e.target.value = '';
                }
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

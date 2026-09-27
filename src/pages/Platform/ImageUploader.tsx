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
function compressImage(file: File, maxDim = 1400, quality = 0.82): Promise<string> {
  return new Promise((resolve) => {
    if (file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

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
          return resolve(e.target?.result as string);
        }

        // Always compress photos and raster graphics to WebP to eliminate MongoDB 16MB BSON document limits
        let targetFormat = 'image/webp';
        try {
          if (!canvas.toDataURL('image/webp').startsWith('data:image/webp')) {
            targetFormat = 'image/jpeg';
          }
        } catch {
          targetFormat = 'image/jpeg';
        }

        try {
          const compressedDataUrl = canvas.toDataURL(targetFormat, quality);
          resolve(compressedDataUrl);
        } catch {
          resolve(e.target?.result as string);
        }
      };
      img.onerror = () => resolve(e.target?.result as string);
      img.src = e.target?.result as string;
    };
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

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
        )}
      </div>

      {isUploading ? (
        <div className="border border-blue-200 bg-blue-50/50 rounded-lg p-6 flex flex-col items-center justify-center">
          <Loader2 className="w-6 h-6 text-blue-600 animate-spin mb-2" />
          <p className="text-xs font-semibold text-blue-900">Uploading to Cloudinary CDN...</p>
          <p className="text-[11px] text-blue-600/80 mt-0.5">Optimizing & storing image in cloud</p>
        </div>
      ) : value ? (
        <div className="relative rounded-lg border border-slate-200 bg-slate-50/60 p-3 flex flex-col items-center justify-center">
          <img
            ref={imgRef}
            src={value}
            alt={label}
            onClick={handleImageClick}
            className={`max-h-32 max-w-full object-contain rounded transition-all ${
              isSampling ? 'cursor-crosshair ring-2 ring-blue-600' : ''
            }`}
          />

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
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border border-dashed rounded-lg p-5 flex flex-col items-center justify-center cursor-pointer transition-colors ${
            dragActive
              ? 'border-blue-600 bg-blue-50/40'
              : 'border-slate-300 hover:border-blue-500 bg-slate-50/60 hover:bg-blue-50/20'
          }`}
        >
          <Upload className="w-5 h-5 text-slate-400 mb-2" />
          <p className="text-xs text-slate-700 font-medium text-center">
            Click to upload or drag image
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">PNG, JPG, SVG, WEBP</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
        </div>
      )}
    </div>
  );
};

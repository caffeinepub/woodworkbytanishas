import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { ImageId } from '../backend';

interface ImageGalleryProps {
  images: ImageId[];
  productName: string;
}

function imageIdToUrl(imageId: ImageId): string {
  try {
    const blob = new Blob([new Uint8Array(imageId)], { type: 'image/jpeg' });
    return URL.createObjectURL(blob);
  } catch {
    return '/assets/generated/product-dining-table.dim_800x600.png';
  }
}

export default function ImageGallery({ images, productName }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const imageUrls = images.map(imageIdToUrl);
  const fallback = '/assets/generated/product-dining-table.dim_800x600.png';

  if (imageUrls.length === 0) {
    return (
      <div className="aspect-square bg-muted rounded-2xl flex items-center justify-center">
        <img src={fallback} alt={productName} className="w-full h-full object-cover rounded-2xl" />
      </div>
    );
  }

  const prev = () => setCurrentIndex((i) => (i - 1 + imageUrls.length) % imageUrls.length);
  const next = () => setCurrentIndex((i) => (i + 1) % imageUrls.length);

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative aspect-square bg-muted rounded-2xl overflow-hidden group">
        <img
          src={imageUrls[currentIndex]}
          alt={`${productName} - Image ${currentIndex + 1}`}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = fallback;
          }}
        />
        {imageUrls.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background text-foreground rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
              aria-label="Previous image"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background text-foreground rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
              aria-label="Next image"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {imageUrls.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {imageUrls.map((url, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                index === currentIndex
                  ? 'border-primary shadow-md'
                  : 'border-transparent hover:border-muted-foreground/40'
              }`}
            >
              <img
                src={url}
                alt={`${productName} thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = fallback;
                }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import Image from "next/image";

interface ProductImageGalleryProps {
  name: string;
  imageUrls: string[];
}

export function ProductImageGallery({ name, imageUrls }: ProductImageGalleryProps) {
  const uniqueUrls = useMemo(
    () => Array.from(new Set(imageUrls)).filter(Boolean),
    [imageUrls]
  );
  const [activeUrl, setActiveUrl] = useState(uniqueUrls[0]);

  if (uniqueUrls.length === 0) {
    return (
      <div className="aspect-[3/4] relative bg-muted overflow-hidden mb-4">
        <div className="w-full h-full flex items-center justify-center">
          <span className="text-sm text-muted-foreground">No image</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="max-w-[420px] mx-auto">
        <div className="aspect-[3/4] relative bg-muted overflow-hidden mb-4">
        <Image
          src={activeUrl}
          alt={name}
          fill
          className="object-cover"
          priority
        />
        </div>
      </div>

      {uniqueUrls.length > 1 && (
        <div className="grid grid-cols-5 gap-2 max-w-[420px] mx-auto">
          {uniqueUrls.map((url, index) => {
            const isActive = url === activeUrl;
            return (
              <button
                key={`${url}-${index}`}
                type="button"
                onClick={() => setActiveUrl(url)}
                className={
                  "aspect-square relative bg-muted overflow-hidden border transition-all " +
                  (isActive
                    ? "border-foreground shadow-sm"
                    : "border-border hover:border-foreground")
                }
                aria-label={`View ${name} image ${index + 1}`}
              >
                <Image
                  src={url}
                  alt={`${name} image ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

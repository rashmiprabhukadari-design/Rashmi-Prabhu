import { useState } from 'react';
import { ShoppingBag } from 'lucide-react';

interface SafeImageProps {
  src: string;
  alt: string;
  className?: string;
  eager?: boolean;
}

export function SafeImage({ src, alt, className = '', eager = false }: SafeImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex flex-col items-center justify-center bg-[#F5F5F6] text-[#94969F] p-4 text-center ${className}`}
      >
        <ShoppingBag className="w-7 h-7 mb-1.5 text-[#535766]/40" />
        <span className="text-[11px] font-medium line-clamp-2 text-[#535766]">{alt}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}

import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CarouselProps {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}

export function Carousel({ title, subtitle, action, children }: CarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollByAmount = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const distance = scrollRef.current.clientWidth * 0.75;
    scrollRef.current.scrollBy({
      left: dir === 'left' ? -distance : distance,
      behavior: 'smooth',
    });
  };

  return (
    <section className="relative">
      {(title || action) && (
        <div className="flex items-end justify-between gap-4 mb-5">
          <div>
            {title && (
              <h2 className="text-xl md:text-2xl font-bold tracking-tight text-[#282C3F]">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-sm text-[#535766] mt-0.5">{subtitle}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {action}
            <div className="hidden md:flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => scrollByAmount('left')}
                aria-label={`Scroll ${title || 'carousel'} left`}
                className="w-9 h-9 rounded-full border border-[#EAEAEC] bg-white flex items-center justify-center text-[#282C3F] hover:border-[#282C3F] transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => scrollByAmount('right')}
                aria-label={`Scroll ${title || 'carousel'} right`}
                className="w-9 h-9 rounded-full border border-[#EAEAEC] bg-white flex items-center justify-center text-[#282C3F] hover:border-[#282C3F] transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      <div
        ref={scrollRef}
        className="flex gap-3 md:gap-5 overflow-x-auto no-scrollbar scroll-smooth pb-1"
      >
        {children}
      </div>
    </section>
  );
}

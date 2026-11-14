import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  to?: string;
}

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center flex-wrap gap-1.5 text-xs text-[#535766]">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <span key={`${item.label}-${index}`} className="inline-flex items-center gap-1.5">
            {index > 0 && <ChevronRight className="w-3.5 h-3.5 text-[#94969F]" aria-hidden="true" />}
            {item.to && !isLast ? (
              <Link to={item.to} className="hover:text-[#282C3F] transition-colors">
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? 'font-semibold text-[#282C3F]' : ''}>{item.label}</span>
            )}
          </span>
        );
      })}
    </nav>
  );
}

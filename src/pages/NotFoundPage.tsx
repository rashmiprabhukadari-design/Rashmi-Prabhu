import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function NotFoundPage() {
  useDocumentTitle('Page Not Found');
  return (
    <div className="min-h-[65vh] flex flex-col items-center justify-center px-4 text-center space-y-4">
      <div className="w-16 h-16 rounded-full bg-[#FFF0F4] text-[#FF3F6C] flex items-center justify-center">
        <Compass className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-extrabold text-[#282C3F]">404 — Off the Runway</h1>
      <p className="text-sm text-[#535766] max-w-md">
        We couldn&apos;t find the page you were looking for. Explore our latest seasonal drops instead.
      </p>
      <Link
        to="/"
        className="h-11 px-7 rounded-lg bg-[#FF3F6C] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center"
      >
        Back to StyleKart Home
      </Link>
    </div>
  );
}

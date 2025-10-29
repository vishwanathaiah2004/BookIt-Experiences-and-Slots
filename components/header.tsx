import Link from 'next/link';
import { MapPin } from 'lucide-react';

export function Header() {
  return (
    <header className="border-b bg-white">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <MapPin className="h-6 w-6" />
              <div className="flex flex-col leading-none">
                <span className="text-sm font-semibold">highway</span>
                <span className="text-xs">delite</span>
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Search experiences"
              className="hidden md:block px-4 py-2 border rounded-md w-64 text-sm"
            />
            <button className="bg-yellow-400 hover:bg-yellow-500 px-6 py-2 rounded-md text-sm font-medium">
              Search
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

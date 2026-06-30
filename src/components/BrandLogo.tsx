import { CoffeeIcon } from './icons';

// Lockup de marca "Fresh Coffee": insignia con taza + texto (script + serif).
export default function BrandLogo({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className="w-11 h-11 rounded-xl bg-gray-900 flex items-center justify-center text-brand shadow-sm">
        <CoffeeIcon className="w-6 h-6" />
      </div>
      <div className="leading-none">
        <span className="block font-script text-brand text-lg -mb-1.5">Fresh</span>
        <span className="block font-serif font-extrabold text-gray-900 text-xl tracking-tight">
          Coffee
        </span>
      </div>
    </div>
  );
}
